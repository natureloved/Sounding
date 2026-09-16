/**
 * Calendar Anchor Unit Tests
 * Verifies deterministic market clock logic across regular trading hours, weekends, holidays, and crypto.
 */

import { getAnchorVerdict, isUSMarketOpen } from '../src/calendar/anchor.js';

export function runCalendarTests(): { passed: number; failed: number } {
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

  console.log('\n--- Running Calendar Anchor Tests ---');

  // 1. Regular trading hours on Wednesday at 14:30 UTC (10:30 EDT) -> OPEN
  const wedRth = new Date('2026-09-16T14:30:00.000Z');
  assert(getAnchorVerdict('rNVDA', wedRth) === 'open', 'rNVDA is OPEN during Wednesday RTH (10:30 EDT)');
  assert(getAnchorVerdict('NVDA', wedRth) === 'open', 'NVDA is OPEN during Wednesday RTH');

  // 2. Sunday 03:00 UTC -> SHUT
  const sundayNight = new Date('2026-09-13T03:00:00.000Z');
  assert(getAnchorVerdict('rNVDA', sundayNight) === 'shut', 'rNVDA is SHUT on Sunday at 03:00 UTC');
  assert(getAnchorVerdict('rTSLA', sundayNight) === 'shut', 'rTSLA is SHUT on Sunday at 03:00 UTC');

  // 3. Pre-market at 12:00 UTC (08:00 EDT) -> SHUT
  const preMarket = new Date('2026-09-16T12:00:00.000Z');
  assert(getAnchorVerdict('rNVDA', preMarket) === 'shut', 'rNVDA is SHUT during pre-market at 08:00 EDT');

  // 4. After-hours at 21:00 UTC (17:00 EDT) -> SHUT
  const afterHours = new Date('2026-09-16T21:00:00.000Z');
  assert(getAnchorVerdict('rNVDA', afterHours) === 'shut', 'rNVDA is SHUT after market close at 17:00 EDT');

  // 5. US Market Holiday: Christmas Day Dec 25 at 15:00 UTC -> SHUT
  const christmas = new Date('2026-12-25T15:00:00.000Z');
  assert(getAnchorVerdict('rAAPL', christmas) === 'shut', 'rAAPL is SHUT on Christmas Day');

  // 6. Continuous 24/7 Crypto -> OPEN even on Sunday 03:00 UTC
  assert(getAnchorVerdict('BTC', sundayNight) === 'open', 'BTC is OPEN 24/7 on Sunday at 03:00 UTC');
  assert(getAnchorVerdict('ETH', sundayNight) === 'open', 'ETH is OPEN 24/7 on Sunday at 03:00 UTC');

  // 7. Unknown instrument format -> UNKNOWN
  assert(getAnchorVerdict('XYZUNKNOWN99', wedRth) === 'unknown', 'Unknown instrument yields verdict unknown');

  return { passed, failed };
}

if (process.argv[1]?.endsWith('calendar.test.ts')) {
  const res = runCalendarTests();
  process.exit(res.failed > 0 ? 1 : 0);
}
