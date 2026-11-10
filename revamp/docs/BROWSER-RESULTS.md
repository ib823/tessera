# FORA Phase 1 — final browser verification

10 November 2026 (MYT). Local feature branch `codex/t4a-revamp`; no commit, push, hosted deployment or production cut-over.

**The local Chromium runs pass. Firefox/WebKit, physical devices and deployment-origin acceptance remain unverified.**

| Final check | Outcome |
| --- | --- |
| Existing Chromium phone/tablet/desktop regression projects | 434 passed; 4 intentional desktop-only skips; 0 failed |
| Additional responsive/journey matrix | 496 passed; 0 skipped; 0 failed; no retries |
| Same-origin old-app → revamp storage upgrade | 2 passed: 360×640 and 1440×900 |
| Preset screen sizes | 15, from 320×568 to 3840×2160, including landscape |
| Breakpoint sweep | 104 widths × 7 templates = 728 geometry checks inside 7 tests; 28 CSS breakpoints, through 7681 pixels |
| 200% root text | All 19 selected surfaces at phone, tablet and desktop widths |
| Main axe evidence | 42 retained reports, zero violations reported for their selected WCAG tags; 3 Angle Code form checks also passed the serious/critical threshold |
| Browser captures | 444 screenshots; home/reader/search contact sheets reviewed across all 15 presets, with individual short-phone/landscape/dialog inspection |
| Type checking | 0 errors, 0 warnings, 38 hints |
| Lint | Exit 0; 50 warnings and 10 informational findings |
| First-load JavaScript | Home 131,654 bytes gzip; issue 130,713; maximum 131,654 < 150,000 in four fresh-load contexts |
| Fonts | Unchanged at 46,276 / 61,440 bytes |
| Aggregate JS+CSS Brotli | 210,764 bytes; +3.94% against baseline; gate passed |
| Final Astro/stealth/CSP tail | Passed; this browser follow-up reused the earlier validated canonical data and image outputs |
| Build consistency | SHA-256 manifest for all 1,867 distributed files checked before/after the final runs |

The 496 matrix tests comprise 285 ordinary page layouts, 57 enlarged-text cases, 42 light/dark axe cases, 75 reader/search/storage/no-JavaScript/Alerts journeys, 30 dialog/destination cases and seven breakpoint sweeps. These are selected scenarios, not a claim to cover every possible browser state.

The original tests sometimes override project viewports or create separate contexts. Their project matrix is therefore not a Cartesian run of every assertion at every device setting. The four skips are explicit desktop-only checks:

- chromium-mobile: desktop reader lists the sources under the fact card — Desktop reader
- chromium-tablet: desktop reader lists the sources under the fact card — Desktop reader
- chromium-mobile: desktop reader shows the meta line and an open What changed block — Desktop reader only; the mobile reader is covered by the raw-HTML tests.
- chromium-mobile: feed row says "Updated since you read it" only when the read predates the change — Uses the desktop sidebar feed.

## Fixes made

The expanded tests and upgrade checks exposed and verified corrections to: the empty Saved tabpanel and misleading heading; duplicate mobile-search h1; an animation reading a null issue after Back; Angle Code keyboard focus/closing; feed shortcuts intercepting controls; Latest URL preservation; explicit destinations overridden by auto-resume; a reload resetting the saved card; and search/feed observation overwriting reading position. Storage key names and schemas are unchanged. Implementation edits from this test pass are confined to revamp overlays of App, MobileBrowser and OpinionBar.

See `BROWSER-FINDINGS.md` for the evidence distinctions and test-harness corrections. Diagnostic failures and interrupted attempts are retained separately and are excluded from final passing totals. The final expanded run and final existing-suite run each completed once against the same immutable final build; retries were disabled.

## Review and reproduce

- Open `screenshots.html` for the screenshot gallery, or `matrix-report/index.html` and `regression-verified-report/index.html` for the browser reports.
- `coverage.csv` lists each test outcome. JSON results, logs, build hashes and storage before/after values accompany them.
- The review pack includes the current `code/revamp/` source overlays and tests; it omits dependencies, credentials and generated distribution assets.
- Repository instructions: `revamp/docs/BROWSER-TESTING.md`.

## Remaining limits

- Firefox and WebKit are absent; official downloads were denied with HTTP 403. Required domains (`cdn.playwright.dev` and `playwright.download.prss.microsoft.com`) and current startup instructions were saved to the environment draft, preserving existing domains. Review/save the draft and publish the environment to activate the reusable configuration; then recheck access and run those engines. Saving the draft itself does not apply access.
- Actual iPhone/Safari, Android and tablet hardware, browser chrome zoom, OS text settings, virtual keyboards, safe areas, native sharing and assistive-technology use are not certified by this automation.
- Screenshots are captured evidence, not approved visual-diff baselines. Text-size tests enlarge the root font; they do not emulate every OS/browser zoom behavior. Main axe tests use the WCAG tags and thresholds recorded in the test instructions.
- The new matrix blocks outside services and service workers. The original suite tests local service-worker handling and mocked/blocked sync contracts. Hosted-preview push/sync, headers and cache/update behavior still need deployment-origin checks.
- The same-origin storage scenario uses the unchanged root UI and real interactions. The old-app fixture includes the canonical issue 1976 responsive art variants needed for that UI to render; it is not a visual baseline or service-worker-update test.
- Production signing and Cloudflare preview credentials remain absent. No release or cut-over approval is implied by the local passes.

The saved environment changes follow [cloud-environment-onboarding:setup](skill://plugin_connector_1p_ed5feb9070a08191b08c81c47947bc16/setup/SKILL.md): “Saving persists configuration; it does not execute scripts, apply runtime changes, or publish it.” This is why a saved network draft is not evidence of working browser downloads.
