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
}

export interface DerivationOptions {
  modelId?: string;
  temperature?: number;
  seed?: string;
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

  const rationale = `Synthesis of ${snapshots.length} sources reveals a net ${direction.toUpperCase()} conviction (evidence balance: +${bullishScore.toFixed(1)} / -${bearishScore.toFixed(1)}). Primary driver stems from ${cited.slice(0, 3).join(', ')}.`;

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

  const apiKey = env.BITGET_QWEN_API_KEY || env.OPENAI_API_KEY;
  const baseUrl = env.BITGET_QWEN_BASE_URL || 'https://hackathon.bitgetops.com/v1';
  const model = options.modelId || env.SOUNDING_MODEL || 'qwen3.8-max';

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

      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          temperature: options.temperature ?? 0,
          messages: [
            { role: 'system', content: 'You are Sounding, a deterministic trading desk.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (resp.ok) {
        const data = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            direction: parsed.direction || 'neutral',
            confidence_band: parsed.confidence_band || 'medium',
            rationale: parsed.rationale || 'Derived via model synthesis.',
            cited_sources: parsed.cited_sources || snapshots.map((s) => s.source_name)
          };
        }
      }
    } catch {
      // Fallback to deterministic engine
    }
  }

  // Deterministic local inference fallback
  return deriveOffline(thesis, ticker, snapshots);
}
