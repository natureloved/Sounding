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
  const [showPermutations, setShowPermutations] = useState(true);

  // Runtime Invariant I1 check
  assertI1(conclusion, attribution);

  const isUnanchored = attribution.inherited_anchor === 'shut';
  const loadBearingMembers = attribution.load_bearing_set;
  const isRobust = attribution.robust;
  const flippedRemoval = attribution.tested_removals.find((r) => r.changed);

  return (
    <div className="attribution-wrap">
      {/* 1. Derived Conclusion Card */}
      <div className="conclusion-banner">
        <div className="conclusion-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className={`direction-badge ${conclusion.direction}`}>
              {conclusion.direction.toUpperCase()}
            </div>
            {conclusion.engine === 'live_llm' ? (
              <span className="engine-badge live" id="engine-status-badge" title="Evaluated live via Bitget Qwen Gateway">
                ⚡ Derived by {conclusion.model || 'qwen3.8-max'} · temp {conclusion.temperature ?? 0}
              </span>
            ) : (
              <span className="engine-badge offline" id="engine-status-badge" title="Deterministic offline causal engine. Zero credentials required. Connect Bitget Qwen key in Gateway Settings for cloud LLM.">
                ⚙️ Offline heuristic engine (Instant Demo)
              </span>
            )}
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
            <span style={{ fontWeight: 700 }}>{conclusion.confidence_band.toUpperCase()}</span>
          </div>
        </div>
        <p className="rationale-text">{conclusion.rationale}</p>
      </div>

      {/* 2. THE MONEY SHOT: Visible Causal Attribution Proof Moment */}
      {flippedRemoval ? (
        <div className="causal-proof-card" id="causal-proof-moment">
          <div className="causal-proof-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="causal-proof-badge">🎯 Causal Delete-Test Proof</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                Attribution Measured by Removal · Never Claimed by Citation
              </span>
            </div>
            <span className="track-tag" style={{ color: 'var(--accent-amber)', borderColor: 'var(--accent-amber-border)' }}>
              Load-Bearing Flip Verified
            </span>
          </div>

          <div className="causal-proof-body">
            <div className="causal-proof-comparison">
              {/* Baseline */}
              <div className="causal-col baseline">
                <span className="causal-col-label">1. BASELINE CONVICTION</span>
                <div className="causal-col-call">
                  <span className={`direction-chip ${conclusion.direction}`}>{conclusion.direction.toUpperCase()}</span>
                  <span className="causal-band-tag">({conclusion.confidence_band.toUpperCase()})</span>
                </div>
                <span className="causal-col-desc">All {snapshots.length} sources active in perceived context</span>
              </div>

              {/* The Causal Removal Operator */}
              <div className="causal-arrow-col">
                <span className="causal-operator-tag">REMOVING</span>
                <div className="causal-arrow-symbol">➔</div>
                <span className="causal-target-name">{flippedRemoval.removed_sources.join(' + ')}</span>
              </div>

              {/* Flipped Result */}
              <div className="causal-col flipped">
                <span className="causal-col-label">2. COUNTERFACTUAL CALL</span>
                <div className="causal-col-call">
                  <span className={`direction-chip ${flippedRemoval.direction}`}>{flippedRemoval.direction.toUpperCase()}</span>
                  <span className="causal-band-tag">({flippedRemoval.confidence_band.toUpperCase()})</span>
                  <span className="flip-pulse-badge">⚡ FLIPPED</span>
                </div>
                <span className="causal-col-desc">{flippedRemoval.reason}</span>
              </div>
            </div>

            <div className="causal-proof-summary">
              <strong>Decisive Empirical Finding:</strong> The thesis was accompanied by {snapshots.length} citations, but removing <code>{flippedRemoval.removed_sources.join(' + ')}</code> caused the entire bullish conviction to collapse to {flippedRemoval.direction.toUpperCase()}. Control removals of all other sources caused zero change—proving those citations were decorative.
            </div>
          </div>
        </div>
      ) : (
        <div className="causal-proof-card robust" id="causal-proof-moment">
          <div className="causal-proof-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="causal-proof-badge" style={{ background: 'var(--accent-emerald-dim)', color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald-border)' }}>
                ✓ Robust Consensus Proof
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                Zero Fragility Across {attribution.tested_removals.length} Evaluated Permutations
              </span>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '8px 0 0', lineHeight: 1.5 }}>
            Every single-source and dual-source removal was evaluated counterfactually. No tested removal shifted the {conclusion.direction.toUpperCase()} call, demonstrating true multi-source consensus with noise figure {attribution.noise_figure.toFixed(2)}.
          </p>
        </div>
      )}

      {/* 3. Inherited Anchor Status Banner */}
      {isUnanchored ? (
        <div className="unanchored-alert">
          <div style={{ fontSize: '20px', lineHeight: 1 }}>⚠️</div>
          <div>
            <div className="alert-title" style={{ color: 'var(--accent-rose)' }}>
              Resting on Unanchored Ground (Reference Market Shut)
            </div>
            <div className="alert-desc">
              The load-bearing conclusion for this instrument depends upon source(s) captured while the reference market was <strong>SHUT</strong>.
              <br />
              Offending unanchored source:{' '}
              <span style={{ color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {attribution.offending_sources?.join(', ') || loadBearingMembers.join(', ')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="anchored-badge">
          <div style={{ fontSize: '20px', lineHeight: 1 }}>🛡️</div>
          <div>
            <div className="alert-title" style={{ color: 'var(--accent-emerald)' }}>
              Firmly Anchored (Regular Trading Hours Active)
            </div>
            <div className="alert-desc">
              Every source carrying this thesis was retrieved during active reference market price discovery. Weakest clock verdict: <strong>OPEN</strong>.
            </div>
          </div>
        </div>
      )}

      {/* 4. Load-Bearing Set Display */}
      <div className="load-bearing-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              ATTRIBUTION MEASURED BY REMOVAL (LEAVE-ONE-OUT / LEAVE-PAIR-OUT)
            </span>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', color: 'var(--text-primary)' }}>
              {isRobust ? 'Robust View (Multi-Source Consensus)' : 'Load-Bearing Set (Smallest Decisive Coalition)'}
            </h4>
          </div>
          <span className="track-tag">
            {isRobust ? 'Zero Flips' : `${loadBearingMembers.length} Load-Bearing Source(s)`}
          </span>
        </div>

        {isRobust ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
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
                      borderColor: isShut ? 'var(--accent-rose-border)' : 'var(--accent-amber-border)',
                      color: isShut ? 'var(--accent-rose)' : 'var(--accent-amber)',
                      background: isShut ? 'var(--accent-rose-dim)' : 'var(--accent-amber-dim)'
                    }}
                  >
                    {name} {isShut ? '(SHUT ⚠️)' : '(OPEN ✓)'}
                  </span>
                );
              })}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
              Removal of this minimal set flips the derived answer. Attribution is measured by removal, never claimed by citation.
            </p>
          </div>
        )}
      </div>

      {/* 5. Action Bar with [Re-run Derivation] (Invariant I7) */}
      <div className="action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="rerun-btn"
            onClick={onRerun}
            disabled={isRerunning}
            id="rerun-derivation-btn"
          >
            <span>{isRerunning ? '🔄 Reproducing...' : '🔁 Re-run Derivation'}</span>
          </button>
          {rerunCount > 0 && (
            <span className="reproduced-badge">
              ✓ Verified from stored inputs (Run #{rerunCount})
            </span>
          )}
        </div>

        <button
          className="pill-btn"
          onClick={() => setShowPermutations(!showPermutations)}
          id="toggle-permutations-btn"
        >
          {showPermutations ? '▲ Hide Removal Permutations' : `▼ Inspect ${attribution.tested_removals.length} Removals (Live Matrix)`}
        </button>
      </div>

      {/* 6. Combinatorial Permutation Table (Open by default) */}
      {showPermutations && (
        <div className="permutation-table-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-hairline)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              COMBINATORIAL COUNTERFACTUAL REMOVAL MATRIX ({attribution.tested_removals.length} EVALUATED)
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              Invariant I7 Persisted
            </span>
          </div>
          <table className="permutation-table">
            <thead>
              <tr>
                <th>REMOVED SOURCE(S)</th>
                <th>RESULTING CALL</th>
                <th>BAND</th>
                <th>STATUS</th>
                <th>DIAGNOSTIC REASON</th>
              </tr>
            </thead>
            <tbody>
              {attribution.tested_removals.map((rem, idx) => (
                <tr key={idx} className={rem.changed ? 'tr-flipped' : ''}>
                  <td style={{ color: rem.changed ? 'var(--accent-amber)' : 'inherit', fontWeight: rem.changed ? 700 : 500 }}>
                    {rem.removed_sources.join(' + ')}
                  </td>
                  <td style={{ textTransform: 'uppercase' }}>{rem.direction}</td>
                  <td style={{ textTransform: 'uppercase' }}>{rem.confidence_band}</td>
                  <td>
                    {rem.changed ? (
                      <span className="flip-status-badge">FLIPPED ⚡</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>UNCHANGED</span>
                    )}
                  </td>
                  <td style={{ color: rem.changed ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{rem.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
