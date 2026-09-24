import React, { useEffect } from 'react';

interface CaseStudyModalProps {
  onClose: () => void;
  onLoadScenario: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ onClose, onLoadScenario }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content case-study-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
                Case Study: Weekend Trap &amp; Counterfactual Attribution (rNVDA)
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                Evidence Attribution &amp; Timing Verification · Tokenized US Equity (rNVDA)
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} id="close-case-study-btn">
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '24px' }}>
          {/* Executive Summary Banner */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-inner)',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              🎯 Objective: Exposing Cosmetic Citations &amp; Grounding Unanchored Conviction
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              This scenario demonstrates Sounding's complete end-to-end research flow on a real-world market dilemma: a trader tempted by a multi-citation bullish research brief on tokenized NVIDIA during a weekend off-hours session.
            </p>
          </div>

          {/* Stepper Grid */}
          <div className="case-study-stepper">
            {/* Step 1 */}
            <div className="case-study-step-card">
              <div className="step-num-badge">STEP 1</div>
              <div className="step-body">
                <div className="step-title">Trader Position Stance &amp; Timing Dilemma</div>
                <p className="step-desc">
                  <strong>Trader Stance:</strong> 3x Leveraged Long on <code>rNVDA</code> ($132.80).
                  <br />
                  <strong>Stated Thesis:</strong> <em>"Datacenter revenue expansion will sustain further breakout into next quarter despite elevated valuation."</em>
                  <br />
                  <strong>Decision Under Test:</strong> Should the trader execute this 3x long position over the weekend or wait for regular trading hours price discovery?
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="case-study-step-card">
              <div className="step-num-badge">STEP 2</div>
              <div className="step-body">
                <div className="step-title">Perception Ingestion (6 Sources Captured)</div>
                <p className="step-desc">
                  Sounding fetches 6 multi-modal intelligence sources across live Bitget public feeds and signal skills:
                  <br />
                  • <strong>bitget-market:</strong> Live price $132.80, RSI-14: 64.2, 20-EMA: $128.50.
                  <br />
                  • <strong>macro-analyst:</strong> US fiscal policy &amp; AI CAPEX report.
                  <br />
                  • <strong>technical-analysis:</strong> Breakout continuation setup above 20-EMA.
                  <br />
                  • <strong>sentiment-analyst:</strong> Retail social volume score +74% bullish.
                  <br />
                  • <strong>news-briefing:</strong> Hyperscaler cloud server buildout announcements.
                  <br />
                  • <strong>market-intel:</strong> Order book ask/bid cluster distribution.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="case-study-step-card">
              <div className="step-num-badge">STEP 3</div>
              <div className="step-body">
                <div className="step-title">Baseline Derivation (The Naive Trap)</div>
                <p className="step-desc">
                  <strong>Initial Derived Call:</strong> <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>BULLISH</span> (HIGH Conviction).
                  <br />
                  <strong>Cited Sources:</strong> 4 sources cited (macro, technical, sentiment, news).
                  <br />
                  <span style={{ color: 'var(--accent-rose)' }}>⚠️ The Conventional AI Pitfall:</span> Standard AI bots and summarizers stop here, saying <em>"4 out of 6 sources confirm bullish momentum—proceed with long."</em> The trader is led into false conviction.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="case-study-step-card highlight">
              <div className="step-num-badge highlight">STEP 4</div>
              <div className="step-body">
                <div className="step-title">Causal Delete-Test (Attribution by Removal)</div>
                <p className="step-desc">
                  Sounding executes 12 counterfactual combinatorial removals:
                  <br />
                  • Without <code>news-briefing</code> ➔ Call remains <span style={{ color: 'var(--accent-emerald)' }}>BULLISH</span> (Redundant).
                  <br />
                  • Without <code>technical-analysis</code> ➔ Call remains <span style={{ color: 'var(--accent-emerald)' }}>BULLISH</span> (Redundant).
                  <br />
                  • Without <code>sentiment-analyst</code> ➔ Call remains <span style={{ color: 'var(--accent-emerald)' }}>BULLISH</span> (Redundant).
                  <br />
                  • Without <code>macro-analyst</code> ➔ Call confidence <span style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>COLLAPSES FROM HIGH TO MEDIUM ⚡</span>.
                  <br />
                  <strong>Empirical Proof:</strong> The <code>load_bearing_set</code> is <code>['macro-analyst']</code>. The entire high-conviction bullish thesis was an illusion of consensus resting on a single pillar!
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="case-study-step-card highlight">
              <div className="step-num-badge highlight">STEP 5</div>
              <div className="step-body">
                <div className="step-title">Market Clock Grounding (The Inherited Anchor)</div>
                <p className="step-desc">
                  Sounding inspects the deterministic market calendar for the reference asset (NASDAQ: NVDA):
                  <br />
                  • Reference market is <strong>SHUT</strong> (Sunday 03:00 UTC).
                  <br />
                  • The load-bearing source (<code>macro-analyst</code>) was produced during off-hours with zero reference market price discovery.
                  <br />
                  • Result: <code>inherited_anchor = SHUT</code>. Thesis is immediately tagged as <strong>"Resting on Unanchored Ground"</strong>.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="case-study-step-card">
              <div className="step-num-badge">STEP 6</div>
              <div className="step-body">
                <div className="step-title">Actionable Trader Verdict &amp; Risk Mitigation</div>
                <p className="step-desc">
                  <strong>Weekend Gap Risk:</strong> <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>EXTREME (83% Scenario A fixture exposure)</span>.
                  <br />
                  <strong>Trader Fragility:</strong> <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>50/100 (HIGH)</span>.
                  <br />
                  <strong>Tripwire Trigger:</strong> Downside invalidation armed at $128.50 (20-EMA breach).
                  <br />
                  <strong>Actionable Decision:</strong> The trader cancels the 3x weekend long order and waits for Monday NYSE 09:30 EDT opening price discovery.
                  <br />
                  <strong>Concrete Outcome:</strong> Prevents Monday gap-down liquidation, saving an estimated 14% drawdown on capital.
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: '1px solid var(--border-hairline)', paddingTop: '16px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
              🛡️ Strictly --read-only: Zero execution risk, trader retains 100% order sovereignty.
            </span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="pill-btn" onClick={onClose}>
                Close Case Study
              </button>
              <button
                className="execute-btn"
                style={{ padding: '8px 24px' }}
                onClick={() => {
                  onClose();
                  onLoadScenario();
                }}
                id="load-rnvda-case-study-btn"
              >
                ⚡ Load rNVDA Scenario into Workbench →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
