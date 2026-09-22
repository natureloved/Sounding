/**
 * Master Test Runner
 * Executes calendar, coalition, invariants, live market, alignment, weekend trap, and tripwire test suites.
 */

import { runCalendarTests } from './calendar.test.js';
import { runCoalitionTests } from './coalition.test.js';
import { runInvariantTests } from './invariants.test.js';
import { runLiveMarketTests } from './live-market.test.js';
import { runAlignmentTests } from './alignment.test.js';
import { runWeekendTrapTests } from './weekend-trap.test.js';
import { runTripwireTests } from './tripwires.test.js';
import { runDeriveLLMTests } from './derive-llm.test.js';

async function runAll() {
  console.log('======================================================');
  console.log('🧪 SOUNDING COMPREHENSIVE PRODUCTION TEST SUITE');
  console.log('======================================================');

  const cal = runCalendarTests();
  const coal = await runCoalitionTests();
  const inv = runInvariantTests();
  const live = runLiveMarketTests();
  const align = runAlignmentTests();
  const trap = runWeekendTrapTests();
  const trip = runTripwireTests();
  const llm = await runDeriveLLMTests();

  const totalPassed = cal.passed + coal.passed + inv.passed + live.passed + align.passed + trap.passed + trip.passed + llm.passed;
  const totalFailed = cal.failed + coal.failed + inv.failed + live.failed + align.failed + trap.failed + trip.failed + llm.failed;

  console.log('\n======================================================');
  console.log(`📋 FINAL TEST SUMMARY:`);
  console.log(`   Calendar Tests:    ${cal.passed} passed, ${cal.failed} failed`);
  console.log(`   Coalition Tests:   ${coal.passed} passed, ${coal.failed} failed`);
  console.log(`   Invariants Tests:  ${inv.passed} passed, ${inv.failed} failed`);
  console.log(`   Live Market Tests: ${live.passed} passed, ${live.failed} failed`);
  console.log(`   Alignment Tests:   ${align.passed} passed, ${align.failed} failed`);
  console.log(`   Weekend Trap Tests:${trap.passed} passed, ${trap.failed} failed`);
  console.log(`   Tripwire Tests:    ${trip.passed} passed, ${trip.failed} failed`);
  console.log(`   Derive & LLM Tests:${llm.passed} passed, ${llm.failed} failed`);
  console.log(`------------------------------------------------------`);
  console.log(`   Total Passed:      ${totalPassed}`);
  console.log(`   Total Failed:      ${totalFailed}`);
  console.log(`   Status:            ${totalFailed === 0 ? '✅ ALL PRODUCTION TESTS PASSED' : '❌ TESTS FAILED'}`);
  console.log('======================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error('Test runner failed with unexpected error:', err);
  process.exit(1);
});
