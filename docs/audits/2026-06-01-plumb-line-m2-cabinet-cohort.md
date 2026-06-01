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

---

## Step 3 (2026-06-01): A4 fiscal stewardship — attempted, deliberately deferred (a finding)

A4 was researched against the primary source (Auditor-General's Report, "sick" / critically-delayed 12MP projects, Treasury Circular PK 4.5 definition). It is **not** being scored this step, on accuracy grounds. Three blockers, in order of importance:

1. **Raw counts are not comparable across heterogeneous portfolios (misleading-framing risk).** The AG measure is a project count. Capital-intensive portfolios (Works, Rural Development, Transport) run hundreds of physical projects; a Communications ministry runs almost none. Scoring raw sick-project counts would penalise infrastructure ministers and flatter low-capital ones for reasons that have nothing to do with stewardship. That is cardinal sin #3 (misleading framing). A fair A4 needs a **size-normalised** measure — sick *rate* (sick ÷ the ministry's total 12MP projects) or sick-project *value* ÷ development allocation.
2. **The fair denominator is not cleanly sourceable.** The public breakdown gives counts only for the worst few ministries (Education 46, KKDW/Rural Development 34, Petra 12, KPKT 11 of 157 total across 18 ministries). Per-ministry *total* project counts — needed for a rate — are not in the available reporting; the headline totals themselves disagree (157 "sick" vs "3.6% of 9,355" ≈ 337), an unresolved contradiction.
3. **Partial population would be asymmetric and partisan.** The only cohort figure cleanly available is Zahid's KKDW (34). Recording an adverse A4 for the one minister who is already the A5 outlier, while the other four stay blank, would single him out on thin, non-comparable data. The symmetry gate exists to prevent exactly this.

**Decision:** A4 deferred until a size-normalised, symmetric measure (sick rate or execution rate per ministry) can be sourced for all five. The finding is recorded; nothing is scored.

### The larger finding this exposes — role class is too coarse for capital-intensity-sensitive dimensions

A single `cabinet-minister` class lumps a Works minister with a Communications minister. For conduct/structural dimensions (A5, C1, Layer B) that is fine. For **delivery dimensions sensitive to portfolio capital-intensity (A4, and partly A1 legislative volume and C2 governance scope)** it is not: the portfolios are not like-for-like, and normalisation corrects scale, not portfolio *type*. Options for M2/M3, for the user to weigh:

- **(a) Size-normalise the metric** (preferred for A4: sick rate, execution rate) — keeps one class, fixes the specific dimension.
- **(b) Portfolio-aware sub-comparability** — compare delivery dimensions only within capital-intensity bands, not across the whole class.
- **(c) Scope the dimension** — mark A4 applicable only where a comparable fiscal-delivery measure exists, N/A otherwise (disclosed like the jurisdiction gaps).

This does not block the conduct/structural spine (A5, C1, and a future Layer B), which remain comparable across the whole class.

---

## Step 4 (2026-06-01): the resolution — two-track scoring (the exceptional design)

Asked to choose the approach that makes the instrument exceptional rather than merely adequate, the answer is to do what no league table does: **refuse to blend incomparable things into one number.** Dimensions are split into two tracks (methodology `tracks`, builder, validator all updated):

- **Conduct & Structure (headline):** A2, A5, B1–B5, C1, C3 — comparable across any portfolio; carries the published rank; normalised across the whole role-class; the coverage floor is measured here.
- **Delivery (portfolio-relative):** A1, A3, A4, C2 — normalised only within portfolio bands (infrastructure / economic / social / administrative), size-normalised measures preferred; shown beside the headline, never folded in.

This simultaneously resolves all three earlier decisions: it adopts size-normalisation *and* portfolio-aware comparison for delivery (decision 1), it complements the jurisdiction-aware applicable set (decision 2), and it sidesteps the A4 unfairness without dropping the dimension. The A4 sick-project count, when sourced fairly as a rate, now has a principled home: the delivery track, compared only among infrastructure-band ministers.

**State after step 4:** the headline rank keys on conduct-track coverage. Cohort conduct coverage is 22–33% (A5 + C1 of 7–9 applicable), so all still **on file, not ranked** — correct. The clear path to the first published rank is now narrow and fair: **the Layer B conduct panel (B1–B5)**, which is cross-portfolio comparable and would take each minister from 2/7 to 7/7 conduct coverage. Build green, badge withheld, `published: false` throughout.

**The Layer B path, done the T4A way.** Layer B is subjective, so its integrity rests on the bias audit's two gates: inter-coder reliability (Krippendorff ≥ 0.667) and the partisan-signal test (coalition must not explain the editorial residual). These need **genuinely independent coders** — a single author cannot manufacture inter-coder reliability. The honest sequence: (i) write each B1–B5 score against a specific dated event with a citation (a first-coder pass), then (ii) obtain ≥2 further independent coders before the gate computes and any Layer B score is published. No Layer B score ships until that audit passes; until then the badge stays withheld and the conduct rank is reported on A5 + C1 + whatever Layer B has cleared.

---

## Step 5 (2026-06-01): the first-coder Layer B pass (Option A)

Executed the first-coder pass on the conduct panel for the whole cohort, with two structural guarantees added first so the work could not overstate itself:

**The coder-floor gate (`minCodersToScore: 3`).** A Layer B ordinal score now enters the scored composite and the coverage denominator ONLY once an independent panel of three has rated that exact item. A single-coder score is recorded, cited, and displayed as `on-file-provisional-single-coder` (with `codersOnFile`/`codersNeeded`), but never normalized, never counted toward ranking. One author cannot manufacture the inter-coder reliability the audit demands, so one author's score cannot move the board. This is the mechanism behind the promise that a first-coder pass changes nothing on the public surface.

**How the pass was produced.** Seven parallel researchers gathered dated, primary-attributable public-record events — facts, not scores — one per subject, against the same rubric, with explicit instruction to apply identical evidentiary standards to government and opposition and to treat "no qualifying event" as a valued answer. The author (coder 1) then assigned each anchor. Scoring discipline:

- **Record only a dimension with a specific dated, cited event.** B5 (3R restraint) returned "no documented instance" for every subject except Lee Hsien Loong (the Aug 2021 tudung easing, a documented dated de-escalation), so B5 was *omitted* for the rest rather than asserting an un-citable absence. This also keeps the source-coverage firewall honest.
- **No adverse extreme on un-openable sources.** WebFetch is blocked in this environment (search works, fetch returns 403), so no article full-text could be opened. Every anchor-0 the research surfaced (e.g. the BERNAS-monopoly retention, the Parliamentary Services Bill abstention) was softened to the neutral anchor; the only 4s are Lee Hsien Loong's, on uncontested tier-1 government records. Each leader carries a provenance caveat: single-coder, full-text not opened, primary-source reconfirmation required.
- **Neutrality check.** The resulting coder-1 distribution: PH ministers 2.0–2.5, BN (Zahid) 2.5, GPS (Nanta) 2.25, PN opposition (Hamzah) a flat 2.0, SG benchmark (Lee) highest at 3.4. No coalition is advantaged; the opposition figure sits at the neutral baseline, not below it. Government ministers edge higher only where they have documented *delivered* reforms — a structural feature of holding office, not a bias.

**State after step 5:** 43/43 recorded metrics carry a tier 1–3 citation. The bias audit's two data-dependent gates both report **Pending** — partisan-signal does not even fire on un-scored Layer B, and inter-coder reliability needs the panel — so the badge stays withheld. Conduct coverage is unchanged (22–33%): all seven remain **on file, not ranked**, exactly as the gate intends. The pass is a cited draft awaiting two more independent coders, not a measurement.

---

## Step 6 (2026-06-01): cohort expansion to key figures + the 'pardoned' status

Expanded the cohort with the Prime Minister and four senior portfolio ministers — **Anwar Ibrahim** (PM + Finance), **Saifuddin Nasution** (Home), **Mohamed Khaled Nordin** (Defence), **Fadhlina Sidek** (Education), **Dzulkefly Ahmad** (Health) — each with the objective spine (A5 + C1) and a provisional first-coder Layer B pass, produced by the same parallel-research, identical-standard, conservative-anchor method as step 5. Twelve subjects now on file; still **0 ranked** (conduct coverage 22–33%); **73/73** recorded metrics cited; both data-dependent gates **Pending**; badge withheld.

**The `pardoned` A5 status.** Anwar carries a 1999 corruption conviction and a 2015 conviction, both remitted by a **full royal pardon (16 May 2018, Pardons Board)**. The vocabulary offered only `convicted` (0.0) or `none-on-record` (1.0); either would be a distortion — scoring a sitting PM 0.0 on a pardoned 25-year-old matter is misleading framing, erasing it is underclaim. Added a published, identical-for-all `pardoned` status at **0.7**: below `discharged`/DNAA (0.85, which enters no conviction) because a conviction historically occurred, but above the unresolved states because clemency is a final, favourable resolution. It records factual status, never a re-litigation of guilt; the scalar is a flagged, adjustable methodology choice (`methodology.validity` A5 `pardonedRule`).

**Attribution discipline held on the new A5s.** Three ministers (Saifuddin, Fadhlina, Dzulkefly) have defamation matters — Saifuddin a civil loss from political speech (under appeal), the other two as plaintiffs who won retractions. None is a corruption/integrity matter, so all are `none-on-record` with the court matter disclosed as context, never scored against them. Khaled is the *responding* minister in the military-procurement probe, not a subject — guilt by association excluded.

**Neutrality across 12 subjects.** Coder-1 Layer B anchors track documented delivery and tenure, not coalition: PH spans 2.0–2.8 (Anwar and Saifuddin highest, on gazetted reforms), BN 2.25–2.5, GPS 2.25, PN opposition a flat 2.0, the SG benchmark highest at 3.4. The only 4s sit on tier-1 primary-sourced delivery (Anwar's three fiscal reforms; the benchmark's). No coalition is advantaged; the opposition figure sits at the neutral baseline, not below it.

---

## Step 7 (2026-06-01): full federal cabinet completed — 33 subjects

Completed the comparability class: all **31 full ministers** of the Anwar unity government are now on file, alongside the opposition leader and the Singapore benchmark (**33 subjects**). Built in three waves off a verified current roster (which surfaced the 16–17 Dec 2025 reshuffle):

- **Waves A / B (long-serving, full pass):** Fadillah (PETRA), Mohamad Hasan (Foreign), Zambry (Higher Ed), Gobind (Digital), Nga (Housing), Azalina (Law), Tiong (Tourism), Steven Sim (Human Resources), Johari (Plantation), Hannah Yeoh (Youth), Armizan (Domestic Trade), Chang (MOSTI), Nancy Shukri (Women), Aaron Dagang (Unity) — objective spine + provisional first-coder Layer B, same method and discipline as the earlier cohort. Ministers moved in the Dec 2025 reshuffle were assessed in their substantial prior portfolio.
- **Wave C (Dec-2025 newcomers, spine only):** Akmal (Economy), Arthur Kurop (NRES), Noraini (Plantation), Ramanan (Human Resources), Taufiq Johari (Youth), Mustapha Sakmud (Sabah/Sarawak Affairs), Zulkifli Hasan (Religious Affairs) — A5 + C1 only, **Layer B deferred**: each has held the portfolio ~5 months, too short for a fair conduct record, so manufacturing conduct scores would be dishonest.

**Edge cases handled honestly:** A5 stayed `none-on-record` wherever the matter belonged to a predecessor's deal (Akmal/Arm), a subordinate (Arthur/DOE officials), a family member or associate, or was a civil/plaintiff matter (Ramanan's NFA'd civil suit; Hannah Yeoh's MACC-cleared spousal contract; several plaintiff defamation suits) — never guilt by association. **Zulkifli Hasan** is a non-partisan technocrat Senator with no party bloc, so C1 (coalition pivotality) is *undefined* and left unrecorded rather than imputed.

**Neutrality across all 33 (the decisive test):** mean provisional Layer-B score by coalition —

| Bloc | n | mean B |
|---|--:|--:|
| DAP (PH) | 5 | 2.65 |
| UMNO (BN) | 6 | 2.53 |
| PKR (PH) | 5 | 2.40 |
| AMANAH (PH) | 2 | 2.38 |
| PDP (GPS) | 1 | 2.33 |
| PBB (GPS) | 4 | 2.25 |
| GRS | 1 | 2.25 |
| PN (opposition) | 1 | 2.00 |
| PAP (SG benchmark) | 1 | 3.40 |

Government blocs span just 2.25–2.65 and the opposition sits at the 2.00 neutral baseline — the variation is narrow and tracks *documented delivery*, not party. A governing-vs-opposition or BN-vs-DAP tilt would show here; none does.

**State after step 7:** 167/167 recorded metrics carry a tier 1–3 citation; both data-dependent audit gates **Pending**; badge withheld; **all 33 on file, not ranked** (no conduct track clears the coverage floor on a single coder). The instrument now has a complete, fairly-built, fully-cited cabinet class awaiting the one remaining step to a published rank: ≥2 further independent coders on the Layer B panel. `published: false` throughout.

---

## Step 8 (2026-06-01): regional benchmarks added — 35 subjects

Added two ASEAN-peer reference heads of government beside Lee Hsien Loong, so the benchmark set brackets the scale rather than resting on a single high anchor: **Joko Widodo** (Indonesia, 2014–2024) and **Ferdinand Marcos Jr** (Philippines, 2022–). Each carries A5 + a provisional first-coder Layer B; C1/C2 are left unrecorded (jurisdiction-specific structural dimensions not computed without each chamber's seat math). `benchmark: true`, not part of the ranked Malaysian class.

The benchmarks now span the range honestly:

| Benchmark | A5 | Layer B (provisional) |
|---|---|---|
| Lee Hsien Loong (SG) | none-on-record | B1 3, B2 4, B3 3, B4 3, B5 4 |
| Joko Widodo (ID) | none-on-record | B1 2, B2 3, **B3 1**, B4 2 |
| Ferdinand Marcos Jr (PH) | **convicted** | B1 2, B2 3, B3 2, B4 2 |

Two firsts for the instrument, both well-sourced and intended:
- **First sub-2 Layer B score** — Jokowi B3 = 1, on the uncontested, tier-1-documented institutional erosion (the 2019 KPK-law gutting; the 2023 Constitutional Court manoeuvre for which the Chief Justice was officially found guilty of an ethics violation). The instrument can register a documented negative, not only cluster at 2–3.
- **First `convicted` A5** — Marcos Jr, on his final 1995 tax-non-filing conviction (a fine, COMELEC-ruled non-disqualifying), recorded as factual status with the nature stated.

**Methodology observation worth flagging:** the A5 scalar is severity-blind — `convicted` is 0.0 regardless of offence, so Marcos's minor tax-filing conviction (0.0) scores *below* Zahid's 47-charge corruption DNAA (`discharged`, 0.85). That ordering is internally consistent (a final conviction is a heavier adjudicated status than dropped-without-conviction charges), but it can mislead on apparent severity. A future refinement could weight `convicted` by offence class; for now the justification text carries the nuance the scalar cannot.

**State after step 8:** 35 subjects (32 entries + 3 benchmarks); 177/177 recorded metrics carry a tier 1–3 citation; both data-dependent gates Pending; badge withheld; all 35 on file, not ranked. `published: false` throughout.
