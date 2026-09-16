/**
 * Day-1 Spike: Attribution Stability & Go/No-Go Gate
 * Runs 10 derivations over frozen snapshot set (rNVDA) at temp 0 to test stability of load-bearing set.
 * Evaluates PASS (≥ 7/10), PARTIAL (4-6/10), or FAIL (≤ 3/10).
 */

import { loadFixtureSnapshots } from '../src/sources/signal-skills.js';
import { computeCoalitionRemoval } from '../src/loop/coalition.js';
import { computeInheritedAnchor } from '../src/loop/inherit.js';

export interface SpikeResult {
  ticker: string;
  total_runs: number;
  matching_runs: number;
  modal_load_bearing_set: string[];
  stability_ratio: number;
  verdict: 'PASS' | 'PARTIAL' | 'FAIL';
  action: string;
}

export async function runSpike(): Promise<SpikeResult> {
  const ticker = 'rNVDA';
  const thesis = 'Datacenter revenue expansion will sustain further breakout into next quarter';
  const snapshots = loadFixtureSnapshots(ticker);

  console.log(`\n======================================================`);
  console.log(`⚡ SOUNDING DAY-1 SPIKE: Attribution Stability Harness`);
  console.log(`   Ticker: ${ticker} | Underlying: NVDA (NASDAQ)`);
  console.log(`   Captured Snapshots: ${snapshots.length} sources`);
  console.log(`   Temperature: 0 | Total Iterations: 10`);
  console.log(`======================================================\n`);

  const runs: Array<{ run: number; setKey: string; set: string[]; direction: string; confidence: string }> = [];
  const setCounts = new Map<string, number>();

  for (let i = 1; i <= 10; i++) {
    const coalition = await computeCoalitionRemoval(thesis, ticker, snapshots, { maxRemovals: 12 });
    const set = coalition.load_bearing_set.sort();
    const setKey = set.length > 0 ? set.join(', ') : 'ROBUST';

    setCounts.set(setKey, (setCounts.get(setKey) || 0) + 1);
    runs.push({
      run: i,
      setKey,
      set,
      direction: coalition.baseline.direction,
      confidence: coalition.baseline.confidence_band
    });

    process.stdout.write(`  Run #${i.toString().padStart(2, '0')}: Set=[${setKey}] (${coalition.baseline.direction.toUpperCase()} / ${coalition.baseline.confidence_band.toUpperCase()})\n`);
  }

  // Find modal set
  let modalKey = '';
  let maxCount = -1;
  for (const [key, count] of setCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      modalKey = key;
    }
  }

  const matching_runs = maxCount;
  const stability_ratio = matching_runs / 10;

  let verdict: 'PASS' | 'PARTIAL' | 'FAIL' = 'FAIL';
  let action = '';

  if (matching_runs >= 7) {
    verdict = 'PASS';
    action = 'Proceed to full build. Attribution is stable.';
  } else if (matching_runs >= 4) {
    verdict = 'PARTIAL';
    action = 'Proceed, but lead demo with inheritance and publish noise_figure honestly.';
  } else {
    verdict = 'FAIL';
    action = 'Branch to fallback mechanism.';
  }

  const modalSet = runs.find((r) => r.setKey === modalKey)?.set || [];
  const anchorResult = computeInheritedAnchor(modalSet, snapshots);

  console.log(`\n------------------------------------------------------`);
  console.log(`📊 SPIKE RESULTS SUMMARY:`);
  console.log(`   Modal Load-Bearing Set: [${modalKey}] (${matching_runs}/10 runs, ${(stability_ratio * 100).toFixed(0)}%)`);
  console.log(`   Inherited Anchor Status: ${anchorResult.inherited_anchor.toUpperCase()}`);
  if (anchorResult.offending_sources.length > 0) {
    console.log(`   ⚠️ Offending Unanchored Sources: ${anchorResult.offending_sources.join(', ')}`);
  }
  console.log(`   VERDICT: [ ${verdict} ]`);
  console.log(`   Action: ${action}`);
  console.log(`======================================================\n`);

  return {
    ticker,
    total_runs: 10,
    matching_runs,
    modal_load_bearing_set: modalSet,
    stability_ratio,
    verdict,
    action
  };
}

// Allow direct CLI execution
if (process.argv[1]?.endsWith('a1-stability.ts') || process.argv[1]?.includes('spike')) {
  runSpike().catch((err) => {
    console.error('Spike encountered error:', err);
    process.exit(1);
  });
}
