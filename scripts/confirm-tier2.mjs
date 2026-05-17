#!/usr/bin/env node
/**
 * Tier 2 Resolution Confirmation
 *
 * For each Tier 2 issue (low Stage 3 confidence), check whether the
 * currently-published cards substantially incorporate the Stage 3 critique.
 * Outputs a per-issue resolution status.
 *
 * Primary signal: revision entries in the Stage 6 synthesis JSON. The
 * synthesizer logs every revision it applied — counting Stage 3 revisions
 * is far more reliable than substring-matching pre-correction quotes
 * against the post-correction live cards.
 *
 * Fallback signal: token-match against pre-correction Stage 3 quotes, used
 * only when no synthesis exists.
 *
 * Resolution categories:
 *   RESOLVED   — synthesis logged ≥60% of expected revisions, or token check clean
 *   PARTIAL    — 30–60% logged, or token check shows some remaining
 *   UNRESOLVED — <30% logged, or token check shows many remaining
 *   STUB       — Stage 3 file has no actionable content (FAS only)
 *
 * Usage: node scripts/confirm-tier2.mjs
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIssues } from './lib/load-issues.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const engineOutDir = join(root, 'engine', 'output');

const issues = loadIssues();

// id -> slug
const idToSlug = {};
for (const f of readdirSync(engineOutDir).filter(f => f.endsWith('-reader.json'))) {
  const slug = f.replace(/-reader\.json$/, '');
  try {
    const j = JSON.parse(readFileSync(join(engineOutDir, f), 'utf8'));
    if (j.id) idToSlug[j.id] = slug;
  } catch (_) {}
}

// Tier 2 issues from the audit report
const tier2 = [
  '1043', '1146', '1871', '1887', '1958', '1960', '1961', '1962', '1963',
  '1964', '1965', '1966', '1967', '1970', '1971', '1972', '1973', '1974', '1975',
  '1977', '1978', '1979', '1980', '1983', '1987', '1988',
];

function getCardText(issue) {
  let txt = (issue.headline || '') + ' ' + (issue.context || '');
  if (issue.cards) for (const c of issue.cards) txt += ' ' + (c.big || '') + ' ' + (c.sub || '');
  return txt.toLowerCase();
}

function getCorrections(j) {
  const out = [];
  if (Array.isArray(j.claims)) {
    for (const c of j.claims) {
      const s = (c.status || '').toUpperCase();
      if (['INCORRECT', 'MISLEADING'].includes(s) && c.correction) {
        out.push({ status: s, claim: c.claim || c.statement || '', correction: c.correction });
      }
    }
  }
  for (const [field, status] of [['key_incorrect', 'INCORRECT'], ['key_misleading', 'MISLEADING'], ['key_corrections', 'CORRECTION']]) {
    if (Array.isArray(j[field])) {
      for (const c of j[field]) {
        const text = typeof c === 'string' ? c : (c.claim || c.statement || '');
        if (text) out.push({ status, claim: text, correction: typeof c === 'object' ? c.correction : null });
      }
    }
  }
  return out;
}

// Extract distinctive token (number-with-unit) from a claim string. Used by
// the fallback path when no Stage 6 synthesis exists.
function extractKeyTokens(claim) {
  const tokens = [];
  for (const m of claim.matchAll(/\b(?:RM|US\$|USD|MYR)?\s?\d[\d,.]*\s?(?:billion|million|trillion|B|M|hectares?|ha|km|MW|years?|months?|%)?/gi)) {
    const t = m[0].trim();
    if (t.length > 2 && !/^(19|20)\d{2}$/.test(t) && /\d/.test(t)) tokens.push(t.toLowerCase());
  }
  return tokens;
}

function readSynthesis(slug) {
  const p = join(engineOutDir, `${slug}-stage6-synthesis.json`);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch (_) { return null; }
}

// Count revision entries in a Stage 6 synthesis. The synthesis schema has
// drifted across pipeline editions, so we gather entries from every known
// array location and count two signals:
//   - explicit: a correction verb followed by "Stage 3" within 80 chars
//   - bare:     a correction verb with no stage attribution (Stage 3 is the
//               dominant source of factual corrections; Stages 4/5 are retired)
function countStage3Resolutions(synth) {
  if (!synth) return { explicit: 0, bare: 0 };
  const haystacks = [];
  for (const k of ['revision_log', 'revisions', 'revisions_made', 'revisions_applied', 'revision_history', 'revision_notes', 'synthesis_notes']) {
    if (Array.isArray(synth[k])) haystacks.push(...synth[k].map(String));
    else if (typeof synth[k] === 'string') haystacks.push(synth[k]);
  }
  if (Array.isArray(synth.cards)) {
    for (const c of synth.cards) {
      for (const k of ['notes', 'revisions', 'revision', 'note']) {
        if (typeof c[k] === 'string') haystacks.push(c[k]);
        else if (Array.isArray(c[k])) haystacks.push(...c[k].map(String));
      }
    }
  }
  const VERB = '(?:CORRECTED|REMOVED|REPLACED|REPHRASED|REVISED)';
  const explicitRe = new RegExp(`\\b${VERB}\\b[\\s\\S]{0,80}?\\bStage\\s*3\\b`, 'gi');
  const otherStageRe = /\bStage\s*[2456]\b/i;
  const bareRe = new RegExp(`\\b${VERB}\\b`, 'i');
  let explicit = 0;
  let bare = 0;
  for (const h of haystacks) {
    const ex = h.match(explicitRe);
    if (ex && ex.length > 0) {
      explicit += ex.length;
      continue;
    }
    if (bareRe.test(h) && !otherStageRe.test(h)) {
      bare++;
    }
  }
  return { explicit, bare };
}

const report = [];
report.push('# Tier 2 Resolution Confirmation — ' + new Date().toISOString().slice(0, 10));
report.push('');
report.push('For each Tier 2 issue (low Stage 3 confidence), checks whether the currently-published cards substantially incorporate the Stage 3 critique. Primary signal is the Stage 6 synthesis revision log; fallback is a token check against pre-correction quotes.');
report.push('');
report.push('| ID | Resolution | Notes |');
report.push('|---|---|---|');

const counts = { RESOLVED: 0, PARTIAL: 0, UNRESOLVED: 0, STUB: 0 };

for (const id of tier2) {
  const slug = idToSlug[id];
  const issue = issues.find(i => i.id === id);
  if (!slug || !issue) continue;
  const path = join(engineOutDir, `${slug}-stage3.json`);
  if (!existsSync(path)) continue;
  const j = JSON.parse(readFileSync(path, 'utf8'));
  const corrections = getCorrections(j);
  const cardText = getCardText(issue);
  const synth = readSynthesis(slug);
  const { explicit, bare } = countStage3Resolutions(synth);
  const totalResolutions = explicit + bare;

  if (corrections.length === 0) {
    counts.STUB++;
    const synthNote = totalResolutions > 0 ? `; Stage 6 synthesis logged ${totalResolutions} revision(s)` : '';
    report.push(`| ${id} | STUB | Stage 3 has FAS=${j.factual_accuracy_score} but no actionable claims/corrections — no audit signal${synthNote} |`);
    continue;
  }

  const total = corrections.length;
  let status, note;

  // Primary signal: revision entries in the Stage 6 synthesis.
  if (synth && totalResolutions > 0) {
    const ratio = totalResolutions / total;
    const breakdown = explicit > 0 && bare > 0
      ? `${explicit} explicit + ${bare} untagged`
      : explicit > 0 ? `${explicit} explicit` : `${bare} untagged`;
    if (ratio >= 0.6) {
      status = 'RESOLVED';
      note = `Stage 6 synthesis logged ${totalResolutions} revisions (${breakdown}); ≥60% of ${total} flagged`;
      counts.RESOLVED++;
    } else if (ratio >= 0.3) {
      status = 'PARTIAL';
      note = `Stage 6 synthesis logged ${totalResolutions} of ${total} expected revisions (${breakdown})`;
      counts.PARTIAL++;
    } else {
      status = 'UNRESOLVED';
      note = `Only ${totalResolutions} of ${total} expected revisions in Stage 6 synthesis (${breakdown})`;
      counts.UNRESOLVED++;
    }
    report.push(`| ${id} | ${status} | ${note} |`);
    continue;
  }

  // Fallback: token match against pre-correction quotes. Less reliable.
  let stillPresent = 0;
  for (const c of corrections) {
    const tokens = extractKeyTokens(c.claim);
    if (tokens.length === 0) continue;
    const anyHit = tokens.some(t => cardText.includes(t));
    if (anyHit) stillPresent++;
  }
  const synthMissingNote = synth ? ' (no revisions logged in Stage 6 synthesis)' : ' (no Stage 6 synthesis)';
  if (stillPresent === 0) {
    status = 'RESOLVED';
    note = `Token check: all ${total} flagged claims absent from current cards${synthMissingNote}`;
    counts.RESOLVED++;
  } else if (stillPresent <= Math.ceil(total / 4)) {
    status = 'PARTIAL';
    note = `Token check: ${stillPresent} of ${total} flagged claims may still be present${synthMissingNote}`;
    counts.PARTIAL++;
  } else {
    status = 'UNRESOLVED';
    note = `Token check: ${stillPresent} of ${total} flagged claims likely still in cards${synthMissingNote}`;
    counts.UNRESOLVED++;
  }
  report.push(`| ${id} | ${status} | ${note} |`);
}

report.push('');
report.push('## Summary');
report.push('');
report.push(`| Status | Count |`);
report.push(`|---|---:|`);
report.push(`| RESOLVED | ${counts.RESOLVED} |`);
report.push(`| PARTIAL | ${counts.PARTIAL} |`);
report.push(`| UNRESOLVED | ${counts.UNRESOLVED} |`);
report.push(`| STUB (no actionable Stage 3) | ${counts.STUB} |`);
report.push('');
report.push('## Interpretation');
report.push('');
report.push('Resolution is determined primarily from revision entries in the Stage 6 synthesis (`revision_log`, `revisions`, `revisions_applied`, or inline card `notes`). Explicit Stage 3 attribution is the strongest signal; bare correction verbs without stage labels are treated as a weaker proxy since Stage 3 is the dominant source of factual corrections in the active pipeline (Stages 4 and 5 are retired).');
report.push('');
report.push('When no synthesis is available, a fallback token-match against the pre-correction Stage 3 quotes is used. This is less reliable because corrected wording often shares tokens (numbers, named entities) with the original.');
report.push('');
report.push('Use `node scripts/view-stage3.mjs <id>` to inspect the cross-reference between Stage 3 critique and current cards on any specific issue.');

const today = new Date().toISOString().slice(0, 10);
const outPath = join(engineOutDir, `tier2-confirmation-${today}.md`);
writeFileSync(outPath, report.join('\n'));

console.log('');
console.log('  Tier 2 Resolution Confirmation');
console.log('  ───────────────────────────────');
for (const [k, v] of Object.entries(counts)) {
  console.log(`  ${k.padEnd(12)} ${v}`);
}
console.log('  ───────────────────────────────');
console.log(`  Report: ${outPath}`);
console.log('');
