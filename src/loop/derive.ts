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
}

/**
 * Deterministic offline inference evaluator
 * Extracts sentiment, technical momentum, and macro stance from the snapshot set.
 */
function deriveOffline(
  thesis: string,
  ticker: string,
  snapshots: Snapshot[]
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

  // Weightings based on thesis sentiment alignment
  const lowerThesis = thesis.toLowerCase();
  const thesisBullish = lowerThesis.includes('sustain') || lowerThesis.includes('rally') || lowerThesis.includes('bull') || lowerThesis.includes('buy') || lowerThesis.includes('breakout');
  const thesisBearish = lowerThesis.includes('depress') || lowerThesis.includes('fall') || lowerThesis.includes('bear') || lowerThesis.includes('sell') || lowerThesis.includes('delay');

  if (thesisBullish) bullishScore += 1.5;
  if (thesisBearish) bearishScore += 1.5;

  let direction: Direction = 'neutral';
  let diff = bullishScore - bearishScore;

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
      const prompt = `You are Sounding, a deterministic research desk.
Thesis: "${thesis}"
Ticker: ${ticker}

Sources:
${snapshots.map((s, idx) => `[S${idx + 1}] (${s.source_name}, kind: ${s.kind}):\n${s.content}`).join('\n\n')}

Analyze whether the thesis holds given ONLY the provided sources.
Output EXACT JSON:
{
  "direction": "bullish" | "bearish" | "neutral",
  "confidence_band": "high" | "medium" | "low",
  "rationale": "one concise paragraph explaining the synthesis",
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
  const offline = deriveOffline(thesis, ticker, snapshots);
  return {
    ...offline,
    engine: 'offline_heuristic',
    model,
    temperature
  };
}
