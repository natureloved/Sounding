import React from 'react';

interface BenchmarkComparisonModalProps {
  onClose: () => void;
}

export const BenchmarkComparisonModal: React.FC<BenchmarkComparisonModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '920px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            [ SYSTEM COMPARISON // GENERIC AI VS SOUNDING WORKBENCH ]
          </span>
          <button className="close-btn" onClick={onClose}>
            [X]
          </button>
        </div>

        <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Left Column: Generic Chatbot */}
          <div
            style={{
              background: 'var(--bg-chassis)',
              border: '1px solid var(--border-tactical)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-dim)' }}>
                CONVENTIONAL AI CHATBOT / DESK
              </span>
              <span className="track-tag" style={{ color: 'var(--hazard-red)', borderColor: 'var(--hazard-red-border)' }}>
                95% OF SUBMISSIONS
              </span>
            </div>

            <div style={{ padding: '10px', background: 'var(--hazard-red-dim)', border: '1px solid var(--hazard-red-border)' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--hazard-red)' }}>
                STRONG BUY (94% UNANCHORED CONVICTION)
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Recommendation: Aggressive 5x Long Leverage. Multi-source bullish consensus.
              </div>
            </div>

            <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              "Our AI agent synthesized macro signals, news, and technicals to derive high bullish conviction for rNVDA. Datacenter capex and Fed pause provide clear tailwinds."
            </p>

            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', borderTop: '1px solid var(--border-tactical)', paddingTop: '8px' }}>
              COSMETIC CITATIONS (CLAIM OF RELEVANCE):
              <br />
              [1] Fed policy memo (Twitter/X, Sunday 03:00 UTC)
              <br />
              [2] Taiwan rack capex checks
              <br />
              [3] Dark pool block accumulation
            </div>

            <div style={{ marginTop: 'auto', padding: '10px', background: 'var(--hazard-red-dim)', border: '1px solid var(--hazard-red)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--hazard-red)' }}>
              <strong>[!] FATAL FLAWS:</strong>
              <br />
              • Ignores market clock (treats Sunday off-hours chatter as real-time liquidity).
              <br />
              • Attribution is asserted by citation, never tested by removal.
              <br />
              • Conceals that removing source [1] flips the answer!
            </div>
          </div>

          {/* Right Column: Sounding Desk */}
          <div
            style={{
              background: 'var(--bg-chassis)',
              border: '1px solid var(--radar-cyan)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--radar-cyan)' }}>
                SOUNDING RESEARCH WORKBENCH
              </span>
              <span className="track-tag" style={{ color: 'var(--radar-cyan)', borderColor: 'var(--radar-cyan)' }}>
                TRACK 3 BENCHMARK
              </span>
            </div>

            <div style={{ padding: '10px', background: 'var(--amber-tension-dim)', border: '1px solid var(--amber-tension)' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--amber-tension)' }}>
                [!] RESTING ON UNANCHORED GROUND
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Recommendation: Do not leverage. Weekend trap detected.
              </div>
            </div>

            <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-white)', lineHeight: 1.5 }}>
              "Attribution measured strictly by removal: leave-one-out reveals that the entire thesis collapses without <code>macro-analyst</code>. But our deterministic calendar shows it was captured at Sunday 03:00 UTC while NASDAQ was shut!"
            </p>

            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--amber-tension)', borderTop: '1px solid var(--border-tactical)', paddingTop: '8px' }}>
              THE LOAD-BEARING SET (MEASURED BY REMOVAL):
              <br />
              • Load-Bearing: <strong>[ macro-analyst ]</strong> (Clock: SHUT)
              <br />
              • Weekend Trap Exposure: <strong>83%</strong>
              <br />
              • Invalidation Tripwire: Daily close &lt; $128.50 (20-EMA)
            </div>

            <div style={{ marginTop: 'auto', padding: '10px', background: 'var(--phosphor-green-dim)', border: '1px solid var(--phosphor-green)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--phosphor-green)' }}>
              <strong>[+] THE SOUNDING ADVANTAGE:</strong>
              <br />
              • Measures attribution by removal, never claimed by citation.
              <br />
              • Inherited anchor binds trust to the deterministic market clock.
              <br />
              • Fulfills Track 3 delete-test: human trader makes final decision!
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-tactical)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-chassis)' }}>
          <button className="execute-btn" onClick={onClose} style={{ padding: '8px 24px' }}>
            [ ACKNOWLEDGE & CLOSE ]
          </button>
        </div>
      </div>
    </div>
  );
};
