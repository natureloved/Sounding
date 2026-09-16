/**
 * Live Market Indicators & Math Unit Tests
 * Verifies technical indicator calculations (RSI, EMA, MACD) and Bitget symbol mapping.
 */

import {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  mapToBitgetSymbol,
  fetchBitgetLiveIndicators
} from '../src/sources/live-indicators.js';

export function runLiveMarketTests(): { passed: number; failed: number } {
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

  console.log('\n--- Running Live Market Indicator Tests ---');

  // 1. Symbol mapping
  assert(mapToBitgetSymbol('BTC') === 'BTCUSDT', 'Maps BTC to BTCUSDT');
  assert(mapToBitgetSymbol('rNVDA') === 'NVDAUSDT', 'Maps rNVDA to NVDAUSDT');
  assert(mapToBitgetSymbol('ETH') === 'ETHUSDT', 'Maps ETH to ETHUSDT');

  // 2. EMA Calculation
  const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const ema5 = calculateEMA(prices, 5);
  assert(ema5.length === prices.length, 'EMA returns equal length array');
  assert(ema5[ema5.length - 1] > ema5[ema5.length - 2], 'EMA increases monotonically on upward trend');

  // 3. RSI Calculation (Ascending prices should have high RSI)
  const upCloses = [10, 12, 13, 15, 16, 18, 20, 21, 23, 25, 27, 28, 30, 32, 34, 36];
  const highRSI = calculateRSI(upCloses, 14);
  assert(highRSI > 70, `RSI for continuous uptrend is > 70 (got ${highRSI})`);

  // Descending prices should have low RSI
  const downCloses = [36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6];
  const lowRSI = calculateRSI(downCloses, 14);
  assert(lowRSI < 30, `RSI for continuous downtrend is < 30 (got ${lowRSI})`);

  // 4. MACD Calculation
  const syntheticCloses: number[] = [];
  for (let i = 0; i < 40; i++) {
    syntheticCloses.push(100 + i * 1.5);
  }
  const macdResult = calculateMACD(syntheticCloses);
  assert(macdResult.macd > 0, 'Uptrending series yields positive MACD line');

  return { passed, failed };
}

if (process.argv[1]?.endsWith('live-market.test.ts')) {
  const res = runLiveMarketTests();
  process.exit(res.failed > 0 ? 1 : 0);
}
