// Keeps the site's own words on one name. See "Names" in CLAUDE.md:
//
//   FORA             the brand. Titles, metadata, labels, notifications and copy.
//   The Fourth Angle the original name. FORA is short for it. It appears only
//                    where a sentence explains the name ("FORA, short for The
//                    Fourth Angle, ...") and as alternateName in structured data.
//   T4A              our signature: share and OG images, and the figures and
//                    compilations we make ourselves. Never the site's name in copy.
//
// This reads what the FORA build serves: canonical src/ with the revamp/src
// overlay applied, the shipped root files of public/ (overlay first), and the
// Workers. Code comments are ignored. It fails on any other "The Fourth Angle",
// "Fourth Angle", "4th Angle" or "T4A".
//
// Not checked: editorial content in src/data (issues and dossiers change their
// wording only through an edition), and the image generators in scripts/,
// which draw the full name and the T4A signature into images by design.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const revamp = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = resolve(revamp, '..');

const NAMES = [/\bT4A\b/g, /\b(?:the\s+)?fourth\s+angle\b/gi, /\b4th\s+angle\b/gi];

// Phrases that explain the name. Each is removed before the names are searched.
const EXPLAINS = [
  /\bshort for The Fourth Angle\b/g,
  /\bsingkatan bagi The Fourth Angle\b/g,
  /\balternateName\W+The Fourth Angle\b/g,
  /\bT4A is our signature\b/g,
  /\bT4A ialah tandatangan kami\b/g,
  /\bFORA, The Fourth Angle and T4A\b/g,
  /\bour own compilations T4A\b/g,
  // Signature marks on our own work.
  /\bT4A compilation\b/g,
  /class="pl__avatar">T4A</g,
];

// Files that draw images: the full name and the signature belong there.
const IMAGE_FILES = new Set(['src/lib/share-card.ts']);

// Root files of public/ that ship as written. verify.html is generated from
// verify.template.html; the JSON indexes carry editorial text.
const PUBLIC_FILES = ['offline.html', 'verify.template.html', 'manifest.json', 'sw.js', 'robots.txt', '.well-known/security.txt'];

const CODE = /\.(astro|svelte|ts|js|mjs|html|json|txt)$/;

function walk(directory, found = []) {
  if (!existsSync(directory)) return found;
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      if (name === '__tests__' || name === 'node_modules') continue;
      walk(path, found);
    } else if (CODE.test(name) && !/\.(test|spec)\.ts$/.test(name)) {
      found.push(path);
    }
  }
  return found;
}

/** Files the FORA build serves, as repository-relative paths, overlay first. */
function shippedFiles() {
  const files = new Map();
  for (const path of walk(join(repository, 'src'))) {
    const name = relative(repository, path);
    if (!name.startsWith('src/data/')) files.set(name, name);
  }
  for (const path of walk(join(revamp, 'src'))) files.set(relative(revamp, path), relative(repository, path));
  for (const name of PUBLIC_FILES) {
    const overlay = join('revamp', 'public', name);
    const canonical = join('public', name);
    if (existsSync(join(repository, overlay))) files.set(canonical, overlay);
    else if (existsSync(join(repository, canonical))) files.set(canonical, canonical);
  }
  for (const worker of existsSync(join(repository, 'workers')) ? readdirSync(join(repository, 'workers')) : []) {
    for (const path of walk(join(repository, 'workers', worker, 'src'))) files.set(relative(repository, path), relative(repository, path));
  }
  return [...files].filter(([served]) => !IMAGE_FILES.has(served)).map(([, source]) => source).sort();
}

/** Blank out comments, keeping line numbers. */
function withoutComments(text) {
  const blank = (match) => match.replace(/[^\n]/g, ' ');
  return text
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:'"`\\])\/\/.*$/gm, (match, before) => before + blank(match.slice(before.length)));
}

export function violations(text) {
  const found = [];
  withoutComments(text).split('\n').forEach((line, index) => {
    let rest = line;
    for (const phrase of EXPLAINS) rest = rest.replace(phrase, (match) => ' '.repeat(match.length));
    for (const name of NAMES) {
      for (const match of rest.matchAll(name)) found.push({ line: index + 1, name: match[0], text: line.trim() });
    }
  });
  return found;
}

// The check must reject the old names and accept the explanations.
const SELF_TEST = [
  ['<title>Privacy | The Fourth Angle</title>', 1],
  ['<p>Everyone should be able to read T4A.</p>', 1],
  ['<meta name="apple-mobile-web-app-title" content="4th Angle" />', 1],
  ['<span>Fourth Angle</span>', 1],
  ['<p>FORA, short for The Fourth Angle, is independently operated. T4A is our signature.</p>', 0],
  ["const org = { name: 'FORA', alternateName: 'The Fourth Angle' };", 0],
  ['// T4A internal note\nwindow.dispatchEvent(new CustomEvent("t4a-open-issue"));', 0],
  ['<!-- The Fourth Angle -->\n<a href="https://thefourthangle.pages.dev/">FORA</a>', 0],
];
for (const [sample, expected] of SELF_TEST) {
  const actual = violations(sample).length;
  if (actual !== expected) throw new Error(`check-brand-names self-test: expected ${expected} finding(s), got ${actual}, in: ${sample}`);
}

const findings = [];
for (const file of shippedFiles()) {
  for (const finding of violations(readFileSync(join(repository, file), 'utf8'))) findings.push({ file, ...finding });
}

if (findings.length > 0) {
  console.error(`Brand names: ${findings.length} use(s) of an old name in the site's own words.`);
  console.error('Use FORA. Explain the name only as "FORA, short for The Fourth Angle". T4A is our signature, not our name (see "Names" in CLAUDE.md).\n');
  for (const { file, line, name, text } of findings) console.error(`  ${file}:${line}  "${name}"  ${text.slice(0, 140)}`);
  process.exit(1);
}
console.log(`Brand names: OK (${shippedFiles().length} shipped source files use FORA).`);
