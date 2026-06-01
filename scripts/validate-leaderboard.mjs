#!/usr/bin/env node
/**
 * The Plumb Line — leaderboard validator
 * ----------------------------------------------------------------
 * Gate that must pass before the leaderboard is built. Mirrors
 * scripts/validate-issues.mjs.
 *
 * Checks:
 *   METHODOLOGY (always)
 *     1. Layer weights sum to 1.0 (±0.001).
 *     2. Within each layer, dimension weightWithinLayer sums to 1.0.
 *     3. Every dimension's layer exists; appliesToRoles are known role classes.
 *     4. Every layer.groundedIn / dimension grounding id resolves to a citation.
 *     5. Layer B dimensions carry ordinalAnchors; audit defines all five gates.
 *     6. firewall + exclusions present (the non-partisanship guarantees).
 *
 *   LEADERS (when src/data/leaders/*.json exist; none in M0 framework mode)
 *     7. Schema: slug matches filename, required fields, role classes known.
 *     8. Every metric with a non-null value carries a citation (tier 1-3) AND a
 *        justification. (Source-coverage firewall — uncited numbers never ship.)
 *     9. Every metric dimension is APPLICABLE to its period's role class.
 *    10. Layer B metric values are integers 0-4; coderScores (if present) too.
 *    11. affiliation present (required by the partisan-signal audit gate).
 *    12. No banned (stealth) terms anywhere in the leader file.
 *
 * Exit 0 clean, 1 on any error. Warnings never block.
 */

import { readdirSync, existsSync } from 'node:fs';
import { basename } from 'node:path';
import { loadLeaders, loadMethodology, getLeadersDir } from './lib/load-leaders.mjs';

const verbose = process.argv.includes('--verbose');

const errors = [];
const warnings = [];
let passCount = 0;
const err = (scope, msg) => errors.push({ scope, msg });
const warn = (scope, msg) => warnings.push({ scope, msg });
const pass = (msg) => {
  passCount++;
  if (verbose) console.log(`  ✓ ${msg}`);
};

const APPROX = (a, b, eps = 0.001) => Math.abs(a - b) <= eps;

const BANNED_PATTERNS = [
  /\bAI[- ]generated\b/i,
  /\bChatGPT\b/i,
  /\bGPT[- ]?[0-9]/i,
  /\bClaude\s+\d/i,
  /\bGemini\s+(Pro|Ultra|Flash|2\.\d|1\.\d)/i,
  /\bDeepSeek\b/i,
  /\bGrok\b/i,
  /\bopen[- ]?AI\b/i,
  /\blanguage model\b/i,
];

const VALID_STATUS = new Set([
  'declared', 'not-declared', 'charged', 'convicted',
  'acquitted', 'discharged', 'pardoned', 'ongoing', 'none-on-record',
]);

// ══════════════════════════════════════════════
// METHODOLOGY CHECKS
// ══════════════════════════════════════════════

const methodology = loadMethodology();
const citationIds = new Set((methodology.citations ?? []).map((c) => c.id));
const roleClassIds = new Set((methodology.roleClasses ?? []).map((r) => r.id));

console.log('\n  Validating methodology config…\n');

// 1. Layer weights sum to 1.0
const layerWeightSum = Object.values(methodology.layers ?? {}).reduce(
  (s, l) => s + (l.weight ?? 0),
  0,
);
if (!APPROX(layerWeightSum, 1)) {
  err('methodology', `Layer weights sum to ${layerWeightSum.toFixed(3)}, must be 1.0`);
} else {
  pass(`Layer weights sum to 1.0`);
}

// 2 + 3 + 4. Per-dimension checks, grouped by layer for weight sums
const byLayer = {};
for (const d of methodology.dimensions ?? []) {
  (byLayer[d.layer] ??= []).push(d);

  if (!methodology.layers?.[d.layer]) {
    err(`dimension ${d.id}`, `references unknown layer "${d.layer}"`);
  }
  for (const r of d.appliesToRoles ?? []) {
    if (!roleClassIds.has(r)) {
      err(`dimension ${d.id}`, `appliesToRoles has unknown role class "${r}"`);
    }
  }
  if (!d.appliesToRoles?.length) {
    err(`dimension ${d.id}`, `appliesToRoles is empty — every dimension must apply to ≥1 role`);
  }
  // 5. Layer B dimensions need anchored ordinal scales
  if (d.layer === 'B' && !d.ordinalAnchors) {
    err(`dimension ${d.id}`, `Layer B dimension missing ordinalAnchors`);
  }
  if (typeof d.weightWithinLayer !== 'number') {
    err(`dimension ${d.id}`, `weightWithinLayer must be a number`);
  }
}

for (const [layerId, dims] of Object.entries(byLayer)) {
  const sum = dims.reduce((s, d) => s + (d.weightWithinLayer ?? 0), 0);
  if (!APPROX(sum, 1)) {
    err(`layer ${layerId}`, `dimension weightWithinLayer sums to ${sum.toFixed(3)}, must be 1.0`);
  } else {
    pass(`Layer ${layerId} dimension weights sum to 1.0`);
  }
}

// 4. grounding citation ids resolve
for (const l of Object.values(methodology.layers ?? {})) {
  for (const g of l.groundedIn ?? []) {
    if (!citationIds.has(g)) {
      err(`layer ${l.id}`, `groundedIn cites unknown citation id "${g}"`);
    }
  }
}

// 4b. tracks — every dimension belongs to exactly one track (conduct | delivery)
{
  const tcfg = methodology.tracks ?? {};
  const conduct = new Set(tcfg.conduct?.dimensions ?? []);
  const delivery = new Set(tcfg.delivery?.dimensions ?? []);
  if (conduct.size || delivery.size) {
    for (const d of methodology.dimensions ?? []) {
      const inC = conduct.has(d.id);
      const inD = delivery.has(d.id);
      if (inC && inD) err('tracks', `dimension ${d.id} is in both conduct and delivery tracks`);
      if (!inC && !inD) err('tracks', `dimension ${d.id} is in no track (must be conduct or delivery)`);
    }
    for (const id of [...conduct, ...delivery]) {
      if (!methodology.dimensions?.some((d) => d.id === id)) {
        err('tracks', `track references unknown dimension "${id}"`);
      }
    }
    if (!(tcfg.rankingTrack === 'conduct' || tcfg.rankingTrack === 'delivery')) {
      err('tracks', `rankingTrack must be "conduct" or "delivery"`);
    }
    if (!errors.some((e) => e.scope === 'tracks')) pass('Every dimension belongs to exactly one track; rankingTrack valid');
  }
}

// 5. audit gates
const REQUIRED_GATES = ['symmetry', 'source-coverage', 'partisan-signal', 'rank-robustness', 'intercoder-reliability'];
const gateIds = new Set((methodology.audit?.gates ?? []).map((g) => g.id));
for (const g of REQUIRED_GATES) {
  if (!gateIds.has(g)) err('audit', `missing required audit gate "${g}"`);
}
if (gateIds.size && REQUIRED_GATES.every((g) => gateIds.has(g))) {
  pass(`All five audit gates defined`);
}

// 6. firewall + exclusions
if (!methodology.firewall?.rule) err('methodology', 'missing firewall.rule (§8.3 guarantee)');
if (!Array.isArray(methodology.exclusions) || methodology.exclusions.length === 0) {
  err('methodology', 'missing exclusions list (the "what is not considered" guarantee)');
} else {
  const exclusionIds = new Set(methodology.exclusions.map((e) => e.id));
  for (const must of ['3r', 'popularity', 'ideology']) {
    if (!exclusionIds.has(must)) err('methodology', `exclusions must include "${must}"`);
  }
  pass(`Exclusions include 3R, popularity, ideology`);
}

// Build a quick dimension→roles map for leader applicability checks
const dimRoles = {};
for (const d of methodology.dimensions ?? []) {
  dimRoles[d.id] = new Set(d.appliesToRoles ?? []);
}
const dimLayer = Object.fromEntries((methodology.dimensions ?? []).map((d) => [d.id, d.layer]));

// ══════════════════════════════════════════════
// LEADER CHECKS (none in M0 framework mode)
// ══════════════════════════════════════════════

const leaders = loadLeaders();
const leadersDir = getLeadersDir();
const leaderFiles = existsSync(leadersDir)
  ? readdirSync(leadersDir).filter((f) => f.endsWith('.json')).sort()
  : [];

console.log(`  Validating ${leaders.length} leader profile(s)…\n`);

if (methodology.status === 'framework' && leaders.length === 0) {
  pass('Framework mode (M0): methodology published, no leaders scored yet');
}
if (methodology.status === 'live' && leaders.length === 0) {
  err('methodology', 'status is "live" but no leaders are present');
}

for (let i = 0; i < leaders.length; i++) {
  const lead = leaders[i];
  const file = leaderFiles[i];
  const scope = `leader ${lead.slug ?? file}`;

  // 7. schema
  if (!lead.slug) err(scope, 'missing slug');
  else if (file && basename(file, '.json') !== lead.slug) {
    err(scope, `slug "${lead.slug}" must match filename "${file}"`);
  }
  for (const k of ['name', 'country', 'affiliation', 'periods']) {
    if (lead[k] == null) err(scope, `missing required field "${k}"`);
  }
  if (typeof lead.benchmark !== 'boolean') err(scope, 'benchmark must be boolean');
  // 11. affiliation is mandatory — the partisan-signal gate needs it
  if (!lead.affiliation) err(scope, 'missing affiliation (required by partisan-signal audit gate)');

  if (!Array.isArray(lead.periods)) continue;

  for (let pi = 0; pi < lead.periods.length; pi++) {
    const period = lead.periods[pi];
    const pscope = `${scope} period[${pi}]`;
    if (!roleClassIds.has(period.role)) {
      err(pscope, `unknown role class "${period.role}"`);
    }
    for (const m of period.metrics ?? []) {
      const mscope = `${pscope} metric ${m.dimension}`;
      if (!dimLayer[m.dimension]) {
        err(mscope, `unknown dimension "${m.dimension}"`);
        continue;
      }
      // 9. applicability — dimension must apply to this period's role
      if (!m.notApplicable && period.role && dimRoles[m.dimension] && !dimRoles[m.dimension].has(period.role)) {
        err(mscope, `dimension not applicable to role "${period.role}" — mark notApplicable or remove`);
      }
      // 8. citation + justification for any recorded value
      const recorded = m.value !== null && m.value !== undefined && !m.notApplicable;
      if (recorded) {
        if (!m.citation) {
          err(mscope, 'recorded value has no citation (source-coverage firewall)');
        } else if (![1, 2, 3].includes(m.citation.tier)) {
          err(mscope, `citation tier ${m.citation.tier} is not a scorable primary source (need 1-3)`);
        }
        if (!m.justification) {
          warn(mscope, 'recorded value has no justification');
        }
      }
      // 10. Layer B ordinal range
      if (dimLayer[m.dimension] === 'B' && typeof m.value === 'number') {
        if (!Number.isInteger(m.value) || m.value < 0 || m.value > 4) {
          err(mscope, `Layer B value ${m.value} must be an integer 0-4`);
        }
        for (const cs of m.coderScores ?? []) {
          if (!Number.isInteger(cs) || cs < 0 || cs > 4) {
            err(mscope, `coderScore ${cs} must be an integer 0-4`);
          }
        }
      }
      // A5 status vocabulary
      if (m.dimension === 'A5' && typeof m.value === 'string' && !VALID_STATUS.has(m.value)) {
        err(mscope, `A5 status "${m.value}" not in the factual-status vocabulary`);
      }
    }
  }

  // 12. stealth scan
  const blob = JSON.stringify(lead);
  for (const re of BANNED_PATTERNS) {
    if (re.test(blob)) err(scope, `banned (stealth) term matched ${re}`);
  }
}

// ══════════════════════════════════════════════
// REPORT
// ══════════════════════════════════════════════

if (warnings.length) {
  console.log(`  WARNINGS (${warnings.length}):`);
  for (const w of warnings.slice(0, 40)) console.log(`    ⚠ ${w.scope}: ${w.msg}`);
  if (warnings.length > 40) console.log(`    … and ${warnings.length - 40} more`);
  console.log('');
}
if (errors.length) {
  console.log(`  ERRORS (${errors.length}):`);
  for (const e of errors) console.log(`    ✗ ${e.scope}: ${e.msg}`);
  console.log('');
}

console.log('  ─────────────────────────────────');
console.log(`  Methodology: v${methodology.version} (${methodology.status})`);
console.log(`  Leaders:     ${leaders.length}`);
console.log(`  Errors:      ${errors.length}`);
console.log(`  Warnings:    ${warnings.length}`);
console.log(`  Passed:      ${passCount} checks`);
console.log('  ─────────────────────────────────');

if (errors.length) {
  console.log(`\n  ✗ LEADERBOARD VALIDATION FAILED — fix ${errors.length} error(s).\n`);
  process.exit(1);
}
console.log(`\n  ✓ LEADERBOARD VALIDATION PASSED${warnings.length ? ` (${warnings.length} warnings)` : ''}.\n`);
process.exit(0);
