# SOUNDING // AI Research Workbench & Attribution Trading Desk

> **Bitget AI Base Camp Hackathon, Season 2 — Track 3 · AI Trading Desk (AI Research Workbench)**  
> **Core Value**: A read-only research desk that tells a trader what their call is *actually standing on*. Human traders make final decisions.  
> **Stack**: TypeScript, Node 24 (native `node:sqlite`), React 18, Vite 6.  
> **UI Archetype**: Industrial Brutalism & Tactical Telemetry (powered by `taste-skill`). Strict zero border-radius, monospace tabular telemetry, CRT scanline substrate, and mechanical precision.

---

## §1 · What It Is

Sounding provides two fundamental capabilities that no conventional financial AI workbench delivers:

1. **The Load-Bearing Set**: The workbench measures attribution strictly by removal (leave-one-out and leave-pair-out re-derivation), isolating the smallest coalition of sources whose absence alters the conclusion (direction flip or confidence band shift). Attribution is **measured by removal**, never claimed by citation.
2. **The Inherited Anchor**: The conclusion's trust status is bound to the weakest deterministic market-clock status among the sources that carried it. If a view stands on a source captured while the reference market was shut (e.g. Sunday 03:00 UTC for a tokenized US equity like `rNVDA`), the conclusion is badged as **"resting on unanchored ground"**, naming the offending source.

### The Track 3 Delete-Test
> *Remove Bitget-Signal's five research skills. Is there still anything to attribute?*  
> There is not. The five Bitget skills (`macro-analyst`, `market-intel`, `news-briefing`, `sentiment-analyst`, `technical-analysis`) constitute the attributable source set. Removing them leaves the workbench with no foundation to stand on.

---

## §2 · Four High-Impact Differentiators

Sounding introduces four decisive features designed specifically to distinguish it from generic chatbot wrappers:

1. **Causal Foundation Visualizer (Interactive Stress-Test)**: An interactive structural schematic where traders can click any evidence strut to "pull the pin". If a load-bearing source is removed, the thesis platform instantly tilts (-8°) into structural collapse, giving the trader immediate mechanical intuition for their call's fragility.
2. **Weekend Trap & Monday Gap Exposure Engine**: Specifically addresses Bitget's 24/7 tokenized US equity assets (`rNVDA`, `rTSLA`, `rAAPL`). Quantifies weekend exposure when crypto markets trade while NASDAQ/NYSE is shut, calculating gap probabilities and warning traders before opening bell imbalances hit.
3. **Actionable Invalidation Tripwires & Intelligence Decay**: Generates explicit price, order-flow, and catalyst kill-conditions (e.g., `Daily close < 20-EMA ($128.50)`). Tracks intelligence half-lives (order flow expires in 4 hours, macro in 14 days) with visual telemetry meters.
4. **Side-by-Side Benchmark (Generic AI vs. Sounding)**: In-app modal contrasting conventional AI outputs (94% unanchored conviction, decorative citations, concealed single-point failure) against Sounding's verifiable proof of attribution and inherited clock anchors.

---

## §3 · Architecture & File Tree

```
sounding/
├── src/
│   ├── main.ts                         # CLI entry; asserts --read-only before execution
│   ├── types.ts                        # Core TypeScript definitions & schemas
│   ├── loop/
│   │   ├── capture.ts                  # Source capture -> Snapshot with timestamp + clock verdict
│   │   ├── derive.ts                   # Conclusion derivation (Bitget Qwen API / offline evaluator)
│   │   ├── coalition.ts                # Leave-one-out & leave-pair-out combinatorial removal engine
│   │   ├── inherit.ts                  # inherited_anchor = weakest clock verdict over load_bearing_set
│   │   ├── alignment.ts                # Trader position stance & Asymmetric Fragility Index (0-100)
│   │   ├── contradiction.ts            # Cross-source divergence detector (technical vs news)
│   │   ├── weekend-trap.ts             # rToken off-hours risk & Monday opening bell gap analyzer
│   │   ├── tripwires.ts                # Actionable quantitative thesis invalidation triggers
│   │   ├── decay.ts                    # Source intelligence half-life decay calculations
│   │   └── stability.ts                # Model stability noise figure calculation
│   ├── sources/
│   │   ├── live-indicators.ts          # Live Bitget OHLCV fetcher (RSI-14, 20-EMA, 50-EMA, MACD)
│   │   ├── bitget-market.ts            # Bitget market quote adapter
│   │   ├── signal-skills.ts            # Synthesis over 5 Bitget-Signal skills
│   │   └── user-doc.ts                 # Analyst memo / transcript ingestion (S7)
│   ├── calendar/
│   │   └── anchor.ts                   # Deterministic US equity market hours & holiday calendar
│   ├── store/
│   │   ├── schema.ts                   # Runtime assertions for Invariants I1–I7
│   │   └── db.ts                       # SQLite persistence (Node native node:sqlite)
│   ├── ui/
│   │   ├── app.tsx                     # Tactical telemetry cockpit & conversational thesis desk
│   │   ├── FoundationVisualizer.tsx    # Interactive causal bridge stress-test visualizer
│   │   ├── AttributionPanel.tsx        # Load-bearing coalition & permutation verification log
│   │   ├── TripwireCard.tsx            # Quantitative kill-conditions & freshness meters
│   │   ├── CoveragePanel.tsx           # Historical source ranking by load-bearing frequency
│   │   ├── BenchmarkComparisonModal.tsx# Side-by-side Generic AI vs. Sounding benchmark
│   │   ├── SettingsModal.tsx           # Bitget Qwen API gateway & model configuration
│   │   ├── AttributionReceipt.ts       # Cryptographic Markdown attribution receipt generator
│   │   └── index.css                   # Industrial Brutalism & Tactical Telemetry design tokens
│   └── metrics/
│       └── emit.ts                     # Formats Official 6-Part Project Description & D1 X Post
├── fixtures/                           # Frozen snapshots for zero-network deterministic testing
├── spike/
│   └── a1-stability.ts                 # Day-1 Go/No-Go stability harness (10/10 PASS)
└── tests/
    ├── calendar.test.ts                # Market clock & holiday schedule tests (10 tests)
    ├── coalition.test.ts               # Combinatorial removal attribution tests (9 tests)
    ├── invariants.test.ts              # Runtime verification of Invariants I1–I7 (16 tests)
    ├── indicators.test.ts              # Live Bitget indicator calculation tests (8 tests)
    ├── alignment.test.ts               # Position stance & fragility index tests (9 tests)
    ├── weekend-trap.test.ts            # Weekend trap & Monday gap tests (6 tests)
    ├── tripwires.test.ts               # Invalidation tripwires & decay tests (10 tests)
    └── run-all.ts                      # Master test runner (68/68 tests passing)
```

---

## §4 · Quickstart

```bash
# 1. Install dependencies (Node >= 20 required)
npm install

# 2. Run Comprehensive Production Test Suite (68/68 Passing)
npm test

# 3. Run Day-1 Stability Spike (A1 Go/No-Go verification: 10/10 PASS)
npm run spike

# 4. Run CLI Question-to-Insight Flow (Under 90s offline demo)
npm run start -- demo
# Test refusal without read-only flag:
npx tsx src/main.ts               # Refuses with exit code 1 (Invariant I5)
npx tsx src/main.ts --read-only   # Executes successfully

# 5. Emit Official Submission Project Description (6 Parts) & Compliant X Post
npm run metrics

# 6. Launch Web Research Workbench (Tactical HUD)
npm run dev
# Open http://localhost:3000/
```

---

## §5 · Runtime Invariants (I1 – I7)

| Invariant | Description | Enforced Location |
|---|---|---|
| **I1** | A conclusion is never rendered without its Attribution attachment. | `src/store/schema.ts:assertI1` |
| **I2** | `inherited_anchor` is computed strictly from `load_bearing_set` only — never from all sources. | `src/store/schema.ts:assertI2` |
| **I3** | Re-derivation over frozen snapshot set is deterministic; model instability is reported via `noise_figure`. | `src/store/schema.ts:assertI3` |
| **I4** | A source with `anchor_verdict: unknown` cannot be load-bearing. | `src/store/schema.ts:assertI4` |
| **I5** | Process refuses to start without `--read-only` or if Agent Hub write surface is reachable. | `src/store/schema.ts:assertI5` |
| **I6** | Removing a source can never improve the inherited anchor (Monotonicity property). | `src/store/schema.ts:assertI6` |
| **I7** | `tested_removals` is persisted for every attribution to enable deterministic re-runs. | `src/store/schema.ts:assertI7` |

---

## §6 · Stability Spike Results

Executed on `rNVDA` frozen snapshot fixture across 10 iterations at `temperature = 0`:
- **Modal Load-Bearing Set**: `[ macro-analyst ]` (10/10 runs, 100% stability)
- **Inherited Anchor**: `SHUT` (captured Sunday 03:00 UTC)
- **Offending Source**: `macro-analyst`
- **Verdict**: **`PASS`** (Threshold: $\ge 7/10$)

---

## §7 · Safety & Non-Goals

- **Read-Only by Construction**: Sounding contains zero order placement, wallet integration, or transaction surfaces. It cannot move capital; the maximum failure mode is an imperfect analysis, never an unauthorized trade.
- **Spend Bounding**: `SOUNDING_MAX_REMOVALS` limits coalition permutations (default 12) to bound model token consumption.
- **Kill Switch**: `SOUNDING_KILL=1` immediately halts all model derivation invocations.
