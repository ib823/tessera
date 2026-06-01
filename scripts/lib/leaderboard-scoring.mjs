/**
 * The Plumb Line — scoring math (shared by build + audit)
 * ----------------------------------------------------------------
 * Pure functions implementing the methodology config's normalization and
 * aggregation. No I/O, no randomness (deterministic builds). Every choice
 * here is published in src/data/leaderboard/methodology.json and
 * docs/research/leader-accountability-index.md.
 */

/**
 * Factual-status → integrity scalar (0..1) for dimension A5.
 * Records STATUS only; this mapping is published and applied identically to
 * all subjects. An unresolved matter is neutral-low, not a finding of guilt.
 * Can be overridden by methodology.statusScalars when present (source of truth).
 */
export const DEFAULT_STATUS_SCALAR = {
  declared: 1.0,
  'none-on-record': 1.0,
  acquitted: 1.0,
  discharged: 0.85,
  ongoing: 0.6,
  charged: 0.5,
  'not-declared': 0.25,
  convicted: 0.0,
};

/** Clamp to [0,1]. */
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/**
 * Convert a raw metric value to a 0..1 raw score BEFORE peer normalization.
 *  - Layer B ordinal 0..4 → /4
 *  - A5 status string → status scalar
 *  - numeric (counts, rates) → returned as-is; normalized later against peers
 * Returns null for N/A.
 */
export function rawScore(metric, layer, statusScalars = DEFAULT_STATUS_SCALAR) {
  if (metric == null) return null;
  const v = metric.value;
  if (v == null || metric.notApplicable) return null;
  if (layer === 'B' && typeof v === 'number') return clamp01(v / 4);
  if (typeof v === 'string') {
    const s = statusScalars[v];
    return s == null ? null : clamp01(s);
  }
  if (typeof v === 'number') return v; // normalized against peers downstream
  return null;
}

/**
 * Min-max normalize a numeric series into [0,100] within its peer pool.
 * Rank-based fallback when the pool has fewer than `minPool` defined values
 * (OECD/JRC: min-max is unstable on tiny samples). Already-0..1 values
 * (Layer B, A5) still get peer-normalized so a leader's score is relative to
 * the applicable peer set, exactly like LES normalizes to chamber mean.
 */
export function normalizeWithinPool(values, { minPool = 5, higherIsBetter = true } = {}) {
  const defined = values.filter((v) => v != null);
  if (defined.length === 0) return values.map(() => null);

  if (defined.length < minPool) {
    // Rank-based: assign evenly spaced 0..100 by rank within the pool.
    const sorted = [...defined].sort((a, b) => (higherIsBetter ? a - b : b - a));
    const denom = Math.max(1, sorted.length - 1);
    return values.map((v) => {
      if (v == null) return null;
      const rank = sorted.indexOf(v);
      return (rank / denom) * 100;
    });
  }

  const min = Math.min(...defined);
  const max = Math.max(...defined);
  if (max === min) return values.map((v) => (v == null ? null : 50)); // no spread
  return values.map((v) => {
    if (v == null) return null;
    const t = (v - min) / (max - min);
    return (higherIsBetter ? t : 1 - t) * 100;
  });
}

/** Weighted arithmetic mean over defined (non-null) entries; reweights to sum 1. */
export function weightedArithmeticMean(scores, weights) {
  let sw = 0;
  let acc = 0;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] == null) continue;
    acc += scores[i] * weights[i];
    sw += weights[i];
  }
  return sw === 0 ? null : acc / sw;
}

/** Weighted geometric mean over defined entries (the weakest-link half). */
export function weightedGeometricMean(scores, weights) {
  let sw = 0;
  let acc = 0;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] == null) continue;
    // guard log(0): floor at a small epsilon so a single 0 doesn't annihilate
    const s = Math.max(scores[i], 0.5);
    acc += weights[i] * Math.log(s);
    sw += weights[i];
  }
  return sw === 0 ? null : Math.exp(acc / sw);
}

/**
 * Cross-layer aggregation: halfway between weighted arithmetic and weighted
 * geometric mean (V-Dem electoral-democracy form). Allows partial
 * compensation between layers but punishes a catastrophic single-layer
 * failure — strong legislative output cannot fully buy back an integrity
 * collapse. `param` in [0,1]: 1 = pure arithmetic, 0 = pure geometric.
 */
export function weakestLinkAggregate(scores, weights, param = 0.5) {
  const am = weightedArithmeticMean(scores, weights);
  const gm = weightedGeometricMean(scores, weights);
  if (am == null || gm == null) return am ?? gm;
  return param * am + (1 - param) * gm;
}

/** Round to the methodology's display precision. */
export function roundScore(x, decimals = 0) {
  if (x == null) return null;
  const f = 10 ** decimals;
  return Math.round(x * f) / f;
}
