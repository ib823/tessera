import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

// Exercise the longest published real card, not the short placeholders in 10b.
const issuesDir = new URL('../../../src/data/issues/', import.meta.url);
const issues = readdirSync(issuesDir).filter(name => name.endsWith('.json')).map(name =>
  JSON.parse(readFileSync(new URL(name, issuesDir), 'utf8')),
).filter(issue => issue.published && !issue.retired);
const longest = issues.flatMap(issue => issue.cards.map((card: { big: string; sub: string }, index: number) =>
  ({ issue, card, index, length: card.big.length + (card.sub?.length ?? 0) }),
)).sort((a, b) => b.length - a.length)[0];

test.use({ serviceWorkers: 'block' });

for (const width of [320, 360]) {
  for (const percent of [100, 200]) {
    test(`FORA longest card reflows at ${width}px and ${percent}% text`, async ({ page }) => {
      await page.setViewportSize({ width, height: 640 });
      await page.goto(`/issue/${longest.issue.id}#card-${longest.index + 1}`);
      const dialog = page.getByRole('dialog', { name: /^Reading:/ });
      await expect(dialog.getByRole('group', { name: `Card ${longest.index + 1} of ${longest.issue.cards.length}` })).toBeVisible();
      await page.addStyleTag({ content: `html { font-size: ${percent}% !important; }` });
      const region = dialog.getByRole('region', { name: 'Issue reading area' });
      expect(await region.evaluate(el => el.clientHeight)).toBeGreaterThan(300);
      expect(await dialog.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
      const body = dialog.locator('[data-reader-body]');
      await expect(body).toHaveText(longest.card.sub);
      expect(await body.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(18 * percent / 100);
      await region.focus();
      await page.keyboard.press('End');
      await body.scrollIntoViewIfNeeded();
      await expect(body).toBeInViewport();
      await expect(dialog.getByRole('button', { name: /Next card|Finish reading/ })).toBeInViewport();
      await expect(dialog.getByRole('button', { name: 'Highlight this insight' })).toBeInViewport();
      const undersized = await dialog.getByRole('button').evaluateAll(buttons => buttons
        .filter(button => button.getClientRects().length > 0)
        .filter(button => button.getBoundingClientRect().height < 44 || button.getBoundingClientRect().width < 44)
        .map(button => button.getAttribute('aria-label') ?? button.textContent));
      expect(undersized).toEqual([]);
    });
  }
}

test('FORA reader keeps highlights and makes sources and change history reachable', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/issue/1976#card-2');
  const dialog = page.getByRole('dialog', { name: /^Reading:/ });
  await dialog.getByRole('button', { name: 'Highlight this insight' }).click();
  await expect(dialog.getByRole('button', { name: 'Remove highlight from this insight' })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(dialog.getByRole('button', { name: 'Remove highlight from this insight' })).toHaveAttribute('aria-pressed', 'true');
  const details = dialog.getByRole('button', { name: 'Issue details, sources and changes' });
  await details.click();
  await expect(details).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog.locator('#reader-issue-details')).toContainText('What changed');
  await expect(dialog.locator('#reader-issue-details')).toContainText('Sources');
});
