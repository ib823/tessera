import { test, expect, surfaces, open, reflow, capture } from './matrix';

for (const [name, path] of surfaces) {
  test(`${name}: layout and screenshot`, async ({ page }, info) => {
    await open(page, path);
    await reflow(page);
    if (name === 'reader' && await page.getByRole('dialog', { name: /^Reading:/ }).count()) {
      const dialog = page.getByRole('dialog', { name: /^Reading:/ });
      await expect(dialog.getByRole('button', { name: 'Next card', exact: true })).toBeInViewport();
      await expect(dialog.getByRole('button', { name: 'Highlight this insight', exact: true })).toBeInViewport();
      const body = dialog.locator('[data-reader-body]');
      expect(await body.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(18);
    }
    await capture(page, info);
  });

}
