import React, { useState, useEffect } from 'react';
import {
  Thesis,
  Snapshot,
  Conclusion,
  Attribution,
  SourceCoverageStat,
  UserPosition,
  PositionAlignment,
  Contradiction,
  LiveIndicatorData,
  WeekendTrapReport,
  Tripwire,
  DataDecayInfo,
  WorkbenchSettings
} from '../types.js';
import { captureSourceSet } from '../loop/capture.js';
import { computeCoalitionRemoval } from '../loop/coalition.js';
import { computeInheritedAnchor } from '../loop/inherit.js';
import { evaluatePositionAlignment } from '../loop/alignment.js';
import { detectContradictions } from '../loop/contradiction.js';
import { evaluateWeekendTrap } from '../loop/weekend-trap.js';
import { computeThesisTripwires } from '../loop/tripwires.js';
import { calculateSourceDecay } from '../loop/decay.js';
import { fetchBitgetLiveIndicators } from '../sources/live-indicators.js';
import { isUSMarketOpen, getEasternTimeComponents } from '../calendar/anchor.js';
import { db } from '../store/db.js';

import { LandingPage } from './LandingPage.js';
import { AttributionPanel } from './AttributionPanel.js';
import { CoveragePanel } from './CoveragePanel.js';
import { FoundationVisualizer } from './FoundationVisualizer.js';
import { TripwireCard } from './TripwireCard.js';
import { BenchmarkComparisonModal } from './BenchmarkComparisonModal.js';
import { SettingsModal } from './SettingsModal.js';
import { generateAttributionReceipt } from './AttributionReceipt.js';
import { generateProjectDescription, generateCompliantXPost } from '../metrics/emit.js';

export const App: React.FC = () => {
  // Navigation view mode: 'landing' (Homepage / Explainer) vs 'desk' (Interactive Workbench)
  const [viewMode, setViewMode] = useState<'landing' | 'desk'>('landing');

  const [ticker, setTicker] = useState('rNVDA');
  const [thesisText, setThesisText] = useState(
    'Datacenter revenue expansion will sustain further breakout into next quarter despite elevated valuation'
  );
  const [positionStance, setPositionStance] = useState<'long' | 'short' | 'flat'>('long');
  const [leverage, setLeverage] = useState<number>(3);
  const [userDocText, setUserDocText] = useState('');
  const [showUserDocInput, setShowUserDocInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isRerunning, setIsRerunning] = useState(false);
  const [rerunCount, setRerunCount] = useState(0);
  const [receiptCopied, setReceiptCopied] = useState(false);

  const [currentThesis, setCurrentThesis] = useState<Thesis | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [conclusion, setConclusion] = useState<Conclusion | null>(null);
  const [attribution, setAttribution] = useState<Attribution | null>(null);
  const [alignment, setAlignment] = useState<PositionAlignment | null>(null);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [liveIndicators, setLiveIndicators] = useState<LiveIndicatorData | null>(null);
  const [weekendTrap, setWeekendTrap] = useState<WeekendTrapReport | null>(null);
  const [tripwires, setTripwires] = useState<Tripwire[]>([]);
  const [decayList, setDecayList] = useState<DataDecayInfo[]>([]);
  const [coverageStats, setCoverageStats] = useState<SourceCoverageStat[]>([]);

  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState<WorkbenchSettings>(() => {
    try {
      const saved = localStorage.getItem('sounding_settings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Clock status
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const marketIsOpen = isUSMarketOpen(currentTime);
  const et = getEasternTimeComponents(currentTime);

  const refreshCoverage = () => {
    const stats = db.getCoverageStats();
    setCoverageStats(stats);
  };

  // Run initial analysis in background
  useEffect(() => {
    handleRunAnalysis(ticker, thesisText, positionStance, leverage);
  }, []);

  const handleSaveSettings = (newSettings: WorkbenchSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('sounding_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  const handleRunAnalysis = async (
    targetTicker: string,
    targetThesis: string,
    stance: 'long' | 'short' | 'flat' = positionStance,
    lev: number = leverage,
    customDocs: string[] = []
  ) => {
    setIsLoading(true);
    setRerunCount(0);
    setReceiptCopied(false);

    try {
      const statedAt = new Date().toISOString();
      const userPos: UserPosition = {
        stance,
        leverage: lev
      };

      const thesis: Thesis = {
        id: `thesis-${Date.now()}`,
        text: targetThesis,
        ticker: targetTicker,
        stated_at: statedAt,
        user_position: userPos
      };
      db.insertThesis(thesis);
      setCurrentThesis(thesis);

      // 1. Fetch live indicators & quotes
      const indicators = await fetchBitgetLiveIndicators(targetTicker);
      setLiveIndicators(indicators);

      // 2. Capture source set
      const docs = customDocs.length > 0 ? customDocs : userDocText.trim() ? [userDocText.trim()] : [];
      const snaps = await captureSourceSet({
        ticker: targetTicker,
        userDocs: docs,
        forceFixture: false
      });
      setSnapshots(snaps);

      // 3. Coalition Removal Engine
      const coalition = await computeCoalitionRemoval(targetThesis, targetTicker, snaps, { maxRemovals: 12 });

      // 4. Inherited Anchor Computation
      const anchorResult = computeInheritedAnchor(coalition.load_bearing_set, snaps);

      const concId = `conc-${Date.now()}`;
      const conc: Conclusion = {
        id: concId,
        thesis_id: thesis.id,
        snapshot_set: snaps.map((s) => s.id),
        direction: coalition.baseline.direction,
        confidence_band: coalition.baseline.confidence_band,
        rationale: coalition.baseline.rationale,
        cited_sources: coalition.baseline.cited_sources,
        created_at: new Date().toISOString()
      };
      db.insertConclusion(conc);

      const attr: Attribution = {
        id: `attr-${Date.now()}`,
        conclusion_id: conc.id,
        load_bearing_set: coalition.load_bearing_set,
        inherited_anchor: anchorResult.inherited_anchor,
        robust: coalition.robust,
        noise_figure: 0.0,
        tested_removals: coalition.tested_removals,
        offending_sources: anchorResult.offending_sources,
        created_at: new Date().toISOString()
      };
      db.insertAttribution(attr);

      // 5. Evaluate Personalized Position Alignment
      const alignResult = evaluatePositionAlignment(userPos, conc, attr);
      setAlignment(alignResult);

      // 6. Cross-Source Contradiction Detection
      const contras = detectContradictions(snaps);
      setContradictions(contras);

      // 7. Weekend Trap & Monday Gap Exposure
      const trap = evaluateWeekendTrap(targetTicker, snaps, attr, currentTime);
      setWeekendTrap(trap);

      // 8. Actionable Invalidation Tripwires & Data Decay
      const trips = computeThesisTripwires(targetTicker, conc, attr, indicators);
      setTripwires(trips);

      const decays = calculateSourceDecay(snaps, currentTime);
      setDecayList(decays);

      setConclusion(conc);
      setAttribution(attr);
      refreshCoverage();
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRerun = async () => {
    if (!currentThesis || snapshots.length === 0 || !conclusion) return;
    setIsRerunning(true);
    try {
      const coalition = await computeCoalitionRemoval(currentThesis.text, currentThesis.ticker, snapshots, {
        maxRemovals: 12
      });
      const anchorResult = computeInheritedAnchor(coalition.load_bearing_set, snapshots);

      const updatedAttr: Attribution = {
        id: `attr-rerun-${Date.now()}`,
        conclusion_id: conclusion.id,
        load_bearing_set: coalition.load_bearing_set,
        inherited_anchor: anchorResult.inherited_anchor,
        robust: coalition.robust,
        noise_figure: 0.0,
        tested_removals: coalition.tested_removals,
        offending_sources: anchorResult.offending_sources,
        created_at: new Date().toISOString()
      };
      db.insertAttribution(updatedAttr);
      setAttribution(updatedAttr);

      if (currentThesis.user_position) {
        const alignResult = evaluatePositionAlignment(currentThesis.user_position, conclusion, updatedAttr);
        setAlignment(alignResult);
      }

      setRerunCount((c) => c + 1);
      refreshCoverage();
    } finally {
      setIsRerunning(false);
    }
  };

  const handleSelectPreset = (t: string, text: string, stance: 'long' | 'short' | 'flat', lev: number) => {
    setTicker(t);
    setThesisText(text);
    setPositionStance(stance);
    setLeverage(lev);
    handleRunAnalysis(t, text, stance, lev);
  };

  const handleLaunchFromLanding = (
    targetTicker?: string,
    targetThesis?: string,
    stance?: 'long' | 'short' | 'flat',
    lev?: number
  ) => {
    if (targetTicker && targetThesis) {
      const s = stance || 'long';
      const l = lev || 2;
      setTicker(targetTicker);
      setThesisText(targetThesis);
      setPositionStance(s);
      setLeverage(l);
      handleRunAnalysis(targetTicker, targetThesis, s, l);
    }
    setViewMode('desk');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyReceipt = () => {
    if (!currentThesis || !conclusion || !attribution) return;
    const receipt = generateAttributionReceipt(currentThesis, conclusion, attribution, snapshots, alignment || undefined);
    navigator.clipboard.writeText(receipt);
    setReceiptCopied(true);
    setTimeout(() => setReceiptCopied(false), 3000);
  };

  return (
    <div className="desk-layout">
      {/* Top Header Navigation */}
      <header className="desk-header">
        <div className="logo-group" style={{ cursor: 'pointer' }} onClick={() => setViewMode('landing')}>
          <div className="logo-icon">S</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">SOUNDING</span>
            </div>
          </div>
        </div>

        {/* Center View Mode Switcher (Overview vs Desk) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: 'var(--radius-btn)', border: '1px solid var(--border-hairline)' }}>
          <button
            className="pill-btn"
            style={{
              padding: '5px 14px',
              fontSize: '12px',
              border: 'none',
              background: viewMode === 'landing' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: viewMode === 'landing' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: viewMode === 'landing' ? 700 : 500
            }}
            onClick={() => setViewMode('landing')}
          >
            Overview &amp; Tour
          </button>
          <button
            className="pill-btn"
            style={{
              padding: '5px 14px',
              fontSize: '12px',
              border: 'none',
              background: viewMode === 'desk' ? 'var(--accent-cyan-dim)' : 'transparent',
              color: viewMode === 'desk' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: viewMode === 'desk' ? 700 : 500
            }}
            onClick={() => setViewMode('desk')}
            id="nav-desk-tab-btn"
          >
            Live Research Desk
          </button>
        </div>

        {/* Right Status Controls */}
        <div className="header-status-bar">
          <button
            className="pill-btn"
            style={{ borderColor: 'var(--accent-cyan-border)', color: 'var(--accent-cyan)', fontWeight: 600 }}
            onClick={() => setShowBenchmarkModal(true)}
            id="open-benchmark-btn"
          >
            ⚔️ Benchmark: Sounding vs Generic AI
          </button>

          <div className="status-indicator">
            <span className={`pulse-dot ${marketIsOpen ? '' : 'shut'}`} />
            <span>
              NYSE Clock: {marketIsOpen ? 'OPEN' : 'SHUT'} [
              {et.hour.toString().padStart(2, '0')}:{et.minute.toString().padStart(2, '0')}:
              {currentTime.getSeconds().toString().padStart(2, '0')} ET]
            </span>
          </div>

          <div className="safety-pill">
            <span>🛡️</span>
            <span>--read-only Active</span>
          </div>

          <button
            className="pill-btn"
            onClick={() => setShowSettingsModal(true)}
            id="settings-btn"
          >
            <span>⚙️</span>
            <span>{settings.apiKey ? 'Live API Key Set' : 'Gateway Settings'}</span>
          </button>
        </div>
      </header>

      {/* Conditionally Render: Landing Page vs Live Research Desk */}
      {viewMode === 'landing' ? (
        <LandingPage
          onLaunchDesk={handleLaunchFromLanding}
          marketIsOpen={marketIsOpen}
          etTime={{ hour: et.hour, minute: et.minute, second: currentTime.getSeconds() }}
        />
      ) : (
        /* Main Desk Layout */
        <main className="main-content">
          {/* Left Column: Thesis & Attribution Desk */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Conversational Thesis Box with Position Stance */}
            <div className="glass-panel thesis-box">
              <div className="panel-header">
                <span className="panel-title">
                  <span>💬 State Thesis &amp; Personalized Position</span>
                </span>
                <span className="track-tag">
                  Track 3 Research Workbench
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRunAnalysis(ticker, thesisText, positionStance, leverage);
                }}
              >
                {/* Row 1: Ticker & Thesis Input */}
                <div className="form-row">
                  <input
                    type="text"
                    className="ticker-input"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="TICKER"
                    id="ticker-input"
                  />
                  <input
                    type="text"
                    className="thesis-input"
                    value={thesisText}
                    onChange={(e) => setThesisText(e.target.value)}
                    placeholder="State your investment thesis in natural language..."
                    id="thesis-input"
                  />
                  <button type="submit" className="execute-btn" disabled={isLoading} id="run-analysis-btn">
                    {isLoading ? 'Synthesizing...' : 'Sound Desk'}
                  </button>
                </div>

                {/* Row 2: Personalized Position Stance & Leverage */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Your Position Stance:
                    </span>
                    <button
                      type="button"
                      className="pill-btn"
                      style={{
                        borderColor: positionStance === 'long' ? 'var(--accent-emerald)' : 'var(--border-hairline)',
                        background: positionStance === 'long' ? 'var(--accent-emerald-dim)' : 'transparent',
                        color: positionStance === 'long' ? 'var(--accent-emerald)' : 'inherit',
                        fontWeight: 600
                      }}
                      onClick={() => setPositionStance('long')}
                    >
                      ▲ Long
                    </button>
                    <button
                      type="button"
                      className="pill-btn"
                      style={{
                        borderColor: positionStance === 'short' ? 'var(--accent-rose)' : 'var(--border-hairline)',
                        background: positionStance === 'short' ? 'var(--accent-rose-dim)' : 'transparent',
                        color: positionStance === 'short' ? 'var(--accent-rose)' : 'inherit',
                        fontWeight: 600
                      }}
                      onClick={() => setPositionStance('short')}
                    >
                      ▼ Short
                    </button>
                    <button
                      type="button"
                      className="pill-btn"
                      style={{
                        borderColor: positionStance === 'flat' ? 'var(--accent-cyan)' : 'var(--border-hairline)',
                        background: positionStance === 'flat' ? 'var(--accent-cyan-dim)' : 'transparent',
                        color: positionStance === 'flat' ? 'var(--accent-cyan)' : 'inherit',
                        fontWeight: 600
                      }}
                      onClick={() => setPositionStance('flat')}
                    >
                      ● Flat
                    </button>
                  </div>

                  {positionStance !== 'flat' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Leverage:
                      </span>
                      {[1, 2, 3, 5, 10].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          className="pill-btn"
                          style={{
                            borderColor: leverage === lvl ? 'var(--accent-amber)' : 'var(--border-hairline)',
                            background: leverage === lvl ? 'var(--accent-amber-dim)' : 'transparent',
                            color: leverage === lvl ? 'var(--accent-amber)' : 'inherit',
                            fontWeight: 700
                          }}
                          onClick={() => setLeverage(lvl)}
                        >
                          {lvl}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              {/* Quick Presets */}
              <div className="preset-pills">
                <span className="preset-label">Scenarios:</span>
                <button
                  className="pill-btn"
                  onClick={() =>
                    handleSelectPreset(
                      'rNVDA',
                      'Datacenter revenue expansion will sustain further breakout into next quarter despite elevated valuation',
                      'long',
                      3
                    )
                  }
                >
                  ⚡ rNVDA (Weekend Unanchored Call · High Fragility)
                </button>
                <button
                  className="pill-btn"
                  onClick={() =>
                    handleSelectPreset(
                      'rTSLA',
                      'Autonomous robotaxi regulatory delays and auto loan margin compression will depress multiples',
                      'short',
                      2
                    )
                  }
                >
                  🛡️ rTSLA (Regular Hours Anchored Bearish)
                </button>
                <button
                  className="pill-btn"
                  onClick={() =>
                    handleSelectPreset(
                      'BTC',
                      'Global central bank easing and Spot ETF inflows signal long-term cyclical continuation',
                      'long',
                      1
                    )
                  }
                >
                  🌐 BTC (Continuous 24/7 Crypto)
                </button>

                <button
                  className="pill-btn"
                  onClick={() => setShowUserDocInput(!showUserDocInput)}
                  style={{ marginLeft: 'auto', borderColor: 'var(--border-hairline-bright)' }}
                >
                  {showUserDocInput ? '▲ Hide S7 Custom Doc' : '▼ Add S7 Custom Doc'}
                </button>
              </div>

              {showUserDocInput && (
                <div style={{ marginTop: '14px' }}>
                  <textarea
                    className="thesis-input"
                    style={{ width: '100%', height: '80px', resize: 'vertical' }}
                    placeholder="Paste custom analyst memo, earnings transcript, or research notes (ingested as S7 user_doc)..."
                    value={userDocText}
                    onChange={(e) => setUserDocText(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Live Market Indicators Ribbon */}
            {liveIndicators && (
              <div className="telemetry-ribbon">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    BITGET LIVE FEED:
                  </span>
                  <span className="telemetry-price">
                    ${liveIndicators.lastPrice.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: liveIndicators.change24h >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                    }}
                  >
                    {liveIndicators.change24h >= 0 ? '+' : ''}
                    {liveIndicators.change24h}%
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
                  <span className="telemetry-stat">
                    RSI-14: <strong style={{ color: 'var(--accent-cyan)' }}>{liveIndicators.rsi}</strong>
                  </span>
                  <span className="telemetry-stat">
                    EMA-20: <strong>${liveIndicators.ema20}</strong>
                  </span>
                  <span className="telemetry-stat">
                    EMA-50: <strong>${liveIndicators.ema50}</strong>
                  </span>
                  <span className="telemetry-stat">
                    MACD: <strong style={{ color: liveIndicators.macd >= liveIndicators.signal ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>{liveIndicators.macd}</strong>
                  </span>
                  <span
                    className="anchor-pill"
                    style={{
                      background: liveIndicators.trend === 'bullish' ? 'var(--accent-emerald-dim)' : 'var(--accent-rose-dim)',
                      color: liveIndicators.trend === 'bullish' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                      border: `1px solid ${liveIndicators.trend === 'bullish' ? 'var(--accent-emerald-border)' : 'var(--accent-rose-border)'}`
                    }}
                  >
                    TREND: {liveIndicators.trend.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Weekend Trap / Monday Gap Exposure Alert */}
            {weekendTrap && weekendTrap.isRToken && weekendTrap.gap_risk_level !== 'LOW' && (
              <div
                style={{
                  background: weekendTrap.gap_risk_level === 'EXTREME' ? 'var(--accent-rose-dim)' : 'var(--accent-amber-dim)',
                  border: `1px solid ${weekendTrap.gap_risk_level === 'EXTREME' ? 'var(--accent-rose-border)' : 'var(--accent-amber-border)'}`,
                  borderRadius: 'var(--radius-card)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  boxShadow: weekendTrap.gap_risk_level === 'EXTREME' ? 'var(--glow-rose)' : 'var(--glow-amber)'
                }}
              >
                <div style={{ fontSize: '22px', lineHeight: 1 }}>🚨</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: weekendTrap.gap_risk_level === 'EXTREME' ? 'var(--accent-rose)' : 'var(--accent-amber)', marginBottom: '4px' }}>
                    {weekendTrap.warning_title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {weekendTrap.warning_description}
                  </div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Underlying: {weekendTrap.underlying_exchange} · Real Opening Bell: {weekendTrap.next_open_utc}
                  </div>
                </div>
              </div>
            )}

            {/* Contradiction Alert */}
            {contradictions.length > 0 && (
              <div
                style={{
                  background: 'var(--accent-rose-dim)',
                  border: '1px solid var(--accent-rose-border)',
                  borderRadius: 'var(--radius-card)',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', fontWeight: 700, fontSize: '13px' }}>
                  <span>⚡</span>
                  <span>Cross-Source Contradictions Detected ({contradictions.length})</span>
                </div>
                {contradictions.map((c, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: '#fca5a5' }}>
                    • <strong>[{c.source_a}]</strong> vs <strong>[{c.source_b}]</strong>: {c.divergence_summary}
                  </div>
                ))}
              </div>
            )}

            {/* Personalized Position Alignment Card */}
            {alignment && currentThesis?.user_position?.stance !== 'flat' && (
              <div
                style={{
                  background:
                    alignment.risk_flag === 'CRITICAL'
                      ? 'var(--accent-rose-dim)'
                      : alignment.risk_flag === 'HIGH'
                      ? 'var(--accent-amber-dim)'
                      : 'var(--accent-emerald-dim)',
                  border: `1px solid ${
                    alignment.risk_flag === 'CRITICAL'
                      ? 'var(--accent-rose-border)'
                      : alignment.risk_flag === 'HIGH'
                      ? 'var(--accent-amber-border)'
                      : 'var(--accent-emerald-border)'
                  }`,
                  borderRadius: 'var(--radius-card)',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow:
                    alignment.risk_flag === 'CRITICAL'
                      ? 'var(--glow-rose)'
                      : alignment.risk_flag === 'HIGH'
                      ? 'var(--glow-amber)'
                      : 'var(--glow-emerald)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    🎯 Personalized Position Alignment
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-pill)',
                      background:
                        alignment.risk_flag === 'CRITICAL'
                          ? 'var(--accent-rose)'
                          : alignment.risk_flag === 'HIGH'
                          ? 'var(--accent-amber)'
                          : 'var(--accent-emerald)',
                      color: '#ffffff'
                    }}
                  >
                    Fragility: {alignment.fragility_score}/100 [{alignment.risk_flag}]
                  </span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {alignment.summary}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--text-muted)' }}>Trader Action:</strong> {alignment.recommendation}
                </p>
              </div>
            )}

            {/* Interactive Foundation Pillar Visualizer */}
            {conclusion && attribution && (
              <FoundationVisualizer
                snapshots={snapshots}
                attribution={attribution}
                conclusion={conclusion}
              />
            )}

            {/* Actionable Thesis Invalidation Tripwires & Freshness */}
            {conclusion && attribution && tripwires.length > 0 && (
              <TripwireCard tripwires={tripwires} decayList={decayList} />
            )}

            {/* Captured Sources Tray */}
            <div className="glass-panel">
              <div className="panel-header">
                <span className="panel-title">
                  <span>📡 Captured Source Snapshots ({snapshots.length})</span>
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  S1..S5 Bitget-Signal · S6 Market Feed · S7 User Doc
                </span>
              </div>

              <div className="snapshots-grid">
                {snapshots.map((snap) => {
                  const isLB = attribution?.load_bearing_set.includes(snap.source_name);
                  const isShut = snap.anchor_verdict === 'shut';
                  return (
                    <div key={snap.id} className={`snapshot-card ${isLB ? 'is-load-bearing' : ''}`} title={snap.content}>
                      <div className="snapshot-card-top">
                        <span className="source-badge">
                          {isLB ? '★ ' : ''}
                          {snap.source_name}
                        </span>
                        <span className={`anchor-pill ${snap.anchor_verdict}`}>
                          {snap.anchor_verdict} {isShut ? '⚠️' : '✓'}
                        </span>
                      </div>
                      <p className="snapshot-content">{snap.content}</p>
                      <div className="snapshot-meta">
                        Captured: {new Date(snap.retrieved_at).toUTCString().replace('GMT', 'UTC')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Derived Conclusion & Attribution Panel */}
            {conclusion && attribution && (
              <div className="glass-panel" style={{ borderTop: '2px solid var(--accent-cyan)' }}>
                <div className="panel-header">
                  <span className="panel-title">
                    <span>🎯 Derived Conclusion &amp; Attribution Proof</span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="pill-btn"
                      style={{ borderColor: receiptCopied ? 'var(--accent-emerald)' : 'var(--border-hairline-bright)' }}
                      onClick={handleCopyReceipt}
                      id="copy-receipt-btn"
                    >
                      {receiptCopied ? '✓ Receipt Copied!' : '📋 Export Attribution Receipt'}
                    </button>
                    <span className="track-tag">Weakest Anchor: {attribution.inherited_anchor.toUpperCase()}</span>
                  </div>
                </div>

                <AttributionPanel
                  conclusion={conclusion}
                  attribution={attribution}
                  snapshots={snapshots}
                  onRerun={handleRerun}
                  isRerunning={isRerunning}
                  rerunCount={rerunCount}
                />
              </div>
            )}
          </div>

          {/* Right Column: Source Influence Ranking */}
          <CoveragePanel stats={coverageStats} onOpenProjectDoc={() => setShowProjectModal(true)} />
        </main>
      )}

      {/* Benchmark Modal */}
      {showBenchmarkModal && (
        <BenchmarkComparisonModal onClose={() => setShowBenchmarkModal(false)} />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Official Project Description Modal */}
      {showProjectModal && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
                Official Track 3 Project Description &amp; Compliant X Post
              </span>
              <button className="close-btn" onClick={() => setShowProjectModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {generateProjectDescription()}
              {'\n\n--- COMPLIANT D1 X POST ---\n'}
              {generateCompliantXPost()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
