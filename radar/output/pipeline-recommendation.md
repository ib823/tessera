# Pipeline Recommendation — Editorial Review of Radar Top Issues

_Editorial-review companion to the radar's curated develop list
(`radar/output/top-issues-to-develop.md`). This is the `editorial review`
step in the documented flow: `radar scan → issue-queue.json +
silence-watch.md → top-issues-to-develop.md → editorial review → publish
pipeline`. The radar does not write issues; this note recommends which
curated candidates enter the 10-phase publish flow, in what order, and
with what guardrails. Nothing here is published._

## Editorial direction (set 2026-11-07)

Lead with **global events that land on Malaysia in ways Malaysian
coverage has not connected**, so T4A reads as the source that thinks
furthest ahead. The test for every global pick: name the Malaysian
mechanism (contract, trade flow, statute, tariff, port, court) and trace
it to a primary source. A global story without a Malaysian mechanism is
commentary and stays out. Domestic picks fill the slots the global slate
cannot.

## Data-freshness

- **Raw queue**, **state**, and **health** from the CI scan at
  **2026-11-07 20:10 UTC** (commit `640c86d`; 1,448 active issues; 493
  events; five sources healthy; six streams ok). No local rescan: CI is
  the record, and the container still cannot build `lifelines`.
- **Foreign stream** (`foreign-events.json`, rolling 24h, 389 events)
  from the same scan. First cycle it is used as a primary input.
- **Silence-watch** as committed by CI from the same scan (25 accumulated,
  15 fresh picks).
- **Latest published issue:** `2014` (sourceDate 2026-09-19). Next free
  ID: `2015`, reserved for **G1**
  (`engine/output/data-centres-us-voted-out-malaysia-in-pipeline-state.json`).

## Status reconciliation (since the 18 Sep curation)

| Prior pick | Topic | Now |
|------------|-------|-----|
| A2 | Political financing / RM50m donation drive | **Published as 2013 (19 Sep).** Payment completed 6 Nov: edition-2 update, Stage 5 required. |
| A1 | AGC discontinues four Muhyiddin charges | Never briefed. Seven weeks old. Carry-over. |
| A3 | 800kWh electricity exemption | Never briefed. Overtaken by Budget 2027 (tabled 9 Oct). Folded into B5. |
| B3 | Melaka nominated assemblymen | Briefly A1 this cycle; **parked as D1** when the direction changed. Pipeline state removed; research notes kept for a post-election issue. |
| — | 2014 southern Thailand | Published 19 Sep (not from the list). |
| — | **Data centres: US voters say no, Malaysia says yes** | **New. G1. In pipeline as 2015.** |
| — | **"Malaysian" crude and the Iran blockade** | **New. G2.** |
| — | **Scam empires abroad vs Malaysia's 1%** | **New. G3** (absorbs the domestic scam pick). |
| — | **No house-arrest law** | **New. Wildcard W1, editor's call.** |

## Recommended development order (next three publish slots)

Notifications fire Tue/Thu 08:00 and Sat 09:00 MYT. This review lands
early on Sunday 8 Nov MYT, so the slots are **Tue 10 Nov, Thu 12 Nov,
Sat 14 Nov**.

1. **G1: data centres.** **Tuesday.** Economic / Environmental /
   Governance. In the pipeline as **2015**; a research agent is
   gathering the brief's sources now. One week after the 3 Nov midterms
   and six days after Google's 4 Nov announcement, the contrast is fresh.
   Guardrails: (a) the US ballots were 41 *local* measures, mostly in ten
   states; never "America rejected data centres"; (b) "AI bubble" is
   attributed commentary, never a finding; (c) the issue is who decides
   and who pays, not whether Google's projects are bad; (d) do not
   repeat **1963**'s water findings; cite them and move on.
2. **G2: "Malaysian" crude.** **Thursday.** Security / Economic / Legal.
   Start the brief Sunday after G1's is approved. The spine is two
   numbers from primary data (China's recorded imports from Malaysia;
   Malaysia's production), then the blockade's effect on the first
   number. Every "Iranian" attribution is an analyst estimate unless a
   customs or sanctions document says otherwise. Iran International is a
   partisan source; corroborate with tanker-tracking data reported by
   Reuters or Bloomberg.
3. **G3: scam proceeds.** **Saturday.** Legal / Economic / Regional.
   Lowest 3R load of the three; the domestic figures are already in the
   queue with parliamentary sources. Close the Cybercrimes Act
   commencement question on the federal gazette before drafting.

This gives Economic → Security → Legal across the week, three global
frames each with a Malaysian mechanism, and no 3R load in the lead slot.

**Fallbacks.** If G2's sourcing cannot clear Stage 3 by Wednesday,
swap in the **2011 haze edition 2** (Singapore's haze-law changes vs
Malaysia's dropped Act, plus the 2027 "Super El Nino" warning); note
that an update may not fire the CRON's new-issue notification, so G3
moves to Thursday. If any slot opens later, **D3** (pipeline loans) is
ready.

**Wildcard W1 (no house-arrest law)** is the most-read story available
and the riskiest. It needs the editor's explicit go-ahead before any
brief work, Stage 5, and the guardrails in the develop list.

## Stage 5 escalation calls

Per CLAUDE.md and ADR-0004, re-enable the Grok contrarian stress-test
when a brief marks Religion / Ethnic / Royalty risk HIGH+, marks
Political risk CRITICAL with a sharp take, or when Stage 3
`source_diversity_estimate` is below 0.4.

- **G1 (data centres):** 3R LOW. Not required.
- **G2 (crude):** Political MEDIUM-HIGH; source diversity is the risk.
  **Decide after Stage 3**: run Stage 5 if `source_diversity_estimate`
  < 0.4.
- **G3 (scams):** all LOW. Not required.
- **W1 (house arrest):** Royalty CRITICAL. **Required.**
- **2013 and 1976 updates:** **Required** (both base issues carry the
  escalation).

## Before drafting Stage 1 for G1

- One phrase per entity across all cards: "data centres" (not "server
  farms", "hyperscale facilities", "AI campuses" in turn); "the ballots"
  for the US measures.
- The Malaysian half needs its own primary numbers: the official 4 Nov
  statement, Energy Commission tariff treatment, TNB grid capex, and the
  approval chain (who signs off, whether an EIA applies, whether
  residents are consulted). The US half can rest on the tracker and two
  county results pages.
- Hook emotion: anxiety-of-precedent (other electorates are voting these
  out; ours has no ballot), not anger at investors.
- Candidate reframe (question restructuring): *The question is not
  whether Malaysia should host data centres. It is who in Malaysia gets
  the vote that 41 American towns just used.* Test it against the brief
  before using it.

## Before drafting Stage 1 for G2

- Pull the China customs series by origin yourself (or via a named
  wire report quoting it); do not rely on a single analyst chart.
- Separate three things on the cards: what is *recorded* (customs),
  what is *estimated* (analyst attribution to Iran), and what is
  *established* (sanctions designations, court cases).
- Malaysia's own enforcement record (MMEA detentions, any STS permit
  rule) goes on a fact card; without it the issue underclaims Malaysia's
  side.

## Operational gaps to close

1. `radar/output/malaysia-impact-watch.{json,md}` still do not exist. The
   daily pass exits before writing because `ANTHROPIC_API_KEY` is unset.
   Unchanged since 3 Aug. This cycle's editorial direction depends on
   that pass: until it runs, curators read `foreign-events.json` by hand,
   and that file keeps only 24 hours. Set the secret or disable the
   workflow.
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
   stubs. Curators should keep reading the silence-watch, the fresh list
   and the foreign stream.

_Refreshed 2026-11-07 as the editorial-review companion to the
2026-11-07 20:10 UTC scan; editorial direction updated the same day.
Supersede on the next curator refresh._
