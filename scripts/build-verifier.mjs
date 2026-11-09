/**
 * Builds verify.html with embedded signatures sourced from signatures.json.
 * The reader and verifier therefore consume the same fingerprint manifest.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadIssues } from './lib/load-issues.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const templatePath = join(root, 'public', 'verify.template.html');
const outputPath = join(root, 'public', 'verify.html');
const signaturesPath = join(root, 'public', 'signatures.json');

if (!existsSync(templatePath)) {
  copyFileSync(outputPath, templatePath);
}

const manifest = existsSync(signaturesPath)
  ? JSON.parse(readFileSync(signaturesPath, 'utf8'))
  : { issues: {} };

const signatures = Object.entries(manifest.issues || {}).map(([id, entry]) => ({
  id,
  fp: entry.fingerprint,
  sig: entry.signature || '',
}));

// Read template and embed
let html = readFileSync(templatePath, 'utf8');
html = html.replace('SIGNATURES_PLACEHOLDER', JSON.stringify(signatures));

// Step 1 links to the newest issue, where the "Copy for verification" button
// sits in the Share menu and at the end of the article (audit T-6).
const latest = loadIssues()
  .filter((issue) => issue.published === true && issue.retired !== true)
  .sort((a, b) => (b.sourceDate ?? '').localeCompare(a.sourceDate ?? '') || b.id.localeCompare(a.id))[0];
html = html.replace('LATEST_ISSUE_HREF', latest ? `/issue/${latest.id}` : '/');
writeFileSync(outputPath, html, 'utf8');

console.log(`Verifier: ${signatures.length} published issue signatures embedded`);
