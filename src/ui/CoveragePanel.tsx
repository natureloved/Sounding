import React from 'react';
import { SourceCoverageStat } from '../types.js';

interface CoveragePanelProps {
  stats: SourceCoverageStat[];
  onOpenProjectDoc: () => void;
}

export const CoveragePanel: React.FC<CoveragePanelProps> = ({ stats, onOpenProjectDoc }) => {
  return (
    <div className="glass-panel" style={{ height: 'fit-content' }}>
      <div className="panel-header">
        <span className="panel-title">
          <span>[#]</span> SOURCE INFLUENCE METRICS
        </span>
        <span className="track-tag">COVERAGE</span>
      </div>

      <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
        RANKED STRICTLY BY MEMBERSHIP IN LOAD-BEARING SETS. DISTINGUISHES DECISIVE EVIDENCE FROM DECORATIVE CITATIONS.
      </p>

      <div className="coverage-list">
        {stats.map((item) => {
          const pct = Math.round(item.load_bearing_ratio * 100);
          return (
            <div key={item.source_name} className="coverage-item">
              <div className="coverage-item-header">
                <span className="coverage-item-name">[{item.source_name}]</span>
                <span className="coverage-ratio">{pct}% LB</span>
              </div>
              <div className="coverage-progress-bg">
                <div
                  className="coverage-progress-fill"
                  style={{
                    width: `${Math.max(pct, 4)}%`,
                    background:
                      pct >= 50
                        ? 'var(--amber-tension)'
                        : 'var(--border-tactical-bright)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                <span>CAPTURED: {item.total_captured}x</span>
                <span style={{ color: item.last_anchor_verdict === 'open' ? 'var(--phosphor-green)' : 'var(--hazard-red)' }}>
                  CLOCK: {item.last_anchor_verdict.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-tactical)' }}>
        <button
          className="pill-btn"
          style={{ width: '100%', padding: '10px', textAlign: 'center', fontWeight: 700, borderColor: 'var(--border-tactical-bright)' }}
          onClick={onOpenProjectDoc}
          id="open-submission-doc-btn"
        >
          [ VIEW BITGET PROJECT SPECIFICATION ]
        </button>
      </div>
    </div>
  );
};
