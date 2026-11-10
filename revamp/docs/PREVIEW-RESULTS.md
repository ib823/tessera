# FORA Phase 1 hosted preview — verification, 10 November 2026

Preview only. `main`, the production origin, both workers and their KV data
were not changed. This record supersedes the "still to establish remotely"
items in [RELEASE-CHECKS.md](RELEASE-CHECKS.md) and the Firefox/WebKit gaps in
[BROWSER-RESULTS.md](BROWSER-RESULTS.md); those earlier records are kept as
written.

| Item | Value |
| --- | --- |
| Preview (immutable) | https://56746e84.thefourthangle.pages.dev |
| Cloudflare deployment | `56746e84-196f-4f06-bdc2-f12421dfa0c4`, environment `preview`, project `thefourthangle`, branch `codex-t4a-revamp` |
| Deployed commit | `3e073684333dee124369ed95ff7bb02f6e36ac69` |
| Actions run | [42770612453](https://github.com/ib823/tessera/actions/runs/42770612453), push, conclusion success |
| Deployed output | run artifact `fora-preview-dist`, SHA-256 `2dadb387a555b55c5b8ff511a93e2551925a5dac06d69f1d88543989b0823eb8`, 1,866 files |
| Main incorporated | through `54a898c`; later main commits are radar/social bot output only |

Use the hexadecimal URL. The branch alias also serves the latest preview, but
the workers deliberately do not allow it as a CORS origin, so Alerts and
Angle Code cannot reach them from the alias.

## Failures found and fixed

| Run / check | Evidence | Cause | Fix |
| --- | --- | --- | --- |
| [42751440310](https://github.com/ib823/tessera/actions/runs/42751440310) (`856200e`): 240 WebKit failures | `Unknown option --disable-dev-shm-usage` at launch | Canonical Playwright config passes a Chromium-only flag to every project; main had only ever run `chromium-desktop` | Generated config applies it to Chromium only |
| Same run: 10 Firefox failures | `isMobile is not supported in Firefox`; `Unknown permission: clipboard-read`; consent test timeout | Playwright API differences; Firefox opens the `?sync=` confirmation before `load` (probe: load not fired, evaluation blocked until dismissal) | Engine-aware options, Firefox async-clipboard test preferences, wait for commit |
| Local WebKit: clipboard and mouse wheel | `clipboard-write` rejected once a page exists; `readText` `NotAllowedError`; `mouse.wheel` unsupported in mobile WebKit | Engine limits | WebKit grants `clipboard-read` and reads by pasting into a blank page; Page Down in mobile WebKit |
| Local mobile WebKit: reader stuck | Trace snapshot: card at `translateX(7014718949614927872px)`, opacity 0 | Semi-implicit Euler spring unstable at the 64 ms frame cap (error × ≈ −2.4 per frame) | `revamp/src/lib/spring.ts` sub-steps long frames at ≤ 1/60 s; regression test fails on the canonical integrator |
| [42760763547](https://github.com/ib823/tessera/actions/runs/42760763547) (`1459898`): hosted first-load | Home contacted `tfa-notify…`; [42766612994](https://github.com/ib823/tessera/actions/runs/42766612994) with diagnostics: `POST …/api/csp-report`, "Executing inline event handler violates … script-src", runner Chromium 156 | Svelte server-renders `IssueImage`'s `onerror` as `onerror="this.__e=event"`; the CSP blocks it and reports it (Firefox on every home-feed load) | `revamp/src/components/IssueImage.svelte` listens through a bound element; test requires no inline handlers on app routes |
| PR run [42760824005](https://github.com/ib823/tessera/actions/runs/42760824005) | "Install Playwright browsers" ran over an hour | Runner install stall | Step timeout of 20 minutes |
| Hosted matrix, first attempt: 5 of 609 | Visible `<h1>` returned no box during `reflow()` (search, search-empty; dossier in Firefox) | Measured before the hosted page settled: `/?q=` swaps the server-rendered home heading for Search once the search index arrives (≈170–320 ms after hydration on the hosted origin, ≈4 ms locally); Newsreader arrived after `document.fonts.ready` | Hosted mode waits for `load` and the Search heading; assertions unchanged. Rerun: 216/216 on the five cases × 4 repeats, then 609/609 |

## Results

| Check | Run 42770612453 (signed, deployed build) | Local, same source (`4de7f9f`, unsigned) |
| --- | --- | --- |
| Type check | 0 errors | 0 errors, 0 warnings, 38 hints |
| Lint | exit 0, 50 warnings | exit 0, 50 warnings, 10 infos |
| Unit tests | 185 passed | 185 passed |
| Font licence boundary | 4 passed | 4 passed |
| Published signatures | passed, 90 issues | not applicable: no production key locally (0/90 signed) |
| Bundle, JS+CSS Brotli | 210,895 B, +8,114 B / +4.00 %, within budget | 210,892 B, +4.00 % |
| Fonts | 46,276 B of 61,440 B | same |
| Seven browser projects | 1,046 passed, 18 skipped, 0 failed | 1,046 passed, 18 skipped, 0 failed |
| Three-engine matrix | 1,488 passed | 1,488 passed (496 per engine), 0 skipped |
| First-load JS, gzip (limit 150,000) | home 131,770; issue 1976 130,829 | home 131,768; issue 130,828 |
| Same-origin upgrade, old UI → FORA | not run in CI | 4 passed |

Skips are the existing intentional ones: 10 desktop-only checks on phone and
tablet projects, and 8 layout-shift checks that need Chromium's Layout
Instability API. Retries stayed at 0. Viewports: the 15 matrix presets from
320×568 to 3840×2160, plus the CSS breakpoint sweeps.

The upgrade check served the unchanged root UI built from `main@54a898c` and
then the FORA build at one origin, at 360×640 and 1440×900 with service
workers blocked and active. Progress, position and highlights were identical
after the switch; the active-worker cases replaced the `tfa-static-v13` cache
with `tfa-static-v13-fora-v1`, the cached icon bytes and offline navigation.
The generated `sw.js` differs from `public/sw.js` only in that cache name.

## Hosted checks of the deployed preview

| Check | Result |
| --- | --- |
| `check-hosted.mjs` (CI and independently) | 15 HTML routes and 103 public artifacts byte-identical to the deployed output; CSP, HSTS and cache headers; real 404; both workers' health and CORS |
| `check-first-load.mjs` (CI Chromium 156 and Playwright Chromium 148) | Pass at 360×640 and 1440×900; no outside requests, cookies, CSP violations or page errors |
| Signatures | 90/90 verify against the committed `public/pubkey.pem`; live `signatures.json` identical to the artifact |
| Real browsers, 13 routes × 5 set-ups (WebKit iPhone 14, Chromium Pixel 7, Firefox, Chromium and WebKit desktop) | 65/65 HTTP 200, app routes hydrated under the live CSP, Newsreader loaded, no horizontal overflow, no outside requests, no CSP violations |
| Hosted three-engine matrix (`FORA_MATRIX_ORIGIN`), 360×640, 390×844, 820×1180, 1440×900 | 609 passed, 0 failed, no retries (203 per engine): 60 journeys, 24 dialogs, 228 surface layouts, 297 extended cases (light/dark axe, 200 % text). Only the preview origin was reachable. The other 11 presets and the breakpoint sweeps ran against the identical files locally and in CI |
| TLS | Let's Encrypt YE1, `*.thefourthangle.pages.dev`, valid to 16 Dec 2026 |
| Worker CORS | Hex preview origin allowed by both workers; branch alias refused (sync `Forbidden`, notify answers with the production origin) |

## Not verified

- Push delivery and Angle Code sync writes: only health, CORS and mocked UI
  were checked, so no subscriber or sync record was touched.
- Physical iPhone/Android, native share sheets, browser zoom, virtual
  keyboards and screen readers: emulation is not device certification.
- Observation for review: a cold `/?q=` link briefly shows the server-rendered
  "Top stories" heading before the search view replaces it (≈0.2–0.3 s from
  this test client). Not changed in this preview.
- Pre-existing in canonical code and production, not changed here: the
  canonical `src/lib/spring.ts` integrator has the slow-frame defect, and
  `offline.html`'s inline `onclick` Retry button is blocked by the CSP.
