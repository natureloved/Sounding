/**
 * Derivation Engine & Provenance Unit Tests
 * Verifies live LLM wiring, offline heuristic fallback, and snapshot provenance tagging.
 */

import { deriveConclusion } from '../src/loop/derive.js';
import { computeCoalitionRemoval } from '../src/loop/coalition.js';
import { captureSourceSet } from '../src/loop/capture.js';
import { createUserDocSnapshot } from '../src/sources/user-doc.js';
import { loadFixtureSnapshots } from '../src/sources/signal-skills.js';
import { Snapshot } from '../src/types.js';

export async function runDeriveLLMTests(): Promise<{ passed: number; failed: number }> {
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

  console.log('\n--- Running Derivation Engine & Provenance Tests ---');

  const fixtureSnaps = loadFixtureSnapshots('rNVDA');

  // 1. Offline heuristic fallback when no API key is provided
  const offlineResult = await deriveConclusion(
    'Datacenter capex expansion sustains rally',
    'rNVDA',
    fixtureSnaps
  );

  assert(offlineResult.engine === 'offline_heuristic', 'Derivation defaults to offline_heuristic when no API key is set');
  assert(offlineResult.rationale.startsWith('[Offline heuristic synthesis]'), 'Rationale indicates offline heuristic synthesis');
  assert(offlineResult.model === 'qwen3.8-max', 'Default model id is recorded as qwen3.8-max');
  assert(offlineResult.temperature === 0, 'Default temperature is recorded as 0');

  // 2. Derivation accepts custom modelId and options
  const customOptionsResult = await deriveConclusion(
    'Datacenter capex expansion sustains rally',
    'rNVDA',
    fixtureSnaps,
    { modelId: 'qwen2.5-72b-instruct', temperature: 0.2 }
  );

  assert(customOptionsResult.model === 'qwen2.5-72b-instruct', 'Options modelId is propagated');
  assert(customOptionsResult.temperature === 0.2, 'Options temperature is propagated');

  // 3. Mock live LLM fetch test
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url: any, init: any) => {
      if (typeof url === 'string' && url.includes('/chat/completions')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    direction: 'bullish',
                    confidence_band: 'high',
                    rationale: 'Live Qwen model synthesis confirms institutional datacenter capex acceleration.',
                    cited_sources: ['macro-analyst', 'market-intel']
                  })
                }
              }
            ]
          })
        } as any;
      }
      return originalFetch(url, init);
    };

    const liveResult = await deriveConclusion(
      'Datacenter capex expansion sustains rally',
      'rNVDA',
      fixtureSnaps,
      { apiKey: 'sk-mock-key-for-test', modelId: 'qwen3.8-max', temperature: 0 }
    );

    assert(liveResult.engine === 'live_llm', 'Live LLM calls tag engine as live_llm');
    assert(liveResult.direction === 'bullish', 'Parsed live LLM direction matches JSON');
    assert(liveResult.confidence_band === 'high', 'Parsed live LLM confidence band matches JSON');
    assert(liveResult.cited_sources.includes('macro-analyst'), 'Live LLM cited sources correctly parsed');
    assert(liveResult.rationale.includes('Live Qwen model synthesis'), 'Live LLM rationale returned');

    // 4. Coalition removal propagates derivationOptions
    const coalitionWithLLM = await computeCoalitionRemoval(
      'Datacenter capex expansion sustains rally',
      'rNVDA',
      fixtureSnaps,
      {
        maxRemovals: 3,
        derivationOptions: { apiKey: 'sk-mock-key', modelId: 'qwen3.8-max' }
      }
    );
    assert(coalitionWithLLM.baseline.engine === 'live_llm', 'Coalition removal propagates derivationOptions to baseline');
  } finally {
    globalThis.fetch = originalFetch;
  }

  // 5. Snapshot Provenance tagging
  const userDoc = createUserDocSnapshot('rNVDA', 'Analyst transcript notes', 'user-notes');
  assert(userDoc.provenance === 'user-submitted', 'User document snapshots are tagged with user-submitted provenance');

  const loadedFixtures = loadFixtureSnapshots('rNVDA');
  assert(loadedFixtures.every((s) => s.provenance === 'fixture'), 'Fixture snapshots are tagged with fixture provenance');

  const capturedSet = await captureSourceSet({ ticker: 'rNVDA', forceFixture: true });
  assert(capturedSet.length >= 6, 'Captured source set loads at least 6 sources');
  assert(capturedSet[0].provenance === 'fixture', 'Force fixture captures carry fixture provenance');

  return { passed, failed };
}

if (process.argv[1]?.endsWith('derive-llm.test.ts')) {
  runDeriveLLMTests().then((res) => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}
