import React from 'react';
import { Tripwire, DataDecayInfo } from '../types.js';

interface TripwireCardProps {
  tripwires: Tripwire[];
  decayList: DataDecayInfo[];
}

export const TripwireCard: React.FC<TripwireCardProps> = ({ tripwires, decayList }) => {
  return (
    <div className="glass-panel" style={{ borderTop: '2px solid var(--accent-rose)' }}>
      <div className="panel-header">
        <span className="panel-title">
          <span>Actionable Invalidation Tripwires &amp; Freshness</span>
        </span>
        <span className="track-tag">Kill-Conditions</span>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
        Human traders make final decisions. These quantitative rules define the exact conditional market triggers under which the load-bearing thesis collapses.
      </p>

      {/* Tripwires List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {tripwires.map((trip) => (
          <div
            key={trip.id}
            style={{
              background: 'var(--bg-input)',
              border: `1px solid ${trip.severity === 'CRITICAL' ? 'var(--accent-rose-border)' : 'var(--accent-amber-border)'}`,
              borderLeft: `3px solid ${trip.severity === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--accent-amber)'}`,
              borderRadius: 'var(--radius-inner)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: 'var(--bevel-inner)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                {trip.category} INVALIDATION
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-pill)',
                  background: trip.severity === 'CRITICAL' ? 'var(--accent-rose-dim)' : 'var(--accent-amber-dim)',
                  color: trip.severity === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--accent-amber)',
                  border: `1px solid ${trip.severity === 'CRITICAL' ? 'var(--accent-rose-border)' : 'var(--accent-amber-border)'}`
                }}
              >
                {trip.severity}
              </span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {trip.trigger_condition}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong style={{ color: 'var(--text-muted)' }}>Consequence:</strong> {trip.invalidation_consequence}
            </div>
          </div>
        ))}
      </div>

      {/* Intelligence Half-Life Decay Timers */}
      <div style={{ borderTop: '1px solid var(--border-hairline-subtle)', paddingTop: '12px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Intelligence Half-Life &amp; Freshness Decay:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px' }}>
          {decayList.map((item) => (
            <div
              key={item.source_name}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-inner)',
                padding: '10px 12px',
                boxShadow: 'var(--bevel-inner)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.source_name}</span>
                <span style={{ color: item.remaining_freshness_pct > 60 ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 700 }}>
                  {item.remaining_freshness_pct}% Fresh
                </span>
              </div>
              <div className="coverage-progress-bg" style={{ margin: '6px 0', height: '4px' }}>
                <div
                  className="coverage-progress-fill"
                  style={{
                    width: `${item.remaining_freshness_pct}%`,
                    background: item.remaining_freshness_pct > 60 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                  }}
                />
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                Half-Life: {item.half_life_hours >= 24 ? `${item.half_life_hours / 24}d` : `${item.half_life_hours}h`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
