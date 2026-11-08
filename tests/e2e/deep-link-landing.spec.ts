import { test, expect, type Page } from '@playwright/test';

/**
 * Shared-link landing: an issue URL opened cold (WhatsApp, X, a search
 * result) must land straight on that issue's reader. The static article
 * hands off to the interactive reader in one frame: no homepage
 * "Coming soon" state in between, no reader sliding over the page, and
 * cumulative layout shift within the Core Web Vitals "good" bar (<= 0.1).
 *
 * Regression guard for the old client:idle hydration path, which painted an
 * empty-feed homepage under the article, jumped it to the top (CLS ~1.0),
 * then fetched the feed and the issue before opening the reader.
 */

const SETTLE_MS = 2_500;
const CLS_BUDGET = 0.1;

interface FeedEntry {
  id: string;
  headline: string;
}

interface LayoutShiftSample {
  value: number;
  startTime: number;
}

/** The newest issue (the one most likely to be shared) and the long-standing fixture. */
const LANDINGS = ['newest', '0146'] as const;

function installLandingProbes() {
  const w = window as unknown as { __t4aShifts: LayoutShiftSample[]; __t4aComingSoon: boolean };
  w.__t4aShifts = [];
  w.__t4aComingSoon = false;
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) w.__t4aShifts.push({ value: entry.value, startTime: entry.startTime });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {
    // layout-shift is Chromium-only; the CLS test skips other engines.
  }
  // Rendered text only (innerText skips display:none), sampled every frame.
  const sample = () => {
    if (document.body && /coming soon/i.test(document.body.innerText || '')) w.__t4aComingSoon = true;
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
}

/** CLS as Chrome reports it: the largest session window (1 s gap, 5 s cap). */
function sessionWindowCls(shifts: LayoutShiftSample[]): number {
  let max = 0;
  let current = 0;
  let windowStart = -1;
  let previous = -1;
  for (const shift of shifts) {
    if (windowStart < 0 || shift.startTime - previous > 1000 || shift.startTime - windowStart > 5000) {
      current = 0;
      windowStart = shift.startTime;
    }
    current += shift.value;
    previous = shift.startTime;
    max = Math.max(max, current);
  }
  return max;
}

async function resolveIssue(page: Page, baseURL: string | undefined, which: (typeof LANDINGS)[number]): Promise<FeedEntry> {
  const response = await page.request.get(`${baseURL}/issues-feed.json`);
  expect(response.ok()).toBeTruthy();
  const feed = (await response.json()) as FeedEntry[];
  const issue = which === 'newest' ? feed[0] : feed.find((entry) => entry.id === which);
  expect(issue, `issue ${which} missing from the feed`).toBeTruthy();
  return issue as FeedEntry;
}

async function coldLoad(page: Page, id: string) {
  await page.addInitScript(installLandingProbes);
  await page.goto(`/issue/${id}`);
  await expect(page.locator('html.js-reader-mounted')).toHaveCount(1, { timeout: 10_000 });
  await page.waitForTimeout(SETTLE_MS);
  return page.evaluate(() => {
    const w = window as unknown as { __t4aShifts: LayoutShiftSample[]; __t4aComingSoon: boolean };
    return { shifts: w.__t4aShifts, comingSoon: w.__t4aComingSoon, path: location.pathname };
  });
}

// Each test gets a fresh browser context, so every load is cold: no cached
// feed, no saved reading position, and no service worker until sw.js
// registers after load, as on a real first visit.

test.describe('Shared-link landing on /issue/[id]', () => {
  for (const which of LANDINGS) {
    test(`${which}: cold load lands on the issue reader without a homepage flash`, async ({ page, baseURL }) => {
      const issue = await resolveIssue(page, baseURL, which);
      const result = await coldLoad(page, issue.id);
      expect(result.comingSoon, `"Coming soon" rendered while landing on /issue/${issue.id}`).toBe(false);
      expect(result.path).toBe(`/issue/${issue.id}`);
      // The static article is hidden; the visible <h1> is the interactive reader's.
      await expect(page.getByRole('heading', { level: 1, name: issue.headline, exact: true })).toBeVisible();
    });

    test(`${which}: cold load keeps cumulative layout shift within budget`, async ({ page, baseURL, browserName }) => {
      test.skip(browserName !== 'chromium', 'The Layout Instability API is Chromium-only.');
      const issue = await resolveIssue(page, baseURL, which);
      const result = await coldLoad(page, issue.id);
      const cls = sessionWindowCls(result.shifts);
      expect(cls, `CLS ${cls.toFixed(3)} on /issue/${issue.id}: ${JSON.stringify(result.shifts)}`).toBeLessThanOrEqual(CLS_BUDGET);
    });
  }
});
