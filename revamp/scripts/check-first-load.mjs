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
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
  args: ['--disable-dev-shm-usage'],
});
const reports = [];
try {
  for (const viewport of [{ width: 360, height: 640 }, { width: 1440, height: 900 }]) {
  for (const path of ['/', '/issue/1976']) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport });
    const page = await context.newPage();
    const responses = new Map();
    const thirdParty = new Set();
    const runtimeErrors = [];
    page.on('pageerror', error => runtimeErrors.push(error.message));
    page.on('request', request => {
      const url = new URL(request.url());
      if (['http:', 'https:'].includes(url.protocol) && url.origin !== origin) thirdParty.add(url.origin);
    });
    page.on('response', response => {
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
    reports.push({ path, viewport, totals, scripts, thirdParty: [...thirdParty], cookies, runtimeErrors, pass: scripts.length > 0 && totals.gzip <= 150000 && thirdParty.size === 0 && cookies.length === 0 && runtimeErrors.length === 0 });
    await context.close();
  }
  }
} finally {
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
console.log(JSON.stringify({ method: 'fresh Chromium context, service workers blocked, networkidle; sum of separately compressed requested JS bodies and executable inline scripts (conservative for inline HTML compression)', budgetBytes: 150000, reports }, null, 2));
if (reports.some(report => !report.pass)) process.exitCode = 1;
