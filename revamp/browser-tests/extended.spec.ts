import AxeBuilder from '@axe-core/playwright';
import { test, expect, surfaces, open, reflow, capture } from './matrix';

for (const [name, path] of surfaces) {
  test(`${name}: 200% text`, async ({ page }, info) => {
    await open(page, path);
    await page.addStyleTag({ content: 'html { font-size:200% !important; }' });
    await reflow(page);
    if (name === 'reader' && await page.getByRole('dialog', { name: /^Reading:/ }).count()) {
      const region = page.getByRole('region', { name: 'Issue reading area' });
      expect(await region.evaluate(el => el.clientHeight)).toBeGreaterThan(100);
      await page.locator('[data-reader-body]').scrollIntoViewIfNeeded();
      await expect(page.locator('[data-reader-body]')).toBeInViewport();
      await expect(page.getByRole('button', { name: 'Next card', exact: true })).toBeInViewport();
    }
    await capture(page, info, 'double-text');
  });
}

for (const scheme of ['light', 'dark'] as const) {
  for (const [name, path] of surfaces.filter(([name]) => ['home','search','saved','reader','topic','dossier','privacy'].includes(name))) {
    test(`${name}: ${scheme} accessibility`, async ({ page }, info) => {
      await page.emulateMedia({ colorScheme: scheme });
      await open(page, path);
      await reflow(page);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      await info.attach('axe', { body: JSON.stringify(result.violations, null, 2), contentType: 'application/json' });
      expect(result.violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
      await capture(page, info, scheme);
    });
  }
}
