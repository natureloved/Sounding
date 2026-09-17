/**
 * Core Type Definitions & Schemas
 * Sounding: Autonomous Attribution & Market Clock Grounding Research Desk
 */

export type SourceKind = 'signal_skill' | 'market_feed' | 'user_doc';

export type AnchorVerdict = 'open' | 'shut' | 'unknown';

export type Direction = 'bullish' | 'bearish' | 'neutral';

export type ConfidenceBand = 'high' | 'medium' | 'low';

export interface UserPosition {
  stance: 'long' | 'short' | 'flat';
  entryPrice?: number;
  leverage?: number;
  capitalAtRisk?: number;
}

export interface PositionAlignment {
  aligns: boolean;
  fragility_score: number; // 0-100 (0 = solid alignment, 100 = critical danger)
  risk_flag: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  summary: string;
  recommendation: string;
}

export interface Contradiction {
  source_a: string;
  source_b: string;
  divergence_summary: string;
  severity: 'high' | 'medium';
}

export interface LiveIndicatorData {
  lastPrice: number;
  change24h: number;
  rsi: number;
  ema20: number;
  ema50: number;
  macd: number;
  signal: number;
  volumeRatio: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export interface WeekendTrapReport {
  isRToken: boolean;
  isWeekendOrShut: boolean;
  unanchored_exposure_pct: number; // 0-100%
  gap_risk_level: 'LOW' | 'ELEVATED' | 'EXTREME';
  underlying_exchange: string;
  next_open_utc: string;
  warning_title: string;
  warning_description: string;
}

export interface Tripwire {
  id: string;
  category: 'PRICE' | 'ORDER_FLOW' | 'CATALYST';
  trigger_condition: string;
  invalidation_consequence: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
}

export interface DataDecayInfo {
  source_name: string;
  kind: SourceKind;
  half_life_hours: number;
  captured_at: string;
  remaining_freshness_pct: number; // 0-100%
  is_stale: boolean;
}

export interface Thesis {
  id: string;
  text: string;
  ticker: string;
  stated_at: string;
  user_position?: UserPosition;
}

export interface Source {
  id: string;
  kind: SourceKind;
  name: string;
}

export interface Snapshot {
  id: string;
  source_id: string;
  source_name: string;
  kind: SourceKind;
  content: string;
  retrieved_at: string;
  anchor_verdict: AnchorVerdict;
}

export interface Conclusion {
  id: string;
  thesis_id: string;
  snapshot_set: string[]; // snapshot IDs
  direction: Direction;
  confidence_band: ConfidenceBand;
  rationale: string;
  cited_sources: string[];
  created_at: string;
}

export interface TestedRemoval {
  removed_sources: string[]; // source names or IDs removed
  direction: Direction;
  confidence_band: ConfidenceBand;
  changed: boolean;
  reason: string;
}

export interface Attribution {
  id: string;
  conclusion_id: string;
  load_bearing_set: string[]; // names of sources whose removal alters the conclusion
  inherited_anchor: AnchorVerdict; // weakest anchor among load_bearing_set members only
  robust: boolean;
  noise_figure: number; // stability variance over N re-derivations
  tested_removals: TestedRemoval[];
  offending_sources?: string[]; // members of load_bearing_set that are shut
  created_at: string;
}

export interface Run {
  id: string;
  thesis_id: string;
  model_id: string;
  temperature: number;
  seed?: string;
  started_at: string;
}

export interface SourceCoverageStat {
  source_name: string;
  kind: SourceKind;
  total_captured: number;
  times_load_bearing: number;
  load_bearing_ratio: number;
  last_anchor_verdict: AnchorVerdict;
}

export interface WorkbenchSettings {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  mcpServerUrl?: string;
}
