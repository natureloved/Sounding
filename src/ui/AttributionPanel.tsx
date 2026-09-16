import React, { useState } from 'react';
import { Conclusion, Attribution, Snapshot } from '../types.js';
import { assertI1 } from '../store/schema.js';

interface AttributionPanelProps {
  conclusion: Conclusion;
  attribution: Attribution;
  snapshots: Snapshot[];
  onRerun: () => Promise<void>;
  isRerunning: boolean;
  rerunCount: number;
}

export const AttributionPanel: React.FC<AttributionPanelProps> = ({
  conclusion,
  attribution,
  snapshots,
  onRerun,
  isRerunning,
  rerunCount
}) => {
  const [showPermutations, setShowPermutations] = useState(false);

  // Runtime Invariant I1 check
  assertI1(conclusion, attribution);

  const isUnanchored = attribution.inherited_anchor === 'shut';
  const loadBearingMembers = attribution.load_bearing_set;
  const isRobust = attribution.robust;

  return (
    <div className="attribution-wrap">
      {/* 1. Derived Conclusion Card */}
      <div className="conclusion-banner">
        <div className="conclusion-top">
          <div className={`direction-badge ${conclusion.direction}`}>
            [{conclusion.direction.toUpperCase()}]
          </div>
          <div className="confidence-bar-wrap">
            <span>CONVICTION:</span>
            <div className="confidence-bar">
              <div className={`conf-segment ${conclusion.confidence_band ? 'active' : ''}`} />
              <div
                className={`conf-segment ${
                  conclusion.confidence_band === 'medium' || conclusion.confidence_band === 'high'
                    ? 'active'
                    : ''
                }`}
              />
              <div className={`conf-segment ${conclusion.confidence_band === 'high' ? 'active' : ''}`} />
            </div>
            <span>[{conclusion.confidence_band.toUpperCase()}]</span>
          </div>
        </div>
        <p className="rationale-text">&gt;&gt;&gt; {conclusion.rationale}</p>
      </div>

      {/* 2. Inherited Anchor Status Banner (The Critical Demo Moment!) */}
      {isUnanchored ? (
        <div className="unanchored-alert">
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--hazard-red)', fontSize: '16px' }}>
            [!]
          </div>
          <div>
            <div className="alert-title" style={{ color: 'var(--hazard-red)' }}>
              RESTING ON UNANCHORED GROUND // REFERENCE MARKET SHUT
            </div>
            <div className="alert-desc">
              The load-bearing conclusion for this instrument depends upon source(s) captured while the reference market was <strong>SHUT</strong>.
              <br />
              Offending unanchored source:{' '}
              <span style={{ color: 'var(--hazard-red)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                [{attribution.offending_sources?.join(', ') || loadBearingMembers.join(', ')}]
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="anchored-badge">
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--phosphor-green)', fontSize: '16px' }}>
            [+]
          </div>
          <div>
            <div className="alert-title" style={{ color: 'var(--phosphor-green)' }}>
              FIRMLY ANCHORED // REGULAR TRADING HOURS ACTIVE
            </div>
            <div className="alert-desc">
              Every source carrying this thesis was retrieved during active reference market price discovery. Weakest clock verdict: <strong>OPEN</strong>.
            </div>
          </div>
        </div>
      )}

      {/* 3. Load-Bearing Set Display */}
      <div className="load-bearing-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
              ATTRIBUTION MEASURED BY REMOVAL // LEAVE-ONE-OUT / LEAVE-PAIR-OUT
            </span>
            <h4 style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 800, marginTop: '2px', color: 'var(--text-white)' }}>
              {isRobust ? 'ROBUST VIEW (MULTI-SOURCE CONSENSUS)' : 'LOAD-BEARING SET // SMALLEST DECISIVE COALITION'}
            </h4>
          </div>
          <span className="track-tag">
            {isRobust ? 'ZERO PERMUTATION FLIPS' : `${loadBearingMembers.length} LOAD-BEARING SOURCE(S)`}
          </span>
        </div>

        {isRobust ? (
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
            No single or paired removal flipped direction or shifted the confidence band. The synthesis stands on redundant multi-source consensus. Noise figure: {attribution.noise_figure.toFixed(2)}.
          </p>
        ) : (
          <div>
            <div className="set-tags">
              {loadBearingMembers.map((name) => {
                const snap = snapshots.find((s) => s.source_name === name);
                const isShut = snap?.anchor_verdict === 'shut';
                return (
                  <span
                    key={name}
                    className="load-bearing-pill"
                    style={{
                      borderColor: isShut ? 'var(--hazard-red)' : 'var(--amber-tension)',
                      color: isShut ? 'var(--hazard-red)' : 'var(--amber-tension)',
                      background: isShut ? 'var(--hazard-red-dim)' : 'var(--amber-tension-dim)'
                    }}
                  >
                    [{name}] {isShut ? '// CLOCK: SHUT' : '// CLOCK: OPEN'}
                  </span>
                );
              })}
            </div>
            <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
              Removal of this minimal set flips the derived answer. Attribution is measured by removal, never claimed by citation.
            </p>
          </div>
        )}
      </div>

      {/* 4. Action Bar with [Re-run Derivation] (Invariant I7) */}
      <div className="action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="rerun-btn"
            onClick={onRerun}
            disabled={isRerunning}
            id="rerun-derivation-btn"
          >
            <span>{isRerunning ? '[ REPRODUCING... ]' : '[ RE-RUN DERIVATION ]'}</span>
          </button>
          {rerunCount > 0 && (
            <span className="reproduced-badge">
              [✓ VERIFIED FROM STORED INPUTS // RUN #{rerunCount}]
            </span>
          )}
        </div>

        <button
          className="pill-btn"
          onClick={() => setShowPermutations(!showPermutations)}
          id="toggle-permutations-btn"
        >
          {showPermutations ? '[ HIDE PERMUTATIONS ]' : `[ INSPECT ${attribution.tested_removals.length} REMOVALS ]`}
        </button>
      </div>

      {/* 5. Removal Permutation Table */}
      {showPermutations && (
        <div style={{ marginTop: '8px', border: '1px solid var(--border-tactical)', background: 'var(--bg-chassis)' }}>
          <table className="permutation-table">
            <thead>
              <tr>
                <th>REMOVED SOURCE(S)</th>
                <th>RESULTING CALL</th>
                <th>BAND</th>
                <th>STATUS</th>
                <th>DIAGNOSTIC LOG</th>
              </tr>
            </thead>
            <tbody>
              {attribution.tested_removals.map((rem, idx) => (
                <tr key={idx} className={rem.changed ? 'tr-flipped' : ''}>
                  <td style={{ color: rem.changed ? 'var(--amber-tension)' : 'inherit', fontWeight: 700 }}>
                    [{rem.removed_sources.join(' + ')}]
                  </td>
                  <td style={{ textTransform: 'uppercase' }}>{rem.direction}</td>
                  <td style={{ textTransform: 'uppercase' }}>{rem.confidence_band}</td>
                  <td>
                    {rem.changed ? (
                      <span style={{ color: 'var(--hazard-red)', fontWeight: 800 }}>FLIPPED [!]</span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>STABLE</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{rem.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
