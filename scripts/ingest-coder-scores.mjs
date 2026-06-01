#!/usr/bin/env node
/**
 * The Plumb Line — coder-score ingestion.
 * Appends independent coders' Layer B scores to each leader's metric
 * `coderScores`, and sets the metric value to the MEDIAN of all coders. Once
 * ≥3 coders are ingested the inter-coder-reliability and partisan-signal gates
 * can compute. See docs/research/plumb-line-coder-panel.md §10C.
 *
 *   node scripts/ingest-coder-scores.mjs submission1.json submission2.json ...
 *
 * Submission shape:
 *   { "coder": "id", "scores": [ { "leader": "<slug>", "B1": 2, ..., "B5": null } ] }
 * A null score is "no qualifying event" and is skipped (not counted in α).
 * After ingestion, run: validate-leaderboard → build-leaderboard → audit-scoreboard.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEADERS = join(ROOT, 'src/data/leaders');
const files = process.argv.slice(2);
if (files.length === 0) { console.error('Usage: ingest-coder-scores.mjs <submission.json> [...]'); process.exit(1); }

const BDIMS = ['B1', 'B2', 'B3', 'B4', 'B5'];
const median = (a) => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : Math.round((s[n / 2 - 1] + s[n / 2]) / 2); };
const cache = new Map();
const load = (slug) => { if (cache.has(slug)) return cache.get(slug); const p = join(LEADERS, `${slug}.json`); if (!existsSync(p)) return null; const j = JSON.parse(readFileSync(p, 'utf8')); cache.set(slug, j); return j; };

let added = 0, skipped = 0;
for (const f of files) {
  const sub = JSON.parse(readFileSync(f, 'utf8'));
  const coder = sub.coder || f;
  for (const row of sub.scores ?? []) {
    const l = load(row.leader);
    if (!l) { console.warn(`  ! unknown leader: ${row.leader}`); continue; }
    const metrics = l.periods[0].metrics;
    for (const d of BDIMS) {
      const v = row[d];
      if (v == null) { skipped++; continue; } // no qualifying event
      if (!Number.isInteger(v) || v < 0 || v > 4) { console.warn(`  ! ${row.leader}/${d}: ${v} not 0-4`); continue; }
      const m = metrics.find((x) => x.dimension === d);
      if (!m) { console.warn(`  ! ${row.leader}/${d}: metric not on file (skipped)`); continue; }
      m.coderScores = Array.isArray(m.coderScores) ? m.coderScores : [];
      m.coderScores.push(v);
      m.value = median(m.coderScores);
      added++;
    }
  }
  console.log(`  ingested ${coder}`);
}
for (const [slug, j] of cache) writeFileSync(join(LEADERS, `${slug}.json`), `${JSON.stringify(j, null, 2)}\n`);
console.log(`\n  ✓ ${added} scores ingested across ${cache.size} leaders (${skipped} "no qualifying event" skipped).`);
console.log('  Next: node scripts/validate-leaderboard.mjs && node scripts/build-leaderboard.mjs && node scripts/audit-scoreboard.mjs\n');
