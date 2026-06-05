# Radar — Top Issues to Develop

Scan: 2026-06-05 12:41 UTC. Queue size: 745. Latest published ID: 2007.

Curated from `radar/output/issue-queue.json` and
`radar/output/silence-watch.md` (both regenerated 2026-06-05 12:41 UTC).
This is the `editorial review` step in the documented flow:
`radar scan → issue-queue.json + silence-watch.md → top-issues-to-develop.md
→ editorial review → publish pipeline`. The radar does not write issues;
this list curates which candidates enter the 10-phase publish flow.

Already-published items and items in flight under `engine/briefs/` are
excluded. Since the previous curation (2026-06-04 scan), one more radar
pick shipped and is removed from contention:

- `2007` MACC RM548m Singapore freeze refused (= prior A1, silence S8)

The full set shipped since the 2026-05-17 scan still stands removed:
`2000` (Suhaili/Bersatu Art. 49A = S2), `2001` (KKM cost-saving = S1),
`2004` (CCID RM1.47B investment fraud), `2005` (statutory-body CEO bribe),
`2006` (Sabah mining-licence graft).

Picks are ordered by editorial leverage, not raw radar score — the queue
ranks by controversy-potential, but T4A picks must be high-leverage *and*
primary-source verifiable *and* not already saturated in mainstream
coverage. The raw queue's top 30 this cycle is again dominated by
single-word and calendar stubs ("budget 2027 presentation", "parliament
budget session opens", "malay", "federal", "india", "chinese", "budget")
— attention noise-floors, not developable. Rank order is not develop order.
The developable signal lives in `silence-watch.md`, scanned below — plus,
this cycle, a manual pass over Digital Policy Alert
(`digitalpolicyalert.org`), which surfaces regulator guidelines and
gazette-level digital-policy moves that carry near-zero domestic press and
so never register in the news-volume queue. That pass produced pick A3.

---

## Tier A — develop next (this week)

### A1. A 30-year-old immigration system crashed for 3h45m; its replacement is 4 years late
- **Radar:** silence-watch S23, silence=0.97, importance=0.47, age=6.4d, [political]
- **Date:** 28 May 2026 (outage); 30 May 2026 (MP demand for root cause)
- **Why develop:** The cleanest anger-at-process pick this cycle, and it
  drags the run out of its Legal / Governance rut into a Technology lens
  that issues 2000–2007 never touched. On 28 May the MyIMMs system went
  down for 3 hours 45 minutes from ~5.00am, paralysing most of Malaysia's
  114 checkpoints and stranding travellers at land, air and sea borders.
  KDN says technical fault at the data centre, not a cyber breach. The
  denominator-rich T4A angle is the legacy-system precedent: MyIMMs is
  ~30 years old; its replacement NIISe was launched in 2021, was due
  fully operational by 2024, and is now slated only for 2028. A border
  that can be shut for four hours by a single ageing server is the story,
  not the one outage.
- **Verification path:** KDN / Immigration statement on the 28 May outage
  (duration, checkpoints affected, cause), NIISe procurement and timeline
  (parliamentary written answers, MOF/MOHA budget lines), prior MyIMMs
  outage records, the 9-15 March 2026 MyNIISe upgrade-disruption notice.
- **Lenses:** Technology, Governance, Security.
- **Risk flags:** none material — frame as procurement delay and
  continuity risk, not as an attack on named officers. Do NOT speculate on
  breach; KDN's own statement rules out cyber, so any "hack" framing would
  overclaim.
- **Adjacency:** pair via `related[]` with `cimb-data-breach-denial`
  (digital-resilience arc) and any e-government delivery issue.

### A2. The AG asks the Federal Court to strip the Bar of standing to question a DNAA
- **Radar:** silence-watch S19, silence=0.98, importance=0.56, age=0.0d, [legal]
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
  the Federal Court. Treat strictly as the procedural contest over
  standing and reviewability; make no claim about Zahid's guilt or
  innocence (a DNAA is neither, as the bench itself noted). Critique the
  doctrine, not the man.
- **Adjacency:** `1997` (AG-prosecutor split), `ag-public-prosecutor-separation-bill`,
  `zahid-insults-firm-action-vs-existing-laws`, `najib-1mdb-tanore`.

### A3. Malaysia's first algorithmic-accountability rulebook exempts its biggest profiler — the state
- **Source channel:** Digital Policy Alert pass (`digitalpolicyalert.org`),
  not the domestic-news radar. This is the kind of silent structural item
  the news-volume queue cannot see: a regulator guideline with near-zero
  press. DPA events `/change/13812`, `/change/13810`, `/change/19244`.
- **Date:** 30 April 2026 (three guidelines adopted, v1.0)
- **Why develop:** The single most "silent" high-leverage pick on file this
  cycle, and it lands a Technology / Rights lens the run has never carried.
  On 30 April the Department of Personal Data Protection (JPDP), under the
  Digital Ministry, adopted Malaysia's first guidelines on Data Protection
  Impact Assessment, Data Protection by Design, and Automated Decision-
  Making & Profiling (ADMP v1.0). The framework is strict on its face: any
  automated decision-making or profiling now triggers a mandatory DPIA
  regardless of volume — no minimum-numbers exemption. The silent gap is
  the scope: the guidelines sit under the Personal Data Protection Act 2010
  (Act 709), whose Section 3 excludes the Federal and State Governments
  entirely — a blanket carve-out reportedly unique to Malaysia and
  Singapore. So the largest automated profiler of Malaysians — PADU, the
  central database holding a record on every citizen and PR aged 18+, which
  the Digital Minister confirmed in July 2024 is not bound by Act 709 — sits
  outside the very rulebook now imposed on every private firm that scores a
  customer. As the state pushes an "AI-driven nation by 2030" and a national
  data-sharing policy, the automated decisions that most affect citizens
  (subsidy eligibility, welfare targeting, policing, immigration) are
  precisely the ones the new accountability regime cannot reach.
- **Verification path:** the three JPDP guideline texts (pdp.gov.my), Act
  709 Section 3 (non-application to Federal/State Government), the Personal
  Data Protection (Amendment) Act 2024 (the DPIA-mandate basis), the
  Digital Minister's July 2024 statement on PADU's exemption, the DPA event
  records, and a comparator (GDPR Art. 22 ADM safeguards; Singapore PDPA's
  parallel public-sector carve-out and its separate PSGA regime).
- **Lenses:** Technology, Rights, Governance.
- **Risk flags:** low 3R, low defamation — critique the statutory scope and
  the design choice, not any named official. Note the binding/advisory line
  carefully: the DPIA *obligation* flows from the amended Act, but the three
  documents are *guidelines*; do not overclaim them as hard law. Confirm
  PADU's current legal footing at Phase 1 (the exemption is a ministerial
  position grounded in s.3, not a separate statute) and do not claim PADU
  data has been misused — the issue is the absence of a statutory check, an
  anxiety-of-precedent frame, not an allegation of abuse.
- **Adjacency:** `1454` (MySejahtera health-data governance), `1884` (PDPA
  reform stall), `1259` (PDPA enforcement — 8 penalties), `1285` (privacy
  complaints +67%), `cimb-data-breach-denial`, `data-center-johor-water-power`,
  and the cycle's A1 (MyIMMs) — the government's own data systems are the
  through-line.

---

## Tier B — develop if Tier A blocked

### B1. A state cannot ban lotteries on moral grounds — only the federal minister licenses gambling
- **Radar:** silence-watch S22, silence=0.98, importance=0.51, age=3.4d, [legal, political]
- **Date:** 2 June 2026 (Court of Appeal majority grounds reported);
  Federal Court leave hearing set for 12 August 2026
- **Why develop:** A genuine federalism ruling with a live next date, and
  it tests T4A's 3R discipline cleanly. In a 2-1 majority the Court of
  Appeal (Faizah Jamaludin, Lim Hock Leng; Azizah Nawawi dissenting) held
  that Kedah cannot refuse to renew pool-betting and lottery licences on
  the moral ground that it opposes gambling: licensing sits with the
  finance minister under federal law, and a blanket non-renewal usurps
  that power. A state may still regulate premises factors — building
  safety, sanitation, nuisance, location suitability. The T4A angle is the
  jurisdictional line: where does a state's local-government power end and
  the federal licensing regime begin, and what is left of state discretion
  once "morality" is ruled out?
- **Verification path:** the Court of Appeal majority and dissent grounds,
  Ninth Schedule (Federal vs State Lists) of the Federal Constitution,
  Local Government Act 1976, Pool Betting Act 1967 / Common Gaming Houses
  Act licensing conditions (incl. the Muslim-prohibition note on tickets),
  the 2025 High Court ruling this appeal upheld, the comparable Perlis case.
- **Lenses:** Legal, Governance, Historical.
- **Risk flags:** MEDIUM-HIGH religious — gambling and a state's stated
  moral objection sit close to belief. Frame strictly as constitutional
  division of powers (who licenses, on what grounds), never as a verdict
  on whether gambling is right or wrong, and never as commentary on any
  community. If the brief drifts toward the morality of gambling itself,
  hold. Consider Stage 5 re-enable per the CLAUDE.md religious-risk rule.

### B2. Three approved terminals, all suburban: how a licensing rule pushed a 20-year operator out of KL
- **Radar:** silence-watch S20 (Aeroline exit) + S10 (APAD enforcement),
  silence=0.99, importance≈0.47-0.56, age=3-6d, [political, economic]
- **Date:** 30 May 2026 (Aeroline KL-exit announcement); 2-3 June 2026
  (APAD defends enforcement)
- **Why develop:** Two silence picks that are one story, and it adds the
  Economic / urban-mobility lens the recent run is starving. After 20+
  years Aeroline (operator Zulco Sdn Bhd) is exiting KL because the only
  APAD-licensed terminals open to it — 1 Utama, LaLaport, IOI City Mall —
  are all out of the city centre, and the one closest in (LaLaport) charges
  commercial fees the operator says it cannot absorb without raising fares.
  APAD says it enforced a clear rule after three 2025 show-cause letters
  and a November 2025 suspension, and gave nearly five months to comply.
  The T4A angle is the policy-design question: when the licensed-terminal
  map has no viable city-centre option, does "enforcement" amount to a
  back-door ban on premium intercity coaches into KL?
- **Verification path:** APAD's enforcement statement and the show-cause
  timeline, Land Public Transport Act 2010 terminal-licensing provisions,
  the list of APAD-approved KL-area terminals and their fee schedules, the
  TBS-BTS / Pekeliling terminal-consolidation policy history, Aeroline's
  own statement.
- **Lenses:** Economic, Governance, Regional.
- **Risk flags:** low — fair comment on a public regulator's stated policy.
  Name only the documented rule and the operator's stated reasons.

### B3. A ministry launched a pharmacy degree abroad without asking the board that licenses pharmacists
- **Radar:** silence-watch S25, silence=0.99, importance=0.52, age=0.2d, [political]
- **Date:** 5 June 2026 (PM directs two ministries to resolve);
  background surfaced May 2026
- **Why develop:** Small N but a textbook inter-agency coordination
  failure, and it carries an Education / Health lens this run lacks. The
  Higher Education Ministry offered a Doctor of Pharmacy (PharmD) programme
  at Egypt's Alexandria University; the Pharmacy Board Malaysia was not
  consulted, and now graduates face blocked professional recognition.
  Students could not sit the Poison Act qualifying exam in their fourth
  year because the programme is not on the Board's recognised list. MQA has
  no objection to *academic* recognition; *professional* registration is
  the Board's call and remains unresolved. On 5 June the PM ordered both
  ministries to fix it fast. The T4A angle: who carries the cost when one
  arm of government promises a pathway another arm never approved?
- **Verification path:** Pharmacy Board Malaysia recognised-degree list and
  the recognition guidelines, MQA's academic-recognition statement, Poison
  Act / Registration of Pharmacists Act qualifying-exam rules, the Higher
  Education Ministry's programme announcement, the PM's directive.
- **Lenses:** Health, Governance, Social.
- **Risk flags:** low. Confirm the exact number of affected students
  before publishing — early reports cite four in one cohort; do not
  generalise to "Malaysian students" without a denominator.

### B4. JAS enforcement yield — 5,000+ inspections, RM4.59m in fines (carry-over)
- **Frame:** Carried from the 2026-06-04 curation (was A2). Not in this
  cycle's silence-watch top 25, so demoted to a watch item, but it remains
  the cleanest Environmental-lens pick on file and the recent run has no
  Environmental slot. Develop if Tier A/B slots free up, or pair with the
  Terengganu DOE oil-spill EQA-enforcement angle (below) into a combined
  enforcement-yield piece. Verify the full JAS release figures, EQA s.27
  penalty schedule, and Auditor-General prior reports on DOE/JAS
  enforcement yield — per-case deterrence is the question, not the headline.

---

## Skip — already covered, stubs, deferred, or held

### Published / shipped (silence-watch echoes)
- S1 (KKM cost-saving) → published `2001`
- S2 (Suhaili / Bersatu Art. 49A) → published `2000`
- S8 (MACC RM548m freeze appeal) → published `2007` (the High Court
  refusal it stems from)
- S6 (Rafizi 9-hour MACC questioning) → collapses into published `1990` /
  brief `macc-rm1-1b-rafizi-28-pages`

### Calendar / single-word stubs in queue and silence-watch
- S4 "budget 2027 presentation", S5 "parliament budget session opens",
  S9 "parliament second session opens" — scheduled-event placeholders
  (1-4 news, ~1 social), not developable findings. Track as noise floors.
- Queue ranks #4-#10 ("malay", "federal", "india", "parliament",
  "chinese", "budget") — topic-level attention, not candidate stories.

### Adjacent to an existing brief or published arc
- S7 (Pemuda MCA anti-Azam Baki) and S15 (Syahredzan vs ex-MACC chief)
  → adjacent to `macc-chief-watchdog-crisis` brief; no standalone leverage
  beyond it. Defer unless a board substantively acts.
- S12 (tourism — high-income China segment) → adjacent to
  `penang-tourism-china-india-asean`.
- S3 (Sabah 40% revenue — stay-application ruling) → in-flight brief
  `sabah-two-ma63-delays-akps-vs-40pc-revenue-stay.md` and published `1981`
  already frame the stay. Finish-or-retire: develop the brief **only if**
  the stay-application ruling lands as a genuinely new outcome; otherwise
  formally retire so silence-watch stops re-surfacing a covered case.

### Open investigation — hold for charges
- S14 (MACC investigates two over IJM takeover) → no charges; defamation
  exposure too high for the T4A standard until a charge sheet exists.

### 3R-sensitive — hold behind the higher verification bar
- S13 (300 detained incl. 12 alleged deviant-teaching leaders) → HIGH
  religious. Hold unless two independent primary sources (police statement
  + any charge) are available in full text, and critique process
  (detention authority, due process), not belief.
- S11 (Wesak drone / firecracker policing, Penang) → religious-adjacent,
  low leverage. Skip.

### Sensitive — hold
- S16 (Zara Qairina inquest audio) → a minor's death; and at 18 news / 15
  social not genuinely silent (silence=0.86). Hold.

### Low-leverage / punditry / single-instance
- S17 (Rayer on public shooting), S18 (Syed Hussin PRU16 speculation),
  S21 (Wan Fayhsal on Hamzah/Peja/Azmin), S24 (Fadhli on PAS-Bersatu
  electoral pact) → reaction/punditry, no decision to anchor a fact card.
- S10 (APAD enforcement) → folded into B2.
- S20 (Aeroline) → folded into B2.

---

## Methodology notes

- "Already covered" check ran against `src/data/issues/*.json` headlines
  and contexts plus `engine/briefs/*.md` filenames (84 in-flight briefs
  excluded).
- "Saturated" means mainstream coverage already supplies the missing
  context T4A would otherwise add.
- The `silence_anomaly` bias in the queue means many high-rank items are
  *low* news mentions but high *structural* importance — the queue working
  as designed, but rank order is not develop order.
- Every Tier A/B pick this cycle was confirmed against live primary-leaning
  sources (court grounds, regulator statements, ministry directives) before
  listing; URLs go into the Phase 1 brief, not here.
- Pick A3 came from a Digital Policy Alert pass rather than the domestic
  news/social radar. DPA tracked seven Malaysia digital-policy events in
  2026 (the OSA Child Protection + Risk Mitigation codes in force 1 June, a
  MCMC content-removal notice on royal-institution posts, a Quality-of-
  Service determination, and the three 30 April JPDP data-governance
  guidelines). Of these the ADMP/profiling guideline is the silent
  structural pick; the OSA age-verification code is a secondary candidate
  (held — age-verification is globally live and better developed once the
  code's enforcement record exists), and the royal-institution removal
  notice is 3R (royalty) and held behind the higher verification bar.

### Silence-watch obligation (Tier S) — status

Curator rule: each cycle, at least one Tier A or Tier B pick must come
from the top 5 of `silence-watch.md`, OR each of those top 5 must appear
in Skip with a one-line reason.

This cycle satisfies the rule via the second clause:
- S1 → Skip (published `2001`)
- S2 → Skip (published `2000`)
- S3 → Skip (finish-or-retire; brief + `1981` already cover the stay)
- S4 → Skip (calendar stub)
- S5 → Skip (calendar stub)

All five top-silence picks are accounted for with stated reasons. The
fresh developable signal this cycle sits lower in the silence ranking
(S19, S20, S22, S23, S25) — picked into Tier A/B above — because the top
of the silence list has now largely been shipped or is calendar noise.

_Refreshed 2026-06-05 against the same-day raw scan; supersede on the
next curator refresh._
