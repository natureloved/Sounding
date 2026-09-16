/**
 * Inherited Anchor Computation
 * Determines trust status strictly as the weakest market-clock status among load_bearing_set members.
 * Enforces Invariants I2 and I6.
 */

import { Snapshot, AnchorVerdict } from '../types.js';
import { assertI2, assertI6, ANCHOR_TRUST_RANK } from '../store/schema.js';

export interface InheritedAnchorResult {
  inherited_anchor: AnchorVerdict;
  offending_sources: string[];
  is_unanchored: boolean;
  status_badge: string;
}

/**
 * Computes inherited anchor verdict strictly from load_bearing_set members.
 */
export function computeInheritedAnchor(
  loadBearingSet: string[],
  snapshots: Snapshot[]
): InheritedAnchorResult {
  // Map snapshot names to anchor verdict
  const anchorMap = new Map<string, AnchorVerdict>();
  for (const s of snapshots) {
    anchorMap.set(s.source_name, s.anchor_verdict);
    anchorMap.set(s.id, s.anchor_verdict);
  }

  // If robust (empty load-bearing set), conclusion does not lean on any fragile subset
  if (loadBearingSet.length === 0) {
    const inherited_anchor: AnchorVerdict = 'open';
    return {
      inherited_anchor,
      offending_sources: [],
      is_unanchored: false,
      status_badge: 'ROBUST · No tested removal changed conclusion'
    };
  }

  const offending_sources: string[] = [];
  let weakestVerdict: AnchorVerdict = 'open';
  let weakestRank = ANCHOR_TRUST_RANK['open'];

  for (const member of loadBearingSet) {
    const verdict = anchorMap.get(member) || 'unknown';
    const rank = ANCHOR_TRUST_RANK[verdict];

    if (verdict === 'shut') {
      offending_sources.push(member);
    }

    if (rank < weakestRank) {
      weakestRank = rank;
      weakestVerdict = verdict;
    }
  }

  // Enforce Invariant I2 runtime check
  assertI2(loadBearingSet, snapshots, weakestVerdict);

  const is_unanchored = weakestVerdict === 'shut' || weakestVerdict === 'unknown';
  const status_badge = is_unanchored
    ? `UNANCHORED GROUND · Reference market shut during capture of: ${offending_sources.join(', ')}`
    : 'ANCHORED · All load-bearing sources captured in regular trading hours';

  return {
    inherited_anchor: weakestVerdict,
    offending_sources,
    is_unanchored,
    status_badge
  };
}
