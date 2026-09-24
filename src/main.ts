/**
 * Sounding: CLI + Local Server Entry Point
 * Autonomous Attribution Research Desk
 *
 * CRITICAL: Asserts Invariant I5 (--read-only) before any operation!
 */

import { assertI5 } from './store/schema.js';
import { captureSourceSet } from './loop/capture.js';
import { computeCoalitionRemoval } from './loop/coalition.js';
import { computeInheritedAnchor } from './loop/inherit.js';
import { runSpike } from '../spike/a1-stability.js';
import { generateProjectDescription, generateCompliantXPost } from './metrics/emit.js';
import { spawn } from 'node:child_process';

async function main() {
  const args = process.argv.slice(2);

  // 1. Mandatory Invariant I5 Enforcement: Refuses to run without --read-only
  const isReadOnly = args.includes('--read-only');
  try {
    assertI5(isReadOnly);
  } catch (err: any) {
    console.error('\n❌ [INVARIANT I5 VIOLATION]');
    console.error(`   ${err.message}`);
    console.error('   Sounding operates as a read-only research desk by construction.');
    console.error('   Usage: sounding <command> --read-only\n');
    process.exit(1);
  }

  // Parse command
  const command = args.find((a) => !a.startsWith('--')) || 'demo';

  if (command === 'spike') {
    await runSpike();
    return;
  }

  if (command === 'metrics') {
    console.log(generateProjectDescription());
    console.log('\n--- COMPLIANT D1 X POST ---');
    console.log(generateCompliantXPost());
    return;
  }

  if (command === 'start' || command === 'serve') {
    console.log('\n🚀 Starting Sounding LUI Trading Desk Workbench on http://localhost:3000 ...');
    console.log('   Mode: --read-only (Write tools stripped by construction)');
    console.log('   Press Ctrl+C to halt.\n');

    const vite = spawn('npx', ['vite', '--port', '3000'], {
      stdio: 'inherit',
      shell: true
    });
    vite.on('close', (code) => {
      process.exit(code || 0);
    });
    return;
  }

  // CLI Demo / Query Flow
  let ticker = 'rNVDA';
  let thesis = 'Datacenter revenue expansion will sustain further breakout into next quarter';
  const forceFixture = args.includes('--fixture');

  const tickerIdx = args.indexOf('--ticker');
  if (tickerIdx !== -1 && args[tickerIdx + 1]) {
    ticker = args[tickerIdx + 1].toUpperCase();
  }

  const queryIdx = args.indexOf('query');
  if (queryIdx !== -1 && args[queryIdx + 1] && !args[queryIdx + 1].startsWith('--')) {
    thesis = args[queryIdx + 1];
  }

  console.log(`\n======================================================`);
  console.log(`📡 SOUNDING AI RESEARCH WORKBENCH (CLI FLOW)`);
  console.log(`   Ticker: ${ticker}`);
  console.log(`   Thesis: "${thesis}"`);
  console.log(`   Safety: --read-only active · Invariant I5 verified`);
  console.log(`   Mode:   ${forceFixture ? 'Frozen Historical Fixture (Canonical Scenario A)' : 'Live Market Capture (Dynamic Session Clock)'}`);
  console.log(`======================================================\n`);

  console.log(`[Step 1/3] Capturing 6 sources (S1..S5 bitget-signal + S6 market)...`);
  const snapshots = await captureSourceSet({ ticker, forceFixture });
  for (const s of snapshots) {
    const clockBadge = s.anchor_verdict === 'open' ? '🟢 OPEN' : '🔴 SHUT';
    console.log(`  • [${s.source_name.padEnd(18)}] Clock: ${clockBadge.padEnd(8)} | Time: ${s.retrieved_at}`);
  }

  console.log(`\n[Step 2/3] Deriving Conclusion & Coalition Removal (Leave-One-Out / Leave-Pair-Out)...`);
  const coalition = await computeCoalitionRemoval(thesis, ticker, snapshots, { maxRemovals: 12 });
  const anchorResult = computeInheritedAnchor(coalition.load_bearing_set, snapshots);

  console.log(`\n======================================================`);
  console.log(`🎯 DERIVED CONCLUSION & ATTRIBUTION REPORT`);
  console.log(`======================================================`);
  console.log(`Direction:       ${coalition.baseline.direction.toUpperCase()}`);
  console.log(`Confidence Band: ${coalition.baseline.confidence_band.toUpperCase()}`);
  console.log(`Rationale:       ${coalition.baseline.rationale}`);
  console.log(`------------------------------------------------------`);
  console.log(`LOAD-BEARING SET: [ ${coalition.load_bearing_set.join(', ') || 'NONE (ROBUST)'} ]`);
  console.log(`ATTRIBUTION TEST: ${coalition.robust ? 'Zero single/pair flips' : 'Minimal coalition whose removal changes call'}`);
  console.log(`INHERITED ANCHOR: [ ${anchorResult.inherited_anchor.toUpperCase()} ]`);
  console.log(`STATUS:          ${anchorResult.status_badge}`);
  if (anchorResult.offending_sources.length > 0) {
    console.log(`⚠️ OFFENDING:     ${anchorResult.offending_sources.join(', ')} captured outside regular trading hours!`);
  }
  console.log(`Tested Removals: ${coalition.tested_removals.length} permutations evaluated`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error('Sounding CLI fatal error:', err);
  process.exit(1);
});
