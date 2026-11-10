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
Chromium responsive matrix and the 150,000-byte first-load JavaScript check.
Signing and deployment use existing repository secrets; they must not be
copied into source or this cloud workspace. The signature check is mandatory.

- A push to `codex/t4a-revamp` can deploy only the `codex-t4a-revamp` Pages
  preview after those gates pass. Worker deployment and KV writes are excluded.
- A push to `main` deploys the same build path to production and retains the
  existing notify/social worker deployment and KV updates. The social index
  and private radar summary are read from the generated app's build outputs.
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

## Current environment limitation

Git fetch works, but GitHub API and Pages/worker requests are denied by the
current cloud network policy. A saved environment draft preserves the existing
domains and adds `api.github.com`, `thefourthangle.pages.dev`,
`*.thefourthangle.pages.dev`, `tfa-notify.4thangle.workers.dev` and
`tfa-sync.4thangle.workers.dev`. Review/save the draft in environment settings,
then publish the environment configuration. The existing browser download
domain additions remain in the draft. Saving a draft alone does not apply it.

After settings are applied, recheck API and hosted access with fresh requests.
No new GitHub token or local signing key has been requested. Missing local
Cloudflare credentials can be avoided by the existing secret-backed Actions
pipeline; availability and permissions of those secrets still need a real run.
