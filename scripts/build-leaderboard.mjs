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

// Validity thresholds (v0.2.0): the instrument refuses to publish a misleading
// score rather than emit a false-precise one. See methodology.validity.
const validity = methodology.validity ?? {};
const MIN_PEER = validity.minPeerSetSize ?? 1;
const MIN_COVERAGE = validity.minCoverageToRank ?? 0;

// Two-track model: the headline rank is the CONDUCT track (comparable across
// any portfolio); the DELIVERY track is portfolio-relative and shown beside it.
const tracksCfg = methodology.tracks ?? {};
const conductDims = new Set(tracksCfg.conduct?.dimensions ?? dims.map((d) => d.id));
const deliveryDims = new Set(tracksCfg.delivery?.dimensions ?? []);
const inConduct = (id) => conductDims.has(id);
const inDelivery = (id) => deliveryDims.has(id);

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

/** Does the dimension apply to any role the leader held (role test only)? */
function roleApplies(leader, dim) {
  return leader.periods.some((p) => dim.appliesToRoles.includes(p.role));
}

// Jurisdiction-aware applicability: dimensions a country never publishes data
// for are excluded from scoring + the coverage denominator, but disclosed.
const jurisdictionGaps = validity.jurisdictionDataGaps ?? {};
function jurisdictionExcluded(leader, dim) {
  return (jurisdictionGaps[leader.country]?.dimensions ?? []).includes(dim.id);
}

/** Applicable for SCORING + coverage: role applies AND not a jurisdiction gap. */
function applicableToLeader(leader, dim) {
  return roleApplies(leader, dim) && !jurisdictionExcluded(leader, dim);
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
// A dimension whose peer set has fewer than MIN_PEER defined values cannot be
// normalized meaningfully (a lone value rank-normalizes to 0), so it is left
// null and flagged insufficient — never scored as zero.
const normalized = {};
const peerSetSize = {};
for (const dim of dims) {
  const slugs = leaders.filter((l) => applicableToLeader(l, dim)).map((l) => l.slug);
  normalized[dim.id] = new Map();
  // Peer-set grouping: delivery-track dims normalize WITHIN portfolio band (so
  // a Works minister is compared with other infrastructure ministers, never a
  // Communications one); conduct-track dims normalize across the whole class.
  const groups = new Map();
  for (const s of slugs) {
    const lead = leaders.find((l) => l.slug === s);
    const key = inDelivery(dim.id) ? (lead.portfolioBand ?? 'unbanded') : 'all';
    (groups.get(key) ?? groups.set(key, []).get(key)).push(s);
  }
  let definedTotal = 0;
  for (const gslugs of groups.values()) {
    const series = gslugs.map((s) => raw[dim.id].get(s));
    const defined = series.filter((v) => v != null).length;
    definedTotal += defined;
    if (defined < MIN_PEER) {
      gslugs.forEach((s) => normalized[dim.id].set(s, null));
      continue;
    }
    const norm = normalizeWithinPool(series, { higherIsBetter: dim.higherIsBetter });
    gslugs.forEach((s, i) => normalized[dim.id].set(s, norm[i]));
  }
  peerSetSize[dim.id] = definedTotal;
}

/** The recorded metric object (value + citation + justification) for a
 *  leader+dimension, for transparent display even when not normalized. */
function leaderDimensionMetric(leader, dim) {
  for (const period of leader.periods) {
    if (!dim.appliesToRoles.includes(period.role)) continue;
    const m = (period.metrics ?? []).find((x) => x.dimension === dim.id);
    if (m && m.value != null && !m.notApplicable) return m;
  }
  return null;
}

/* ---------- 3 + 4 + 5: per-leader layer + composite scores ---------- */

function layerScore(leader, layerId) {
  const layerDims = dims.filter((d) => d.layer === layerId && applicableToLeader(leader, d));
  const scores = layerDims.map((d) => normalized[d.id]?.get(leader.slug) ?? null);
  const weights = layerDims.map((d) => d.weightWithinLayer);
  return { score: weightedArithmeticMean(scores, weights), dims: layerDims, scores };
}

const BASE_PARAM = methodology.aggregation.crossLayerParam ?? 0.5;

/** Layer score restricted to one track's dimensions (conduct or delivery). */
function layerScoreTrack(leader, layerId, trackFilter) {
  const ds = dims.filter((d) => d.layer === layerId && applicableToLeader(leader, d) && trackFilter(d.id));
  const scores = ds.map((d) => normalized[d.id]?.get(leader.slug) ?? null);
  const weights = ds.map((d) => d.weightWithinLayer);
  return weightedArithmeticMean(scores, weights);
}

/** Track composite: weakest-link across the layers that hold this track's dims. */
function compositeForTrack(leader, layerIds, trackFilter, param = BASE_PARAM) {
  const present = layerIds.filter((id) =>
    dims.some((d) => d.layer === id && applicableToLeader(leader, d) && trackFilter(d.id)),
  );
  const ls = present.map((id) => layerScoreTrack(leader, id, trackFilter));
  const lw = present.map((id) => layers[id].weight);
  return weakestLinkAggregate(ls, lw, param);
}

function buildEntry(leader) {
  const cls = comparabilityClass(leader);
  const scoredLayers = ['A', 'B', 'C'].map((id) => {
    const ls = layerScore(leader, id);
    // Display all role-applicable dims, including jurisdiction-excluded ones
    // (disclosed, never silently dropped). Scoring/coverage use applicableToLeader.
    const displayDims = dims.filter((d) => d.layer === id && roleApplies(leader, d));
    return {
      layer: id,
      name: layers[id].name,
      score: roundScore(ls.score, decimals),
      dimensions: displayDims.map((d) => {
        const excluded = jurisdictionExcluded(leader, d);
        const score = excluded ? null : normalized[d.id]?.get(leader.slug) ?? null;
        const m = excluded ? null : leaderDimensionMetric(leader, d);
        return {
          dimension: d.id,
          layer: id,
          name: d.name,
          score: roundScore(score, decimals),
          covered: score != null,
          peerSetSize: peerSetSize[d.id] ?? 0,
          // Transparent record of the cited raw datum, shown even when the
          // dimension cannot yet be normalized (peer set too small).
          recorded: m ? { value: m.value, justification: m.justification, citation: m.citation } : null,
          status: excluded
            ? 'excluded-jurisdiction'
            : score != null
              ? 'scored'
              : m
                ? peerSetSize[d.id] < MIN_PEER
                  ? 'on-file-insufficient-peer-set'
                  : 'on-file'
                : 'no-data',
          ...(excluded ? { excludedReason: jurisdictionGaps[leader.country]?.reason ?? null } : {}),
        };
      }),
    };
  });

  const applicable = dims.filter((d) => applicableToLeader(leader, d));
  const recordedCount = applicable.filter((d) => leaderDimensionMetric(leader, d) != null).length;
  const coverageOf = (filter) => {
    const appl = applicable.filter((d) => filter(d.id));
    const cov = appl.filter((d) => (normalized[d.id]?.get(leader.slug) ?? null) != null);
    return { applicable: appl.length, covered: cov.length, pct: appl.length ? (cov.length / appl.length) * 100 : 0 };
  };
  const overall = coverageOf(() => true);
  const conductCov = coverageOf(inConduct);
  const deliveryCov = coverageOf(inDelivery);

  // Headline rank rests on the CONDUCT track only (comparable across portfolios).
  const conductComposite = compositeForTrack(leader, ['A', 'B', 'C'], inConduct);
  const deliveryComposite = compositeForTrack(leader, ['A', 'B', 'C'], inDelivery);
  const ranked = conductCov.pct / 100 >= MIN_COVERAGE && conductComposite != null;
  let notRankedReason = null;
  if (!ranked) {
    if (recordedCount === 0) {
      notRankedReason = 'No metrics on file yet.';
    } else if (conductCov.covered === 0) {
      notRankedReason = `On file with ${recordedCount} cited metric(s), but no conduct-track dimension yet has a peer set of ${MIN_PEER}+ comparable subjects. Awaiting a comparable cohort.`;
    } else {
      notRankedReason = `Conduct-track coverage ${Math.round(conductCov.pct)}% is below the ${Math.round(MIN_COVERAGE * 100)}% minimum required to publish a rank.`;
    }
  }

  return {
    slug: leader.slug,
    name: leader.name,
    benchmark: !!leader.benchmark,
    country: leader.country,
    affiliation: leader.affiliation,
    comparabilityClass: cls,
    ranked,
    notRankedReason,
    // Headline = conduct track. Delivery is portfolio-relative context, shown
    // regardless of rank, never blended into the headline.
    composite: ranked ? roundScore(conductComposite, decimals) : null,
    compositeObjectiveOnly: ranked ? roundScore(compositeForTrack(leader, ['A', 'C'], inConduct), decimals) : null,
    deliveryComposite: roundScore(deliveryComposite, decimals),
    coverage: roundScore(overall.pct, decimals),
    conductCoverage: roundScore(conductCov.pct, decimals),
    deliveryCoverage: roundScore(deliveryCov.pct, decimals),
    recordedCount,
    rank: null, // filled after sort, ranked entries only
    rankRange: null, // filled by sensitivity pass, ranked entries only
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

// Only ranked entries (coverage + peer set cleared) receive a published rank.
const rankable = allEntries.filter((e) => e.ranked);

// Point rank by composite.
const pointRank = new Map(rankBy(rankable, (e) => e.composite));

// Sensitivity: perturb the cross-layer param within ±perturbation and record
// the best/worst rank each leader can take (Saisana/Saltelli weight perturbation).
const pert = methodology.audit?.gates?.find((g) => g.id === 'rank-robustness')?.perturbation ?? 0.1;
const baseParam = methodology.aggregation.crossLayerParam ?? 0.5;
const rankSpread = new Map(rankable.map((e) => [e.slug, [Infinity, -Infinity]]));
for (const p of [baseParam - pert, baseParam, baseParam + pert]) {
  const param = Math.max(0, Math.min(1, p));
  const recomputed = rankable.map((e) => {
    const lead = leaders.find((l) => l.slug === e.slug);
    // Perturb the headline (conduct-track) composite — the figure leaders are ranked on.
    return { slug: e.slug, c: compositeForTrack(lead, ['A', 'B', 'C'], inConduct, param) };
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
  if (!e.ranked) continue; // rank/rankRange stay null
  e.rank = pointRank.get(e.slug) ?? 0;
  const sp = rankSpread.get(e.slug);
  e.rankRange = sp && sp[0] !== Infinity ? [sp[0], sp[1]] : [e.rank, e.rank];
}

/* ---------- assemble + write ---------- */

// Ranked first (by composite), then on-file subjects (by recorded-metric count).
const order = (a, b) => {
  if (a.ranked !== b.ranked) return a.ranked ? -1 : 1;
  if (a.ranked) return (b.composite ?? -1) - (a.composite ?? -1);
  return (b.recordedCount ?? 0) - (a.recordedCount ?? 0);
};
const entries = allEntries.filter((e) => !e.benchmark).sort(order);
const benchmarks = allEntries.filter((e) => e.benchmark).sort(order);

const board = {
  methodologyVersion: methodology.version,
  status: methodology.status,
  generatedAt: new Date().toISOString().slice(0, 10), // date only → deterministic per day
  biasAudited: false, // set true only by a passing audit (audit-scoreboard.mjs)
  validity: { minPeerSetSize: MIN_PEER, minCoverageToRank: MIN_COVERAGE },
  tracks: {
    headline: tracksCfg.rankingTrack ?? 'conduct',
    conduct: { name: tracksCfg.conduct?.name ?? 'Conduct & Structure', dimensions: [...conductDims] },
    delivery: { name: tracksCfg.delivery?.name ?? 'Delivery', dimensions: [...deliveryDims] },
  },
  counts: {
    leaders: entries.length,
    benchmarks: benchmarks.length,
    ranked: allEntries.filter((e) => e.ranked).length,
    onFile: allEntries.filter((e) => !e.ranked && e.recordedCount > 0).length,
  },
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
console.log(
  `    ranked: ${board.counts.ranked}  ·  on file (not yet rankable): ${board.counts.onFile}`,
);
if (board.counts.ranked === 0 && board.counts.onFile > 0) {
  console.log(
    `    Subjects on file with cited data, but below ranking validity (coverage < ${Math.round(MIN_COVERAGE * 100)}% and/or peer set < ${MIN_PEER}). No composite or rank published. Badge withheld.`,
  );
}
if (methodology.status === 'framework' && board.counts.onFile === 0 && board.counts.ranked === 0) {
  console.log('    Framework mode — no subjects scored yet (M0). Badge withheld until audit passes.');
}
