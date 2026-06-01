#!/usr/bin/env node
/**
 * The Plumb Line — leaderboard builder
 * ----------------------------------------------------------------
 * Deterministically turns RAW leader metrics × the methodology config into the
 * reader-facing leaderboard. This is the ONLY place raw observations become
 * scores, so symmetry is structural: there is no per-leader code path.
 *
 * Pipeline (per the methodology config):
 *   1. Per leader, per dimension: time-weight the raw values across periods
 *      where the dimension is applicable to that period's role.
 *   2. Normalize each dimension WITHIN its applicable peer set (min-max,
 *      rank fallback for small pools).
 *   3. Aggregate within each layer (weighted mean over applicable+defined dims).
 *   4. Cross-layer weakest-link-half aggregation → composite.
 *   5. Compute the objective-only composite (layers A + C, B removed).
 *   6. Rank, and derive rank-uncertainty ranges via weight perturbation.
 *
 * Emits:
 *   public/leaderboard.json              (board + benchmarks)
 *   public/leaderboard/{slug}.json       (per-leader detail)
 *
 * Framework mode (M0, no leaders): emits an empty, un-audited board so the
 * page and pipeline exist before anyone is scored.
 *
 * Firewall: imports nothing from engine/sim. Every value originates in a
 * leader file's cited raw metric.
 */

import { writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLeaders, loadMethodology } from './lib/load-leaders.mjs';
import {
  rawScore,
  normalizeWithinPool,
  weightedArithmeticMean,
  weakestLinkAggregate,
  roundScore,
  DEFAULT_STATUS_SCALAR,
} from './lib/leaderboard-scoring.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const PUBLIC = join(root, 'public');
const OUT_DIR = join(PUBLIC, 'leaderboard');

const methodology = loadMethodology();
const leaders = loadLeaders();
const decimals = methodology.scale?.decimals ?? 0;
const statusScalars = methodology.statusScalars ?? DEFAULT_STATUS_SCALAR;

const dims = methodology.dimensions;
const layers = methodology.layers;

/* ---------- helpers ---------- */

function periodDays(p) {
  const from = new Date(p.from).getTime();
  const to = (p.to ? new Date(p.to) : new Date()).getTime();
  return Math.max(1, (to - from) / 86_400_000);
}

/** Time-weighted raw value for one dimension across a leader's periods. */
function leaderDimensionRaw(leader, dim) {
  let acc = 0;
  let w = 0;
  for (const period of leader.periods) {
    if (!dim.appliesToRoles.includes(period.role)) continue;
    const metric = (period.metrics ?? []).find((m) => m.dimension === dim.id);
    const r = rawScore(metric, dim.layer, statusScalars);
    if (r == null) continue;
    const days = periodDays(period);
    acc += r * days;
    w += days;
  }
  return w === 0 ? null : acc / w;
}

/** A leader's comparability class = role of their most recent period. */
function comparabilityClass(leader) {
  const sorted = [...leader.periods].sort(
    (a, b) => new Date(b.from) - new Date(a.from),
  );
  return sorted[0]?.role ?? null;
}

/** Is a dimension applicable to a leader in any of their periods? */
function applicableToLeader(leader, dim) {
  return leader.periods.some((p) => dim.appliesToRoles.includes(p.role));
}

/* ---------- 1 + 2: raw values, then normalize per dimension within peer pool ---------- */

// raw[dimId] = Map(slug → raw value | null)
const raw = {};
for (const dim of dims) {
  raw[dim.id] = new Map();
  for (const lead of leaders) {
    raw[dim.id].set(lead.slug, applicableToLeader(lead, dim) ? leaderDimensionRaw(lead, dim) : null);
  }
}

// normalized[dimId] = Map(slug → 0..100 | null), normalized within the
// applicable peer set (leaders for whom the dim applies AND have a value).
const normalized = {};
for (const dim of dims) {
  const slugs = leaders.filter((l) => applicableToLeader(l, dim)).map((l) => l.slug);
  const series = slugs.map((s) => raw[dim.id].get(s));
  const norm = normalizeWithinPool(series, { higherIsBetter: dim.higherIsBetter });
  normalized[dim.id] = new Map();
  slugs.forEach((s, i) => normalized[dim.id].set(s, norm[i]));
}

/* ---------- 3 + 4 + 5: per-leader layer + composite scores ---------- */

function layerScore(leader, layerId) {
  const layerDims = dims.filter((d) => d.layer === layerId && applicableToLeader(leader, d));
  const scores = layerDims.map((d) => normalized[d.id]?.get(leader.slug) ?? null);
  const weights = layerDims.map((d) => d.weightWithinLayer);
  return { score: weightedArithmeticMean(scores, weights), dims: layerDims, scores };
}

function compositeFor(leader, layerIds) {
  const ls = layerIds.map((id) => layerScore(leader, id).score);
  const lw = layerIds.map((id) => layers[id].weight);
  return weakestLinkAggregate(ls, lw, methodology.aggregation.crossLayerParam ?? 0.5);
}

function buildEntry(leader) {
  const cls = comparabilityClass(leader);
  const scoredLayers = ['A', 'B', 'C'].map((id) => {
    const ls = layerScore(leader, id);
    return {
      layer: id,
      name: layers[id].name,
      score: roundScore(ls.score, decimals),
      dimensions: ls.dims.map((d) => ({
        dimension: d.id,
        layer: id,
        name: d.name,
        score: roundScore(normalized[d.id]?.get(leader.slug) ?? null, decimals),
        covered: (normalized[d.id]?.get(leader.slug) ?? null) != null,
      })),
    };
  });

  const applicable = dims.filter((d) => applicableToLeader(leader, d));
  const covered = applicable.filter((d) => (normalized[d.id]?.get(leader.slug) ?? null) != null);
  const coverage = applicable.length ? (covered.length / applicable.length) * 100 : 0;

  return {
    slug: leader.slug,
    name: leader.name,
    benchmark: !!leader.benchmark,
    country: leader.country,
    affiliation: leader.affiliation,
    comparabilityClass: cls,
    composite: roundScore(compositeFor(leader, ['A', 'B', 'C']), decimals),
    compositeObjectiveOnly: roundScore(compositeFor(leader, ['A', 'C']), decimals),
    coverage: roundScore(coverage, decimals),
    rank: 0, // filled after sort
    rankRange: [0, 0], // filled by sensitivity pass
    layers: scoredLayers,
    relatedIssues: leader.relatedIssues ?? [],
  };
}

const allEntries = leaders.map(buildEntry);

/* ---------- 6: rank + rank-uncertainty via weight perturbation ---------- */

function rankBy(entries, scoreFn) {
  return [...entries]
    .sort((a, b) => (scoreFn(b) ?? -1) - (scoreFn(a) ?? -1))
    .map((e, i) => [e.slug, i + 1]);
}

// Point rank by composite.
const pointRank = new Map(rankBy(allEntries, (e) => e.composite));

// Sensitivity: perturb the cross-layer param within ±perturbation and record
// the best/worst rank each leader can take (Saisana/Saltelli weight perturbation).
const pert = methodology.audit?.gates?.find((g) => g.id === 'rank-robustness')?.perturbation ?? 0.1;
const baseParam = methodology.aggregation.crossLayerParam ?? 0.5;
const rankSpread = new Map(allEntries.map((e) => [e.slug, [Infinity, -Infinity]]));
for (const p of [baseParam - pert, baseParam, baseParam + pert]) {
  const param = Math.max(0, Math.min(1, p));
  const recomputed = allEntries.map((e) => {
    const lead = leaders.find((l) => l.slug === e.slug);
    return { slug: e.slug, c: weakestLinkAggregate(
      ['A', 'B', 'C'].map((id) => layerScore(lead, id).score),
      ['A', 'B', 'C'].map((id) => layers[id].weight),
      param,
    ) };
  });
  const r = new Map(
    [...recomputed].sort((a, b) => (b.c ?? -1) - (a.c ?? -1)).map((e, i) => [e.slug, i + 1]),
  );
  for (const [slug, rank] of r) {
    const cur = rankSpread.get(slug);
    rankSpread.set(slug, [Math.min(cur[0], rank), Math.max(cur[1], rank)]);
  }
}

for (const e of allEntries) {
  e.rank = pointRank.get(e.slug) ?? 0;
  const sp = rankSpread.get(e.slug);
  e.rankRange = sp && sp[0] !== Infinity ? [sp[0], sp[1]] : [e.rank, e.rank];
}

/* ---------- assemble + write ---------- */

const entries = allEntries.filter((e) => !e.benchmark).sort((a, b) => b.composite - a.composite);
const benchmarks = allEntries.filter((e) => e.benchmark).sort((a, b) => b.composite - a.composite);

const board = {
  methodologyVersion: methodology.version,
  status: methodology.status,
  generatedAt: new Date().toISOString().slice(0, 10), // date only → deterministic per day
  biasAudited: false, // set true only by a passing audit (audit-scoreboard.mjs)
  entries,
  benchmarks,
};

// Clean + rewrite per-leader detail dir for determinism.
if (existsSync(OUT_DIR)) {
  for (const f of readdirSync(OUT_DIR)) if (f.endsWith('.json')) rmSync(join(OUT_DIR, f));
}
mkdirSync(OUT_DIR, { recursive: true });

writeFileSync(join(PUBLIC, 'leaderboard.json'), `${JSON.stringify(board, null, 2)}\n`);
for (const e of allEntries) {
  writeFileSync(join(OUT_DIR, `${e.slug}.json`), `${JSON.stringify(e, null, 2)}\n`);
}

console.log(
  `  ✓ leaderboard built (${methodology.status}): ${entries.length} leaders, ${benchmarks.length} benchmarks → public/leaderboard.json`,
);
if (methodology.status === 'framework') {
  console.log('    Framework mode — no subjects scored yet (M0). Badge withheld until audit passes.');
}
