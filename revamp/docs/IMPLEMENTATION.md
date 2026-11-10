# FORA Phase 1 implementation and review

10 November 2026 · feature branch `codex/t4a-revamp` · baseline `1300e8a7e578fc9a612b65e41a70d6515a8319d0`.

The Phase 1 layout and font work is implemented inside `revamp/`. Root application source, canonical content, workers and main deployment workflows are unchanged. No commit, push, hosted deployment or production cut-over was performed.


**Expanded browser follow-up:** [Final browser results](BROWSER-RESULTS.md) supersede the browser counts and bundle measurements below. They include additional regression fixes; the original implementation record is retained here.

## Implemented

- Responsive home with lead/secondary stories, latest rail, topic discovery and publication-week Latest view.
- Top stories / Latest / Saved navigation, a direct Latest URL, retained Graphics access, URL-backed search and responsive result lists.
- Saved/continue-reading and highlights presentation with the existing storage schema and Angle Code flow.
- Compact phone issue reader with 18px supporting text, scrolling instead of shrinking, fixed controls and full issue details; desktop/tablet typography and topic links for shared landings.
- Existing sharing/export, single push-alert preference and permission/error states, utility/policy/404 layouts, dossier styling and print treatment.
- Compass identity, icons and self-hosted Newsreader 400/700 with system sans. All OG/social text renderers use the actual shipped font files.

The manifest’s 23 Phase 1 boards, including four visual references, are mapped in `PHASE1-COVERAGE.md`. Phase 2 and owner-decision/future features remain excluded. Original owner registers are retained as snapshots rather than rewritten as implementation evidence.

## Verification

| Check | Result |
| --- | --- |
| Unit tests | 181 passed |
| Final Chromium desktop-project suite | **146 passed in one clean run**; the two affected homepage checks also passed after the final Latest-rail ordering refinement. Includes explicit phone/tablet, axe, keyboard, 200%-text, no-JS, storage, sync-consent and new revamp cases |
| Type checking | 0 errors, 0 warnings, 38 hints |
| Lint | Exit 0; 50 warnings and 10 informational findings, not warning-free |
| Content/language/storage validation | Passed; 1,212 pre-existing language warnings, no editorial rewrites |
| Font budget | **46,276 / 61,440 bytes**; Regular 22,480, Bold 23,796 |
| First-load JavaScript | Home **130,960 bytes gzip**; issue **130,019 bytes gzip**; both below 150,000 on fresh phone and desktop contexts |
| Aggregate JS+CSS Brotli | **210,064 bytes**, +7,283 / +3.59% against 202,781 baseline; gate passed |
| Initial network/cookies | No external-origin requests or cookies in the four fresh-load contexts; does not cover opt-in service integration |
| Stealth/CSP | Passed; 11 executable-inline-script hashes; 93 non-executable data blocks excluded correctly |
| Font licence exception | Four boundary checks passed: exact notice accepted; edited notice, wrong path and prohibited content rejected |
| Images | 90 issue OG images and 592 social cards regenerated without errors; OG dimensions 1200×630 and all 592 social images’ 1080×1350 dimensions verified |
| Canonical inputs | 1,060 issue files, 90 source files, 1,474 engine files, 16 worker files and shared loader byte-identical |
| Public JSON | Feed, search index and all 90 issue JSON files byte-identical to a fresh unchanged-script baseline (92 files) |
| URLs/copy | All 92 expected issue pages present, including withdrawal pages; required utility/feed routes present; seven authoritative page copies unchanged |
| Issue 1976 | Edition 4 retained |

The original build ran all validation, data, fingerprint, verifier and image stages. Its first stealth run flagged the required font licence’s upstream project URL. The exact-notice exception was added, then Astro was rebuilt from the isolated workspace and stealth, CSP and budgets passed. A UI-only build initially launched from the wrong working directory read the root’s stale feed; the canonical-link regression caught it and the corrected build passed. The supported `npm --prefix revamp run build` command sets the correct working directory itself.

Regression expectations were adapted only where v2.1 changes the UI: navigation names, omission of brief modules, home grid instead of a fixed home sidebar, Saved/Archive access, and checking visible clipped text within the scrolling reader. Existing behavioral assertions remain. Additional regressions cover fonts, canonical secondary links, a failed hero image, the three-destination dock, alerts, short-phone reflow and dossier print colours.

## Release limits

1. **Signing remains a release blocker.** The local baseline and revamp each have 0/90 valid signed entries because no signing key is configured. Content fingerprints and public-key identity match. `check-signatures` fails as expected; fingerprint generation is not signature verification. The existing secret-backed CI signing/check gate must pass before release.
2. **Hosted preview is not deployed.** This environment has neither a Cloudflare API token nor account ID configured. A non-production-only `deploy:preview` command is prepared for Pages project `thefourthangle`, branch `codex-t4a-revamp`. It was not executed against Cloudflare.
3. **Firefox/WebKit are unverified.** Browser installation was attempted; the Firefox download returned HTTP 403 “Domain forbidden” from the environment network policy, preventing completion. No cross-engine pass is claimed.
4. **Deployment-origin verification remains.** Check the actual preview’s headers, caching, push opt-in and Angle Code worker integration with the existing approved service configuration. Local tests preserve contracts and mock or block remote services where appropriate.
5. **Production cut-over requires the user’s approval.** The normal root build continues to serve the current app. No main workflow was changed.

No further Phase 1 screen or font choice is required to review this implementation. The selected font path follows the user’s delegated recommendation and retains the existing budget. This does not close the separate Phase 2 product/legal/provider decisions.

## Reproduce and review

```sh
npm --prefix revamp run build
npm --prefix revamp test -- --reporter=list
npm --prefix revamp run check:license-gate
npm --prefix revamp run preview
node revamp/scripts/check-first-load.mjs http://127.0.0.1:4323
# Once preview credentials are configured:
npm --prefix revamp run deploy:preview
```

The local built preview is on port 4323. Stop a development process before rebuilding its generated workspace. The accompanying review pack contains screenshots, final logs, compatibility results, font measurements and source overlays; it excludes credentials, caches, dependencies and generated distribution images.
