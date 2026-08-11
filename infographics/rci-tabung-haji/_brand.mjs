// Shared brand setup for the RCI Tabung Haji render scripts.
//
// Two traps, both learned the hard way and both silent if unhandled:
//
//  1. sharp initialises fontconfig on import. Import it before FONTCONFIG_FILE
//     is set and the brand font falls back to a system serif while every log
//     line still reports success. Callers must therefore `await setupBrandFont()`
//     first and import sharp dynamically afterwards.
//  2. @fontsource subsets every Manrope weight from the variable source, and
//     each resulting face reports the family name "Manrope ExtraLight" whatever
//     its actual weight. Asking fontconfig for plain "Manrope" misses. We ask
//     for the name the files carry; the weight axis still resolves correctly
//     (bold -> Manrope-Bold.ttf, fontconfig weight 200).

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, '..', '..');

const FONTDIR = '/tmp/t4a-og-fonts';
const BRAND_FAMILY = 'Manrope ExtraLight';
const FALLBACK_FAMILY = 'DejaVu Sans';

/**
 * Extract the brand weights, point fontconfig at them, and verify the match.
 * Returns the family name to use in SVG — the brand family, or the fallback if
 * anything went wrong (loudly, never silently).
 */
export async function setupBrandFont() {
  try {
    mkdirSync(join(FONTDIR, 'cache'), { recursive: true });

    const { decompress } = await import('wawoff2');
    for (const [weight, name] of [[700, 'Bold'], [500, 'Medium'], [400, 'Regular']]) {
      const src = join(ROOT, `node_modules/@fontsource/manrope/files/manrope-latin-${weight}-normal.woff2`);
      const dst = join(FONTDIR, `Manrope-${name}.ttf`);
      if (!existsSync(src)) throw new Error(`missing ${src}`);
      if (!existsSync(dst)) writeFileSync(dst, Buffer.from(await decompress(readFileSync(src))));
    }

    const conf = join(FONTDIR, 'fonts.conf');
    writeFileSync(conf, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig><dir>${FONTDIR}</dir><dir>/usr/share/fonts</dir><cachedir>${FONTDIR}/cache</cachedir></fontconfig>`);
    process.env.FONTCONFIG_FILE = conf;
    try { execFileSync('fc-cache', ['-f', FONTDIR], { stdio: 'ignore' }); } catch { /* optional */ }

    // Verify rather than assume: fc-match reports what librsvg will actually get.
    const file = execFileSync('fc-match', ['-f', '%{file}', `${BRAND_FAMILY}:bold`], {
      env: process.env, encoding: 'utf8',
    });
    if (!file.startsWith(FONTDIR)) {
      throw new Error(`fontconfig resolved "${BRAND_FAMILY}:bold" to "${file}"`);
    }
    return BRAND_FAMILY;
  } catch (e) {
    console.warn(`Brand font unavailable (${e.message}); falling back to ${FALLBACK_FAMILY}.`);
    return FALLBACK_FAMILY;
  }
}

// --- shared palette, matching src/pages/infographics/rci-tabung-haji.astro ---
export const PALETTE = {
  paper: '#FFFDF9',
  ink: '#16150F',
  muted: '#78725F',
  rule: '#DDD6C6',
  mark: '#A8432A',
  ctx: '#6B6558',
  sunken: '#F1EDE4',
};

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const fmt = (n) => Number(n).toLocaleString('en-US');

/** Standard 1200x630 card chrome: paper, accent rule, kicker, title, footer. */
export function cardFrame({ family, title, subtitle, footerLeft, footerRight, body }) {
  const W = 1200, H = 630;
  const P = PALETTE;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="hatch" width="8" height="8" patternTransform="rotate(135)" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill="${P.paper}"/>
      <line x1="0" y1="0" x2="0" y2="8" stroke="${P.mark}" stroke-width="2.6" opacity="0.55"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${P.paper}"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${P.mark}"/>
  <text x="64" y="86" font-family="${family}" font-size="17" font-weight="700"
        letter-spacing="3" fill="${P.muted}">DATA GRAPHIC · THE FOURTH ANGLE</text>
  <text x="64" y="146" font-family="${family}" font-size="40" font-weight="700"
        letter-spacing="-1.2" fill="${P.ink}">${esc(title)}</text>
  ${subtitle ? `<text x="64" y="182" font-family="${family}" font-size="21" fill="${P.muted}">${esc(subtitle)}</text>` : ''}
  ${body}
  <line x1="64" y1="556" x2="${W - 64}" y2="556" stroke="${P.rule}" stroke-width="2"/>
  <text x="64" y="590" font-family="${family}" font-size="17" fill="${P.muted}">${esc(footerLeft)}</text>
  <text x="${W - 64}" y="590" text-anchor="end" font-family="${family}" font-size="17"
        font-weight="700" fill="${P.muted}">${esc(footerRight)}</text>
</svg>`;
}
