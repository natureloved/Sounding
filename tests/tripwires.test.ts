/**
 * Thesis Invalidation Tripwires & Intelligence Decay Unit Tests
 * Verifies generation of quantitative execution parameters and data freshness decay.
 */

import { computeThesisTripwires } from '../src/loop/tripwires.js';
import { calculateSourceDecay } from '../src/loop/decay.js';
import { Conclusion, Attribution, Snapshot } from '../src/types.js';

export function runTripwireTests(): { passed: number; failed: number } {
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

  console.log('\n--- Running Thesis Invalidation Tripwire & Decay Tests ---');

  const bullishConc: Conclusion = {
    id: 'c1',
    thesis_id: 't1',
    snapshot_set: ['s1'],
    direction: 'bullish',
    confidence_band: 'high',
    rationale: 'Growth sustained',
    cited_sources: ['macro-analyst'],
    created_at: new Date().toISOString()
  };

  const bearishConc: Conclusion = {
    ...bullishConc,
    direction: 'bearish'
  };

  const attr: Attribution = {
    id: 'a1',
    conclusion_id: 'c1',
    load_bearing_set: ['macro-analyst'],
    inherited_anchor: 'open',
    robust: false,
    noise_figure: 0.0,
    tested_removals: [],
    created_at: new Date().toISOString()
  };

  // 1. Bullish Tripwires
  const bullTrips = computeThesisTripwires('rNVDA', bullishConc, attr, {
    lastPrice: 130,
    change24h: 2.5,
    rsi: 60,
    ema20: 125,
    ema50: 118,
    macd: 1.5,
    signal: 1.0,
    volumeRatio: 1.2,
    trend: 'bullish'
  });

  assert(bullTrips.length === 3, `Generates exactly 3 tripwire rules (got ${bullTrips.length})`);
  assert(bullTrips[0].category === 'PRICE', 'Tripwire 1 is PRICE category');
  assert(bullTrips[0].trigger_condition.includes('125.00'), 'Price tripwire references 20-EMA ($125.00)');
  assert(bullTrips[2].category === 'CATALYST', 'Tripwire 3 is CATALYST category');
  assert(bullTrips[2].trigger_condition.includes('Federal Reserve'), 'Catalyst tripwire targets load-bearing macro-analyst');

  // 2. Bearish Tripwires
  const bearTrips = computeThesisTripwires('rTSLA', bearishConc, attr, {
    lastPrice: 200,
    change24h: -3.0,
    rsi: 40,
    ema20: 210,
    ema50: 220,
    macd: -2.0,
    signal: -1.5,
    volumeRatio: 0.9,
    trend: 'bearish'
  });
  assert(bearTrips[0].trigger_condition.includes('above 20-EMA'), 'Bearish price tripwire triggers on breakout above 20-EMA');

  // 3. Stale-Data Half-Life Decay
  const now = new Date();
  const snaps: Snapshot[] = [
    {
      id: 's-flow',
      source_id: 's1',
      source_name: 'market-intel',
      kind: 'signal_skill',
      content: '...',
      retrieved_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago (1 half-life)
      anchor_verdict: 'open'
    },
    {
      id: 's-macro',
      source_id: 's2',
      source_name: 'macro-analyst',
      kind: 'signal_skill',
      content: '...',
      retrieved_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      anchor_verdict: 'open'
    }
  ];

  const decayResult = calculateSourceDecay(snaps, now);
  assert(decayResult[0].half_life_hours === 4, 'market-intel half-life is 4 hours');
  assert(decayResult[0].remaining_freshness_pct === 50, `Order flow after 1 half-life is 50% fresh (got ${decayResult[0].remaining_freshness_pct}%)`);
  assert(decayResult[1].half_life_hours === 336, 'macro-analyst half-life is 336 hours (14 days)');
  assert(decayResult[1].remaining_freshness_pct >= 95, `Macro after 4 hours remains > 95% fresh (got ${decayResult[1].remaining_freshness_pct}%)`);

  return { passed, failed };
}

if (process.argv[1]?.endsWith('tripwires.test.ts')) {
  const res = runTripwireTests();
  process.exit(res.failed > 0 ? 1 : 0);
}
