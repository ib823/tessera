# Radar — Top Issues to Develop

Scan: 2026-09-18 22:14 UTC (CI run 1956, `radar-scan.yml`). Queue size:
1,214 (524 entries first seen since 4 Sep). 505 events fetched; five
sources healthy; six streams ok. Latest published ID: **2012**
(sourceDate 2026-09-05). Next free ID: **2013**.

Curated from `radar/output/issue-queue.json` and
`radar/output/silence-watch.md`. This is the `editorial review` step in
the documented flow: `radar scan → issue-queue.json + silence-watch.md →
top-issues-to-develop.md → editorial review → publish pipeline`. The radar
does not write issues; this list curates which candidates enter the
10-phase publish flow.

## What changed this cycle — read this first

The previous edition was pinned to the **2026-09-03** scan. All three of
its Tier A picks have since shipped: **2010** Tabung Haji RCI
restatement (4 Sep), **2011** Sarawak haze / Transboundary Haze Act
(4 Sep), **2012** Felda decade-late audit (5 Sep). Nothing has shipped
since 5 Sep, so the next three slots (Tue 22, Thu 24, Sat 26 Sep MYT)
are open.

Since 4 Sep the radar has run ~170 more cycles. Five story clusters
dominate the fresh track, and the silence filter again splits most of
them into many low-scoring entries:

1. **Najib conditional pardon (18 Sep).** ~20 entries in one cycle: FT
   Pardons Board, house arrest on payment of the RM50m fine, DAP
   emergency CEC on 19 Sep, Umno's nationwide donation drive to pay the
   fine, a "fake" house-arrest order the FT minister has reported to
   police. The pardon itself is a royal prerogative (Article 42) and is
   held behind the 3R bar. **The donation drive is the T4A story**
   (Tier A2 below).
2. **AGC drops four of Muhyiddin's charges (15-16 Sep).** Highest-scoring
   fresh entry in the queue (0.579, rank 30, `[institutional, legal]`),
   plus the MACC officer who retracted a police report against the
   defence lawyer, Bersatu's call to lift the account freeze, and reform
   groups asking the AGC to explain. Tier A1.
3. **Electricity: 800kWh exemption (16-17 Sep).** Households up to
   800kWh exempt from AFA, retail charge and SST until 31 Dec; economy
   minister ties the bills to a "global energy shock"; PM convened a
   special meeting. 0.477, rank 109, F15 on the fresh track. Tier A3.
4. **Sabah / Sarawak seats and MA63 (11-17 Sep).** PM says both states
   get a bigger share of Dewan Rakyat seats; EC will re-delineate
   nationwide if Parliament approves; PAS wants east-coast seats too;
   Bintulu Port moved to Sarawak jurisdiction on 14 Sep after two
   federal Acts were repealed; Sarawak floats a 5-10 % federal-revenue
   special grant. Tier B1 (needs the bill).
5. **Negeri Sembilan proclamation saga (14-18 Sep).** Exco statement on
   the Ruler's removal; AGC says gazetting it is unconstitutional; DKU
   lodges a police report; State Secretary's Office sides with the AGC;
   the MB endorses the Exco and asks for gazetting. Royalty CRITICAL.
   Already published as **1976** (April episode) with a full in-flight
   brief; this is an **edition 2 update, Stage 5 required**, not a new
   issue.

**Radar health.** 1,956 CI runs; the last eight today all succeeded.
`state.json` and the prediction pipeline are intact on CI. The daily
Malaysia-impact pass (`malaysia-impact-pass.yml`) reports success but
still writes nothing: `radar/output/malaysia-impact-watch.{json,md}` do
not exist because `ANTHROPIC_API_KEY` is unset. Unchanged since 3 Aug.
Second operational note: `radar/config/malaysia-calendar.json` says "no
scheduled state elections in 2026", yet the queue carries Melaka-poll
items (12, 15, 18 Sep). The Melaka assembly's term runs out around
November 2026; add a window so the hazard model stops treating those
items as calendar-free.

**Top-of-queue caveat.** Ranks 1-16 remain single-keyword stubs
(`india`, `malay`, `chinese`, `federal`, `budget`) and calendar
predictors (`parliament budget session opens`, p(eruption within 72h)
0.99 against the 5 Oct sitting). They are radar structure, not stories.
Read the silence-watch and the fresh list below instead.

Every number quoted below is a **radar signal, not a verified figure**
unless it is marked as already traced in a brief.

---

## Tier A — develop next (this week)

### A1. The AGC dropped four charges against Muhyiddin on "evidence and litigation risk". The reasons stay in the AGC.
- **Radar:** 15 Sep "MACC officer retracts police report against
  Muhyiddin's lawyer; court decides not to cite for contempt" (0.579,
  the top fresh entry; 42 news / 14 social, `DELAYED_FUSE`); 16 Sep
  "AGC: dropping four charges against Muhyiddin based on evidence,
  litigation risks; three Jana Wibawa charges remain" (0.286, 54/15);
  15 Sep "Bersatu wants freeze on accounts lifted after acquittal"
  (23/4); 17 Sep reform groups and think-tanks say the AGC gave no
  explanation (BM, 2/3); 14 Sep MACC officer denies the key witness got
  "special treatment" or immunity (39/13). Dims [institutional, legal,
  political].
- **Why develop:** the 3 Aug and 4 Sep editions skipped Jana Wibawa as
  saturated and sub judice. The story has changed shape: the question is
  no longer the trial but the **discretion to discontinue**. Article
  145(3) lets the AG withdraw any charge; nothing obliges the office to
  publish reasons; a two-line statement is the entire public record. The
  structural fix (the AG-Public Prosecutor split) is already T4A issue
  **1997**, still in committee with the report unpublished. That is the
  reframe: the office that decided this is the office Parliament is
  still deciding how to split.
- **Verification path:** AGC's 16 Sep statement (full text); the High
  Court order of discharge and whether it is DNAA or acquittal; the
  charge sheets (which four Sections, which three remain); the Article
  145(3) text; the AG-PP bill committee status from **1997**'s brief;
  the retracted police report and the court's contempt decision (15 Sep).
- **Lenses:** Governance, Legal, Political.
- **Risk flags:** Political HIGH (Bersatu is the main opposition party);
  3R none. **Sub judice:** three charges are live; count charges, quote
  the AGC verbatim, never characterise guilt or innocence. **Stage 5:**
  not triggered at HIGH; re-check after the brief if the take sharpens
  to CRITICAL.
- **Related:** 1997, 1961, 1988.

### A2. Malaysia has no political-financing law. This week a party opened a nationwide drive to pay a RM50m criminal fine.
- **Radar:** 18 Sep "Zahid announces Umno donation drive to pay Najib's
  RM50m fine following conditional pardon" (silence detector INST-0027,
  importance 0.33); 8 Sep "MACC: political financing bill should set
  clear penalties, ensure independent enforcement" (0.477, rank 107,
  57/16, `[institutional, political]`); 14 Sep column "The political
  financing bill: what's taking so long?" (36/6); 18 Sep "Umno hopes
  Najib's conditional pardon will provide boost ahead of Melaka polls"
  (62/26). Foreign comparator in the same window: two £36m crypto
  donations to Reform UK (12 Sep), which the UK law at least makes
  public.
- **Why develop:** the pardon is the loudest story of the month and T4A
  cannot touch the decision itself (royal prerogative). The gap
  mainstream leaves open is the money: who may give a party funds, how
  much, and whether the public ever learns the names. The bill was a
  2018 manifesto item, went to a National Consultative Council that met
  once, and the MACC is now publicly lobbying for it. Draft **1307**
  ("Political financing transparency law remains absent since 2018
  promise") and **1114** (NCC met once) exist unpublished and legacy;
  supersede them with a fresh brief rather than revive.
- **Verification path:** Zahid's 18 Sep statement and the mechanism of
  the drive (account, cap, disclosure); the FT Pardons Board's stated
  conditions (fine amount, deadline); the 2018 PH manifesto pledge; the
  NCC on political financing (2019) and its output; MACC's 8 Sep
  statement; the Societies Act 1966 and Election Offences Act 1954
  provisions that currently touch party money; Hansard answers on the
  bill's status in the June 2026 sitting.
- **Lenses:** Governance, Legal, Political.
- **Risk flags:** Political CRITICAL (Umno, DAP, PN all live on it);
  Royalty adjacent (the pardon). **Hard guardrails:** no card evaluates
  the pardon decision or the Pardons Board; critique the absence of a
  statute, not the party. Do not imply the drive is unlawful; the point
  is that no law speaks to it. **Stage 5: TRIGGERED** (Political
  CRITICAL with a sharp take) per CLAUDE.md / ADR-0004. Budget the extra
  browser round.
- **Related:** 1997, 1990, draft 1307, draft 1092.

### A3. Households up to 800kWh are exempt from three electricity charges until December. Nobody has said what it costs.
- **Radar:** 17 Sep "Anwar: households using up to 800kWh exempt from
  AFA, retail charge and SST on electricity bills until Dec 31 amid haze,
  heat" (0.477, rank 109, 73/31, F15); 16 Sep "Anwar to review impact of
  electricity bill increase at special meeting tomorrow" (0.408, 62/19);
  17 Sep "Global energy shock now hitting Malaysia's electricity costs,
  says economy minister" (0.286, 55/21); 17 Sep "Govt raises electricity
  bill protection threshold to 800kWh" (34/7). Accumulated companions:
  S1 diesel subsidy RM2.5b a month (127 days quiet), S2 "consider the
  RM50b fuel subsidy bill" (56 days). Dims [economic, ethnic, political].
- **Why develop:** an exemption announced as haze relief, framed by the
  economy minister as an energy-price shock, with the Budget session
  opening 5 Oct and Budget 2027 on 23 Oct. Mainstream carries the
  threshold; it does not carry the bill. The T4A angle is the missing
  denominator: how many households sit under 800kWh, what the AFA is
  (the automatic fuel pass-through in the 2025 tariff structure), who
  absorbs the waived amount (TNB, the Electricity Industry Fund, or the
  Treasury), and how this sits against the RM8b-a-year rationalisation
  target T4A already published as **1102**.
- **Verification path:** the Energy Commission's tariff schedule and AFA
  mechanism (gazette / ST circular); the PMO or MoF statement of 17 Sep
  with the cost estimate if one was given; TNB's Bursa filing if the
  waiver is borne by the utility; the 2025 tariff-restructuring
  announcement for the previous threshold; DOSM household electricity
  consumption distribution.
- **Lenses:** Economic, Governance, Environmental (alt: Health for the
  haze link).
- **Risk flags:** all LOW. Ethnic dim is a radar keyword artefact.
  **Stage 5:** not triggered.
- **Related:** 1102, 2011, 2001.

---

## Tier B — develop if Tier A blocks, or for the first October slots

### B1. More Sabah and Sarawak seats means an Article 46 amendment and a nationwide re-delineation
- **Radar:** 11 Sep "Sabah, Sarawak to get bigger share of parliament
  seats, Anwar says as MA63 push moves ahead" (0.286, 64/16); 13 Sep "EC
  to review electoral boundaries nationwide if parliament approves more
  Sabah, Sarawak seats" (0.392, 68/9); 11 Sep Salleh Said Keruak on the
  one-third share (55/15); 13 Sep PAS: east coast also needs seats
  (13/6); 14 Sep "Bintulu Port comes under Sarawak jurisdiction following
  repeal of federal acts" (98/18); 13 Sep Sarawak proposes 5-10 % of
  federal revenue as special grant (19/3); 16-17 Sep Armizan / Anwar on
  MA63 as a national promise (54/19, 72/22).
- **Why develop:** the seat count is a constitutional amendment
  (two-thirds), and the EC has said it triggers re-delineation
  everywhere, which reopens the malapportionment question draft **0172**
  (Putrajaya 20,834 voters vs Kapar 179,000) and draft **1015** (14
  seats redrawn without public hearing) never shipped. Bintulu Port is
  the first concrete devolution instrument of the cycle and a primary
  document (two repealing Acts).
- **Hold until:** the amendment bill is tabled in the 5 Oct sitting.
  Brief now, Stage 1 when the bill text exists.
- **Lenses:** Governance, Legal, Regional. Ethnic MEDIUM (Borneo vs
  peninsula framing); keep the anger on the arithmetic, not on states.
- **Related:** 1981, 0160 (draft), 0172 (draft), 1015 (draft).

### B2. The 2024 citizenship amendment still has no commencement date (silence pick)
- **Radar:** 12 Sep "Home ministry to announce effective date for
  citizenship amendments once ready" (0.348, 62/9, `DELAYED_FUSE`); BM
  version 1/3. Dims [political].
- **Why develop:** the Constitution (Amendment) Bill 2024 passed the
  Dewan Rakyat on 17 Oct 2024 and the Dewan Negara on 3 Dec 2024 (traced
  in **1325**'s brief). A commencement still "being prepared" in
  September 2026 is a Rights-lens story with a single clean number: the
  months since royal assent. Verify first whether any part has been
  gazetted into force; if it has, this is an update to 1325, not a new
  issue.
- **Lenses:** Rights, Legal, Governance. 3R LOW.
- **Related:** 1325, 1265, 1247.

### B3. Melaka adds up to seven nominated assemblymen, and Melaka polls are now in the queue (accumulated S4, carried from 4 Sep B4)
- **Radar:** S4 rank score 1.376, 66 days quiet (74/25, [legal,
  political]); 12 Sep "PH prepared to go solo in Melaka polls" (24/3);
  18 Sep Umno hopes the pardon boosts Melaka polls (62/26); 15 Sep CM's
  office denies the CM signed a dissolution order (19/3).
- **Why develop now:** a nominated-member amendment passed with no
  analysis of what it does to a 28-seat assembly, and an election is
  close enough that parties are pricing it. Check first whether the
  in-flight brief `engine/briefs/johor-unelected-reps-bill.md` (issue
  reader exists) can absorb Melaka as case two.
- **Lenses:** Governance, Legal, Political. 3R LOW.

### B4. Government and police seek leave to appeal the gravedigger custody-death ruling (accumulated S23)
- **Radar:** rank score 1.166, **176 days quiet** (52/16, [legal,
  political]), the oldest structurally-important item still open. Source
  date 27 Mar 2026.
- **Why develop:** the silence-watch rule says take one accumulated pick
  per cycle; this is the cleanest. A High Court finding on a 2019
  lock-up death, and the state appealing it, is a Rights story built on
  a judgment text. Draft **1853** (immigration detention deaths) is
  adjacent but different custody.
- **Verification path:** the High Court judgment; the leave application
  at the Court of Appeal and its hearing date; Suhakam's custodial-death
  count for the year; the IPCC Act 2020 complaint route.
- **Lenses:** Rights, Legal, Security. 3R: Ethnic MEDIUM if the deceased's
  community becomes the frame; keep it on custody procedure.

### B5. A new Act to replace AUKU is being "fast-tracked" (F14)
- **Radar:** 15 Sep (0.20, 18/4, `below-expected coverage`).
- **Why develop:** the Universities and University Colleges Act 1971
  amendment has stalled across three sittings (draft **1341**, unpublished
  legacy). "Simplifying provisions on the establishment of universities"
  is the minister's frame; whether Section 15 (student political
  activity) goes is the reader's question. Hold for the bill; brief from
  the 2018-2023 record now.
- **Lenses:** Rights, Governance, Social. 3R LOW.

### B6. Illicit tobacco: "US$775m a year, 55 % market share" (F1)
- **Radar:** 16 Sep, F1 on the fresh track (fresh score 0.697; 72/12,
  `24h+ silence then rising`), 0.408 in the queue.
- **Why develop, carefully:** the number is being quoted everywhere. The
  T4A angle is provenance: who commissioned the study, what the
  denominator is, and whether the Customs / MoF seizure and excise data
  agree. If the study is industry-funded, that is the reframe. If the
  provenance cannot be established, skip.
- **Lenses:** Economic, Health, Governance. 3R LOW.

### B7. Fatal Sarawak Flying Doctor Service crash: MOH to review all helicopter contracts and the RM30 flight allowance
- **Radar:** 13 Sep (0.274, 64/8); 9 Sep senator urges grounding BO-105s
  (66/17); 12 Sep Sarawak reviews safety needs (BM, 6/1).
- **Hold until:** CAAM's preliminary report. Then Health / Governance /
  Regional: a procurement chain and a RM30 allowance exposed by one
  crash.

---

## Carry-over — still open, unbriefed

- **National Trust Fund (KWAN) Bill 2026** (accumulated S9, 65 days).
  Statute story with primary sources public; still the safest fallback.
- **Diesel subsidy RM2.5b a month** (S1, 127 days) and **RM50b fuel
  subsidy bill** (S2). Fold into A3's brief as the subsidy denominator
  rather than develop separately.
- **PWD spent its entire RM2b road-maintenance allocation by August and
  will seek more** (S15, 32 days). Pre-Budget Governance pick for
  October.
- **PAC procurement safeguards at MAHB** (S10).
- **Border system (MyIMMs / insider breach)** and **2,001 factory
  fires** (from 3 Aug). Puchong blaze gutted four factories on 17 Sep
  (53/19) if the fires story is revived.
- **Altantuya family's RM5m damages bid**, Federal Court 27 Oct (S11).
  Develop the week before the hearing.
- **AG vs Malaysian Bar on DNAA standing** (from 3 Aug). Now pairs with
  A1; consider merging into A1's brief as the second case.

---

## Updates to published issues (edition bumps, not new IDs)

- **1976 Negeri Sembilan.** The 16 Sep Exco statement, the AGC's 17 Sep
  opinion that gazetting the proclamation is unconstitutional, the DKU
  police report, the State Secretary's refusal to gazette, and the MB's
  endorsement. Royalty CRITICAL: **Stage 5 required** for the update.
  The in-flight brief `negeri-sembilan-undang-deposal-declaration.md`
  carries all six stage outputs; extend the PERIOD and re-run Stages 2,
  3 and 5 on the new cards only.
- **2010 Tabung Haji.** 9 Sep: former TH chairman Azeez Rahim charged;
  14 Sep: ex-minister Jamil Khir claims trial to misappropriating RM860m;
  13 Sep: Puad calls the probe calls "mere politics". Charges are
  charges; period update only.
- **2011 Haze.** 17 Sep: Suhakam calls for a Clean Air Act; PKR Youth
  calls to revive the Transboundary Haze Act; the smoke moved west (41
  peninsular areas unhealthy on 16 Sep, Sarawak clear). Strengthens the
  existing reframe; edition 2 when the Act is next mentioned in
  Parliament.
- **2012 Felda.** 11 Sep: special committee's interim report due
  end-September. Hold the update for the report.
- **1993 / brief 2000 (Article 49A).** 14 Sep: Federal Court reserved
  decision on PKR's appeal to restore Zuraida's RM10m bond (F2/F8,
  76/18). Update the `suhaili-bersatu-coa-article-49a` brief's PERIOD;
  develop when the decision lands.
- **1979 draft (1MDB recovery).** 13 Sep: government "takes note" of a
  RM4.2b claim against DBS (F3, 4/3). Source for the draft, not a pick.

---

## Skip — covered, held, saturated, or low-leverage

### 3R-sensitive — hold behind the higher verification bar
- **The Najib pardon decision itself** (18 Sep, ~20 entries). Royal
  prerogative under Article 42; the FT Pardons Board's deliberations are
  not public. Draft **1092** already sits unpublished on the 2024 home
  detention. Only the financing angle (A2) enters the pipeline.
- **Umno assembly "joke" about Catholic clergy** (14-15 Sep; Unity
  Minister urges action, Catholic Lawyers' Society to lodge report).
  Religious HIGH, single named individual. Skip.
- **GISBH fails to challenge Kedah fatwa** (11 Sep) and **Hadi's call to
  repeal "colonial-era laws restraining Islam" (Act 355)** (9 Sep).
  Religious HIGH. Hold.
- **Queen of Malaysia orders Johor carnival postponed over haze**
  (15 Sep). Royalty; use only as a dated fact in 2011's update if at all.

### Saturated or horse-race
- **Zahid "kick us out if you dare" / Umno-PAS realignment / Anwar-Zahid
  ambiguity / Hamzah's absence** (11-18 Sep). Intra-coalition positioning,
  no policy mechanism.
- **DAP's emergency CEC on the pardon** (19 Sep). Wait for the outcome;
  it may become a coalition-arithmetic update for the simulation engine,
  not an issue.
- **Hannah Yeoh's "fake" house-arrest order** (18 Sep). Police probe
  opened; hold.
- **Rosmah additional-evidence stay** (17 Sep, F10) and **Shafee vs
  Malaysian Bar damages cut to RM120,000** (14 Sep, F6/F7). Procedural
  rulings; niche.

### Open investigation — hold for charges or reports
- **Kedah fertiliser company MD on MACC bail** (17 Sep); **Kelantan
  nepotism claims** (17 Sep); **Kepong "stare" case, AGC reviewing
  representation** (17 Sep).
- **Lenggong boarding-school food poisoning, ~160 ill** (11 Sep). Hold
  for the MOH report.

### Low-leverage or better as a source
- **Filial-support law "likely next year"** (17 Sep, 97/22). Track;
  develop when the bill exists, with Singapore's Maintenance of Parents
  Act as comparator.
- **68,000 job losses this year, mostly manufacturing and retail**
  (18 Sep, 16/6). Source for a Budget-week Economic issue.
- **Jelutong reclamation grew from 4ha to 28ha** (14 Sep, 60/7). Local;
  track for a Penang cluster with 1039 / 0148 drafts.
- **4,646 domestic-violence cases Jan-Jul** (12 Sep); **stray-dog
  hotspots** (12-13 Sep). Social; no policy mechanism yet.
- **AirAsia denies bailout talk**, **Capital A exits BigPay / Tune
  Protect**, **Sri Petaling radiation scare**. Skip.
- **India-US sanctions bill, Heathrow, Sweden election, Macron
  infrastructure order, Indonesian ferry** (F12, F13, foreign). Route to
  the impact pass, which is still dark (see health note).

_Refreshed 2026-09-18 (UTC) from the 2026-09-18 22:14 UTC CI scan.
Supersede on the next curator refresh._
