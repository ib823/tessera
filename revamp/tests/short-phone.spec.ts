import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 360, height: 640 }, serviceWorkers: 'block' });

for (const textSize of [100, 200]) {
  test(`short-phone reader keeps readable, reachable text at ${textSize}%`, async ({ page }) => {
    await page.route('https://tfa-sync.4thangle.workers.dev/**', (route) => route.abort());
    await page.goto('/issue/1976');
    const dialog = page.getByRole('dialog', { name: /^Reading:/ });
    await expect(dialog).toBeVisible();
    if (textSize === 200) await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    const body = dialog.locator('[data-reader-body]');
    await expect(body).toBeVisible();
    expect(await body.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(18 * textSize / 100);
    expect(await dialog.locator('[data-reader-primary]').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(24 * textSize / 100);
    expect(await dialog.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
    await body.scrollIntoViewIfNeeded();
    await expect(body).toBeInViewport();
    await dialog.getByRole('button', { name: 'Next card', exact: true }).click();
    await expect(dialog.getByRole('group', { name: /^Card 2 of/ })).toBeVisible();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('tfa:v1:read:1976') ?? '{}').progress)).toBe(2);
    expect(await body.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(18 * textSize / 100);
  });
}
