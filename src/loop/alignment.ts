/**
 * Personalized Thesis & Position Alignment Engine
 * Track 3 Rubric Focus: "Personalized Thesis"
 * Evaluates whether the user's specific capital stance and leverage align with the load-bearing set
 * and calculates the Asymmetric Fragility Index.
 */

import { UserPosition, PositionAlignment, Direction, Attribution, Conclusion } from '../types.js';

export function evaluatePositionAlignment(
  position: UserPosition | undefined,
  conclusion: Conclusion,
  attribution: Attribution
): PositionAlignment {
  // If user is flat or has no active stance
  if (!position || position.stance === 'flat') {
    return {
      aligns: true,
      fragility_score: 5,
      risk_flag: 'LOW',
      summary: 'Flat / No Capital Exposure',
      recommendation: 'Desk analysis active in observation mode. No capital at risk.'
    };
  }

  const { stance, leverage = 1 } = position;
  const { direction, confidence_band } = conclusion;
  const isUnanchored = attribution.inherited_anchor === 'shut';
  const loadBearingCount = attribution.load_bearing_set.length;

  let baseScore = 15;
  let aligns = false;

  // 1. Directional Alignment
  if ((stance === 'long' && direction === 'bullish') || (stance === 'short' && direction === 'bearish')) {
    aligns = true;
    baseScore = confidence_band === 'high' ? 10 : confidence_band === 'medium' ? 20 : 35;
  } else if (direction === 'neutral') {
    aligns = false;
    baseScore = 45; // Choppy/neutral foundation
  } else {
    // Direct contradiction between position and conclusion
    aligns = false;
    baseScore = 65;
  }

  // 2. Unanchored Ground Fragility Penalty
  if (isUnanchored) {
    baseScore += 30; // High risk when carrying position on shut/off-market data
  }

  // 3. Leverage Multiplier
  if (leverage > 1) {
    const leverageFactor = Math.min(leverage / 3, 2.0);
    baseScore = Math.round(baseScore * (1 + leverageFactor * 0.25));
  }

  // Clamp fragility score between 0 and 100
  const fragility_score = Math.min(100, Math.max(0, baseScore));

  // Determine Risk Flag
  let risk_flag: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (fragility_score >= 75) risk_flag = 'CRITICAL';
  else if (fragility_score >= 50) risk_flag = 'HIGH';
  else if (fragility_score >= 25) risk_flag = 'MODERATE';

  // Generate personalized trader guidance
  let summary = '';
  let recommendation = '';

  if (risk_flag === 'CRITICAL') {
    summary = isUnanchored
      ? `Asymmetric Risk: Position (${stance.toUpperCase()} ${leverage}x) rests on UNANCHORED ground (${attribution.offending_sources?.join(', ') || 'off-hours data'})!`
      : `Critical Conflict: Position (${stance.toUpperCase()} ${leverage}x) directly contradicts ${direction.toUpperCase()} conviction.`;
    recommendation = `Reduce leverage immediately or hedge until reference market opens and price discovery confirms the load-bearing catalyst.`;
  } else if (risk_flag === 'HIGH') {
    summary = `Caution: Divergent premise with ${fragility_score}% fragility.`;
    recommendation = `Tighten stops. Removal of [${attribution.load_bearing_set.join(', ')}] will cause your thesis to collapse.`;
  } else if (risk_flag === 'MODERATE') {
    summary = `Acceptable alignment with ${confidence_band.toUpperCase()} confidence.`;
    recommendation = `Position aligns with research direction. Monitor load-bearing source [${attribution.load_bearing_set[0] || 'consensus'}] for changes.`;
  } else {
    summary = `Solid Foundation: Stance (${stance.toUpperCase()}) fully supported by live anchored sources.`;
    recommendation = `Conviction is high. All load-bearing dependencies are active in regular market hours.`;
  }

  return {
    aligns,
    fragility_score,
    risk_flag,
    summary,
    recommendation
  };
}
