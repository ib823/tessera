#!/usr/bin/env node
/**
 * Slim radar-summary for the social bot.
 *
 * Reads radar/output/issue-queue.json (large; ~2 MB; runs every 2h via
 * .github/workflows/radar-scan.yml). Emits public/radar-summary.json
 * containing only the fields the social bot's scorer needs:
 *
 *   { generatedAt, selectedCount, entities: {id: maxScore}, keywords: {token: maxScore} }
 *
 * Selection: items with priority ∈ {critical, high} AND confidence ≥ 0.5.
 * The map values are max(controversy_score) across all selected items that
 * contained the entity/keyword. Range 0–1.
 *
 * If radar/output/issue-queue.json is missing (no radar scan yet), an
 * empty summary is emitted — the worker treats this as "no boost," which
 * is the correct degraded behaviour.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
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

const inputPath = join(root, 'radar/output/issue-queue.json');
const outputPath = join(root, 'public/radar-summary.json');

function emit(summary) {
  writeFileSync(outputPath, JSON.stringify(summary, null, 2));
}

let queue;
try {
  queue = JSON.parse(readFileSync(inputPath, 'utf8'));
} catch (err) {
  console.warn(`radar-summary: ${inputPath} not readable (${err.code || err.message}) — emitting empty summary.`);
  emit({
    generatedAt: new Date().toISOString(),
    selectedCount: 0,
    entities: {},
    keywords: {},
  });
  process.exit(0);
}

const selected = queue.filter((x) =>
  (x.priority === 'critical' || x.priority === 'high') &&
  (x.confidence ?? 0) >= 0.5 &&
  typeof x.title === 'string' &&
  x.title.trim().length > 0,
);

const entities = {};
const keywords = {};

for (const item of selected) {
  const score = item.controversy_score ?? 0;
  if (score <= 0) continue;

  // Structured entities via the shared institutions/laws patterns. Same
  // ID format as cards.ts: "inst:PAS", "law:SOSMA", etc.
  for (const e of extractEntities(item.title)) {
    if (entities[e] === undefined || score > entities[e]) entities[e] = score;
  }

  // Topic keywords: lowercase tokens, stopword-filtered, min length 3.
  const tokens = item.title.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];
  for (const t of tokens) {
    if (STOPWORDS.has(t)) continue;
    if (keywords[t] === undefined || score > keywords[t]) keywords[t] = score;
  }
}

emit({
  generatedAt: new Date().toISOString(),
  selectedCount: selected.length,
  entities,
  keywords,
});

console.log(
  `✓ radar-summary.json (${selected.length} items → ${Object.keys(entities).length} entities, ${Object.keys(keywords).length} keywords)`,
);
