#!/usr/bin/env node
/**
 * The Plumb Line — consolidated blind coder prompt builder.
 * Emits ONE prompt (all leaders' B1–B5 evidence, scores + evaluative
 * conclusions stripped) for an external reviewer model to score in a single
 * JSON response. Run it in 2–3 DIFFERENT model families for cross-model
 * independence, then ingest the JSONs with scripts/ingest-coder-scores.mjs.
 *
 * Output: ./coder-packets/coder-prompt.txt (override dir with an argument).
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEADERS = join(ROOT, 'src/data/leaders');
const OUT = process.argv[2] || join(ROOT, 'coder-packets');
mkdirSync(OUT, { recursive: true });
// Optional: restrict to a comma-separated slug list, e.g. PLUMB_ONLY=abang-johari-openg,hajiji-noor
const ONLY = (process.env.PLUMB_ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);

const BDIMS = ['B1', 'B2', 'B3', 'B4', 'B5'];
const NAMES = { B1: 'Crisis handling', B2: 'Reform delivered vs promised', B3: 'Consensus & institution-building', B4: 'Candor on reversals', B5: 'Process discipline (restraint from inflaming Race/Religion/Royalty)' };
const ANCHORS = {
  B1: '0 worsened/evaded · 1 weak, mostly reactive · 2 adequate, mixed outcomes · 3 mostly effective, some gaps · 4 decisive, measurable resolution',
  B2: '0 championed then abandoned/reversed · 1 mostly stalled · 2 partial with material dilution · 3 largely delivered, minor dilution · 4 gazetted and operative as promised',
  B3: '0 institutional capture / norm erosion · 1 net-negative for norms · 2 worked within without strengthening · 3 some documented strengthening · 4 documented strengthening / cross-bench instrument',
  B4: '0 reversed while denying · 1 reversed, minimal acknowledgement · 2 reversed without explanation · 3 reversed, partial explanation · 4 reversed and explained on the record',
  B5: '0 documented inflaming of 3R for advantage · 1 contested rhetoric, leaning inflame · 2 no documented instances · 3 a documented de-escalation · 4 documented dated 3R de-escalation',
};
// Strip the prior reviewer's score (anchor) AND, to reduce leading, a trailing
// evaluative sentence (one with no date/number). Coders score the facts.
function factsOnly(s) {
  let t = String(s).replace(/\s*\(anchor\s*\d\)\s*/gi, ' ').trim();
  const parts = t.split(/(?<=\.)\s+/);
  if (parts.length > 1 && !/\d/.test(parts[parts.length - 1])) parts.pop();
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

let body = '';
let n = 0;
for (const f of readdirSync(LEADERS).filter((x) => x.endsWith('.json'))) {
  const l = JSON.parse(readFileSync(join(LEADERS, f), 'utf8'));
  if (ONLY.length && !ONLY.includes(l.slug)) continue;
  const metrics = (l.periods ?? []).flatMap((p) => p.metrics ?? []);
  const bm = metrics.filter((m) => BDIMS.includes(m.dimension));
  if (bm.length === 0) continue;
  const period = l.periods?.[0] ?? {};
  n++;
  body += `\n### ${l.slug}  (${l.name} — ${period.office || period.role || ''})\n`;
  for (const d of BDIMS) {
    const m = bm.find((x) => x.dimension === d);
    body += `- ${d} ${NAMES[d]}:`;
    if (!m) { body += ` no event provided — score null unless you can cite a dated one.\n`; continue; }
    body += ` ${factsOnly(m.justification || '')}`;
    if (m.citation) body += `  [source: ${m.citation.publisher}, ${m.citation.date}]`;
    body += `\n`;
  }
}

const prompt = `You are an INDEPENDENT REVIEWER ("coder") for a strictly non-partisan Malaysian
accountability index. Score the editorial-conduct record of ${n} leaders on five
dimensions. This is a blind, solo task: do not look up how anyone else scored, and
apply EXACTLY the same standard to a government minister, an opposition figure, and an
international benchmark. You have no stake in any coalition; score conduct, not party.

For each leader, score B1–B5 as an INTEGER 0–4 (whole numbers only). Use the FULL
five-point scale: 1 and 3 are first-class scores, not rounding errors. Most real
records fall BETWEEN the textbook anchors — when a record is better than the "2"
anchor but short of the "4", score it 3; when worse than "2" but not a clean "0",
score it 1. Do NOT default to even numbers {0,2,4}; a panel that only uses even
scores destroys inter-coder reliability. Reserve 0 and 4 for clear, uncontested cases.
Anchors:
  B1 ${ANCHORS.B1}
  B2 ${ANCHORS.B2}
  B3 ${ANCHORS.B3}
  B4 ${ANCHORS.B4}
  B5 ${ANCHORS.B5}
Rules:
- Score the FACTS below, not any evaluative framing. The note is a neutral factual
  summary of dated public-record events; form your own judgement.
- A score is the aggregate of the record on that dimension over the tenure, not one episode.
- Conservatism both ways: do not give a 4 on thin evidence; do not give a 0 on contested
  or single-source material. A 0 or a 4 needs explicit, uncontested grounds.
- B5 (Race/Religion/Royalty restraint) is the most sensitive: score 0 or 4 ONLY with an
  uncontested, dated finding; heated rhetoric one side reads as inflaming and another
  defends is contested → 2 or null. Critique conduct, never a community or belief.
- Use null where there is no qualifying dated event for that dimension.
- Do NOT score a leader's relative's, associate's, or predecessor's matter against them.

EVIDENCE (facts only):
${body}

OUTPUT: Return ONLY valid JSON, no prose before or after, in exactly this shape
(replace <model> with your own model name, e.g. the product you are):
{
  "coder": "<model>",
  "scores": [
    { "leader": "<slug>", "B1": 0, "B2": 0, "B3": 0, "B4": 0, "B5": null,
      "why": { "B1": "one short reason", "B2": "...", "B3": "...", "B4": "...", "B5": "no qualifying event" } }
  ]
}
Score every leader listed. Integers 0–4 or null only. Keep each "why" to one line.`;

const file = join(OUT, 'coder-prompt.txt');
writeFileSync(file, prompt);
console.log(`\n  Consolidated blind coder prompt → ${file}\n  ${n} leaders · ${(prompt.length / 1024).toFixed(1)} KB. Run it in 2–3 different model families.\n`);
