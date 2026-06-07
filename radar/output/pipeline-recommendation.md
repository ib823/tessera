# Pipeline Recommendation — Editorial Review of Radar Top Issues

_Editorial-review companion to the radar's curated develop list
(`radar/output/top-issues-to-develop.md`). This is the `editorial review`
step in the documented flow: `radar scan → issue-queue.json +
silence-watch.md → top-issues-to-develop.md → editorial review → publish
pipeline`. The radar does not write issues; this note recommends which
curated candidates enter the 10-phase publish flow, in what order, and with
what guardrails. Nothing here is published._

## Data-freshness (now in sync)

- The **raw queue** (`issue-queue.json`), **silence-watch**
  (`silence-watch.md`), **foreign-events**, and **state** were all rescanned
  **2026-06-07 03:17 UTC** (queue 741).
- The **curated develop list** (`top-issues-to-develop.md`) was refreshed
  the **same day** against that scan. The previous edition was stale — it
  still read "latest published 2007" and led with the ADMP/PADU pick (A3)
  that has since shipped as **2008** — and that gap has been closed.
- The top of the raw queue remains dominated by single-word and calendar
  **stubs** ("budget 2027 presentation", "parliament session opens", "malay",
  "federal", "budget"). Per the curated file's own methodology these are
  attention noise-floors, **not developable** — rank order is not develop
  order.

## Status reconciliation (what shipped since the last curation)

| Prior pick | Topic | Now |
|------------|-------|-----|
| A3 | Algorithmic-accountability rulebook exempts the state (DPA/ADMP–PADU) | **Published `2008`** (brief `pdpa-admp-government-exemption.md`) |
| A1 (2026-06-04 list) | MACC RM548m freeze-access | **Published `2007`** (High Court refusal) |
| A3 (2026-05-17 list) | Statutory-body CEO squash-court bribe | **Published `2005`** |
| A5 | CCID RM1.47B investment fraud | **Published `2004`** |
| A4 | Bersatu termination of Suhaili (Art. 49A) | **Published `2000`** |
| B2 | KKM cost-saving under expenditure freeze | **Published `2001`** |

The silence-watch still echoes S1 (KKM) and S2 (Suhaili) because its dedup
filter keys off source text, not published-issue IDs — both are in fact
shipped (`2001`, `2000`). Treat them as done. S6 (MACC RM548m *appeal*)
echoes the published `2007` refusal; hold the appeal angle until the
appellate court acts.

## Fresh picks this cycle (the develop track)

Of today's silence-watch top 25, after removing published echoes, calendar
stubs, brief-adjacent items, 3R holds, and punditry, the genuinely new,
unbriefed, developable candidates are:

| # | Silent story | Silence | Importance | Status / action |
|---|--------------|--------:|-----------:|-----------------|
| S11 | **FAM did not table a budget for Congress approval since 2016 (AFC audit)** | 1.00 | 0.61 | **Top fresh pick.** No brief, document-anchored, most relatable item on file. → Tier A1. |
| S16 | **AG asks Federal Court to strip the Bar of standing on a DNAA** | 0.98 | 0.56 | Fresh, separation-of-powers, extends `1997`. Sub judice. → Tier A3. |
| S17 | State cannot ban lotteries on moral grounds (Court of Appeal) | 0.98 | 0.51 | Federalism ruling, live FC date 12 Aug. MEDIUM-HIGH 3R. → Tier B1. |
| S10 | APAD enforcement pushes Aeroline out of KL | 0.99 | 0.56 | Economic/mobility lens diversity, low risk. → Tier B2. |
| S21 | PharmD (Alexandria) not consulted with Pharmacy Board | 0.99 | 0.52 | Inter-agency coordination failure, Health lens. → Tier B3. |

MyIMMs (prior A1) carries forward as **Tier A2** — still unshipped,
unbriefed, and the only Technology-lens anger-at-process pick on the board.

## Selection criteria
- **Worthy × silent × not-in-codebase × relatable** — the cycle filter.
  Editorial leverage (curated ordering), not raw radar score.
- **Local-first, global fallback.** The Malaysia-impact channel is the
  standby when the domestic silence list runs dry; it does not this cycle
  (three local Tier A picks), so no global slot is developed. The impact pass
  did not run (no `ANTHROPIC_API_KEY`); the West Asia / Strait of Hormuz
  cluster in `foreign-events.json` is flagged for a manual pass next cycle.
- **3R load** (Race, Religion, Royalty) — critique policy, not communities;
  the verification bar is *higher* for 3R-adjacent claims.
- **Stage 5 escalation** (CLAUDE.md / ADR-0004): re-enable the Grok
  Contrarian stress-test when a brief marks Religion / Ethnic / Royalty risk
  HIGH+, marks Political risk CRITICAL with a sharp take, or when Stage 3
  `source_diversity_estimate` < 0.4 — flagged for B1 (Kedah lottery).
- **Don't re-develop** something already published or already briefed.
- **Lens diversity** across the next publish slots.

## Recommended development order (next 3 publish slots — Tue/Thu/Sat)

1. **A1 — FAM budget-tabling failure (silence S11).** Freshest, most
   relatable, document-anchored. Frame as the oversight gap (ten congresses,
   no budget tabled for approval), not as an allegation of misappropriation.
   **Keep the two claims separate**: AFC's budget-not-tabled-for-Congress
   finding vs the audited-accounts claim FAM denies. Governance / Economic
   lens. Pair via `related[]` with the FAM CAS brief for a governance arc.
2. **A2 — MyIMMs outage / NIISe delay.** Restores Technology lens (issues
   2000–2008 carry none). Frame as procurement delay and continuity risk;
   KDN rules out a breach, so no "hack" framing. Pair with `2008`
   (government-IT through-line).
3. **A3 — AG/Bar DNAA standing (silence S16).** Separation-of-powers,
   extends `1997`. Strictly the standing/reviewability contest; no claim on
   Zahid's guilt (a DNAA is neither). Legal lens. **Sub judice — handle with
   the higher live-matter care.**

This keeps lens diversity (Governance → Technology → Legal) and leads with
the pick that best satisfies all four filter terms at once.

Hold for guardrails rather than slotting by default:
- **B1 (Kedah lottery)** — MEDIUM-HIGH religious; division-of-powers framing
  only, consider Stage 5 re-enable.
- **B2 (Aeroline/APAD)** — develop if a Tier A slot frees; clean Economic
  lens.
- **S13 (MACC IJM probe)** — open investigation, no charges. Develop only
  once charges are filed.
- **S12 (alleged deviant-teaching detention)** — HIGH 3R (religious). Two
  independent primary sources or hold; critique detention process, not
  belief.

## Before drafting briefs
- Every quantitative claim surfaced here (RM548m, RM857,000, RM57.15m, the
  "<2/5" AFC scoring, the 3h45m outage) is a **radar signal, not a verified
  figure** — Phase 1 research must trace each to a primary source before it
  reaches a card. Drop any specific that cannot be traced.
- For A1: confirm the AFC scoring scale and the budget-vs-accounts
  distinction against the audit's own wording.
- For A3 and B1: gate the Stage 5 decision and publication on the
  `source_diversity` and two-primary-source checks; both touch live or
  3R-sensitive ground.

_Refreshed 2026-06-07 as the editorial-review companion to the same-day radar
scan; supersede on the next curator refresh._
