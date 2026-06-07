# Radar — Top Issues to Develop

Scan: 2026-06-07 03:17 UTC. Queue size: 741. Latest published ID: 2008.

Curated from `radar/output/issue-queue.json` and
`radar/output/silence-watch.md` (both regenerated 2026-06-07 03:17 UTC).
This is the `editorial review` step in the documented flow:
`radar scan → issue-queue.json + silence-watch.md → top-issues-to-develop.md
→ editorial review → publish pipeline`. The radar does not write issues;
this list curates which candidates enter the 10-phase publish flow.

Selection filter this cycle: **worthy** (high editorial leverage, not raw
radar rank) × **silent** (under-covered vs structural importance) × **not
already in the codebase** (no published issue, no in-flight brief) ×
**relatable** (a reader feels the stake in one sentence). Local-Malaysia
picks lead; the global / Malaysia-impact channel is the fallback when the
domestic silence list runs dry — it does not this cycle (see Global
fallback below).

Already-published items and items in flight under `engine/briefs/` are
excluded. Since the previous curation (2026-06-05 scan), one more radar
pick shipped and is removed from contention:

- `2008` Algorithmic-accountability rulebook exempts the state (= prior A3,
  DPA/ADMP–PADU pick; brief `pdpa-admp-government-exemption.md`)

The earlier set shipped since the 2026-05-17 scan still stands removed:
`2000` (Suhaili/Bersatu Art. 49A = S2), `2001` (KKM cost-saving = S1),
`2004` (CCID RM1.47B investment fraud), `2005` (statutory-body CEO bribe),
`2006` (Sabah mining-licence graft), `2007` (MACC RM548m freeze refused).

Picks are ordered by editorial leverage, not raw radar score — the queue
ranks by controversy-potential, but T4A picks must be high-leverage *and*
primary-source verifiable *and* not already saturated in mainstream
coverage. The raw queue's top 30 this cycle is again dominated by
single-word and calendar stubs ("budget 2027 presentation", "parliament
budget session opens", "malay", "federal", "chinese", "budget") —
attention noise-floors, not developable. Rank order is not develop order.
The developable signal lives in `silence-watch.md`, scanned below.

---

## Tier A — develop next (this week)

### A1. FAM did not table a budget for Congress approval for a decade — and the AFC had to find it
- **Radar:** silence-watch S11, silence=1.00, importance=0.61, age=1.0d, [economic, institutional, political]
- **Date:** 4 June 2026 (AFC audit presented at FAM Extraordinary Congress);
  5–6 June 2026 (FAM partial denial; MP demands full audit release)
- **Why develop:** The freshest, highest-importance, and by far the most
  *relatable* pick on file this cycle — football is the one institution
  every Malaysian household has an opinion on, which is exactly why a
  governance failure inside it lands harder than a ministry's would. An
  Asian Football Confederation audit presented at FAM's Extraordinary
  Congress found the association failed to table its annual budget for
  Congress approval since 2016, and scored below 2 out of 5 in most major
  areas reviewed (governance, legal, finance, football development), which
  the AFC called *systemic*. The 18 affiliates then unanimously passed all
  94 AFC-proposed statute amendments — abolishing the deputy-president post
  and restructuring the exco. The T4A angle is the accountability gap: the
  budget is the one document that lets members hold a body to account, and
  for the better part of a decade members were asked to approve none. The
  denominator-rich frame is "ten congresses, zero budgets tabled," not the
  personalities.
- **Verification path / accuracy trap:** Distinguish two claims carefully —
  FAM **admits** shortcomings in tabling the **budgets** for 2023–2025 and
  the AFC finding is about budgets not tabled *for Congress approval* since
  2016; FAM **denies** the separate characterisation that it failed to
  table **audited financial accounts** since 2016. Do not collapse the two.
  Trace to: the AFC audit report (or the Congress presentation of it), the
  FAM Extraordinary Congress resolutions (94 amendments), FAM's official
  statement of denial/acknowledgement, and the FIFA/AFC statutes on
  budget-tabling obligations. Confirm the "less than 2/5" scoring wording
  against the audit's own scale before using a number.
- **Lenses:** Governance, Economic, Social.
- **Risk flags:** low 3R, low defamation — critique the governance process
  (budgets not tabled, members not given oversight), not any named officer.
  Hamidin's own "negligence" characterisation is on the record and can be
  quoted as his framing, not asserted as T4A's conclusion. Avoid implying
  misappropriation: the audit found a tabling/oversight failure, not theft —
  an anxiety-of-precedent frame, not an allegation of fraud.
- **Adjacency:** `nrd-citizenship-integrity-fam-cas` (the FAM
  naturalised-player / CAS case — same body, different failure; pair via
  `related[]` for a FAM-governance arc). Distinct story; do not merge.

### A2. A 30-year-old immigration system crashed for nearly 4 hours; its replacement is 4 years late
- **Radar:** carried from 2026-06-05 (prior A1); not in this cycle's
  silence-watch top 25 but still unshipped, unbriefed, and uncovered for the
  legacy-precedent angle. [political, technology]
- **Date:** 28 May 2026 (outage); 30 May 2026 (MP demand for root cause)
- **Why develop:** The cleanest anger-at-process pick still on the board, and
  it drags the run out of its Legal / Governance rut into a Technology lens
  that issues 2000–2008 never touched. On 28 May the MyIMMs system went down
  for about five hours from ~4.30am (immigration puts the total system-down
  at 3 hours 45 minutes), paralysing most of Malaysia's 114 checkpoints and
  stranding tens of thousands at land, air and sea borders; autogates and
  facial recognition were also down and officers cleared travellers
  manually. KDN says technical fault, not a cyber breach. The
  denominator-rich angle is the legacy-system precedent: MyIMMs is ~30 years
  old; its replacement NIISe was launched in 2021, was due fully operational
  by 2024, and is now slated only for 2028. A border that can be shut for
  hours by a single ageing server is the story, not the one outage.
- **Verification path:** KDN / Immigration statement on the 28 May outage
  (duration, checkpoints affected, cause), NIISe procurement and timeline
  (parliamentary written answers, MOF/MOHA budget lines), prior MyIMMs
  outage records, the 9–15 March 2026 MyNIISe upgrade-disruption notice.
- **Lenses:** Technology, Governance, Security.
- **Risk flags:** none material — frame as procurement delay and continuity
  risk, not as an attack on named officers. Do NOT speculate on breach;
  KDN's own statement rules out cyber, so any "hack" framing would overclaim.
- **Adjacency:** pair via `related[]` with `2008` (the state's own data
  systems sitting outside its own rulebook — the government-IT through-line)
  and any e-government delivery issue.

### A3. The AG asks the Federal Court to strip the Bar of standing to question a DNAA
- **Radar:** silence-watch S16, silence=0.98, importance=0.56, age=1.6d, [legal]
- **Date:** 5 June 2026 (AG's Federal Court leave application); 7 May 2026
  (Court of Appeal granted the Bar leave)
- **Why develop:** Fresh, high-importance, and a clean separation-of-powers
  question that extends the prosecutorial-independence arc T4A already runs
  (`1997` AG-prosecutor split). On 7 May the Court of Appeal unanimously
  granted the Malaysian Bar leave to judicially review the 2023 decision to
  apply for a discharge not amounting to acquittal (DNAA) for Ahmad Zahid
  Hamidi in the Yayasan Akalbudi case. On 5 June the AG (Dusuki Mokhtar)
  filed to reverse that, posing two questions of law he says meet the
  Section 96 Courts of Judicature Act 1964 threshold. The T4A angle is the
  reviewability question: is the AG's Article 145(3) prosecutorial
  discretion beyond the reach of the courts, or can a third party with no
  stake in the prosecution force it open? Both answers carry a cost.
- **Verification path:** the Court of Appeal grounds (7 May, Faizah
  Jamaludin panel), the Bar Council's judicial-review press release and
  cause papers, the AG's Section 96 leave application and the two framed
  questions, Article 145(3) Federal Constitution, prior DNAA-review
  authorities.
- **Lenses:** Legal, Governance, Political.
- **Risk flags:** MEDIUM defamation/sub judice — the matter is live before
  the Federal Court. Treat strictly as the procedural contest over standing
  and reviewability; make no claim about Zahid's guilt or innocence (a DNAA
  is neither, as the bench itself noted). Critique the doctrine, not the man.
- **Adjacency:** `1997` (AG-prosecutor split), `ag-public-prosecutor-separation-bill`,
  `zahid-insults-firm-action-vs-existing-laws`, `najib-1mdb-tanore`.

---

## Tier B — develop if Tier A blocked

### B1. A state cannot ban lotteries on moral grounds — only the federal minister licenses gambling
- **Radar:** silence-watch S17, silence=0.98, importance=0.51, age=5.0d, [legal, political]
- **Date:** 2 June 2026 (Court of Appeal majority grounds reported);
  Federal Court leave hearing set for 12 August 2026
- **Why develop:** A genuine federalism ruling with a live next date, and it
  tests T4A's 3R discipline cleanly. In a 2-1 majority the Court of Appeal
  (Faizah Jamaludin, Lim Hock Leng; Azizah Nawawi dissenting) held that
  Kedah cannot refuse to renew pool-betting and lottery licences on the
  moral ground that it opposes gambling: licensing sits with the finance
  minister under federal law, and a blanket non-renewal usurps that power. A
  state may still regulate premises factors — building safety, sanitation,
  nuisance, location suitability. The T4A angle is the jurisdictional line:
  where does a state's local-government power end and the federal licensing
  regime begin, and what is left of state discretion once "morality" is
  ruled out?
- **Verification path:** the Court of Appeal majority and dissent grounds,
  Ninth Schedule (Federal vs State Lists) of the Federal Constitution, Local
  Government Act 1976, Pool Betting Act 1967 / Common Gaming Houses Act
  licensing conditions (incl. the Muslim-prohibition note on tickets), the
  2025 High Court ruling this appeal upheld, the comparable Perlis case.
- **Lenses:** Legal, Governance, Historical.
- **Risk flags:** MEDIUM-HIGH religious — gambling and a state's stated moral
  objection sit close to belief. Frame strictly as constitutional division
  of powers (who licenses, on what grounds), never as a verdict on whether
  gambling is right or wrong, and never as commentary on any community. If
  the brief drifts toward the morality of gambling itself, hold. Consider
  Stage 5 re-enable per the CLAUDE.md religious-risk rule.

### B2. Three approved terminals, all suburban: how a licensing rule pushed a 20-year operator out of KL
- **Radar:** silence-watch S10 (APAD enforcement), silence=0.99,
  importance=0.56, age=5.0d, [political, economic]
- **Date:** 30 May 2026 (Aeroline KL-exit announcement); 2–3 June 2026
  (APAD defends enforcement)
- **Why develop:** A silence pick that adds the Economic / urban-mobility
  lens the recent run is starving. After 20+ years Aeroline (operator Zulco
  Sdn Bhd) is exiting KL because the only APAD-licensed terminals open to it
  — 1 Utama, LaLaport, IOI City Mall — are all out of the city centre, and
  the one closest in (LaLaport) charges commercial fees the operator says it
  cannot absorb without raising fares. APAD says it enforced a clear rule
  after three 2025 show-cause letters and a November 2025 suspension, and
  gave nearly five months to comply. The T4A angle is the policy-design
  question: when the licensed-terminal map has no viable city-centre option,
  does "enforcement" amount to a back-door ban on premium intercity coaches
  into KL?
- **Verification path:** APAD's enforcement statement and the show-cause
  timeline, Land Public Transport Act 2010 terminal-licensing provisions,
  the list of APAD-approved KL-area terminals and their fee schedules, the
  TBS-BTS / Pekeliling terminal-consolidation policy history, Aeroline's own
  statement.
- **Lenses:** Economic, Governance, Regional.
- **Risk flags:** low — fair comment on a public regulator's stated policy.
  Name only the documented rule and the operator's stated reasons.

### B3. A ministry launched a pharmacy degree abroad without asking the board that licenses pharmacists
- **Radar:** silence-watch S21, silence=0.99, importance=0.52, age=1.8d, [political]
- **Date:** 5 June 2026 (PM directs two ministries to resolve);
  background surfaced May 2026
- **Why develop:** Small N but a textbook inter-agency coordination failure,
  and it carries an Education / Health lens this run lacks. The Higher
  Education Ministry offered a Doctor of Pharmacy (PharmD) programme at
  Egypt's Alexandria University; the Pharmacy Board Malaysia was not
  consulted, and now graduates face blocked professional recognition.
  Students could not sit the Poison Act qualifying exam because the
  programme is not on the Board's recognised list. MQA has no objection to
  *academic* recognition; *professional* registration is the Board's call
  and remains unresolved. On 5 June the PM ordered both ministries to fix it
  fast. The T4A angle: who carries the cost when one arm of government
  promises a pathway another arm never approved?
- **Verification path:** Pharmacy Board Malaysia recognised-degree list and
  the recognition guidelines, MQA's academic-recognition statement, Poison
  Act / Registration of Pharmacists Act qualifying-exam rules, the Higher
  Education Ministry's programme announcement, the PM's directive.
- **Lenses:** Health, Governance, Social.
- **Risk flags:** low. Confirm the exact number of affected students before
  publishing — early reports cite a single small cohort; do not generalise
  to "Malaysian students" without a denominator.

### B4. MARA put a woman and three guarantors on the hook for an RM857,000 loan (carry-watch)
- **Radar:** silence-watch S25, silence=0.99, importance=0.48, age=3.1d, [legal]
- **Frame:** A High Court upheld a Sessions Court finding ordering a borrower
  and three guarantors to repay a MARA education loan of ~RM857,000. Highly
  relatable (the guarantor-trap every Malaysian family with a MARA loan
  fears) but single-instance, so it only develops into a T4A issue if it
  anchors the *systemic* angle: MARA's loan-recovery and guarantor-liability
  regime, default-and-write-off scale, and whether guarantors are pursued
  before or after the borrower. Verify the judgment text, MARA's published
  loan-recovery / bad-debt figures (Auditor-General reports, MARA annual
  report), and the guarantor provisions in the loan agreement before listing
  as a develop pick. Hold as a watch item unless the systemic denominator
  is available.

---

## Global fallback — checked, not needed this cycle

Per the selection filter ("if there's no local, find global"), the global /
Malaysia-impact channel is the standby when the domestic silence list runs
dry. This cycle it does not — Tier A alone carries three unshipped,
verifiable local picks — so global stays a **watch**, not a develop slot.

State of the channel:
- `radar/output/malaysia-impact-watch.{json,md}` was **not** regenerated this
  run: the daily impact pass is gated on `ANTHROPIC_API_KEY`, which is absent
  in the scan environment, so the script exited cleanly with no output.
- The raw `foreign-events.json` 24h buffer (312 events) shows one strong
  Malaysia-transmission cluster worth a manual pass next cycle: **West Asia
  escalation / Strait of Hormuz** (Iran missile exchanges, drones toward the
  Strait) → Brent crude, ringgit, Strait-of-Malacca shipping insurance, and
  the haj/Saudi exposure channels in `malaysia-exposure-map.yaml`. A
  secondary cluster — a **semiconductor selloff** ("chip selloff erases over
  $1 trillion") — maps to the Johor data-centre and chip-export-control
  briefs already in flight (`chip-export-controls-johor-dc-risk`,
  `data-center-johor-water-power`), so it is brief-adjacent, not a fresh slot.
- Action: if `ANTHROPIC_API_KEY` is provisioned, run
  `radar/scripts/malaysia-impact-pass.py` to score the Hormuz cluster for
  downstream Malaysia impact before next curation. Until then, no global pick
  is developed — local supply is sufficient and better verified.

---

## Skip — already covered, stubs, deferred, or held

### Published / shipped (silence-watch echoes)
- S1 (KKM cost-saving) → published `2001`
- S2 (Suhaili / Bersatu Art. 49A) → published `2000`
- S6 (MACC RM548m freeze *appeal*) → the underlying High Court refusal is
  published `2007`; the appeal itself adds no new developable finding until
  the appellate court acts. Hold for the ruling.
- S7 (Rafizi 9-hour MACC questioning) → collapses into published `1990` /
  brief `macc-rm1-1b-rafizi-28-pages`.

### Calendar / single-word stubs in queue and silence-watch
- S4 "budget 2027 presentation", S5 "parliament budget session opens",
  S8 "parliament second session opens" — scheduled-event placeholders
  (2–3 news, 0 social), not developable findings. Track as noise floors.
- Queue top ranks ("malay", "federal", "chinese", "budget") — topic-level
  attention, not candidate stories.

### Adjacent to an existing brief or published arc
- S9 (Pemuda MCA anti-Azam Baki) and S14 (Syahredzan vs ex-MACC chief)
  → adjacent to `macc-chief-watchdog-crisis` brief; no standalone leverage
  beyond it. Defer unless a board substantively acts.
- S3 (Sabah 40% revenue — stay-application ruling) → in-flight brief
  `sabah-two-ma63-delays-akps-vs-40pc-revenue-stay.md` and published `1981`
  already frame the stay. Finish-or-retire: develop the brief **only if** the
  stay-application ruling lands as a genuinely new outcome; otherwise
  formally retire so silence-watch stops re-surfacing a covered case.

### Open investigation — hold for charges
- S13 (MACC investigates two over IJM takeover) → no charges; defamation
  exposure too high for the T4A standard until a charge sheet exists.

### 3R-sensitive — hold behind the higher verification bar
- S12 (300 detained incl. 12 alleged deviant-teaching leaders) → HIGH
  religious. Hold unless two independent primary sources (police statement +
  any charge) are available in full text, and critique process (detention
  authority, due process), not belief.

### Sensitive — hold
- S15 (Zara Qairina inquest audio) → a minor's death; and at 18 news / 15
  social not genuinely silent (silence=0.86). Hold.

### Low-leverage / punditry / single-instance / blotter
- S18 (Pemuda PAS Bangi cut-ties-with-Bersatu motion), S19 (Fadhli on
  PAS-Bersatu electoral pact), S22 (Johor DUN dissolution / PRN) →
  reaction, party-internal, or election-mechanics punditry; no decision to
  anchor a fact card. Johor PRN may earn a slot once a manifesto or seat
  arithmetic lands.
- S20 (RM57.15m drug seizure, elderly among held), S23 (teens detained for
  "wheelie" stunts) → crime blotter; no systemic angle.
- S24 (Kenya: 2 dead in protest at US Ebola facility) → foreign, no material
  Malaysia transmission channel; routes to the impact pass, not the domestic
  develop list. See Global fallback above.

---

## Methodology notes

- "Already covered" check ran against `src/data/issues/*.json` headlines and
  contexts plus `engine/briefs/*.md` filenames (in-flight briefs excluded).
  A1 (FAM budget) confirmed absent from both — the only FAM brief on file
  (`nrd-citizenship-integrity-fam-cas`) is the naturalised-player/CAS story,
  a different failure.
- "Saturated" means mainstream coverage already supplies the missing context
  T4A would otherwise add.
- The `silence_anomaly` bias in the queue means many high-rank items are
  *low* news mentions but high *structural* importance — the queue working as
  designed, but rank order is not develop order.
- The two fresh Tier A picks this cycle (A1 FAM, A3 AG/Bar DNAA) were
  confirmed against live primary-leaning sources before listing — the AFC
  audit reporting and Extraordinary Congress resolutions for A1; the Court of
  Appeal leave grant and the AG's Section 96 filing for A3. URLs go into the
  Phase 1 brief, not here.
- A1 carries an explicit overclaim trap (budgets-not-tabled vs
  audited-accounts-not-tabled) flagged in its verification path; the brief
  author must keep the two claims separate or the issue fails the Accuracy
  Standard.

### Silence-watch obligation (Tier S) — status

Curator rule: each cycle, at least one Tier A or Tier B pick must come from
the top 5 of `silence-watch.md`, OR each of those top 5 must appear in Skip
with a one-line reason.

This cycle satisfies the rule **directly**: A1 develops S11 (the freshest
fully-silent developable pick), and the top 5 are also all accounted for:
- S1 → Skip (published `2001`)
- S2 → Skip (published `2000`)
- S3 → Skip (finish-or-retire; brief + `1981` already cover the stay)
- S4 → Skip (calendar stub)
- S5 → Skip (calendar stub)

The fresh developable signal this cycle sits lower in the silence ranking
(S10, S11, S16, S17, S21, S25) — picked into Tier A/B above — because the
top of the silence list has now largely been shipped or is calendar noise.

_Refreshed 2026-06-07 against the same-day raw scan; supersede on the next
curator refresh._
