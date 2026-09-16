/**
 * Derivation Stability & Noise Figure Measurement
 * Re-runs derivation N times over identical frozen snapshot set to measure determinism and variance.
 * Enforces Invariant I3.
 */

import { Snapshot, Conclusion, Direction, ConfidenceBand } from '../types.js';
import { deriveConclusion, DerivationResult } from './derive.js';
import { assertI3 } from '../store/schema.js';

export interface StabilityReport {
  iterations: number;
  noise_figure: number; // 0.0 = completely deterministic, 1.0 = completely unstable
  modal_direction: Direction;
  modal_confidence: ConfidenceBand;
  is_deterministic: boolean;
  raw_results: DerivationResult[];
}

export async function measureStability(
  thesis: string,
  ticker: string,
  snapshots: Snapshot[],
  iterations: number = 10
): Promise<StabilityReport> {
  const results: DerivationResult[] = [];

  for (let i = 0; i < iterations; i++) {
    const res = await deriveConclusion(thesis, ticker, snapshots, { temperature: 0 });
    results.push(res);
  }

  // Find modal conclusion
  const directionCounts: Record<Direction, number> = { bullish: 0, bearish: 0, neutral: 0 };
  const confidenceCounts: Record<ConfidenceBand, number> = { high: 0, medium: 0, low: 0 };

  for (const r of results) {
    directionCounts[r.direction]++;
    confidenceCounts[r.confidence_band]++;
  }

  let modal_direction: Direction = 'neutral';
  let maxDirCount = -1;
  for (const [dir, count] of Object.entries(directionCounts) as Array<[Direction, number]>) {
    if (count > maxDirCount) {
      maxDirCount = count;
      modal_direction = dir;
    }
  }

  let modal_confidence: ConfidenceBand = 'medium';
  let maxConfCount = -1;
  for (const [conf, count] of Object.entries(confidenceCounts) as Array<[ConfidenceBand, number]>) {
    if (count > maxConfCount) {
      maxConfCount = count;
      modal_confidence = conf;
    }
  }

  // Count deviations from modal conclusion
  let deviations = 0;
  for (const r of results) {
    if (r.direction !== modal_direction || r.confidence_band !== modal_confidence) {
      deviations++;
    }
  }

  const noise_figure = deviations / iterations;
  const is_deterministic = noise_figure === 0.0;

  // Verify Invariant I3
  const dummyConclusions: Conclusion[] = results.map((r, idx) => ({
    id: `run-${idx}`,
    thesis_id: 'test',
    snapshot_set: snapshots.map((s) => s.id),
    direction: r.direction,
    confidence_band: r.confidence_band,
    rationale: r.rationale,
    cited_sources: r.cited_sources,
    created_at: new Date().toISOString()
  }));

  assertI3(dummyConclusions, noise_figure);

  return {
    iterations,
    noise_figure,
    modal_direction,
    modal_confidence,
    is_deterministic,
    raw_results: results
  };
}
