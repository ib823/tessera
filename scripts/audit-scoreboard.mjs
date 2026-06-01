#!/usr/bin/env node
/**
 * The Plumb Line — bias audit ("prove it, then declare")
 * ----------------------------------------------------------------
 * Runs five gates, all standard composite-indicator quality assurance, and
 * emits public/leaderboard-audit.json. Patches public/leaderboard.json's
 * `biasAudited` flag to true ONLY when every gate passes AND the board is live
 * with subjects. The UI renders the "Bias-Audited" badge off that flag.
 *
 * Gates:
 *   1. Symmetry            — no per-leader overrides; scoring is config-driven.
 *   2. Source coverage     — every recorded metric carries a tier 1-3 citation.
 *   3. Partisan-signal     — correlation ratio (eta) between coalition and the
 *                            (Layer B − Layer A) residual must stay below
 *                            threshold; the editorial layer must not leak party.
 *   4. Rank robustness     — never fails; converts unstable point ranks into
 *                            published rank ranges (handled in build).
 *   5. Inter-coder reliab. — Krippendorff's alpha on Layer B ordinal scores.
 *
 * Framework mode (M0): structural gates pass trivially; data-dependent gates
 * report "pending" (no subjects). biasAudited stays false.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLeaders, loadMethodology } from './lib/load-leaders.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');
const BOARD_PATH = join(PUBLIC, 'leaderboard.json');

const methodology = loadMethodology();
const leaders = loadLeaders();
const gateCfg = Object.fromEntries((methodology.audit?.gates ?? []).map((g) => [g.id, g]));

/* ---------- statistics ---------- */

/** Correlation ratio eta in [0,1]: how much of residual variance is explained
 *  by group (coalition). 0 = the editorial layer is group-blind. */
function correlationRatio(groups, values) {
  const defined = values.map((v, i) => [groups[i], v]).filter(([, v]) => v != null);
  if (defined.length < 3) return null;
  const all = defined.map(([, v]) => v);
  const grand = all.reduce((s, v) => s + v, 0) / all.length;
  const totalSS = all.reduce((s, v) => s + (v - grand) ** 2, 0);
  if (totalSS === 0) return 0;
  const byGroup = {};
  for (const [g, v] of defined) (byGroup[g] ??= []).push(v);
  let betweenSS = 0;
  for (const arr of Object.values(byGroup)) {
    const m = arr.reduce((s, v) => s + v, 0) / arr.length;
    betweenSS += arr.length * (m - grand) ** 2;
  }
  return Math.sqrt(betweenSS / totalSS);
}

/** Krippendorff's alpha for interval data via the coincidence matrix.
 *  units = array of arrays of numeric ratings (one array per scored item). */
function krippendorffAlpha(units) {
  const pairable = units.filter((u) => u.filter((x) => x != null).length >= 2);
  if (pairable.length === 0) return null;

  // Coincidence matrix o[c][c'] over observed values.
  const o = new Map();
  const add = (c, cp, w) => {
    const k = `${c}|${cp}`;
    o.set(k, (o.get(k) ?? 0) + w);
  };
  for (const u of pairable) {
    const vals = u.filter((x) => x != null);
    const m = vals.length;
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        if (i === j) continue;
        add(vals[i], vals[j], 1 / (m - 1));
      }
    }
  }
  // Marginals n_c and grand total n.
  const nc = new Map();
  let n = 0;
  for (const [k, w] of o) {
    const c = Number(k.split('|')[0]);
    nc.set(c, (nc.get(c) ?? 0) + w);
    n += w;
  }
  if (n <= 1) return null;
  const vals = [...nc.keys()];
  const delta2 = (a, b) => (a - b) ** 2; // interval metric

  let Do = 0;
  for (const [k, w] of o) {
    const [c, cp] = k.split('|').map(Number);
    Do += w * delta2(c, cp);
  }
  Do /= n;

  let De = 0;
  for (const c of vals) {
    for (const cp of vals) {
      De += (nc.get(c) * nc.get(cp)) * delta2(c, cp);
    }
  }
  De /= n * (n - 1);

  if (De === 0) return 1;
  return 1 - Do / De;
}

/* ---------- gather scored entries from the built board ---------- */

const board = existsSync(BOARD_PATH) ? JSON.parse(readFileSync(BOARD_PATH, 'utf8')) : null;
const allEntries = board ? [...board.entries, ...board.benchmarks] : [];

const layerScore = (entry, id) => entry.layers.find((l) => l.layer === id)?.score ?? null;

/* ---------- gates ---------- */

const results = [];
const subjectCount = leaders.length;

// 1. Symmetry — leader files must carry only raw metrics, never weights/scores.
{
  const FORBIDDEN = ['weight', 'weights', 'score', 'composite', 'finalScore', 'normalized'];
  const offenders = [];
  for (const l of leaders) {
    const blob = JSON.stringify(l);
    for (const key of FORBIDDEN) {
      if (new RegExp(`"${key}"\\s*:`).test(blob)) offenders.push(`${l.slug}:${key}`);
    }
  }
  results.push({
    id: 'symmetry',
    name: gateCfg.symmetry?.name ?? 'Symmetry',
    passed: offenders.length === 0,
    detail: offenders.length
      ? `Per-leader override keys found: ${offenders.join(', ')}`
      : 'No per-leader overrides; all scoring derives from the single methodology config.',
  });
}

// 2. Source coverage — every recorded metric value carries a tier 1-3 citation.
{
  let recorded = 0;
  let uncited = 0;
  for (const l of leaders) {
    for (const p of l.periods ?? []) {
      for (const m of p.metrics ?? []) {
        const has = m.value != null && !m.notApplicable;
        if (!has) continue;
        recorded++;
        if (!m.citation || ![1, 2, 3].includes(m.citation.tier)) uncited++;
      }
    }
  }
  results.push({
    id: 'source-coverage',
    name: gateCfg['source-coverage']?.name ?? 'Source coverage',
    passed: uncited === 0,
    detail:
      recorded === 0
        ? 'Pending — no recorded metrics yet (framework mode).'
        : `${recorded - uncited}/${recorded} recorded metrics carry a tier 1-3 citation.`,
    value: recorded ? (recorded - uncited) / recorded : undefined,
  });
}

// 3. Partisan-signal — eta(coalition, LayerB − LayerA residual) below threshold.
//    Tests whether the Malaysian editorial layer leaks Malaysian COALITION, so it
//    groups by coalition (not individual party) and excludes foreign benchmarks,
//    which are reference points, not part of the partisan structure under test.
{
  const threshold = gateCfg['partisan-signal']?.threshold ?? 0.3;
  const coalitionOf = (a) => {
    const m = a.match(/\(([^)]+)\)/);
    const f = (m ? m[1] : a).trim();
    return { 'Pakatan Harapan': 'PH', 'Barisan Nasional': 'BN', 'Gabungan Parti Sarawak': 'GPS', 'Gabungan Rakyat Sabah': 'GRS', 'Perikatan Nasional': 'PN' }[f] ?? (/technocrat|Non-partisan/i.test(a) ? 'Ind.' : f);
  };
  const subjects = allEntries.filter((e) => !e.benchmark && layerScore(e, 'A') != null && layerScore(e, 'B') != null);
  const groups = subjects.map((e) => coalitionOf(e.affiliation));
  const residuals = subjects.map((e) => layerScore(e, 'B') - layerScore(e, 'A'));
  const eta = correlationRatio(groups, residuals);
  const nGroups = new Set(groups).size;
  results.push({
    id: 'partisan-signal',
    name: gateCfg['partisan-signal']?.name ?? 'Partisan-signal test',
    passed: eta == null ? true : eta <= threshold,
    detail:
      eta == null
        ? 'Pending — need ≥3 domestic subjects with both Layer A and Layer B scores.'
        : `Coalition explains eta=${eta.toFixed(3)} of editorial-residual variance across ${subjects.length} domestic subjects in ${nGroups} coalitions (threshold ${threshold}). ${eta <= threshold ? 'Editorial layer is not leaking coalition.' : 'FAIL — editorial layer correlates with coalition.'}`,
    value: eta ?? undefined,
    threshold,
  });
}

// 4. Rank robustness — informational; build already published rank ranges.
{
  const unstable = allEntries.filter((e) => e.rankRange && e.rankRange[0] !== e.rankRange[1]).length;
  results.push({
    id: 'rank-robustness',
    name: gateCfg['rank-robustness']?.name ?? 'Rank robustness',
    passed: true,
    detail:
      allEntries.length === 0
        ? 'Pending — no ranks yet (framework mode).'
        : `${unstable}/${allEntries.length} leaders have weight-sensitive ranks, published as ranges.`,
  });
}

// 5. Inter-coder reliability — Krippendorff's alpha on Layer B coder scores.
{
  const threshold = gateCfg['intercoder-reliability']?.threshold ?? 0.667;
  const units = [];
  for (const l of leaders) {
    for (const p of l.periods ?? []) {
      for (const m of p.metrics ?? []) {
        if (Array.isArray(m.coderScores) && m.coderScores.length >= 2) units.push(m.coderScores);
      }
    }
  }
  const alpha = krippendorffAlpha(units);
  results.push({
    id: 'intercoder-reliability',
    name: gateCfg['intercoder-reliability']?.name ?? 'Inter-coder reliability',
    passed: alpha == null ? true : alpha >= threshold,
    detail:
      alpha == null
        ? 'Pending — no multi-coder Layer B scores yet.'
        : `Krippendorff's alpha = ${alpha.toFixed(3)} across ${units.length} Layer B items (threshold ${threshold}).`,
    value: alpha ?? undefined,
    threshold,
  });
}

/* ---------- verdict + write ---------- */

const allPassed = results.every((r) => r.passed);
const hasSubjects = subjectCount > 0 && methodology.status === 'live';
const biasAudited = allPassed && hasSubjects;

const report = {
  methodologyVersion: methodology.version,
  generatedAt: new Date().toISOString().slice(0, 10),
  passed: allPassed,
  biasAudited,
  subjectCount,
  gates: results,
};
writeFileSync(join(PUBLIC, 'leaderboard-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

// Patch the board's badge flag — and GATE the deployed asset. Until the badge is
// granted, the public leaderboard.json is REDACTED to counts + methodology only:
// no names, no scores, no provisional conduct on living people ever ships before
// the bias panel clears. PLUMB_PREVIEW=1 keeps the full file for internal review.
const PREVIEW = process.env.PLUMB_PREVIEW === '1';
if (board) {
  board.biasAudited = biasAudited;
  if (biasAudited || PREVIEW) {
    writeFileSync(BOARD_PATH, `${JSON.stringify(board, null, 2)}\n`);
  } else {
    const redacted = {
      methodologyVersion: board.methodologyVersion,
      status: board.status,
      generatedAt: board.generatedAt,
      biasAudited: false,
      redacted: true,
      validity: board.validity,
      tracks: board.tracks,
      counts: {
        total: board.entries.length + board.benchmarks.length,
        ranked: [...board.entries, ...board.benchmarks].filter((e) => e.ranked).length,
        cabinet: board.entries.length,
        benchmarks: board.benchmarks.length,
      },
    };
    writeFileSync(BOARD_PATH, `${JSON.stringify(redacted, null, 2)}\n`);
    console.log('  ⚿ leaderboard.json REDACTED for deploy (badge withheld; set PLUMB_PREVIEW=1 for full).');
  }
}

console.log('\n  The Plumb Line — bias audit');
for (const r of results) {
  console.log(`    ${r.passed ? '✓' : '✗'} ${r.name}: ${r.detail}`);
}
console.log(
  `\n  ${biasAudited ? '✓ BIAS-AUDITED — badge granted.' : allPassed ? '◌ All gates pass; badge withheld until board is live with subjects.' : '✗ Audit failed — badge withheld.'}\n`,
);

// Never block the build: an audit "fail" withholds the badge, it does not
// crash the pipeline. A hard schema problem is caught by validate-leaderboard.
process.exit(0);
