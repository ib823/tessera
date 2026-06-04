# Pipeline Recommendation — Editorial Review of Radar Top Issues

_Editorial-review companion to the radar's curated develop list
(`radar/output/top-issues-to-develop.md`). This is the `editorial review`
step in the documented flow: `radar scan → issue-queue.json +
silence-watch.md → top-issues-to-develop.md → editorial review → publish
pipeline`. The radar does not write issues; this note recommends which
curated candidates enter the 10-phase publish flow, in what order, and
with what guardrails. Nothing here is published._

## Data-freshness (now in sync)

- The **raw queue** (`issue-queue.json`), **silence-watch**
  (`silence-watch.md`), and **state** were all rescanned **2026-06-04
  04:12 UTC** (queue 721).
- The **curated develop list** (`top-issues-to-develop.md`) was refreshed
  the **same day** against that scan. The previous edition was stale —
  it still read "latest published 1991" while the repo had reached
  **2006** — and that gap has been closed.
- The top of the raw queue remains dominated by single-word and calendar
  **stubs** ("budget 2027 presentation", "parliament session opens",
  "malay", "federal", "macc", "pas", "umno"). Per the curated file's own
  methodology these are attention noise-floors, **not developable** —
  rank order is not develop order.

## Status reconciliation (what shipped since the last curation)

Five candidates from the 2026-05-17 list and its silence-watch picks have
been published; they are removed from contention:

| Prior pick | Topic | Now |
|------------|-------|-----|
| A3 | Statutory-body CEO squash-court bribe | **Published `2005`** |
| A5 | CCID RM1.47B investment fraud | **Published `2004`** (BNM mule-account framing) |
| A4 | Bersatu termination of Suhaili (Art. 49A) | **Published `2000`** |
| B2 | KKM cost-saving under expenditure freeze | **Published `2001`** |
| B4 | Malaysia–West Asia trade −30.4% | **Published `1996`** |
| A1 | Isa Samad Federal Court stay | **Dropped** — `1992` already covered the same sitting; park the `isa-samad-...` brief unless the actual set-aside ruling lands |

The silence-watch still echoes S1 (KKM) and S2 (Suhaili) because its
dedup filter keys off source text, not published-issue IDs — both are in
fact shipped (`2001`, `2000`). Treat them as done.

## Fresh picks this cycle (the develop track)

Of today's silence-watch top 25, after removing published echoes, calendar
stubs, brief-adjacent items, 3R holds, and punditry, the genuinely new,
unbriefed, developable candidates are:

| # | Silent story | Silence | Importance | Status / action |
|---|--------------|--------:|-----------:|-----------------|
| S8 | **MACC to appeal refusal to freeze access to RM548m** | 0.99 | 0.54 | **Top fresh pick.** No brief, court-record story, low defamation risk. → Tier A1. |
| S11 | **JAS: 5,000+ inspections, 3,149 actions, RM4.59m fines** | 0.97 | 0.56 | Fresh, denominator-rich, low 3R, Environmental lens diversity. → Tier A2. |
| S3 | Sabah 40% revenue stay-application ruling | 0.99 | 0.51 | In-flight brief exists; `1981` already covered the stay. **Finish only if the ruling is a new outcome, else retire.** → Tier B1. |
| S17 | MACC probes two individuals re IJM takeover | 0.95 | 0.41 | Open investigation, no charges. **Hold for charges.** → Tier B2. |

## Selection criteria
- **Editorial leverage** (curated ordering), not raw radar score.
- **3R load** (Race, Religion, Royalty) — critique policy, not communities;
  the verification bar is *higher* for 3R-adjacent claims.
- **Stage 5 escalation** (CLAUDE.md / ADR-0004): re-enable the Grok
  Contrarian stress-test when a brief marks Religion / Ethnic / Royalty
  risk HIGH+, marks Political risk CRITICAL with a sharp take, or when
  Stage 3 `source_diversity_estimate` < 0.4.
- **Don't re-develop** something already published or already briefed.
- **Lens diversity** across the next publish slots.

## Recommended development order (next 3 publish slots — Tue/Thu/Sat)

1. **A1 — MACC RM548m freeze-access appeal (silence S8).** Cleanest fresh
   pick: no brief, court record, low 3R, denominator-anchored (RM548m).
   Frame as the asset-preservation / recoverability gap during a live
   investigation, not as an allegation against any named party. Governance
   / Legal lens. Pairs via `related[]` with `2005`, `1990`, `1992`.
2. **A2 — JAS environmental enforcement (silence S11).** Restores lens
   diversity (issues 2001–2006 carry no Environmental slot). Frame as the
   enforcement-yield question — RM4.59m across 3,149 actions — not a moral
   panic. Environmental / Governance lens. Optionally fold in the
   carried-over Terengganu oil-spill EQA angle.
3. **Resolve B1 — Sabah 40% revenue (silence S3).** Confirm whether the
   stay-application ruling is a genuinely new outcome beyond what `1981`
   framed. If yes, finish the in-flight brief (Governance lens, MEDIUM-3R
   federal-state framing); if no, formally retire the brief so the
   silence-watch stops re-surfacing a covered case.

This keeps lens diversity (Governance/Legal → Environmental → Governance)
and avoids stacking two MACC pieces back-to-back by leading A1 with the
freeze-access angle and parking the IJM probe (B2) until charges.

Hold for guardrails rather than slotting by default:
- **B2 (MACC IJM probe)** — open investigation, no charges. Develop only
  once charges are filed; name only what is on the public record.
- **S19 (alleged deviant-teaching detention)** — HIGH 3R (religious).
  Two independent primary sources or hold; critique detention process,
  not belief.
- **Penang temple open-house halt (prior A2)** — still uncovered but not
  surfaced this cycle. 3R-gated: develop only with Stage 5 re-enabled and
  the JHEAIPP order text in hand, or hold.

## Before drafting briefs
- Every quantitative claim surfaced here (RM548m, RM4.59m / 3,149 actions,
  the 40% entitlement) is a **radar signal, not a verified figure** —
  Phase 1 research must trace each to a primary source before it reaches a
  card. Drop any specific that cannot be traced.
- For S19 and the Penang temple carry-over: gate the Stage 5 decision and
  publication on the `source_diversity` and two-primary-source checks.

_Refreshed 2026-06-04 as the editorial-review companion to the same-day
radar scan; supersede on the next curator refresh._
