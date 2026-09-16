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
    'SELECT ANY FOUNDATION STRUT BELOW TO "PULL THE PIN" AND TEST STRUCTURAL INTEGRITY.';

  if (isLoadBearingDisabled) {
    simulatedDirection = 'neutral';
    simulatedConfidence = 'low';
    tiltDegrees = -8; // Visibly tilt down to the left
    statusMessage = `[!] CRITICAL STRUCTURAL COLLAPSE: REMOVAL OF LOAD-BEARING STRUT [${attribution.load_bearing_set.join(
      ', '
    )}] INVALIDATES THE SYNTHESIS FOUNDATION.`;
  } else if (disabledSources.size > 0) {
    tiltDegrees = 0;
    statusMessage = `[+] REDUNDANT STRUT REMOVED: PLATFORM EQUILIBRIUM MAINTAINED. REMOVAL OF [${Array.from(
      disabledSources
    ).join(', ')}] DOES NOT FLIP CONCLUSION.`;
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
          <span>[#]</span> CAUSAL FOUNDATION VISUALIZER // LEAVE-ONE-OUT STRESS TEST
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {disabledSources.size > 0 && (
            <button className="pill-btn" onClick={handleReset} style={{ borderColor: 'var(--radar-cyan)', color: 'var(--radar-cyan)' }}>
              [ RESTORE ALL STRUTS ]
            </button>
          )}
          <span className="track-tag">ATTRIBUTION PROOF</span>
        </div>
      </div>

      <div
        style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: isLoadBearingDisabled ? 'var(--hazard-red)' : 'var(--text-secondary)',
          marginBottom: '16px',
          letterSpacing: '0.04em'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              SYNTHESIS BEAM:
            </span>
            <span className={`direction-badge ${simulatedDirection}`} style={{ padding: '2px 8px', fontSize: '11px' }}>
              {simulatedDirection.toUpperCase()} // {simulatedConfidence.toUpperCase()}_CONVICTION
            </span>
          </div>
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: isLoadBearingDisabled ? 'var(--hazard-red)' : 'var(--phosphor-green)',
              letterSpacing: '0.05em'
            }}
          >
            {isLoadBearingDisabled ? '/// BEAM TILTED: COLLAPSE ///' : '=== FOUNDATION ANCHORED ==='}
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
                title={`Click to ${isRemoved ? 'restore' : 'pull pin on'} this source`}
              >
                <div className="pillar-header">
                  <span className="pillar-name">{snap.source_name}</span>
                  <span className={`pillar-tag ${isShut ? 'tag-shut' : 'tag-open'}`}>
                    {snap.anchor_verdict.toUpperCase()}
                  </span>
                </div>

                <div className="pillar-body" style={{ margin: '8px 0' }}>
                  {isRemoved ? (
                    <div style={{ color: 'var(--text-dim)', fontSize: '10px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      [ PIN PULLED ]
                      <br />
                      <span style={{ fontSize: '8px' }}>&lt; CLICK TO RESTORE &gt;</span>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          fontSize: '9px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: isLB ? 'var(--amber-tension)' : 'var(--text-dim)'
                        }}
                      >
                        {isLB ? '[ LOAD-BEARING ]' : '[ REDUNDANT ]'}
                      </div>
                      {isShut && (
                        <div className="hazard-strip">
                          ! UNANCHORED SHUT !
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="pillar-footer">
                  <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                    {isRemoved ? '[+] RESTORE STRUT' : '[-] PULL PIN'}
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
