/**
 * Weekend Trap & Monday Gap Exposure Unit Tests
 * Verifies rToken off-hours risk calculation and continuous crypto safety.
 */

import { evaluateWeekendTrap } from '../src/loop/weekend-trap.js';
import { Snapshot, Attribution } from '../src/types.js';

export function runWeekendTrapTests(): { passed: number; failed: number } {
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

  console.log('\n--- Running Weekend Trap & Monday Gap Tests ---');

  const sundayDate = new Date('2026-09-13T03:00:00.000Z');
  const wednesdayRth = new Date('2026-09-16T14:30:00.000Z');

  const unanchoredAttribution: Attribution = {
    id: 'a1',
    conclusion_id: 'c1',
    load_bearing_set: ['macro-analyst'],
    inherited_anchor: 'shut',
    robust: false,
    noise_figure: 0.0,
    tested_removals: [],
    created_at: sundayDate.toISOString()
  };

  const anchoredAttribution: Attribution = {
    ...unanchoredAttribution,
    inherited_anchor: 'open'
  };

  const sampleSnaps: Snapshot[] = [
    { id: 's1', source_id: 's1', source_name: 'macro-analyst', kind: 'signal_skill', content: '...', retrieved_at: sundayDate.toISOString(), anchor_verdict: 'shut' },
    { id: 's2', source_id: 's2', source_name: 'market-intel', kind: 'signal_skill', content: '...', retrieved_at: sundayDate.toISOString(), anchor_verdict: 'open' }
  ];

  // 1. rToken with shut load-bearing set on Sunday -> EXTREME gap risk
  const resTrap = evaluateWeekendTrap('rNVDA', sampleSnaps, unanchoredAttribution, sundayDate);
  assert(resTrap.isRToken === true, 'Identifies rNVDA as tokenized US equity');
  assert(resTrap.gap_risk_level === 'EXTREME', `Flags EXTREME gap risk for unanchored rToken (got ${resTrap.gap_risk_level})`);
  assert(resTrap.unanchored_exposure_pct === 50, `Calculates 50% unanchored exposure (got ${resTrap.unanchored_exposure_pct}%)`);

  // 2. rToken during regular trading hours with anchored attribution -> LOW risk
  const resAnchored = evaluateWeekendTrap('rTSLA', [{ ...sampleSnaps[1] }], anchoredAttribution, wednesdayRth);
  assert(resAnchored.gap_risk_level === 'LOW', 'Anchored regular trading hours has LOW gap risk');

  // 3. Continuous Crypto (BTC) -> Never flagged as rToken weekend trap
  const resCrypto = evaluateWeekendTrap('BTC', sampleSnaps, unanchoredAttribution, sundayDate);
  assert(resCrypto.isRToken === false, 'BTC is recognized as continuous 24/7 crypto (not rToken)');
  assert(resCrypto.gap_risk_level === 'LOW', 'BTC retains LOW weekend trap risk due to 24/7 continuous price discovery');

  return { passed, failed };
}

if (process.argv[1]?.endsWith('weekend-trap.test.ts')) {
  const res = runWeekendTrapTests();
  process.exit(res.failed > 0 ? 1 : 0);
}
