import AxeBuilder from '@axe-core/playwright';
import { test, expect, open, capture } from './matrix';

test('Angle Code contains keyboard focus and closes without linking', async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem('tfa:v1:read:1976', JSON.stringify({ state:'started', progress:2 })));
  await open(page, '/?view=library');
  const trigger = page.getByRole('button', { name: 'Angle Code · sync your library', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Angle Code — cross-device sync' });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/view=library/);
  await expect.poll(() => dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await expect(dialog.getByRole('button', { name: 'Close Angle Code', exact: true })).toBeInViewport();
  for (let i=0;i<7;i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  }
  await dialog.getByRole('button', { name: 'I have a code', exact: true }).click();
  await dialog.getByPlaceholder('Enter code').fill('ABC');
  await dialog.getByPlaceholder('Enter code').scrollIntoViewIfNeeded();
  await expect(dialog.getByPlaceholder('Enter code')).toBeInViewport();
  await capture(page, info, 'angle-code');
  if ([360,820,1440].includes(page.viewportSize()!.width)) {
    const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    expect(axe.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem('tfa:v1:angle-code'))).toBeNull();
});

test('explicit Saved, search and Latest URLs retain destination with saved progress', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tfa:v1:pos', JSON.stringify({ feedIssueId:'1976', cardIndex:2, ts:Date.now() }));
    localStorage.setItem('tfa:v1:read:1976', JSON.stringify({ state:'started', progress:3 }));
    localStorage.setItem('tfa:v1:reactions', JSON.stringify({ '1976':[2] }));
  });
  for (const path of ['/?view=library&tab=highlights', '/?q=malaysia', '/?feed=latest']) {
    await open(page, path);
    if (path.includes('highlights')) await expect(page.getByRole('region', { name:'Saved angles' })).toBeVisible();
    if (path.includes('q=')) {
      await expect(page.locator('[data-search-filters]')).toBeVisible();
      await page.locator('main a[href^="/issue/"]:visible').first().scrollIntoViewIfNeeded();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    }
    if (path.includes('feed=')) await expect(page.locator('[data-latest-list]')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+'$'));
    await expect(page.getByRole('dialog', { name:/^Reading:/ })).toHaveCount(0);
    expect(JSON.parse((await page.evaluate(() => localStorage.getItem('tfa:v1:pos')))!)).toMatchObject({feedIssueId:'1976',cardIndex:2});
  }
});
