import React, { useState } from 'react';
import { Snapshot, Attribution, Conclusion } from '../types.js';

interface FoundationVisualizerProps {
  snapshots: Snapshot[];
  attribution: Attribution;
  conclusion: Conclusion;
}

export const FoundationVisualizer: React.FC<FoundationVisualizerProps> = ({
  snapshots,
  attribution,
  conclusion
}) => {
  // Set of disabled sources (simulated removal)
  const [disabledSources, setDisabledSources] = useState<Set<string>>(new Set());

  const isLoadBearingDisabled = attribution.load_bearing_set.some((lb) => disabledSources.has(lb));

  // Determine dynamic tilt and simulated conviction
  let simulatedDirection = conclusion.direction;
  let simulatedConfidence = conclusion.confidence_band;
  let tiltDegrees = 0;
  let statusMessage =
    'Select any source pillar below to "pull the pin" and stress-test whether the thesis stands.';

  if (isLoadBearingDisabled) {
    simulatedDirection = 'neutral';
    simulatedConfidence = 'low';
    tiltDegrees = -7; // Visibly tilt down to the left
    statusMessage = `Critical Structural Collapse: Removal of load-bearing pillar [${attribution.load_bearing_set.join(
      ', '
    )}] causes the thesis foundation to fail.`;
  } else if (disabledSources.size > 0) {
    tiltDegrees = 0;
    statusMessage = `Redundant Source Removed: Thesis platform remains in equilibrium. Removal of [${Array.from(
      disabledSources
    ).join(', ')}] does not alter the call.`;
  }

  const handleTogglePillar = (sourceName: string) => {
    const next = new Set(disabledSources);
    if (next.has(sourceName)) {
      next.delete(sourceName);
    } else {
      next.add(sourceName);
    }
    setDisabledSources(next);
  };

  const handleReset = () => {
    setDisabledSources(new Set());
  };

  return (
    <div className="glass-panel foundation-visualizer-card">
      <div className="panel-header">
        <span className="panel-title">
          <span>Causal Foundation Visualizer</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {disabledSources.size > 0 && (
            <button className="pill-btn" onClick={handleReset} style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}>
              Restore All Pillars
            </button>
          )}
          <span className="track-tag">Leave-One-Out Simulation</span>
        </div>
      </div>

      <div
        style={{
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: isLoadBearingDisabled ? 'var(--accent-rose)' : 'var(--text-secondary)',
          marginBottom: '16px',
          letterSpacing: '0.01em'
        }}
      >
        {statusMessage}
      </div>

      {/* Structural Bridge & Platform */}
      <div className="bridge-container">
        {/* The Thesis Platform */}
        <div
          className={`thesis-platform ${isLoadBearingDisabled ? 'platform-tilted' : ''}`}
          style={{ transform: `rotate(${tiltDegrees}deg)` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Thesis Platform:
            </span>
            <span className={`direction-badge ${simulatedDirection}`} style={{ padding: '3px 12px', fontSize: '12px' }}>
              {simulatedDirection.toUpperCase()} ({simulatedConfidence.toUpperCase()})
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: isLoadBearingDisabled ? 'var(--accent-rose)' : 'var(--accent-emerald)',
              letterSpacing: '0.03em'
            }}
          >
            {isLoadBearingDisabled ? '⚠️ Foundation Destabilized' : '🛡️ Foundation Supported'}
          </span>
        </div>

        {/* Pillars Grid */}
        <div className="pillars-grid">
          {snapshots.map((snap) => {
            const isLB = attribution.load_bearing_set.includes(snap.source_name);
            const isShut = snap.anchor_verdict === 'shut';
            const isRemoved = disabledSources.has(snap.source_name);

            let pillarClass = 'pillar';
            if (isRemoved) pillarClass += ' pillar-removed';
            else if (isLB) pillarClass += ' pillar-load-bearing';
            if (isShut) pillarClass += ' pillar-shut';

            return (
              <div
                key={snap.id}
                className={pillarClass}
                onClick={() => handleTogglePillar(snap.source_name)}
                title={`Click to ${isRemoved ? 'restore' : 'remove'} this pillar`}
              >
                <div className="pillar-header">
                  <span className="pillar-name">{snap.source_name}</span>
                  <span className={`pillar-tag ${isShut ? 'tag-shut anchor-pill shut' : 'tag-open anchor-pill open'}`}>
                    {snap.anchor_verdict.toUpperCase()}
                  </span>
                </div>

                <div className="pillar-body" style={{ margin: '8px 0' }}>
                  {isRemoved ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      [Removed]
                      <br />
                      <span style={{ fontSize: '9px' }}>Click to restore</span>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: isLB ? 'var(--accent-amber)' : 'var(--text-muted)'
                        }}
                      >
                        {isLB ? '⚡ Load-Bearing' : 'Redundant'}
                      </div>
                      {isShut && (
                        <div
                          style={{
                            fontSize: '9px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: 'var(--accent-rose)',
                            background: 'var(--accent-rose-dim)',
                            border: '1px solid var(--accent-rose-border)',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            marginTop: '4px',
                            textAlign: 'center'
                          }}
                        >
                          Off-Hours (Shut)
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="pillar-footer">
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
                    {isRemoved ? 'Click to Restore' : 'Click to Pull Pin'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
