# ADR-0006: Simulation-engine encoding priority — P6+P7 first, P3 boundary events, rest deferred

**Status:** Accepted (2026-05-21)
**Related:** `docs/research/malaysia-political-simulation-engine.md` §1 (periodization), §10 (build order); ADR-0005 (event taxonomy).

## Context

The Phase 0 design doc identifies eight regime periods from ≈1400 to present. A naive interpretation of "encode all history" would suggest encoding every period in pass 1. This is wrong for three reasons:

1. **Source density collapses pre-1957.** Tier 1 sources (gazettes, court rulings, EC records) are scarce or absent for the sultanate and early colonial periods. Coding events at the same standard requires either lowering the standard (compromises the engine) or doing original archival research (out of scope).

2. **Mechanism calibration requires dense data, not deep data.** The seven mechanism modules (§5) need parameter estimates. Parameters are estimated from many observations of the same mechanism firing in similar contexts. The 2008–2026 period offers ≈800 codable events; the 1957–2007 period offers perhaps 200; pre-1957 perhaps 50 reliably. Calibration is dominated by the dense period.

3. **The engine's primary user-facing job is forward forecasting and current-context reasoning.** Backward extension is valuable for path-dependence analysis and counterfactual depth, but it is not the binding constraint on Phase 1 utility.

However, encoding **only** 2008–2026 has a known failure mode: the regime-state Markov chain (§4.7) needs the 10 critical-juncture transitions for calibration. Eight of those ten predate 2008 (1786 Pangkor, 1874, 1957, 1969, 1988, 1998, 2008 itself, 2018, 2020, 2022). Skipping the earlier ones leaves the regime-transition module with two data points, which is uncalibratable.

The resolution: encode the **dense block (2008–2026) in full** plus a **boundary set** — the specific events required to initialise the regime-state Markov chain and the constitutional-baseline state. Defer the rest to Phase 8.

## Decision

Phase 2 encoding scope is:

### Block A (full): 2008–2026 (regime periods P6 + P7)

- All elections (GE12, GE13, GE14, GE15; all state elections; all by-elections of political consequence).
- All constitutional amendments and Federal Court rulings of constitutional consequence.
- All royal interventions documented in primary sources.
- All trials of political figures with verdict (Najib SRC, Najib 1MDB, Zahid DNAA, Muhyiddin, Lim Guan Eng, etc.).
- All cabinet reshuffles and high-office appointments (PM, DPM, ministers, CJ, IGP, AG, MACC chief, BNM governor, EPF/PNB/Khazanah chiefs).
- All party defections, expulsions, founding events.
- All scandal revelations of national consequence (1MDB, SRC, LCS, Bestinet, ARM, etc.).
- All major coalition formations and dissolutions (PR, PH, PN, Muafakat Nasional, Unity Govt, GRS, etc.).
- All policy announcements at PM or full-cabinet level.
- All resource transfers documented in audit reports, court filings, or PAC reports.
- All major protests / mobilisations (Bersih series, Himpunan Rakyat, Daulat Tuanku rally, etc.).
- Demographic shifts at five-year granularity from the Department of Statistics.

Target: ≈800 events. Tier-source requirement per ADR-0005.

### Block B (boundary set): pre-2008 events strictly required for calibration

Eight critical-juncture events plus their immediate institutional context:

1. **1786 Penang cession** — single InstitutionalCreation event (Straits Settlements) for context; no full encoding.
2. **1874 Pangkor Engagement** — single ConstitutionalAmendment-equivalent for Resident system; minimal encoding.
3. **1957 Merdeka** — full encoding of the founding pact: Reid bargain, Article 153, Alliance formation, first cabinet, first parliament.
4. **1963 Malaysia formation** — MA63, Sabah/Sarawak inclusion, Singapore inclusion. Constitutional amendments encoded.
5. **1965 Singapore separation** — ConstitutionalAmendment, RoyalIntervention (Tunku-LKY).
6. **1969 May 13** — Protest cluster, RoyalIntervention (Emergency, NOC), regime-state transition.
7. **1971 NEP launch** — PolicyAnnouncement, ConstitutionalAmendment (Article 153 entrenchment 1971).
8. **1981 Mahathir succession** — ElitePersonnelChange of regime-defining magnitude.
9. **1988 Judicial Crisis** — InstitutionalCreation (constitutional amendment removing "judicial power" from Article 121).
10. **1998 Reformasi onset** — ElitePersonnelChange (Anwar sacking), ScandalRevelation cascade, Protest cluster.
11. **GE12 (2008)** — full Election encoding, since this is the threshold of Block A.

Boundary-set target: ≈80 events. These are sufficient for regime-Markov calibration; they do not pretend to be a complete record of those periods.

### Block C (deferred): everything else, Phase 8

P1 (sultanate), P2 (colonial), P3 (1957–1969 in full), P4 (1969–1998 in full), P5 (1998–2008 in full) are deferred. The 1957–2008 dense encoding is the highest-priority deferred work because it would enable mechanism back-validation. Pre-1957 encoding is open-ended and may never be done at full depth.

## Why this is sound

1. **Calibration density is preserved** — Block A has the events.
2. **Regime-transition module is implementable** — Block B has the junctures.
3. **Phase 1 utility is not gated on completing centuries of archival work** — the engine becomes useful at the end of Phase 7 with Blocks A + B.
4. **Back-validation remains possible later** — adding Block C (Phase 8) extends the calibration window backward; mechanism parameters can be re-estimated then.

## Consequences

- Phase 2 work has a definite scope (≈800 + ≈80 = ≈880 events).
- Pre-1957 historical narrative remains in the Phase 0 doc as *context*, not as data the engine computes over.
- Counterfactual queries that require pre-2008 state ("what if NEP had been needs-based from 1971?") return with `unidentifiability_flags: ["pre-2008 state under-encoded"]` until Phase 8 completes.
- Forecast outputs are unaffected — they depend on the dense block.

## Rejected alternatives

- **Encode everything at the same depth.** Rejected for the reasons in §Context.
- **Encode only 2018+ (the T4A corpus window).** Rejected because the 2008–2018 period contains GE12 and GE13 — the critical erosion of BN dominance — and skipping it leaves the engine unable to model the dominant-party decay that produced the 2018 alternation.
- **Encode 1957–present at the same depth.** Rejected because source density falls off a cliff before ≈1990, and the mechanism modules cannot be calibrated reliably on sparse data without inducing false precision.
