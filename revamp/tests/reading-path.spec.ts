import { test, expect } from '@playwright/test';

/**
 * The desktop reader's reading path tracked the card in view, but it sat
 * above the headline and scrolled away with the article, so readers only
 * ever saw it on card 1. It is now pinned to the top of the reading column,
 * says "Card N of M" like the issue lists, and jumping to a card lands the
 * card below it rather than under it.
 */

test.use({ serviceWorkers: 'block' });

for (const width of [1024, 1440, 1920]) {
  test(`reading path stays in view and follows the card at ${width}px`, async ({ page }) => {
    await page.route('https://tfa-sync.4thangle.workers.dev/**', (route) => route.abort());
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/issue/0146');
    await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });

    const path = page.locator('[data-reading-path]');
    const nav = page.getByRole('navigation', { name: /Reading path/ });
    const segments = nav.getByRole('button');
    const total = await segments.count();
    expect(total).toBeGreaterThan(3);
    await expect(page.locator('[data-reading-path-position]')).toHaveText(`Card 1 of ${total}`);

    // Jump to the fourth card: the path stays on screen and moves with it.
    await segments.nth(3).click();
    await expect(segments.nth(3)).toHaveAttribute('aria-current', 'step');
    await expect(page.locator('[data-reading-path-position]')).toHaveText(`Card 4 of ${total}`);
    await expect(path).toBeInViewport();
    const pathBox = (await path.boundingBox())!;
    expect(pathBox.y, 'pinned to the top of the reading column').toBeLessThan(120);

    // The card lands below the pinned path, not under it.
    const card = page.locator('.fora-reading-step[data-step="3"]');
    await expect.poll(async () => (await card.boundingBox())!.y - (pathBox.y + pathBox.height)).toBeGreaterThanOrEqual(0);

    // Scrolling on through the article keeps it in view.
    await page.locator('.fora-reading-step[data-step="5"]').scrollIntoViewIfNeeded();
    await expect(path).toBeInViewport();
    await expect.poll(async () => Number((await page.locator('[data-reading-path-position]').textContent())!.match(/Card (\d+)/)![1])).toBeGreaterThanOrEqual(5);
  });
}
