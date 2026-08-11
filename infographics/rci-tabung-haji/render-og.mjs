#!/usr/bin/env node
// Renders the 1200x630 social card for /infographics/rci-tabung-haji.
//
//   node infographics/rci-tabung-haji/render-og.mjs
//
// Output: public/infographics/rci-tabung-haji-og.png
//
// The card carries the two hero figures and nothing else. The restated figure
// is hatched here exactly as it is on the page, because a social card is the
// most-shared and least-contextualised surface we publish: a reader who sees
// only this must still be able to tell the reported number from the
// counterfactual one. No verdict, no adjective, no named individual.
//
// Brand type: @fontsource ships woff2 only, which librsvg cannot read, so the
// weights we need are decompressed to TTF into a temp dir and fontconfig is
// pointed at it for this process. Falls back to the generic sans stack if that
// fails, which changes the look but not the content.

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { setupBrandFont, PALETTE, esc, ROOT } from './_brand.mjs';

const OUT = join(ROOT, 'public', 'infographics', 'rci-tabung-haji-og.png');

// sharp must be imported only after fontconfig is configured — see _brand.mjs.
const family = await setupBrandFont();
const sharp = (await import('sharp')).default;

// --- palette, matching the page --------------------------------------------
const PAPER = PALETTE.paper;
const INK = PALETTE.ink;
const MUTED = PALETTE.muted;
const RULE = PALETTE.rule;
const MARK = PALETTE.mark;

const W = 1200, H = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="h" width="8" height="8" patternTransform="rotate(135)" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill="${PAPER}"/>
      <line x1="0" y1="0" x2="0" y2="8" stroke="${MARK}" stroke-width="2.6" opacity="0.55"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${MARK}"/>

  <text x="64" y="96" font-family="${family}" font-size="19" font-weight="700"
        letter-spacing="3.4" fill="${MUTED}">DATA GRAPHIC · THE FOURTH ANGLE</text>

  <text x="64" y="176" font-family="${family}" font-size="52" font-weight="700"
        letter-spacing="-1.6" fill="${INK}">${esc("What the commission found in")}</text>
  <text x="64" y="238" font-family="${family}" font-size="52" font-weight="700"
        letter-spacing="-1.6" fill="${INK}">${esc("Tabung Haji's 2017 accounts")}</text>

  <line x1="64" y1="286" x2="${W - 64}" y2="286" stroke="${RULE}" stroke-width="2"/>

  <!-- reported -->
  <text x="64" y="330" font-family="${family}" font-size="17" font-weight="700"
        letter-spacing="2.2" fill="${MUTED}">REPORTED · FY2017</text>
  <text x="64" y="418" font-family="${family}" font-size="76" font-weight="700"
        letter-spacing="-2.4" fill="${MARK}">RM3.41b</text>
  <text x="64" y="456" font-family="${family}" font-size="21" fill="${MUTED}">net profit in the audited accounts,</text>
  <text x="64" y="486" font-family="${family}" font-size="21" fill="${MUTED}">certified without qualification</text>

  <!-- restated, hatched exactly as on the page -->
  <rect x="620" y="300" width="516" height="206" rx="10" fill="url(#h)" stroke="${RULE}" stroke-width="2"/>
  <text x="652" y="330" font-family="${family}" font-size="17" font-weight="700"
        letter-spacing="2.2" fill="${MUTED}">RESTATED · COUNTERFACTUAL</text>
  <text x="652" y="418" font-family="${family}" font-size="76" font-weight="700"
        letter-spacing="-2.4" fill="${MARK}">−RM1.43b</text>
  <text x="652" y="456" font-family="${family}" font-size="21" fill="${MUTED}">what full MFRS application</text>
  <text x="652" y="486" font-family="${family}" font-size="21" fill="${MUTED}">would have shown</text>

  <line x1="64" y1="548" x2="${W - 64}" y2="548" stroke="${RULE}" stroke-width="2"/>
  <text x="64" y="584" font-family="${family}" font-size="19" fill="${MUTED}">RCI into Lembaga Tabung Haji, 2014–2020 · report published 29 July 2026</text>
  <text x="${W - 64}" y="584" text-anchor="end" font-family="${family}" font-size="19"
        font-weight="700" fill="${MUTED}">thefourthangle.pages.dev</text>
</svg>`;

mkdirSync(dirname(OUT), { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT);
const meta = await sharp(OUT).metadata();
console.log(`Wrote ${OUT} — ${meta.width}x${meta.height}, family "${family}"`);
