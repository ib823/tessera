# Pipeline Recommendation — Editorial Review of Radar Top Issues

_Editorial-review companion to the radar's curated develop list
(`radar/output/top-issues-to-develop.md`). This is the `editorial review`
step in the documented flow: `radar scan → issue-queue.json +
silence-watch.md → top-issues-to-develop.md → editorial review → publish
pipeline`. The radar does not write issues; this note recommends which
curated candidates enter the 10-phase publish flow, in what order, and
with what guardrails. Nothing here is published._

## Data-freshness

- **Raw queue** (`issue-queue.json`), **state**, and **health** rescanned
  **2026-08-03 09:15 UTC** (queue 1134, 509 events, all five sources
  healthy, all six streams ok).
- **Silence-watch** rebuilt 2026-08-03 from that queue, now with two
  tracks (fresh / accumulated).
- **Curated develop list** refreshed the same day. The previous edition was
  pinned to the 2026-06-05 scan — a two-month gap during which the radar
  scanned roughly 700 times and nothing was curated.
- **Latest published issue:** `2009` (sourceDate 2026-06-24). Nothing has
  shipped in six weeks.

## Why the develop list had gone stale

Not neglect alone — two mechanical faults in `build-silence-watch.py`, both
fixed in this change and covered by tests in
`radar/tests/test_silence_watch_builder.py`:

1. The already-covered filter compared each candidate against the **union**
   of every published issue's vocabulary. Three common words were enough to
   suppress a story. It now compares per issue and discounts corpus-common
   words. Four of this cycle's strongest picks were invisible before the fix.
2. Every ranking was **age-weighted** (up to 2x), so nothing recent could
   reach the top. A separate fresh-signal track now ranks the last 7 days
   without age weighting.

Calendar placeholders are filtered at source instead of being skipped by
hand each cycle.

## Status reconciliation (what shipped since the last curation)

| Prior pick | Topic | Now |
|------------|-------|-----|
| A3 | ADMP rules exempt the state's own profiling | **Published `2008`** |
| — | Mossad suspects named, no espionage conviction | **Published `2009`** |
| A1 | MyIMMs outage / NIISe delay | **Still open** — merged into this cycle's A2 |
| A2 | AG vs the Bar on DNAA standing | **Still open** — carry-over |
| B1-B4 | Lotteries, Aeroline/APAD, PharmD, JAS | **Still open** — carry-over |

## Recommended development order (next three publish slots)

Notifications fire Tue/Thu 08:00 and Sat 09:00 MYT. Today is Monday
2026-08-03, so the slots are **Tue 4 Aug, Thu 6 Aug, Sat 8 Aug**. Six weeks
without a publish means the first slot should be the strongest pick, not
the easiest one.

1. **A1 — Tabung Haji RCI restatement.** Highest-leverage fresh story and
   the cleanest primary-source path (commission report, audited accounts,
   Act 535). Lead on the restatement mechanism — a distribution declared on
   a profit the commission says was a loss — not on the misconduct
   allegation mainstream coverage already carries. Governance / Economic
   lens. Two hard guardrails: keep the FY2017 restatement separate from the
   RM1.4b write-down disclosed in the 2025 annual report (unpublished draft
   `1151` covers the latter; conflating them is the most likely accuracy
   failure in this issue), and keep the critique on fund governance, never
   on the pilgrimage or on depositors as a community.
2. **A2 — the border system, breached inside and fragile outside.** Merges
   the carried-over MyIMMs continuity story with the 29 July arrests.
   Technology / Governance / Security — the lens the 2000-series is missing
   entirely. Pre-charge, so count the detained without identifying them and
   treat the RM2.4m as an official estimate, not a proven loss.
3. **A3 — 2,001 factory fires, RM4.21b in losses.** Denominator-rich, zero
   3R load, restores the Environmental slot. Get the year-by-year split
   before publishing; a five-year lump sum without annual denominators is
   the inert-statistic failure the language standard warns about.

This ordering keeps lens diversity across the three slots (Governance →
Technology → Environmental) and puts the issue with the most demanding
verification first, while the week still has room to hold it.

If A1 slips on verification, promote **B1** (Langkawi council liability,
Legal) rather than reordering A2 and A3 — it is the only other pick that
needs no new lens research.

## Stage 5 escalation calls

Per CLAUDE.md and ADR-0004, re-enable the Grok contrarian stress-test when
a brief marks Religion / Ethnic / Royalty risk HIGH+, marks Political risk
CRITICAL with a sharp take, or when Stage 3 `source_diversity_estimate` is
below 0.4.

- **A1 (Tabung Haji):** religious risk assessed MEDIUM, not HIGH — the
  subject is a statutory fund's accounts, not belief. Stage 5 **not**
  required on the 3R trigger, but re-check after Phase 1: if the brief's
  sources skew to one side of the political divide, the source-diversity
  trigger will fire on its own.
- **A2, A3, B1:** no escalation trigger.
- **Pastor Koh (Skip)** and **the lotteries carry-over:** both would fire
  the religious trigger. Neither enters the pipeline without Stage 5
  re-enabled.

## Before drafting briefs

- Every figure in the curated list is a **radar signal, not a verified
  number** — RM1.4b, RM2.4m, 2,001 fires, RM4.21b, RM2.5b monthly. Phase 1
  traces each to a primary source or the claim does not reach a card.
- The A2 arrests are an open investigation. No naming without charges.
- The coverage filter is monolingual, so Malay and English versions of the
  same story both surface. Dedupe by hand at Phase 0.

## Operational gap to close

`radar/output/malaysia-impact-watch.{json,md}` do not exist. The daily
Malaysia-impact pass is gated on `ANTHROPIC_API_KEY` and exits cleanly when
it is absent, so the global-to-Malaysia transmission track has been dark
while `foreign-events.json` keeps filling. Two foreign picks this cycle (US
transhipment probes in Vietnam, US withholding WHO/Gavi funding) are
therefore unscored. Either set the secret or drop the daily workflow — a
pass that silently produces nothing is worse than no pass.

_Refreshed 2026-08-03 as the editorial-review companion to the same-day
radar scan; supersede on the next curator refresh._
