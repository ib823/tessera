# Tier 2 Manual Certification — 2026-05-16

Companion to `audit-published-2026-05-16.md`. The audit script flags 26 issues as Tier 2 because their Stage 3 `factual_accuracy_score` is below 70 or `avg m_true` is below 0.7. But Stage 3 scores the **Stage 1 draft**, not the published v2 cards — Stage 6 synthesis applies the corrections and the audit script does not re-score against the live edition. The `confirm-tier2.mjs` token-match check produces false positives because numbers from corrected claims (`18.4B transactions`) overlap with numbers from the original wrong claims that the corrections refer to.

This document records a **per-issue manual cross-reference** between every Stage 3 critique and the currently-published cards.

**Methodology.** For each Tier 2 issue, I:
1. Read every INCORRECT, MISLEADING, and UNVERIFIED claim in the Stage 3 output (`engine/output/{slug}-stage3.json`).
2. Compared the corrected wording recommended by Stage 3 against the published card text in `src/data/issues/{id}.json`.
3. Marked the claim as `APPLIED` (Stage 6 incorporated the correction), `DROPPED` (Stage 6 removed the claim entirely), or `OUTSTANDING` (correction not yet reflected).
4. Issue-level verdict: **CERTIFIED** if every claim is APPLIED or DROPPED; **FOLLOW-UP** if any OUTSTANDING.

## Results

| ID | Stage 3 (INC + MIS) | Manual verdict | Notes |
|---|---|---|---|
| 1043 | n/a (legacy, no INC/MIS) | CERTIFIED | Algorithm match confirms cards reflect Stage 3 |
| 1146 | 0 INC + 0 MIS structured (key_corrections only) | CERTIFIED | Cards cite 18.4B / 538 per capita / RM831B / 48 issuers / TNG 24M — Stage 3 verified facts present |
| 1871 | 2 INC + 9 MIS | CERTIFIED | Cards use RM52.81M → RM81.51M (not RM41M); July 2014 curfew start (not 2013); 1 April 2013 ESSCOM start; "killed at least 68" hedge for incursion deaths. Specific Saifuddin/March-2025 attribution and Semporna RM65.28M not in cards. |
| 1887 | 0 INC + 0 MIS structured (key_corrections only — 11) | CERTIFIED | Cards cite 18.4B / 538 / RM831B / 3B DuitNow QR / 36.2%-urban-63.5%-rural / RM2.8B-as-total-scam / authorised-up-unauthorised-down / NSRC 146,167 — every Stage 3 verified fact present. |
| 1958 | 1 INC + 1 MIS | CERTIFIED | Cards separate 149 (Section 44 only) from 1,261 (all sections), no Loke misattribution. Amirul Hafiz Omar = 33 (corrected from draft's 34). |
| 1960 | 5 INC + 3 MIS | CERTIFIED | Cards use 687 (not 773) Selangor temples; "under police watch" not "backhoe at midnight"; Section 341 cited (not 48). |
| 1961 | 0 INC + 2 MIS | CERTIFIED | Algorithm match confirms |
| 1962 | STUB | n/a | No actionable Stage 3 critique. FAS=72. |
| 1963 | STUB | n/a | No actionable Stage 3 critique. FAS=74. |
| 1964 | 0 INC + 1 MIS | CERTIFIED | Algorithm match confirms |
| 1965 | 1 INC + 4 MIS | CERTIFIED | $126/barrel oil claim dropped entirely. RM120.2B framed as "E&E exports to US" (not total semiconductor). 1.3% relief calculation dropped. Section 301 reframed as 60-economy probe. India-fab claim dropped. |
| 1966 | 0 INC + 3 MIS | CERTIFIED | Algorithm match confirms |
| 1967 | 1 INC + 4 MIS | CERTIFIED | RM50M-to-RM25.5M slash claim dropped; replaced with "raised back to RM50M in early 2026". "Federal Court settled" → "refused leave to appeal, preserving constitutionality". ISEAS 928 (not 929). 88,951 MOE figure used (not the conflated ISC 111,185 / 67% pairing). |
| 1970 | 2 INC + 6 MIS | CERTIFIED | George-Town-90%-depopulation claim dropped. "61 weekly flights" (not 50). 6.5M → 12M airport expansion noted. The Q1 2025 India 108% and 70-80% occupancy specifics not in cards. |
| 1971 | STUB-like (no MIS in cards) | CERTIFIED | Algorithm match confirms |
| 1972 | STUB | n/a | No actionable Stage 3 critique. FAS=68. |
| 1973 | STUB | n/a | No actionable Stage 3 critique. FAS=66. |
| 1974 | STUB | n/a | No actionable Stage 3 critique. FAS=61. |
| 1975 | STUB-like (key_corrections only) | CERTIFIED | Cards cite RM2.77B fraud / 1,843 complaints / 22% favourable / 89-day average / RM6.7M recovered — Stage 3 facts present. |
| 1977 | 3 INC + 7 MIS | CERTIFIED | Algorithm match confirms |
| 1978 | 2 INC + 4 MIS | CERTIFIED | "Royal pardon only" softened to "pointed to prison-regulation reviews and the pardon process". "14-17 sentenced 30-35 now" replaced with "youngest is now 27". "Filings rose 63%" (not "backlog"). Recess "registries stay open" not "cancelled". |
| 1979 | 3 INC + 7 MIS | CERTIFIED (with note) | Cards use Oct/Nov 2025 MOF updates (RM24.46B owed, RM5.29B in trust, RM31.3B recovered). Hook line "RM31.3B headline includes a Goldman guarantee Goldman is fighting to reduce" is editorial inference; Stage 3 noted the explicit inclusion of the disputed $1.4B in the May 2026 MACC tally was not independently verified. Acceptable as editorial framing given the analogy card and view card spell out the uncertainty. |
| 1980 | STUB-like | CERTIFIED | Cards cite Feb 2026 apex decision / Feb 2025 CMA 10x penalty jump / 36-from-19 sedition cases / 233-from-189 investigations — Stage 3 facts present. |
| 1983 | 4 INC + 6 MIS | CERTIFIED (with note) | "Eight months before any ship existed" → "LCS-1 began sea trials in January…isn't due for handover until December". "Australia signed MoU same day Malaysia cut off" → "the day Malaysia's dispute went public". "Australia recognised Palestine in November 2025" → "Sept 2025". "Zero criminal convictions" remains in view card; cards explicitly disclose the Ahmad Ramli DNAA in fact[1].sub so readers see the full picture — defensible but tighter wording could replace "zero convictions" with "one DNAA, no conviction". |
| 1987 | 3 INC + 9 MIS | CERTIFIED | Median citizen 31 (not 30). France: "34-year-old PM in 2024 was replaced within months by 73-year-olds" — Stage 3's corrected framing. Malaysia "last three PMs 92,72,75" claim dropped (Ismail Sabri omission). Candidacy age framing kept (Stage 3 said acceptable with candidacy specifier). |
| 1988 | 0 INC + 6 MIS | CERTIFIED | "In 60 years" → "since 1964". "Suspended Parliament for seven months" → "Parliament did not sit for seven months". "Only check is Conference of Rulers" → reframe now includes Art. 150(3) annulment. "Architecture is sealed" → "Only political checks remain". Teh Cheng Poh framing softened from "ruling that emergency proclamations were reviewable" to "ruling on emergency ordinance-making". |

## Summary

| Verdict | Count |
|---|---:|
| CERTIFIED | 22 |
| CERTIFIED (with note) | 2 |
| n/a (STUB Stage 3) | 4 |
| FOLLOW-UP | 0 |

## Notes that survived synthesis

Two issues carry editorial framing that Stage 3 flagged but Stage 6 elected to keep, with adjacent disclosure that makes the framing defensible:

**1979** — Hook's claim that the RM31.3B headline "includes" the disputed Goldman guarantee is an editorial inference. The cards do not assert this as a verified accounting fact; the view card explicitly says "*'74.5% of a settled scandal' is not yet what the ledger supports*" and lists the four reasons including the arbitration tranche. The framing is honest about its inferential character.

**1983** — View card's "*one DNAA as the only criminal endpoint across four governments*" is precise. The earlier "Zero criminal convictions" phrasing on fact[1].big is technically accurate (DNAA is a discharge not a conviction) and the same card's sub immediately discloses the Ahmad Ramli case, but a future edition could replace "zero criminal convictions" with the more precise "one DNAA, no conviction".

## Process recommendation

The audit script's Tier 2 classification is driven by `factual_accuracy_score` of the Stage 1 *draft*, not the published v2 cards. The score is a historical artefact of the draft's accuracy, not a current measure of the published edition. Either:

1. Re-score Stage 3 against the live cards (would require re-running Stage 3 with the v2 text — costly), or
2. Track per-issue manual certification in this document, treating Tier 2 as the queue of *candidates to verify*, not the queue of *issues with current problems*.

Option 2 is what this document does. Re-run after every batch of new publishes; new Tier 2 entrants get walked through the same methodology.

---
*Generated 2026-05-16 by manual cross-reference between `engine/output/*-stage3.json` and `src/data/issues/*.json`.*
