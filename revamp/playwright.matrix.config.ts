import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { viewports } from './browser-tests/matrix';

const root = fileURLToPath(new URL('.', import.meta.url));
const engines = (process.env.FORA_BROWSERS ?? 'chromium').split(',') as ('chromium' | 'firefox' | 'webkit')[];
if (engines.some(name => !['chromium', 'firefox', 'webkit'].includes(name))) throw new Error('Unknown FORA_BROWSERS engine');
const chromiumPath = process.env.FORA_CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
// Optional hosted mode: run the same journeys against an immutable Pages
// deployment, e.g. FORA_MATRIX_ORIGIN=https://<hex>.thefourthangle.pages.dev.
// The page fixture then allows only that origin, so workers, publishers and
// every other host stay blocked. Branch aliases and production are refused.
// Keep revamp/dist identical to the deployed output: boundaries.spec.ts reads
// its CSS breakpoints from there.
const hosted = process.env.FORA_MATRIX_ORIGIN ? new URL(process.env.FORA_MATRIX_ORIGIN).origin : undefined;
if (hosted && !/^https:\/\/[a-f0-9]+\.thefourthangle\.pages\.dev$/.test(hosted)) {
  throw new Error('FORA_MATRIX_ORIGIN must be an immutable https://<hex>.thefourthangle.pages.dev deployment URL');
}
const results = hosted ? 'matrix-hosted' : 'matrix';

export default defineConfig({
  testDir: './browser-tests',
  outputDir: `./test-results/${results}`,
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 2,
  reporter: [['list'], ['html', { outputFolder: `./playwright-report/${results}`, open: 'never' }], ['json', { outputFile: `./test-results/${results}.json` }]],
  use: {
    baseURL: hosted ?? 'http://127.0.0.1:4325',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: hosted ? undefined : {
    command: 'node scripts/serve-preview.mjs dist 4325',
    cwd: root,
    url: 'http://127.0.0.1:4325',
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: engines.flatMap(browserName => {
    const launchOptions = browserName === 'chromium' ? { executablePath: chromiumPath, args: ['--disable-dev-shm-usage'] } : {};
    return [
      ...viewports.map(viewport => ({
        name: `${browserName}-${viewport.width}x${viewport.height}`,
        testIgnore: [360, 820, 1440].includes(viewport.width) ? /boundaries\.spec\.ts/ : /(boundaries|extended)\.spec\.ts/,
        use: { browserName, viewport, hasTouch: viewport.width < 1024, isMobile: browserName !== 'firefox' && viewport.width < 768, deviceScaleFactor: viewport.width < 1024 ? 2 : 1, launchOptions },
      })),
      { name: `${browserName}-boundaries`, testMatch: /boundaries\.spec\.ts/, use: { browserName, viewport: { width: 1440, height: 900 }, launchOptions } },
    ];
  }),
});
