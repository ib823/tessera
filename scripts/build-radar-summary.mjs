#!/usr/bin/env node
/**
 * Slim radar-summary for the social bot.
 *
 * Reads radar/output/issue-queue.json (large; ~2 MB; runs every 2h via
 * .github/workflows/radar-scan.yml). Emits engine/private/radar-summary.json
 * containing only the fields the social bot's scorer needs:
 *
 *   { generatedAt, selectedCount, entities: {id: maxScore}, keywords: {token: maxScore} }
 *
 * Selection: items with priority ∈ {critical, high} AND confidence ≥ 0.5.
 * The map values are max(controversy_score) across all selected items that
 * contained the entity/keyword. Range 0–1.
 *
 * Output is written to engine/private/ (gitignored) and uploaded to KV by CI
 * as `radar:current` — it is NOT served on the public site, so the bot's
 * topic-surfacing signal stays out of view.
 *
 * If radar/output/issue-queue.json is missing (no radar scan yet), an
 * empty summary is emitted — the worker treats this as "no boost," which
 * is the correct degraded behaviour.
 * --require-fresh is for the production data-sync job: missing, malformed,
 * stale or future scan input is an error, and no summary is written.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractEntities } from './lib/entity-patterns.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Mirrors STOPWORDS used in workers/social/src/trends.ts and
// scripts/build-social-cards.mjs so radar keywords compete on the same
// vocabulary as today's news headlines and the card index.
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this',
  'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your',
  'he', 'she', 'his', 'her', 'i', 'me', 'my', 'who', 'what', 'when', 'where', 'why', 'how',
  'not', 'no', 'so', 'if', 'than', 'then', 'also', 'all', 'one', 'two', 'three', 'malaysia',
  'malaysian', 'government', 'people', 'public', 'years', 'year', 'said', 'says', 'about',
  'over', 'after', 'before', 'between', 'into', 'out', 'up', 'down', 'more', 'most',
]);

const MAX_SCAN_AGE_MS = 4 * 60 * 60 * 1000;
const MAX_EVIDENCE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function timestamp(value) {
  // Date.parse also accepts date-only/local-time strings and normalizes
  // impossible dates. CI requires an explicit timezone and a real date.
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  const millis = Date.parse(value);
  if (!match || !Number.isFinite(millis)) return null;
  const [, year, month, day, hour, minute, second, zone] = match;
  const offsetMinutes = zone === 'Z' ? 0
    : (zone[0] === '+' ? 1 : -1) * (Number(zone.slice(1, 3)) * 60 + Number(zone.slice(4)));
  const local = new Date(millis + offsetMinutes * 60 * 1000);
  if (local.getUTCFullYear() !== Number(year) || local.getUTCMonth() + 1 !== Number(month)
      || local.getUTCDate() !== Number(day) || local.getUTCHours() !== Number(hour)
      || local.getUTCMinutes() !== Number(minute) || local.getUTCSeconds() !== Number(second)) return null;
  return millis;
}

function validateQueue(queue, scanAt) {
  if (!Array.isArray(queue)) throw new Error('issue queue must be an array');
  const titles = new Set();
  for (const [index, item] of queue.entries()) {
    const fail = (message) => { throw new Error(`queue[${index}]: ${message}`); };
    if (!item || typeof item !== 'object' || Array.isArray(item)) fail('must be an object');
    if (typeof item.title !== 'string' || !item.title.trim()) fail('title must be nonempty');
    if (titles.has(item.title)) fail('duplicate title');
    titles.add(item.title);
    if (!['low', 'medium', 'high', 'critical'].includes(item.priority)) fail('invalid priority');
    for (const field of ['controversy_score', 'confidence']) {
      if (!Number.isFinite(item[field]) || item[field] < 0 || item[field] > 1) fail(`invalid ${field}`);
    }
    for (const field of ['timestamp', 'last_evidence_at', 'first_seen', 'peak_at']) {
      if (field !== 'timestamp' && item[field] === undefined) continue;
      const at = timestamp(item[field]);
      if (at === null) fail(`invalid ${field}`);
      if (at > scanAt) fail(`${field} is newer than the scan`);
      if ((field === 'timestamp' || field === 'last_evidence_at') && scanAt - at > MAX_EVIDENCE_AGE_MS) {
        fail(`${field} is older than the seven-day queue window`);
      }
    }
  }
}

export function buildRadarSummary(queue, { health = null, requireFresh = false, now = new Date() } = {}) {
  const scanAt = timestamp(health?.last_scan);
  if (requireFresh) {
    if (scanAt === null) throw new Error('health.last_scan must be a valid ISO timestamp with timezone');
    if (scanAt > now.getTime()) throw new Error('health.last_scan is in the future');
    if (now.getTime() - scanAt > MAX_SCAN_AGE_MS) throw new Error('health.last_scan is older than four hours');
    validateQueue(queue, scanAt);
  }

  const selected = (Array.isArray(queue) ? queue : []).filter((x) => x &&
    (x.priority === 'critical' || x.priority === 'high') &&
    (x.confidence ?? 0) >= 0.5 && typeof x.title === 'string' && x.title.trim().length > 0);
  const entities = {};
  const keywords = {};
  for (const item of selected) {
    const score = item.controversy_score ?? 0;
    if (score <= 0) continue;
    for (const entity of extractEntities(item.title)) {
      if (entities[entity] === undefined || score > entities[entity]) entities[entity] = score;
    }
    const tokens = item.title.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];
    for (const token of tokens) {
      if (STOPWORDS.has(token)) continue;
      if (keywords[token] === undefined || score > keywords[token]) keywords[token] = score;
    }
  }
  // Source freshness must survive rebuilding: building an old checkout does
  // not turn its Radar evidence into a new scan.
  return { generatedAt: new Date(scanAt ?? now.getTime()).toISOString(),
    selectedCount: selected.length, entities, keywords };
}

export function main({ rootDir = root, args = process.argv.slice(2), now = new Date() } = {}) {
  const requireFresh = args.includes('--require-fresh');
  const inputPath = join(rootDir, 'radar/output/issue-queue.json');
  let queue;
  try {
    queue = JSON.parse(readFileSync(inputPath, 'utf8'));
  } catch (error) {
    if (requireFresh) throw new Error(`issue queue is unreadable: ${error.code || error.message}`);
    console.warn(`radar-summary: ${inputPath} not readable (${error.code || error.message}) — emitting empty summary.`);
    queue = [];
  }
  let health = null;
  try {
    health = JSON.parse(readFileSync(join(rootDir, 'radar/output/health.json'), 'utf8'));
  } catch (error) {
    if (requireFresh) throw new Error(`scan health is unreadable: ${error.code || error.message}`);
  }
  const summary = buildRadarSummary(queue, { health, requireFresh, now });
  const outputDir = join(rootDir, 'engine/private');
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, 'radar-summary.json'), JSON.stringify(summary, null, 2));
  console.log(`✓ engine/private/radar-summary.json (${summary.selectedCount} items → ${Object.keys(summary.entities).length} entities, ${Object.keys(summary.keywords).length} keywords)`);
  return summary;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); }
  catch (error) {
    console.error(`radar-summary: ${error.message}`);
    process.exitCode = 1;
  }
}
