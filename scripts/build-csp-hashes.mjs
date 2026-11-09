/**
 * Compute SHA-256 hashes for all inline <script> blocks in built HTML.
 * Replaces CSP_SCRIPT_HASHES placeholder (or existing hashes) in dist/_headers.
 * Must run AFTER stealth.mjs (which modifies inline scripts).
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const distDir = join(root, 'dist');

function findHtmlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findHtmlFiles(full));
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

// Only executable scripts need a script-src hash. Data blocks such as
// <script type="application/ld+json"> are never run, so CSP does not apply
// to them; hashing them anyway would add one hash per issue page and push
// the CSP header past Cloudflare Pages' 2,000-character header limit.
const EXECUTABLE_TYPES = new Set(['', 'module', 'text/javascript', 'application/javascript', 'text/ecmascript', 'application/ecmascript']);

function isExecutable(attrs) {
  const m = /\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs || '');
  if (!m) return true;
  const type = (m[1] ?? m[2] ?? m[3] ?? '').trim().toLowerCase();
  return EXECUTABLE_TYPES.has(type);
}

const hashes = new Set();
let dataBlocks = 0;
for (const file of findHtmlFiles(distDir)) {
  const html = readFileSync(file, 'utf8');
  // `*?`, not `+?`: an empty external script (<script src=...></script>)
  // must match as empty. With `+?` the match ran on to the next </script>,
  // hashing a bogus "</script>…<script>…" span and skipping the inline
  // script that followed it on that page.
  for (const m of html.matchAll(/<script(\s[^>]*)?>(.*?)<\/script>/gs)) {
    if (m[2] === '' || /\bsrc\s*=/i.test(m[1] || '')) continue;
    if (!isExecutable(m[1])) {
      dataBlocks++;
      continue;
    }
    hashes.add(`'sha256-${createHash('sha256').update(m[2]).digest('base64')}'`);
  }
}

const hashDirective = hashes.size > 0
  ? [...hashes].join(' ')
  : "'unsafe-inline'";

console.log(`  ✓ ${hashes.size} inline script hash(es) (${dataBlocks} non-executable data block(s) skipped)`);

// Update dist/_headers — handles both placeholder and hardcoded hashes
const distHeaders = join(distDir, '_headers');
if (!existsSync(distHeaders)) {
  console.error('  ✗ dist/_headers not found');
  process.exit(1);
}

let content = readFileSync(distHeaders, 'utf8');
const original = content;

// Try placeholder first, then fall back to regex for existing hashes
if (content.includes('CSP_SCRIPT_HASHES')) {
  content = content.replace('CSP_SCRIPT_HASHES', hashDirective);
} else {
  // Replace existing script-src hashes (handles stale hardcoded hashes from git)
  content = content.replace(
    /script-src\s+'self'\s+[^;]+/,
    `script-src 'self' ${hashDirective}`
  );
}

if (content === original) {
  console.error('  ✗ ERROR: Could not update CSP in dist/_headers — no placeholder or script-src found');
  process.exit(1);
}

writeFileSync(distHeaders, content);
console.log('  ✓ Updated dist/_headers');

const cspValue = /Content-Security-Policy:\s*(.*)/.exec(content)?.[1] ?? '';
if (cspValue.length > 2000) {
  console.warn(`  ⚠ CSP header is ${cspValue.length} chars; Cloudflare Pages limits a _headers header to 2,000.`);
}
