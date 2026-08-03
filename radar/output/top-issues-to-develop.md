# Radar — Top Issues to Develop

Scan: 2026-08-03 09:15 UTC. Queue size: 1134. Latest published ID: 2009.

Curated from `radar/output/issue-queue.json` and
`radar/output/silence-watch.md` (silence-watch rebuilt 2026-08-03 from the
same queue). This is the `editorial review` step in the documented flow:
`radar scan → issue-queue.json + silence-watch.md → top-issues-to-develop.md
→ editorial review → publish pipeline`. The radar does not write issues;
this list curates which candidates enter the 10-phase publish flow.

## What changed this cycle — read this first

The previous edition of this file was pinned to the **2026-06-05** scan and
was never refreshed while the radar kept scanning every two hours. Two
mechanical faults in `build-silence-watch.py` kept it looking stale even
when it was regenerated, and both are fixed as of this cycle:

1. **Coverage filter matched against the whole corpus at once.** A candidate
   was dropped as "already covered" when it shared three significant words
   with the *union* of every published issue's vocabulary. With 84 published
   issues, almost any Malaysian news headline collides on three words. The
   filter now compares per issue and ignores corpus-common filler
   (`billion`, `malaysia`, `minister`). The Tabung Haji RCI finding, the
   factory-fire toll, the Langkawi liability ruling and the 1MDB civil trial
   were all being silently suppressed by this.
2. **Everything was age-weighted.** The one ranking multiplied score by an
   age factor worth up to 2x, so a story that broke this week could not
   outrank a month-old one no matter how important. `silence-watch.md` now
   carries two tracks: **Fresh signal** (last 7 days, no age weighting) and
   **Accumulated** (age-weighted, for slow-burn items). Tier A below is
   drawn from the fresh track.

Calendar placeholders ("budget 2027 presentation", "parliament budget
session opens") are now filtered at source rather than skipped by hand each
cycle.

Shipped since the 2026-06-05 curation, removed from contention:

- `2008` ADMP / algorithmic-accountability government exemption (= prior A3)
- `2009` Mossad suspects named, no espionage conviction

Every number quoted below is a **radar signal, not a verified figure**.
Phase 1 research must trace each to a primary source before it reaches a
card, and drop any specific that cannot be traced.

---

## Tier A — develop next (this week)

### A1. A royal commission says Tabung Haji's 2017 profit was really a RM1.4b loss
- **Radar:** silence-watch F7 (fresh track), silence=0.92, importance=0.62,
  age=4.3d, 73 news / 27 social, [political]
- **Date:** 30 July 2026 (RCI findings reported); 31 July 2026 (Act
  amendments said to be under way); 1 August 2026 (call for a special
  Dewan sitting)
- **Why develop:** The largest fresh story on the radar, and the one where
  the primary source is unusually clean — a commission report, an audited
  set of accounts, and a statute all in the public domain. The developable
  angle is not the misconduct allegation, which mainstream coverage already
  carries at volume; it is the **restatement mechanism**: a fund that
  declared a distributable profit and paid a hibah on it in a year the
  commission says closed at a loss, and what the governing statute requires
  before a distribution can be declared. Anger-at-process, not
  anger-at-persons.
- **Verification path:** the RCI report text and its terms of reference,
  Tabung Haji's 2017 audited financial statements and declared hibah rate,
  Tabung Haji Act 1995 (Act 535) distribution provisions, the 2018
  restructuring and the RM10b injection, BNM's role after TH came under its
  purview, Hansard for any special sitting, and the Auditor-General's prior
  reporting on TH.
- **Lenses:** Governance, Economic, Legal.
- **Risk flags:** MEDIUM religious. Tabung Haji is a religious-purpose
  institution and the depositors are pilgrims; critique fund governance and
  statutory compliance, never the pilgrimage, the obligation, or
  depositors as a community. Do not let "hibah" become a theological
  argument. Defamation: name only what the commission's own report and
  the public record state; do not assert criminality where the report
  recommends investigation.
- **Accuracy trap — do not merge two different RM1.4b claims.** Unpublished
  draft `1151` describes a RM1.4b write-down disclosed in TH's **2025**
  annual report. The RCI finding restates **FY2017**. Same figure, different
  events. Phase 1 must keep them separate or drop one.
- **Adjacency:** unpublished drafts `1029` (RM10b bailout never fully
  explained) and `1151`. Decide at Phase 7 whether to publish `1029` as a
  companion or fold its substance in via `related[]`.

### A2. The same 30-year-old border system was breached from the inside and can be shut down by one server
- **Radar:** silence-watch F1 (fresh track), silence=1.00, importance=0.70
  — the highest structural importance in the queue — age=5.3d, 2 news / 5
  social, [environmental, ethnic, political]
- **Date:** 29 July 2026 (12 detained, 7 of them public servants, over a
  syndicate that hacked the foreign-worker pass system; loss put at
  RM2.4m); 28 May 2026 (MyIMMs outage, 3h45m, most of 114 checkpoints)
- **Why develop:** Two radar picks that are one story, and the merge is what
  makes it publishable. The carried-over MyIMMs pick (previous cycle's A1)
  was a continuity story: a ~30-year-old system, a replacement (NIISe)
  launched in 2021, due fully operational by 2024, now slated for 2028. The
  fresh arrest wave supplies the other half: the same generation of system
  approving passes through credentials held by insiders. Only 2 news
  mentions on the arrests against 5 social — genuinely under-covered.
  Technology lens, which nothing in the 2000-series carries.
- **Verification path:** the police or MACC statement on the 29 July
  arrests (number detained, agencies involved, the RM2.4m estimate and how
  it was derived), charge sheets if any exist, KDN/Immigration statement on
  the 28 May outage, NIISe procurement record and revised timeline
  (parliamentary written answers, MOF/MOHA budget lines), prior MyIMMs
  outage records.
- **Lenses:** Technology, Governance, Security.
- **Risk flags:** LOW 3R, but note the arrests are an **open investigation**
  — the T4A standard holds for charges before naming anyone. Frame around
  the system and the procurement delay, count the detained without
  identifying them, and do not characterise the RM2.4m as proven loss. KDN
  ruled out a cyber breach for the May outage; any "hack" framing of that
  event would overclaim.
- **Adjacency:** `cimb-data-breach-denial` brief, `2008` (state data systems
  outside the accountability regime), `1089` (immigration corruption index).

### A3. 2,001 factory fires and RM4.21b in losses since 2020
- **Radar:** silence-watch F3 (fresh track), silence=0.96, importance=0.67,
  age=2.9d, 75 news / 10 social, [ethnic, political]
- **Date:** 31 July 2026 (Fire and Rescue Department director-general)
- **Why develop:** Denominator-rich, zero 3R load, and it restores the
  Environmental / Economic lens the 2000-series has never carried. The
  figure is announced as an enforcement statistic; the T4A angle is the
  compliance gap behind it — a fire-safety certification regime that
  reports high issuance against a loss curve that has not bent in five
  years. The published-adjacent draft `1769` (58% commercial-building
  compliance, BOMBA audit) supplies the second data point.
- **Verification path:** the JBPM statement and the underlying annual
  statistics (case counts and loss estimates by year, so the 2,001 figure
  can be split rather than quoted as a lump), Fire Services Act 1988
  certificate-of-fitness requirements, BOMBA compliance-audit figures,
  DOSH industrial-incident data, and the insurance-industry loss series as
  a cross-check on the RM4.21b.
- **Lenses:** Environmental, Economic, Governance.
- **Risk flags:** low. Do not attribute the loss curve to any single cause
  without the year-by-year split; "RM4.21b since 2020" without a
  denominator per year is exactly the inert statistic the language standard
  warns about.
- **Adjacency:** unpublished `1769`; consider publishing it as a companion.

---

## Tier B — develop if Tier A blocks

### B1. A council loses at the apex court over failing to act — and local-government liability moves
- **Radar:** silence-watch F11, silence=0.98, importance=0.57, age=3.8d,
  13 news / 4 social, [legal]
- **Date:** 30 July 2026 (Federal Court dismisses Langkawi municipal
  council's application for leave)
- **Why develop:** Quiet, structural, and it touches every ratepayer: the
  Federal Court declined to disturb a ruling holding a municipal council
  liable for a failure to act. Local-authority immunity is one of the least
  reported areas of Malaysian public law and the least covered on T4A.
- **Verification path:** the Federal Court's grounds and the Court of Appeal
  decision beneath it, Street Drainage and Building Act 1974 s.95(2) and
  the local-authority immunity provisions, prior Federal Court authority on
  council liability, the council's own statement.
- **Lenses:** Legal, Governance.
- **Risk flags:** low. Confirm precisely what the "landmark ruling" held
  before characterising it — leave applications are refused on threshold
  grounds that do not always endorse the reasoning below.

### B2. Diesel subsidy at RM2.5b a month, with the fleet it subsidises unchanged
- **Radar:** silence-watch S1 (accumulated track), importance=0.72 — top of
  the accumulated ranking — age=80d, 32 news / 14 social
- **Date:** 14 May 2026 (transport minister's figure and the EV-truck
  proposal)
- **Why develop:** The single largest recurring fiscal number in the queue
  and it has sat 80 days without T4A touching it. Pairs directly with the
  published subsidy-rationalisation arc. Confirm whether the monthly figure
  survived the June-August rationalisation changes before building on it.
- **Verification path:** MOF subsidy allocations and the Budget 2026 line,
  the minister's statement in full, BHEUU/MOF fleet-composition data, prior
  diesel float announcements and their stated savings.
- **Lenses:** Economic, Environmental, Governance.
- **Risk flags:** low, but staleness is the real risk — 80 days is long
  enough for the number to have moved. Verify current, or drop.

### B3. PAC asks for procurement safeguards at MAHB after privatisation
- **Radar:** silence-watch S5 (accumulated track), importance=0.64,
  age=33d, 52 news / 15 social
- **Date:** 1 July 2026 (PAC early review of the privatisation)
- **Why develop:** A parliamentary committee flagging procurement risk at a
  newly privatised operator of national infrastructure is a governance story
  with a primary document (the PAC report) attached.
- **Verification path:** the PAC report and Hansard, the privatisation SPA
  terms as disclosed, MAHB's operating agreement obligations, prior
  Auditor-General findings on airport capex.
- **Lenses:** Governance, Economic.
- **Risk flags:** low. Report what the committee recommended, not what it
  implied.

### B4. Sabah's fiscal settlement in three separate transfers
- **Radar:** silence-watch S6 / S11 (RM1.5b interim special grant, raised
  from RM600m) and S12 (RM4.06b rural water projects transferred to state
  authority), accumulated track, ages 64-106d
- **Why develop:** Three transfers reported separately over four months are
  one story about how the federal-state fiscal relationship is being settled
  administratively while the 40% revenue entitlement remains before the
  courts. Published `1981` frames the court track; this is the money track.
- **Verification path:** the federal gazette or MOF announcement for the
  interim grant and its legal basis, the BALB project transfer instrument,
  MA63 Article 112C/112D and the Tenth Schedule, the Sabah state budget.
- **Lenses:** Governance, Economic, Regional.
- **Risk flags:** MEDIUM political, federal-state framing. Critique the
  mechanism (interim grants settled by negotiation rather than the
  constitutional formula), not either government's motives.

---

## Carry-over — still open from the 2026-06-05 curation

Confirmed this cycle as neither published nor briefed:

- **AG asks the Federal Court to strip the Bar of standing to question a
  DNAA** (prior A2). Separation-of-powers, extends `1997`. Still the
  strongest legal-lens pick on file. Develop when a Federal Court date is
  known.
- **A state cannot ban lotteries on moral grounds** (prior B1). Federal
  Court leave hearing was set for 12 August 2026 — check the outcome before
  developing; MEDIUM-HIGH religious risk stands.
- **Aeroline / APAD terminal licensing** (prior B2). Economic, urban
  mobility, low risk.
- **PharmD programme launched without the Pharmacy Board** (prior B3).
  Small N — confirm the affected-student count before publishing.
- **JAS enforcement yield, 3,149 actions / RM4.59m fines** (prior B4).
  Superseded as the Environmental slot by A3 this cycle; keep as a pairing
  candidate.

---

## Skip — covered, held, saturated, or low-leverage

### Saturated by mainstream coverage
- **1MDB civil trial vs Najib, US$5.64b claim** (queue, 103 news / 20
  social, 3 Aug). Wall-to-wall coverage supplies the context T4A would add.
  Revisit only for a specific untold mechanism.
- **Rosmah — no retrial in the RM1.25b solar hybrid case** (F4/F5). The
  substantive appeal against conviction, the 10-year sentence and the
  RM970m fine is listed for September 2026. Hold for the ruling; the
  procedural step alone is not a T4A issue.
- **Kevin Morais — Federal Court upholds conviction and death sentence**
  (F10/F14, 47 news). Only developable through the mandatory-death-penalty
  reform lens, which needs its own brief.

### 3R-sensitive — hold behind the higher verification bar
- **Pastor Koh family fails to quash the stay on a RM37m judgment**
  (F6/F8). Adjacent to unpublished draft `1278`. HIGH religious. Any
  development must be strictly about **enforcement of a judgment against
  the state** and the stay mechanism, never about the underlying religious
  dimension, and needs two independent primary sources (the Court of Appeal
  grounds and the High Court judgment) in full text.
- **Negeri Sembilan election, Indian-community votes, temple row** (F13).
  HIGH ethnic and religious, and electoral punditry besides. Skip.
- **Ex-Rela member's 30-year sentence, Terengganu temple shooting** (S7).
  Single crime, religious setting, no policy question. Skip.

### Open investigation — hold for charges
- **Bukit Aman, three syndicates, RM45.6m in synthetic-drug vape seizures**
  (F12). Enforcement announcement, no charges, single operation.
- The A2 arrests are themselves pre-charge — see the risk flags there.

### Foreign — route to the impact pass, not the develop list
- **US probes Chinese factories in Vietnam over transhipment** (F9) and
  **US withholds WHO/Gavi funding** (queue, 30 July). Both are
  Malaysia-exposure hypotheses, not domestic issues. They belong to
  `malaysia-impact-pass.py`, which is **producing nothing** — see
  Methodology below.

### Low leverage
- **US$1.5b sukuk oversubscribed** (F2, 64 news). Government-good-news
  framing; no gap between claim and reality without a debt-trajectory
  angle that would need its own brief.
- **Court of Appeal upholds dismissal of a liquidator's RM33m claim**
  (F15). Commercial, no public-interest hook.
- **Malaysians repaid a record RM23b in credit-card debt** (S4) and
  **AI to contribute RM20b to GDP by 2030** (S3). Both are projections or
  aggregates without a decision to anchor a fact card. Watch.
- **UM staff lose challenge to the compulsory vaccination circular** (S10).
  Rights lens, but the circular is four years old and the ruling is narrow.
  Watch.

---

## Methodology notes

- "Already covered" now runs per published issue and per brief, ignoring
  corpus-common words. It checks `src/data/issues/*.json` where
  `published: true` (**84 issues**, not the full ~2,000-file archive) plus
  85 brief filenames. Unpublished drafts are deliberately outside the
  filter: they are development material, not coverage. Where a draft is
  adjacent it is named in the pick above.
- Picks are ordered by **editorial leverage**, not raw radar score. Rank
  order is not develop order.
- The queue's raw top is still dominated by topic keywords ("malay",
  "federal", "india") — attention noise-floors, tracked but never
  developable.
- **Known limitation:** the coverage filter is monolingual. Malay-language
  candidates cannot match an English published headline, so Malay echoes of
  published issues still surface (F4/F6/F10 all have English twins in the
  same list). Dedupe by hand until the filter normalises across languages.
- **The Malaysia-impact pass is not producing output.**
  `radar/output/malaysia-impact-watch.{json,md}` do not exist, while
  `foreign-events.json` keeps filling at 24h rolling. The pass is gated on
  `ANTHROPIC_API_KEY` and exits cleanly without it, so the global track has
  been silently dark. Every foreign pick above is therefore unscored.

### Silence-watch obligation (Tier S) — status

Curator rule: each cycle, at least one Tier A or Tier B pick must come from
the top of `silence-watch.md`, or each top pick must appear in Skip with a
one-line reason. Extended this cycle to cover **both tracks**.

- Fresh track: F1 → **A2**, F3 → **A3**, F7 → **A1**, F11 → **B1**.
  F2, F4/F5, F6/F8, F9, F10, F12, F13, F14, F15 → all in Skip with reasons.
- Accumulated track: S1 → **B2**, S5 → **B3**, S6/S11/S12 → **B4**.
  S3, S4, S7, S10 → in Skip with reasons.

Both clauses satisfied.

_Refreshed 2026-08-03 against the same-day scan, with the silence-watch
builder's coverage and recency faults fixed in the same change. Supersede
on the next curator refresh._
