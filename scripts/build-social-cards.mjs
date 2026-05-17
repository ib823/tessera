/**
 * Generates per-card social images + index for the T4A social bot.
 *
 * Format mirrors src/lib/share-card.ts (the image users get when they
 * tap "share" on mobile):
 *
 *   1080×1350 portrait, pure black, statement centered in bold,
 *   T4A wordmark + "The Fourth Angle" + tagline below,
 *   plain "thefourthangle.pages.dev" at the bottom.
 *
 * For bot-posted use we bump the branding ~70% vs the user-share variant
 * since T4A is the publisher here, not the user sharing.
 *
 * Fonts: Manrope 700 + Nunito Sans 400 from @fontsource, converted from
 * woff2 to TTF at build start with wawoff2, embedded into every SVG as
 * a base64 @font-face data URI. librsvg (via sharp) loads them directly
 * — no fontconfig install step required.
 */
import sharp from 'sharp';
import wawoff from 'wawoff2';
import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIssues } from './lib/load-issues.mjs';
import { extractEntities } from './lib/entity-patterns.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const outDir = join(root, 'public', 'og', 'social');
mkdirSync(outDir, { recursive: true });

for (const file of readdirSync(outDir)) {
  if (file.startsWith('issue-') && /\.(png|jpg|jpeg)$/i.test(file)) {
    unlinkSync(join(outDir, file));
  }
}

// ── Fonts: convert woff2 from @fontsource to TTF, base64-encode for inlining ──
const FONTSOURCE = join(root, 'node_modules', '@fontsource');
const fontSpecs = [
  { family: 'Manrope', weight: 700, src: join(FONTSOURCE, 'manrope/files/manrope-latin-700-normal.woff2') },
  { family: 'Manrope', weight: 800, src: join(FONTSOURCE, 'manrope/files/manrope-latin-800-normal.woff2') },
  { family: 'Nunito Sans', weight: 400, src: join(FONTSOURCE, 'nunito-sans/files/nunito-sans-latin-400-normal.woff2') },
  { family: 'Nunito Sans', weight: 600, src: join(FONTSOURCE, 'nunito-sans/files/nunito-sans-latin-600-normal.woff2') },
];

console.log('Loading fonts...');
const fontFaceCss = [];
for (const f of fontSpecs) {
  const ttf = await wawoff.decompress(readFileSync(f.src));
  const b64 = Buffer.from(ttf).toString('base64');
  fontFaceCss.push(
    `@font-face { font-family: '${f.family}'; src: url(data:font/ttf;base64,${b64}) format('truetype'); font-weight: ${f.weight}; font-style: normal; }`,
  );
}
const FONT_FACE_BLOCK = fontFaceCss.join('\n      ');

const issues = loadIssues();
const published = issues.filter((i) => i.published);

const CARD_WEIGHTS = {
  hook: 1.0,
  view: 0.9,
  reframe: 0.7,
  fact: 0.6,
  analogy: 0.5,
};

// ── Layout — calibrated for "intellectual editorial" register ──
const W = 1080;
const H = 1350;
const FONT_DISPLAY = "'Manrope', sans-serif";
const FONT_BODY = "'Nunito Sans', sans-serif";

const STATEMENT_PX = 48;
const LINE_HEIGHT_PX = 66;
const STATEMENT_MAX_CHARS = 26; // tuned for Manrope-700 at 48px on 900px content width
const GAP_AFTER_STATEMENT = 90;
const T4A_WORDMARK_PX = 48;
const FOURTH_ANGLE_PX = 24;
const TAGLINE_PX = 16;
const URL_PX = 20;

const STOPWORDS_TOPIC = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this',
  'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your',
  'he', 'she', 'his', 'her', 'i', 'me', 'my', 'who', 'what', 'when', 'where', 'why', 'how',
  'not', 'no', 'so', 'if', 'than', 'then', 'also', 'all', 'one', 'two', 'three', 'malaysia',
  'malaysian', 'government', 'people', 'public', 'years', 'year', 'said', 'says', 'about',
]);

function extractTopicKeywords(text) {
  if (!text) return [];
  const tokens = text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];
  const counts = new Map();
  for (const t of tokens) {
    if (STOPWORDS_TOPIC.has(t)) continue;
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k]) => k);
}

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrap(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = [];
  let len = 0;
  for (const word of words) {
    const need = (cur.length ? 1 : 0) + word.length;
    if (len + need > maxChars && cur.length) {
      lines.push(cur.join(' '));
      cur = [word];
      len = word.length;
    } else {
      cur.push(word);
      len += need;
    }
  }
  if (cur.length) lines.push(cur.join(' '));
  return lines;
}

function buildSvg(statement) {
  const lines = wrap(statement, STATEMENT_MAX_CHARS).slice(0, 7);
  const textH = lines.length * LINE_HEIGHT_PX;
  // brand block: T4A (48) + 18 + "The Fourth Angle" (24) + 28 + tagline (16)
  const brandH = T4A_WORDMARK_PX + 18 + FOURTH_ANGLE_PX + 28 + TAGLINE_PX;
  const totalH = textH + GAP_AFTER_STATEMENT + brandH;
  const blockTop = (H - totalH) / 2 - 30;

  const statementBaseline0 = blockTop + STATEMENT_PX;
  const statementTspans = lines
    .map((line, i) => `<tspan x="${W / 2}" y="${statementBaseline0 + i * LINE_HEIGHT_PX}">${escapeXml(line)}</tspan>`)
    .join('');

  const attribTop = blockTop + textH + GAP_AFTER_STATEMENT;
  const t4aY = attribTop + T4A_WORDMARK_PX; // baseline
  const fourthAngleY = t4aY + 18 + FOURTH_ANGLE_PX;
  const taglineY = fourthAngleY + 28;
  const urlY = H - 70;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><style>
      ${FONT_FACE_BLOCK}
  </style></defs>
  <rect width="${W}" height="${H}" fill="#000000"/>

  <text font-family="${FONT_DISPLAY}" font-weight="700" font-size="${STATEMENT_PX}" fill="#FFFFFF" text-anchor="middle">${statementTspans}</text>

  <text x="${W / 2}" y="${t4aY}" font-family="${FONT_DISPLAY}" font-weight="800" font-size="${T4A_WORDMARK_PX}" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">T4A</text>

  <text x="${W / 2}" y="${fourthAngleY}" font-family="${FONT_DISPLAY}" font-weight="700" font-size="${FOURTH_ANGLE_PX}" fill="#FFFFFF" fill-opacity="0.7" text-anchor="middle" letter-spacing="0.5">The Fourth Angle</text>

  <text x="${W / 2}" y="${taglineY}" font-family="${FONT_BODY}" font-weight="400" font-size="${TAGLINE_PX}" fill="#FFFFFF" fill-opacity="0.5" text-anchor="middle">Read past the first telling.</text>

  <text x="${W / 2}" y="${urlY}" font-family="${FONT_BODY}" font-weight="600" font-size="${URL_PX}" fill="#FFFFFF" fill-opacity="0.4" text-anchor="middle" letter-spacing="0.5">thefourthangle.pages.dev</text>
</svg>`;
}

async function renderCard(issue, cardIndex) {
  const card = issue.cards[cardIndex];
  const svg = buildSvg(card.big);
  const outPath = join(outDir, `issue-${issue.id}-card${cardIndex}-1080x1350.png`);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath);
  return outPath;
}

console.log(`Building social cards for ${published.length} published issues...`);

const cards = [];
let rendered = 0;
let errors = 0;

for (const issue of published) {
  if (!Array.isArray(issue.cards)) continue;

  for (let i = 0; i < issue.cards.length; i++) {
    const card = issue.cards[i];
    const type = card.t;
    const weight = CARD_WEIGHTS[type];
    if (weight === undefined) continue;
    if (!card.big) continue;

    try {
      await renderCard(issue, i);
      rendered++;
    } catch (err) {
      console.error(`  ERROR rendering issue ${issue.id} card ${i}:`, err.message);
      errors++;
      continue;
    }

    const combinedText = [issue.headline, issue.context, card.big, card.sub || ''].join(' ');
    const entities = [...extractEntities(combinedText)];
    const topicKeywords = extractTopicKeywords(`${card.big} ${card.sub || ''}`);

    cards.push({
      issueId: issue.id,
      cardIndex: i,
      cardType: type,
      big: card.big,
      sub: card.sub || '',
      lens: card.lens || null,
      entities,
      topicKeywords,
      sourceDate: issue.sourceDate || null,
      imagePath: `/og/social/issue-${issue.id}-card${i}-1080x1350.png`,
      weight,
    });
  }
}

const indexPath = join(root, 'public', 'social-card-index.json');
writeFileSync(
  indexPath,
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    issueCount: published.length,
    cardCount: cards.length,
    cards,
  }, null, 2),
);

console.log(`  Rendered ${rendered} card images (${errors} errors)`);
console.log(`  Wrote index: ${cards.length} entries → public/social-card-index.json`);

if (errors > 0) process.exit(1);
