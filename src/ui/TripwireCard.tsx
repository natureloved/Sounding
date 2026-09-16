import React from 'react';
import { Tripwire, DataDecayInfo } from '../types.js';

interface TripwireCardProps {
  tripwires: Tripwire[];
  decayList: DataDecayInfo[];
}

export const TripwireCard: React.FC<TripwireCardProps> = ({ tripwires, decayList }) => {
  return (
    <div className="glass-panel" style={{ borderTop: '2px solid var(--hazard-red)' }}>
      <div className="panel-header">
        <span className="panel-title">
          <span>[!]</span> ACTIONABLE INVALIDATION TRIPWIRES & FRESHNESS DECAY
        </span>
        <span className="track-tag">KILL-CONDITIONS</span>
      </div>

      <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '14px', letterSpacing: '0.03em' }}>
        ATTRIBUTION IS QUANTITATIVE. THESE PRE-DEFINED CONDITIONAL TRIGGERS DETERMINE EXACTLY WHEN THE LOAD-BEARING SET COLLAPSES.
      </p>

      {/* Tripwires List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        {tripwires.map((trip) => (
          <div
            key={trip.id}
            style={{
              background: 'var(--bg-subpanel)',
              border: `1px solid ${trip.severity === 'CRITICAL' ? 'var(--hazard-red-border)' : 'var(--amber-tension-border)'}`,
              borderLeft: `3px solid ${trip.severity === 'CRITICAL' ? 'var(--hazard-red)' : 'var(--amber-tension)'}`,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--radar-cyan)', fontWeight: 700, letterSpacing: '0.05em' }}>
                [{trip.category} INVALIDATION PROTOCOL]
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  padding: '2px 6px',
                  background: trip.severity === 'CRITICAL' ? 'var(--hazard-red-dim)' : 'var(--amber-tension-dim)',
                  color: trip.severity === 'CRITICAL' ? 'var(--hazard-red)' : 'var(--amber-tension)',
                  border: `1px solid ${trip.severity === 'CRITICAL' ? 'var(--hazard-red-border)' : 'var(--amber-tension-border)'}`
                }}
              >
                {trip.severity}
              </span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-white)' }}>
              &gt;&gt;&gt; {trip.trigger_condition}
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-dim)' }}>CONSEQUENCE:</strong> {trip.invalidation_consequence}
            </div>
          </div>
        ))}
      </div>

      {/* Intelligence Half-Life Decay Timers */}
      <div style={{ borderTop: '1px solid var(--border-tactical)', paddingTop: '12px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          /// TELEMETRY HALF-LIFE & FRESHNESS DECAY:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
          {decayList.map((item) => (
            <div
              key={item.source_name}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-tactical)',
                padding: '8px 10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-white)' }}>{item.source_name}</span>
                <span style={{ color: item.remaining_freshness_pct > 60 ? 'var(--phosphor-green)' : 'var(--amber-tension)', fontWeight: 700 }}>
                  {item.remaining_freshness_pct}% FRESH
                </span>
              </div>
              <div className="coverage-progress-bg" style={{ margin: '6px 0', height: '3px' }}>
                <div
                  className="coverage-progress-fill"
                  style={{
                    width: `${item.remaining_freshness_pct}%`,
                    background: item.remaining_freshness_pct > 60 ? 'var(--phosphor-green)' : 'var(--amber-tension)'
                  }}
                />
              </div>
              <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                HALF-LIFE: {item.half_life_hours >= 24 ? `${item.half_life_hours / 24}D` : `${item.half_life_hours}H`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
