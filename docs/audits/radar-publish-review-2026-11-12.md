# Radar and publishing review — 12 November 2026

Review of local checkout `cebacbb0` (`ib823/tessera`). Dates in recommendations
are Malaysia time (MYT, UTC+8). Code and saved event data were inspected; no
live news scan, external primary-source verification, publication or deployment
was performed. This report does not approve any new editorial claim.

## Recommendation

Keep the existing FORA / Cloudflare Pages deployment workflow. Its configured
checks already cover preparation of the FORA overlay, typechecking, linting,
unit tests, signed build, bundle/signature checks, seven browser/device projects,
the responsive matrix, and hosted verification. The main weaknesses are Radar
signal integrity, stale editorial planning, and the publication helper.

Use this sequence:

1. Fresh Radar scan with explicit source coverage and scan-time checks.
2. Reconcile the candidate against published content and active reservations;
   select a story with a specific Malaysian mechanism and a primary-source path.
3. Research brief and Stage 1, then independent Stage 2 (bias) and Stage 3
   (facts). Apply the project's conditional Stage 5 escalation rule.
4. Stage 6 synthesis with traceable corrections, then reader copy, legal/accuracy
   review, sources, image, and related-issue connections.
5. Commit the complete publication bundle on a branch, synchronize with main,
   run validation and the existing CI, and obtain publication approval on the
   concrete result before merging for production deployment.
6. Verify the hosted issue and scheduled notification behavior. Refresh social
   Radar signals independently of site deployments, with an age limit.

The brief and final publication approval points are documented in
`CLAUDE.md` (Phases 1 and 8–9). This task was a review and did not enter those
publishing phases.

## Latest saved state

- Scan: **12 November 2026, 02:11:32 MYT** (`radar/output/health.json:2`).
- 498 fetched events; 13,379 fusion topics reported in health, but **1,445**
  retained queue entries. These are different counts, not interchangeable.
- Foreign buffer: **515** events. Five connector records say healthy; that
  label overstates observed coverage (see finding 3).
- Latest published issue: **2019**, published 11 November at 07:07 MYT.
- Issues **2016, 2017 and 2018** were already published on 8 November.
  The 7 November `top-issues-to-develop.md` and `pipeline-recommendation.md`
  still describe them as future slots and incorrectly call 2014 the latest.
- All 42 local `*-pipeline-state.json` files refer to issue IDs whose issue
  JSON is already `published: true`. Some phase flags remain stale; these
  files do not establish an unshipped draft ready to deploy.

## Best next editorial work

| Order | Candidate | Required evidence before drafting/publishing |
|---|---|---|
| 1 | **Update issue 2016** with Thailand's new data-centre regulatory framework versus Malaysia's approval/EIA position. | Verify Thai Cabinet/official regulatory text and current Malaysian rules. Distinguish approval in principle from an enacted EIA mandate. Saved Bangkok Post and Nikkei feed leads appear at `foreign-events.json:316`, `:1804`, and `:5182`. Issue 2016 is already edition 3: avoid publishing a duplicate new issue. |
| 2 | **New issue:** reported Taiwan–Malaysia investment-talks pause and semiconductor investment exposure. | The saved SCMP event (`foreign-events.json:3885`) is one outlet's report, not verified evidence of cancelled investment. Obtain Taipei and MITI/MIDA statements and primary investment figures; separate paused negotiations from actual investment withdrawals. Next unused local ID appears to be 2020, subject to reservation/synchronization checks. |
| 3 | **Domestic alternate:** transfer of environmental powers to Sarawak. | Fresh-watch F1 (`silence-watch.md:30`) has score 0.609. Obtain the gazette and establish scope and commencement; Cabinet approval alone does not establish operative law. |
| Reserve | Palm-oil cargo origin and EU compliance. | Fresh-watch F14 (`silence-watch.md:173`); establish the actual EU obligation, dates and Malaysian traceability mechanism from primary documents. |

The Melaka appointed-seats story is explicitly parked and has only four of
the required eight primary sources (`engine/briefs/melaka-appointed-seats-polls.md:3`).
Do not reuse the old G1/G2/G3 publication slate or treat an automated high score
as editorial readiness. The fresh watch also promotes a Ronaldo retirement
headline, illustrating the classification problem below.

## Findings, in repair order

### 1. Scheduled one-shot scans do not run the advertised volume detector

**High — `radar/streams/volume_monitor.py:309`, `radar/run-radar.py:741`.**

`VolumeMonitor.process()` initializes its bucket clock to the current time on
its first call and flushes only after 15 minutes. Each CI invocation uses
`--once` with newly constructed streams; startup restores only fusion state.
Consequently the ordinary CI path never flushes the volume bucket. The saved
volume state has empty CUSUM/BOCPD maps. Fusion nevertheless receives a
count-based proxy labelled volume evidence (`run-radar.py:470`) and a similar
cascade proxy, so an "ok" stream status does not mean the documented statistical
detector ran.

Persist and restore full bucket/baseline/history state, and define how a
one-shot scan closes event-time buckets. Report detector readiness separately
from a successful method call; distinguish proxies from detector measurements.

### 2. The queue preserves historical peaks and exempts them from expiry

**High — `radar/run-radar.py:198` and `:214`.**

A lower current score cannot replace a higher old score. Entries above 0.3
survive regardless of age. At the latest scan, **858 of 1,445** entries have
timestamps more than seven days old, including **16 of the top 20**. The first
two results are historical budget/calendar topics. A direct temporary-file
reproduction retained a March score of 0.99 after a fresh 0.12 update and again
after a cycle with no new evidence.

Keep current score/last evidence separately from historical peak/first seen.
Expire or decay inactive entries using evidence time; retain history outside
the active publication queue. Reconcile event dates against primary calendars
rather than carrying the old curation note's date corrections forward unchecked.

### 3. Coverage failures are recorded as healthy

**High — `radar/sources/gdelt_connector.py:133`,
`radar/sources/base_connector.py:50`.**

GDELT converts 429s, malformed responses and request failures to empty arrays.
`safe_fetch()` counts an ordinary return as success. The saved cycle log
records repeated GDELT rate limits, a rejected query and **zero GDELT events**,
while health reports GDELT healthy with zero error rate. Several RSS feeds
returned no entries; X was skipped because its token was unset.

Track healthy-empty, partial, rate-limited, failed and disabled states
explicitly, with per-feed/batch counts. Health should disclose expected but
unavailable sources and distinguish partial coverage from a legitimate quiet
news period. The impact-watch outputs are absent; the script exits successfully
without an API key (`radar/scripts/malaysia-impact-pass.py:157`). GitHub's actual
secret configuration was not inspected, so its current secret state is unknown.

### 4. Institutional classification and silence signals produce false leads

**High — `radar/sources/parliament_connector.py:162`,
`radar/streams/silence_detector.py:332`, `radar/run-radar.py:479`.**

Parliamentary filtering uses raw substrings: `act` matches `impact`, and the
default classification is `bill_reading`. A synthetic Leeds sports headline
was reproduced as a bill reading. The saved log also classifies unrelated
electoral/crime stories as institutional events. Calendar items far in the
future can generate high `HIDDEN_STORY` alerts before coverage is due. A silence
alert is fused once under its full title and again through the generic alert
collector under its first-word keyword.

Use token/phrase boundaries and explicit institutional evidence, preserve a
canonical event ID across connector views and fusion paths, and gate silence
expectations by event time. Restore silence observation state across scans so
"silence" measures a real observation window.

### 5. The 24-hour foreign buffer compares strings with different UTC offsets

**Medium — `radar/run-radar.py:287`.**

The cutoff is a UTC ISO string; feed timestamps include UTC, UTC+7 and UTC+8.
Lexicographic comparison does not compare instants. Parsing the saved buffer
against the scan time finds **70 of 515 events older than 24 hours**. The oldest
is about 31.8 hours old. Sort/filter aware timestamps normalized to UTC.

### 6. A malformed institutional timestamp can abort a scan

**Medium — `radar/run-radar.py:405`.**

The exception fallback uses `now`, which is not assigned until line 433.
A malformed timestamp on a court/parliament event reproduced
`UnboundLocalError`. Use the already-initialized `cycle_start` or a correctly
initialized UTC timestamp, and define behavior for missing/naive timestamps.

### 7. The publish helper is unreliable for a normal publication bundle

**High — `scripts/publish-pipeline.mjs:470` and `:481`.**

It pulls with rebase before committing tracked issue/related edits, which Git
rejects in a dirty worktree. It stages only the issue, background and related
issues, omitting research briefs, stage/reader outputs, state and any source
artifacts. CI source generation relies on the brief/reader/state relationship.
`nextIssueId()` also ignores IDs reserved in pipeline state (`:120`).

Use a complete, explicit publication manifest, reserve IDs across active drafts,
commit on a branch before rebasing, and validate the synchronized commit in a
PR. Until repaired, inspect and stage the complete bundle manually; do not rely
on `deploy` to package it correctly.

### 8. Scan/impact workflows can succeed without fresh, persisted results

**High — `.github/workflows/radar-scan.yml:40`, `:45`, `:95`;
`.github/workflows/malaysia-impact-pass.yml:47`.**

The scan pipes Python into `tee` without an explicit bash/pipefail setting;
the health step only prints and accepts old health output. Both writers can
start at 22:00 UTC and push the same branch without serialization, while push
failures are swallowed as success. A failed cycle or rejected push can therefore
leave stale data behind a green workflow.

Require pipeline exit status and a health timestamp from this invocation.
Serialize data writers, run impact after a successful scan, and fail visibly
after bounded synchronization/retry. Add Radar tests to the Radar workflow;
it currently installs and scans without running them.

### 9. Social Radar freshness is tied to site deployment

**Medium — `.github/workflows/deploy.yml:273`,
`workers/social/src/kv.ts:42`, `scripts/build-radar-summary.mjs:96`.**

`radar:current` is uploaded in the site deployment workflow without a TTL.
The Worker reads it without an age check; the TTL-enabled `putRadar()` is not
called by the current Worker path. Regular scan commits do not independently
refresh this KV signal. The summary also labels generation time as now even
when its input queue is old.

Upload after successful Radar scans, preserve source scan time, set a four-hour
TTL, and have the consumer reject stale or invalid timestamps. Keep this signal
refresh separate from rebuilding/deploying the whole site.

## Validation and limits

- Installed Radar requirements plus pytest in an isolated `/tmp` virtual
  environment; installation including `lifelines` succeeded on Python 3.12.
  The old note's local `lifelines` blocker does not apply to this environment.
- Full Radar suite: **246 passed, 7 failed, 50 warnings**. All seven failures
  were diagnosed as fixed March 2026 fixtures aging against the real clock.
  Re-running only those failures with the relevant stream clocks fixed to the
  fixture date passed all seven. The ordinary full suite remains failing;
  clock control should be built into the tests.
- Existing issue validator: **1,061 issues, zero errors, 1,762 warnings**.
- Card/source-reference check: **91 published issues, 368 card source links**,
  passed. These checks validate structure/references, not factual truth.
- Direct reproductions used temporary files/mocks. No production event data or
  content was regenerated. No Node dependencies were installed; the full site
  build, browser suite, live workflows, remote credentials and hosted behavior
  were not exercised. Configured CI checks are not a claim of a current green run.
- Only this review document was added during the initial audit turn.

## Follow-up implementation — user-authorized fixes and three-topic development

The five items the user asked to address have now been changed locally:

1. Queue entries use the latest score and a seven-day evidence expiry; peaks
   are separate metadata. Fusion deduplicates repeated evidence timestamps
   and decays incrementally. Calendar scan time no longer renews evidence age.
2. Volume processing uses completed event-time buckets and persists pending
   buckets, deduplication, STL history, CUSUM and BOCPD state across `--once`
   invocations. Artificial count-based volume/cascade evidence was removed.
3. GDELT/RSS health exposes failed/rate-limited queries and partial coverage;
   unavailable sources remain visible. CI tests Radar, uses pipefail, rejects
   stale/unusable results, and surfaces push failures.
4. The publishing helper reserves IDs across drafts, validates the complete
   evidence/source bundle, offers a dry run, and commits before rebasing. It
   refuses unrelated changes, uses literal Git arguments, and rechecks ID
   conflicts after rebase. The deployment workflow runs its integration tests.
5. The active develop list and recommendation now record 2016–2018 as published
   and 2019 as latest. Research reservations are 2020 and 2021; 2016 has a
   separate edition-4 research state to preserve its published source mapping.

Additional fixes cover UTC buffer comparisons, malformed timestamps, duplicate
silence fusion and future-calendar alerts in the orchestrator. Review caught
and corrected a new ingestion cutoff regression: timestamps assigned while
fetching are compared against fetch completion, not scan start.

Validation on the final code: **291 Radar tests passed, 50 warnings**;
**12 publication-helper integration tests passed**. Source-reference checks
passed for 91 published issues and 368 card links. An isolated volume replay of
501 saved foreign events processed 2,629 samples across 31 series in about
1.1 seconds and serialized its state; it did not write production output.

The three selected research packages distinguish saved leads from verified
primary documents. Official-source requests are blocked by the environment
proxy (CONNECT 403). A restricted-domain access proposal was saved in environment
settings; applying it and rechecking access is required to complete research.
No new Stage 1, independent review score, publication or deployment is claimed.

These are local changes, not a live deployment. Main was synchronized to
`f06c7ea3` (scan 12 November 04:11 MYT); saved scan outputs still predate the
fixes. Remaining audit items include institutional keyword classification,
persistent silence observation windows, scan/impact writer coordination, and
social KV freshness. Further coverage limitations are undated RSS documents
receiving new fetch timestamps and volume zero-filling during partial source
outages. The changes do not establish model calibration or eliminate all
data-quality problems.
