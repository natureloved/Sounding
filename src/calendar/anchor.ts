/**
 * Deterministic US Market-Hours Calendar
 * Evaluates whether reference market for an instrument was open or shut at a specific UTC timestamp.
 */

import { AnchorVerdict } from '../types.js';

// Recognized tokenized equity / US equity tickers
const US_EQUITY_TICKERS = new Set([
  'RNVDA', 'RTSLA', 'RAAPL', 'RMSFT', 'RAMZN', 'RMETA', 'RGOOGL', 'RCOIN', 'RMSTR',
  'NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'META', 'GOOGL', 'COIN', 'MSTR', 'SPY', 'QQQ'
]);

// 24/7 crypto assets
const CONTINUOUS_CRYPTO_TICKERS = new Set([
  'BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'BNB', 'ADA', 'AVAX',
  'RBTC', 'RETH', 'RSOL' // Tokenized crypto derivatives that track continuous crypto
]);

/**
 * Convert a Date to US Eastern Time (America/New_York) components
 */
export function getEasternTimeComponents(date: Date) {
  // Using Intl to deterministically handle EDT / EST daylight saving transitions
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10); // 1-12
  const day = parseInt(partMap.day, 10);
  const weekday = partMap.weekday; // Mon, Tue, etc.
  const hour = parseInt(partMap.hour, 10); // 0-23
  const minute = parseInt(partMap.minute, 10);

  return { year, month, day, weekday, hour, minute };
}

/**
 * Calculates whether a given US Eastern date is an official US stock market holiday.
 */
export function isUSMarketHoliday(year: number, month: number, day: number): boolean {
  // New Year's Day (Jan 1, observed Dec 31 if Saturday, Jan 2 if Sunday)
  if (month === 1 && day === 1) return true;
  if (month === 1 && day === 2) {
    const d = new Date(Date.UTC(year, 0, 2));
    if (d.getUTCDay() === 1) return true; // Monday after Sunday holiday
  }

  // Martin Luther King Jr. Day: 3rd Monday in January
  if (month === 1) {
    const firstDay = new Date(Date.UTC(year, 0, 1)).getUTCDay();
    const firstMon = firstDay <= 1 ? 1 + (1 - firstDay) : 1 + (8 - firstDay);
    const thirdMon = firstMon + 14;
    if (day === thirdMon) return true;
  }

  // Washington's Birthday / Presidents' Day: 3rd Monday in February
  if (month === 2) {
    const firstDay = new Date(Date.UTC(year, 1, 1)).getUTCDay();
    const firstMon = firstDay <= 1 ? 1 + (1 - firstDay) : 1 + (8 - firstDay);
    const thirdMon = firstMon + 14;
    if (day === thirdMon) return true;
  }

  // Good Friday (calculated approximation for 2024-2027)
  const goodFridays: Record<number, string> = {
    2024: '3-29',
    2025: '4-18',
    2026: '4-3',
    2027: '3-26'
  };
  if (goodFridays[year] === `${month}-${day}`) return true;

  // Memorial Day: Last Monday in May
  if (month === 5) {
    const lastDay = new Date(Date.UTC(year, 4, 31)).getUTCDay();
    const offset = lastDay >= 1 ? lastDay - 1 : 6;
    const lastMon = 31 - offset;
    if (day === lastMon) return true;
  }

  // Juneteenth: June 19 (observed June 18 if Sat, June 20 if Sun)
  if (month === 6 && day === 19) return true;
  if (month === 6 && day === 20) {
    const d = new Date(Date.UTC(year, 5, 20));
    if (d.getUTCDay() === 1) return true;
  }
  if (month === 6 && day === 18) {
    const d = new Date(Date.UTC(year, 5, 18));
    if (d.getUTCDay() === 5) return true;
  }

  // Independence Day: July 4 (observed July 3 if Sat, July 5 if Sun)
  if (month === 7 && day === 4) return true;
  if (month === 7 && day === 5) {
    const d = new Date(Date.UTC(year, 6, 5));
    if (d.getUTCDay() === 1) return true;
  }
  if (month === 7 && day === 3) {
    const d = new Date(Date.UTC(year, 6, 3));
    if (d.getUTCDay() === 5) return true;
  }

  // Labor Day: 1st Monday in September
  if (month === 9) {
    const firstDay = new Date(Date.UTC(year, 8, 1)).getUTCDay();
    const firstMon = firstDay <= 1 ? 1 + (1 - firstDay) : 1 + (8 - firstDay);
    if (day === firstMon) return true;
  }

  // Thanksgiving: 4th Thursday in November
  if (month === 11) {
    const firstDay = new Date(Date.UTC(year, 10, 1)).getUTCDay();
    const firstThu = firstDay <= 4 ? 1 + (4 - firstDay) : 1 + (11 - firstDay);
    const fourthThu = firstThu + 21;
    if (day === fourthThu) return true;
  }

  // Christmas Day: Dec 25 (observed Dec 24 if Sat, Dec 26 if Sun)
  if (month === 12 && day === 25) return true;
  if (month === 12 && day === 26) {
    const d = new Date(Date.UTC(year, 11, 26));
    if (d.getUTCDay() === 1) return true;
  }
  if (month === 12 && day === 24) {
    const d = new Date(Date.UTC(year, 11, 24));
    if (d.getUTCDay() === 5) return true;
  }

  return false;
}

/**
 * Returns whether US equity markets are open at the given timestamp.
 * Regular Trading Hours (RTH): Mon-Fri 09:30 to 16:00 ET, excluding holidays.
 */
export function isUSMarketOpen(date: Date): boolean {
  const { year, month, day, weekday, hour, minute } = getEasternTimeComponents(date);

  // Weekends
  if (weekday === 'Sat' || weekday === 'Sun') {
    return false;
  }

  // Holidays
  if (isUSMarketHoliday(year, month, day)) {
    return false;
  }

  // Regular Trading Hours: 09:30 to 16:00 (strictly open at 9:30, closes at 16:00)
  const timeInMinutes = hour * 60 + minute;
  const openTime = 9 * 60 + 30;  // 09:30 ET
  const closeTime = 16 * 60;     // 16:00 ET

  return timeInMinutes >= openTime && timeInMinutes < closeTime;
}

/**
 * Computes deterministic anchor verdict for an instrument at a specific timestamp.
 */
export function getAnchorVerdict(ticker: string, timestamp: Date | string): AnchorVerdict {
  const cleanTicker = ticker.trim().toUpperCase();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  if (isNaN(date.getTime())) {
    return 'unknown';
  }

  // Check 24/7 continuous crypto
  if (CONTINUOUS_CRYPTO_TICKERS.has(cleanTicker)) {
    return 'open';
  }

  // Check US equities or tokenized rTokens
  if (US_EQUITY_TICKERS.has(cleanTicker) || cleanTicker.startsWith('R')) {
    return isUSMarketOpen(date) ? 'open' : 'shut';
  }

  return 'unknown';
}
