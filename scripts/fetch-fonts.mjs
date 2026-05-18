#!/usr/bin/env node
/**
 * scripts/fetch-fonts.mjs
 * ----------------------------------------------------------------
 * Self-host Spectral and Inter WOFF2 files for the dossier reader.
 *
 * Both fonts are OFL-1.1 licensed; redistribution is permitted.
 * We download from rsms.me (Inter, the original distributor) and
 * the Google Fonts open mirror (Spectral) and drop the WOFF2 files
 * into /public/fonts/.
 *
 * Run once during repo setup:
 *
 *     node scripts/fetch-fonts.mjs
 *
 * After this, the @font-face declarations in src/styles/dossier.css
 * resolve locally. No Google Fonts CDN reference at runtime.
 *
 * If the font budget check fails (scripts/check-font-budget.mjs),
 * drop unused faces — the dossier needs only:
 *   Spectral 300, 300 italic, 400, 400 italic
 *   Inter    400, 500, 600
 *
 * Anything else is overhead.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONTS_DIR = join(ROOT, 'public', 'fonts');

// rsms.me hosts Inter directly from the maintainer (Rasmus Andersson).
// For Spectral, the canonical open distributor is fonts.googleapis.com
// css2 endpoint, but to keep the request shape inspectable we resolve
// the WOFF2 URLs manually. If these change, regenerate via:
//   curl -A 'Mozilla/5.0' 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;1,300;1,400&display=swap'
const SOURCES = {
  'spectral-300.woff2':
    'https://fonts.gstatic.com/s/spectral/v13/rnCs-xNNww_2s0amA9M8qrXHafOPXHIJErY.woff2',
  'spectral-300-italic.woff2':
    'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA-M-mHnOSOuk.woff2',
  'spectral-400.woff2':
    'https://fonts.gstatic.com/s/spectral/v13/rnCr-xNNww_2s0amA9v8qrXHafOPXHIJErY.woff2',
  'spectral-400-italic.woff2':
    'https://fonts.gstatic.com/s/spectral/v13/rnCu-xNNww_2s0amA-M-mHnOSOuk.woff2',
  'inter-400.woff2':
    'https://rsms.me/inter/font-files/Inter-Regular.woff2?v=4.0',
  'inter-500.woff2':
    'https://rsms.me/inter/font-files/Inter-Medium.woff2?v=4.0',
  'inter-600.woff2':
    'https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=4.0',
};

async function fetchOne(name, url) {
  const out = join(FONTS_DIR, name);
  if (existsSync(out)) {
    console.log(`  ⊘ ${name} (already present)`);
    return;
  }
  process.stdout.write(`  → ${name} … `);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 T4A-fetch-fonts/1.0' },
  });
  if (!res.ok) {
    console.log(`✗ ${res.status} ${res.statusText}`);
    throw new Error(`Failed to fetch ${name}: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  console.log(`${(buf.length / 1024).toFixed(1)}kb`);
}

async function main() {
  if (!existsSync(FONTS_DIR)) {
    mkdirSync(FONTS_DIR, { recursive: true });
  }
  console.log(`Fetching fonts into public/fonts/ …`);
  for (const [name, url] of Object.entries(SOURCES)) {
    await fetchOne(name, url);
  }
  console.log(`\n✓ Done. Now run \`node scripts/check-font-budget.mjs\` to confirm the budget holds.`);
  console.log(`  If it doesn't, drop italic faces from the dossier stylesheet — Spectral roman alone is enough.`);
}

main().catch((e) => {
  console.error(`\n✗ ${e.message}`);
  console.error(`  Spectral URLs change occasionally on Google Fonts. If a URL 404s, regenerate via:`);
  console.error(`  curl -A 'Mozilla/5.0' 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;1,300;1,400'`);
  process.exit(1);
});
