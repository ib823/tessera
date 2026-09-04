# Pipeline Recommendation — Editorial Review of Radar Top Issues

_Editorial-review companion to the radar's curated develop list
(`radar/output/top-issues-to-develop.md`). This is the `editorial review`
step in the documented flow: `radar scan → issue-queue.json +
silence-watch.md → top-issues-to-develop.md → editorial review → publish
pipeline`. The radar does not write issues; this note recommends which
curated candidates enter the 10-phase publish flow, in what order, and
with what guardrails. Nothing here is published._

## Data-freshness

- **Raw queue**, **state**, and **health** from the CI scan at
  **2026-09-03 22:24 UTC** (queue 1,122; 499 events; five sources healthy;
  six streams ok). A local rescan at 23:51 UTC reproduced it (queue
  1,128; prediction pipeline skipped on a missing `lifelines` build, CI
  unaffected).
- **Silence-watch** as committed by CI from the same scan.
- **Curated develop list** refreshed 2026-09-04. The previous edition was
  pinned to 2026-08-03.
- **Latest published issue:** `2009` (sourceDate 2026-06-24). Nothing has
  shipped in ten weeks. Two briefs are complete and waiting on approval.

## Status reconciliation (since the 3 Aug curation)

| Prior pick | Topic | Now |
|------------|-------|-----|
| A1 | Tabung Haji RCI restatement | **Brief complete 9 Aug, ID 2010 reserved, awaiting approval.** Three September developments to fold in. |
| A2 | Border system (MyIMMs / insider breach) | Not briefed. Carried to Tier B1. |
| A3 | 2,001 factory fires | Not briefed. Carried to Tier B2; new Ipoh hook 1 Sep. |
| B1–B4 | Langkawi, diesel, MAHB, Sabah transfers | Still open. |
| — | **Sarawak haze / dropped Transboundary Haze Act** | **New. Briefed this cycle, ID 2011 reserved, awaiting approval.** |

## Recommended development order (next three publish slots)

Notifications fire Tue/Thu 08:00 and Sat 09:00 MYT. Today is Friday
4 September 2026 (MYT), so the slots are **Sat 5 Sep, Tue 8 Sep, Thu 10
Sep**. Ten weeks without a publish means the first slot must be the
freshest story, not the one that has waited longest.

1. **A1 — Sarawak haze and the law both governments dropped.** Live this
   week, Environmental lens the 2000-series has never carried, zero 3R
   load, and a bipartisan legislative record (PH proposed and later
   dropped it; PN shelved it in between) that keeps the anger on process.
   The brief is complete with 53 sources, 14 primary. Two hard guardrails:
   (a) the AGC's evidentiary objection and Singapore's zero-conviction
   record must sit on a fact card as the honest counter-argument, and
   (b) no card may imply Malaysian-linked plantations caused the 2026
   fires; the 2019 sealing is precedent, not evidence. Before Stage 1,
   close verification gaps 1, 2 and 4 in the brief (treaty Article 9
   wording, Hansard for the 2020 and 2023 statements, the DOE API-to-PM2.5
   breakpoint table). Update the API readings to the latest DOE bulletin
   at Phase 8; the story will still be live.
2. **A2 — Tabung Haji RCI restatement.** Brief already complete; the only
   cost is a PERIOD/CONTEXT refresh for the 1 Sep MACC detention, the 3 Sep
   COO charge and the 30 Aug C4 audit-discrepancy call. Governance /
   Economic / Legal. Same guardrails as the 3 Aug edition.
3. **A3 — Felda's decade-late audit.** Needs a full Phase 1. Governance /
   Economic / Historical. MEDIUM ethnic risk on framing; the 2019 White
   Paper and AG's Reports are the spine.

This ordering gives Environmental → Governance → Governance/Historical
across the three slots. If A3 slips on research, promote **B3 (KWAN
Bill)**, which is a statute story with primary sources already public,
rather than reordering A1 and A2.

## Stage 5 escalation calls

Per CLAUDE.md and ADR-0004, re-enable the Grok contrarian stress-test
when a brief marks Religion / Ethnic / Royalty risk HIGH+, marks
Political risk CRITICAL with a sharp take, or when Stage 3
`source_diversity_estimate` is below 0.4.

- **A1 (haze):** Religious LOW, Ethnic LOW, Political MEDIUM. **Not
  required.** Watch Stage 3's source-diversity score; the legislative
  history leans on three outlets (FMT, Malay Mail, Malaysian Bar) until
  Hansard is pulled.
- **A2 (Tabung Haji):** Religious MEDIUM. Not required on the 3R trigger;
  same caveat as before on source skew.
- **A3 (Felda):** Ethnic MEDIUM. Not required at brief stage; re-assess
  once written, because the "not race or religion" framing is already
  being contested publicly.
- **Preaching tauliah (Skip)** would fire the religious trigger. Does not
  enter the pipeline without Stage 5.

## Before drafting Stage 1 for A1

- Six contradictions are logged in the brief (Indonesian July burn area
  ×3; asthma counts KKM vs Al Jazeera; 2013 cost RM1.74b vs RM1.57b; AATHP
  entry-into-force date; 2019 sealed plantations named vs denied; who is
  responsible for 2026 fires). Each has a resolution rule. Follow it.
- The reframe candidate that re-anchors API 500 against the MAAQS PM2.5
  limit needs gap 4 closed first. Do not publish the multiple from memory.
- Language: the brief already avoids em-dashes in card-bound text; keep
  "Transboundary Haze Act" as the single term for the bill across all
  cards (no "haze law" / "the Act" / "the bill" variation).

## Operational gap to close

`radar/output/malaysia-impact-watch.{json,md}` still do not exist; the
daily impact pass exits silently without `ANTHROPIC_API_KEY`. Unchanged
since 3 Aug. Either set the secret or disable the workflow.

_Refreshed 2026-09-04 as the editorial-review companion to the
2026-09-03 22:24 UTC scan; supersede on the next curator refresh._
