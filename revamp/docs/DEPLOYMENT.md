# FORA Phase 1 cut-over

The user authorized replacing the live UI on 10 November 2026. This supersedes
the approval-pending statements in the earlier implementation report. It does
not replace the release checks. Phase 2 remains out of scope.

## Deployment path

`.github/workflows/deploy.yml` assembles the app in `revamp/.cache/app` from the
current checkout plus the overlays under `revamp/`. Editorial content, source
records, review stages, workers and the shared loader stay canonical. The root
UI source is retained; normal root development commands still show that UI.
Use the commands in `revamp/README.md` for FORA development.

The workflow runs type checking, lint, unit tests, the font licence boundary
checks, the complete original build chain, signature verification, font and
bundle budgets, all seven existing browser/device projects, the additional
responsive matrix in Chromium, Firefox and WebKit, and the 150,000-byte
first-load JavaScript check.
Signing and deployment use existing repository secrets; they must not be
copied into source or this cloud workspace. The signature check is mandatory.

- A push to `codex/t4a-revamp` can deploy only the `codex-t4a-revamp` Pages
  preview after those gates pass. Worker deployment and KV writes are excluded.
  The run records the deployment URL and ID, and retains the deployed public
  output as the `fora-preview-dist` artifact for independent hosted checks.
  A `workflow_dispatch` run on the branch runs the gates but does not deploy.
- A push to `main` deploys the same build path to production and retains the
  existing notify/social worker deployment and social-index KV update. The
  social index is read from the generated app's build outputs. Radar's private
  summary is synced separately by `radar-sync.yml` after a successful scan or
  site deployment, using the latest committed scan. That single writer checks
  freshness, expires the value four hours after the scan, and verifies readback.
- Pull requests run the gates but do not deploy. An Actions run or preview is
  not claimed successful until its actual outcome and URL have been checked.

Hosted verification checks exact HTML and public artifact bytes against the
built output, real CSP/HSTS/cache headers, withdrawn and utility routes, 404
behavior, and read-only health/CORS requests to both workers. It does not send
push alerts or create/update an Angle Code. The checks use the immutable,
hexadecimal Pages deployment URL: the existing workers allow that origin but
do not allow the named branch alias. No worker CORS policy is broadened.

The cache name in the generated service worker gains `-fora-v1`. This refreshes
previously precached icons at their unchanged URLs. The canonical worker stays
unchanged; its other behavior is reused. Reading state keeps the existing
localStorage keys and production origin. The upgrade check covers both blocked
and active service workers, cached icon replacement and offline navigation:

```sh
node revamp/scripts/check-storage-upgrade.mjs /path/to/old-app/dist
node revamp/scripts/check-first-load.mjs --local
node revamp/scripts/check-hosted.mjs https://HEX.thefourthangle.pages.dev
```

## Release order

1. Push the feature branch. Check the exact head's Actions run, signed build,
   browser results and hosted preview checks. Review the preview visually.
2. Incorporate any new `main` changes and rerun affected checks. Merge only
   when the release checks pass; do not bypass a failing gate.
3. Monitor the main deployment. Confirm the live origin serves the new build,
   including its headers, route contracts, signatures and worker access.
4. Record the old and new Cloudflare deployment IDs and commit SHAs. No live
   cut-over is complete merely because a push or deployment command returned.

## Cut-over record — 10 November 2026

The user authorized replacing the production UI with FORA in full. Order:

1. [#97](https://github.com/ib823/tessera/pull/97) (`e2e17a2`) fixed the
   canonical spring, `IssueImage` and offline-page defects on `main`. Run
   [42791159938](https://github.com/ib823/tessera/actions/runs/42791159938)
   deployed it with the old UI: production deployment `59c851b9`.
2. `codex/t4a-revamp` merged that `main`; the FORA overlays of the same files
   were removed so the canonical fixes apply.
3. [#96](https://github.com/ib823/tessera/pull/96) merges FORA into `main`. The
   `main` run builds, tests and deploys `revamp/dist` to production, then
   verifies the live origin.

Rollback targets, newest first: `59c851b9` (old UI with the #97 fixes) and
`bb6b4be7` (old UI at `1300e8a`). Roll back in Cloudflare Pages first, then
revert the #96 merge commit on `main` so the next push cannot redeploy it.

## Rollback

If a production regression appears, restore the last successful production
deployment using Cloudflare Pages' rollback control. This requires actual
Cloudflare access; the earlier deployment ID must be recorded, not guessed.
Then revert the cut-over and implementation commits on current `main` so the
next push cannot redeploy the faulty release. Revert commits rather than
resetting shared history, and preserve any intervening editorial/bot changes.
The original implementation is commit `0c1575a4`; identify the later cut-over
commit by its recorded SHA. Reverting both restores the old workflow and avoids
the root type checker scanning the retained overlay tree. Storage keys and
worker state are unchanged, so rollback does not require resetting readers.

## Environment access

An earlier cloud session could push Git but its network policy denied the
GitHub API, Pages and worker hosts, so it could not confirm the Actions outcome
or a hosted preview. That limit belonged to that environment. A session that
can reach `api.github.com`, `*.thefourthangle.pages.dev` and both worker hosts
can verify the run and the preview directly. No local signing key or
Cloudflare token is needed: signing and deployment use the existing repository
secrets in the Actions run.
