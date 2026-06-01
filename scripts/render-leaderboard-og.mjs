#!/usr/bin/env node
/**
 * The Plumb Line — OG share-card generator (1200×630), GATED.
 * Emits one card per RANKED leader for social sharing at launch. Until the
 * bias-audited badge is granted it refuses to render per-leader cards (no
 * provisional scores on living people ship): it emits a single generic
 * "in audit" card instead. PLUMB_PREVIEW=1 forces the full set for review.
 *
 * Reads public/leaderboard.json; writes public/og/leaderboard/*.png (built per
 * deploy, gitignored like other OG images). Run after build-leaderboard + audit.
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTDIR = process.argv[2] || join(ROOT, 'public/og/leaderboard');
mkdirSync(OUTDIR, { recursive: true });
const board = JSON.parse(readFileSync(join(ROOT, 'public/leaderboard.json'), 'utf8'));
const PREVIEW = process.env.PLUMB_PREVIEW === '1';

const T = { bg: '#0f0f23', card: '#181833', border: 'rgba(255,255,255,0.12)', sunken: '#26264a', tp: '#eef0f6', ts: '#b6bacb', tt: '#8086a0', conduct: '#5b9bf0', delivery: '#efa23c', green: '#46d07f', amber: '#f0b73c' };
const FF = 'Manrope, DejaVu Sans, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${FF}" font-size="${o.fs || 24}" font-weight="${o.fw || 400}" fill="${o.fill || T.ts}" text-anchor="${o.an || 'start'}" ${o.ls ? `letter-spacing="${o.ls}"` : ''}>${esc(s)}</text>`;
const layer = (e, id) => e.layers.find((l) => l.layer === id)?.score ?? null;
const posLabel = (e) => (e.rankRange && e.rankRange[0] !== e.rankRange[1] ? `${e.rankRange[0]}–${e.rankRange[1]}` : `${e.rank ?? '—'}`);

const W = 1200, H = 630;
async function save(svg, file) { await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${T.bg}"/>${svg}</svg>`)).png().toFile(join(OUTDIR, file)); console.log('  ✓', file); }

function chrome() {
  let s = txt(64, 78, 'THE PLUMB LINE', { fs: 30, fw: 800, fill: T.tp, ls: 3 });
  s += txt(64, 104, 'Non-partisan accountability index · The Fourth Angle', { fs: 20, fill: T.tt });
  s += txt(W - 64, 92, 'ranges, not verdicts', { fs: 18, fill: T.tt, an: 'end' });
  s += `<line x1="64" y1="128" x2="${W - 64}" y2="128" stroke="${T.border}"/>`;
  s += txt(64, H - 44, 'thefourthangle.pages.dev/plumb-line', { fs: 20, fw: 700, fill: T.ts });
  return s;
}

function leaderCard(e) {
  let s = chrome();
  const nameFs = e.name.length > 22 ? 44 : e.name.length > 16 ? 54 : 64;
  s += txt(64, 220, e.name, { fs: nameFs, fw: 800, fill: T.tp });
  s += txt(64, 262, `${(e.comparabilityClass || '').replace(/-/g, ' ')} · ${esc(e.affiliation)}`, { fs: 22, fill: T.ts });
  // conduct composite big
  s += txt(64, 380, 'CONDUCT & STRUCTURE', { fs: 20, fw: 700, fill: T.conduct, ls: 1 });
  s += txt(64, 470, String(e.composite ?? '—'), { fs: 110, fw: 800, fill: T.conduct });
  s += txt(250, 470, '/100', { fs: 30, fill: T.tt });
  s += txt(64, 510, `Rank ${posLabel(e)} of ${board.entries.length}  ·  ${Math.round(e.conductCoverage)}% coverage`, { fs: 22, fill: T.ts });
  // A/B/C + delivery chips (right)
  const chips = [['A', layer(e, 'A')], ['B', layer(e, 'B')], ['C', layer(e, 'C')], ['Delivery', e.deliveryComposite]];
  chips.forEach(([lab, v], i) => {
    const x = 760, y = 300 + i * 70;
    s += `<rect x="${x}" y="${y - 40}" width="376" height="56" rx="10" fill="${T.card}" stroke="${T.border}"/>`;
    s += txt(x + 18, y - 6, String(lab), { fs: 22, fw: 700, fill: lab === 'Delivery' ? T.delivery : T.ts });
    s += txt(x + 358, y - 6, v == null ? '—' : String(Math.round(v)), { fs: 26, fw: 800, fill: T.tp, an: 'end' });
  });
  // badge
  s += `<rect x="760" y="150" width="376" height="40" rx="20" fill="rgba(70,208,127,0.16)" stroke="${T.green}"/>` + txt(948, 177, 'BIAS-AUDITED ✓', { fs: 18, fw: 800, fill: T.green, an: 'middle', ls: 1 });
  return s;
}

function genericCard() {
  let s = chrome();
  s += txt(64, 296, 'Audited before it is published.', { fs: 50, fw: 800, fill: T.tp });
  s += txt(64, 360, `${board.counts?.total ?? 37} leaders on file · 0 ranked · badge withheld`, { fs: 26, fill: T.ts });
  s += `<rect x="64" y="400" width="640" height="120" rx="14" fill="${T.card}" stroke="${T.border}"/>`;
  s += txt(88, 446, 'No leader is ranked until an independent coder', { fs: 22, fill: T.ts });
  s += txt(88, 478, 'panel clears two bias gates. The withheld badge', { fs: 22, fill: T.ts });
  s += txt(88, 510, 'is the point — not an omission.', { fs: 22, fill: T.ts });
  s += `<rect x="760" y="430" width="376" height="44" rx="22" fill="rgba(240,183,60,0.16)" stroke="${T.amber}"/>` + txt(948, 459, 'BADGE · WITHHELD', { fs: 18, fw: 800, fill: T.amber, an: 'middle', ls: 1 });
  return s;
}

/* ---------- run (gated) ---------- */
const ranked = (!board.redacted && Array.isArray(board.entries)) ? [...board.entries, ...board.benchmarks].filter((e) => e.ranked) : [];
console.log('\n  The Plumb Line — OG cards →', OUTDIR);
if ((!board.biasAudited && !PREVIEW) || ranked.length === 0) {
  await save(genericCard(), 'index.png');
  console.log('  ⚿ gated: badge withheld or no ranks — emitted generic card only.\n');
} else {
  for (const e of ranked) await save(leaderCard(e), `${(e.slug || e.name.toLowerCase().replace(/[^a-z]+/g, '-'))}.png`);
  console.log(`  done — ${ranked.length} cards.\n`);
}
