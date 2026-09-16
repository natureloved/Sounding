import React from 'react';

interface BenchmarkComparisonModalProps {
  onClose: () => void;
}

export const BenchmarkComparisonModal: React.FC<BenchmarkComparisonModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '880px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
            ⚔️ Side-by-Side Benchmark: Conventional AI Chatbot vs. Sounding Desk
          </span>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          {/* Left Column: Generic Chatbot */}
          <div
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-inner)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                CONVENTIONAL AI CHATBOT / DESK
              </span>
              <span className="track-tag" style={{ color: 'var(--accent-rose)', borderColor: 'var(--accent-rose-border)', fontSize: '10px' }}>
                95% of Submissions
              </span>
            </div>

            <div style={{ padding: '12px', background: 'var(--accent-emerald-dim)', borderRadius: 'var(--radius-btn)', border: '1px solid var(--accent-emerald-border)' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                STRONG BUY (94% CONVICTION)
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Recommendation: Aggressive 5x Long Leverage. Multi-source bullish consensus.
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              "Our AI agent synthesized macro signals, news, and technicals to derive high bullish conviction for rNVDA. Datacenter capex and Fed pause provide clear tailwinds."
            </p>

            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-hairline-subtle)', paddingTop: '10px' }}>
              COSMETIC CITATIONS (CLAIM OF RELEVANCE):
              <br />
              • [1] Fed policy memo (Twitter/X, Sunday 03:00 UTC)
              <br />
              • [2] Taiwan rack capex checks
              <br />
              • [3] Dark pool block accumulation
            </div>

            <div style={{ marginTop: 'auto', padding: '12px', background: 'var(--accent-rose-dim)', borderRadius: 'var(--radius-btn)', border: '1px solid var(--accent-rose-border)', fontSize: '11.5px', color: '#fca5a5' }}>
              <strong>❌ FATAL FLAWS:</strong>
              <br />
              • Ignores market clock (treats Sunday off-hours chatter as active liquidity).
              <br />
              • Attribution is asserted by citation, never tested by removal.
              <br />
              • Conceals that removing source [1] flips the call!
            </div>
          </div>

          {/* Right Column: Sounding Desk */}
          <div
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--accent-cyan-border)',
              borderRadius: 'var(--radius-inner)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: 'var(--glow-cyan)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                SOUNDING RESEARCH WORKBENCH
              </span>
              <span className="track-tag" style={{ fontSize: '10px' }}>
                Track 3 Winner
              </span>
            </div>

            <div style={{ padding: '12px', background: 'var(--accent-amber-dim)', borderRadius: 'var(--radius-btn)', border: '1px solid var(--accent-amber-border)' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-amber)' }}>
                ⚠️ RESTING ON UNANCHORED GROUND
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Recommendation: Do not leverage. Weekend trap detected.
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              "Attribution measured strictly by removal: leave-one-out reveals that the entire thesis collapses without <code>macro-analyst</code>. But our deterministic calendar shows it was captured at Sunday 03:00 UTC while NASDAQ was shut!"
            </p>

            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', borderTop: '1px solid var(--border-hairline-subtle)', paddingTop: '10px' }}>
              THE LOAD-BEARING SET (PROVED BY REMOVAL):
              <br />
              • Load-Bearing: <strong>[ macro-analyst ]</strong> (Clock: 🔴 SHUT)
              <br />
              • Weekend Trap Exposure: <strong>83%</strong>
              <br />
              • Invalidation Tripwire: Daily close &lt; $128.50 (20-EMA)
            </div>

            <div style={{ marginTop: 'auto', padding: '12px', background: 'var(--accent-emerald-dim)', borderRadius: 'var(--radius-btn)', border: '1px solid var(--accent-emerald-border)', fontSize: '11.5px', color: '#6ee7b7' }}>
              <strong>✓ THE SOUNDING ADVANTAGE:</strong>
              <br />
              • Measures attribution by removal, never claimed by citation.
              <br />
              • Inherited anchor binds trust to the deterministic market clock.
              <br />
              • Fulfills Track 3 delete-test: human trader makes final decision!
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(255, 255, 255, 0.02)' }}>
          <button className="execute-btn" onClick={onClose} style={{ padding: '8px 24px' }}>
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
