import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

/**
 * The service worker serves /offline.html when a navigation fails offline.
 * Its Try again button must work under the site's real CSP, which has no
 * 'unsafe-hashes', so an inline onclick attribute is blocked. Cloudflare
 * applies dist/_headers; the local test server does not, so this test serves
 * the page with that policy. It keeps script-src exactly and drops only
 * upgrade-insecure-requests (the test origin is plain http) and report-uri
 * (no request may leave the test).
 */

test.use({ serviceWorkers: 'block' });

function siteCsp() {
  const headers = readFileSync(new URL('../../dist/_headers', import.meta.url), 'utf8');
  const policy = headers.match(/^\s*Content-Security-Policy:\s*(.+)$/m)?.[1] ?? '';
  expect(policy, 'dist/_headers defines a CSP with script hashes').toMatch(/script-src 'self' 'sha256-/);
  return policy
    .split(';')
    .map((directive) => directive.trim())
    .filter((directive) => directive && !/^(upgrade-insecure-requests|report-uri)\b/.test(directive))
    .join('; ');
}

test('offline page ships no inline event handler attributes', async ({ request }) => {
  const html = await (await request.get('/offline.html')).text();
  expect(html.match(/<[a-z][^>]*\son[a-z]+=["'][^>]*>/gi) ?? []).toEqual([]);
});

test('offline page Try again reloads under the site CSP', async ({ page }) => {
  const csp = siteCsp();
  const violations: string[] = [];
  page.on('console', (message) => {
    const text = message.text();
    if (/content[- ]security[- ]policy/i.test(text) && /refused|blocked/i.test(text)) violations.push(text);
  });
  await page.route('**/offline.html', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': csp } });
  });

  await page.goto('/offline.html');
  const retry = page.getByRole('button', { name: 'Try again' });
  await expect(retry).toBeVisible();
  await page.evaluate(() => { (window as Window & { beforeRetry?: boolean }).beforeRetry = true; });

  const reloaded = page.waitForEvent('load');
  await retry.click();
  await reloaded;

  expect(await page.evaluate(() => (window as Window & { beforeRetry?: boolean }).beforeRetry)).toBeUndefined();
  expect(violations).toEqual([]);
});
