# FALLBACK Pool Audit — 2026-05-17

Comprehensive primary-source verification of T4A's 40-issue FALLBACK
rotation pool against CLAUDE.md's Accuracy Standard.

## Process

1. **Batch 1** (5 issues): manual verification with full briefs at
   `engine/briefs/{slug}.md`.
2. **Batch 2** (29 issues): four parallel general-purpose verification
   agents, each handling a topical group (financial/corruption,
   governance/law, social/health, 3R-adjacent), reporting back compact
   per-issue findings. Agents instructed to "lean UNPUBLISH per CLAUDE.md
   when in doubt".

## Outcome

| Category | Count | Action |
|---|---:|---|
| Verified (KEEP) | **0** | n/a |
| Cardinal-sin UNPUBLISH | 31 | `published: false` |
| Real phenomenon, unsourced specifics (SOFTEN) | 9 | `published: false` pending rewrite |
| **Total fail** | **40 of 40** | rotation pool emptied |

The fallback rotation file `src/data/fallback-rotation.ts` now lists no
issues per week. The pool will rebuild as verified content is added.

## Most damaging findings (cardinal-sin OVERCLAIM, not just unverified)

These are not LLM-confabulated specifics on real topics — they are
factual reversals or fabricated institutions:

- **1120** "Malaysia governance score dropped 8 points in 3 years"
  → Reversed. CPI actually 47→50 (improvement), OBI 48→51 (improvement).
  Transparency International + IBP data both contradict.

- **1018 + 1165** "1MDB recovery only 38%"
  → Off by half. MACC officially reports 74.5% recovery (RM31.3B of
  ~RM42B) as of 2025 — Malay Mail 2026-05-06 citing MACC chief.

- **1074** "MRT3 RM23B awarded without competitive tender"
  → Reversed. MRT3 went through MRT Corp open tender from 2022;
  total cost ~RM31B per The Edge.

- **1950** "Online Safety Act creates Digital Safety Commissioner
  with RM180M budget"
  → Fabricated institution. The Act creates no such commissioner;
  enforcement is by MCMC, with an Online Safety Committee and Appeal
  Tribunal. RM180M figure unsourced.

- **1675** "5.8× ethnic profiling stops, per 2025 University of Malaya
  criminology study"
  → Fabricated study. No such study located. Cited authors, journal,
  DOI all absent.

- **1100** "47 containers of sanctioned goods cleared without inspection
  at Port Klang"
  → Contradicted. Bernama: Customs achieves 100% scanning of inbound
  containers at West Port using 5 high-capacity scanners.

- **1662** "Credit Suisse 2025 Global Wealth Report"
  → Defunct publisher. Credit Suisse was acquired by UBS in 2023.
  The 2025 wealth report would be a UBS publication.

- **1364** "Youth unemployment 10.8% in Q4 2025"
  → Contradicted by DOSM. Actual Q4 2025 figure ≈ 10.1%, Q1 2026 ≈ 9.8%.
  The "388,000 unemployed" claim conflates 15-24 vs 15-30 age bands.

- **1471** "52,000 of 170,000 opioid users receive treatment"
  → Contradicted by UNAIDS. Malaysia >85,000 enrolled in OST,
  reached 70% coverage 2017-2021 — the issue framing implies under-
  treatment that is the opposite of the documented trajectory.

- **1471** "France OST community pharmacies reaching 180,000 since 2018"
  → Dates wrong. France has dispensed buprenorphine via pharmacies
  since 1996, not 2018.

- **1879** "3 suspects arrested in Penang Feb 2026, 1.2kg enriched
  uranium, Central Asia origin"
  → Specific event not located in any news outlet. Also: claim that
  "Malaysia ratified IAEA Additional Protocol 2023" is wrong — Malaysia
  signed in 2005.

## All 40 issues — verdicts

### Batch 1 (manually verified, briefs at engine/briefs/)

| ID | Action | Brief |
|---|---|---|
| 1170 | UNPUBLISH | bumiputera-contract-quota-ali-baba.md |
| 1581 | UNPUBLISH | orang-asli-kelau-dam-resettlement.md |
| 1641 | UNPUBLISH | tamil-schools-budget-allocation.md |
| 1262 | UNPUBLISH | syariah-civil-jurisdiction-clash.md |
| 1549 | UNPUBLISH | orang-asli-royal-belum-blockade.md |

### Batch 2 (agent-verified — see this audit for compact findings)

**Governance/law — 8 issues:**
| ID | Action | Key issue |
|---|---|---|
| 0142 | UNPUBLISH | CMA amendment date and Section 14A unverified |
| 0150 | SOFTEN | OSA classification real; specific RM/count unsourced |
| 0165 | SOFTEN | No campaign finance law verified; RM1.2-2.5B unsourced |
| 1120 | UNPUBLISH | Cardinal-sin REVERSAL (CPI/OBI improved, not declined) |
| 1248 | UNPUBLISH | 1,337 inmates verified; Amnesty/186 numbers contradicted |
| 1288 | UNPUBLISH | 600/76% figures unsourced |
| 1315 | SOFTEN | NSC Act statutory framework verified; "4 times" unsourced |
| 1327 | UNPUBLISH | 2025 Federal Court case and detainee profile unverified |

**Social/health — 8 issues:**
| ID | Action | Key issue |
|---|---|---|
| 0179 | SOFTEN | Stateless-children phenomenon real; specific 40k/90% unsourced |
| 1364 | UNPUBLISH | DOSM contradicts the 10.8% / 388k figures |
| 1401 | UNPUBLISH | SKM/degree wage figures + MIHRM survey + Swiss comparator unsourced |
| 1435 | SOFTEN | PPP debate real; RM4.5B/3-projects/15-30% premium unsourced |
| 1471 | UNPUBLISH | UNAIDS contradicts 52k/170k; France dates wrong |
| 1511 | UNPUBLISH | 35%/420 trade points and 15% DVS cut unsourced |
| 1520 | UNPUBLISH | "Health budget transparency 42/54" index does not exist |
| 1564 | UNPUBLISH | DOE headcount and budget specifics unsourced; Singapore comparator off |

**Financial/corruption — 8 issues:**
| ID | Action | Key issue |
|---|---|---|
| 0154 | SOFTEN | PAC LCS facts verified; "340% incursion" unsourced |
| 1018 | UNPUBLISH | Cardinal-sin REVERSAL (38% vs MACC's 74.5%) |
| 1049 | UNPUBLISH | RM5.4B Sabah missing fund untraceable |
| 1067 | SOFTEN | OSA classification verified; RM18B/RM7.2B/30-year specifics misattributed |
| 1074 | UNPUBLISH | Cardinal-sin REVERSAL (MRT3 was tendered, not direct-negotiated) |
| 1100 | UNPUBLISH | Bernama: Customs achieves 100% scanning at West Port |
| 1165 | UNPUBLISH | Same as 1018 — 38% vs 74.5% |
| 1227 | UNPUBLISH | 342 appointees / RM680M / 87% no-qualification all unsourced |

**3R-adjacent — 11 issues:**
| ID | Action | Key issue |
|---|---|---|
| 1239 | UNPUBLISH | Forbes 2025 actual ~US$90B contradicts RM412B claim |
| 1283 | UNPUBLISH | UNHCR contradicts 102k → actual 126k Rohingya registered |
| 1389 | UNPUBLISH | 17 schools / 12,000 students figures unsourced |
| 1603 | UNPUBLISH | 1.3M students ≈ 2× actual vernacular-school enrolment (~580k) |
| 1604 | UNPUBLISH | 17 demolitions / 4-injunction / 3,200 untitled-temple counts unsourced |
| 1606 | SOFTEN | Indira Gandhi 2018 ruling verified; "14 unilateral conversions" mis-cites 13 co-plaintiffs |
| 1653 | SOFTEN | DHRRA stateless mapping real; 12,500 number conflates total with children |
| 1662 | UNPUBLISH | "Credit Suisse 2025" — defunct publisher (acquired by UBS 2023) |
| 1675 | UNPUBLISH | "5.8× ethnic stops" study does not exist |
| 1879 | UNPUBLISH | 3-suspect / 1.2kg uranium / IAEA AP 2023 all wrong or unverified |
| 1950 | UNPUBLISH | "Digital Safety Commissioner with RM180M" — fabricated institution |

## What this means for T4A's editorial product

The legacy FALLBACK rotation does not meet the gold-standard primary-
source bar in CLAUDE.md. The cause is consistent across all 40 issues:
the cards were drafted with plausible-sounding specific numbers that
trace nowhere, and in roughly 8 of the 40 the specifics actively
contradict primary sources.

The pool needs to be rebuilt with verified content. Until then the
CRON Worker has no fallback content to auto-publish — which is the
correct behaviour: silence on a quiet week beats publishing factual
errors to subscribers.

The transparency badge (`legacyAudit: true`) shipped earlier today on
68 issues remains correct disclosure for the legacy content kept
visible by direct URL. The 40 FALLBACK issues, plus the 5 from Batch
1, plus the ORPHAN cluster, are now collectively `published: false`
where they are auditable as cardinal-sin-failing; the rest stay
disclosed-legacy with the badge until each is individually verified.

## Next steps

1. **Rebuild the FALLBACK pool** with verified content over time. Each
   replacement must clear the same primary-source bar as fresh pipeline
   issues, with a research brief at `engine/briefs/{slug}.md`.

2. **Rewrite the 9 SOFTEN issues** — these have a real anchor; the
   unverified specifics need to be dropped or sourced. Lower priority
   than new fresh content.

3. **Audit the remaining ORPHAN cluster** (~32 issues still
   `legacyAudit: true` and currently published via direct URL — not
   feed, not rotation). Same protocol.

---

*Generated 2026-05-17 by parallel verification of 40 FALLBACK pool
issues. Five Batch-1 briefs in `engine/briefs/`. Batch 2 findings
consolidated here.*
