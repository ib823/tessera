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

To run the original browser suite at its three Chromium configurations:

```sh
cd /workspace/tessera/revamp/.cache/app
node node_modules/@playwright/test/cli.js test \
  --config=cloud.playwright.config.ts --project='chromium-*' \
  --workers=2 --reporter=html --trace=retain-on-failure
```

That suite uses port 4321. Its tests sometimes set their own viewport or create their own context, so the project count is not a full Cartesian test of every assertion at every device size. Desktop-only skips must be reported separately.

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

The check creates progress and a highlight through the old UI, switches the server to the revamp while keeping the same origin and browser context, reloads and compares the stored values. It checks phone and desktop, then opens Saved and the highlighted card. This differs from opening a new preview hostname, whose localStorage is separate. Service-worker update/caching behavior is outside this isolated storage check.

## Other engines and deployment acceptance

The configuration supports `FORA_BROWSERS=chromium,firefox,webkit`. Chromium uses the system executable if present; other engines use their own Playwright binaries. Do not use the cloud Chromium override configuration to launch Firefox/WebKit.

```sh
# Only after the environment permits the official download hosts:
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright install firefox webkit
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright \
  FORA_BROWSERS=chromium,firefox,webkit npm --prefix revamp run test:matrix
```

Firefox's phone configuration is viewport/touch emulation; Playwright does not implement Firefox's `isMobile` option. WebKit emulation does not replace actual Safari/iOS testing. On this environment, the official download hosts have returned HTTP 403 “Domain forbidden”; an environment draft contains the required domain additions. Saving that draft alone does not apply them.

Remaining separate acceptance checks include actual iPhone/Safari and Android hardware, browser chrome zoom/OS text settings, virtual keyboards and safe areas, native sharing, screen-reader use, hosted-preview headers/caching, real opt-in push/sync, production signatures and approved cut-over. Do not infer these passes from the local matrix.
