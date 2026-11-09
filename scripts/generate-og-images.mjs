/**
 * Generates OG images for each PUBLISHED issue.
 * The issue's one-line art is the OG image, resized to 1200×630 (1.91:1)
 * with center crop. The og:image PNG alone carries a small date and source
 * label (playbook §10: a shared or screenshotted image should say when and
 * where it is from); the responsive hero variants stay clean art.
 * Issues without a background image are blocked by validation.
 */
import sharp from 'sharp';
import { mkdirSync, mkdtempSync, existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIssues } from './lib/load-issues.mjs';
import wawoff from 'wawoff2';
import { createCanvas, registerFont } from 'canvas';

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
// Drawn with node-canvas from the real font file: SVG text through sharp
// ignores embedded @font-face and falls back to whatever the machine has,
// which differs between local builds and CI.
const FONTSOURCE = join(root, 'node_modules', '@fontsource');
const ttf = await wawoff.decompress(readFileSync(join(FONTSOURCE, 'nunito-sans/files/nunito-sans-latin-600-normal.woff2')));
const fontFile = join(mkdtempSync(join(tmpdir(), 't4a-og-')), 'nunito-sans-600.ttf');
writeFileSync(fontFile, Buffer.from(ttf));
registerFont(fontFile, { family: 'T4A Label', weight: '600' });
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
function dateLabel(issue) {
  const published = dayOf(issue.publishedAt) ?? dayOf(issue.sourceDate);
  if (!published) return 'thefourthangle.pages.dev';
  const modified = dayOf(issue.modifiedAt);
  const updated = modified && modified > published ? ` · Updated ${fmt(modified)}` : '';
  return `thefourthangle.pages.dev · ${fmt(published)}${updated}`;
}
function labelPng(text) {
  // Bottom-left pill; the art keeps its right side and T4A signature free.
  const size = 24, padX = 18, h = 44, x = 28, y = 630 - 28 - h;
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');
  ctx.font = `600 ${size}px "T4A Label"`;
  const w = Math.ceil(ctx.measureText(text).width) + padX * 2;
  ctx.fillStyle = 'rgba(15, 15, 35, 0.82)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + h / 2 + 1);
  return canvas.toBuffer('image/png');
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
      .composite([{ input: labelPng(dateLabel(issue)), top: 0, left: 0 }])
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
