import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Trust and policy pages: the privacy notice in English (/privacy) and Malay
 * (/privasi), the corrections policy, the contact page and the accessibility
 * statement. Each must load, carry one H1, link to the others, and pass axe
 * with no serious or critical violations. The existing utility pages must
 * link to all of them, and the sitemap must list them.
 *
 * Selectors are hrefs, roles and repo-owned data-* attributes, which
 * scripts/stealth.mjs keeps.
 */

const POLICY_PAGES = ['/privacy', '/privasi', '/corrections', '/contact', '/accessibility'] as const;

test.use({ serviceWorkers: 'block' });

for (const path of POLICY_PAGES) {
  test.describe(path, () => {
    test('returns 200', async ({ request, baseURL }) => {
      const response = await request.get(`${baseURL}${path}`);
      expect(response.status()).toBe(200);
    });

    test('has exactly one H1 and links to the other policy pages', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      for (const other of POLICY_PAGES) {
        if (other === path) continue;
        await expect(page.locator(`a[href="${other}"]`).first(), `${path} links to ${other}`).toBeAttached();
      }
      // The footer marks the current page.
      await expect(page.locator(`[data-site-footer] a[href="${path}"]`)).toHaveAttribute('aria-current', 'page');
    });

    test('reader text has no em dashes', async ({ page }) => {
      await page.goto(path);
      const text = await page.locator('main').innerText();
      expect(text).not.toContain('—');
    });

    for (const colorScheme of ['light', 'dark'] as const) {
      test(`has no serious or critical axe violations (${colorScheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        if (blocking.length) {
          console.error('axe violations:', JSON.stringify(blocking, null, 2));
        }
        expect(blocking).toEqual([]);
      });
    }
  });
}

test('/privacy and /privasi link to each other, and the Malay content is marked lang="ms"', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.locator('main a[href="/privasi"][hreflang="ms"]').first()).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('lang', 'en');

  await page.goto('/privasi');
  await expect(page.locator('main')).toHaveAttribute('lang', 'ms');
  await expect(page.locator('main a[href="/privacy"][hreflang="en"]').first()).toBeVisible();
  await expect(page.locator('h1')).toHaveText('Notis privasi');
});

test('/privacy explains how to delete local data and how to stop sync and notifications', async ({ page }) => {
  await page.goto('/privacy');
  const main = page.locator('main');
  await expect(main.locator('a[href="/progress"]').first()).toBeVisible();
  await expect(main).toContainText('Clear on this device');
  await expect(main).toContainText('Clear all reading data');
  await expect(main).toContainText('Unlink');
  await expect(main).toContainText('Turn off');
  await expect(main.locator('a[href="mailto:thefourthangle@proton.me"]').first()).toBeVisible();
  await expect(main.locator('a[href="https://www.cloudflare.com/privacypolicy/"]')).toHaveCount(1);
  await expect(main).toContainText('Last reviewed November 2026');
});

test('/contact states ownership and funding, and points errors to /corrections', async ({ page }) => {
  await page.goto('/contact');
  const main = page.locator('main');
  await expect(main).toContainText('FORA is independently operated.');
  await expect(main).toContainText('Self-funded by its operator. No advertising, grants or political funding.');
  await expect(main.locator('a[href="/corrections"]').first()).toBeVisible();
  await expect(main.locator('a[href="mailto:thefourthangle@proton.me"]').first()).toBeVisible();
});

for (const path of ['/about', '/disclaimer', '/progress']) {
  test(`${path} links to every policy page`, async ({ page }) => {
    await page.goto(path);
    for (const target of POLICY_PAGES) {
      await expect(page.locator(`a[href="${target}"]`).first(), `${path} links to ${target}`).toBeAttached();
    }
  });
}

test('/disclaimer points its Privacy and Data section to the full notice', async ({ page }) => {
  await page.goto('/disclaimer');
  const section = page.locator('[data-disclaimer-privacy]');
  // The summary claims no more than the notice: it points to it instead.
  await expect(section).toContainText(
    'No user accounts, no advertising or third-party analytics. What we store, where, and for how long is set out in our Privacy Notice.',
  );
  await expect(section).not.toContainText('no personally identifiable information');
  await expect(section.getByRole('link', { name: 'Privacy Notice', exact: true })).toHaveAttribute('href', '/privacy');
  await expect(section.locator('a[href="/privacy"]')).toHaveCount(1);
});

test('sitemap lists the policy pages', async ({ request, baseURL }) => {
  const response = await request.get(`${baseURL}/sitemap.xml`);
  expect(response.ok()).toBeTruthy();
  const xml = await response.text();
  for (const path of POLICY_PAGES) {
    expect(xml).toContain(`<loc>https://thefourthangle.pages.dev${path}</loc>`);
  }
});
