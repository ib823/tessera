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
 * Fonts: Manrope 700/800 + Nunito Sans 400/600 from @fontsource, converted
 * from woff2 to TTF at build start and registered with node-canvas, which
 * draws from those files. (SVG text through sharp/librsvg ignores embedded
 * @font-face and falls back to the machine's fonts, which differ on CI.)
 *
 * The statement is never cut. It is wrapped by measured width, and a long
 * statement steps down in size until it fits the text area. A statement
 * that cannot fit even at the smallest size is left out of the index, so
 * the bot never posts an image that drops words.
 */
import sharp from 'sharp';
import wawoff from 'wawoff2';
import { createCanvas, registerFont } from 'canvas';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

// ── Fonts: convert woff2 from @fontsource to TTF and register with canvas ──
const FONTSOURCE = join(root, 'node_modules', '@fontsource');
const fontSpecs = [
  { family: 'Manrope', weight: 700, src: join(FONTSOURCE, 'manrope/files/manrope-latin-700-normal.woff2') },
  { family: 'Manrope', weight: 800, src: join(FONTSOURCE, 'manrope/files/manrope-latin-800-normal.woff2') },
  { family: 'Nunito Sans', weight: 400, src: join(FONTSOURCE, 'nunito-sans/files/nunito-sans-latin-400-normal.woff2') },
  { family: 'Nunito Sans', weight: 600, src: join(FONTSOURCE, 'nunito-sans/files/nunito-sans-latin-600-normal.woff2') },
];

console.log('Loading fonts...');
const fontDir = mkdtempSync(join(tmpdir(), 't4a-social-'));
for (const f of fontSpecs) {
  const ttf = await wawoff.decompress(readFileSync(f.src));
  const file = join(fontDir, `${f.family.replace(/\s+/g, '-')}-${f.weight}.ttf`);
  writeFileSync(file, Buffer.from(ttf));
  registerFont(file, { family: f.family, weight: String(f.weight) });
}

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
const FONT_DISPLAY = '"Manrope"';
const FONT_BODY = '"Nunito Sans"';

const STATEMENT_PX = 48; // preferred size; long statements step down from here
const MIN_STATEMENT_PX = 34;
const LINE_HEIGHT_RATIO = 66 / 48;
const CONTENT_W = 900;
const TEXT_BUDGET_PX = 7 * 66; // the height seven lines take at 48px
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

// Wrap by measured width in the current font. Lossless: every word lands on
// a line, so joining the lines gives back the statement.
function wrap(ctx, text, maxWidth) {
  const words = text.trim().split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Largest size from STATEMENT_PX down whose wrapped lines all fit the
// content width and the text budget; null if none does.
function fitStatement(ctx, statement) {
  for (let px = STATEMENT_PX; px >= MIN_STATEMENT_PX; px -= 2) {
    ctx.font = `700 ${px}px ${FONT_DISPLAY}`;
    const lineHeight = Math.round(px * LINE_HEIGHT_RATIO);
    const lines = wrap(ctx, statement, CONTENT_W);
    const fitsWidth = lines.every((l) => ctx.measureText(l).width <= CONTENT_W);
    if (fitsWidth && lines.length * lineHeight <= TEXT_BUDGET_PX) return { px, lineHeight, lines };
  }
  return null;
}

// Centered text with letter spacing (node-canvas has no ctx.letterSpacing).
function drawSpaced(ctx, text, cx, y, spacing) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = 'left';
  chars.forEach((c, k) => {
    ctx.fillText(c, x, y);
    x += widths[k] + spacing;
  });
  ctx.textAlign = 'center';
}

function drawCard(statement) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const fit = fitStatement(ctx, statement);
  if (!fit) return null;

  const textH = fit.lines.length * fit.lineHeight;
  // brand block: T4A (48) + 18 + "The Fourth Angle" (24) + 28 + tagline (16)
  const brandH = T4A_WORDMARK_PX + 18 + FOURTH_ANGLE_PX + 28 + TAGLINE_PX;
  const totalH = textH + GAP_AFTER_STATEMENT + brandH;
  const blockTop = (H - totalH) / 2 - 30;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 ${fit.px}px ${FONT_DISPLAY}`;
  const baseline0 = blockTop + fit.px;
  fit.lines.forEach((line, k) => ctx.fillText(line, W / 2, baseline0 + k * fit.lineHeight));

  const attribTop = blockTop + textH + GAP_AFTER_STATEMENT;
  const t4aY = attribTop + T4A_WORDMARK_PX; // baseline
  const fourthAngleY = t4aY + 18 + FOURTH_ANGLE_PX;
  const taglineY = fourthAngleY + 28;
  const urlY = H - 70;

  ctx.font = `800 ${T4A_WORDMARK_PX}px ${FONT_DISPLAY}`;
  drawSpaced(ctx, 'T4A', W / 2, t4aY, 1);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = `700 ${FOURTH_ANGLE_PX}px ${FONT_DISPLAY}`;
  drawSpaced(ctx, 'The Fourth Angle', W / 2, fourthAngleY, 0.5);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = `400 ${TAGLINE_PX}px ${FONT_BODY}`;
  ctx.fillText('Read past the first telling.', W / 2, taglineY);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = `600 ${URL_PX}px ${FONT_BODY}`;
  drawSpaced(ctx, 'thefourthangle.pages.dev', W / 2, urlY, 0.5);

  return { png: canvas.toBuffer('image/png'), fit };
}

async function renderCard(issue, cardIndex) {
  const card = issue.cards[cardIndex];
  const drawn = drawCard(card.big);
  if (!drawn) return null;
  const outPath = join(outDir, `issue-${issue.id}-card${cardIndex}-1080x1350.png`);
  await sharp(drawn.png).png({ compressionLevel: 9 }).toFile(outPath);
  return drawn.fit;
}

console.log(`Building social cards for ${published.length} published issues...`);

const cards = [];
let rendered = 0;
let errors = 0;
let shrunk = 0;
const unfit = [];

for (const issue of published) {
  if (!Array.isArray(issue.cards)) continue;

  for (let i = 0; i < issue.cards.length; i++) {
    const card = issue.cards[i];
    const type = card.t;
    const weight = CARD_WEIGHTS[type];
    if (weight === undefined) continue;
    if (!card.big) continue;

    try {
      const fit = await renderCard(issue, i);
      if (!fit) {
        // Too long to show whole: leave it out rather than post a cut statement.
        unfit.push(`${issue.id}#${i}`);
        continue;
      }
      if (fit.px < STATEMENT_PX) shrunk++;
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

console.log(`  Rendered ${rendered} card images (${errors} errors); ${shrunk} set below ${STATEMENT_PX}px to fit`);
if (unfit.length) console.warn(`  WARN: ${unfit.length} card(s) too long to show whole, left out of the index: ${unfit.join(', ')}`);
console.log(`  Wrote index: ${cards.length} entries → public/social-card-index.json`);

if (errors > 0) process.exit(1);
