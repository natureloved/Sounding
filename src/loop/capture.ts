/**
 * Source Capture Pipeline:
 * Captures S1..S5 (bitget-signal skills), S6 (bitget-market feed), and S7.. (user documents).
 * Computes deterministic anchor verdict for each and persists snapshots.
 */

import { Snapshot } from '../types.js';
import { SIGNAL_SKILL_NAMES, captureSignalSkill, loadFixtureSnapshots } from '../sources/signal-skills.js';
import { captureBitgetMarketFeed } from '../sources/bitget-market.js';
import { createUserDocSnapshot } from '../sources/user-doc.js';
import { db } from '../store/db.js';

export interface CaptureConfig {
  ticker: string;
  userDocs?: string[];
  forceFixture?: boolean;
  timestamp?: string;
  mcpUrl?: string;
}

export async function captureSourceSet(config: CaptureConfig): Promise<Snapshot[]> {
  const { ticker, userDocs = [], forceFixture = false, timestamp, mcpUrl } = config;

  if (forceFixture) {
    const fixtureSnaps = loadFixtureSnapshots(ticker);
    for (const snap of fixtureSnaps) {
      db.insertSnapshot(snap);
    }
    return fixtureSnaps;
  }

  const snapshots: Snapshot[] = [];

  // 1. Capture 5 signal skills in parallel
  const skillPromises = SIGNAL_SKILL_NAMES.map((name) =>
    captureSignalSkill(name, ticker, timestamp, mcpUrl)
  );

  // 2. Capture Bitget market feed
  const marketPromise = captureBitgetMarketFeed(ticker, timestamp);

  const [skillResults, marketResult] = await Promise.all([
    Promise.all(skillPromises),
    marketPromise
  ]);

  snapshots.push(...skillResults);
  snapshots.push(marketResult);

  // 3. Capture any user documents
  userDocs.forEach((doc, idx) => {
    const docSnap = createUserDocSnapshot(ticker, doc, `user-doc-${idx + 1}`, timestamp);
    snapshots.push(docSnap);
  });

  // 4. Persist all snapshots into DB
  for (const snap of snapshots) {
    db.insertSnapshot(snap);
  }

  return snapshots;
}
