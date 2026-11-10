import { readdirSync, readFileSync } from 'node:fs';
import { test, expect, open, reflow } from './matrix';

const assets = new URL('../dist/_a/', import.meta.url);
const breakpoints = new Set<number>();
for (const file of readdirSync(assets).filter(f => f.endsWith('.css'))) {
  const css = readFileSync(new URL(file, assets), 'utf8');
  for (const media of css.matchAll(/@media\s*([^{}]+)\{/g)) {
    for (const size of media[1].matchAll(/(?:min-|max-)?width\s*(?::|[<>=]+)\s*(\d+(?:\.\d+)?)(px|rem|em)/g)) {
      breakpoints.add(Number(size[1]) * (size[2] === 'px' ? 1 : 16));
    }
  }
}
const widths = new Set<number>();
for (let width = 320; width <= 2560; width += 64) widths.add(width);
for (const breakpoint of breakpoints) for (const delta of [-1, 0, 1]) {
  if (breakpoint + delta >= 320 && breakpoint + delta <= 7681) widths.add(breakpoint + delta);
}

for (const [name, path] of [['home','/'],['search','/?q=malaysia'],['saved','/?view=library'],['reader','/issue/1976#card-2'],['topic','/topic/legal'],['dossier','/dossier/D001'],['privacy','/privacy']]) {
  test(`${name}: CSS breakpoint boundaries and width sweep`, async ({ page }, info) => {
    test.setTimeout(120_000);
    expect(breakpoints.size, 'Media widths discovered from the actual built CSS').toBeGreaterThan(5);
    await info.attach('tested-widths', { body: JSON.stringify({ breakpoints: [...breakpoints].sort((a,b)=>a-b), widths: [...widths].sort((a,b)=>a-b) }), contentType: 'application/json' });
    await open(page, path);
    for (const width of [...widths].sort((a,b)=>a-b)) {
      await test.step(`${width} CSS pixels`, async () => {
        await page.setViewportSize({ width, height: width < 1024 ? 640 : 900 });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        // The app switches shells with a debounced resize handler. Assert the
        // settled layout; two animation frames alone precede that handler.
        await expect(async () => {
          await expect(page.locator('h1:visible')).toHaveCount(1);
          await reflow(page);
        }).toPass({ timeout: 3_000, intervals: [100, 200] });
      });
    }
  });
}
