/**
 * Sounding Schema & Runtime Invariant Assertions
 * Enforces Invariants I1 through I7 as strict runtime assertions.
 */

import {
  Thesis,
  Source,
  Snapshot,
  Conclusion,
  Attribution,
  AnchorVerdict
} from '../types.js';

export class InvariantViolationError extends Error {
  constructor(public invariantId: string, message: string) {
    super(`[Invariant ${invariantId} VIOLATION] ${message}`);
    this.name = 'InvariantViolationError';
  }
}

/**
 * Trust ranking for AnchorVerdict:
 * open (2) > shut (1) > unknown (0)
 */
export const ANCHOR_TRUST_RANK: Record<AnchorVerdict, number> = {
  open: 2,
  shut: 1,
  unknown: 0
};

/**
 * I1: A conclusion is never rendered without its Attribution.
 */
export function assertI1(conclusion: Conclusion, attribution?: Attribution): void {
  if (!attribution) {
    throw new InvariantViolationError(
      'I1',
      `Conclusion ${conclusion.id} cannot be rendered without an Attribution attachment.`
    );
  }
  if (attribution.conclusion_id !== conclusion.id) {
    throw new InvariantViolationError(
      'I1',
      `Attribution ${attribution.id} does not match Conclusion ${conclusion.id}.`
    );
  }
}

/**
 * I2: inherited_anchor is computed from load_bearing_set only — never from all sources.
 */
export function assertI2(
  loadBearingSet: string[],
  allSnapshots: Snapshot[],
  computedInheritedAnchor: AnchorVerdict
): void {
  // Build lookup of snapshot anchor status by name / id
  const snapshotMap = new Map<string, AnchorVerdict>();
  for (const snap of allSnapshots) {
    snapshotMap.set(snap.source_name, snap.anchor_verdict);
    snapshotMap.set(snap.id, snap.anchor_verdict);
    snapshotMap.set(snap.source_id, snap.anchor_verdict);
  }

  if (loadBearingSet.length === 0) {
    // If robust (no removal changed conclusion), load_bearing_set is empty
    return;
  }

  // Find the weakest anchor strictly within load_bearing_set
  let expectedRank = 2; // start with open
  for (const member of loadBearingSet) {
    const verdict = snapshotMap.get(member) ?? 'unknown';
    const rank = ANCHOR_TRUST_RANK[verdict];
    if (rank < expectedRank) {
      expectedRank = rank;
    }
  }

  const actualRank = ANCHOR_TRUST_RANK[computedInheritedAnchor];
  if (actualRank !== expectedRank) {
    throw new InvariantViolationError(
      'I2',
      `inherited_anchor must be computed strictly from load_bearing_set. Expected rank ${expectedRank}, got ${actualRank} (${computedInheritedAnchor}).`
    );
  }
}

/**
 * I3: Re-derivation over a frozen snapshot set is deterministic;
 * if the model returns a different conclusion, the desk reports the instability.
 */
export function assertI3(
  conclusions: Conclusion[],
  reportedNoiseFigure: number
): void {
  if (conclusions.length <= 1) return;

  // Calculate actual discordance
  const baseline = conclusions[0];
  let deviations = 0;
  for (let i = 1; i < conclusions.length; i++) {
    if (
      conclusions[i].direction !== baseline.direction ||
      conclusions[i].confidence_band !== baseline.confidence_band
    ) {
      deviations++;
    }
  }

  const expectedNoise = deviations / conclusions.length;
  if (Math.abs(expectedNoise - reportedNoiseFigure) > 0.05) {
    throw new InvariantViolationError(
      'I3',
      `Instability discordance mismatch: observed ${expectedNoise.toFixed(2)}, reported noise_figure is ${reportedNoiseFigure.toFixed(2)}.`
    );
  }
}

/**
 * I4: A source with anchor_verdict: unknown cannot be load-bearing.
 */
export function assertI4(loadBearingSet: string[], snapshots: Snapshot[]): void {
  const unknownSources = new Set<string>();
  for (const s of snapshots) {
    if (s.anchor_verdict === 'unknown') {
      unknownSources.add(s.source_name);
      unknownSources.add(s.id);
      unknownSources.add(s.source_id);
    }
  }

  for (const member of loadBearingSet) {
    if (unknownSources.has(member)) {
      throw new InvariantViolationError(
        'I4',
        `Source '${member}' has anchor_verdict 'unknown' and cannot be part of the load_bearing_set.`
      );
    }
  }
}

/**
 * I5: The process refuses to start if the Agent Hub write surface is reachable,
 * or if --read-only is not asserted.
 */
export function assertI5(isReadOnly: boolean, writeSurfaceReachable: boolean = false): void {
  if (!isReadOnly) {
    throw new InvariantViolationError(
      'I5',
      'Process refused to start: --read-only flag is required.'
    );
  }
  if (writeSurfaceReachable) {
    throw new InvariantViolationError(
      'I5',
      'Process refused to start: Agent Hub write surface is reachable. Read-only constraint violated.'
    );
  }
}

/**
 * I6: Removing a source can never improve the inherited anchor.
 * Monotonicity: anchor trust cannot increase when a premise is removed.
 */
export function assertI6(
  baseAnchor: AnchorVerdict,
  subCoalitionAnchor: AnchorVerdict
): void {
  const baseRank = ANCHOR_TRUST_RANK[baseAnchor];
  const subRank = ANCHOR_TRUST_RANK[subCoalitionAnchor];

  if (subRank > baseRank) {
    throw new InvariantViolationError(
      'I6',
      `Monotonicity violated: removing a source cannot improve anchor trust from ${baseAnchor} (rank ${baseRank}) to ${subCoalitionAnchor} (rank ${subRank}).`
    );
  }
}

/**
 * I7: tested_removals is persisted for every attribution.
 */
export function assertI7(attribution: Attribution): void {
  if (!attribution.tested_removals || !Array.isArray(attribution.tested_removals)) {
    throw new InvariantViolationError(
      'I7',
      `Attribution ${attribution.id} must persist tested_removals for verification.`
    );
  }
}
