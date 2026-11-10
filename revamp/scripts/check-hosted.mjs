// Read-only checks of the actual Pages origin. No account, subscription, sync
// state or worker KV writes. Run only after the signed build's release gates.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';

const input = new URL(process.argv[2]);
assert.equal(input.protocol, 'https:');
assert.ok(input.hostname === 'thefourthangle.pages.dev' || /^[a-f0-9]+\.thefourthangle\.pages\.dev$/.test(input.hostname),
  'Use the production origin or immutable hexadecimal Pages deployment URL, not the branch alias.');
const origin = input.origin;
const dist = new URL('../dist/', import.meta.url);
const hash = value => createHash('sha256').update(Buffer.from(value)).digest('hex');
async function get(path) {
  const response = await fetch(`${origin}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, 200, `${path}: expected 200, received ${response.status}`);
  return response;
}

const routes = ['/', '/issue/1976', '/topic/legal', '/dossier/D001', '/infographics',
  '/about', '/disclaimer', '/verify', '/privacy', '/privasi', '/corrections', '/contact', '/accessibility'];
const issueInputs = new URL('../../src/data/issues/', import.meta.url);
const issues = await Promise.all((await readdir(issueInputs)).filter(name => name.endsWith('.json'))
  .map(async name => JSON.parse(await readFile(new URL(name, issueInputs), 'utf8'))));
for (const issue of issues.filter(issue => !issue.published && issue.publishedAt)) routes.push(`/issue/${issue.id}`);

for (const path of routes) {
  const response = await get(path);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/, `${path}: HTML content type`);
  const csp = response.headers.get('content-security-policy') ?? '';
  assert.match(csp, /default-src 'self'/, `${path}: CSP applied`);
  assert.match(csp, /'sha256-/, `${path}: inline hashes applied`);
  assert.ok(!csp.includes('CSP_SCRIPT_HASHES'), `${path}: no unresolved CSP placeholder`);
  assert.match(response.headers.get('strict-transport-security') ?? '', /max-age=/, `${path}: HSTS applied`);
  const localPath = path === '/' ? 'index.html' : `${path.slice(1)}.html`;
  assert.equal(hash(await response.arrayBuffer()), hash(await readFile(new URL(localPath, dist))), `${path}: exact release HTML`);
}

const files = ['issues-feed.json', 'search-index.json', 'social-card-index.json', 'signatures.json', 'pubkey.pem',
  'rss.xml', 'sitemap.xml', 'sw.js', 'manifest.json', 'icons/icon-192.png', 'icons/badge-96.png', 'og/issue-1976.png'];
const social = JSON.parse(await readFile(new URL('social-card-index.json', dist), 'utf8'));
// Extract one existing social image URL without assuming the index's schema.
const socialPath = JSON.stringify(social).match(/\/og\/social\/[^"\s]+\.png/)?.[0];
assert.ok(socialPath, 'Social card index contains a PNG URL');
files.push(socialPath.slice(1));
for (const issue of issues.filter(issue => issue.published)) files.push(`issues/${issue.id}.json`);
for (const file of files) {
  const response = await get(`/${file}`);
  assert.equal(hash(await response.arrayBuffer()), hash(await readFile(new URL(file, dist))), `${file}: exact release artifact`);
  if (['sw.js', 'issues-feed.json', 'search-index.json', 'signatures.json'].includes(file)) {
    assert.match(response.headers.get('cache-control') ?? '', /no-store/, `${file}: mutable artifact is not cached`);
  }
}
const css = (await readdir(new URL('_a/', dist))).find(name => name.endsWith('.css'));
assert.ok(css, 'Compiled CSS exists');
assert.match((await get(`/_a/${css}`)).headers.get('cache-control') ?? '', /immutable/, 'Hashed asset caching');
const missing = await fetch(`${origin}/fora-release-check-missing-page`, { signal: AbortSignal.timeout(30_000) });
assert.equal(missing.status, 404, 'Unknown routes remain real 404s');

for (const [worker, health, action] of [
  ['https://tfa-notify.4thangle.workers.dev', '/api/health', '/api/subscribe'],
  ['https://tfa-sync.4thangle.workers.dev', '/api/sync/health', '/api/sync/push'],
]) {
  const response = await fetch(worker + health, { headers: { Origin: origin }, signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, 200, `${worker}: health`);
  assert.equal(response.headers.get('access-control-allow-origin'), origin, `${worker}: origin allowed`);
  assert.equal((await response.json()).status, 'ok');
  const preflight = await fetch(worker + action, { method: 'OPTIONS', headers: {
    Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type',
  }, signal: AbortSignal.timeout(30_000) });
  assert.ok(preflight.ok, `${worker}: preflight status ${preflight.status}`);
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin, `${worker}: preflight origin`);
  assert.match(preflight.headers.get('access-control-allow-methods') ?? '', /POST/);
  assert.match(preflight.headers.get('access-control-allow-headers') ?? '', /content-type/i);
}
console.log(`PASS: ${routes.length} hosted HTML routes, ${files.length} exact public artifacts, CSP/cache headers, 404 and both workers' health/CORS at ${origin}.`);
console.log('These read-only checks do not send a push notification or create/update an Angle Code.');
