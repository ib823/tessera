# Radar and publishing reliability release — 12 November 2026 MYT

The user authorized deployment of the five reliability fixes. No new issue
or edition was published as part of this release.

## Release commits

- `cd031aca6a158062d4ca551d1983c2b304a072a5`: latest-score ranking and evidence
  expiry, persisted volume buckets, truthful source health, complete validated
  publication bundles committed before rebase, and reconciled editorial slate.
- `14147330`: first successful production scan with the new Radar code.
- `169be3d5`: independent, serialized production Radar KV sync. The site job
  no longer overwrites fresh signals with its older checkout snapshot.

The KV follow-up contains only workflow/private-summary logic, focused tests
and deployment documentation. Its `[skip ci]` marker avoids rebuilding the
identical public site. The full signed site release at `cd031aca` retains all
required checks. The separate `workflow_run` sync performs its own tests,
freshness validation, remote write and full-value readback verification.

## Verification

Local checks passed: 291 Radar tests, 12 publishing-helper integration tests,
185 site unit tests, type checking, lint (existing warnings only), source
references for 91 published issues and 368 card links, and 10 private-summary
tests. Actionlint 1.7.7 validated the release workflows. The data-sync shell
was exercised with transient GET failure, stale readback and persistent GET
failure; retries succeeded or stopped after five attempts as intended.

Production Radar run
[43110202356](https://github.com/ib823/tessera/actions/runs/43110202356) passed.
Its scan timestamp is 11 November 22:19:28 UTC / 12 November 06:19:28 MYT:

- 499 fetched events; 644 queue entries; zero evidence timestamps older than
  the seven-day retention window. 613 current scores are below stored peaks.
- 49 persisted volume series, historical baselines, deduplication state and
  one pending bucket are committed for the next scheduled scan.
- GDELT reports failure: zero events, nine rate-limited batches and two
  invalid-response batches. RSS reports partial coverage. Reddit, Parliament
  and Court are healthy; Twitter is unavailable and Google Trends disabled.
- The strict private summary validates the actual queue and selects seven
  signals. Its timestamp remains the source scan time; KV expiry is four
  hours after that time, even if a later site release requests a resync.

Site release
[43110202369](https://github.com/ib823/tessera/actions/runs/43110202369)
completed successfully. Build, signatures, budgets, all seven browser/device
projects, the three-engine responsive matrix and first-load budgets passed.
Cloudflare Pages deployed the tested build; hosted production verification
passed for routes, signatures, headers and worker access. Both Worker deploys
and the social-index upload also passed, with no failed release steps.

The independent production KV sync
[43117763338](https://github.com/ib823/tessera/actions/runs/43117763338)
then passed its tests, fresh-scan validation, remote upload and full-value
readback at 11 November 23:10:50 UTC / 12 November 07:10:50 MYT. This replaced
the site's legacy snapshot with the verified seven-signal summary and an
expiry derived from the scan timestamp.

## Editorial state

2016–2018 are already published; 2019 remains the latest published issue.
The selected development work is 2016 edition 4, 2020 and 2021. All three
still require primary research and the normal review/publication gates.
The slate's scan notes now reference the verified production output above.

## Recovery and access

Previous successful site release:
[42932873102](https://github.com/ib823/tessera/actions/runs/42932873102), source
commit `0d42cfa1bced622999c36754ec95b6e141d31c7a`. Cloudflare deployment IDs
are not exposed by the accessible public Actions pages; none is inferred.
The workspace proxy blocks direct Pages and GitHub API access. Hosted
verification therefore relies on the CI check against the actual production
origin, rather than a direct request from this workspace.

For a regression, use Cloudflare's last successful production deployment and
revert the relevant release commit on current main, preserving later scan
and editorial commits. Radar KV is a disposable derived cache. After the first
verified sync replaces the legacy cache, its boosts expire four hours after
the source scan without removing cards, even if the next refresh is missed.
