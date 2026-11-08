#!/usr/bin/env node
/**
 * Build reader-facing source lists for published issues.
 *
 *   node scripts/build-issue-sources.mjs            generate + validate (build step)
 *   node scripts/build-issue-sources.mjs --check    validate only; fail if the
 *                                                   committed files are stale
 *   node scripts/build-issue-sources.mjs --verbose  also list every unmapped
 *                                                   issue and dropped entry
 *
 * Output: src/data/sources/{id}.json, one file per published issue that has a
 * source list. The files are committed so reviewers can diff exactly what
 * readers will see, and so `astro dev` works without running this script.
 * `npm run build` regenerates them before validating, so a newly published
 * issue picks up its brief without a manual step.
 *
 * Mapping issue → brief (engine/briefs/{slug}.md) uses only explicit links:
 *   - engine/output/{slug}-reader.json            → its `id`
 *     (and `_provenance.slug` / `_provenance.issue_id` when present)
 *   - engine/output/{slug}-pipeline-state.json    → `slug` + `issue_id`
 * A brief is used only when exactly one brief links to the issue and that
 * brief links to no other issue. Topic similarity is never used.
 *
 * Fallback: an issue with no usable brief but a `sources` string in
 * src/data/issues/{id}.json gets that string, split on ";".
 *
 * Validation (fails the build): schema checks and a stealth scan of every
 * generated file against scripts/lib/stealth-terms.mjs. Entries that contain
 * a banned term are dropped at generation time and logged, so a failure here
 * means a file was edited by hand or the generator regressed.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseBriefSources, parseSourcesField } from './lib/brief-sources.mjs';
import { loadIssues } from './lib/load-issues.mjs';
import { SOURCE_BANNED_TERMS, matchStealth } from './lib/stealth-terms.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outputDir = join(root, 'engine', 'output');
const briefsDir = join(root, 'engine', 'briefs');
const sourcesDir = join(root, 'src', 'data', 'sources');

const args = new Set(process.argv.slice(2));
const CHECK = args.has('--check');
const VERBOSE = args.has('--verbose');

const ISSUE_ID = /^\d{4}$/;

// ── 1. Explicit issue ↔ brief links ────────────────────────────────────────

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function collectLinks() {
  const links = [];
  for (const f of readdirSync(outputDir).sort()) {
    if (f.endsWith('-reader.json')) {
      const obj = readJson(join(outputDir, f));
      if (!obj) continue;
      links.push({ slug: f.slice(0, -'-reader.json'.length), id: String(obj.id ?? ''), via: f });
      const prov = obj._provenance;
      if (prov?.slug) links.push({ slug: prov.slug, id: String(prov.issue_id ?? obj.id ?? ''), via: `${f} _provenance` });
    } else if (f.endsWith('-pipeline-state.json')) {
      const obj = readJson(join(outputDir, f));
      if (!obj?.slug) continue;
      links.push({ slug: obj.slug, id: String(obj.issue_id ?? ''), via: f });
      const briefPath = obj.paths?.brief;
      const m = typeof briefPath === 'string' ? /^engine\/briefs\/(.+)\.md$/.exec(briefPath) : null;
      if (m && m[1] !== obj.slug) links.push({ slug: m[1], id: String(obj.issue_id ?? ''), via: `${f} paths.brief` });
    }
  }
  // Ids that are not issue ids (e.g. a reader.json whose `id` is still its slug) link nothing.
  return links.filter((l) => ISSUE_ID.test(l.id));
}

function buildMapping(links) {
  const briefSlugs = new Set(
    readdirSync(briefsDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.slice(0, -3)),
  );
  const idsBySlug = new Map();
  const slugsById = new Map();
  for (const { slug, id } of links) {
    if (!briefSlugs.has(slug)) continue;
    if (!idsBySlug.has(slug)) idsBySlug.set(slug, new Set());
    idsBySlug.get(slug).add(id);
    if (!slugsById.has(id)) slugsById.set(id, new Set());
    slugsById.get(id).add(slug);
  }
  /** @returns {{slug: string} | {reason: string}} */
  return (id) => {
    const slugs = slugsById.get(id);
    if (!slugs) return { reason: 'no explicit link from engine/output to a brief' };
    if (slugs.size > 1) return { reason: `ambiguous: linked to ${[...slugs].join(', ')}` };
    const [slug] = slugs;
    const ids = idsBySlug.get(slug);
    if (ids.size > 1) return { reason: `ambiguous: brief ${slug} also linked to ${[...ids].filter((x) => x !== id).join(', ')}` };
    return { slug };
  };
}

// ── 2. Generate ────────────────────────────────────────────────────────────

const issues = loadIssues();
const published = issues.filter((i) => i.published === true && i.retired !== true);
const mapIssue = buildMapping(collectLinks());

const generated = new Map(); // id -> file content
const report = { brief: [], fallback: [], none: [] };
const dropped = [];

for (const issue of published) {
  const mapping = mapIssue(issue.id);
  let origin = null;
  let brief = null;
  let entries = [];
  let note = mapping.reason ?? null;

  if (mapping.slug) {
    const parsed = parseBriefSources(readFileSync(join(briefsDir, `${mapping.slug}.md`), 'utf8'));
    for (const x of parsed.excluded) dropped.push({ id: issue.id, ref: x.ref, reason: x.reason });
    if (parsed.entries.length > 0) {
      origin = 'brief';
      brief = mapping.slug;
      entries = parsed.entries;
    } else {
      note = `brief ${mapping.slug} has no usable SOURCES entries (${parsed.status})`;
    }
  }
  if (entries.length === 0 && typeof issue.sources === 'string' && issue.sources.trim()) {
    origin = 'issue-sources-field';
    entries = parseSourcesField(issue.sources);
  }

  const clean = [];
  for (const e of entries) {
    const hits = matchStealth([e.title, e.publisher, e.date, e.url].filter(Boolean).join('\n'));
    if (hits.length) {
      dropped.push({ id: issue.id, ref: e.ref, reason: `banned term: ${hits.join(', ')}` });
      continue;
    }
    clean.push(e);
  }

  if (clean.length === 0) {
    report.none.push({ id: issue.id, legacyAudit: issue.legacyAudit === true, note });
    continue;
  }
  const data = {
    id: issue.id,
    origin,
    ...(brief ? { brief } : {}),
    entries: clean.map((e, i) => ({
      n: i + 1,
      ref: e.ref,
      title: e.title,
      publisher: e.publisher,
      date: e.date,
      url: e.url,
      primary: e.primary,
    })),
  };
  generated.set(issue.id, `${JSON.stringify(data, null, 2)}\n`);
  report[origin === 'brief' ? 'brief' : 'fallback'].push({
    id: issue.id,
    brief,
    count: clean.length,
    primary: clean.filter((e) => e.primary).length,
  });
}

// ── 3. Write (or compare) ──────────────────────────────────────────────────

const existing = existsSync(sourcesDir) ? readdirSync(sourcesDir).filter((f) => f.endsWith('.json')) : [];
const stale = [];
if (CHECK) {
  for (const [id, content] of generated) {
    const path = join(sourcesDir, `${id}.json`);
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) stale.push(`${id}.json`);
  }
  for (const f of existing) if (!generated.has(f.slice(0, -5))) stale.push(`${f} (should not exist)`);
} else {
  mkdirSync(sourcesDir, { recursive: true });
  for (const f of existing) if (!generated.has(f.slice(0, -5))) unlinkSync(join(sourcesDir, f));
  for (const [id, content] of generated) {
    const path = join(sourcesDir, `${id}.json`);
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) writeFileSync(path, content, 'utf8');
  }
}

// ── 4. Validate what is on disk ────────────────────────────────────────────

const errors = [];
const publishedIds = new Set(published.map((i) => i.id));
for (const f of existsSync(sourcesDir) ? readdirSync(sourcesDir).filter((x) => x.endsWith('.json')) : []) {
  const text = readFileSync(join(sourcesDir, f), 'utf8');
  const hits = matchStealth(text, SOURCE_BANNED_TERMS);
  if (hits.length) errors.push(`${f}: banned term(s) in reader-facing sources data: ${hits.join(', ')}`);
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    errors.push(`${f}: invalid JSON (${e.message})`);
    continue;
  }
  if (`${data.id}.json` !== f) errors.push(`${f}: id "${data.id}" does not match filename`);
  if (!publishedIds.has(data.id)) errors.push(`${f}: issue ${data.id} is not published`);
  if (!Array.isArray(data.entries) || data.entries.length === 0) {
    errors.push(`${f}: entries must be a non-empty array`);
    continue;
  }
  data.entries.forEach((e, i) => {
    const at = `${f} entry ${i + 1}`;
    if (e.n !== i + 1) errors.push(`${at}: n must be ${i + 1}`);
    if (typeof e.title !== 'string' || e.title.trim().length < 2) errors.push(`${at}: title missing`);
    for (const k of ['publisher', 'date', 'url']) {
      if (e[k] !== null && typeof e[k] !== 'string') errors.push(`${at}: ${k} must be string or null`);
    }
    if (e.url && !/^https?:\/\//.test(e.url)) errors.push(`${at}: url must be http(s)`);
    if (typeof e.primary !== 'boolean') errors.push(`${at}: primary must be boolean`);
  });
}

// ── 5. Report ──────────────────────────────────────────────────────────────

const legacyNone = report.none.filter((r) => r.legacyAudit);
console.log(`Issue sources: ${published.length} published`);
console.log(`  ✓ ${report.brief.length} from research briefs (${report.brief.reduce((s, r) => s + r.count, 0)} entries)`);
console.log(`  ✓ ${report.fallback.length} from the issue's sources field`);
console.log(`  · ${report.none.length} without a source list (${legacyNone.length} pre-pipeline, covered by the legacy caveat)`);
if (dropped.length) {
  const byReason = new Map();
  for (const d of dropped) byReason.set(d.reason, (byReason.get(d.reason) ?? 0) + 1);
  console.log(`  · ${dropped.length} brief entries withheld: ${[...byReason].map(([r, n]) => `${n} ${r}`).join('; ')}`);
}
if (VERBOSE) {
  for (const r of report.brief) console.log(`    ${r.id}  ${String(r.count).padStart(3)} entries, ${String(r.primary).padStart(2)} primary  ← ${r.brief}`);
  for (const r of report.fallback) console.log(`    ${r.id}  ${String(r.count).padStart(3)} entries (sources field)`);
  for (const r of report.none) console.log(`    ${r.id}  none${r.legacyAudit ? ' [legacy]' : ''} — ${r.note ?? 'no brief and no sources field'}`);
  for (const d of dropped) console.log(`    withheld ${d.id} #${d.ref}: ${d.reason}`);
}
for (const d of dropped.filter((x) => x.reason.startsWith('banned term'))) {
  console.warn(`  ⚠ withheld ${d.id} #${d.ref} (${d.reason})`);
}

if (errors.length) {
  console.error(`\nFAIL: ${errors.length} source-data error(s):`);
  for (const e of errors) console.error(`  ${e}`);
}
if (stale.length) {
  console.error(`\nFAIL: src/data/sources is stale — run node scripts/build-issue-sources.mjs\n  ${stale.join('\n  ')}`);
}
if (errors.length || stale.length) process.exit(1);
