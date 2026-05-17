/**
 * One-off render — emits 3 white-bg sample cards for design review.
 * Not part of the build pipeline. Run: node scripts/render-white-samples.mjs
 * Output: /tmp/t4a-white-{a,b,c}.png
 *
 * Mirrors scripts/build-social-cards.mjs but uses the white variant
 * (white background, black foreground at varying opacities).
 */
import sharp from 'sharp';
import wawoff from 'wawoff2';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const FONTSOURCE = join(root, 'node_modules', '@fontsource');
const fontSpecs = [
  { family: 'Manrope', weight: 700, src: join(FONTSOURCE, 'manrope/files/manrope-latin-700-normal.woff2') },
  { family: 'Manrope', weight: 800, src: join(FONTSOURCE, 'manrope/files/manrope-latin-800-normal.woff2') },
  { family: 'Nunito Sans', weight: 400, src: join(FONTSOURCE, 'nunito-sans/files/nunito-sans-latin-400-normal.woff2') },
  { family: 'Nunito Sans', weight: 600, src: join(FONTSOURCE, 'nunito-sans/files/nunito-sans-latin-600-normal.woff2') },
];

const fontFaceCss = [];
for (const f of fontSpecs) {
  const ttf = await wawoff.decompress(readFileSync(f.src));
  const b64 = Buffer.from(ttf).toString('base64');
  fontFaceCss.push(`@font-face { font-family: '${f.family}'; src: url(data:font/ttf;base64,${b64}) format('truetype'); font-weight: ${f.weight}; font-style: normal; }`);
}
const FONT_FACE_BLOCK = fontFaceCss.join('\n      ');

const W = 1080, H = 1350;
const FONT_DISPLAY = "'Manrope', sans-serif";
const FONT_BODY = "'Nunito Sans', sans-serif";
const STATEMENT_PX = 48, LINE_HEIGHT_PX = 66, STATEMENT_MAX_CHARS = 26;
const GAP_AFTER_STATEMENT = 90;
const T4A_WORDMARK_PX = 48, FOURTH_ANGLE_PX = 24, TAGLINE_PX = 16, URL_PX = 20;

function escapeXml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
function wrap(text, maxChars) {
  const words = text.split(/\s+/); const lines = []; let cur = []; let len = 0;
  for (const word of words) {
    const need = (cur.length ? 1 : 0) + word.length;
    if (len + need > maxChars && cur.length) { lines.push(cur.join(' ')); cur = [word]; len = word.length; }
    else { cur.push(word); len += need; }
  }
  if (cur.length) lines.push(cur.join(' '));
  return lines;
}

function buildSvg(statement, variant = 'white') {
  const bg = variant === 'white' ? '#FFFFFF' : '#000000';
  const fg = variant === 'white' ? '#111111' : '#FFFFFF';
  const fgRgb = variant === 'white' ? '17,17,17' : '255,255,255';

  const lines = wrap(statement, STATEMENT_MAX_CHARS).slice(0, 7);
  const textH = lines.length * LINE_HEIGHT_PX;
  const brandH = T4A_WORDMARK_PX + 18 + FOURTH_ANGLE_PX + 28 + TAGLINE_PX;
  const totalH = textH + GAP_AFTER_STATEMENT + brandH;
  const blockTop = (H - totalH) / 2 - 30;

  const statementBaseline0 = blockTop + STATEMENT_PX;
  const statementTspans = lines
    .map((line, i) => `<tspan x="${W/2}" y="${statementBaseline0 + i * LINE_HEIGHT_PX}">${escapeXml(line)}</tspan>`)
    .join('');

  const attribTop = blockTop + textH + GAP_AFTER_STATEMENT;
  const t4aY = attribTop + T4A_WORDMARK_PX;
  const fourthAngleY = t4aY + 18 + FOURTH_ANGLE_PX;
  const taglineY = fourthAngleY + 28;
  const urlY = H - 70;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><style>
      ${FONT_FACE_BLOCK}
  </style></defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <text font-family="${FONT_DISPLAY}" font-weight="700" font-size="${STATEMENT_PX}" fill="${fg}" text-anchor="middle">${statementTspans}</text>
  <text x="${W/2}" y="${t4aY}" font-family="${FONT_DISPLAY}" font-weight="800" font-size="${T4A_WORDMARK_PX}" fill="${fg}" text-anchor="middle" letter-spacing="1">T4A</text>
  <text x="${W/2}" y="${fourthAngleY}" font-family="${FONT_DISPLAY}" font-weight="700" font-size="${FOURTH_ANGLE_PX}" fill="rgb(${fgRgb})" fill-opacity="0.7" text-anchor="middle" letter-spacing="0.5">The Fourth Angle</text>
  <text x="${W/2}" y="${taglineY}" font-family="${FONT_BODY}" font-weight="400" font-size="${TAGLINE_PX}" fill="rgb(${fgRgb})" fill-opacity="0.5" text-anchor="middle">Read past the first telling.</text>
  <text x="${W/2}" y="${urlY}" font-family="${FONT_BODY}" font-weight="600" font-size="${URL_PX}" fill="rgb(${fgRgb})" fill-opacity="0.4" text-anchor="middle" letter-spacing="0.5">thefourthangle.pages.dev</text>
</svg>`;
}

const samples = [
  { label: 'a', text: "Who defines 'reasonable'?" },
  { label: 'b', text: "The Employment Act was written for factories. The 2025 bill is the first real adaptation. It is a floor, not a ceiling." },
  { label: 'c', text: "Toll revenue: RM5.1B in 2025. Government compensation: RM1.2B on top." },
];

for (const s of samples) {
  const svg = buildSvg(s.text, 'white');
  const out = `/tmp/t4a-white-${s.label}.png`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  console.log('wrote', out);
}
