import { test, expect } from '@playwright/test';

/**
 * One name for readers ("Names" in CLAUDE.md): FORA is the brand, short for
 * The Fourth Angle, and T4A is our signature. The source check
 * (revamp/scripts/check-brand-names.mjs) keeps old names out of the copy; this
 * checks what the built pages actually say.
 */

test.use({ serviceWorkers: 'block' });

const OLD_NAME = /Fourth Angle|4th Angle|\bT4A\b/i;

test('home footer states the name once, and the welcome card explains it', async ({ page }) => {
  await page.route('https://tfa-sync.4thangle.workers.dev/**', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1);
  await expect(page).toHaveTitle(/^FORA — /);
  await expect(page.locator('.today-footer')).toContainText('FORA is short for The Fourth Angle. T4A is our signature.');
  const welcome = page.getByRole('note', { name: 'Welcome to FORA' });
  if (await welcome.count()) await expect(welcome).toContainText('FORA, short for The Fourth Angle, is a nonpartisan');
});

test('About explains FORA, The Fourth Angle and T4A in one place', async ({ page }) => {
  await page.goto('/about');
  const section = page.locator('#our-name');
  await expect(section.getByRole('heading', { level: 2, name: 'Our Name' })).toBeVisible();
  await expect(section).toContainText('FORA is short for The Fourth Angle');
  await expect(section).toContainText('T4A is our signature');
  await expect(page.locator('[data-site-footer]')).toContainText('FORA, short for The Fourth Angle, is independently operated. T4A is our signature.');
});

test('page metadata names the site FORA', async ({ request }) => {
  for (const path of ['/', '/about', '/privacy', '/privasi', '/contact', '/corrections', '/accessibility', '/disclaimer', '/progress', '/infographics', '/topic/legal', '/does-not-exist']) {
    const response = await request.get(path);
    const html = await response.text();
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    expect(title, `${path} title`).toMatch(/\bFORA\b/);
    expect(title, `${path} title`).not.toMatch(OLD_NAME);
    for (const [attribute, name] of [['property', 'og:site_name'], ['name', 'application-name'], ['name', 'apple-mobile-web-app-title'], ['name', 'author']]) {
      const content = html.match(new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"`))?.[1];
      if (content !== undefined) expect(content, `${path} ${name}`).toBe('FORA');
    }
  }
});

test('the home page tells search engines FORA is also The Fourth Angle', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const site = blocks.find((block) => block['@type'] === 'WebSite');
  expect(site).toMatchObject({ name: 'FORA', alternateName: ['The Fourth Angle'] });
});

test('the installed app and the offline page are named FORA', async ({ request }) => {
  const manifest = await (await request.get('/manifest.json')).json();
  expect(manifest.name).toBe('FORA');
  expect(manifest.short_name).toBe('FORA');
  expect(JSON.stringify(manifest)).not.toMatch(OLD_NAME);
  const offline = await (await request.get('/offline.html')).text();
  expect(offline).toContain('<title>Offline — FORA</title>');
  expect(offline).toContain('aria-label="FORA"');
  expect(offline).not.toMatch(OLD_NAME);
});
