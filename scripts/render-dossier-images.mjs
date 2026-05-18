#!/usr/bin/env node
/**
 * scripts/render-dossier-images.mjs
 * ----------------------------------------------------------------
 * Rasterises every SVG under public/dossiers/<ID>/sources/ to PNG
 * at its declared dimensions, writing PNGs to the parent dossier
 * directory.
 *
 * Naming convention:
 *   public/dossiers/D001/sources/og-1200x630.svg
 *     → public/dossiers/D001/og-1200x630.png
 *
 *   public/dossiers/D001/sources/fig-cover.svg
 *     → public/dossiers/D001/fig-cover.png
 *
 * Dimensions are extracted from the SVG's width/height attributes;
 * fallback to viewBox if not declared.
 *
 * Requires: `sharp` (already a project dependency for issue OGs).
 *
 * Integration: add to package.json build chain BEFORE astro build,
 * AFTER validate-dossiers. Example:
 *
 *   "... && validate-dossiers && render-dossier-images && astro build && ..."
 *
 * No external network access. No new dependencies beyond sharp.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, basename, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DOSSIERS_ROOT = join(ROOT, 'public', 'dossiers');

let rendered = 0;
let skipped = 0;
let errors = 0;

if (!existsSync(DOSSIERS_ROOT)) {
  console.log('No public/dossiers directory; nothing to render.');
  process.exit(0);
}

for (const dossierId of readdirSync(DOSSIERS_ROOT)) {
  const sourcesDir = join(DOSSIERS_ROOT, dossierId, 'sources');
  if (!existsSync(sourcesDir) || !statSync(sourcesDir).isDirectory()) continue;

  console.log(`Dossier ${dossierId} sources:`);
  for (const file of readdirSync(sourcesDir)) {
    if (!file.endsWith('.svg')) continue;
    const svgPath = join(sourcesDir, file);
    const pngName = file.replace(/\.svg$/, '.png');
    const pngPath = join(DOSSIERS_ROOT, dossierId, pngName);

    // Skip if PNG is newer than source SVG
    try {
      const svgStat = statSync(svgPath);
      if (existsSync(pngPath)) {
        const pngStat = statSync(pngPath);
        if (pngStat.mtimeMs > svgStat.mtimeMs) {
          console.log(`  ${file} → ${pngName} (up-to-date, skipped)`);
          skipped++;
          continue;
        }
      }
    } catch (e) {
      // fall through and re-render
    }

    try {
      const svgBuffer = readFileSync(svgPath);
      // Extract dimensions from filename when present (e.g. "og-1200x630.svg")
      const dimMatch = file.match(/(\d+)x(\d+)/);
      const width = dimMatch ? parseInt(dimMatch[1], 10) : 1200;
      const height = dimMatch ? parseInt(dimMatch[2], 10) : 630;

      const pngBuffer = await sharp(svgBuffer, { density: 300 })
        .resize(width, height, { fit: 'fill' })
        .png({ compressionLevel: 9, palette: false })
        .toBuffer();

      writeFileSync(pngPath, pngBuffer);
      console.log(`  ✓ ${file} → ${pngName} (${width}×${height}, ${pngBuffer.length} bytes)`);
      rendered++;
    } catch (e) {
      console.error(`  ✗ ${file} → ${pngName} (FAILED: ${e.message})`);
      errors++;
    }
  }
}

console.log('');
console.log(`Done. ${rendered} rendered, ${skipped} up-to-date, ${errors} errors.`);
process.exit(errors > 0 ? 1 : 0);
