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
  **2026-11-07 20:10 UTC** (commit `640c86d`; 1,448 active issues; 493
  events; five sources healthy; six streams ok). No local rescan: CI is
  the record, and the container still cannot build `lifelines`.
- **Silence-watch** as committed by CI from the same scan (25 accumulated,
  15 fresh picks).
- **Curated develop list** refreshed 2026-11-07. The previous edition was
  pinned to 2026-09-18.
- **Latest published issue:** `2014` (sourceDate 2026-09-19). Next free
  ID: `2015`, now reserved for A1 (`engine/output/melaka-appointed-seats-polls-pipeline-state.json`).

## Status reconciliation (since the 18 Sep curation)

| Prior pick | Topic | Now |
|------------|-------|-----|
| A2 | Political financing / RM50m donation drive | **Published as 2013 (19 Sep).** Payment completed 6 Nov: edition-2 update, Stage 5 required. |
| A1 | AGC discontinues four Muhyiddin charges | Never briefed. Seven weeks old. Demoted to carry-over. |
| A3 | 800kWh electricity exemption | Never briefed. Overtaken by Budget 2027 (tabled 9 Oct). Folded into B5. |
| B3 | Melaka nominated assemblymen | **Promoted to A1.** Polling is 14 Nov. |
| B5 | AUKU replacement Act | Still B (B6). Fresh statement 3 Nov, no Bill text. |
| — | 2014 southern Thailand | Published 19 Sep (not from the list). |
| — | **Scam recovery ~1% and the Cybercrimes Bill** | **New. Tier A2.** |
| — | **Pipeline losses "cut to RM3b"** | **New. Tier A3.** |

## Recommended development order (next three publish slots)

Notifications fire Tue/Thu 08:00 and Sat 09:00 MYT. This review lands
early on Sunday 8 Nov MYT, so the slots are **Tue 10 Nov, Thu 12 Nov,
Sat 14 Nov**. Melaka votes on Saturday; that fixes the order.

1. **A1 — Melaka's appointed seats.** **Tuesday** (early-voting day),
   fallback **Thursday**. **Never Saturday:** polling day. Legal /
   Governance / Political. Started in the pipeline as **2015**
   (`melaka-appointed-seats-polls`); the research brief is the next
   action and needs approval before Stage 1. Hard guardrails: (a) no card
   favours a party, coalition or candidate, and every card that names the
   amendment's sponsors also gives their stated rationale; (b) the
   High Court suit is live, so report the pleaded ground and never
   predict the outcome; (c) the arithmetic (one seat in five; the elected
   seats a coalition needs for two-thirds with and without appointees) is
   computed from the amendment text, not from news reports; (d) if MCA's
   29 Oct "assurances on Chinese representation" turn on the appointed
   seats, Ethnic is HIGH and Stage 5 runs, which costs the Tuesday slot.
2. **A2 — scam recovery and the Cybercrimes Bill.** **Thursday** (or
   Tuesday if A1 slips to Thursday). Legal / Economic / Rights. Zero 3R
   load. Close the commencement question first: if the Act has not been
   brought into force by gazette, that is the hook; if it has, the story
   becomes "the power exists; the 1% is the baseline it must beat", which
   is weaker but still publishable. Pick one loss figure per card and
   state its window and source every time; the three official figures
   (RM1.23b / decade; RM1.2b / 997 hotline since Oct 2022; RM2.7b /
   eleven months) are not interchangeable.
3. **A3 — the pipeline "loss cut to RM3b".** **Saturday.** Economic /
   Governance / Legal. A non-Melaka story is safe on polling day. Every
   card on contracts and cash; no card links the pipelines to the
   house-arrest story running the same week.

This gives Legal → Legal/Economic → Economic across the three slots, one
accumulated pick (A1, S5) and two fresh picks (A2, A3), which satisfies
the silence-watch's one-per-track rule. If A1 cannot clear Stage 3 by
Wednesday evening, **drop it rather than publish on Saturday**; it
becomes a post-election issue ("the winner may now appoint up to
seven"), which is still live because appointments follow the polls. In
that case B5 (Budget 2027's subsidy line, before the Supply Bill vote on
or after 26 Nov) takes the open slot.

## Stage 5 escalation calls

Per CLAUDE.md and ADR-0004, re-enable the Grok contrarian stress-test
when a brief marks Religion / Ethnic / Royalty risk HIGH+, marks
Political risk CRITICAL with a sharp take, or when Stage 3
`source_diversity_estimate` is below 0.4.

- **A1 (Melaka):** Political HIGH, Royalty LOW. **Conditional** on the
  Ethnic finding above. Decide in the brief, not after Stage 3.
- **A2 (scams):** all LOW. Not required.
- **A3 (pipelines):** Political HIGH. Not required unless the take
  sharpens to CRITICAL; watch Stage 3's source diversity (coverage is
  Star / Bernama / BFM heavy until the MoF statement is pulled).
- **2013 and 1976 updates:** Stage 5 **required** (both base issues
  carry the escalation).
- **Skips that would fire the trigger** (house-arrest decree, khawarij
  fatwa, halal cases, JAIS takedown) do not enter the pipeline this cycle.

## Before drafting Stage 1 for A1

- Get the amendment's own words: the article amended, the cap, who
  nominates, the assembly vote needed, the Yang di-Pertua Negeri's role,
  and whether appointees vote on everything (budget, confidence,
  constitutional amendments). The two-thirds arithmetic depends on the
  last point.
- One phrase per entity across all cards: "appointed assemblymen" (not
  "nominated", "unelected", "lantikan" in turn); "the amendment".
- Comparator table from primary sources only: Pahang, Sabah, Terengganu,
  Johor (elected seats and cap).
- Hook emotion: anxiety-of-precedent (what the ballot no longer
  decides), not anger at the coalition that passed it.

## Before drafting Stage 1 for A2

- Confirm royal assent and commencement on the federal gazette
  (lom.agc.gov.my). Do not write "not in force" from news silence.
- Get the 4 Nov and 5 Nov written answers verbatim (Bernama mirrors if
  parliament.gov.my stays blocked).
- Clause 54's safeguards (who applies, standard of proof, duration,
  review) go on the Rights card; without them the card overclaims.

## Operational gaps to close

1. `radar/output/malaysia-impact-watch.{json,md}` still do not exist. The
   daily pass exits before writing because `ANTHROPIC_API_KEY` is unset.
   Unchanged since 3 Aug. Set the secret or disable the workflow.
2. `radar/config/malaysia-calendar.json` has `budget_presentation:
   2026-10-23`, but Budget 2027 was tabled on **9 Oct** (committee stage
   2-26 Nov). That date feeds `days_to_budget` in the Cox and SARIMA
   models and the silence detector's calendar boost, and it is why rank 1
   of the queue is still a "budget 2027 presentation" predictor at p 0.99
   a month after the event. Correct the date (and re-run
   `radar/tests/test_cox_timing.py`).
3. The same file's `state_election_windows.notes` says "no scheduled
   state elections in 2026"; Melaka polls on 14 Nov. Correction to the
   18 Sep note: no model reads this key, so fixing it is documentation
   only. The Cox model's `days_to_election` uses a fixed GE target.
4. The silence detector's institutional-event classifier is loose: the 7
   Nov cycle tracked a Leeds-Tottenham match report as INST-0012
   `bill_reading`, and logged every Najib headline twice (once as
   `bill_reading`, once as `high_court_ruling`).
5. Ranks 1-16 of the queue remain calendar predictors and single-keyword
   stubs. Curators should keep reading the silence-watch and the fresh
   list.

_Refreshed 2026-11-07 as the editorial-review companion to the
2026-11-07 20:10 UTC scan; supersede on the next curator refresh._
