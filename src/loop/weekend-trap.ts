/**
 * Weekend Trap & Monday Gap Exposure Engine
 * Evaluates rToken off-hours speculation risks when reference US markets (NYSE/NASDAQ) are closed.
 */

import { WeekendTrapReport, Snapshot, Attribution } from '../types.js';
import { isUSMarketOpen } from '../calendar/anchor.js';

export function evaluateWeekendTrap(
  ticker: string,
  snapshots: Snapshot[],
  attribution: Attribution,
  timestamp: Date = new Date()
): WeekendTrapReport {
  const clean = ticker.trim().toUpperCase();
  const isRToken = clean.startsWith('R') || ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'META', 'GOOGL'].includes(clean);

  if (!isRToken) {
    return {
      isRToken: false,
      isWeekendOrShut: false,
      unanchored_exposure_pct: 0,
      gap_risk_level: 'LOW',
      underlying_exchange: 'Continuous 24/7 Crypto',
      next_open_utc: 'Continuous',
      warning_title: 'Continuous Liquidity',
      warning_description: 'Instrument trades continuously without weekend reference exchange closures.'
    };
  }

  const marketOpenNow = isUSMarketOpen(timestamp);
  const isWeekendOrShut = !marketOpenNow;

  // Calculate unanchored exposure among captured snapshots
  const shutSnaps = snapshots.filter((s) => s.anchor_verdict === 'shut');
  const unanchored_exposure_pct = snapshots.length > 0 ? Math.round((shutSnaps.length / snapshots.length) * 100) : 0;

  // Check if load-bearing set carries shut status
  const isLoadBearingShut = attribution.inherited_anchor === 'shut';

  let gap_risk_level: 'LOW' | 'ELEVATED' | 'EXTREME' = 'LOW';
  if (isLoadBearingShut) {
    gap_risk_level = 'EXTREME';
  } else if (shutSnaps.length > 0) {
    gap_risk_level = 'ELEVATED';
  }

  let warning_title = '';
  let warning_description = '';

  if (gap_risk_level === 'EXTREME') {
    warning_title = `CRITICAL WEEKEND TRAP · ${unanchored_exposure_pct}% OF FOUNDATION IS UNANCHORED`;
    warning_description = `The load-bearing evidence carrying this ${ticker} call was captured while NASDAQ was completely shut! 24/7 crypto trading on rTokens during off-hours trades on synthetic narrative without underlying market maker liquidity. High probability of Monday 09:30 ET opening bell gap-risk.`;
  } else if (gap_risk_level === 'ELEVATED') {
    warning_title = `ELEVATED OFF-HOURS EXPOSURE (${unanchored_exposure_pct}%)`;
    warning_description = `Some captured sources were retrieved outside regular trading hours. While the minimal load-bearing set remains anchored, secondary narrative momentum may dissolve upon Monday market open.`;
  } else {
    warning_title = `REGULAR TRADING HOURS ANCHOR`;
    warning_description = `All load-bearing sources are backed by active regular trading hours price discovery on NASDAQ/NYSE.`;
  }

  return {
    isRToken: true,
    isWeekendOrShut,
    unanchored_exposure_pct,
    gap_risk_level,
    underlying_exchange: clean.includes('TSLA') || clean.includes('NVDA') || clean.includes('AAPL') ? 'NASDAQ (09:30-16:00 ET)' : 'NYSE / NASDAQ',
    next_open_utc: 'Monday 13:30 UTC (09:30 EDT)',
    warning_title,
    warning_description
  };
}
