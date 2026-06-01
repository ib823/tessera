#!/usr/bin/env node
/**
 * The Plumb Line — preview stills renderer
 * ----------------------------------------------------------------
 * Rasterises the accountability board's visual tiers to PNG stills WITHOUT a
 * browser (sharp → SVG → PNG), for docs, social, and review in environments
 * (CI, sandboxes) where Chromium is unavailable. Faithful to the Svelte
 * components' encoding: two-track colours, provisional hatching, integrity
 * bands, coverage, benchmark reference lines.
 *
 * Reads public/leaderboard.json (run `npm run build-leaderboard` first).
 * Output dir defaults to ./plumb-line-stills (gitignored via *.png); override
 * with `node scripts/render-plumb-line-preview.mjs <outdir>`.
 *
 * Renders: 1-field, 2-cards, 3-heatmap, 4-mobile, 5-explainer (rank-range collapse).
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || join(ROOT, 'plumb-line-stills');
mkdirSync(OUT, { recursive: true });
const board = JSON.parse(readFileSync(join(ROOT, 'public/leaderboard.json'), 'utf8'));

const T = {
  bg: '#0f0f23', card: '#181833', border: 'rgba(255,255,255,0.10)', sunken: '#26264a',
  tp: '#eef0f6', ts: '#b6bacb', tt: '#8086a0', conduct: '#5b9bf0', delivery: '#efa23c',
  green: '#46d07f', greenBg: 'rgba(70,208,127,0.16)', amber: '#f0b73c', amberBg: 'rgba(240,183,60,0.16)',
  red: '#f0685f', redBg: 'rgba(240,104,95,0.16)',
};
const COAL = { PH: '#5b8fb0', BN: '#a8794e', GPS: '#6f9e78', GRS: '#9a8bbf', PN: '#9aa0a6', 'Ind.': '#9aa0a6' };
const FF = 'Manrope, DejaVu Sans, Verdana, sans-serif';
const SHORT = { A1: 'Legislative', A2: 'Presence', A3: 'Pledges', A4: 'Fiscal', A5: 'Integrity', B1: 'Crisis handling', B2: 'Reform', B3: 'Consensus', B4: 'Candor', B5: '3R restraint', C1: 'Pivotality', C2: 'Governance', C3: 'Network' };
const FULLC = { SG: 'Singapore', ID: 'Indonesia', PH: 'Philippines', US: 'USA', EU: 'EU' };
const surname = (n) => { const p = n.split(' ').filter((x) => !/^(jr|sr|ii|iii|iv)$/i.test(x)); return p[p.length - 1]; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const coalOf = (a) => { const m = a.match(/\(([^)]+)\)/); const f = (m ? m[1] : a).trim(); const k = { 'Pakatan Harapan': 'PH', 'Barisan Nasional': 'BN', 'Gabungan Parti Sarawak': 'GPS', 'Gabungan Rakyat Sabah': 'GRS', 'Perikatan Nasional': 'PN' }; return k[f] ?? (/technocrat|Non-partisan/i.test(a) ? 'Ind.' : f); };
const deliverySet = new Set(board.tracks.delivery.dimensions);
const dimsOf = (e) => e.layers.flatMap((l) => l.dimensions);
const conductMean = (e) => { const v = dimsOf(e).filter((d) => d.layer === 'B' && d.status === 'on-file-provisional-single-coder' && typeof d.recorded?.value === 'number').map((d) => Number(d.recorded.value)); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length) * 25 : null; };
const a5band = (s) => !s ? 'none' : ['none-on-record', 'declared', 'acquitted'].includes(s) ? 'clean' : s === 'convicted' ? 'adverse' : 'caution';
const DEFS = `<defs><pattern id="hc" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><rect width="6" height="6" fill="${T.conduct}" opacity="0.4"/><line x1="0" y1="0" x2="0" y2="6" stroke="#fff" stroke-width="2" opacity="0.5"/></pattern><pattern id="hd" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><rect width="6" height="6" fill="${T.delivery}" opacity="0.4"/><line x1="0" y1="0" x2="0" y2="6" stroke="#fff" stroke-width="2" opacity="0.5"/></pattern></defs>`;
const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${FF}" font-size="${o.fs || 12}" font-weight="${o.fw || 400}" fill="${o.fill || T.ts}" text-anchor="${o.an || 'start'}" ${o.ls ? `letter-spacing="${o.ls}"` : ''}>${esc(s)}</text>`;
async function png(svg, file, w, h) { await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${DEFS}<rect width="${w}" height="${h}" fill="${T.bg}"/>${svg}</svg>`)).png().toFile(join(OUT, file)); console.log('  ✓', file); }

/* ---------- 1 · FIELD ---------- */
function field() {
  const W = 1200, padL = 50, padR = 50, axisY = 300, innerW = W - padL - padR, R = 9, STEP = 21, binW = 18;
  const sx = (v) => padL + (v / 100) * innerW;
  const subs = board.entries.filter((e) => !e.benchmark).map((e) => ({ e, x: conductMean(e), cov: e.conductCoverage, c: coalOf(e.affiliation) })).filter((p) => p.x !== null).sort((a, b) => a.x - b.x);
  const noC = board.entries.filter((e) => conductMean(e) === null).length;
  const bench = board.benchmarks.map((e) => ({ e, x: conductMean(e) })).filter((b) => b.x !== null).sort((a, b) => a.x - b.x);
  const bins = {}; const dots = subs.map((p) => { const b = Math.round(sx(p.x) / binW); const k = bins[b] ?? 0; bins[b] = k + 1; return { ...p, cx: sx(p.x), cy: axisY - R - 4 - k * STEP }; });
  let s = txt(padL, 34, 'THE FIELD — PROVISIONAL CONDUCT SIGNAL', { fs: 17, fw: 800, fill: T.tp, ls: 0.5 });
  s += txt(padL, 56, 'Single-coder Layer B mean (0–100). NOT a rank — a draft distribution; fainter dots = less data. Dashed lines = international benchmarks.', { fs: 12.5, fill: T.ts });
  for (const b of bench) { s += `<line x1="${sx(b.x)}" x2="${sx(b.x)}" y1="78" y2="${axisY}" stroke="${T.tt}" stroke-width="1" stroke-dasharray="3 3" opacity="0.5"/>`; s += txt(sx(b.x), 90, surname(b.e.name), { fs: 12, fw: 800, fill: T.tt, an: 'middle' }); }
  s += `<line x1="${padL}" x2="${W - padR}" y1="${axisY}" y2="${axisY}" stroke="${T.border}" stroke-width="1"/>`;
  for (const t of [0, 25, 50, 75, 100]) s += `<line x1="${sx(t)}" x2="${sx(t)}" y1="${axisY}" y2="${axisY + 5}" stroke="${T.tt}"/>` + txt(sx(t), axisY + 20, t, { fs: 12, fill: T.tt, an: 'middle' });
  s += txt(padL, axisY + 40, '← weaker conduct signal', { fs: 12, fill: T.tt }) + txt(W - padR, axisY + 40, 'stronger →', { fs: 12, fill: T.tt, an: 'end' });
  for (const d of dots) s += `<circle cx="${d.cx}" cy="${d.cy}" r="${R}" fill="${COAL[d.c] || '#9aa0a6'}" opacity="${(0.3 + 0.7 * d.cov / 100).toFixed(2)}" stroke="${T.bg}" stroke-width="1.5"/>`;
  s += txt(padL, axisY + 62, 'Benchmarks: ' + bench.map((b) => `${FULLC[b.e.country] || b.e.country} ${surname(b.e.name)} ${Math.round(b.x)}`).join('   ·   ') + `      +${noC} newly-appointed, no record yet`, { fs: 11.5, fill: T.tt });
  return { svg: s, w: W, h: axisY + 78 };
}

/* ---------- card (shared by 2 + 4) ---------- */
function card(e, w) {
  const pad = 14; let y = 0; let s = '';
  const a5 = dimsOf(e).find((d) => d.dimension === 'A5'); const a5v = a5?.recorded?.value != null ? String(a5.recorded.value) : null;
  const bc = { clean: [T.green, T.greenBg], caution: [T.amber, T.amberBg], adverse: [T.red, T.redBg], none: [T.tt, T.sunken] }[a5band(a5v)];
  s += `<rect x="0" y="0" width="${w}" height="HEIGHT" rx="14" fill="${T.card}" stroke="${T.border}" ${e.benchmark ? 'stroke-dasharray="5 4"' : ''}/>`;
  y = pad + 14; s += txt(pad, y, e.name, { fs: 15, fw: 800, fill: T.tp }) + txt(w - pad, y, e.country, { fs: 11, fw: 800, fill: T.tt, an: 'end' });
  y += 14; s += txt(pad, y, (e.comparabilityClass || '').replace(/-/g, ' ') + (e.benchmark ? ' · benchmark' : ''), { fs: 10, fill: T.tt, ls: 0.5 }); y += 8;
  const bl = e.benchmark ? 'BENCHMARK — REFERENCE ONLY' : 'ON FILE — NOT RANKED';
  s += `<rect x="${pad}" y="${y}" width="${w - 2 * pad}" height="22" rx="5" fill="${T.amberBg}" stroke="${T.border}"/><circle cx="${pad + 10}" cy="${y + 11}" r="3.5" fill="${e.benchmark ? T.tt : T.amber}"/>` + txt(pad + 20, y + 15, bl, { fs: 10.5, fw: 800, fill: e.benchmark ? T.tt : T.amber, ls: 0.5 }); y += 32;
  if (a5v) { const lbl = `integrity: ${a5v}`; s += `<rect x="${pad}" y="${y - 11}" width="${18 + lbl.length * 6}" height="18" rx="9" fill="${bc[1]}"/>` + txt(pad + 9, y + 2, lbl, { fs: 11, fw: 700, fill: bc[0] }); }
  const cm = Math.round(e.conductCoverage); const mx = w - pad - 92;
  s += txt(mx, y + 2, 'cov', { fs: 10, fill: T.tt }) + `<rect x="${mx + 22}" y="${y - 5}" width="44" height="6" rx="3" fill="${T.sunken}"/><rect x="${mx + 22}" y="${y - 5}" width="${(44 * cm / 100).toFixed(1)}" height="6" rx="3" fill="${T.tt}"/>` + txt(w - pad, y + 2, cm + '%', { fs: 10, fill: T.tt, an: 'end' }); y += 18;
  const shown = (d) => ['scored', 'on-file-provisional-single-coder'].includes(d.status); const dims = dimsOf(e);
  for (const [label, kind] of [[board.tracks.conduct.name, 'conduct'], [board.tracks.delivery.name, 'delivery']]) {
    const col = kind === 'conduct' ? T.conduct : T.delivery;
    const rows = dims.filter((d) => (deliverySet.has(d.dimension) ? 'delivery' : 'conduct') === kind && shown(d));
    const awa = dims.filter((d) => (deliverySet.has(d.dimension) ? 'delivery' : 'conduct') === kind && d.status === 'no-data').length;
    y += 6; s += `<rect x="${pad}" y="${y - 9}" width="3" height="11" fill="${col}"/>` + txt(pad + 7, y, label.toUpperCase(), { fs: 10, fw: 800, fill: col, ls: 0.6 }); y += 8;
    for (const d of rows) {
      const prov = d.status === 'on-file-provisional-single-coder'; const pct = prov ? (Number(d.recorded.value) / 4) * 100 : (typeof d.score === 'number' ? d.score : 0);
      s += txt(pad, y + 4, `${d.dimension} ${SHORT[d.dimension] || d.name}`, { fs: 10.5, fill: T.ts });
      const bx = pad + 104, bw = w - pad - bx - 52;
      s += `<rect x="${bx}" y="${y - 3}" width="${bw}" height="8" rx="4" fill="${T.sunken}"/><rect x="${bx}" y="${y - 3}" width="${Math.max(3, bw * pct / 100).toFixed(1)}" height="8" rx="4" fill="${prov ? `url(#h${kind === 'conduct' ? 'c' : 'd'})` : col}"/>` + txt(w - pad, y + 4, prov ? `prov ${d.codersOnFile || 1}/${d.codersNeeded || 3}` : 'scored', { fs: 9, fill: prov ? T.amber : T.tt, an: 'end' }); y += 17;
    }
    if (!rows.length) { s += txt(pad + 7, y + 2, 'no dimension on file yet', { fs: 9.5, fill: T.tt }); y += 14; }
    if (awa > 0) { s += txt(pad + 7, y + 2, `+${awa} awaiting data`, { fs: 9.5, fill: T.tt }); y += 14; }
  }
  const H = y + pad; return { svg: s.replace('HEIGHT', H), h: H };
}

/* ---------- 2 · CARDS ---------- */
function cards(names, w = 1280, cardW = 296, gap = 18) {
  const picks = names.map((n) => [...board.entries, ...board.benchmarks].find((e) => e.name === n)).filter(Boolean);
  const built = picks.map((e) => card(e, cardW)); const maxH = Math.max(...built.map((b) => b.h));
  let s = txt(20, 26, 'LEADER FINGERPRINTS — pardoned · convicted · clean benchmark · spine-only newcomer', { fs: 14, fw: 800, fill: T.tp, ls: 0.4 });
  built.forEach((b, i) => { s += `<g transform="translate(${20 + i * (cardW + gap)},44)">${b.svg}</g>`; });
  return { svg: s, w, h: maxH + 60 };
}

/* ---------- 3 · HEATMAP ---------- */
function heatmap(subjects, w = 1180) {
  const DIMS = [['A2', 'c'], ['A5', 'c'], ['B1', 'c'], ['B2', 'c'], ['B3', 'c'], ['B4', 'c'], ['B5', 'c'], ['C1', 'c'], ['C3', 'c'], ['A1', 'd'], ['A3', 'd'], ['A4', 'd'], ['C2', 'd']];
  const nameW = 168, x0 = 16, top = 70, cw = (w - x0 * 2 - nameW) / DIMS.length, rh = 17, cs = Math.min(cw, rh) - 3;
  let s = txt(x0, 26, 'COHORT MATRIX — subjects × dimensions (status, not just value)', { fs: 14, fw: 800, fill: T.tp, ls: 0.4 });
  s += `<rect x="${x0 + nameW}" y="38" width="${cw * 9}" height="16" rx="3" fill="rgba(91,155,240,0.18)"/>` + txt(x0 + nameW + 6, 50, 'CONDUCT & STRUCTURE', { fs: 9.5, fw: 800, fill: T.conduct, ls: 0.5 });
  s += `<rect x="${x0 + nameW + cw * 9}" y="38" width="${cw * 4}" height="16" rx="3" fill="rgba(239,162,60,0.18)"/>` + txt(x0 + nameW + cw * 9 + 6, 50, 'DELIVERY', { fs: 9.5, fw: 800, fill: T.delivery, ls: 0.5 });
  DIMS.forEach(([id], i) => { s += txt(x0 + nameW + cw * i + cw / 2, top - 4, id, { fs: 9.5, fw: 700, fill: T.tt, an: 'middle' }); });
  subjects.forEach((e, r) => {
    const y = top + r * rh; const m = new Map(dimsOf(e).map((d) => [d.dimension, d]));
    s += txt(x0, y + 12, (e.country + ' ' + e.name).slice(0, 30), { fs: 10, fill: e.benchmark ? T.tt : T.ts });
    DIMS.forEach(([id, k], i) => {
      const cx = x0 + nameW + cw * i + (cw - cs) / 2, cy = y + (rh - cs) / 2; const d = m.get(id); let fill = T.sunken, op = 0.5, extra = '';
      if (d && d.status === 'scored') { fill = k === 'c' ? T.conduct : T.delivery; op = (0.3 + 0.65 * (typeof d.score === 'number' ? d.score / 100 : 0.5)).toFixed(2); }
      else if (d && d.status === 'on-file-provisional-single-coder') { fill = `url(#h${k === 'c' ? 'c' : 'd'})`; op = 0.9; }
      else if (d && d.status === 'excluded-jurisdiction') { fill = 'none'; extra = `stroke="${T.border}" stroke-dasharray="2 2"`; op = 1; }
      else if (d && (d.status === 'on-file' || d.status === 'on-file-insufficient-peer-set')) { fill = T.tt; op = 0.3; }
      s += `<rect x="${cx}" y="${cy}" width="${cs}" height="${cs}" rx="2.5" fill="${fill}" opacity="${op}" ${extra}/>`;
    });
  });
  let ly = top + subjects.length * rh + 18, lx = x0;
  for (const [lab, col] of [['scored', T.conduct], ['provisional', 'url(#hc)'], ['on file', T.tt], ['excluded', 'none'], ['no data', T.sunken]]) {
    s += txt(lx, ly, lab, { fs: 10, fill: T.ts }); lx += lab.length * 6 + 6;
    s += `<rect x="${lx}" y="${ly - 9}" width="11" height="11" rx="2" fill="${col}" ${col === 'none' ? `stroke="${T.border}" stroke-dasharray="2 2"` : col === T.tt ? 'opacity="0.3"' : col === T.sunken ? 'opacity="0.5"' : ''}/>`; lx += 24;
  }
  return { svg: s, w, h: ly + 16 };
}

/* ---------- 5 · EXPLAINER (rank-range collapse filmstrip) ---------- */
function explainer() {
  const demo = [{ id: 'A', v: 74, rank: '1' }, { id: 'B', v: 66, rank: '2' }, { id: 'C', v: 61, rank: '3–4' }, { id: 'D', v: 57, rank: '3–4' }, { id: 'E', v: 49, rank: '5' }, { id: 'F', v: 42, rank: '6' }];
  const stages = [{ half: 33, stamp: 'NOT RANKED', ok: false, coders: 1, gate: 'pending', ranks: false, sub: '1 coder · bands overlap' }, { half: 17, stamp: 'STILL NOT RANKED', ok: false, coders: 3, gate: 'pending', ranks: false, sub: 'panel forms (3)' }, { half: 7, stamp: 'RANK — AS RANGES', ok: true, coders: 5, gate: 'pass', ranks: true, sub: 'gates clear → ranked' }];
  const PW = 448, PH = 320, gap = 12, top = 86, X0 = 66, TW = 312, rowH = 30;
  const panel = (st, px) => {
    const sx = (v) => px + X0 + v / 100 * TW; let s = '';
    s += `<rect x="${px + 6}" y="6" width="${PW - 12}" height="${PH - 12}" rx="14" fill="${T.card}" stroke="${T.border}"/>` + txt(px + 22, 32, st.sub.toUpperCase(), { fs: 11, fw: 800, fill: T.tp, ls: 0.6 });
    for (let i = 0; i < 5; i++) { const on = i < st.coders; s += `<circle cx="${px + 22 + i * 16}" cy="50" r="6" fill="${on ? T.conduct : 'none'}" stroke="${on ? T.conduct : T.tt}" stroke-width="1.5" opacity="${on ? 1 : 0.6}"/>`; }
    s += txt(px + 22 + 5 * 16 + 6, 54, `${st.coders} coders`, { fs: 10, fill: T.tt });
    const sc = st.ok ? [T.green, T.greenBg] : [T.amber, T.amberBg];
    s += `<g transform="translate(${px + PW - 96},44) rotate(-7)"><rect x="-74" y="-14" width="148" height="28" rx="5" fill="${sc[1]}" stroke="${sc[0]}"/>${txt(0, 5, st.stamp, { fs: 10.5, fw: 800, fill: sc[0], an: 'middle' })}</g>`;
    demo.forEach((d, i) => {
      const y = top + i * rowH;
      s += `<line x1="${px + X0}" x2="${px + X0 + TW}" y1="${y}" y2="${y}" stroke="${T.border}"/>` + txt(px + 34, y + 4, st.ranks ? d.rank : '?', { fs: 11, fw: 800, fill: st.ranks ? T.tp : T.tt, an: 'middle' }) + txt(px + 58, y + 4, d.id, { fs: 11, fw: 700, fill: T.ts, an: 'end' });
      const lo = sx(Math.max(0, d.v - st.half)), hi = sx(Math.min(100, d.v + st.half));
      s += `<rect x="${lo}" y="${y - 7}" width="${(hi - lo).toFixed(1)}" height="14" rx="7" fill="${T.conduct}" opacity="${st.ok ? 0.85 : 0.4}"/><line x1="${sx(d.v)}" x2="${sx(d.v)}" y1="${y - 7}" y2="${y + 7}" stroke="${T.tp}" stroke-width="1.5" opacity="0.7"/>`;
    });
    const gc = st.gate === 'pass' ? [T.green, T.greenBg] : [T.tt, T.sunken], gy = top + 6 * rowH + 6;
    s += `<rect x="${px + X0}" y="${gy}" width="142" height="24" rx="12" fill="${gc[1]}" stroke="${gc[0] === T.green ? T.green : T.border}"/>${txt(px + X0 + 71, gy + 16, 'α reliability ' + (st.gate === 'pass' ? '0.71 ✓' : 'pending'), { fs: 9.5, fw: 700, fill: gc[0], an: 'middle' })}`;
    s += `<rect x="${px + X0 + 150}" y="${gy}" width="142" height="24" rx="12" fill="${gc[1]}" stroke="${gc[0] === T.green ? T.green : T.border}"/>${txt(px + X0 + 150 + 71, gy + 16, 'partisan ' + (st.gate === 'pass' ? 'clear ✓' : 'pending'), { fs: 9.5, fw: 700, fill: gc[0], an: 'middle' })}`;
    return s;
  };
  const W = PW * 3 + gap * 2 + 40, H = PH + 70;
  let s = txt(20, 28, 'THE RANK-RANGE COLLAPSE — the signature animation (illustrative leaders A–F, not real subjects)', { fs: 14, fw: 800, fill: T.tp, ls: 0.3 });
  s += txt(20, 48, 'One coder = bands overlap, no order is defensible. Add an independent panel + clear two bias gates → bands narrow → a rank emerges, published as RANGES.', { fs: 11.5, fill: T.ts });
  stages.forEach((st, i) => { s += `<g transform="translate(${20 + i * (PW + gap)},60)">${panel(st, 0)}</g>`; });
  for (let i = 0; i < 2; i++) s += txt(20 + (i + 1) * (PW + gap) - gap / 2, 60 + PH / 2, '▶', { fs: 18, fill: T.tt, an: 'middle' });
  return { svg: s, w: W, h: H };
}

/* ---------- run ---------- */
console.log('\n  The Plumb Line — rendering preview stills →', OUT);
const f = field(); await png(f.svg, '1-field.png', f.w, f.h);
const c = cards(['Anwar Ibrahim', 'Donald Trump', 'Lee Hsien Loong', 'Akmal Nasrullah Mohd Nasir']); await png(c.svg, '2-cards.png', c.w, c.h);
const hm = heatmap([...board.entries, ...board.benchmarks]); await png(hm.svg, '3-heatmap.png', hm.w, hm.h);
const m1 = card([...board.entries].find((e) => e.name === 'Anwar Ibrahim'), 398), m2 = card([...board.benchmarks].find((e) => e.name === 'Donald Trump'), 398);
await png(txt(16, 26, 'MOBILE — fingerprint cards', { fs: 14, fw: 800, fill: T.tp }) + `<g transform="translate(16,40)">${m1.svg}</g><g transform="translate(16,${40 + m1.h + 16})">${m2.svg}</g>`, '4-mobile.png', 430, 40 + m1.h + 16 + m2.h + 20);
const ex = explainer(); await png(ex.svg, '5-explainer.png', ex.w, ex.h);
console.log('  done — 5 stills.\n');
