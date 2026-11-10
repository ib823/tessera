import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { viewports } from './browser-tests/matrix';

const root = fileURLToPath(new URL('.', import.meta.url));
const engines = (process.env.FORA_BROWSERS ?? 'chromium').split(',') as ('chromium' | 'firefox' | 'webkit')[];
if (engines.some(name => !['chromium', 'firefox', 'webkit'].includes(name))) throw new Error('Unknown FORA_BROWSERS engine');
const chromiumPath = process.env.FORA_CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);

export default defineConfig({
  testDir: './browser-tests',
  outputDir: './test-results/matrix',
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 2,
  reporter: [['list'], ['html', { outputFolder: './playwright-report/matrix', open: 'never' }], ['json', { outputFile: './test-results/matrix.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4325',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
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
