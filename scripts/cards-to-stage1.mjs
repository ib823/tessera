#!/usr/bin/env node
/**
 * Convert a live issue JSON (src/data/issues/{id}.json) to a Stage 1
 * analysis JSON (engine/output/{slug}-stage1.json), so the external-
 * stages orchestrator has something to feed Gemini/Codex against.
 *
 * This is for REBUILD / SOFTEN tier issues that never went through
 * the formal pipeline — we use the current live cards as the Stage 1
 * artifact so Stage 2/3 can verify what readers are actually seeing.
 *
 * Usage:
 *   node scripts/cards-to-stage1.mjs <id> <slug>
 *
 * The slug is required because engine artifacts use slug-based paths
 * but src/data/issues uses id-based paths. The mapping is editorial.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
const slug = process.argv[3];

if (!id || !slug) {
  console.error('Usage: node scripts/cards-to-stage1.mjs <id> <slug>');
  process.exit(1);
}

const issuePath = join(root, 'src', 'data', 'issues', `${id}.json`);
const stage1Path = join(root, 'engine', 'output', `${slug}-stage1.json`);

if (!existsSync(issuePath)) {
  console.error(`Issue not found: ${issuePath}`);
  process.exit(1);
}

const issue = JSON.parse(readFileSync(issuePath, 'utf8'));

// Map published-card schema to Stage 1 schema.
// Published cards: { t, big, sub, lens? }
// Stage 1 cards:
//   hook:   { t:'hook',    text, sub }
//   fact:   { t:'fact',    lens, h, s, d }
//   reframe:{ t:'reframe', h:'The reframe',   text }
//   analogy:{ t:'analogy', h:'The analogy',   text }
//   view:   { t:'mature',  h:'The considered view', text }
function toStage1Card(c) {
  switch (c.t) {
    case 'hook':
      return { t: 'hook', text: c.big || '', sub: c.sub || '' };
    case 'fact':
      return {
        t: 'fact',
        lens: c.lens || 'Social',
        h: c.big || '',
        s: c.sub || '',
        // d: combined big+sub gives Stage 3 the full claim surface
        d: ((c.big || '') + (c.sub ? ' ' + c.sub : '')).trim(),
      };
    case 'reframe':
      return { t: 'reframe', h: 'The reframe', text: c.big || '', ...(c.sub ? { sub: c.sub } : {}) };
    case 'analogy':
      return { t: 'analogy', h: 'The analogy', text: c.big || '', ...(c.sub ? { sub: c.sub } : {}) };
    case 'view':
      return { t: 'mature', h: 'The considered view', text: c.big || '', ...(c.sub ? { sub: c.sub } : {}) };
    default:
      return { t: c.t, text: c.big || '', ...(c.sub ? { sub: c.sub } : {}) };
  }
}

const lensesUsed = [...new Set((issue.cards || [])
  .filter(c => c.t === 'fact' && c.lens)
  .map(c => c.lens))];

const ALL_LENSES = ['Legal', 'Rights', 'Economic', 'Governance', 'Technology', 'Social', 'Political', 'Health', 'Environmental', 'Regional', 'Historical', 'Critical', 'Theological', 'Security'];
const lensesUnused = ALL_LENSES.filter(l => !lensesUsed.includes(l));

const stage1 = {
  _provenance: {
    stage: 'Stage 1 — derived from live cards for retroactive Stage 2/3 verification',
    issue_id: id,
    slug,
    derived_from: `src/data/issues/${id}.json`,
    derived_at: new Date().toISOString().slice(0, 10),
    note: 'This Stage 1 JSON was reconstructed from the currently-published cards so external Stage 2 (Gemini bias) and Stage 3 (Codex fact-check) reviews can verify what readers see. It is not the original analysis — the original pipeline was not run on this issue.',
  },
  headline: issue.headline,
  context: issue.context,
  cards: (issue.cards || []).map(toStage1Card),
  sources: (issue.related || []).map(rid => `T4A related issue ${rid}`),
  confidence: 'Low — derived from published cards, original brief not on disk; submit for retroactive Stage 2/3 verification',
  lenses_used: lensesUsed,
  lenses_applicable_but_unused: lensesUnused,
};

writeFileSync(stage1Path, JSON.stringify(stage1, null, 2) + '\n');
console.log(`Wrote ${stage1Path} (${stage1.cards.length} cards, lenses: ${lensesUsed.join('/')})`);
