/**
 * Personalized Thesis Alignment & Contradiction Unit Tests
 * Verifies Position Fragility scoring, risk alerts, and contradiction detection.
 */

import { evaluatePositionAlignment } from '../src/loop/alignment.js';
import { detectContradictions } from '../src/loop/contradiction.js';
import { Conclusion, Attribution, Snapshot } from '../src/types.js';

export function runAlignmentTests(): { passed: number; failed: number } {
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

  console.log('\n--- Running Personalized Position Alignment Tests ---');

  const baseConclusion: Conclusion = {
    id: 'c1',
    thesis_id: 't1',
    snapshot_set: ['s1'],
    direction: 'bullish',
    confidence_band: 'high',
    rationale: 'Growth drivers intact',
    cited_sources: ['macro-analyst'],
    created_at: new Date().toISOString()
  };

  const anchoredAttribution: Attribution = {
    id: 'a1',
    conclusion_id: 'c1',
    load_bearing_set: ['macro-analyst'],
    inherited_anchor: 'open',
    robust: false,
    noise_figure: 0.0,
    tested_removals: [],
    created_at: new Date().toISOString()
  };

  const unanchoredAttribution: Attribution = {
    ...anchoredAttribution,
    id: 'a2',
    inherited_anchor: 'shut',
    offending_sources: ['macro-analyst']
  };

  // 1. Aligned Long position on anchored foundation
  const resAligned = evaluatePositionAlignment(
    { stance: 'long', leverage: 1 },
    baseConclusion,
    anchoredAttribution
  );
  assert(resAligned.aligns === true, 'Long stance aligns with Bullish conclusion');
  assert(resAligned.risk_flag === 'LOW', `Anchored aligned position has LOW risk flag (got ${resAligned.risk_flag})`);
  assert(resAligned.fragility_score <= 25, `Fragility score is low (got ${resAligned.fragility_score})`);

  // 2. Clashing Short position against Bullish conclusion
  const resClash = evaluatePositionAlignment(
    { stance: 'short', leverage: 1 },
    baseConclusion,
    anchoredAttribution
  );
  assert(resClash.aligns === false, 'Short stance clashes with Bullish conclusion');
  assert(resClash.fragility_score >= 50, `Contradicting position has high fragility (got ${resClash.fragility_score})`);

  // 3. Leveraged Long on UNANCHORED ground (Critical Fragility)
  const resUnanchoredLev = evaluatePositionAlignment(
    { stance: 'long', leverage: 3 },
    baseConclusion,
    unanchoredAttribution
  );
  assert(
    resUnanchoredLev.risk_flag === 'CRITICAL' || resUnanchoredLev.risk_flag === 'HIGH',
    `Leveraged position on unanchored ground triggers CRITICAL/HIGH risk (got ${resUnanchoredLev.risk_flag})`
  );
  assert(resUnanchoredLev.fragility_score >= 50, `Unanchored fragility is elevated (got ${resUnanchoredLev.fragility_score})`);

  // 4. Contradiction Detection
  const contradictorySnaps: Snapshot[] = [
    {
      id: 's-tech',
      source_id: 's1',
      source_name: 'technical-analysis',
      kind: 'signal_skill',
      content: 'Technical breakdown below 20-EMA on high volume, negative MACD divergence.',
      retrieved_at: '2026-09-15T14:00:00.000Z',
      anchor_verdict: 'open'
    },
    {
      id: 's-news',
      source_id: 's2',
      source_name: 'news-briefing',
      kind: 'signal_skill',
      content: 'Company reiterates massive 45% increase in hyperscaler capex and ramp.',
      retrieved_at: '2026-09-15T14:00:00.000Z',
      anchor_verdict: 'open'
    }
  ];

  const detected = detectContradictions(contradictorySnaps);
  assert(detected.length >= 1, `Detects technical breakdown vs news hype contradiction (count: ${detected.length})`);
  assert(detected[0].severity === 'high', 'Severity of structural breakdown vs news hype is HIGH');

  return { passed, failed };
}

if (process.argv[1]?.endsWith('alignment.test.ts')) {
  const res = runAlignmentTests();
  process.exit(res.failed > 0 ? 1 : 0);
}
