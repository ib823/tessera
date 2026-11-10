# Browser verification

Run against a freshly built revamp. The root application and main deployment are not changed by these commands.

```sh
# From /workspace/tessera; this also prepares the isolated app.
npm --prefix revamp run build

# Additional journeys, screen captures, accessibility and responsive checks.
npm --prefix revamp run test:matrix
npx playwright show-report revamp/playwright-report/matrix
```

The matrix starts and stops its own local static server on port 4325. It resolves clean `.html` paths before directories, so `/infographics` and `/infographics/*` both work. It returns a real 404 for an unknown path. It does not simulate Cloudflare response headers, caching, signing or worker integration.

To run the original browser suite at all seven browser/device projects, use its ordinary configuration (this is what CI runs):

```sh
cd revamp/.cache/app
npm run e2e
```

`cloud.playwright.config.ts` only points Chromium at the managed environment's `/usr/bin/chromium`; never use it for Firefox/WebKit. That suite uses port 4321. Its tests sometimes set their own viewport or create their own context, so the project count is not a full Cartesian test of every assertion at every device size. Desktop-only skips must be reported separately.

## Additional matrix

The 15 viewports are 320×568, 360×640, 375×667, 390×844, 430×932, 640×360, 844×390, 768×1024, 820×1180, 1024×768, 1280×720, 1440×900, 1920×1080, 2560×1440 and 3840×2160 CSS pixels. Phone contexts also emulate mobile/touch behavior; this is not physical-device testing.

- Nineteen page/state layouts at every size: home, Latest, search, no results, Saved, reader, topic, dossier, Graphics, About, Disclaimer, Verify, both privacy pages, Corrections, Contact, Accessibility, 404 and a withdrawn issue.
- Search/filter → issue → Back → reload; read every mobile card in both directions; highlight → share → reload → Saved; keyboard Alerts; legacy storage migration; no-JavaScript issue text and native source/change disclosures.
- Angle Code keyboard opening, focus containment, code-entry presentation, Escape and focus return, without linking to production.
- Explicit Saved/search/Latest URLs with existing progress, including preservation of the stored reading position.
- 200% root text on all nineteen surfaces at 360, 820 and 1440 pixels. This is text enlargement, not browser chrome zoom.
- Light/dark axe checks on home, search, Saved, reader, topic, dossier and privacy at those three widths, plus the open Angle Code form. Serious/critical WCAG A/AA findings fail; all findings are retained for the main axe cases.
- Widths extracted from the actual production CSS: below/at/above each breakpoint, plus a 64-pixel sweep from 320 through 2560. Seven templates are checked at every width. The assertions wait for the app's debounced resize handler before measuring the settled layout.

Each layout has a screenshot. Browser exceptions fail a case. Retries are disabled. Failure traces and screenshots are retained. The additional suite blocks outside network services and service workers to prevent test data reaching production; the original suite separately exercises service-worker behavior and mocked sync-consent contracts. Screenshot capture is evidence for review, not an automated pixel comparison against approved designs.

## Existing-reader upgrade

Build the unchanged root app in a disposable directory, then pass its distribution to:

```sh
node revamp/scripts/check-storage-upgrade.mjs BASELINE_DIST REPORT_DIR
```

The check creates progress and a highlight through the old UI, switches the server to the revamp while keeping the same origin and browser context, reloads and compares the stored values. It checks phone (360×640) and desktop (1440×900), each with service workers blocked and active, then opens Saved and the highlighted card. The active-worker cases also require the new worker's `-fora-v1` cache to replace the old cache and its cached icon bytes, and serve offline navigation after the switch. This differs from opening a new preview hostname, whose localStorage is separate.

## Other engines and deployment acceptance

The configuration supports `FORA_BROWSERS=chromium,firefox,webkit`. Chromium uses the system executable if present; other engines use their own Playwright binaries. Do not use the cloud Chromium override configuration to launch Firefox/WebKit.

```sh
npx playwright install --with-deps chromium firefox webkit
FORA_BROWSERS=chromium,firefox,webkit npm --prefix revamp run test:matrix
```

CI runs the matrix in all three engines against the same signed build it deploys. Firefox's phone configuration is viewport/touch emulation; Playwright does not implement Firefox's `isMobile` option. WebKit emulation does not replace actual Safari/iOS testing.

The original suite had only run `chromium-desktop` on main. Running all seven projects exposed three harness portability problems, fixed without changing assertions:

- The canonical config passes Chromium's `--disable-dev-shm-usage` to every project and WebKit refuses to start with it. The generated app wraps the canonical config (`revamp/scripts/workspace.mjs`) and passes the flag to Chromium projects only.
- Playwright cannot grant clipboard permissions in Firefox. The same wrapper enables Firefox's async-clipboard test preferences, and `regression-tests/reader-links.spec.ts` grants permissions only in the other engines.
- `regression-tests/card-sources.spec.ts` omits `isMobile` in Firefox, and `regression-tests/sync-link-consent.spec.ts` waits for the navigation to commit rather than for `load`, because Firefox can show the hydration-time confirmation before `load`.

## Hosted preview journeys

Set `FORA_MATRIX_ORIGIN` to an immutable deployment URL to run the same matrix against the hosted preview. No local server starts; the page fixture allows only that origin and still blocks workers, publishers and every other host. A hosted run also fails on any CSP violation logged by the browser, which the local server cannot exercise because it sends no CSP header. Production and the branch alias are refused. Hosted pages also wait for `load` (and, on `/?q=` URLs, for the Search heading) before measuring, because a deployed origin delivers the search index and fonts after hydration; local runs are unaffected. Put the deployed `revamp/dist` (the `fora-preview-dist` artifact of the deploying run) in place first: the breakpoint sweep reads its CSS from there.

```sh
FORA_MATRIX_ORIGIN=https://HEX.thefourthangle.pages.dev \
  FORA_BROWSERS=chromium,firefox,webkit npm --prefix revamp run test:matrix
```

Results go to `revamp/playwright-report/matrix-hosted/` and `revamp/test-results/matrix-hosted.json`.

`check-first-load.mjs` and `check-storage-upgrade.mjs` use `/usr/bin/chromium` when it exists. On GitHub's ubuntu-24.04 runners that is the runner's own Chromium (156 on 10 November 2026), not Playwright's; the first-load report records the version and executable. It also lists outside requests, failed loads, HTTP errors and CSP violations. A CSP violation report counts as an outside request because the policy's `report-uri` is the notify worker.

The site's CSP has no `'unsafe-hashes'`, so server-rendered markup must not contain inline event handlers. Svelte renders an `onerror`/`onload` prop, or a `use:` action, on an `<img>` as `this.__e=event` replay attributes; listen through `bind:this` and an effect instead (see the canonical `src/components/IssueImage.svelte`). `tests/e2e/issue-image.spec.ts` and `tests/e2e/offline-page.spec.ts` enforce this.

Remaining separate acceptance checks include actual iPhone/Safari and Android hardware, browser chrome zoom/OS text settings, virtual keyboards and safe areas, native sharing, screen-reader use, hosted-preview headers/caching, real opt-in push/sync, production signatures and approved cut-over. Do not infer these passes from the local matrix.
