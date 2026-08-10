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

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
// NOTE: sharp is imported *after* fontconfig is configured, further down.
// Importing it here initialises fontconfig before FONTCONFIG_FILE is set, and
// the brand font then silently falls back to a serif while still reporting
// success. Keep this dynamic.

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const OUT = join(ROOT, 'public', 'infographics', 'rci-tabung-haji-og.png');
const FONTDIR = '/tmp/t4a-og-fonts';

// --- brand type, best effort ------------------------------------------------
// @fontsource subsets every Manrope weight from the variable source, and each
// resulting face reports the family name "Manrope ExtraLight" whatever its
// weight. Asking fontconfig for plain "Manrope" therefore misses and lands on a
// system serif. We ask for the name the files actually carry; the weight axis
// still resolves correctly (bold -> Manrope-Bold.ttf, weight 200).
const BRAND_FAMILY = 'Manrope ExtraLight';
let family = BRAND_FAMILY;
try {
  const { decompress } = await import('wawoff2');
  mkdirSync(FONTDIR, { recursive: true });
  for (const [weight, name] of [[700, 'Bold'], [500, 'Medium'], [400, 'Regular']]) {
    const src = join(ROOT, `node_modules/@fontsource/manrope/files/manrope-latin-${weight}-normal.woff2`);
    const dst = join(FONTDIR, `Manrope-${name}.ttf`);
    if (existsSync(src) && !existsSync(dst)) {
      writeFileSync(dst, Buffer.from(await decompress(readFileSync(src))));
    }
  }
  const conf = join(FONTDIR, 'fonts.conf');
  writeFileSync(conf, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig><dir>${FONTDIR}</dir><dir>/usr/share/fonts</dir><cachedir>${FONTDIR}/cache</cachedir></fontconfig>`);
  process.env.FONTCONFIG_FILE = conf;
  mkdirSync(join(FONTDIR, 'cache'), { recursive: true });
  try { execFileSync('fc-cache', ['-f', FONTDIR], { stdio: 'ignore' }); } catch { /* cache is optional */ }

  // Verify rather than assume. fc-match reports what fontconfig would actually
  // hand to librsvg; if it does not name a Manrope face, the render would come
  // out in whatever serif the system defaults to.
  const matched = execFileSync('fc-match', ['-f', '%{file}', `${BRAND_FAMILY}:bold`], {
    env: process.env, encoding: 'utf8',
  });
  if (!matched.startsWith(FONTDIR)) {
    throw new Error(`fontconfig resolved "${BRAND_FAMILY}:bold" to "${matched}"`);
  }
} catch (e) {
  console.warn(`Brand font unavailable (${e.message}); falling back to the generic sans stack.`);
  family = 'DejaVu Sans';
}

const sharp = (await import('sharp')).default;

// --- palette, matching the page --------------------------------------------
const PAPER = '#FFFDF9';
const INK = '#16150F';
const MUTED = '#78725F';
const RULE = '#DDD6C6';
const MARK = '#A8432A';

const W = 1200, H = 630;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
