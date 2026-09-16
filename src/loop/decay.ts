/**
 * Stale-Data Half-Life Decay Engine
 * Calculates the decay rate and remaining freshness for each captured source.
 */

import { Snapshot, DataDecayInfo } from '../types.js';

export function calculateSourceDecay(snapshots: Snapshot[], currentTime: Date = new Date()): DataDecayInfo[] {
  return snapshots.map((snap) => {
    let half_life_hours = 24;

    const name = snap.source_name.toLowerCase();
    if (name.includes('market') || snap.kind === 'market_feed') {
      half_life_hours = 4; // Order flow decays rapidly
    } else if (name.includes('sentiment')) {
      half_life_hours = 24;
    } else if (name.includes('news')) {
      half_life_hours = 48;
    } else if (name.includes('technical')) {
      half_life_hours = 72;
    } else if (name.includes('macro')) {
      half_life_hours = 336; // 14 days for macro regimes
    } else {
      half_life_hours = 48;
    }

    const retrievedDate = new Date(snap.retrieved_at);
    const ageMs = Math.max(0, currentTime.getTime() - retrievedDate.getTime());
    const ageHours = ageMs / (1000 * 60 * 60);

    // Half-life formula: Freshness = 100 * (0.5)^(age / half_life)
    const decayFactor = Math.pow(0.5, ageHours / half_life_hours);
    const remaining_freshness_pct = Math.round(Math.max(5, Math.min(100, 100 * decayFactor)));
    const is_stale = remaining_freshness_pct < 50;

    return {
      source_name: snap.source_name,
      kind: snap.kind,
      half_life_hours,
      captured_at: snap.retrieved_at,
      remaining_freshness_pct,
      is_stale
    };
  });
}
