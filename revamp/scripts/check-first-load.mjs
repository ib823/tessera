// Measure the JS bodies actually requested by a fresh browser, not every chunk
// in dist. Record both gzip and Brotli; enforce the stricter 150,000-byte gzip
// interpretation of the user's first-load limit. No production traffic needed.
import { chromium } from '@playwright/test';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { existsSync } from 'node:fs';
import { createPreviewServer } from './serve-preview.mjs';

const server = process.argv[2] === '--local' ? createPreviewServer(new URL('../dist/', import.meta.url).pathname) : null;
if (server) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = server ? `http://127.0.0.1:${server.address().port}` : new URL(process.argv[2] ?? 'http://127.0.0.1:4323').origin;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--disable-dev-shm-usage'] });
const reports = [];
try {
  for (const viewport of [{ width: 360, height: 640 }, { width: 1440, height: 900 }]) {
  for (const path of ['/', '/issue/1976']) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport });
    const page = await context.newPage();
    const responses = new Map();
    const thirdParty = new Set();
    const runtimeErrors = [];
    // Diagnostics: the full outside requests and their types (a CSP violation
    // report counts as one), failed loads, HTTP errors and CSP violations.
    const outsideRequests = [];
    const failedRequests = [];
    const httpErrors = [];
    const cspViolations = [];
    page.on('pageerror', error => runtimeErrors.push(error.message));
    page.on('request', request => {
      const url = new URL(request.url());
      if (['http:', 'https:'].includes(url.protocol) && url.origin !== origin) {
        thirdParty.add(url.origin);
        outsideRequests.push(`${request.method()} ${request.url()} (${request.resourceType()})`);
      }
    });
    page.on('requestfailed', request => failedRequests.push(`${request.url()} ${request.failure()?.errorText ?? ''}`));
    page.on('console', message => {
      const text = message.text();
      if (/content[- ]security[- ]policy/i.test(text) && /refused|blocked/i.test(text)) cspViolations.push(text);
    });
    page.on('response', response => {
      if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
      if (response.request().resourceType() === 'script') responses.set(response.url(), response);
    });
    const navigation = await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    if (!navigation?.ok()) throw new Error(`${path}: HTTP ${navigation?.status()}`);
    await page.locator('html.js-reader-mounted').waitFor({ timeout: 15_000 });
    const scripts = [];
    for (const [url, response] of responses) {
      const body = await response.body();
      scripts.push({ path: new URL(url).pathname, raw: body.length, gzip: gzipSync(body).length, brotli: brotliCompressSync(body).length });
    }
    const inline = await page.locator('script:not([src])').evaluateAll(elements => elements
      .filter(el => !el.getAttribute('type') || ['module', 'text/javascript', 'application/javascript'].includes(el.getAttribute('type')))
      .map(el => el.textContent ?? '').filter(Boolean));
    for (const [index, source] of inline.entries()) {
      const body = Buffer.from(source);
      scripts.push({ path: `inline:${index + 1}`, raw: body.length, gzip: gzipSync(body).length, brotli: brotliCompressSync(body).length });
    }
    const totals = scripts.reduce((sum, item) => ({ raw: sum.raw + item.raw, gzip: sum.gzip + item.gzip, brotli: sum.brotli + item.brotli }), { raw: 0, gzip: 0, brotli: 0 });
    const cookies = (await context.cookies()).map(cookie => cookie.name);
    reports.push({ path, viewport, totals, scripts, thirdParty: [...thirdParty], cookies, runtimeErrors, outsideRequests, failedRequests, httpErrors, cspViolations,
      pass: scripts.length > 0 && totals.gzip <= 150000 && thirdParty.size === 0 && cookies.length === 0 && runtimeErrors.length === 0 && cspViolations.length === 0 });
    await context.close();
  }
  }
} finally {
  var browserVersion = browser.version();
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
console.log(JSON.stringify({ browser: { version: browserVersion, executable: executablePath ?? 'Playwright-managed Chromium' }, method: 'fresh Chromium context, service workers blocked, networkidle; sum of separately compressed requested JS bodies and executable inline scripts (conservative for inline HTML compression)', budgetBytes: 150000, reports }, null, 2));
for (const report of reports.filter(report => !report.pass)) {
  console.error(`FAIL ${report.path} ${report.viewport.width}x${report.viewport.height}:`, JSON.stringify({
    gzip: report.totals.gzip, outsideRequests: report.outsideRequests, cspViolations: report.cspViolations, failedRequests: report.failedRequests,
    httpErrors: report.httpErrors, cookies: report.cookies, runtimeErrors: report.runtimeErrors }));
}
if (reports.some(report => !report.pass)) process.exitCode = 1;
