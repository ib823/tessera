/**
 * Generates OG images for each PUBLISHED issue.
 * The issue's one-line art is the OG image, resized to 1200×630 (1.91:1)
 * with center crop. The og:image PNG alone carries a small date and source
 * label (playbook §10: a shared or screenshotted image should say when and
 * where it is from); the responsive hero variants stay clean art.
 * Issues without a background image are blocked by validation.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIssues } from './lib/load-issues.mjs';
import wawoff from 'wawoff2';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const issues = loadIssues();

const outDir = join(root, 'public', 'og');
const bgDir = join(root, 'public', 'og', 'backgrounds');
mkdirSync(outDir, { recursive: true });

// Clean regenerable artefacts for all formats. We keep the /og/backgrounds/
// source art, which is checked into the repo and hand-authored.
for (const file of readdirSync(outDir)) {
  if (!file.startsWith('issue-')) continue;
  if (/\.(png|webp|avif|jpg|jpeg)$/i.test(file)) {
    unlinkSync(join(outDir, file));
  }
}

// ── Date + source label for the og:image PNG ──
const FONTSOURCE = join(root, 'node_modules', '@fontsource');
const ttf = await wawoff.decompress(readFileSync(join(FONTSOURCE, 'nunito-sans/files/nunito-sans-latin-600-normal.woff2')));
const FONT_FACE = `@font-face { font-family: 'Nunito Sans'; src: url(data:font/ttf;base64,${Buffer.from(ttf).toString('base64')}) format('truetype'); font-weight: 600; }`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Calendar day in Malaysia time, as the site shows it (src/lib/issue-meta.ts).
function dayOf(value) {
  if (!value) return null;
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getTime() + 8 * 3600e3).toISOString().slice(0, 10);
}
const fmt = (day) => { const [y, m, d] = day.split('-'); return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`; };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function dateLabel(issue) {
  const published = dayOf(issue.publishedAt) ?? dayOf(issue.sourceDate);
  if (!published) return 'thefourthangle.pages.dev';
  const modified = dayOf(issue.modifiedAt);
  const updated = modified && modified > published ? ` · Updated ${fmt(modified)}` : '';
  return `thefourthangle.pages.dev · ${fmt(published)}${updated}`;
}
function labelSvg(text) {
  // Bottom-left pill; the art keeps its right side and T4A signature free.
  const size = 24;
  const padX = 18;
  const w = Math.round(text.length * size * 0.51) + padX * 2;
  const h = 44;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <style>${FONT_FACE}</style>
    <rect x="28" y="${630 - 28 - h}" width="${w}" height="${h}" rx="${h / 2}" fill="#0f0f23" fill-opacity="0.82"/>
    <text x="${28 + padX}" y="${630 - 28 - h / 2 + size * 0.36}" font-family="'Nunito Sans', sans-serif" font-weight="600" font-size="${size}" fill="#ffffff" fill-opacity="0.92">${esc(text)}</text>
  </svg>`);
}

// Only generate for published issues
const published = issues.filter(i => i.published);

console.log(`Generating OG images for ${published.length} published issues...`);

let count = 0;
let errors = 0;

for (const issue of published) {
  try {
    const bgPathPng = join(bgDir, `issue-${issue.id}-bg.png`);
    const bgPathJpg = join(bgDir, `issue-${issue.id}-bg.jpg`);
    const bgPath = existsSync(bgPathPng) ? bgPathPng : existsSync(bgPathJpg) ? bgPathJpg : null;

    if (!bgPath) {
      console.error(`  ERROR: Issue ${issue.id} is published but has no background image`);
      errors++;
      continue;
    }

    const outPath = join(outDir, `issue-${issue.id}.png`);

    // The art IS the OG — resize to 1200×630 with center crop.
    // This PNG is kept at canonical 1200×630 because it is the URL that
    // goes into <meta property="og:image"> for social scrapers, which do
    // not all understand <picture>.
    const art = await sharp(bgPath)
      .resize(1200, 630, { fit: 'cover', position: 'centre' })
      .png()
      .toBuffer();
    await sharp(art)
      .composite([{ input: labelSvg(dateLabel(issue)), top: 0, left: 0 }])
      .png({ compressionLevel: 9 })
      .toFile(outPath);

    // Responsive variants for <picture> delivery. See ADR-0002 Phase 8b.
    // Widths target 1x / 2x / 3x scenarios: small phone portrait (~375 CSS
    // px × 1.7 DPR), medium (~700 CSS px), and large (~1200 CSS px).
    // Encode order per width: AVIF → WebP → JPEG.
    const widths = [640, 960, 1200];
    for (const w of widths) {
      const h = Math.round(w / 1.9047619); // maintain 1.91:1 aspect
      const sized = sharp(bgPath).resize(w, h, { fit: 'cover', position: 'centre' });
      // Clone the resized pipeline per encoder; sharp pipelines are single-use.
      await sized.clone().avif({ quality: 55, effort: 6 }).toFile(join(outDir, `issue-${issue.id}-${w}w.avif`));
      await sized.clone().webp({ quality: 80 }).toFile(join(outDir, `issue-${issue.id}-${w}w.webp`));
      await sized.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(join(outDir, `issue-${issue.id}-${w}w.jpg`));
    }

    count++;
  } catch (e) {
    errors++;
    console.error(`  ERROR issue ${issue.id}: ${e.message}`);
  }
}

console.log(`Done: ${count} OG images generated, ${errors} errors.`);
if (errors > 0) process.exit(1);
