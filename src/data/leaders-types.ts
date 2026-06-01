/**
 * The Plumb Line — Malaysia Leader Accountability Index
 * --------------------------------------------------------------
 * Shared type definitions for:
 *   1. the methodology config   (src/data/leaderboard/methodology.json)
 *   2. a leader profile + raw scored metrics  (src/data/leaders/{slug}.json)
 *   3. the computed, reader-facing leaderboard (public/leaderboard.json)
 *   4. the bias-audit report     (public/leaderboard-audit.json)
 *
 * Design rule: the methodology config is the SINGLE source of truth for
 * dimensions, weights, role classes, normalization, and aggregation. A leader
 * file carries RAW metric observations + citations only; it never carries
 * weights or computed scores. scripts/build-leaderboard.mjs is the only place
 * raw metrics become scores, so symmetry is structural, not a promise.
 *
 * Firewall (docs/research/malaysia-political-simulation-engine.md §8.3):
 * every metric value is a recorded public fact or a standard index computed on
 * recorded public facts. No value may come from the simulation engine.
 * --------------------------------------------------------------
 */

/* ==================== primitives ==================== */

export type RoleClassId =
  | 'head-of-government'
  | 'cabinet-minister'
  | 'opposition-frontbench'
  | 'backbencher'
  | 'sub-national-executive';

export type LayerId = 'A' | 'B' | 'C';

export type LayerKind = 'objective' | 'rubric' | 'index';

/** Factual status vocabulary for A5 — never an editorial verdict on guilt. */
export type RecordStatus =
  | 'declared'
  | 'not-declared'
  | 'charged'
  | 'convicted'
  | 'acquitted'
  | 'discharged'
  | 'ongoing'
  | 'none-on-record';

/* ==================== citation ==================== */

/**
 * Every raw metric value MUST carry a citation. The validator and the
 * audit's source-coverage gate both key off the presence of this object.
 */
export interface SourceCitation {
  /** Primary-source document title. */
  title: string;
  /** Issuing body, e.g. 'Parliament of Malaysia', 'Auditor-General'. */
  publisher: string;
  /** ISO date of the source document or event. */
  date: string;
  /** Page, section, Hansard column, or table reference. */
  locator?: string;
  /** Direct URL when the primary source is online. */
  url?: string;
  /**
   * Source tier mirroring the sim-engine ontology:
   *   1 = primary document, 2 = authoritative secondary,
   *   3 = mainstream press citing a primary source, 4 = commentary (never scored).
   */
  tier: 1 | 2 | 3 | 4;
}

/* ==================== methodology config ==================== */

export interface MethodologyLayer {
  id: LayerId;
  name: string;
  kind: LayerKind;
  weight: number; // layer weights sum to 1.0
  summary: string;
  groundedIn: string[]; // citation ids
}

export interface MethodologyDimension {
  id: string; // 'A1' … 'C3'
  layer: LayerId;
  name: string;
  weightWithinLayer: number; // within each layer, dimension weights sum to 1.0
  description: string;
  method: string;
  sourceType: string[];
  appliesToRoles: RoleClassId[];
  higherIsBetter: boolean;
  /** Anchored descriptors for Layer B ordinal scales (0/2/4). */
  ordinalAnchors?: Record<string, string>;
  guardrail?: string;
  neutralityNote?: string;
}

export interface MethodologyRoleClass {
  id: RoleClassId;
  name: string;
  note: string;
}

export interface MethodologyCitation {
  id: string;
  title: string;
  authors: string;
  year: number;
  publisher: string;
  url: string;
  usedFor: string;
}

export interface MethodologyAuditGate {
  id: string;
  name: string;
  test: string;
  fails: string;
  threshold?: number;
  perturbation?: number;
}

export interface Methodology {
  version: string;
  status: 'framework' | 'live';
  name: string;
  subtitle: string;
  tagline: string;
  lastReviewed: string;
  scale: { min: number; max: number; decimals: number };
  firewall: { rule: string; reference: string; enforcedBy: string };
  layers: Record<LayerId, MethodologyLayer>;
  dimensions: MethodologyDimension[];
  roleClasses: MethodologyRoleClass[];
  comparability: { rule: string; periodBasedScoring: string; benchmarks: string };
  normalization: {
    method: string;
    fallback: string;
    pool: string;
    missingData: string;
    missingDataRationale: string;
    reference: string;
  };
  aggregation: {
    withinLayer: string;
    crossLayer: string;
    crossLayerParam: number;
    crossLayerRationale: string;
    reference: string[];
  };
  audit: { summary: string; gates: MethodologyAuditGate[] };
  exclusions: { id: string; name: string; rationale: string }[];
  citations: MethodologyCitation[];
}

/* ==================== leader profile + raw metrics ==================== */

/**
 * A single raw observation for one dimension in one period. Carries the
 * recorded value and its citation, NOT a normalized score. Build-time
 * normalization and weighting turn this into a ScoredDimension.
 */
export interface RawMetric {
  dimension: string; // dimension id, e.g. 'A1'
  /**
   * The recorded value. Numeric for countable metrics (bills, attendance %),
   * a RecordStatus for A5, or an ordinal 0-4 for Layer B.
   * `null` means N/A — not on record (denominator shrinks; never imputed).
   */
  value: number | RecordStatus | null;
  /** For Layer B ordinal scores: one per coder, to compute Krippendorff's alpha. */
  coderScores?: number[];
  /** Human-readable justification, required whenever value !== null. */
  justification?: string;
  /** Required whenever value !== null. The source-coverage gate enforces this. */
  citation?: SourceCitation;
  /** Set true only for an explicit, cited N/A (not-applicable to this role). */
  notApplicable?: boolean;
}

export interface LeaderPeriod {
  /** ISO date the period starts. */
  from: string;
  /** ISO date the period ends, or null for current. */
  to: string | null;
  role: RoleClassId;
  office: string; // e.g. 'Minister of Transport'
  metrics: RawMetric[];
}

export interface Leader {
  slug: string; // url-safe, matches filename
  name: string;
  /** true = international calibration anchor, not a Malaysian subject. */
  benchmark: boolean;
  /** ISO country code; 'MY' for Malaysian leaders. */
  country: string;
  /** Party/coalition affiliation — used ONLY by the partisan-signal audit gate, never scored. */
  affiliation: string;
  /** Whether this is a historical/legacy record (e.g. a former office-holder). */
  legacy?: boolean;
  published: boolean;
  sourceDate: string; // ISO date raw data last verified
  periods: LeaderPeriod[];
  /** Connected issue IDs (populated via the fact graph). */
  relatedIssues?: string[];
}

/* ==================== computed leaderboard (reader-facing) ==================== */

export interface ScoredDimension {
  dimension: string; // dimension id
  layer: LayerId;
  name: string;
  /** Normalized 0-100, or null when N/A. */
  score: number | null;
  /** Fraction of this leader's applicable dimensions with a recorded value. */
  covered: boolean;
}

export interface ScoredLayer {
  layer: LayerId;
  name: string;
  score: number | null; // weighted 0-100 across applicable dimensions
  dimensions: ScoredDimension[];
}

export interface LeaderboardEntry {
  slug: string;
  name: string;
  benchmark: boolean;
  country: string;
  affiliation: string;
  comparabilityClass: RoleClassId;
  /** Composite 0-100 WITH the editorial layer (B). */
  composite: number;
  /** Composite 0-100 WITHOUT the editorial layer — the objective-only view. */
  compositeObjectiveOnly: number;
  /** Rank uncertainty interval from the sensitivity analysis [best, worst]. */
  rankRange: [number, number];
  /** Point rank by composite, for display alongside the range. */
  rank: number;
  /** Per-leader data completeness, 0-100. */
  coverage: number;
  layers: ScoredLayer[];
  relatedIssues: string[];
}

export interface Leaderboard {
  methodologyVersion: string;
  status: 'framework' | 'live';
  generatedAt: string;
  /** True only when every audit gate passed; gates the Bias-Audited badge. */
  biasAudited: boolean;
  entries: LeaderboardEntry[];
  benchmarks: LeaderboardEntry[];
}

/* ==================== audit report ==================== */

export interface AuditGateResult {
  id: string;
  name: string;
  passed: boolean;
  detail: string;
  value?: number;
  threshold?: number;
}

export interface AuditReport {
  methodologyVersion: string;
  generatedAt: string;
  passed: boolean; // AND of all gate results
  gates: AuditGateResult[];
  /** Subjects audited; 0 in framework mode (M0). */
  subjectCount: number;
}

/* ==================== helpers ==================== */

/** Layer accent color tokens, mirroring tokens.css score palette. */
export const LAYER_COLORS: Record<LayerId, string> = {
  A: 'var(--score-partial)', // objective record — blue
  B: 'var(--score-medium)', // editorial panel — amber
  C: 'var(--card-view-color)', // composite index — violet
};

/** Score → tier label, mirroring VerdictBar.scoreLabel for visual consistency. */
export function scoreTier(score: number | null): 'strong' | 'solid' | 'mixed' | 'weak' | 'na' {
  if (score === null) return 'na';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'solid';
  if (score >= 40) return 'mixed';
  return 'weak';
}
