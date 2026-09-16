/**
 * Cross-Source Contradiction Detection Engine
 * Roadmap Feature: D5 Contradiction Flag
 * Scans captured research snapshots to identify direct pairwise divergences
 * (e.g. Technical breakdown vs News hype, or Order Flow distribution vs Social greed).
 */

import { Snapshot, Contradiction } from '../types.js';

export function detectContradictions(snapshots: Snapshot[]): Contradiction[] {
  const contradictions: Contradiction[] = [];

  const getSource = (name: string) => snapshots.find((s) => s.source_name.includes(name));

  const tech = getSource('technical');
  const news = getSource('news');
  const intel = getSource('market-intel');
  const sentiment = getSource('sentiment');
  const macro = getSource('macro');

  // 1. Technical vs News Divergence
  if (tech && news) {
    const techBearish = tech.content.toLowerCase().includes('breakdown') || tech.content.toLowerCase().includes('below 20') || tech.content.toLowerCase().includes('negative');
    const newsBullish = news.content.toLowerCase().includes('reiterate') || news.content.toLowerCase().includes('ramp') || news.content.toLowerCase().includes('increase');

    const techBullish = tech.content.toLowerCase().includes('breakout') || tech.content.toLowerCase().includes('above 20') || tech.content.toLowerCase().includes('golden cross');
    const newsBearish = news.content.toLowerCase().includes('scrutiny') || news.content.toLowerCase().includes('delay') || news.content.toLowerCase().includes('subpoena');

    if (techBearish && newsBullish) {
      contradictions.push({
        source_a: tech.source_name,
        source_b: news.source_name,
        divergence_summary: 'Chart breakdown conflicts with bullish corporate headlines.',
        severity: 'high'
      });
    } else if (techBullish && newsBearish) {
      contradictions.push({
        source_a: tech.source_name,
        source_b: news.source_name,
        divergence_summary: 'Technical upward momentum conflicts with regulatory/catalyst delays.',
        severity: 'high'
      });
    }
  }

  // 2. Order Flow vs Sentiment Divergence (Smart Money vs Retail)
  if (intel && sentiment) {
    const retailGreed = sentiment.content.toLowerCase().includes('greed') || sentiment.content.toLowerCase().includes('complacency');
    const whaleSelling = intel.content.toLowerCase().includes('put buying') || intel.content.toLowerCase().includes('distribution') || intel.content.toLowerCase().includes('selling');

    if (retailGreed && whaleSelling) {
      contradictions.push({
        source_a: intel.source_name,
        source_b: sentiment.source_name,
        divergence_summary: 'Institutional distribution/put buying detected while retail crowd is in Greed mode.',
        severity: 'high'
      });
    }
  }

  // 3. Macro Rates vs Technical Expansion
  if (macro && tech) {
    const macroTight = macro.content.toLowerCase().includes('highs') || macro.content.toLowerCase().includes('tight') || macro.content.toLowerCase().includes('deflation');
    const techOverextended = tech.content.toLowerCase().includes('breakout') || tech.content.toLowerCase().includes('high');

    if (macroTight && techOverextended) {
      contradictions.push({
        source_a: macro.source_name,
        source_b: tech.source_name,
        divergence_summary: 'Restrictive macro rate environment conflicts with multiple expansion trend.',
        severity: 'medium'
      });
    }
  }

  return contradictions;
}
