/**
 * Generates per-card social images + index for the T4A social bot.
 *
 * For every published issue, every reader-facing card (hook/fact/reframe/analogy/view)
 * produces:
 *   - public/og/social/issue-{id}-card{n}-1200x675.png  (Bluesky/X-ready)
 *   - one entry in public/social-card-index.json
 *
 * The Worker reads the JSON index from KV (uploaded post-deploy via wrangler kv:key put)
 * and fetches images from Pages at post time.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIssues } from './lib/load-issues.mjs';
import { extractEntities } from './lib/entity-patterns.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const outDir = join(root, 'public', 'og', 'social');
const bgDir = join(root, 'public', 'og', 'backgrounds');
mkdirSync(outDir, { recursive: true });

// Clean stale renders (regenerable artefacts).
for (const file of readdirSync(outDir)) {
  if (file.startsWith('issue-') && /\.(png|jpg|jpeg)$/i.test(file)) {
    unlinkSync(join(outDir, file));
  }
}

const issues = loadIssues();
const published = issues.filter((i) => i.published);

// Cards that are postable as standalone social posts, with priority weights.
const CARD_WEIGHTS = {
  hook: 1.0,
  view: 0.9,
  reframe: 0.7,
  fact: 0.6,
  analogy: 0.5,
};

const STOPWORDS = new Set([
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
    if (STOPWORDS.has(t)) continue;
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k]) => k);
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
  let current = [];
  let len = 0;
  for (const word of words) {
    const need = (current.length ? 1 : 0) + word.length;
    if (len + need > maxChars && current.length) {
      lines.push(current.join(' '));
      current = [word];
      len = word.length;
    } else {
      current.push(word);
      len += need;
    }
  }
  if (current.length) lines.push(current.join(' '));
  return lines;
}

const FONT_DISPLAY = "'DejaVu Sans', 'Liberation Sans', sans-serif";
const FONT_BODY = "'DejaVu Sans', 'Liberation Sans', sans-serif";

function buildOverlaySvg({ big, sub, issueId, lens }) {
  // 1200×675 canvas, semi-transparent dark band over the issue art.
  const bigLines = wrap(big, 36).slice(0, 3);
  const subLines = sub ? wrap(sub, 60).slice(0, 3) : [];

  const lensChip = lens
    ? `<rect x="990" y="40" width="170" height="36" rx="18" fill="#FFFFFF" opacity="0.12"/>
       <text x="1075" y="64" font-family="${FONT_BODY}" font-size="16" font-weight="700"
             fill="#FFFFFF" text-anchor="middle" letter-spacing="1.2">${escapeXml(lens.toUpperCase())}</text>`
    : '';

  let y = 235;
  const bigTspans = bigLines
    .map((line) => {
      const dy = y;
      y += 62;
      return `<tspan x="60" y="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join('');

  let subY = y + 12;
  const subTspans = subLines
    .map((line) => {
      const dy = subY;
      subY += 34;
      return `<tspan x="60" y="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <rect width="1200" height="675" fill="#0f0f23" opacity="0.78"/>

  <!-- T4A wordmark badge top-left -->
  <circle cx="80" cy="60" r="34" fill="#FFFFFF" opacity="0.92"/>
  <text x="80" y="69" font-family="${FONT_DISPLAY}" font-size="22" font-weight="800"
        fill="#0f0f23" text-anchor="middle" letter-spacing="0.5">T4A</text>
  <text x="130" y="56" font-family="${FONT_BODY}" font-size="18" font-weight="600"
        fill="#FFFFFF" opacity="0.95">The Fourth Angle</text>
  <text x="130" y="78" font-family="${FONT_BODY}" font-size="13" font-weight="400"
        fill="#FFFFFF" opacity="0.6">Non-partisan Malaysian issues</text>

  ${lensChip}

  <!-- Main copy -->
  <text font-family="${FONT_DISPLAY}" font-size="50" font-weight="800"
        fill="#FFFFFF">${bigTspans}</text>
  <text font-family="${FONT_BODY}" font-size="26" font-weight="400"
        fill="#FFFFFF" opacity="0.82">${subTspans}</text>

  <!-- Footer URL bottom-right -->
  <text x="1140" y="635" font-family="${FONT_BODY}" font-size="18" font-weight="500"
        fill="#FFFFFF" opacity="0.7" text-anchor="end">thefourthangle.pages.dev/issue/${issueId}</text>
</svg>`;
}

async function renderCard(issue, cardIndex) {
  const card = issue.cards[cardIndex];
  const bgPathPng = join(bgDir, `issue-${issue.id}-bg.png`);
  const bgPathJpg = join(bgDir, `issue-${issue.id}-bg.jpg`);
  const bgPath = existsSync(bgPathPng) ? bgPathPng : existsSync(bgPathJpg) ? bgPathJpg : null;

  let base;
  if (bgPath) {
    base = sharp(bgPath).resize(1200, 675, { fit: 'cover', position: 'center' });
  } else {
    base = sharp({
      create: { width: 1200, height: 675, channels: 3, background: { r: 15, g: 15, b: 35 } },
    });
  }

  const big = card.big || '';
  const sub = card.sub || '';
  const lens = card.lens || null;

  const overlaySvg = buildOverlaySvg({ big, sub, issueId: issue.id, lens });
  const overlayBuf = Buffer.from(overlaySvg);

  const outPath = join(outDir, `issue-${issue.id}-card${cardIndex}-1200x675.jpg`);

  await base
    .composite([{ input: overlayBuf, top: 0, left: 0 }])
    .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:2:0' })
    .toFile(outPath);

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
    if (weight === undefined) continue; // skip unknown card types
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
      imagePath: `/og/social/issue-${issue.id}-card${i}-1200x675.jpg`,
      weight,
    });
  }
}

const indexPath = join(root, 'public', 'social-card-index.json');
const index = {
  generatedAt: new Date().toISOString(),
  issueCount: published.length,
  cardCount: cards.length,
  cards,
};
writeFileSync(indexPath, JSON.stringify(index, null, 2));

console.log(`  Rendered ${rendered} card images (${errors} errors)`);
console.log(`  Wrote index: ${cards.length} entries → public/social-card-index.json`);

if (errors > 0) process.exit(1);
