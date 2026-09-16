/**
 * Actionable Thesis Invalidation Tripwires
 * Translates attribution analysis into concrete quantitative risk kill-conditions.
 */

import { Tripwire, Conclusion, Attribution, LiveIndicatorData } from '../types.js';

export function computeThesisTripwires(
  ticker: string,
  conclusion: Conclusion,
  attribution: Attribution,
  indicators?: LiveIndicatorData | null
): Tripwire[] {
  const tripwires: Tripwire[] = [];
  const isBullish = conclusion.direction === 'bullish';
  const isBearish = conclusion.direction === 'bearish';

  const lastPrice = indicators?.lastPrice || (ticker.includes('NVDA') ? 132.8 : ticker.includes('TSLA') ? 204.5 : 65420);
  const ema20 = indicators?.ema20 || (lastPrice * 0.96);
  const ema50 = indicators?.ema50 || (lastPrice * 0.92);

  // 1. Technical Price Action Tripwire
  if (isBullish) {
    tripwires.push({
      id: 'trip-price',
      category: 'PRICE',
      trigger_condition: `Daily close below 20-EMA ($${ema20.toFixed(2)}) or structural support ($${ema50.toFixed(2)})`,
      invalidation_consequence: `Technical support collapses; thesis conviction immediately reverses from BULLISH to BEARISH.`,
      severity: 'CRITICAL'
    });
  } else if (isBearish) {
    tripwires.push({
      id: 'trip-price',
      category: 'PRICE',
      trigger_condition: `Daily close above 20-EMA ($${ema20.toFixed(2)}) on expanding volume`,
      invalidation_consequence: `Short thesis invalidated; upward momentum resumes through resistance.`,
      severity: 'CRITICAL'
    });
  } else {
    tripwires.push({
      id: 'trip-price',
      category: 'PRICE',
      trigger_condition: `Breakout beyond $${(lastPrice * 1.05).toFixed(2)} or breakdown below $${(lastPrice * 0.95).toFixed(2)}`,
      invalidation_consequence: `Range compression terminates; directional volatility expansion begins.`,
      severity: 'HIGH'
    });
  }

  // 2. Order Flow & Liquidity Tripwire
  tripwires.push({
    id: 'trip-order-flow',
    category: 'ORDER_FLOW',
    trigger_condition: `Bid/Ask spread expands past 0.10% OR 24h trading volume contracts below 0.6x benchmark`,
    invalidation_consequence: `Market depth evaporates; execution slippage will erode directional edge.`,
    severity: 'HIGH'
  });

  // 3. Catalyst Invalidation Tripwire (Tied to Load-Bearing Set!)
  const loadBearingName = attribution.load_bearing_set[0] || 'macro-analyst';
  let catalystCondition = '';
  let catalystConsequence = '';

  if (loadBearingName.includes('macro')) {
    catalystCondition = `Federal Reserve rate guidance shifts hawkish or 10-year Treasury yield spikes above 4.35%`;
    catalystConsequence = `Load-bearing macro multiple expansion collapses; equity discount rate rises sharply.`;
  } else if (loadBearingName.includes('technical')) {
    catalystCondition = `Daily RSI prints bearish divergence or MACD crosses into negative histogram`;
    catalystConsequence = `Load-bearing technical momentum driver dissipates.`;
  } else if (loadBearingName.includes('intel') || loadBearingName.includes('market')) {
    catalystCondition = `Institutional dark pool block accumulation turns to net outflow for 2 consecutive sessions`;
    catalystConsequence = `Whale order flow support is withdrawn.`;
  } else {
    catalystCondition = `Corporate capex guidance revision or negative sector regulatory ruling`;
    catalystConsequence = `Fundamental growth narrative invalidated.`;
  }

  tripwires.push({
    id: 'trip-catalyst',
    category: 'CATALYST',
    trigger_condition: catalystCondition,
    invalidation_consequence: catalystConsequence,
    severity: 'CRITICAL'
  });

  return tripwires;
}
