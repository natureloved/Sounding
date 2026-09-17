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
          <span>Source Influence</span>
        </span>
        <span className="track-tag">Coverage</span>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
        Ranked strictly by historical membership in load-bearing sets. Distinguishes decisive market evidence from cosmetic citations.
      </p>

      <div className="coverage-list">
        {stats.map((item) => {
          const pct = Math.round(item.load_bearing_ratio * 100);
          return (
            <div key={item.source_name} className="coverage-item">
              <div className="coverage-item-header">
                <span className="coverage-item-name">{item.source_name}</span>
                <span className="coverage-ratio">{pct}% LB</span>
              </div>
              <div className="coverage-progress-bg">
                <div
                  className="coverage-progress-fill"
                  style={{
                    width: `${Math.max(pct, 4)}%`,
                    background:
                      pct >= 50
                        ? 'linear-gradient(90deg, var(--accent-cyan), var(--accent-amber))'
                        : 'rgba(255, 255, 255, 0.2)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                <span>Captured: {item.total_captured}x</span>
                <span style={{ color: item.last_anchor_verdict === 'open' ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>
                  Clock: {item.last_anchor_verdict.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-hairline-subtle)' }}>
        <button
          className="pill-btn"
          style={{ width: '100%', padding: '9px', justifyContent: 'center', fontWeight: 600 }}
          onClick={onOpenProjectDoc}
          id="open-submission-doc-btn"
        >
          📄 View System Architecture &amp; Specification
        </button>
      </div>
    </div>
  );
};
