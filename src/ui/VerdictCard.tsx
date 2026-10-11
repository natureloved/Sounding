import React from 'react';
import type { Attribution, Conclusion } from '../types.js';

interface Props {
  conclusion: Conclusion;
  attribution: Attribution;
}

/**
 * The verdict, first.
 *
 * The desk already computed the whole story: which sources are load-bearing,
 * what happens when each is removed, whether the conclusion survives, and
 * whether it rests on a source captured while the reference market was shut.
 * But that answer arrived as four panels in sequence, with the thesis box and
 * the source list first, so the thing the desk exists to say came last.
 *
 * This puts it in one card above the tabs: the direction, how fragile it is, and
 * what it is resting on. The collapse is the product, so it is the headline.
 */
export const VerdictCard: React.FC<Props> = ({ conclusion, attribution }) => {
  const loadBearing = attribution.load_bearing_set ?? [];
  const robust = attribution.robust;
  const anchor = attribution.inherited_anchor;
  // Only "shut" is an unanchored verdict in this engine; "unknown" is its own
  // thing and must not be dressed up as one.
  const unanchored = anchor === 'shut';

  // A conclusion that dies when one source is pulled is not multi-source
  // consensus, however many sources are cited. That is the whole finding.
  const fragility = robust
    ? { label: 'ROBUST', tone: 'ok', note: 'No single source, or pair, flips this conclusion.' }
    : loadBearing.length === 1
      ? { label: 'ONE SOURCE HOLDS IT', tone: 'warn', note: 'Pull that one source and the conclusion changes.' }
      : { label: `${loadBearing.length} SOURCES HOLD IT`, tone: 'warn', note: 'The rest are cosmetic.' };

  const dirTone =
    conclusion.direction === 'bullish' ? 'up' : conclusion.direction === 'bearish' ? 'down' : 'flat';

  return (
    <section className="verdict-card" id="verdict-card" aria-label="Attribution verdict">
      <div className="verdict-head">
        <div className="verdict-direction">
          <span className="verdict-kicker">THE ANSWER</span>
          <h2 className={`verdict-direction-value tone-${dirTone}`}>
            {conclusion.direction.toUpperCase()}
            <span className="verdict-confidence">{conclusion.confidence_band?.toUpperCase()}</span>
          </h2>
        </div>

        <div className={`verdict-fragility tone-${fragility.tone}`}>
          <span className="verdict-fragility-label">{fragility.label}</span>
          <span className="verdict-fragility-note">{fragility.note}</span>
        </div>
      </div>

      <dl className="verdict-facts">
        <div className="verdict-fact">
          <dt>load-bearing</dt>
          <dd>
            {loadBearing.length === 0 ? (
              <span className="verdict-none">none</span>
            ) : (
              <span className="verdict-sources">
                {loadBearing.map((s) => (
                  <code key={s}>{s}</code>
                ))}
              </span>
            )}
          </dd>
        </div>
        <div className="verdict-fact">
          <dt>resting on</dt>
          <dd>
            <span className={`verdict-anchor ${unanchored ? 'is-unanchored' : ''}`}>
              {unanchored ? 'unanchored ground' : anchor.replace(/_/g, ' ')}
            </span>
          </dd>
        </div>
        <div className="verdict-fact">
          <dt>removals tested</dt>
          <dd className="verdict-num">{attribution.tested_removals?.length ?? 0}</dd>
        </div>
        <div className="verdict-fact">
          <dt>stability noise</dt>
          <dd className="verdict-num">{(attribution.noise_figure ?? 0).toFixed(2)}</dd>
        </div>
      </dl>

      {unanchored && (
        <p className="verdict-warning" role="status">
          The load-bearing conclusion rests on source(s) captured while the reference
          market was <strong>SHUT</strong>. Sunday narrative is not Monday liquidity.
        </p>
      )}
    </section>
  );
};
