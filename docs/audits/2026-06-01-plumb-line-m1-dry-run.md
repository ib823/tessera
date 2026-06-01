# The Plumb Line — M1 dry-run record

*Dated, immutable. 2026-06-01. Methodology v0.1.0 → v0.2.0.*

M1 scores the first real subjects end-to-end to measure the per-leader labour cost and to stress-test the M0 framework against reality before any board goes live. Two subjects, both kept `published: false`, board `status: framework`. The point of M1 was never to rank these two; it was to find out what breaks when you feed the instrument real, cited data.

## Subjects

| Subject | Role class | Scored period | Why chosen |
|---|---|---|---|
| **Hamzah Zainudin** | opposition-frontbench | Leader of the Opposition, Dewan Rakyat, Dec 2022 – Apr 2026 (closed) | The hardest harmonization case: most governing-centric dimensions do not apply. His Opposition-Leader tenure is a *closed* period, ideal for period-based scoring. |
| **Lee Hsien Loong** | head-of-government | PM of Singapore, Aug 2004 – May 2024 | Calibration benchmark. Rich, well-documented public record; a different role class, which exposes the cross-class comparison problem. |

A live-fact check during research changed the framing: **Hamzah ceased to be Opposition Leader in May 2026** (sacked by Bersatu 13 Feb 2026, resigned the post in April, replaced by Ahmad Samsuri Mokhtar on 16 May 2026). He remains the elected Member for Larut. The scored period was set to his closed Opposition-Leader tenure accordingly.

## What was recorded (every datum cited to a primary or named source)

**Hamzah Zainudin** — 1 metric on file:
- `A5` integrity → status **none-on-record**. No personal corruption charge or conviction of record. The 2024–2025 graft cases involve his former political secretary and, separately, his son — *not the leader*. Source: Malay Mail, "Former political secretary to Hamzah Zainudin goes on trial Aug 25 over RM350,000 graft charges", 2025-08-08 (tier 2, named outlet).

**Lee Hsien Loong** — 3 metrics on file:
- `C2` governance → **100** (Government Effectiveness percentile, 2023). Source: World Bank Worldwide Governance Indicators, GE.PER.RNK, Singapore (tier 1).
- `C1` pivotality → **1.0**. A lone majority party (PAP, 83 of 93 elected seats after GE2020) is the pivot in every coalition ordering; Shapley-Shubik index 1.0. Source: Elections Department Singapore, 2020 result (tier 1).
- `A5` integrity → status **none-on-record**. No personal charge or conviction; the 2017 38 Oxley Road matter was a family-property dispute addressed in Parliament with no abuse-of-power finding. Source: PMO Singapore ministerial statement, 2017-07-03 (tier 1).

## Three findings that became methodology v0.2.0

1. **Guilt-by-association is an overclaim risk → A5 `attributionRule`.** Hamzah personally faces no charge; his ex-secretary and son do. Recording their cases against him would be a defamation-grade overclaim. v0.2.0 adds an explicit A5 rule: the dimension records the *subject's own* status only; a matter involving staff, family, an associate, or a party colleague is never the leader's status. Default for a clean record is `none-on-record`, scored identically to `acquitted`/`declared` (no penalty for the absence of wrongdoing).

2. **Normalizing tiny peer sets is meaningless → `validity.minPeerSetSize = 3`.** With one value in a dimension's applicable peer set, rank-normalization returns 0 — so Singapore's 100th-percentile governance would have displayed as **0**. v0.2.0 refuses to normalize a dimension whose peer set has fewer than three defined values; it is marked `insufficient-peer-set` and excluded from the composite, never scored as zero.

3. **A governing-centric index under-serves opposition figures → `validity.minCoverageToRank = 0.50`.** Of 13 dimensions, only 10 apply to an opposition frontbencher, and most of those (legislative *enactment*, fiscal stewardship, governance indicators) presume executive office. Applying the index anyway would emit a misleadingly low number. v0.2.0 publishes a composite and rank only when at least half a leader's applicable dimensions carry a valid normalized score; otherwise the leader is listed as *on file, not yet rankable*, with cited raw metrics shown and an explicit reason.

The net effect: the instrument now **refuses to publish a misleading score rather than emit a false-precise one.** Both M1 subjects came out `ranked: false` — the correct result for a two-person, two-class cohort.

## Pipeline outcome

```
validate-leaderboard : PASS (v0.2.0, 2 leaders, 0 errors)
build-leaderboard    : ranked 0 · on file 2 · composite withheld
audit-scoreboard     : source-coverage 4/4 cited ; other gates pending ; badge WITHHELD
```

## Labour-cost observation (the real M1 deliverable)

The binding cost is not arithmetic; it is *verification and the discipline of N/A*. For the opposition subject, almost all effort went into confirming what could **not** be claimed: that associates' charges are not his, that per-MP attendance is not published, that an opposition member cannot be scored on enactment or budget execution. A defensible single-subject profile is roughly a half-day of primary-source work, and most of it produces honest gaps rather than numbers. This is sustainable for a curated top-cohort, not for a large automated roster — which validates the milestone sequencing.

## Recommendations for M2

1. **Assemble a full comparability class before publishing any score.** Cross-class, N=2 cannot rank. Target ≥5 within one class (e.g. cabinet ministers) plus benchmarks, so peer sets clear `minPeerSetSize`.
2. **Add opposition-appropriate dimensions** (parliamentary scrutiny: questions tabled, PAC/committee work, oversight motions) before scoring opposition figures, or the index will keep under-covering them.
3. **Stand up the Layer B editorial panel properly** (≥3 coders) so inter-coder reliability can actually be computed; M1 recorded zero Layer B metrics by design.
4. **Resolve the per-MP attendance data gap** (A2): the Malaysian Parliament does not publish reliable per-member attendance, so A2 may be structurally N/A for Malaysian subjects — decide whether to drop it or source an alternative.
