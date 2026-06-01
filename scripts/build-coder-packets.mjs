#!/usr/bin/env node
/**
 * The Plumb Line — blind coder packet builder.
 * Emits one evidence packet per leader (B1–B5 cited sources + the reported
 * event), with ALL scores stripped, so independent coders score from the
 * evidence without seeing any existing score. See
 * docs/research/plumb-line-coder-panel.md §9–10.
 *
 * Output dir defaults to ./coder-packets ; override with an argument.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEADERS = join(ROOT, 'src/data/leaders');
const OUT = process.argv[2] || join(ROOT, 'coder-packets');
mkdirSync(OUT, { recursive: true });

const BDIMS = ['B1', 'B2', 'B3', 'B4', 'B5'];
const NAMES = { B1: 'Crisis handling', B2: 'Reform delivered vs promised', B3: 'Consensus & institution-building', B4: 'Candor on reversals', B5: 'Process discipline (3R restraint)' };
const ANCHORS = {
  B1: ['worsened/evaded', 'adequate, mixed outcomes', 'decisive, measurable resolution'],
  B2: ['championed then abandoned/reversed', 'partial with material dilution', 'gazetted and operative as promised'],
  B3: ['institutional capture / norm erosion', 'worked within without strengthening', 'documented strengthening / cross-bench instrument'],
  B4: ['reversed while denying', 'reversed without explanation', 'reversed and explained on the record'],
  B5: ['documented inflaming of 3R', 'no documented instances either way', 'documented dated 3R de-escalation'],
};
// Strip score cues so the packet does not lead the coder.
const stripScore = (s) => String(s).replace(/\s*\(anchor\s*\d\)\s*\.?/gi, '.').replace(/\s+/g, ' ').trim();

let made = 0;
for (const f of readdirSync(LEADERS).filter((x) => x.endsWith('.json'))) {
  const l = JSON.parse(readFileSync(join(LEADERS, f), 'utf8'));
  const metrics = (l.periods ?? []).flatMap((p) => p.metrics ?? []);
  const bm = metrics.filter((m) => BDIMS.includes(m.dimension));
  if (bm.length === 0) continue; // no Layer B (e.g. Dec-2025 newcomers) — nothing to score yet
  const period = l.periods?.[0] ?? {};
  let md = `# Coder packet — ${l.name}\n\n`;
  md += `**Slug (enter this in the submission form):** \`${l.slug}\`  \n`;
  md += `**Role:** ${(period.office || period.role || '').toString()}  \n`;
  md += `**Tenure from:** ${period.from || '—'}  ·  **Country:** ${l.country}\n\n`;
  md += `Score each dimension as an integer **0–4** (or \`no qualifying event\`). Open the cited\n`;
  md += `sources and score from the record. The "reported event" line is a neutral summary,\n`;
  md += `not a recommendation. Apply the same standard you would to any leader.\n\n`;
  for (const d of BDIMS) {
    const m = bm.find((x) => x.dimension === d);
    md += `## ${d} — ${NAMES[d]}\n`;
    md += `Anchors: **0** ${ANCHORS[d][0]} · **2** ${ANCHORS[d][1]} · **4** ${ANCHORS[d][2]}\n\n`;
    if (!m) { md += `_No qualifying event on file. Score \`no qualifying event\` unless you can cite a dated one._\n\n`; continue; }
    md += `- Reported event: ${stripScore(m.justification || '')}\n`;
    if (m.citation) md += `- Source: ${m.citation.title} — ${m.citation.publisher}, ${m.citation.date}, ${m.citation.url} (tier ${m.citation.tier})\n`;
    md += `\n**Your score (0–4 or "no qualifying event"): ____    Why (1 dated line): ________________________**\n\n`;
  }
  writeFileSync(join(OUT, `${l.slug}.md`), md);
  made++;
}
console.log(`\n  Coder packets → ${OUT}\n  ✓ ${made} packets (scores stripped).\n`);
