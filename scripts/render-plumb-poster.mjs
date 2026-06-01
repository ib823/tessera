#!/usr/bin/env node
/**
 * The Plumb Line — "league poster" renderer (Visual-Capitalist style).
 * A single portrait infographic: bold serif masthead, a methodology box, a
 * coalition-composition band, and the 30 ranked leaders in two columns of 15
 * with circular rank badges and right-aligned conduct scores. International
 * benchmarks sit in a separate "calibration" strip — references, not competitors.
 *
 * GATED exactly like every other Plumb Line asset: it renders the full poster
 * ONLY when the board carries the bias-audited badge OR PLUMB_PREVIEW=1. Until
 * then it refuses (no provisional scores on living people ship). When it renders
 * before the gates clear, it stamps a PREVIEW / NOT CERTIFIED watermark.
 *
 * Color encodes PARTY OF RECORD (a public fact), never a score input — the same
 * instrument scores every leader. Stated on the poster itself.
 *
 * Reads public/leaderboard.json; writes public/og/plumb-line-poster.png.
 * Run after build-leaderboard + audit. Override out path with argv[2].
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || join(ROOT, 'public/og/plumb-line-poster.png');
const board = JSON.parse(readFileSync(join(ROOT, 'public/leaderboard.json'), 'utf8'));
const PREVIEW = process.env.PLUMB_PREVIEW === '1';

if (board.redacted || !Array.isArray(board.entries)) {
  if (!PREVIEW) {
    console.log('  ⚿ Poster refused: board is redacted (badge withheld). Set PLUMB_PREVIEW=1 for an internal still.');
    process.exit(0);
  }
}
const CERTIFIED = board.biasAudited === true;

/* ---------- palette ---------- */
const cream = '#f4f0e6', ink = '#1b1b24', sub = '#5d5d6b', hair = '#d9d3c4';
const SERIF = 'DejaVu Serif, Liberation Serif, serif';
const SANS = 'DejaVu Sans, Manrope, sans-serif';
// Distinct editorial hues per coalition (distinguishable, not literal party colors).
const COAL = {
  PH:   { solid: '#2d6cdf', tint: '#e4ecfb', name: 'Pakatan Harapan' },
  BN:   { solid: '#d98b2b', tint: '#f8efe0', name: 'Barisan Nasional' },
  GPS:  { solid: '#2f9e6f', tint: '#e2f2ea', name: 'Gabungan Parti Sarawak' },
  GRS:  { solid: '#7d5bd0', tint: '#ece6f9', name: 'Gabungan Rakyat Sabah' },
  PN:   { solid: '#475569', tint: '#e8ebef', name: 'Perikatan Nasional' },
  'Ind.': { solid: '#8a8f9c', tint: '#ecedf0', name: 'Non-partisan' },
};
const BENCH = { solid: '#334155', tint: '#e7eaef' };

const coalOf = (a) => {
  const m = a.match(/\(([^)]+)\)/);
  const f = (m ? m[1] : a).trim();
  return ({ 'Pakatan Harapan': 'PH', 'Barisan Nasional': 'BN', 'Gabungan Parti Sarawak': 'GPS', 'Gabungan Rakyat Sabah': 'GRS', 'Perikatan Nasional': 'PN' })[f]
    ?? (/technocrat|Non-partisan/i.test(a) ? 'Ind.' : f);
};

/* ---------- data ---------- */
const ranked = board.entries.filter((e) => e.ranked && e.composite != null)
  .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
const benches = board.benchmarks.slice().sort((a, b) => (b.composite ?? 0) - (a.composite ?? 0));

// Coalition composition (domestic ranked only).
const comp = {};
for (const e of ranked) comp[coalOf(e.affiliation)] = (comp[coalOf(e.affiliation)] ?? 0) + 1;
const compOrder = Object.entries(comp).sort((a, b) => b[1] - a[1]);

/* ---------- svg helpers ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const T = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.ff || SANS}" font-size="${o.fs || 24}" font-weight="${o.fw || 400}" fill="${o.fill || ink}" text-anchor="${o.an || 'start'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.style ? ` font-style="${o.style}"` : ''}>${esc(s)}</text>`;

const W = 1240, MARGIN = 56;
const shortName = (n) => {
  // Drop honorific tails, keep the recognizable name short for the row.
  let s = n.replace(/\s+(Chee Keong|Bin .*|Binti .*)$/i, '').trim();
  if (s.length > 24) { const p = s.split(' '); s = p.length > 2 ? `${p[0]} ${p[p.length - 1]}` : s; }
  return s;
};

/* ---------- row renderer ---------- */
const ROW_H = 66, COL_W = (W - MARGIN * 2 - 28) / 2;
function row(e, x, y, isBench) {
  const c = isBench ? BENCH : (COAL[coalOf(e.affiliation)] ?? COAL['Ind.']);
  const range = e.rankRange && e.rankRange[0] !== e.rankRange[1];
  const posTxt = range ? `${e.rankRange[0]}–${e.rankRange[1]}` : String(e.rank ?? '—');
  let s = `<rect x="${x}" y="${y}" width="${COL_W}" height="${ROW_H - 8}" rx="9" fill="${c.tint}"/>`;
  // rank badge: circle for an exact rank, pill for a shared range (honesty mark)
  const cy = y + (ROW_H - 8) / 2;
  if (range) {
    s += `<rect x="${x + 8}" y="${cy - 16}" width="72" height="32" rx="16" fill="${c.solid}"/>`;
    s += T(x + 44, cy + 5, posTxt, { ff: SANS, fs: 17, fw: 700, fill: '#fff', an: 'middle' });
  } else {
    s += `<circle cx="${x + 28}" cy="${cy}" r="18" fill="${c.solid}"/>`;
    s += T(x + 28, cy + 6, posTxt, { ff: SANS, fs: 18, fw: 800, fill: '#fff', an: 'middle' });
  }
  const nameX = x + (range ? 90 : 60);
  s += T(nameX, cy - 2, shortName(e.name), { ff: SANS, fs: 21, fw: 700, fill: ink });
  const tag = isBench ? e.country : coalOf(e.affiliation);
  s += T(nameX, cy + 18, tag, { ff: SANS, fs: 14, fw: 600, fill: sub, ls: 0.4 });
  // score block, right-aligned
  s += T(x + COL_W - 16, cy + 9, String(e.composite ?? '—'), { ff: SERIF, fs: 30, fw: 700, fill: c.solid, an: 'end' });
  return s;
}

/* ---------- compose ---------- */
let body = '';
let y = 64;

// masthead
body += T(MARGIN, y + 6, 'THE PLUMB LINE', { ff: SANS, fs: 19, fw: 800, fill: ink, ls: 5 });
body += T(MARGIN, y + 30, 'A non-partisan accountability index · The Fourth Angle', { ff: SANS, fs: 16, fill: sub });
y += 70;
body += `<line x1="${MARGIN}" y1="${y}" x2="${W - MARGIN}" y2="${y}" stroke="${ink}" stroke-width="2"/>`;
y += 20;

// title (serif, two lines) on the left; methodology box on the right
body += T(MARGIN, y + 52, "MALAYSIA'S CABINET,", { ff: SERIF, fs: 50, fw: 700, fill: ink });
body += T(MARGIN, y + 108, 'ON THE LEVEL', { ff: SERIF, fs: 50, fw: 700, fill: ink });
body += T(MARGIN, y + 150, `${ranked.length} leaders, one fixed yardstick. World benchmarks on the same scale.`, { ff: SANS, fs: 16.5, fill: sub });

// methodology box
const mbX = 760, mbW = W - MARGIN - mbX;
body += `<rect x="${mbX}" y="${y}" width="${mbW}" height="178" rx="12" fill="#fbf9f3" stroke="${hair}"/>`;
body += T(mbX + 18, y + 28, 'WHAT THE SCORE IS', { ff: SANS, fs: 14, fw: 800, fill: ink, ls: 1.5 });
const facets = ['Crisis handling', 'Reform delivered vs promised', 'Institution-building', 'Candor on reversals', '3R restraint (process, not belief)', 'Integrity status · structural weight'];
facets.forEach((f, i) => {
  body += `<circle cx="${mbX + 25}" cy="${y + 52 + i * 21 - 4}" r="3" fill="${COAL.PH.solid}"/>`;
  body += T(mbX + 38, y + 52 + i * 21, f, { ff: SANS, fs: 14.5, fill: '#33333f' });
});
y += 200;

// composition band
body += T(MARGIN, y, 'CABINET COMPOSITION', { ff: SANS, fs: 13, fw: 800, fill: sub, ls: 1.5 });
y += 14;
const bandW = W - MARGIN * 2, total = ranked.length;
let bx = MARGIN;
for (const [k, n] of compOrder) {
  const w = (n / total) * bandW;
  const c = COAL[k] ?? COAL['Ind.'];
  body += `<rect x="${bx}" y="${y}" width="${w}" height="30" fill="${c.solid}"/>`;
  if (w > 34) body += T(bx + w / 2, y + 20, String(n), { ff: SANS, fs: 15, fw: 800, fill: '#fff', an: 'middle' });
  bx += w;
}
y += 30;
// legend
let lx = MARGIN;
for (const [k, n] of compOrder) {
  const c = COAL[k] ?? COAL['Ind.'];
  body += `<rect x="${lx}" y="${y + 12}" width="11" height="11" rx="2" fill="${c.solid}"/>`;
  const lab = `${k} ${n}`;
  body += T(lx + 17, y + 22, lab, { ff: SANS, fs: 14, fw: 600, fill: '#33333f' });
  lx += 28 + lab.length * 8.4;
}
body += T(W - MARGIN, y + 22, 'Score = Conduct & Structure track, 0–100', { ff: SANS, fs: 14, fill: sub, an: 'end' });
y += 40;

// two columns of 15
const colTop = y;
const half = Math.ceil(ranked.length / 2);
ranked.forEach((e, i) => {
  const col = i < half ? 0 : 1;
  const rowIdx = i < half ? i : i - half;
  const x = MARGIN + col * (COL_W + 28);
  body += row(e, x, colTop + rowIdx * ROW_H, false);
});
y = colTop + half * ROW_H + 10;

// benchmark strip
body += `<line x1="${MARGIN}" y1="${y}" x2="${W - MARGIN}" y2="${y}" stroke="${hair}"/>`;
y += 22;
body += T(MARGIN, y, 'INTERNATIONAL CALIBRATION ANCHORS', { ff: SANS, fs: 13, fw: 800, fill: BENCH.solid, ls: 1.2 });
body += T(W - MARGIN, y, 'references, not competitors', { ff: SANS, fs: 14, fill: sub, an: 'end', style: 'italic' });
y += 12;
const bw = (W - MARGIN * 2 - (benches.length - 1) * 14) / benches.length;
benches.forEach((e, i) => {
  const x = MARGIN + i * (bw + 14);
  body += `<rect x="${x}" y="${y}" width="${bw}" height="56" rx="9" fill="${BENCH.tint}"/>`;
  body += T(x + 14, y + 26, shortName(e.name), { ff: SANS, fs: 15, fw: 700, fill: ink, style: 'italic' });
  body += T(x + 14, y + 45, e.country, { ff: SANS, fs: 12, fw: 600, fill: sub });
  body += T(x + bw - 12, y + 38, String(e.composite ?? '—'), { ff: SERIF, fs: 26, fw: 700, fill: BENCH.solid, an: 'end' });
});
y += 56 + 22;

// footer
body += `<line x1="${MARGIN}" y1="${y}" x2="${W - MARGIN}" y2="${y}" stroke="${ink}" stroke-width="1.5"/>`;
y += 22;
body += T(MARGIN, y, 'Sources: Hansard, federal gazettes, Auditor-General reports, court-record status, asset declarations. Same instrument, every leader.', { ff: SANS, fs: 14, fill: '#33333f' });
y += 20;
body += T(MARGIN, y, 'Rank is a range where conduct bands overlap. Color encodes party of record, a public fact — it is never an input to the score.', { ff: SANS, fs: 14, fill: '#33333f' });
y += 20;
body += T(MARGIN, y, CERTIFIED ? 'Bias-audited: passed.' : 'Bias panel: not yet certified on this cohort. Provisional — not published.', { ff: SANS, fs: 14, fw: 700, fill: CERTIFIED ? COAL.GPS.solid : COAL.BN.solid });
body += T(W - MARGIN, y, 'thefourthangle.pages.dev/plumb-line', { ff: SANS, fs: 14, fw: 700, fill: ink, an: 'end' });
y += 36;

const H = y;

// preview watermark (until the badge is granted)
let watermark = '';
if (!CERTIFIED) {
  watermark =
    `<g transform="translate(${W / 2}, ${H / 2}) rotate(-26)" opacity="0.10">` +
    T(0, 0, 'PREVIEW · NOT CERTIFIED', { ff: SERIF, fs: 88, fw: 700, fill: ink, an: 'middle' }) +
    `</g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${cream}"/>${watermark}${body}</svg>`;
await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log(`  ✓ Plumb Line poster → ${OUT}  (${W}×${H}, ${ranked.length} ranked + ${benches.length} anchors${CERTIFIED ? '' : ', PREVIEW'})`);
