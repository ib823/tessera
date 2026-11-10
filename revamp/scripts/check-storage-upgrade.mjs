import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { expect } from '@playwright/test';
import { createPreviewServer } from './serve-preview.mjs';

// Pass a separately built, unchanged root application as the baseline.
if (!process.argv[2]) throw new Error('Usage: node revamp/scripts/check-storage-upgrade.mjs BASELINE_DIST [REPORT_DIR]');
const baseline = resolve(process.argv[2]);
const revamp = new URL('../dist/', import.meta.url).pathname;
const output = resolve(process.argv[3] ?? 'revamp/test-results/storage-upgrade');
await mkdir(output, { recursive: true });
let currentRoot = baseline;
const server = createPreviewServer(() => currentRoot);
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.FORA_CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--disable-dev-shm-usage'] });
const results = [];
try {
  for (const serviceWorkers of ['block', 'allow']) {
  for (const viewport of [{ width: 360, height: 640 }, { width: 1440, height: 900 }]) {
    currentRoot = baseline;
    const context = await browser.newContext({ viewport, serviceWorkers });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1(?::|\/))/, route => route.abort());
    const page = await context.newPage();
    await page.goto(`${origin}/issue/1976#card-2`);
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1);
    let previousCaches = [];
    if (serviceWorkers === 'allow') {
      await expect.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.active), { timeout: 15_000 }).toBe(true);
      await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
      previousCaches = await page.evaluate(() => caches.keys());
      assert.ok(previousCaches.some(name => name.startsWith('tfa-static-') && !name.endsWith('-fora-v1')));
    }
    if (viewport.width < 768) {
      await page.getByRole('button', { name: 'Next card', exact: true }).click();
    } else {
      await page.getByRole('button', { name: /^Card 3:/ }).click();
    }
    await expect.poll(() => page.evaluate(() => localStorage.getItem('tfa:v1:read:1976'))).toBeTruthy();
    await page.getByRole('button', { name: 'Highlight this insight', exact: true }).first().click();
    await expect(page.getByRole('button', { name: 'Remove highlight from this insight', exact: true })).toHaveCount(1);
    const snapshot = () => page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith('tfa:v1:read:') || k === 'tfa:v1:reactions' || k === 'tfa:v1:pos').map(k => [k, localStorage.getItem(k)])));
    const before = await snapshot();
    assert.ok(before['tfa:v1:reactions']);
    assert.ok(before['tfa:v1:read:1976']);
    await page.screenshot({ path: `${output}/before-${serviceWorkers}-${viewport.width}.png` });
    // Serve the revamp at exactly the same origin, preserving the context.
    currentRoot = revamp;
    if (serviceWorkers === 'allow') {
      await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); });
      await expect.poll(() => page.evaluate(() => caches.keys())).toEqual([previousCaches.find(name => name.startsWith('tfa-static-')) + '-fora-v1']);
      // The new worker must replace old cached icons, not only change its name.
      const cachedIcon = await page.evaluate(async () => {
        const response = await caches.match('/icons/icon-192.png');
        const bytes = await response.arrayBuffer();
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
      });
      const { createHash } = await import('node:crypto');
      const { readFile } = await import('node:fs/promises');
      assert.equal(cachedIcon, createHash('sha256').update(await readFile(resolve(revamp, 'icons/icon-192.png'))).digest('hex'));
    }
    await page.reload();
    if (serviceWorkers === 'allow') {
      // The existing build-id handler reloads once when the new ?v= worker
      // takes control. Wait for that transition before reading the document.
      await page.waitForFunction(() => {
        const build = sessionStorage.getItem('tfa-sw-build');
        const expected = new URL(`/sw.js?v=${encodeURIComponent(build)}`, location.href).href;
        return !!build && navigator.serviceWorker.controller?.scriptURL === expected
          && document.documentElement.classList.contains('js-reader-mounted');
      }, null, { timeout: 15_000 });
      await page.waitForLoadState('networkidle');
    }
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1);
    assert.ok(await page.evaluate(() => [...document.fonts].some(font => font.family === 'Newsreader')));
    const after = await snapshot();
    assert.deepEqual(after, before);
    await page.screenshot({ path: `${output}/after-${serviceWorkers}-${viewport.width}.png` });
    await page.goto(`${origin}/?view=library&tab=highlights`);
    await expect(page.getByRole('region', { name: 'Saved angles' })).toBeVisible();
    const highlightedIndex = JSON.parse(before['tfa:v1:reactions'])['1976'][0];
    await page.goto(`${origin}/issue/1976#card-${highlightedIndex + 1}`);
    await expect(page.getByRole('button', { name: 'Remove highlight from this insight', exact: true })).toHaveCount(1);
    if (serviceWorkers === 'allow') {
      await context.setOffline(true);
      const offline = await page.goto(`${origin}/fora-offline-upgrade-check`);
      assert.ok(offline?.ok(), 'New worker serves the offline page after cut-over');
      await context.setOffline(false);
    }
    results.push({ viewport, serviceWorkers, originUnchanged: true, before, after, previousCaches, status: 'passed' });
    await context.close();
  }
  }
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log('PASS: four unchanged-root → revamp scenarios; progress, position and highlights retained at 360×640 and 1440×900 with service workers blocked and active. Active-worker cases also replace cached icons and retain offline navigation.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
