# Cut-over preparation checks — 10 November 2026

> Later: the signed CI run, Firefox/WebKit results and the hosted preview checks are recorded in [PREVIEW-RESULTS.md](PREVIEW-RESULTS.md). The record below is the earlier local checkpoint.

The user authorized Phase 1 production cut-over. The release preparation is on
`codex/t4a-revamp`; it is not evidence that main has been merged or deployed.
See [DEPLOYMENT.md](DEPLOYMENT.md) for the gated workflow and rollback procedure.

| Check | Local result |
| --- | --- |
| Fresh full revamp build | Passed, including content/language/storage/font validation, image generation, stealth and CSP processing |
| Images | 90 issue OG images and 592 social cards; zero render errors |
| Type checking | 0 errors, 0 warnings, 38 hints |
| Lint | Exit 0; 50 warnings and 10 informational findings |
| Unit tests | 181 passed |
| Targeted Chromium regression | 21 passed across the existing phone/tablet/desktop projects: service worker, preferences, blocked storage, short-phone 100%/200% text |
| Old UI → new UI on one origin | Four scenarios passed: 360×640 and 1440×900, each with service workers blocked and active. Progress, position and highlights preserved. Active-worker scenarios also verify the new cached icon bytes and offline navigation |
| First-load JavaScript | Home 131,655 bytes gzip; issue 1976 130,714 bytes gzip on fresh phone and desktop contexts; all below 150,000 |
| Initial requests | No external-origin requests, cookies or uncaught page errors in those four fresh contexts |
| Aggregate JS+CSS Brotli | 210,762 bytes; +7,981 / +3.94% against the existing baseline; budget passed |
| Font licence boundary | Four checks passed: exact notice accepted, changed notice/wrong path/prohibited content rejected |
| Workflow validation | Official checksum-verified actionlint 1.7.7 passed; shellcheck integration not run |
| Hosted checker fixtures | Valid local artifacts accepted; missing CSP, stale search data and disallowed worker CORS each rejected. These are fixture checks, not hosted verification |
| Published signatures | Failed locally: 0/90 signed entries, with no production signing key configured. CI must sign and verify successfully; this gate is not bypassed |

The original expanded matrix and regression evidence is retained in
[BROWSER-RESULTS.md](BROWSER-RESULTS.md). This follow-up changes the generated
service-worker cache version and release tooling, and reruns the affected
browser scenarios. It does not claim a second complete 496/434-check run.

The first active-worker upgrade test hit an evaluation/navigation race because
the existing build-id handler reloads after a new worker takes control. The
harness now waits for the matching active worker and completed navigation;
application reload behavior and storage assertions were not relaxed. The final
four-scenario run passed without retries.

The new icon PNGs are tracked despite the repository's general image ignore
rule. The generated service worker differs from the canonical one only in its
cache name (`-fora-v1` suffix). Canonical editorial inputs and worker code are
unchanged. The feature branch includes the current main's radar updates through
`23eb443f`; no editorial or production rollback was performed.

Still to establish remotely: the actual signed CI outcome, Firefox/WebKit
results, successful preview deployment, hosted headers/content/worker checks,
and the production deployment after merge. Physical-device and actual push
delivery checks are not covered by the local passes. The read-only hosted
checker does not create or change an Angle Code.

Local logs and eight upgrade screenshots are retained under
`/workspace/fora-release-review/` in this environment. The environment network
draft needs review/save and publication before GitHub API and hosted-site
access can be rechecked. A saved draft alone does not change runtime access.
