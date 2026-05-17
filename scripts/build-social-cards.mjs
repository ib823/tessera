/**
 * Generates per-card social images + index for the T4A social bot.
 *
 * The image format matches src/lib/share-card.ts exactly — the same card
 * users see when they tap "share" on the site:
 *
 *   1080×1350 portrait, pure black, statement centered in bold,
 *   small T4A logo + "The Fourth Angle" wordmark + tagline below,
 *   plain "thefourthangle.pages.dev" at the bottom.
 *
 * NO OG background art. NO /issue/{id} on the image. The post body
 * (in workers/social/src/bluesky.ts) carries the deep link.
 *
 * Inputs : src/data/issues/{id}.json (published only)
 * Outputs: public/og/social/issue-{id}-card{n}-1080x1350.png
 *          public/social-card-index.json
 *
 * Fonts: SVG references "Manrope" / "Nunito Sans" but librsvg falls back
 * to system DejaVu Sans because woff2 isn't loadable. To get exact
 * brand fidelity, drop Manrope-Bold.ttf + NunitoSans-Regular.ttf into
 * scripts/lib/fonts/ and install via fc-cache before the build runs.
 */
import sharp from 'sharp';
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
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

const issues = loadIssues();
const published = issues.filter((i) => i.published);

const CARD_WEIGHTS = {
  hook: 1.0,
  view: 0.9,
  reframe: 0.7,
  fact: 0.6,
  analogy: 0.5,
};

// ── Layout constants — ported 1:1 from src/lib/share-card.ts ──
const W = 1080;
const H = 1350;
const FONT_DISPLAY = "'Manrope', 'DejaVu Sans', sans-serif";
const FONT_BODY = "'Nunito Sans', 'DejaVu Sans', sans-serif";
const STATEMENT_PX = 42;
const LINE_HEIGHT_PX = 60;
const STATEMENT_MAX_WIDTH = W - 180;
const GAP_AFTER_STATEMENT = 52;
const WORDMARK_PX = 17;
const TAGLINE_PX = 12;
const URL_PX = 13;
const T4A_BADGE_PX = 28; // height; width is auto by ratio

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

// Approximate character-width wrapping. Manrope-bold-42 averages ~22 chars
// per 900px line. Tuned by eye against the production share card.
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
  const lines = wrap(statement, 28).slice(0, 6);
  const textH = lines.length * LINE_HEIGHT_PX;
  const brandH = T4A_BADGE_PX + 14 + WORDMARK_PX + 22 + TAGLINE_PX;
  const totalH = textH + GAP_AFTER_STATEMENT + brandH;
  // Center vertically, shifted -30 to match share-card.ts behaviour.
  const blockTop = (H - totalH) / 2 - 30;

  // Statement: baseline is approx font-size; first line baseline at blockTop + STATEMENT_PX.
  const statementBaseline0 = blockTop + STATEMENT_PX;
  const statementTspans = lines
    .map((line, i) => `<tspan x="${W / 2}" y="${statementBaseline0 + i * LINE_HEIGHT_PX}">${escapeXml(line)}</tspan>`)
    .join('');

  // Attribution block starts after statement + gap.
  const attribTop = blockTop + textH + GAP_AFTER_STATEMENT;

  // T4A wordmark — plain bold text, white, mirrors public/logo.png as a glyph.
  const badgeY = attribTop + T4A_BADGE_PX; // baseline

  const wordmarkY = attribTop + T4A_BADGE_PX + 14 + WORDMARK_PX;
  const taglineY = wordmarkY + 22;
  const urlY = H - 56;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#000000"/>

  <text font-family="${FONT_DISPLAY}" font-weight="700" font-size="${STATEMENT_PX}" fill="#FFFFFF" text-anchor="middle">${statementTspans}</text>

  <text x="${W / 2}" y="${badgeY}" font-family="${FONT_DISPLAY}" font-weight="800" font-size="${T4A_BADGE_PX}" fill="#FFFFFF" fill-opacity="0.9" text-anchor="middle" letter-spacing="0.5">T4A</text>

  <text x="${W / 2}" y="${wordmarkY}" font-family="${FONT_DISPLAY}" font-weight="700" font-size="${WORDMARK_PX}" fill="#FFFFFF" fill-opacity="0.65" text-anchor="middle">The Fourth Angle</text>

  <text x="${W / 2}" y="${taglineY}" font-family="${FONT_BODY}" font-size="${TAGLINE_PX}" fill="#FFFFFF" fill-opacity="0.3" text-anchor="middle">Read past the first telling.</text>

  <text x="${W / 2}" y="${urlY}" font-family="${FONT_BODY}" font-size="${URL_PX}" fill="#FFFFFF" fill-opacity="0.2" text-anchor="middle">thefourthangle.pages.dev</text>
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
