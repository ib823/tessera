# The Plumb Line — M2 step 1: cabinet-minister cohort

*Dated, immutable. 2026-06-01. Methodology v0.2.0 (framework). All subjects `published: false`.*

M2 is the first milestone that can produce *real rankings*, because a comparability class with enough members lets the dimensions normalize. This record covers step 1: standing up a balanced cabinet-minister cohort and populating the one dimension verifiable to primary sources for all five today (A5 integrity status). It deliberately stops short of publishing any rank — see the decision point at the end.

## The cohort (five blocs, all elected MPs, all appointed 3 Dec 2022)

Chosen for non-partisan balance (one minister from each main unity-government bloc), continuous stable tenure, and obtainable records.

| Minister | Portfolio | Party (coalition) | A5 status |
|---|---|---|---|
| Anthony Loke Siew Fook | Transport | DAP (PH) | none-on-record |
| Fahmi Fadzil | Communications | PKR (PH) | none-on-record |
| Mohamad Sabu | Agriculture and Food Security | AMANAH (PH) | none-on-record |
| Ahmad Zahid Hamidi | DPM; Rural and Regional Development | UMNO (BN) | **discharged** (DNAA) |
| Alexander Nanta Linggi | Works | PBB (GPS) | none-on-record |

Plus the two M1 subjects already on file: Hamzah Zainudin (opposition frontbencher) and Lee Hsien Loong (benchmark).

### Currency checks that changed the plan (June 2026)
- **Saifuddin Nasution** (first PKR candidate) is a *Senator*, not an elected MP — dropped for comparability; replaced by Fahmi Fadzil.
- **Nik Nazmi** and **Rafizi Ramli** resigned from cabinet and Parliament in May 2026 — not eligible.
- **Nanta Linggi** additionally took Entrepreneur Development and Cooperatives in the Dec 2025 reshuffle; his Works tenure is the continuous one scored.
- **Zahid**: DNAA on all 47 Yayasan Akalbudi charges (4 Sept 2023); AGC took no further action (8 Jan 2026); his full-acquittal bid was adjourned (24 Feb 2026) pending the Malaysian Bar's judicial-review appeal. Current factual status: **discharged**, not acquitted, not convicted. The A5 attribution rule (v0.2.0) records status only, never a verdict.

## Pipeline outcome

```
validate-leaderboard : PASS (v0.2.0, 7 leaders, 0 errors)
build-leaderboard    : ranked 0 · on file 7 · composite withheld
audit-scoreboard     : source-coverage 9/9 cited ; partisan-signal + inter-coder PENDING ; badge WITHHELD
```

A5 now has a peer set of 7, so for the first time a dimension actually normalizes across subjects (M1 could not — every peer set was below `minPeerSetSize`). This proves the multi-subject scoring path end-to-end on real, cited data.

## Two findings

1. **Malaysian data-availability ceiling.** Several dimensions are structurally hard or impossible to source for Malaysian subjects: per-MP **attendance** (A2) is not published by Parliament, and machine-readable **division/co-sponsorship records** (C3) do not exist. Because coverage is `covered ÷ applicable` and these dimensions remain *applicable but uncovered*, Malaysian ministers face a structural coverage drag that foreign benchmarks with open parliamentary data do not. This is the central obstacle to ranking them and it is a transparency problem in the source jurisdiction, not a flaw to paper over.

2. **Peer-normalizing a status scalar distorts it.** A5 maps status to an absolute scalar (none-on-record/declared/acquitted = 1.0, discharged = 0.85, charged = 0.5, convicted = 0.0). With six subjects at 1.0 and one at 0.85, min-max normalization slams the lone discharge to **0** — far harsher than the 0.85 the scale intends. Status and ordinal (Layer B) dimensions are absolute by construction; peer-normalizing them manufactures a gap that is not in the data. **Recommendation:** score status-scalar and ordinal dimensions on their absolute scale (×100), reserving peer normalization for count/rate dimensions (LES, attendance rate, budget execution). This needs a methodology decision before any A5 score is published.

## Decision point — what it takes to publish a rank (needs your call)

To move a Malaysian minister above `minCoverageToRank` (50% of applicable dimensions) we need roughly 7 of 13 covered. Realistically obtainable to primary sources:

- **C1 pivotality** — Shapley-Shubik on actual seat counts. Computable, but needs an exact, verified Dewan Rakyat composition (sources vary by 1–2 seats); deferred until computed carefully rather than shipped approximate.
- **A4 fiscal stewardship** — per-ministry findings from the Auditor-General's Report. Obtainable but attribution-sensitive (a "sick project" is not automatically the minister's fault).
- **A1 legislative output** — bills piloted through the Dewan Rakyat, from Hansard. Laborious.
- **Layer B (B1–B5)** — five ordinal dimensions, but the audit's inter-coder gate needs **≥3 coders**; a single coder cannot satisfy Krippendorff's alpha.

The open questions for you:
1. **Reach ranking via objective layers only** (A + C: pursue C1/A4/A1 to clear 50% on the bias-resistant objective composite), or **stand up the Layer B editorial panel** (≥3 coders) so the full instrument is exercised?
2. **How to treat the Malaysian data ceiling** — accept that several MY subjects stay "on file" until data exists, or make `applicable` jurisdiction-aware (exclude structurally-unpublished dimensions from the denominator, with the risk that this looks like gaming)?
3. **Adopt the absolute-scalar fix** for A5 and Layer B before any score is published?

Nothing flips to live until these are settled and you approve. The cohort and the A5 spine are committed as reviewable groundwork.

---

## Step 2 (2026-06-01, same day): decisions actioned — jurisdiction-aware applicability + C1 pivotality

Following the three decisions (path: build both in parallel; coverage: jurisdiction-aware applicable set; scalar fix: decide later), two were actioned immediately:

**Jurisdiction-aware applicability (decision 2).** `methodology.validity.jurisdictionDataGaps` now lists, per country, the dimensions that jurisdiction never publishes data for. For Malaysia: **A2** (no per-member attendance/division records) and **C3** (no machine-readable division network). These are excluded from scoring AND the coverage denominator for Malaysian subjects, but **disclosed** on every affected leader's detail (`status: "excluded-jurisdiction"` with the reason), never silently dropped. Malaysian cabinet applicable dimensions drop from 13 to 11; the Singapore benchmark is unaffected. The guardrail in the config is explicit: only dimensions the *whole jurisdiction* never publishes qualify — a leader simply lacking a record stays an honest coverage gap.

**C1 pivotality (objective layer, the safe first step on the data path).** Computed by the committed, reproducible `scripts/compute-pivotality.mjs`: Shapley-Shubik over the seven Dewan Rakyat blocs (GE15, quota 112/222). Coalition-level, because coalition totals are unambiguous whereas per-party tallies carry a 1–2 seat contradiction immaterial to the index. Contradiction noted and resolved: PH was 81 on polling night (Padang Serai postponed), 82 after the 7 Dec 2022 by-election; we use 82, the figure that held through the scored period.

| Bloc | Seats | SS index | Cohort member(s) |
|---|---:|---:|---|
| PH | 82 | 0.4048 | Loke, Fahmi, Mohamad Sabu |
| PN | 74 | 0.2214 | (Hamzah, opposition) |
| BN | 30 | 0.2214 | Zahid |
| GPS | 23 | 0.0714 | Nanta |

A third finding falls out of this: **BN (30 seats) holds exactly the same power index as PN (74 seats)** — 0.2214. Pivotal power is not seat count. This is precisely why C1 is a distinct dimension and is flagged non-normative in the methodology.

**State after step 2:** coverage rises to 2 covered dimensions each (A5 + C1) — 18% for ministers (of 11), 25% for Hamzah (of 8), 15% for the benchmark (of 13, no exclusions). All still **on file, not ranked**: reaching 50% needs roughly four more objective dimensions (A1 legislative, A3 pledge, A4 fiscal, C2 governance) and/or the Layer B panel. Build green, badge withheld, everything `published: false`.

**Remaining work on the path to a first published rank:** A4 (Auditor-General per-ministry findings), A1 (bills piloted, Hansard), C2 (domain-scoped governance per portfolio), A3 (manifesto pledge coding), and the ≥3-coder Layer B panel. Each is a separate, carefully-sourced step — no living-minister score will be rushed to force a ranking.
