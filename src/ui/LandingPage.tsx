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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* 1. Hero Section */}
      <section style={{ padding: '60px 24px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#ffffff', maxWidth: '900px', margin: '0 auto 20px' }}>
          Don't trade on cosmetic citations.{' '}
          <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Know what your call is standing on.
          </span>
        </h1>

        {/* Subtext */}
        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: '760px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Sounding is a read-only research desk that measures attribution strictly by <strong>source removal</strong> (never claimed by citation) and binds thesis trust to the <strong>deterministic market clock</strong> of the underlying reference asset.
        </p>

        {/* Hero Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button
            className="execute-btn"
            style={{ padding: '12px 32px', fontSize: '15px', borderRadius: '10px' }}
            onClick={() => onLaunchDesk()}
            id="hero-launch-desk-btn"
          >
            <span>Launch Research Desk</span>
            <span style={{ fontSize: '16px' }}>→</span>
          </button>
          <a
            href="#interactive-demo"
            className="pill-btn"
            style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '10px' }}
          >
            <span>Interactive Explainer ↓</span>
          </a>
        </div>

        {/* Live Market Clock Telemetry Bar */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline-bright)', borderRadius: 'var(--radius-pill)', padding: '8px 20px', boxShadow: 'var(--bevel-card)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`pulse-dot ${marketIsOpen ? '' : 'shut'}`} />
            <span style={{ color: 'var(--text-secondary)' }}>
              NYSE / NASDAQ Reference Clock:{' '}
              <strong style={{ color: marketIsOpen ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {marketIsOpen ? 'OPEN (09:30-16:00 ET)' : 'SHUT (OFF-HOURS)'}
              </strong>
              {' '}[{etTime.hour.toString().padStart(2, '0')}:{etTime.minute.toString().padStart(2, '0')}:{etTime.second.toString().padStart(2, '0')} ET]
            </span>
          </div>
          <span style={{ color: 'var(--border-hairline-bright)' }}>|</span>
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
            ✓ Invariants I1–I7 Verified
          </span>
          <span style={{ color: 'var(--border-hairline-bright)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>
            🛡️ Read-Only Guard Active
          </span>
        </div>
      </section>

      {/* 2. Interactive "Bridge Test" Explainer (Fun to explore) */}
      <section id="interactive-demo" style={{ padding: '50px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interactive Demo · Try It Below
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            The Delete-Test: Citation vs. Removal
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '8px auto 0' }}>
            Conventional tools list sources as citations. But citation does not measure influence. Click any pillar below to "pull the pin" and see which source is actually carrying the call.
          </p>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-hairline-bright)', borderRadius: 'var(--radius-card)', padding: '28px', boxShadow: 'var(--bevel-card)' }}>
          {/* Simulated Thesis Platform */}
          <div
            style={{
              background: removedPillar === 'macro' ? 'rgba(244, 63, 94, 0.1)' : 'linear-gradient(135deg, #131926, #0d121c)',
              border: `1px solid ${removedPillar === 'macro' ? 'var(--accent-rose)' : 'var(--border-hairline-bright)'}`,
              borderRadius: 'var(--radius-inner)',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              transform: removedPillar === 'macro' ? 'rotate(-6deg)' : 'none',
              transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease',
              transformOrigin: '80% center'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Simulated Thesis:
              </span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                "rNVDA datacenter revenue will sustain breakout into Q4"
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
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
          <div style={{ marginTop: '20px', padding: '14px 18px', background: removedPillar === 'macro' ? 'var(--accent-rose-dim)' : 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-btn)', border: `1px solid ${removedPillar === 'macro' ? 'var(--accent-rose-border)' : 'var(--border-hairline)'}`, fontSize: '12.5px', color: removedPillar === 'macro' ? '#fecdd3' : 'var(--text-secondary)', lineHeight: 1.5 }}>
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
      <section style={{ padding: '40px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Primitive 1 */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-card)', padding: '28px', boxShadow: 'var(--bevel-card)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-cyan-dim)', border: '1px solid var(--accent-cyan-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
              ⚖️
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              1. The Load-Bearing Set
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Attribution is measured by <strong>removal</strong>, never claimed by citation. Sounding runs automated combinatorial leave-one-out and leave-pair-out re-derivations to isolate the smallest coalition of sources whose absence flips the derived call.
            </p>
          </div>

          {/* Primitive 2 */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-card)', padding: '28px', boxShadow: 'var(--bevel-card)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'var(--accent-amber)', marginBottom: '16px' }}>
              ⏱️
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              2. The Inherited Anchor
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A thesis inherits the weakest reference-market clock status among the sources that carried it. If an analysis depends on sources retrieved when the reference market was shut (e.g., Sunday for tokenized US stocks), it is flagged as <strong>"resting on unanchored ground"</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 4. One-Click Interactive Scenario Playground */}
      <section style={{ padding: '50px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Instant Testing · 1-Click Launchers
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            Explore Pre-Configured Scenarios
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Click any scenario card below to launch directly into the live research workbench with that thesis preloaded.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          {/* Card 1: rNVDA Weekend Trap */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--accent-amber-border)',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--glow-amber)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  rNVDA
                </span>
                <span className="track-tag" style={{ color: 'var(--accent-amber)', borderColor: 'var(--accent-amber-border)' }}>
                  Weekend Unanchored Call
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                "Datacenter revenue expansion will sustain further breakout into next quarter despite elevated valuation."
              </p>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                • Offending Source: <strong>macro-analyst</strong> (SHUT)
                <br />
                • Weekend Gap Risk: <strong>EXTREME (83%)</strong>
                <br />
                • Trader Fragility: <strong>50/100 (HIGH)</strong>
              </div>
            </div>

            <button
              className="execute-btn"
              style={{ marginTop: '20px', width: '100%', justifyContent: 'center', padding: '10px' }}
              onClick={() =>
                onLaunchDesk(
                  'rNVDA',
                  'Datacenter revenue expansion will sustain further breakout into next quarter despite elevated valuation',
                  'long',
                  3
                )
              }
            >
              Test rNVDA Scenario →
            </button>
          </div>

          {/* Card 2: rTSLA Anchored Bearish */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline-bright)',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--bevel-card)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  rTSLA
                </span>
                <span className="track-tag" style={{ color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald-border)' }}>
                  Regular Hours Anchored
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
              className="execute-btn"
              style={{ marginTop: '20px', width: '100%', justifyContent: 'center', padding: '10px' }}
              onClick={() =>
                onLaunchDesk(
                  'rTSLA',
                  'Autonomous robotaxi regulatory delays and auto loan margin compression will depress multiples',
                  'short',
                  2
                )
              }
            >
              Test rTSLA Scenario →
            </button>
          </div>

          {/* Card 3: BTC Continuous Crypto */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline-bright)',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--bevel-card)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  BTC
                </span>
                <span className="track-tag" style={{ color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan-border)' }}>
                  Continuous 24/7 Crypto
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
              className="execute-btn"
              style={{ marginTop: '20px', width: '100%', justifyContent: 'center', padding: '10px' }}
              onClick={() =>
                onLaunchDesk(
                  'BTC',
                  'Global central bank easing and Spot ETF inflows signal long-term cyclical continuation',
                  'long',
                  1
                )
              }
            >
              Test BTC Scenario →
            </button>
          </div>
        </div>
      </section>

      {/* 5. Bottom Call to Action Banner */}
      <section style={{ padding: '60px 24px', maxWidth: '900px', margin: '0 auto 40px', width: '100%', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(180deg, rgba(14, 20, 31, 0.9), rgba(10, 14, 22, 0.95))', border: '1px solid var(--accent-cyan-border)', borderRadius: '20px', padding: '40px 32px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
            Ready to test your market thesis?
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            State any thesis in plain natural language. Sounding will fetch the sources, measure the load-bearing set, and verify market clock anchors.
          </p>
          <button
            className="execute-btn"
            style={{ padding: '14px 36px', fontSize: '16px', borderRadius: '10px', margin: '0 auto' }}
            onClick={() => onLaunchDesk()}
          >
            Enter Sounding Trading Desk →
          </button>
        </div>
      </section>

      {/* 6. Institutional Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-hairline)',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, #05070a 100%)',
          padding: '60px 32px 36px',
          marginTop: 'auto'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '48px'
          }}
        >
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
                <span>Zero Execution Risk (Read-Only Guard)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Research Architecture */}
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Research Architecture
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
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 700 }}>I5–7</span>
                <span><strong>Read-Only Safety:</strong> Strictly zero execution, zero custody, zero private keys</span>
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
                Launch Workbench Desk →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal Disclaimer & System Telemetry */}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '11.5px',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ color: 'var(--text-secondary)' }}>
              © 2026 Sounding Research Desk. All rights reserved.
            </div>
            <div>
              Sounding is an advisory research tool enforcing read-only analysis. It does not execute trades, manage funds, or hold custody.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
