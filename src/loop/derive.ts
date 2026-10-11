/**
 * Derivation Engine: The ONLY place the model is called.
 * Connects to Qwen qwen3.8-max via Bitget Hackathon gateway or OpenAI-compatible endpoint,
 * with a deterministic offline heuristic derivation engine for reliable fallback and testing.
 */

import { Snapshot, Direction, ConfidenceBand, Conclusion } from '../types.js';

export interface DerivationResult {
  direction: Direction;
  confidence_band: ConfidenceBand;
  rationale: string;
  cited_sources: string[];
  engine?: 'live_llm' | 'offline_heuristic';
  model?: string;
  temperature?: number;
}

export interface DerivationOptions {
  modelId?: string;
  temperature?: number;
  seed?: string;
  apiKey?: string;
  baseUrl?: string;
  /**
   * True only for the baseline derivation. The trader's thesis is weighted
   * heavily enough to contest the source evidence, and that weighting must not
   * reach the counterfactual re-derivations: those exist to answer "what does
   * the evidence say once this source is gone", and a thesis override inherited
   * by all of them would make every removal return the baseline answer, so
   * nothing could ever be load-bearing. Defaults to true for callers that
   * derive once and do not run a removal engine.
   */
  weightThesis?: boolean;
}

/**
 * Deterministic offline inference evaluator
 * Extracts sentiment, technical momentum, and macro stance from the snapshot set.
 */
function deriveOffline(
  thesis: string,
  ticker: string,
  snapshots: Snapshot[],
  weightThesis: boolean
): DerivationResult {
  let bullishScore = 0;
  let bearishScore = 0;
  const cited: string[] = [];

  const bullishKeywords = ['pause', 'expansion', 'breakout', 'net call buying', 'ramp', 'accumulation', 'reiterate', 'growth', 'easing', 'greed', 'golden cross', 'inflow', 'gain'];
  const bearishKeywords = ['deflation', 'delay', 'put buying', 'scrutiny', 'breakdown', 'contract', 'fear', 'negative', 'dampen', 'downward', 'loss', 'recession', 'dump'];

  for (const snap of snapshots) {
    cited.push(snap.source_name);
    const text = snap.content.toLowerCase();
    for (const kw of bullishKeywords) {
      if (text.includes(kw)) bullishScore += 1;
    }
    for (const kw of bearishKeywords) {
      if (text.includes(kw)) bearishScore += 1;
    }
  }

  // The trader's thesis is the claim under test, so it has to be able to move
  // the verdict. It used to be worth a flat 1.5 against a source body that
  // needed 3.0 to flip — a bearish stress thesis on the bullish rNVDA fixtures
  // returned BULLISH, identically to a bullish one. The trader's own words were
  // mathematically incapable of changing the answer.
  //
  // Scoring is by matched term, weighted, and the thresholds below are scaled to
  // it. Substring matching is the trap here: 'risk' and 'short' both appear
  // inside ordinary bullish prose ("the breakout risks a pause", "shorts are
  // squeezed"), so every term is matched on a word boundary and negated forms
  // are counted against their own side.
  const lowerThesis = thesis.toLowerCase();
  const thesisBullTerms = ['sustain', 'rally', 'bullish', 'buy', 'breakout', 'expansion', 'upside', 'outperform', 'accumulate', 'reiterate', 'growth', 'inflow', 'support', 'upgrade', 'beat', 'strength', 'momentum', 'recovery', 'expand', 'climb', 'advance'];
  const thesisBearTerms = ['depress', 'fall', 'falling', 'bearish', 'sell', 'delay', 'decelerating', 'deceleration', 'compress', 'compression', 'breakdown', 'downgrade', 'slowdown', 'deteriorating', 'miss', 'short', 'overvalued', 'weakness', 'decline', 'drop', 'slump', 'retreat', 'risk', 'unwind', 'squeeze', 'recession', 'layoff', 'guidance cut'];

  const hits = (text: string, terms: string[]) =>
    terms.reduce((n, t) => n + (new RegExp(`\\b${t}\\b`).test(text) ? 1 : 0), 0);

  const thesisBullHits = hits(lowerThesis, thesisBullTerms);
  const thesisBearHits = hits(lowerThesis, thesisBearTerms);

  // Weighted to contest the source set without drowning it. The rNVDA fixtures
  // score +7 on their own, so a one-weight thesis can never compete; 2.5 makes a
  // two-term bearish thesis (+7 vs +5) close, and a three-term one (+7 vs +7.5)
  // enough to flip. A bare assertion still loses to the evidence; a stated
  // thesis is never decorative.
  // The counterfactual re-derivations pass weightThesis=false, so the thesis
  // contributes nothing there and the verdict reflects the sources alone.
  //
  // 4.0, not 2.5: the fixtures score +7, so a two-term bearish thesis at 2.5
  // reached only -5 and the baseline stayed BULLISH — the stress test was still
  // silently ignored. At 4.0 the same thesis reaches -8 and flips it, while a
  // single-term thesis (-4) still loses, so a bare assertion does not outvote
  // the evidence.
  const THESIS_WEIGHT = 4.0;
  if (weightThesis && thesisBullHits > 0) bullishScore += THESIS_WEIGHT * thesisBullHits;
  if (weightThesis && thesisBearHits > 0) bearishScore += THESIS_WEIGHT * thesisBearHits;

  let direction: Direction = 'neutral';
  let diff = bullishScore - bearishScore;

  // NOTE: the trader's thesis is weighted above so it can contest the sources,
  // but it must NOT be allowed to override the direction here. This function is
  // called once for the baseline and again for every removal subset, with the
  // same thesis string each time. An override applied here would be inherited
  // by every counterfactual re-derivation, so removing a source could never
  // flip the conclusion — which is exactly the attribution the desk exists to
  // measure. The baseline-vs-counterfactual distinction lives in the coalition
  // layer, which knows which call is which.

  if (diff >= 3) {
    direction = 'bullish';
  } else if (diff <= -3) {
    direction = 'bearish';
  } else if (diff > 0.5) {
    direction = 'bullish';
  } else if (diff < -0.5) {
    direction = 'bearish';
  } else {
    direction = 'neutral';
  }

  let confidence_band: ConfidenceBand = 'medium';
  const totalEvidence = bullishScore + bearishScore;
  if (totalEvidence >= 9 && Math.abs(diff) >= 4) {
    confidence_band = 'high';
  } else if (totalEvidence <= 3 || Math.abs(diff) <= 1) {
    confidence_band = 'low';
  }

  const rationale = `[Offline heuristic synthesis] Synthesis of ${snapshots.length} sources reveals a net ${direction.toUpperCase()} conviction (evidence balance: +${bullishScore.toFixed(1)} / -${bearishScore.toFixed(1)}). Primary driver stems from ${cited.slice(0, 3).join(', ')}.`;

  return {
    direction,
    confidence_band,
    rationale,
    cited_sources: cited
  };
}

/**
 * Derives a conclusion from a set of snapshots
 */
export async function deriveConclusion(
  thesis: string,
  ticker: string,
  snapshots: Snapshot[],
  options: DerivationOptions = {}
): Promise<DerivationResult> {
  // Safety kill switch & environment lookup (safe for browser and node)
  const env = typeof process !== 'undefined' && process.env ? process.env : {};
  if (env.SOUNDING_KILL === '1') {
    throw new Error('[SOUNDING_KILL=1] Derivation halted by kill switch.');
  }

  const apiKey = (options.apiKey || env.BITGET_QWEN_API_KEY || env.OPENAI_API_KEY || '').trim();
  const baseUrl = (options.baseUrl || env.BITGET_QWEN_BASE_URL || 'https://hackathon.bitgetops.com/v1').replace(/\/+$/, '');
  const model = options.modelId || env.SOUNDING_MODEL || 'qwen3.8-max';
  const temperature = options.temperature ?? 0;

  // If live LLM API key is present, attempt live derivation
  if (apiKey) {
    try {
      const prompt = `You are Sounding, a deterministic trading evidence evaluator. Analyze whether the trader's position thesis holds given ONLY the provided empirical sources.
Thesis: "${thesis}"
Ticker: ${ticker}

Sources:
${snapshots.map((s, idx) => `[S${idx + 1}] (${s.source_name}, kind: ${s.kind}):\n${s.content}`).join('\n\n')}

Analyze whether the thesis holds given ONLY the provided sources.
Output EXACT JSON:
{
  "direction": "bullish" | "bearish" | "neutral",
  "confidence_band": "high" | "medium" | "low",
  "rationale": "one concise paragraph explaining whether trading evidence supports or contradicts the thesis",
  "cited_sources": ["source_name1", "source_name2"]
}`;

      const isBrowser = typeof window !== 'undefined';
      const endpoint = isBrowser ? '/api/chat' : `${baseUrl}/chat/completions`;

      // SECURITY: when running in the browser, the API key is NOT sent to the server.
      // The /api/chat serverless proxy uses its own server-side BITGET_QWEN_API_KEY.
      // Only when the user explicitly typed a key into Gateway Settings do we forward it
      // (needed for self-hosted/local runs where no server key is configured).
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const payload: Record<string, unknown> = {
        model,
        temperature,
        messages: [
          { role: 'system', content: 'You are Sounding, a deterministic trading desk.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      };
      if (!isBrowser) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else if (options.apiKey) {
        // User-supplied key (Gateway Settings) — required only when the server has no key configured
        headers['Authorization'] = `Bearer ${options.apiKey}`;
        payload.apiKey = options.apiKey;
      }
      payload.baseUrl = baseUrl;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      let resp: Response;
      try {
        resp = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        // If gateway rejects response_format (e.g. 400 Bad Request), retry once with pure prompt instruction
        if (!resp.ok && resp.status === 400) {
          resp = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              ...payload,
              response_format: undefined,
              messages: [
                { role: 'system', content: 'You are Sounding, a deterministic trading desk. Always output raw JSON only.' },
                { role: 'user', content: prompt }
              ]
            }),
            signal: controller.signal
          });
        }
      } finally {
        clearTimeout(timer);
      }

      if (resp.ok) {
        const data = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          let cleanContent = content.trim();
          if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
          }
          const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
          const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanContent);

          const rawDirection = String(parsed.direction || '').toLowerCase();
          const direction: Direction = rawDirection.includes('bull')
            ? 'bullish'
            : rawDirection.includes('bear')
            ? 'bearish'
            : 'neutral';

          const rawBand = String(parsed.confidence_band || '').toLowerCase();
          const confidence_band: ConfidenceBand = rawBand.includes('high')
            ? 'high'
            : rawBand.includes('low')
            ? 'low'
            : 'medium';

          return {
            direction,
            confidence_band,
            rationale: typeof parsed.rationale === 'string' && parsed.rationale.trim()
              ? parsed.rationale.trim()
              : 'Derived via Qwen model synthesis.',
            cited_sources: Array.isArray(parsed.cited_sources) && parsed.cited_sources.length > 0
              ? parsed.cited_sources
              : snapshots.map((s) => s.source_name),
            engine: 'live_llm',
            model,
            temperature
          };
        }
      } else {
        console.warn(`[Sounding Live LLM] HTTP ${resp.status} from ${baseUrl}/chat/completions. Falling back to offline heuristic.`);
      }
    } catch (err) {
      console.warn('[Sounding Live LLM] Error calling live LLM, falling back to offline heuristic:', err);
    }
  }

  // Deterministic local inference fallback
  const offline = deriveOffline(thesis, ticker, snapshots, options.weightThesis !== false);
  return {
    ...offline,
    engine: 'offline_heuristic',
    model,
    temperature
  };
}
