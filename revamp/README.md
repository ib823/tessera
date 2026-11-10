# T4A revamp

Phase 1 implementation of the supplied FORA v2.1 manifest on `codex/t4a-revamp`. Includes responsive discovery, search, Saved, reader, sharing, alerts, utility pages and the measured Newsreader font choice. See [implementation and release limits](docs/IMPLEMENTATION.md), [board coverage](docs/PHASE1-COVERAGE.md) and [browser test instructions](docs/BROWSER-TESTING.md). The user has authorized production cut-over; follow the [deployment checks and rollback procedure](docs/DEPLOYMENT.md) before release.

## Isolation

Author replacements under `revamp/src/` using the same relative paths as `src/`. Assets live under `revamp/public/`; isolated build-script overrides live under `revamp/build-scripts/`. The generated workspace replaces its font directory before applying those assets. Regression expectations changed by the approved design live under `revamp/regression-tests/`; new tests live under `revamp/tests/`. The development runner creates `revamp/.cache/app/` from the current checkout, overlays the replacements, and shares the root's locked dependencies. It copies canonical content for build input; it never creates an alternate editorial source. Changes under `revamp/src/` refresh the running development server. Restart after changing shared source outside that directory.

The root package scripts, Astro configuration, canonical content, workers, and current application source remain untouched. The cut-over workflow builds and deploys the overlaid application. Normal root builds still do not load the revamp. All generated work stays inside the ignored `revamp/.cache/` and `revamp/dist/` paths. Never edit the generated copy.

```sh
# Install once from the repository root.
npm ci

# Independent revamp server, port 4323.
npm --prefix revamp run dev

# Complete original build gates against the overlaid application.
npm --prefix revamp run build

# Built application and the existing Chromium suite.
npm --prefix revamp run preview
npm --prefix revamp test -- --reporter=list
```

Stop the preview server before running tests if using its port. The current local test configuration uses the managed environment's Chromium executable; the suite's own static server uses port 4321. CI uses Playwright's installed browser engines. The `deploy:preview` command targets only the fixed `codex-t4a-revamp` Pages branch. It needs local Cloudflare credentials; the feature-branch workflow instead uses existing repository secrets. Hosted deployment status is recorded separately from local tests.

## Compatibility contract

| Surface | Canonical implementation or input | Required outcome |
| --- | --- | --- |
| Editorial content | `src/data/issues/`, `src/data/sources/`, `engine/`, `scripts/lib/load-issues.mjs` | Preserve content, edition, dates, sources and review history. Follow `CLAUDE.md`. |
| Issue URLs | `src/pages/issue/[id].astro`, `src/lib/card-anchor.ts` | Preserve `/issue/{id}` and `#card-N`; retain corrected withdrawn pages and `noindex`. |
| Topic and dossier pages | `src/pages/topic/`, `src/pages/dossier/` | Preserve existing paths and complete readable content. |
| Utility pages | `/about`, `/disclaimer`, `/verify`, `/privacy`, `/privasi`, `/corrections`, `/contact`, `/accessibility`, plus `/progress` | Preserve paths, truthful policies, accessibility and verification. |
| Feeds and discovery | `build-issues-json`, `build-search-index`, `build-sitemap`, RSS route | Preserve `/issues-feed.json`, `/issues/{id}.json`, search index, RSS and sitemap. |
| Images and social service | `generate-og-images`, `build-social-cards`, `workers/social` | Preserve dated preview images, social images and `/social-card-index.json`. |
| Progress, library and highlights | `src/lib/reading-state.ts`, `src/stores/reader.ts` | Reuse `tfa:v1:*` state and the legacy migration; no reset or incompatible format. |
| Angle Code and push | `src/lib/sync.ts`, `workers/sync`, `workers/notify` | Preserve opt-in behavior and current API contracts; no worker deployment from UI previews. |
| Static reading | Issue page, `IssueSources`, `IssueChanges`, `CardSources` | Full issue, per-card source references, sources and change log without JavaScript. |
| Metadata and accessibility | `src/lib/seo.ts`, issue JSON-LD, print and preference styles | Accurate NewsArticle dates/authorship, keyboard operation, print, reduced motion, forced colours and 200% text. |
| Gates | Original build chain and Playwright suite | Validation, language warnings, font budget, signing/verifier, stealth, CSP, bundle budget and existing tests remain active. |
| Network/privacy | Existing privacy notices and opt-in worker requests | No new third-party requests, analytics or advertising. |

A preview origin has its own browser storage. It cannot directly read storage from the production origin. The cut-over must preserve the production origin and key schema; compatibility tests should seed existing state in the preview and verify it survives. Do not claim that production state automatically appears on a different preview domain.

## Current contract and implementation

- [v2.1 assessment](docs/V2.1-ASSESSMENT.md): Phase 1 may start; Phase 2 remains blocked.
- [Phase manifest](docs/PHASE_MANIFEST.csv): board scope and required omissions.
- [Implementation and evidence](docs/IMPLEMENTATION.md): current changes, tests, and remaining work.
- [Owner acceptance map](docs/REQUIREMENTS_TO_ACCEPTANCE.csv): planned release checks, not proof they already pass.
- [Hosted preview verification](docs/PREVIEW-RESULTS.md): the signed CI run, Firefox/WebKit results and hosted checks.

Starting commit: `1300e8a7e578fc9a612b65e41a70d6515a8319d0`.

Typography follows D06 option 1 under the user's instruction to proceed as recommended: Newsreader 400 + 700 Latin WOFF2 (46,276 / 61,440 bytes) and system sans. [Font measurements and hashes](docs/FONT-DECISION.json) include the variable and system alternatives. Browser exports, OG date labels and social cards use these actual files. The unmodified OFL notice remains available at `/fonts/Newsreader-LICENSE.txt`; a hash-pinned stealth exception permits only its upstream `github` copyright URLs. All other terms and edited licence files still fail the gate. Test that boundary with `npm --prefix revamp run check:license-gate`.

The reader removes text shrinking, reduces fixed chrome, provides a scrollable reading region, and keeps Highlight and Back/Next fixed. The 10b canvas uses placeholder text and `overflow:hidden`; the implementation follows the engineering requirement for scrollable, full canonical card text.

Run the additional first-load check against the built preview:

```sh
node revamp/scripts/check-first-load.mjs http://127.0.0.1:4323
```

Stop the dev server before preparing/rebuilding its generated workspace. The dev toolbar is disabled in newly prepared workspaces so it cannot cover bottom navigation. Test the built output for acceptance.

All content and policy copy remains canonical. Source URLs and missing or disputed art require editorial verification; the redesign does not invent replacements. No memberships, paywalls, account collection, cookies, analytics, bylines, newsletters, following or story hubs are introduced in this increment.

A hosted preview can be deployed once credentials are configured:

```sh
npm --prefix revamp run deploy:preview
```

The command requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and never selects `main`. Keep signing credentials in the existing secret-backed build environment; do not commit them. An unsigned local preview does not pass the release signature gate.
