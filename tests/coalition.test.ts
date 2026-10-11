/**
 * Coalition Removal Unit Tests
 * Verifies combinatorial removal search (leave-one-out and leave-pair-out) and robust classification.
 */

import { computeCoalitionRemoval } from '../src/loop/coalition.js';
import { loadFixtureSnapshots } from '../src/sources/signal-skills.js';
import { Snapshot } from '../src/types.js';

export async function runCoalitionTests(): Promise<{ passed: number; failed: number }> {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${testName}`);
    } else {
      failed++;
      console.error(`  ✗ FAIL: ${testName}`);
    }
  }

  console.log('\n--- Running Coalition Removal Tests ---');

  // 1. rNVDA fixture test: single removal should identify macro-analyst as load-bearing
  const nvdaSnaps = loadFixtureSnapshots('rNVDA');
  const resNVDA = await computeCoalitionRemoval(
    'Datacenter revenue expansion will sustain further breakout into next quarter',
    'rNVDA',
    nvdaSnaps,
    { maxRemovals: 12 }
  );

  assert(resNVDA.baseline.direction === 'bullish', 'rNVDA baseline direction is bullish');
  assert(resNVDA.load_bearing_set.length === 1, 'Smallest coalition is size 1 (single removal)');
  assert(resNVDA.load_bearing_set[0] === 'macro-analyst', 'macro-analyst is identified as load-bearing');
  assert(!resNVDA.robust, 'Conclusion is not classified as robust when removal flips it');
  assert(resNVDA.tested_removals.length >= 5, 'Persisted tested removals contains all evaluated permutations');

  // 2. Pair removal detection: 4 sources where single removals don't change call, but joint removal does
  const pairSnaps: Snapshot[] = [
    { id: 'p1', source_id: 's1', source_name: 'bull-1', kind: 'signal_skill', content: 'Massive capex expansion, exponential growth, unprecedented multi-billion breakout surge.', retrieved_at: '2026-09-16T14:30:00.000Z', anchor_verdict: 'open' },
    { id: 'p2', source_id: 's2', source_name: 'bull-2', kind: 'signal_skill', content: 'Massive capex expansion, exponential growth, unprecedented multi-billion breakout surge.', retrieved_at: '2026-09-16T14:30:00.000Z', anchor_verdict: 'open' },
    { id: 'p3', source_id: 's3', source_name: 'bull-3', kind: 'signal_skill', content: 'Massive capex expansion, exponential growth, unprecedented multi-billion breakout surge.', retrieved_at: '2026-09-16T14:30:00.000Z', anchor_verdict: 'open' },
    { id: 'p4', source_id: 's4', source_name: 'bull-4', kind: 'signal_skill', content: 'Massive capex expansion, exponential growth, unprecedented multi-billion breakout surge.', retrieved_at: '2026-09-16T14:30:00.000Z', anchor_verdict: 'open' }
  ];
  const resPair = await computeCoalitionRemoval(
    'Strong structural bull rally',
    'rNVDA',
    pairSnaps,
    { maxRemovals: 10 }
  );
  assert(resPair.load_bearing_set.length === 2, 'Pair removal correctly identifies 2-source load-bearing coalition');
  assert(!resPair.robust, 'Pair removal conclusion is not robust');

  // 3. Synthetic robust test: When evidence is so deeply redundant that removing single or pair sources cannot change call
  const robustSnaps: Snapshot[] = [];
  for (let i = 1; i <= 6; i++) {
    robustSnaps.push({
      id: `rob-${i}`,
      source_id: `s-${i}`,
      source_name: `ultra-bull-${i}`,
      kind: 'signal_skill',
      content: 'Massive capex expansion, exponential growth, breakout surge, accumulation inflow golden cross.',
      retrieved_at: '2026-09-16T14:30:00.000Z',
      anchor_verdict: 'open'
    });
  }

  // Set maxRemovals to 12 so single (6) and first 6 pairs are tested; none changes the call
  const resRobust = await computeCoalitionRemoval(
    'Strong structural bull rally with high conviction',
    'rNVDA',
    robustSnaps,
    { maxRemovals: 12 }
  );

  assert(resRobust.robust === true, 'Redundant evidence classified as ROBUST when tested removals do not alter call');
  assert(resRobust.load_bearing_set.length === 0, 'Robust conclusion has empty load_bearing_set');

  // 4. The trader's thesis must be able to move the verdict.
  //
  //    It could not: the thesis was worth a flat 1.5 against source evidence
  //    needing 3.0 to flip, so a bearish stress thesis on the bullish rNVDA
  //    fixtures returned BULLISH — the same answer as a bullish thesis. The
  //    desk's own stress test was silently ignored.
  //
  //    Two things must hold at once: the baseline follows the thesis, and the
  //    counterfactual re-derivations still ignore it. The second is the one that
  //    breaks quietly — if the thesis weighting reaches the removals, every
  //    removal returns the baseline answer and nothing is ever load-bearing.
  const bearThesis =
    'Datacenter revenue is decelerating sharply and the multiple will compress into next quarter';
  const bullThesis =
    'Datacenter revenue expansion will sustain further breakout into next quarter despite elevated valuation';

  const bearResult = await computeCoalitionRemoval(bearThesis, 'rNVDA', nvdaSnaps, { maxRemovals: 12 });
  const bullResult = await computeCoalitionRemoval(bullThesis, 'rNVDA', nvdaSnaps, { maxRemovals: 12 });

  assert(
    bearResult.baseline.direction === 'bearish',
    'a bearish stress thesis on bullish sources returns BEARISH, not BULLISH'
  );
  assert(
    bullResult.baseline.direction === 'bullish',
    'the bullish thesis still returns BULLISH'
  );
  assert(
    bearResult.baseline.direction !== bullResult.baseline.direction,
    'the two theses produce different verdicts'
  );
  assert(
    bearResult.load_bearing_set.length > 0,
    'attribution still finds a load-bearing source under the bearish thesis'
  );
  assert(
    bullResult.load_bearing_set.includes('macro-analyst'),
    'macro-analyst is still identified as load-bearing under the bullish thesis'
  );
  assert(
    bearResult.tested_removals.some((r) => r.changed),
    'removing a source still changes the conclusion under the bearish thesis'
  );

  // A bare one-word assertion must not outvote the sources.
  const weakBear = await computeCoalitionRemoval('I am bearish', 'rNVDA', nvdaSnaps, { maxRemovals: 12 });
  assert(
    weakBear.baseline.direction === 'bullish',
    'a bare assertion does not outvote the source evidence'
  );

  return { passed, failed };
}

if (process.argv[1]?.endsWith('coalition.test.ts')) {
  runCoalitionTests().then((res) => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}
