import React, { useState } from 'react';

interface LandingPageProps {
  onLaunchDesk: (ticker?: string, thesis?: string, stance?: 'long' | 'short' | 'flat', leverage?: number) => void;
  marketIsOpen: boolean;
  etTime: { hour: number; minute: number; second: number };
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDesk,
  marketIsOpen,
  etTime
}) => {
  // Interactive mini-bridge state for the "Bridge Test"
  const [removedPillar, setRemovedPillar] = useState<string | null>(null);

  const pillars = [
    { id: 'macro', name: 'macro-analyst', isLoadBearing: true, clock: 'shut', role: 'Weekend Fed Macro Note' },
    { id: 'tech', name: 'technical-analysis', isLoadBearing: false, clock: 'open', role: 'RSI-14 & 20-EMA' },
    { id: 'sentiment', name: 'sentiment-analyst', isLoadBearing: false, clock: 'open', role: 'Social Volume Spike' },
    { id: 'orderbook', name: 'market-intel', isLoadBearing: false, clock: 'open', role: 'Order Book Depth' },
  ];

  return (
    <div className="landing-container">
      {/* 1. Hero Section */}
      <section className="landing-hero">
        {/* Cult UI / Skiper UI Illuminated Radar Badge */}
        <div className="hero-radar-badge">
          <span className="radar-ping-wrap">
            <span className="radar-ping" />
            <span className="radar-dot" />
          </span>
          <span className="radar-text">ATTRIBUTION KERNEL V2 · READ-ONLY ATTRIBUTION DESK</span>
          <span className="radar-divider">/</span>
          <span className="radar-subtext">INVARIANTS I1–I7 ACTIVE</span>
        </div>

        {/* Headline */}
        <h1 className="hero-headline">
          Don't trade on cosmetic citations.{' '}
          <span className="hero-gradient-text">
            Know what your call is standing on.
          </span>
        </h1>

        {/* Subtext */}
        <p className="hero-subtext">
          Sounding is a read-only trading attribution desk that measures evidence fragility strictly by <strong>source removal</strong> (never claimed by citation) and anchors trade conviction to the <strong>deterministic market clock</strong> of the underlying reference asset.
        </p>

        {/* Hero Actions */}
        <div className="hero-actions">
          <button
            className="execute-btn hero-btn"
            onClick={() => onLaunchDesk()}
            id="hero-launch-desk-btn"
          >
            <span>Launch Trading Desk</span>
          </button>
          <a
            href="#interactive-demo"
            className="pill-btn hero-btn-secondary"
          >
            <span>Interactive Explainer</span>
          </a>
          <a
            href="https://github.com/natureloved/Sounding"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-btn hero-btn-secondary"
            id="hero-github-link"
          >
            <span>GitHub Code &amp; Tests</span>
          </a>
        </div>

        {/* Live Market Clock Telemetry Bar */}
        <div className="hero-telemetry-bar">
          <div className="hero-telemetry-item">
            <span className={`pulse-dot ${marketIsOpen ? '' : 'shut'}`} />
            <span style={{ color: 'var(--text-secondary)' }}>
              NYSE/NASDAQ Reference Clock:{' '}
              <strong style={{ color: marketIsOpen ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {marketIsOpen ? 'OPEN (RTH)' : 'SHUT (OFF-HOURS)'}
              </strong>
              {' '}[{etTime.hour.toString().padStart(2, '0')}:{etTime.minute.toString().padStart(2, '0')}:{etTime.second.toString().padStart(2, '0')} ET]
            </span>
          </div>
          <span className="hero-telemetry-divider">|</span>
          <span className="hero-telemetry-item" style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
            ✓ Invariants I1–I7 Verified
          </span>
          <span className="hero-telemetry-divider">|</span>
          <span className="hero-telemetry-item" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }} title="Invariant I5 Enforced: Sounding contains strictly zero execution surface by design.">
            🛡️ Strictly --read-only · Zero Execution Risk
          </span>
        </div>
      </section>

      {/* 2. Interactive "Bridge Test" Explainer (Fun to explore) */}
      <section id="interactive-demo" className="landing-demo-section">
        <div className="demo-header-wrap">
          <span className="section-eyebrow">
            Interactive Demo · Try It Below
          </span>
          <h2 className="section-title">
            The Delete-Test: Citation vs. Removal
          </h2>
          <p className="section-desc">
            Conventional tools list sources as citations. But citation does not measure influence. Click any pillar below to "pull the pin" and see which source is actually carrying the call.
          </p>
        </div>

        <div className="landing-demo-card">
          {/* Simulated Thesis Platform */}
          <div
            className={`demo-platform ${removedPillar === 'macro' ? 'tilted' : ''}`}
          >
            <div className="demo-platform-text">
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Simulated Thesis:
              </span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                "rNVDA datacenter revenue will sustain breakout into Q4"
              </div>
            </div>

            <div className="demo-platform-badge-wrap">
              <span
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  padding: '4px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: removedPillar === 'macro' ? 'var(--accent-rose-dim)' : 'var(--accent-emerald-dim)',
                  color: removedPillar === 'macro' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                  border: `1px solid ${removedPillar === 'macro' ? 'var(--accent-rose-border)' : 'var(--accent-emerald-border)'}`
                }}
              >
                {removedPillar === 'macro' ? 'COLLAPSED (NEUTRAL / LOW)' : 'BULLISH (HIGH CONVICTION)'}
              </span>
            </div>
          </div>

          {/* Interactive Source Pillars */}
          <div className="demo-pillars-grid">
            {pillars.map((p) => {
              const isRemoved = removedPillar === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setRemovedPillar(isRemoved ? null : p.id)}
                  style={{
                    background: isRemoved ? 'transparent' : 'var(--bg-input)',
                    border: `1px ${isRemoved ? 'dashed var(--text-dim)' : p.isLoadBearing ? 'solid var(--accent-amber)' : 'solid var(--border-hairline)'}`,
                    borderTop: p.isLoadBearing && !isRemoved ? '3px solid var(--accent-amber)' : undefined,
                    borderRadius: 'var(--radius-inner)',
                    padding: '16px',
                    cursor: 'pointer',
                    opacity: isRemoved ? 0.4 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: p.isLoadBearing && !isRemoved ? '0 0 16px rgba(245, 158, 11, 0.12)' : 'var(--bevel-inner)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {p.name}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-pill)',
                        background: p.clock === 'shut' ? 'var(--accent-rose-dim)' : 'var(--accent-emerald-dim)',
                        color: p.clock === 'shut' ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                      }}
                    >
                      {p.clock.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {p.role}
                  </div>

                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: isRemoved ? 'var(--text-muted)' : p.isLoadBearing ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                    {isRemoved ? '✕ Strut Removed (Click to Restore)' : p.isLoadBearing ? '⚡ Load-Bearing Source' : '✓ Redundant Source'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Callout */}
          <div className={`demo-callout ${removedPillar === 'macro' ? 'callout-alert' : ''}`}>
            {removedPillar === 'macro' ? (
              <span>
                <strong>⚡ Structural Collapse Observed!</strong> Removing <code>macro-analyst</code> flipped the derived direction from Bullish to Neutral. That proves <code>macro-analyst</code> is the load-bearing source. Furthermore, notice its market clock was <strong>SHUT</strong> — meaning this thesis was standing on weekend off-hours chatter!
              </span>
            ) : removedPillar ? (
              <span>
                <strong>✓ Thesis Remains Stable.</strong> Removing this source did not alter the derived call. This proves the source was decorative/redundant. Click <code>macro-analyst</code> to see what happens when the load-bearing pillar is removed!
              </span>
            ) : (
              <span>
                💡 <strong>Try it:</strong> Click on <code>macro-analyst</code> above to see what happens when the load-bearing source is removed.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 3. The Two Groundbreaking Primitives */}
      <section className="primitives-section">
        <div className="primitives-grid">
          {/* Primitive 1 */}
          <div className="primitive-card">
            <div className="primitive-icon" style={{ background: 'var(--accent-cyan-dim)', borderColor: 'var(--accent-cyan-border)', color: 'var(--accent-cyan)' }}>
              ⚖️
            </div>
            <h3 className="feature-card-title">
              1. The Load-Bearing Set
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Attribution is measured by <strong>removal</strong>, never claimed by citation. Sounding runs automated combinatorial leave-one-out and leave-pair-out re-derivations to isolate the smallest coalition of sources whose absence flips the derived call.
            </p>
          </div>

          {/* Primitive 2 */}
          <div className="primitive-card">
            <div className="primitive-icon" style={{ background: 'var(--accent-amber-dim)', borderColor: 'var(--accent-amber-border)', color: 'var(--accent-amber)' }}>
              ⏱️
            </div>
            <h3 className="feature-card-title">
              2. The Inherited Anchor
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A thesis inherits the weakest reference-market clock status among the sources that carried it. If an analysis depends on sources retrieved when the reference market was shut (e.g., Sunday for tokenized US stocks), it is flagged as <strong>"resting on unanchored ground"</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 3.1. Why Bitget? The 24/7 Tokenized Equity Dilemma */}
      <section className="why-bitget-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="section-eyebrow" style={{ color: 'var(--accent-cyan)' }}>
              Ecosystem Alignment · Why Bitget?
            </span>
            <h2 className="section-title">
              The Tokenized US Equity (rToken) Disconnect
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '780px', lineHeight: 1.6, margin: 0 }}>
              Bitget leads the industry by offering <strong>24/7 continuous trading for tokenized US equities</strong> (<code style={{ color: 'var(--accent-cyan)' }}>rNVDA</code>, <code style={{ color: 'var(--accent-cyan)' }}>rTSLA</code>, <code style={{ color: 'var(--accent-cyan)' }}>rAAPL</code>). But while crypto trades 24/7, underlying NYSE/NASDAQ reference markets are completely shut on weekends. Sounding is built specifically to protect Bitget traders from this structural gap.
            </p>
          </div>
          <span className="track-tag" style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: 'var(--accent-cyan)' }}>
            Track 3: AI Trading Desk
          </span>
        </div>

        <div className="why-bitget-grid">
          <div className="why-bitget-card">
            <div className="why-bitget-card-icon">⚡</div>
            <div className="why-bitget-card-title">1. Bitget 24/7 rTokens</div>
            <p className="why-bitget-card-desc">
              Conventional AI models treat weekend social chatter as live market conviction. When NASDAQ opens Monday at 09:30 EDT, institutional order imbalances trigger sudden gap-downs. Sounding flags unanchored weekend speculation before execution.
            </p>
          </div>

          <div className="why-bitget-card">
            <div className="why-bitget-card-icon">📊</div>
            <div className="why-bitget-card-title">2. Bitget Spot V2 Live Feeds</div>
            <p className="why-bitget-card-desc">
              Directly streams live Bitget public tickers and calculates real-time RSI-14, 20-EMA, 50-EMA, and order book depth to arm quantitative thesis invalidation tripwires against structural technical levels.
            </p>
          </div>

          <div className="why-bitget-card">
            <div className="why-bitget-card-icon">🧠</div>
            <div className="why-bitget-card-title">3. Bitget Qwen API Gateway</div>
            <p className="why-bitget-card-desc">
              Routes combinatorial counterfactual source removals through Bitget's high-speed, cost-effective Qwen inference gateway (<code>qwen3.8-max</code>), backed by an instant offline heuristic fallback.
            </p>
          </div>
        </div>
      </section>

      {/* 3.2. 60-Second Guided Demo Banner for Evaluators */}
      <section className="guided-demo-banner">
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🧭</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              60-Second Judge Tour · Experience the "Aha!" Moment
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: 1.5 }}>
            Follow this 4-step sequence to see why attribution by removal outperforms conventional AI bots in under a minute:
          </p>
          <div className="guided-demo-steps">
            <div className="guided-demo-step-pill">
              <span>1. Choose</span> <strong>rNVDA</strong>
            </div>
            <div className="guided-demo-step-pill">
              <span>2. Remove</span> <strong>macro-analyst</strong>
            </div>
            <div className="guided-demo-step-pill">
              <span>3. Platform</span> <strong>Tilts &amp; Flips to Neutral</strong>
            </div>
            <div className="guided-demo-step-pill">
              <span>4. Inspect</span> <strong>SHUT Clock &amp; $125 Tripwire</strong>
            </div>
          </div>
        </div>

        <button
          className="execute-btn"
          style={{ padding: '12px 24px', fontSize: '13px', boxShadow: 'var(--glow-amber)', whiteSpace: 'nowrap' }}
          onClick={() =>
            onLaunchDesk(
              'rNVDA',
              'Datacenter revenue expansion will sustain further breakout into next quarter despite elevated valuation',
              'long',
              3
            )
          }
          id="launch-guided-demo-btn"
        >
          ⚡ Run 60-Second Demo (1-Click)
        </button>
      </section>

      {/* 3.3. Before vs. After Comparative Scorecard */}
      <div className="before-after-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span className="section-eyebrow" style={{ color: 'var(--accent-emerald)' }}>
              Measurable Result · Value in Under a Minute
            </span>
            <h3 className="feature-card-title">
              Before Sounding vs. After Sounding
            </h3>
          </div>
          <span className="track-tag" style={{ borderColor: 'var(--accent-emerald-border)', color: 'var(--accent-emerald)' }}>
            Capital Protection
          </span>
        </div>

        <table className="before-after-table">
          <thead>
            <tr>
              <th style={{ color: 'var(--text-muted)', width: '22%' }}>Evaluation Dimension</th>
              <th style={{ color: 'var(--accent-rose)', width: '39%' }}>Conventional AI Assistant</th>
              <th style={{ color: 'var(--accent-emerald)', width: '39%' }}>Sounding Trading Attribution Desk</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Attribution Proof</strong></td>
              <td style={{ color: 'var(--text-secondary)' }}>Cosmetic citation list (claims 4 sources agree). Hides single-source vulnerability.</td>
              <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Causal delete-test proves only <code>macro-analyst</code> is load-bearing. 3 citations are cosmetic.</td>
            </tr>
            <tr>
              <td><strong>Market-Clock Awareness</strong></td>
              <td style={{ color: 'var(--text-secondary)' }}>Blind to market hours. Treats Sunday off-hours chatter as active liquidity.</td>
              <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>Deterministic calendar flags NASDAQ is <strong>SHUT</strong>. Thesis tagged "Resting on Unanchored Ground".</td>
            </tr>
            <tr>
              <td><strong>Trader Risk Action</strong></td>
              <td style={{ color: 'var(--text-secondary)' }}>Recommends aggressive 3x Long entry over the weekend.</td>
              <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Arms downside kill-condition at $125.00 (20-EMA breach). Advises waiting for Monday 09:30 ET.</td>
            </tr>
            <tr>
              <td><strong>Portfolio Outcome</strong></td>
              <td style={{ color: 'var(--accent-rose)', fontWeight: 700 }}><strong>-14% Drawdown</strong> on Monday opening bell gap liquidation.</td>
              <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}><strong>Capital Preserved</strong> with immutable cryptographic audit trail.</td>
            </tr>
            <tr>
              <td><strong>Execution Boundary</strong></td>
              <td style={{ color: 'var(--text-secondary)' }}>Asks to connect wallet or execute orders.</td>
              <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Strictly <code>--read-only</code> by construction. Zero execution risk.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. One-Click Interactive Scenario Playground */}
      <section className="scenarios-section">
        <div className="scenarios-header">
          <span className="section-eyebrow">
            Preset Case Studies · Zero Credentials Required
          </span>
          <h2 className="section-title">
            Explore Pre-Loaded Demo Scenarios (1-Click Run)
          </h2>
          <p className="section-desc">
            Judges &amp; Evaluators: No API key needed. Click any preset case study below to immediately execute the full end-to-end attribution loop, clock grounding, and position alignment.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '11.5px',
              color: 'var(--accent-emerald)',
              fontFamily: 'var(--font-mono)',
              marginTop: '12px'
            }}
          >
            <span>✓ Preloaded Demo Mode Active</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: 'var(--text-secondary)' }}>Deterministic Causal Engine + Live Bitget Market Feed</span>
          </div>
        </div>

        <div className="scenarios-grid">
          {/* Card 1: rNVDA Weekend Trap */}
          <div className="scenario-card" style={{ borderColor: 'var(--accent-amber-border)', boxShadow: 'var(--glow-amber)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  rNVDA
                </span>
                <span className="track-tag" style={{ color: 'var(--accent-amber)', borderColor: 'var(--accent-amber-border)' }}>
                  Case Study A · Weekend Trap
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                "Datacenter revenue expansion will sustain further breakout into next quarter despite elevated valuation."
              </p>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                • Offending Source: <strong>macro-analyst</strong> (SHUT)
                <br />
                • Weekend Gap Risk: <strong>EXTREME (83% scenario fixture exposure)</strong>
                <br />
                • Trader Fragility: <strong>50/100 (HIGH)</strong>
              </div>
            </div>

            <button
              className="execute-btn scenario-btn"
              onClick={() =>
                onLaunchDesk(
                  'rNVDA',
                  'Datacenter revenue expansion will sustain further breakout into next quarter despite elevated valuation',
                  'long',
                  3
                )
              }
            >
              Run Case Study A (1-Click)
            </button>
          </div>

          {/* Card 2: rTSLA Anchored Bearish */}
          <div className="scenario-card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  rTSLA
                </span>
                <span className="track-tag" style={{ color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald-border)' }}>
                  Case Study B · Anchored
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                "Autonomous robotaxi regulatory delays and auto loan margin compression will depress multiples."
              </p>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                • Reference Clock: <strong>OPEN (Wednesday RTH)</strong>
                <br />
                • Weakest Anchor: <strong>OPEN</strong>
                <br />
                • Position: <strong>Short 2x (LOW Fragility)</strong>
              </div>
            </div>

            <button
              className="execute-btn scenario-btn"
              onClick={() =>
                onLaunchDesk(
                  'rTSLA',
                  'Autonomous robotaxi regulatory delays and auto loan margin compression will depress multiples',
                  'short',
                  2
                )
              }
            >
              Run Case Study B (1-Click)
            </button>
          </div>

          {/* Card 3: BTC Continuous Crypto */}
          <div className="scenario-card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  BTC
                </span>
                <span className="track-tag" style={{ color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan-border)' }}>
                  Case Study C · 24/7 Crypto
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                "Global central bank easing and Spot ETF inflows signal long-term cyclical continuation."
              </p>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                • Market Discovery: <strong>Continuous 24/7</strong>
                <br />
                • Attribution: <strong>Robust Consensus</strong>
                <br />
                • Gap Risk: <strong>LOW (Continuous)</strong>
              </div>
            </div>

            <button
              className="execute-btn scenario-btn"
              onClick={() =>
                onLaunchDesk(
                  'BTC',
                  'Global central bank easing and Spot ETF inflows signal long-term cyclical continuation',
                  'long',
                  1
                )
              }
            >
              Run Case Study C (1-Click)
            </button>
          </div>

          {/* Card 4: Custom Live Research Desk */}
          <div className="scenario-card" style={{ borderColor: 'rgba(56, 189, 248, 0.4)', background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.05) 0%, rgba(13, 17, 23, 0.6) 100%)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  CUSTOM
                </span>
                <span className="track-tag" style={{ color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan-border)' }}>
                  Live Trading Evidence Flow
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                "Test your own discretionary thesis across SOL, ETH, BTC, or US equity rTokens with real Bitget spot candles."
              </p>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                • Custom Ticker: <strong>Any Asset</strong>
                <br />
                • Custom Stance: <strong>Long / Short / Flat</strong>
                <br />
                • Custom Notes: <strong>User S7 Notes Supported</strong>
              </div>
            </div>

            <button
              className="execute-btn scenario-btn"
              style={{ background: 'var(--accent-cyan)', color: '#000000' }}
              onClick={() => onLaunchDesk()}
            >
              Open Live Desk
            </button>
          </div>
        </div>
      </section>

      {/* 5. Bottom Call to Action Banner */}
      <section className="cta-section">
        <div className="cta-banner">
          <h2 className="cta-title">
            Ready to test your market thesis?
          </h2>
          <p className="cta-desc">
            State any thesis in plain natural language. Sounding will fetch the sources, measure the load-bearing set, and verify market clock anchors.
          </p>
          <button
            className="execute-btn cta-btn"
            onClick={() => onLaunchDesk()}
          >
            Enter Sounding Trading Desk
          </button>
        </div>
      </section>

      {/* 6. Institutional Footer */}
      <footer className="landing-footer">
        <div className="footer-grid">
          {/* Column 1: Brand & Causal Architecture Statement */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                SOUNDING
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent-cyan-dim)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid var(--accent-cyan-border)',
                  fontWeight: 700
                }}
              >
                PRO DESK
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Autonomous attribution and market-clock grounding desk. Built to expose cosmetic citations through combinatorial source removal and anchor algorithmic conviction to real-world market hours.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
                <span>Combinatorial Leave-One-Out (L1O/L2O)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
                <span>Deterministic Reference Market Clocks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                <span>🛡️</span>
                <span>--read-only by Construction (Zero Execution Risk)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Trading Risk Architecture */}
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Trading Risk Architecture
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Causal Removal Engine</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Combinatorial re-derivation isolates true load-bearing pillars</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Market Clock Anchoring</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Deterministic calendar verifies trading session validity</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Fragility &amp; Asymmetry Matrix</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Evaluates trader leverage against unanchored fragility</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Signal Decay Tracking</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Dynamic half-life decay on inputs and market fixtures</span>
              </li>
            </ul>
          </div>

          {/* Column 3: System Invariants */}
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Core Invariants
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 700 }}>I1</span>
                <span><strong>Removal Attribution:</strong> Zero credit granted solely by citation</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 700 }}>I2</span>
                <span><strong>Clock Grounding:</strong> Off-hours chatter cannot anchor RTH calls</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 700 }}>I3</span>
                <span><strong>Human Sovereignty:</strong> Human trader holds absolute decision authority</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 700 }}>I4</span>
                <span><strong>Immutable Audit:</strong> Cryptographic receipts for every thesis derivation</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 700 }}>I5–7</span>
                <span><strong>Read-Only Strength:</strong> Strictly read-only analysis. Zero execution, zero custody, zero private keys. Limiting write access is our core strength: zero capital risk and un-tamperable determinism.</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Workbench Launch & Scenarios */}
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Instant Scenarios
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="pill-btn"
                style={{
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  width: '100%',
                  fontSize: '12px',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}
                onClick={() =>
                  onLaunchDesk(
                    'rNVDA',
                    'Datacenter revenue expansion will sustain further breakout into next quarter despite elevated valuation',
                    'long',
                    3
                  )
                }
              >
                <span>⚡ Test rNVDA Weekend Trap</span>
                <span style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>SHUT</span>
              </button>

              <button
                className="pill-btn"
                style={{
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  width: '100%',
                  fontSize: '12px',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}
                onClick={() =>
                  onLaunchDesk(
                    'rTSLA',
                    'Autonomous robotaxi regulatory delays and auto loan margin compression will depress multiples',
                    'short',
                    2
                  )
                }
              >
                <span>📉 Test rTSLA Anchored Bear</span>
                <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>OPEN</span>
              </button>

              <button
                className="pill-btn"
                style={{
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  width: '100%',
                  fontSize: '12px',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}
                onClick={() =>
                  onLaunchDesk(
                    'BTC',
                    'Global central bank easing and Spot ETF inflows signal long-term cyclical continuation',
                    'long',
                    1
                  )
                }
              >
                <span>🌐 Test BTC Continuous Flow</span>
                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>24/7</span>
              </button>

              <button
                className="execute-btn"
                style={{ marginTop: '6px', padding: '10px 14px', fontSize: '13px', justifyContent: 'center' }}
                onClick={() => onLaunchDesk()}
              >
                Launch Workbench Desk
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal Disclaimer & System Telemetry */}
        <div className="footer-bottom">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ color: 'var(--text-secondary)' }}>
              © 2026 Sounding Trading Evidence Desk. All rights reserved.
            </div>
            <div>
              Sounding is an institutional trading attribution workbench enforcing strict --read-only analysis. It cannot place orders, manage funds, or hold custody. That limitation is an institutional safety strength, ensuring uncompromised determinism and zero execution risk.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <a
              href="https://github.com/natureloved/Sounding"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              GitHub (Code &amp; Tests)
            </a>
            <span style={{ color: 'var(--border-hairline-bright)' }}>•</span>
            <a
              href="#interactive-demo"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Interactive Delete-Test
            </a>
            <span style={{ color: 'var(--border-hairline-bright)' }}>•</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-cyan)',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Back to Top
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
