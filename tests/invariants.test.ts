/**
 * Invariant Verification Test Suite (I1 - I7)
 * Tests every architectural invariant as an executable assertion.
 */

import {
  assertI1,
  assertI2,
  assertI3,
  assertI4,
  assertI5,
  assertI6,
  assertI7,
  InvariantViolationError,
  ANCHOR_TRUST_RANK
} from '../src/store/schema.js';
import { computeInheritedAnchor } from '../src/loop/inherit.js';
import { db } from '../src/store/db.js';
import { Snapshot, Conclusion, Attribution, AnchorVerdict } from '../src/types.js';

export function runInvariantTests(): { passed: number; failed: number } {
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

  function assertThrows(fn: () => void, expectedInvariant: string, testName: string) {
    try {
      fn();
      failed++;
      console.error(`  ✗ FAIL (did not throw): ${testName}`);
    } catch (err: any) {
      if (err instanceof InvariantViolationError && err.invariantId === expectedInvariant) {
        passed++;
        console.log(`  ✓ ${testName} (caught ${err.message})`);
      } else {
        failed++;
        console.error(`  ✗ FAIL (wrong error): ${testName}`, err);
      }
    }
  }

  console.log('\n--- Running Invariants Test Suite (I1 - I7) ---');

  // I1: A conclusion is never rendered without its Attribution
  const dummyConclusion: Conclusion = {
    id: 'conc-101',
    thesis_id: 'thesis-1',
    snapshot_set: ['snap-1'],
    direction: 'bullish',
    confidence_band: 'high',
    rationale: 'Solid fundamentals',
    cited_sources: ['macro-analyst'],
    created_at: new Date().toISOString()
  };

  assertThrows(
    () => assertI1(dummyConclusion, undefined),
    'I1',
    'I1: Throws when conclusion has no attribution'
  );

  const matchingAttribution: Attribution = {
    id: 'attr-101',
    conclusion_id: 'conc-101',
    load_bearing_set: ['macro-analyst'],
    inherited_anchor: 'open',
    robust: false,
    noise_figure: 0.0,
    tested_removals: [
      {
        removed_sources: ['macro-analyst'],
        direction: 'neutral',
        confidence_band: 'low',
        changed: true,
        reason: 'Direction flipped'
      }
    ],
    created_at: new Date().toISOString()
  };
  assertI1(dummyConclusion, matchingAttribution);
  assert(true, 'I1: Passes when valid attribution is attached');

  // I2: inherited_anchor is computed from load_bearing_set only — never from all sources
  // Scenario: 3 sources: S1 (open), S2 (open), S3 (shut).
  // S1 is the only member of load_bearing_set.
  // Weakest among load_bearing_set is OPEN.
  // If the bugged engine looks at all sources, it would erroneously conclude SHUT.
  const testSnaps: Snapshot[] = [
    { id: 's1', source_id: 's1', source_name: 'S1', kind: 'signal_skill', content: 'c', retrieved_at: 't', anchor_verdict: 'open' },
    { id: 's2', source_id: 's2', source_name: 'S2', kind: 'signal_skill', content: 'c', retrieved_at: 't', anchor_verdict: 'open' },
    { id: 's3', source_id: 's3', source_name: 'S3', kind: 'signal_skill', content: 'c', retrieved_at: 't', anchor_verdict: 'shut' }
  ];
  const loadBearingOnlyS1 = ['S1'];
  const anchorResult = computeInheritedAnchor(loadBearingOnlyS1, testSnaps);

  assert(
    anchorResult.inherited_anchor === 'open',
    'I2: inherited_anchor correctly equals OPEN (evaluating S1 only), ignoring un-carried S3 shut status'
  );

  assertThrows(
    () => assertI2(loadBearingOnlyS1, testSnaps, 'shut'), // Attempting to pass shut should violate I2
    'I2',
    'I2: Throws if inherited_anchor was tainted by all-sources calculation'
  );

  // I3: Instability discordance reporting
  const testConclusions = [
    { ...dummyConclusion, id: 'c1', direction: 'bullish' as const },
    { ...dummyConclusion, id: 'c2', direction: 'bearish' as const }
  ];
  // 1 deviation out of 2 => noise = 0.5. If reported is 0.0, it must throw.
  assertThrows(
    () => assertI3(testConclusions, 0.0),
    'I3',
    'I3: Throws if model instability is concealed'
  );
  assertI3(testConclusions, 0.5);
  assert(true, 'I3: Passes when reported noise matches measured variance');

  // I4: A source with anchor_verdict: unknown cannot be load-bearing
  const unknownSnap: Snapshot = {
    id: 's-unk',
    source_id: 's-unk',
    source_name: 'unknown-vendor',
    kind: 'user_doc',
    content: 'unverified gossip',
    retrieved_at: '2026-09-15T00:00:00.000Z',
    anchor_verdict: 'unknown'
  };
  assertThrows(
    () => assertI4(['unknown-vendor'], [unknownSnap]),
    'I4',
    'I4: Throws if an unknown-anchor source is placed in load_bearing_set'
  );

  // I5: Process refuses to start without --read-only or if write surface is reachable
  assertThrows(
    () => assertI5(false, false),
    'I5',
    'I5: Throws if --read-only is false'
  );
  assertThrows(
    () => assertI5(true, true),
    'I5',
    'I5: Throws if Agent Hub write surface is reachable'
  );
  assertI5(true, false);
  assert(true, 'I5: Passes when read-only is asserted and write surface unreachable');

  // I6: Removing a source can never improve inherited anchor (Monotonicity property test)
  assertThrows(
    () => assertI6('shut', 'open'),
    'I6',
    'I6: Monotonicity violation caught: removing a source cannot elevate trust from shut to open'
  );
  assertI6('open', 'shut');
  assertI6('open', 'open');
  assertI6('shut', 'shut');
  assert(true, 'I6: Monotonicity holds for equal or decreasing trust transitions');

  // Randomized property test for I6
  const verdicts: AnchorVerdict[] = ['open', 'shut', 'unknown'];
  let propertyPassed = true;
  for (let trial = 0; trial < 25; trial++) {
    const v1 = verdicts[Math.floor(Math.random() * verdicts.length)];
    const v2 = verdicts[Math.floor(Math.random() * verdicts.length)];
    const r1 = ANCHOR_TRUST_RANK[v1];
    const r2 = ANCHOR_TRUST_RANK[v2];
    if (r2 > r1) {
      try {
        assertI6(v1, v2);
        propertyPassed = false;
      } catch {
        // expected
      }
    } else {
      try {
        assertI6(v1, v2);
      } catch {
        propertyPassed = false;
      }
    }
  }
  assert(propertyPassed, 'I6: Randomized property test verified across 25 transition trials');

  // I7: tested_removals is persisted for every attribution
  assertThrows(
    () => assertI7({ ...matchingAttribution, tested_removals: undefined as any }),
    'I7',
    'I7: Throws if tested_removals is missing from attribution'
  );
  assertI7(matchingAttribution);
  assert(true, 'I7: Passes when tested_removals is persisted');

  // Storage persistence test for Re-run reproduction (I7)
  db.insertConclusion(dummyConclusion);
  db.insertAttribution(matchingAttribution);
  const storedAttr = db.getAttribution(dummyConclusion.id);
  assert(
    storedAttr !== undefined && storedAttr.tested_removals.length > 0,
    'I7: Database accurately persists and retrieves tested_removals for Re-run button reproduction'
  );

  return { passed, failed };
}

if (process.argv[1]?.endsWith('invariants.test.ts')) {
  const res = runInvariantTests();
  process.exit(res.failed > 0 ? 1 : 0);
}
