/**
 * Coalition Removal Engine
 * Measures attribution strictly by removal (leave-one-out and leave-pair-out).
 * Finds the smallest subset whose removal flips direction or shifts confidence band.
 */

import { Snapshot, Direction, ConfidenceBand, TestedRemoval } from '../types.js';
import { deriveConclusion, DerivationResult, DerivationOptions } from './derive.js';
import { assertI4 } from '../store/schema.js';

export interface CoalitionResult {
  baseline: DerivationResult;
  load_bearing_set: string[];
  robust: boolean;
  tested_removals: TestedRemoval[];
}

export interface CoalitionOptions {
  maxRemovals?: number;
  derivationOptions?: DerivationOptions;
}

export async function computeCoalitionRemoval(
  thesis: string,
  ticker: string,
  snapshots: Snapshot[],
  options: CoalitionOptions = {}
): Promise<CoalitionResult> {
  const env = typeof process !== 'undefined' && process.env ? process.env : {};
  const maxRemovals = Math.min(
    options.maxRemovals ?? (env.SOUNDING_MAX_REMOVALS ? parseInt(env.SOUNDING_MAX_REMOVALS, 10) : 12),
    8
  );
  // Memoize derivations per snapshot-subset: the removal engine re-evaluates overlapping
  // subsets; caching identical subsets cuts live-LLM calls dramatically (cost + rate limits).
  const derivationCache = new Map<string, Promise<DerivationResult>>();
  const cacheKey = (subset: Snapshot[]) => subset.map((x) => x.id).sort().join('|');
  const cachedDerive = (thesis: string, ticker: string, subset: Snapshot[], opts: DerivationOptions): Promise<DerivationResult> => {
    const k = `${thesis}::${ticker}::${cacheKey(subset)}`;
    let p = derivationCache.get(k);
    if (!p) {
      p = deriveConclusion(thesis, ticker, subset, opts);
      derivationCache.set(k, p);
      p.catch(() => derivationCache.delete(k));
    }
    return p;
  };
  const derivationOptions = options.derivationOptions || {};
  const tested_removals: TestedRemoval[] = [];

  // Filter out any source that is 'unknown' from being considered load-bearing candidate per I4
  const eligibleSources = snapshots.filter((s) => s.anchor_verdict !== 'unknown');
  const unknownSources = snapshots.filter((s) => s.anchor_verdict === 'unknown');

  // Baseline derivation with all available snapshots
  const baseline = await cachedDerive(thesis, ticker, snapshots, derivationOptions);
  let removalCalls = 0;

  function isChanged(candidate: DerivationResult): boolean {
    return (
      candidate.direction !== baseline.direction ||
      candidate.confidence_band !== baseline.confidence_band
    );
  }

  // 1. Single-source removals (Leave-one-out) - evaluated in parallel for high responsiveness
  const singleChanges: Array<{ name: string; result: DerivationResult }> = [];
  const singleRemovalCandidates = eligibleSources.slice(0, maxRemovals);
  removalCalls += singleRemovalCandidates.length;

  const singleResults = await Promise.all(
    singleRemovalCandidates.map(async (snap) => {
      const subset = snapshots.filter((s) => s.id !== snap.id);
      const result = await cachedDerive(thesis, ticker, subset, derivationOptions);
      return { snap, result };
    })
  );

  for (const { snap, result } of singleResults) {
    const changed = isChanged(result);
    const dirFlip = result.direction !== baseline.direction;
    const bandShift = result.confidence_band !== baseline.confidence_band;

    const reason = !changed
      ? `Conclusion unchanged (${result.direction}, ${result.confidence_band})`
      : dirFlip && bandShift
        ? `Direction flipped from ${baseline.direction} to ${result.direction}; band shifted from ${baseline.confidence_band} to ${result.confidence_band}`
        : dirFlip
          ? `Direction flipped from ${baseline.direction} to ${result.direction}`
          : `Direction held ${result.direction}; band shifted from ${baseline.confidence_band} to ${result.confidence_band}`;

    tested_removals.push({
      removed_sources: [snap.source_name],
      direction: result.direction,
      confidence_band: result.confidence_band,
      changed,
      reason
    });

    if (changed) {
      singleChanges.push({ name: snap.source_name, result });
    }
  }

  // If any single source changed the conclusion, the smallest coalition is size 1
  if (singleChanges.length > 0) {
    // Prefer direction flips over confidence band shifts
    const directionFlips = singleChanges.filter((c) => c.result.direction !== baseline.direction);
    const chosen = directionFlips.length > 0 ? directionFlips[0] : singleChanges[0];
    const loadBearingSet = [chosen.name];

    assertI4(loadBearingSet, snapshots); // Enforce Invariant I4

    return {
      baseline,
      load_bearing_set: loadBearingSet,
      robust: false,
      tested_removals
    };
  }

  // 2. Pair removals (Leave-pair-out) - evaluated in parallel for high responsiveness
  const pairChanges: Array<{ names: [string, string]; result: DerivationResult }> = [];
  const pairCandidates: Array<[Snapshot, Snapshot]> = [];

  for (let i = 0; i < eligibleSources.length; i++) {
    for (let j = i + 1; j < eligibleSources.length; j++) {
      if (removalCalls + pairCandidates.length < maxRemovals) {
        pairCandidates.push([eligibleSources[i], eligibleSources[j]]);
      }
    }
  }

  removalCalls += pairCandidates.length;

  const pairResults = await Promise.all(
    pairCandidates.map(async ([s1, s2]) => {
      const subset = snapshots.filter((s) => s.id !== s1.id && s.id !== s2.id);
      const result = await cachedDerive(thesis, ticker, subset, derivationOptions);
      return { s1, s2, result };
    })
  );

  for (const { s1, s2, result } of pairResults) {
    const changed = isChanged(result);
    const dirFlip = result.direction !== baseline.direction;
    const bandShift = result.confidence_band !== baseline.confidence_band;

    const reason = !changed
      ? `Conclusion unchanged without [${s1.source_name}, ${s2.source_name}]`
      : dirFlip && bandShift
        ? `Joint removal [${s1.source_name}+${s2.source_name}]: direction flipped from ${baseline.direction} to ${result.direction}, band shifted from ${baseline.confidence_band} to ${result.confidence_band}`
        : dirFlip
          ? `Joint removal [${s1.source_name}+${s2.source_name}]: direction flipped from ${baseline.direction} to ${result.direction}`
          : `Joint removal [${s1.source_name}+${s2.source_name}]: direction held ${result.direction}, band shifted from ${baseline.confidence_band} to ${result.confidence_band}`;

    tested_removals.push({
      removed_sources: [s1.source_name, s2.source_name],
      direction: result.direction,
      confidence_band: result.confidence_band,
      changed,
      reason
    });

    if (changed) {
      pairChanges.push({ names: [s1.source_name, s2.source_name], result });
    }
  }

  if (pairChanges.length > 0) {
    const loadBearingSet = [...pairChanges[0].names];
    assertI4(loadBearingSet, snapshots); // Enforce Invariant I4
    return {
      baseline,
      load_bearing_set: loadBearingSet,
      robust: false,
      tested_removals
    };
  }

  // 3. Greedy forward removal escalation if budget permits
  if (removalCalls < maxRemovals && eligibleSources.length > 2) {
    const greedyRemoved: string[] = [];
    const remaining = [...snapshots];

    while (removalCalls < maxRemovals && remaining.length > 1) {
      removalCalls++;
      // Remove first eligible
      const idx = remaining.findIndex((s) => s.anchor_verdict !== 'unknown');
      if (idx === -1) break;
      const [removed] = remaining.splice(idx, 1);
      greedyRemoved.push(removed.source_name);

      const result = await cachedDerive(thesis, ticker, remaining, derivationOptions);
      const changed = isChanged(result);

      tested_removals.push({
        removed_sources: [...greedyRemoved],
        direction: result.direction,
        confidence_band: result.confidence_band,
        changed,
        reason: changed ? `Greedy forward removal changed conclusion` : `Unchanged`
      });

      if (changed) {
        assertI4(greedyRemoved, snapshots);
        return {
          baseline,
          load_bearing_set: greedyRemoved,
          robust: false,
          tested_removals
        };
      }
    }
  }

  // 4. Conclusion is ROBUST
  return {
    baseline,
    load_bearing_set: [],
    robust: true,
    tested_removals
  };
}
