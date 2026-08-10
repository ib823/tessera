#!/usr/bin/env node
// Renders one standalone 1200x630 share card per figure of the RCI Tabung Haji
// data graphic.
//
//   node infographics/rci-tabung-haji/render-shares.mjs
//
// Output: public/infographics/share/rci-tabung-haji-fig{1..5}.png
//
// Why per-figure cards exist: in Malaysia this material travels through
// WhatsApp, and WhatsApp shares images, not links. A figure that cannot leave
// the page does not travel. The editorial constraint that follows is that each
// card has to survive on its own, with no surrounding page to caveat it — so
// every card carries its own attribution line, its own source reference, and
// the same hatch that marks the counterfactual on the page.

import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupBrandFont, cardFrame, PALETTE as P, esc, fmt, ROOT } from './_brand.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const D = JSON.parse(readFileSync(join(HERE, 'data.json'), 'utf8'));
const OUTDIR = join(ROOT, 'public', 'infographics', 'share');

const family = await setupBrandFont();
const sharp = (await import('sharp')).default;
mkdirSync(OUTDIR, { recursive: true });

const HOST = D.page.host;
const cards = [];

// ---------------------------------------------------------------- figure 1 --
{
  const steps = D.bridge.steps;
  const max = 3600, min = -1600;
  const top = 240, h = 250, left = 90, w = 1020;
  const y = (v) => top + ((max - v) / (max - min)) * h;
  const zero = y(0);
  const bw = w / steps.length - 34;

  let run = 0;
  const bars = steps.map((d, i) => {
    const isTotal = i === 0 || i === steps.length - 1;
    const from = isTotal ? 0 : run;
    const to = isTotal ? d.value : run + d.value;
    run = to;
    const yA = y(Math.max(from, to));
    const yB = y(Math.min(from, to));
    const x = left + i * (w / steps.length) + 17;
    const counter = d.kind === 'counterfactual';
    return `<rect x="${x}" y="${yA}" width="${bw}" height="${Math.max(Math.abs(yB - yA), 4)}" rx="4"
        fill="${counter ? 'url(#hatch)' : P.mark}" stroke="${counter ? P.mark : 'none'}" stroke-width="1.5"/>
      <text x="${x + bw / 2}" y="${d.value > 0 ? yA - 12 : yA + Math.max(Math.abs(yB - yA), 4) + 26}"
        text-anchor="middle" font-family="${family}" font-size="21" font-weight="700"
        fill="${P.ink}">${d.value > 0 ? '+' : ''}${fmt(d.value)}</text>
      <text x="${x + bw / 2}" y="${526}" text-anchor="middle" font-family="${family}"
        font-size="15" fill="${P.muted}">${esc(d.label)}</text>`;
  }).join('');

  cards.push({
    file: 'rci-tabung-haji-fig1.png',
    svg: cardFrame({
      family,
      title: 'How a reported profit becomes a restated loss',
      subtitle: 'Tabung Haji, financial year 2017 · RM million',
      footerLeft: `PwC reconciliation, reproduced by the commission · ${D.bridge.cite}`,
      footerRight: HOST,
      body: `<line x1="${left}" y1="${zero}" x2="${left + w}" y2="${zero}" stroke="${P.muted}" stroke-width="1.5"/>
        <text x="${left - 12}" y="${zero + 6}" text-anchor="end" font-family="${family}" font-size="15" fill="${P.muted}">RM0</text>
        ${bars}
        <text x="${left}" y="548" font-family="${family}" font-size="14" fill="${P.muted}">Hatched marks are counterfactual — what full MFRS application would have shown, not an observed result.</text>`,
    }),
  });
}

// ---------------------------------------------------------------- figure 2 --
{
  const L = D.threshold.ladder;
  const rungs = L.map((s, i) => {
    const x = 90 + i * 268;
    return `<rect x="${x}" y="255" width="240" height="4" fill="${s.triggered ? P.mark : P.rule}"/>
      <text x="${x}" y="330" font-family="${family}" font-size="52" font-weight="700"
        letter-spacing="-1.4" fill="${s.triggered ? P.mark : P.ink}">${esc(s.value)}</text>
      <text x="${x}" y="366" font-family="${family}" font-size="16" fill="${P.muted}">${esc(s.label)}</text>`;
  }).join('');

  // Short column labels only. The descriptive notes used on the page overflow a
  // 268px column here and collide with the neighbour, so the card carries the
  // trigger level and the charge, and nothing else.
  const chargeLabel = { '−70%': 'trigger at −70%', '−85%': 'at −85%', '−90%': 'at −90%', recorded: 'TH recorded' };
  const charges = D.threshold.charges.map((c, i) => {
    const x = 90 + i * 268;
    const shown = c.at === 'recorded' ? '1.0' : fmt(c.value);
    return `<text x="${x}" y="462" font-family="${family}" font-size="15" fill="${P.muted}">${esc(chargeLabel[c.at])}</text>
      <text x="${x}" y="506" font-family="${family}" font-size="36" font-weight="700"
        fill="${c.at === 'recorded' ? P.mark : P.ink}">${shown}</text>`;
  }).join('');

  cards.push({
    file: 'rci-tabung-haji-fig2.png',
    svg: cardFrame({
      family,
      title: 'The point at which a loss counted as a loss',
      subtitle: "The commission's own illustration: a RM1,000 holding, as it falls",
      footerLeft: `PwC sensitivity; illustration recorded by the commission · ${D.threshold.cite}`,
      footerRight: HOST,
      body: `${rungs}
        <text x="90" y="405" font-family="${family}" font-size="16" fill="${P.ink}">A holding bought for RM1,000 was written down only once it was worth RM100.</text>
        <line x1="90" y1="424" x2="1110" y2="424" stroke="${P.rule}" stroke-width="2"/>
        <text x="90" y="446" font-family="${family}" font-size="14" font-weight="700"
          letter-spacing="1.6" fill="${P.muted}">IMPAIRMENT CHARGE AT EACH TRIGGER, FY2017 · RM MILLION</text>
        ${charges}`,
    }),
  });
}

// ---------------------------------------------------------------- figure 3 --
{
  const Y = D.position.years;
  const max = 6000, min = -5000;
  const top = 250, h = 250, left = 130, w = 960;
  const px = (i) => left + i * (w / (Y.length - 1));
  const py = (v) => top + ((max - v) / (max - min)) * h;
  const path = (key) => Y.map((d, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(d[key]).toFixed(1)}`).join('');

  const dots = Y.map((d, i) => `
    <circle cx="${px(i)}" cy="${py(d.pre)}" r="5" fill="${P.ctx}" opacity="0.55"/>
    <circle cx="${px(i)}" cy="${py(d.post)}" r="6.5" fill="${P.mark}"/>
    <text x="${px(i)}" y="524" text-anchor="middle" font-family="${family}" font-size="17" fill="${P.muted}">${d.year}</text>`).join('');

  cards.push({
    file: 'rci-tabung-haji-fig3.png',
    svg: cardFrame({
      family,
      title: 'The gap, and what the distribution did to it',
      subtitle: '2013 was in surplus. 2014 is the crossover · RM million',
      footerLeft: `PwC, reproduced by the commission · ${D.position.cite}`,
      footerRight: HOST,
      body: `<line x1="${left - 40}" y1="${py(0)}" x2="${left + w}" y2="${py(0)}" stroke="${P.muted}" stroke-width="1.5"/>
        <text x="${left - 50}" y="${py(0) + 6}" text-anchor="end" font-family="${family}" font-size="15" fill="${P.muted}">RM0</text>
        <path d="${path('pre')}" fill="none" stroke="${P.ctx}" stroke-width="3" opacity="0.45"/>
        <path d="${path('post')}" fill="none" stroke="${P.mark}" stroke-width="4"/>
        ${dots}
        <text x="${px(0)}" y="${py(Y[0].post) - 18}" text-anchor="middle" font-family="${family}"
          font-size="20" font-weight="700" fill="${P.ink}">+${fmt(Y[0].post)}</text>
        <text x="${px(4)}" y="${py(Y[4].post) - 20}" text-anchor="middle" font-family="${family}"
          font-size="20" font-weight="700" fill="${P.ink}">(${fmt(-Y[4].post)})</text>
        <text x="90" y="548" font-family="${family}" font-size="14" fill="${P.muted}">Solid: position after the distribution is paid.  Faint: position before it.  One linear scale, zero baseline shown.</text>`,
    }),
  });
}

// ---------------------------------------------------------------- figure 4 --
{
  const Y = D.hibah.years;
  const max = 3400;
  const top = 250, h = 250, left = 90, w = 1020;
  const bw = w / Y.length - 30;
  const by = (v) => top + ((max - v / 1000) / max) * h;
  const zero = by(0);

  const bars = Y.map((d, i) => {
    const x = left + i * (w / Y.length) + 15;
    const key = d.year === 2018;
    return `<rect x="${x}" y="${by(d.amount)}" width="${bw}" height="${zero - by(d.amount)}" rx="4"
        fill="${key ? P.mark : P.ctx}" opacity="${key ? 1 : 0.5}"/>
      <text x="${x + bw / 2}" y="${by(d.amount) - 12}" text-anchor="middle" font-family="${family}"
        font-size="19" font-weight="700" fill="${P.ink}">${d.pct}%</text>
      <text x="${x + bw / 2}" y="524" text-anchor="middle" font-family="${family}"
        font-size="17" fill="${P.muted}">${d.year}</text>`;
  }).join('');

  cards.push({
    file: 'rci-tabung-haji-fig4.png',
    svg: cardFrame({
      family,
      title: 'What depositors actually felt',
      subtitle: 'Distribution declared, annual plus haj hibah · rate shown, RM million scaled',
      footerLeft: `The commission's hibah table · ${D.hibah.cite}`,
      footerRight: HOST,
      body: `<line x1="${left}" y1="${zero}" x2="${left + w}" y2="${zero}" stroke="${P.muted}" stroke-width="1.5"/>
        ${bars}
        <text x="90" y="548" font-family="${family}" font-size="14" fill="${P.ink}">Cash distributed fell 72% between 2017 and 2018, from RM3,324m to RM923m — then recovered to 3.10% by 2020.</text>`,
    }),
  });
}

// ---------------------------------------------------------------- figure 5 --
{
  const Y = D.hajCost.years;
  const max = 40000, min = 24000;
  const top = 250, h = 230, left = 120, w = 980;
  const px = (i) => left + i * (w / (Y.length - 1));
  const py = (v) => top + ((max - v) / (max - min)) * h;
  const path = Y.map((d, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(d.cost).toFixed(1)}`).join('');
  const dots = Y.map((d, i) => `
    <circle cx="${px(i)}" cy="${py(d.cost)}" r="5.5" fill="${P.mark}"/>
    <text x="${px(i)}" y="524" text-anchor="middle" font-family="${family}" font-size="16" fill="${P.muted}">${d.year}</text>`).join('');

  cards.push({
    file: 'rci-tabung-haji-fig5.png',
    svg: cardFrame({
      family,
      title: 'Why the governance question is not historical',
      subtitle: 'Projected cost of haj per pilgrim · RM',
      footerLeft: `TH projection, recorded by the commission · ${D.hajCost.cite}`,
      footerRight: HOST,
      body: `<path d="${path}" fill="none" stroke="${P.mark}" stroke-width="4"/>
        ${dots}
        <text x="${px(0)}" y="${py(Y[0].cost) + 34}" text-anchor="middle" font-family="${family}"
          font-size="22" font-weight="700" fill="${P.ink}">${fmt(Y[0].cost)}</text>
        <text x="${px(Y.length - 1)}" y="${py(Y.at(-1).cost) - 20}" text-anchor="middle" font-family="${family}"
          font-size="22" font-weight="700" fill="${P.ink}">${fmt(Y.at(-1).cost)}</text>
        <text x="90" y="548" font-family="${family}" font-size="14" fill="${P.ink}">RM15,555 per pilgrim in 2003. Whatever the fund earns has to keep pace with this line. Scale starts at RM24,000.</text>`,
    }),
  });
}

for (const c of cards) {
  const out = join(OUTDIR, c.file);
  await sharp(Buffer.from(c.svg)).png({ compressionLevel: 9 }).toFile(out);
  console.log(`Wrote ${out}`);
}
console.log(`${cards.length} share cards, family "${family}".`);
