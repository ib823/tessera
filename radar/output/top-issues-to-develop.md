# Radar — Top Issues to Develop

Scan: 2026-09-03 22:24 UTC (CI), confirmed by a local rescan at 23:51 UTC
the same day. Queue size: 1,122 (CI) / 1,128 (local). Latest published
ID: 2009 (sourceDate 2026-06-24). Nothing has shipped in ten weeks.

Curated from `radar/output/issue-queue.json` and
`radar/output/silence-watch.md`. This is the `editorial review` step in
the documented flow: `radar scan → issue-queue.json + silence-watch.md →
top-issues-to-develop.md → editorial review → publish pipeline`. The radar
does not write issues; this list curates which candidates enter the
10-phase publish flow.

## What changed this cycle — read this first

The previous edition was pinned to the **2026-08-03** scan. Since then the
radar has run roughly 370 more cycles and the develop list was not
refreshed. Of the three Tier A picks from that edition:

- **A1 Tabung Haji RCI restatement** — brief complete
  (`engine/briefs/tabung-haji-rci-2017-restatement.md`, Phase 1, ID 2010
  reserved), still awaiting approval to start Stage 1. The story has moved
  on: a former minister was held by MACC on 1 Sep to assist the RCI probe
  into a hotel deal; the former COO was charged in Shah Alam on 3 Sep; C4
  (30 Aug) is calling for a review of the National Audit Department over a
  "RM4.8bil audit discrepancy" (silence-watch F1 this cycle). All three are
  **sources for the existing brief, not new picks**. The C4 item lands on
  exactly the "the auditor signed it" thread the brief already carries.
- **A2 Border system (MyIMMs / insider breach)** — not briefed. Carry over.
- **A3 Factory fires (2,001 / RM4.21b)** — not briefed. Carry over.

**The fresh track this cycle is dominated by a story the silence filter
cannot see as one story.** Twelve distinct haze headlines (daily API
bulletins, school closures, health statistics, the emergency threshold,
cloud seeding, the ASEAN letter) sit in the queue as separate
`silence_anomaly` entries, none above `controversy_score` 0.20 on its own.
Read together they are the largest domestic event since the June
curation. This cycle's A1 merges them.

**Radar health note.** The local rescan reproduced the CI queue but the
prediction pipeline failed on a missing `lifelines` dependency
(`autograd-gamma` will not build on this container's Debian setuptools).
CI runs fine. Not a queue-quality problem; noted so the next operator does
not chase it.

Every number quoted below is a **radar signal, not a verified figure**
unless it is marked as already traced in a brief.

---

## Tier A — develop next (this week)

### A1. Sarawak's worst haze since 2015 hit API 475. The haze law Cabinet approved in principle in 2020 was dropped in 2023.
- **Radar:** fresh track, 12 merged entries (Serian/Kuching API bulletins
  30 Aug–3 Sep, 591-school closure, KKM +124 % URTI, API-500 emergency
  line, cloud seeding, ASEAN Alert Level 3, Kurup/Anwar letters), all
  `silence_anomaly`, dims [environmental, general, political]. Individually
  ≤0.20; the coverage-split is the reason none surfaced in the top 15.
- **Status: BRIEFED THIS CYCLE.**
  `engine/briefs/sarawak-haze-transboundary-act-dropped.md`, Phase 1
  complete, **ID 2011 reserved**, 53 sources / 14 primary, six
  contradictions logged, eight verification gaps listed. Awaiting approval
  for Stage 1.
- **Date:** 21 Aug 2026 (schools close), 31 Aug (Serian 475; emergency
  line set), 3 Sep (cloud seeding begins).
- **Why develop:** Mainstream carries the readings, the closures and the
  diplomacy at volume. It does not carry the legislative record: a
  domestic Transboundary Haze Act proposed Sept 2019, agreed in principle
  by the PH Cabinet on 12 Feb 2020, shelved by PN on 3 Aug 2020, dropped
  by the PH-led government on 6 Nov 2023 on AGC advice, then a policy paper
  promised to a select committee for H1 2024 with no published outcome,
  and a Suhakam Clean Air Act recommendation (Sept 2024) unimplemented.
  Bipartisan record, so the anger lands on process. Restores the
  Environmental lens, which the whole 2000-series lacks.
- **Guardrails:** carry the honest counter-argument (AGC's evidence
  problem; Singapore's law has zero convictions) on a fact card, not in a
  footnote. Do not imply Malaysian-linked companies caused the 2026 fires;
  the only evidence is the 2019 precedent and an Indonesian lawmaker's
  remark. Use Indonesian burn-area figures only as year-to-date with
  attribution (three conflicting July numbers). Use only KKM's own 27 Aug
  health figures until the later weekly statements are found.
- **Lenses:** Environmental, Legal, Regional (alt: Health).
- **Stage 5:** not triggered.

### A2. Tabung Haji RCI restatement (carry-over; brief complete)
- **Radar:** silence-watch F1 this cycle is the C4 "RM4.8bil audit
  discrepancy" call (7 news / 1 social, [institutional, legal]). Queue
  also holds the 1 Sep MACC detention of a former minister and the 3 Sep
  COO charge.
- **Status:** Phase 1 complete since 9 Aug; the RCI report itself was
  opened and cited. **Blocked only on user approval.** Refresh the brief's
  PERIOD/CONTEXT with the three September developments before Stage 1;
  they strengthen the auditor thread and do not change the mechanism.
- **Why it still ranks:** cleanest primary-source path in the queue, and
  now a live prosecution track that keeps it current for another month.
- **Guardrails:** unchanged from the 3 Aug edition. Charges are charges,
  not findings; keep the FY2017 restatement separate from draft `1151`'s
  RM1.4b write-down; critique fund governance, never the pilgrimage or
  depositors.

### A3. Felda: six to seven new MACC probes and a forensic audit, on a fund that costs the federal government nearly RM1b a year
- **Radar:** 2 Sep "MACC: six Felda and FIC cases under investigation,
  arrests imminent" / "MACC opens 7 probe papers on Felda, subsidiary"
  (investment transactions and asset acquisitions 2010–2020); 25 Aug PM
  confirms a forensic-audit proposal for Cabinet; 7 Aug PM questions a
  RM330m gap in a proposed Felda hotel sale; 5 Jul PM says the federal
  government is "saddled with Felda's nearly RM1b annual debt". Dims
  [economic, institutional, political]. Anwar on 21 Aug: scrutiny of TH
  and Felda is "based on wrongdoing, not religion or race", which tells
  you the 3R framing is already in the air.
- **Why develop:** four separate items over eight weeks are one story
  about the state auditing its own development agency a decade late. The
  T4A angle is not the arrests (pre-charge) but the **audit lag**: the
  transactions under investigation date from 2010–2020, the Auditor-General
  and the 2019 Felda White Paper already covered the period, and the
  forensic audit is being commissioned in 2026. Pair with the annual
  federal cost so the number has a denominator.
- **Verification path:** the 2019 Felda White Paper (Dewan Rakyat), the
  AG's Reports on Felda/FIC, MACC's 2 Sep statement, the PM's Cabinet
  remarks in Hansard, Felda's audited accounts for the federal-support
  line.
- **Lenses:** Governance, Economic, Historical.
- **Risk flags:** MEDIUM ethnic (settler community is overwhelmingly
  Malay; critique the agency and the audit cycle, never settlers). Open
  investigation: count cases, do not name suspects. **Stage 5 not
  triggered** at MEDIUM, but re-check after the brief.

---

## Tier B — develop if Tier A blocks

### B1. The border system, breached inside and fragile outside (carry-over from 3 Aug A2)
- Unchanged: 29 Jul arrests (12 detained, 7 public servants, RM2.4m
  estimate) + 28 May MyIMMs outage + NIISe slipping to 2028. Technology
  lens. Pre-charge: count, do not name. Check whether charges have since
  been filed before briefing.

### B2. 2,001 factory fires, RM4.21b in losses since 2020 (carry-over from 3 Aug A3)
- Now has a live hook: the 1 Sep Bercham 10 fire in Ipoh damaged nine
  factory lots (queue, [environmental]). Get the year-by-year split from
  JBPM before publishing. Environmental slot is taken by A1 this cycle, so
  this waits one slot.

### B3. National Trust Fund (KWAN) Bill 2026: tapped twice in 40 years, now with tighter withdrawal rules
- **Radar:** accumulated S8 (66 news / 21 social, 16 Jul, [ethnic,
  political]) and a companion item "passed with tighter rules on
  contributions, withdrawals and governance" (16 Jul). RM22.43b fund.
- **Why develop:** a sovereign-fund governance bill passed with almost no
  analysis of what the old withdrawal rule allowed and what the new one
  forbids. Primary sources are the Bill, the Act as amended, and Hansard.
  Governance / Economic. Low 3R. Seven weeks old, which is acceptable for a
  statute story.

### B4. Melaka adds up to seven nominated assemblymen by constitutional amendment
- **Radar:** accumulated S4 (74 news / 25 social, 14 Jul, [legal,
  political]). Adjacent to in-flight brief
  `engine/briefs/johor-unelected-reps-bill.md`, so check whether that brief
  can absorb Melaka as a second case before opening a new one.

---

## Carry-over — still open, unbriefed

- **AG asks the Federal Court to strip the Bar of standing to question a
  DNAA.** Still the strongest legal-lens pick on file. Develop when a
  Federal Court date is known.
- **Diesel subsidy RM2.5b a month** (accumulated S1, now 112 days). Verify
  the number survived the mid-year rationalisation changes or drop.
- **PAC procurement safeguards at MAHB** (accumulated S9).
- **Sabah fiscal settlement in three transfers** (accumulated S11/S16/S17).
- **Langkawi council liability ruling**, **Aeroline/APAD**, **PharmD**,
  **JAS enforcement yield** — as listed on 3 Aug.

---

## Skip — covered, held, saturated, or low-leverage

### Saturated by mainstream coverage
- **Jana Wibawa trial** (RM25.3m to Bersatu "not a coincidence"; MACC
  investigator on abuse of power; golf-game witness) — daily court
  reporting, sub judice, and the framing is already adversarial. Revisit
  only after verdict, for the political-donation-law gap.
- **MAHA 2026** (RM8b in MoUs, RM1.49b on opening day, 1.8m visitors) —
  F2/F3 on the fresh track are announcement volume, not a gap.
- **Medtech RM50b export target** (F9/F14) — target announcement without a
  baseline; no gap to close.
- **Rosmah solar appeal, new evidence allowed** (1 Sep) — hold for the
  substantive ruling.

### 3R-sensitive — hold behind the higher verification bar
- **Federal Court rejects ex-PAS leader's bid to revive expired preaching
  tauliah** (F7/F10). Religious credentialing by state authority is a
  genuine governance question, but HIGH religious risk and a single named
  individual. Would require Stage 5. Skip this cycle.
- **PAS Youth motions** (defend all seats; Perlis MB "tarnishing" the
  party) — intra-coalition, no policy mechanism.
- **Anwar "gambling boss?" / special draws** (29 Aug; Zafrul on the 22-draw
  ceiling from 1999) — religious-political framing on both sides; hold.

### Open investigation — hold for charges
- **Former minister held by MACC (TH hotel deal)**, **TH ex-COO charged**,
  **THP Bina ex-manager CBT** — fold into A2 as period updates.
- **MMEA detains two ships, RM260m oil cargo** (F12).
- **Raub minerals, trailers moving minerals out** (30 Aug).

### Low-leverage or better as a source
- **Mandiri chief questions MyBorderPass travel ban** (3 Sep, 2 news /
  1 social). A rights-lens travel-restriction story exists (Immigration
  Act, no reasons given, discovered via an app), but the subject is a
  single little-known actor and the facts are two paragraphs deep. Track;
  develop only if a second case appears.
- **Sunway Lagoon roller-coaster injury, ride closed pending probe** —
  DOSH amusement-ride regulation is a real gap but no primary document yet.
- **Sabah water crisis: "don't sacrifice independent oversight for speed"**
  — pairs with the accumulated Sabah water-project transfer (S17) if that
  is developed.
- **Uber dynamic-pricing class action (EU)**, **CXMT sues Pentagon**,
  **Nepal floods** — foreign; route to the impact pass, which is still
  dark (see below).

### Operational gap to close (unchanged since 3 Aug)
`radar/output/malaysia-impact-watch.{json,md}` still do not exist. The
daily impact pass is gated on `ANTHROPIC_API_KEY` and exits silently
without it. Either set the secret or drop the workflow.

_Refreshed 2026-09-04 (UTC) from the 2026-09-03 22:24 UTC scan and a local
rescan. Supersede on the next curator refresh._
