# BRIEF — RCI: Tabung Haji's declared RM3.4b profit for 2017 was a RM1.4b loss

**Slug:** tabung-haji-rci-2017-restatement
**Proposed issue ID:** 2010
**Radar provenance:** silence-watch fresh-track F7 (silence 0.92, structural importance 0.62,
first seen 2026-07-30); develop-list pick A1, 2026-08-03 curation
**Source date:** 2026-08-09 (was 2026-08-03; refreshed when the report itself was opened)
**Brief status:** Phase 1 complete. **The blocking gap is closed** — the RCI report [P1] was
retrieved and read on 2026-08-09 after twenty-one failed attempts across three sessions. The
findings below marked ✅ are now quoted from the commission's own text with page citations.
Stage 1 may begin. Awaiting user approval to proceed.

## ISSUE

On 29 July 2026 the Cabinet declassified and JAKIM published the 211-page report of the
Royal Commission of Inquiry into Lembaga Tabung Haji, covering the fund's management and
operations from 2014 to 2020. The commission's central accounting finding: for financial
year 2017 Tabung Haji reported a **RM3.4 billion profit** when full application of Malaysian
Financial Reporting Standards would have produced a **RM1.4 billion net loss**. In that same
year it declared a profit distribution of 4.50% plus a 1.75% haj hibah, costing
**RM2.75 billion**.

The developable core is not the misconduct allegation, which mainstream coverage carries at
volume. It is the **mechanism**. Section 22(3)(a) of the Tabung Haji Act 1995 permits a
distribution only when the Fund's assets are not less than its liabilities. Management
tested that condition against a **realisable asset value (RAV)** of its own construction
rather than the audited financial statements — a valuation that, on the former chairman's
own published figures, converted a RM4.1 billion deficit into a RM373 million surplus for
2017. The statutory gate held; the number fed into it did not. The RCI's remedy is
correspondingly narrow and precise: require that distributions be calculated from audited
accounts.

Two further threads make this a T4A issue rather than a news recap:

1. **The auditor signed it.** The National Audit Department certified the accounts each
   year. The RCI criticised the Auditor-General's lack of firmness. A statutory gate, an
   external auditor and a supervising ministry all cleared a distribution the commission
   says should not have been declared.
2. **The report sat classified for roughly four years.** The commission was appointed on
   20 January 2022 for a six-month term ending 19 July 2022. The report reached the public
   on 29 July 2026. The Prime Minister's stated reason: releasing it earlier could have
   caused depositors to lose confidence and withdraw. The people whose money it concerned
   were the reason for withholding it.

**Accuracy posture.** No one has been charged. MACC opened a probe and formed a task force
in the week of 29 July 2026; the AGC is assessing the report for possible prosecution. The
RCI itself is reported to have stopped short of finding direct criminal breach of trust
while identifying breaches of Act 535. T4A must mirror that: no naming of individuals as
wrongdoers, no assertion of criminality, "alleged" and "the commission found" throughout.
The three religious affairs ministers named by Bernama held office during the period; naming
them as officeholders is factual, naming them as culpable is not.

## PRIMARY SOURCE — READ 2026-08-09 ✅

**How it was retrieved (record this; the next session should not have to rediscover it).**
The twenty-one prior failures were not an outage, a block, or a wrong URL. `www.islam.gov.my`
serves a leaf certificate issued by **GlobalSign ECC OV SSL CA 2018** but sends the **RSA**
intermediate in its chain — a server misconfiguration. Every fetcher correctly rejected it
with "unable to get local issuer certificate", which reads like a proxy trust failure and is
not one. Fix: pull the correct intermediate named in the leaf's AIA extension
(`http://secure.globalsign.com/cacert/gseccovsslca2018.crt`), append it to the session CA
bundle, and pass that as `--cacert`. The origin then answers, though it 403s a default curl
UA — send a browser `User-Agent`. `jakim.gov.my` remains denied at the egress gateway (502 on
CONNECT); `www.islam.gov.my` is the reachable host.

**Where the report actually lives.** JAKIM published no PDF. The announcement page's only
document link is a FlipHTML5 flipbook, **linked from the government's own page** as
"📖 Baca Laporan RCI Tabung Haji", uploaded by **"UNIT KOMUNIKASI KORPORAT (ISLAM)"** —
JAKIM's corporate communications unit. The flipbook is therefore the official publication
channel, not a third-party mirror. Its page manifest is obfuscated; it decodes with
FlipHTML5's own `deString.js` WASM module (`_DeString`), yielding 252 page images at
`files/large/<md5>.webp`. Report page N = flipbook image N+38.

**Front matter, verified.** Title: *Laporan Suruhanjaya Siasatan Diraja bagi Menyiasat Isu
Pengurusan dan Operasi Lembaga Tabung Haji dari Tahun 2014 hingga 2020*. **Presented to the
Yang di-Pertuan Agong Al-Sultan Abdullah on 30 Ogos 2022** (title page). Six commissioners:
**Tun Md Raus bin Sharif (Pengerusi)**, Tan Sri Samsudin bin Osman, Tan Sri Abdul Rashid bin
Hussain, Tan Sri Dr. Mohd. Munir bin Abdul Majid, Profesor Dr. Asmadi bin Mohamed Naim,
Norsyahrin bin Hamidon. Secretary: Datuk Hajah Hakimah binti Mohd Yusoff (now JAKIM
Director-General) (p. ix). Structure: Ringkasan Eksekutif (p. xi), four chapters, exhibit
list; **25 recommendations at 4.4.1–4.4.25**.

### The restatement, in the commission's own words ✅ (para 3.13.11, p. 111)

> "…bagi tahun kewangan 2017, sekiranya piawaian MFRS digunapakai secara sepenuhnya, LTH
> sepatutnya merekodkan **kerugian bersih RM1.4 bilion**, berbanding keuntungan sebanyak
> **RM3.4 bilion** seperti yang direkodkan dalam Penyata Kewangan 2017."

The same paragraph reproduces PwC's reconciliation verbatim (RM'million): profit for 2017
**3,412**; less impairment on AFS equity investments **(4,258)**; less impairment on AFS debt
securities **(7)**; less other adjustments **(580)**; total **(4,845)**; **adjusted loss
(1,433)**. And: retained earnings at 31.12.2017 **162**, less adjustments **(4,845)**,
**adjusted accumulated loss 4,683**. Both headline numbers are now traced to the primary
document, not to press summaries.

### The mechanism — better than the RAV story the brief was built on ✅

1. **The impairment-policy switch (paras 3.9.8 p. 77, 3.13.8–3.13.9 p. 110).** LTH recognised
   impairment only when an investment's market value had fallen **70%** below cost. In
   financial year 2017 that threshold was moved to **85%**, then to **90%** — the report notes
   the changes happened **twice in one year**. The commission reproduces PwC's sensitivity:
   at the >70%/>24-month test the impairment charge would have been **RM1,313 million**; at
   >85% it was **RM171 million**; at >90% it was **RM1 million**. LTH recorded **RM1.0
   million**. The report's own illustration: a RM1,000 shareholding was impaired only once it
   fell to **RM100**.
2. **The equity/liability misclassification (para 3.11.12, p. 94).** Depositors' funds
   (Kumpulan Wang Pendeposit) had been classified as **equity** in the financial statements
   **since 2010**. The commission calls this "satu representasi salah" — a misrepresentation —
   and says it should have been classified as a **liability**.
3. **Why that mattered (para 3.11.13, p. 94).** Because depositors' funds sat in equity *and*
   impairment was insufficient, the annual statements showed assets exceeding liabilities,
   "dan dengan itu membolehkan keuntungan (hibah) diisytiharkan mengikut **seksyen 22(3)(a)
   Akta 535**." The statutory gate was cleared by the presentation of the accounts, not by the
   condition the section actually tests.
4. **The RAV finding (para 3.11.9, p. 93).** The commission holds that hibah paid 2014–2017 on
   the basis of realisable asset value "adalah tidak selaras dengan kehendak seksyen 22 Akta
   535", because RAV is not a computation compliant with generally accepted accounting
   standards.
5. **The distribution-basis switch (para 3.9.9, p. 77).** For 2017 the hibah calculation was
   changed from monthly average balance to annual average balance, announced **7 February
   2018**, then **withdrawn after negative depositor reaction**; the monthly basis was
   reinstated. Effect: LTH paid out **RM600 million more** than it otherwise would have.
   Corroborated at 3.11.10 (p. 93) by JAN Deputy Director of Financial Audit **Mona binti
   Othman**: capacity was **RM2.70 billion** (4%, annual minimum balance); the board moved to
   monthly minimum balance at **6.25%**, paying **RM3.31 billion** — exceeding capacity by
   **RM0.61 billion (22.5%)**.

### The auditor thread, confirmed and sharper than the brief assumed ✅

- **Para 3.11.11 (pp. 93–94):** KAN found that the 2017 statements showed **assets RM70.317
  billion against liabilities RM74.409 billion**, "situasi yang sama juga ditunjukkan pada
  tahun 2015 dan 2016, tetapi LTH masih mengisytiharkan agihan keuntungan (hibah) walaupun
  syarat yang diperuntukkan di bawah seksyen 22 Akta 535 tidak dipenuhi."
- **Para 3.11.14 (p. 94):** the commission states flatly that the 2017 financial statements
  **"tidak seharusnya diberikan Sijil Audit Bersih"** — should not have been given a clean
  audit certificate — and that the matters recorded as an *Emphasis of Matter* should have
  been stated by JAN as **serious non-compliance**.
- **Para 3.13.5 (p. 108)** quotes the KAN Emphasis of Matter of **16 July 2018** verbatim:
  impairment policy inconsistent, changed twice in FY2017; **RM227.81 million** of impairment
  not recorded across 3 subsidiaries and 3 associates, of which **RM164.58 million** relates
  to **TH Heavy Engineering Berhad**.

This is stronger than the brief's earlier framing. The auditor did not merely lack firmness:
the commission says the certificate itself was wrong.

### Systemic risk — the argument for the 2018 rescue ✅ (paras 3.13.13–3.13.17, pp. 112–114)

The commission sets out why the deficit had to be closed before 31 December 2018: without a
hibah, LTH faced a possible **bank run** across then **9.2–9.3 million depositors**, forcing
fire-sales that would hit the banking system, bond market, equity market and property market;
failing that, the **section 24 government guarantee** would have to be activated, becoming a
first charge on the Fund and a debt to the Government, with a stated risk to the **sovereign
credit rating**. Deposits are put at **RM88 billion**, expected to reach RM100 billion within
two years (paras 3.13.16 p. 114, 3.18.7 p. 185). Cabinet approved the recovery plan on
**7 December 2018**; the PM approved the transfer on **19 December 2018**; **UJSB was
incorporated on 14 December 2018** (para 3.13.1–3.13.2, p. 107). The commission records that
losses had grown to **RM10 billion**, forcing the Government to act "dengan kadar segera"
(para 3.13.12, p. 111).

### Political interference — the commission's own characterisation ✅ (Ringkasan Eksekutif, paras 9–17, pp. xiii–xv)

- Act 535 gives the Minister broad powers over haj operations, funds and investments. The
  responsible minister is the Minister in the Prime Minister's Department (Religious Affairs);
  the commission found the expertise of **all three** religious affairs ministers across the
  period was **confined to religious affairs**, leaving the minister "bergantung sepenuhnya"
  on management's proposals on fund and investment matters. It recommends the supervisory
  power be **shared with the Minister of Finance** (para 10, pp. xiii–xiv).
- **Section 6(2)** requires only that a board member be **Muslim and a Malaysian citizen** —
  no competence criterion. On that latitude, "**pelantikan seorang Pengerusi LTH dan beberapa
  anggota Lembaga yang dilantik dalam kalangan ahli politik bagi tempoh 2014 hingga 2018**"
  followed (para 12, p. xiv).
- **Para 13 (p. xiv):** decisions including **hibah payments, haj fare setting, and HAFIS**
  were "**didorong oleh unsur-unsur politik**" — driven by political elements.
- The Act lets the Minister revoke a board appointment at any time **without giving reasons**;
  the commission records two uses: termination of CEO **Datuk Nik Mohd Hasyudeen bin Yusoff**
  on 5 May 2021 before his term ended 31 August 2021, and of chairman **Tan Sri Md Nor bin Md
  Yusof** on 15 October 2021 before his renewed two-year term expired (paras 14–15, pp.
  xiv–xv).

### What the commission recommends ✅ (para 4.4, pp. 192–199)

Twenty-five recommendations. The load-bearing ones: amend Act 535 to set **competence criteria
for board members**, and to **bar active politicians from serving as chairman or board member
of LTH and its subsidiaries** (4.4.1(a)–(c)); require reasons before any board member's
appointment is revoked (4.4.1(d)–(e)); carve the investment function out as a department
called **Dana Haji**, kept inside LTH but regulated by the **Securities Commission Malaysia**,
with the board having **no power to direct its investments** (4.4.23, p. 198; 3.18.3–3.18.8,
pp. 184–185); keep LTH out of high-risk and "strategic" investments (4.4.24, p. 198); limit
large withdrawals with one month's notice and restrict haj subsidy to those who need it
(4.4.20, p. 198); raise the Muassasah registration minimum from **RM1,300** to the current
**RM12,980**, which the commission says would cut the haj waiting time from **130 years to 33
years** (4.4.22, p. 198); and strengthen governance "**tanpa campur tangan politik**" (4.4.25,
p. 199).

The commission **rejected** proposals to break LTH up into separate entities, holding that the
institution should be kept as it is and the weaknesses fixed without major structural change
(para 4.3, pp. 191–192).

### The finding the coverage has largely missed ✅ (para 4.6, p. 199)

> "Suruhanjaya berharap Kerajaan akan menimbang supaya laporan Suruhanjaya ini **diumumkan
> kepada awam** mengikut mana-mana bahagian yang bersesuaian."

The commission asked, in the report itself, that the Government consider publishing it. That
request was made in the document presented on **30 August 2022**. Publication came on
**29 July 2026** — three years and eleven months later. The reason the Prime Minister gave in
July 2026 was that earlier release could have caused depositors to lose confidence and
withdraw; the commission had itself set out that same bank-run risk at 3.13.14 as the reason
the 2018 rescue was urgent. The withholding rationale and the rescue rationale are the same
argument, deployed eight years apart.

**This is the strongest available reframe** and it is fully primary-sourced: the body that
investigated asked for publication; the depositors whose money it concerned were the stated
reason for withholding it from them.

## PERIOD

- **2012-2017** — Bonus/hibah rates repeatedly exceed reported profit. Staff bonuses of
  between two and 13 months' salary paid between 2010 and 2017.
- **2014** — PwC later dates the start of the asset-liability deficit to this year. TH
  approves staff bonuses of up to 13 months (11 annual + 2 special), allocation RM74 million.
- **2014-2018** — Period in which the RCI locates political involvement in TH's management,
  including the appointment of a chairman and several board members from among politicians.
- **FY2017** — TH reports a RM3.4 billion profit; declares 4.50% hibah plus 1.75% haj hibah,
  costing RM2.75 billion.
- **2017 (PwC review)** — Assets RM70.3 billion against liabilities RM74.4 billion: a
  RM4.1 billion deficit. PwC puts accumulated losses at RM4.7 billion by end-2017.
- **11 Dec 2018** — Former TH chairman Abdul Azeez Abdul Rahim publicly rejects the breach
  finding, citing RAV figures showing surpluses for 2015, 2016 and 2017.
- **28 Dec 2018** — Restructuring completes: assets with a market value of about
  RM9.63 billion transfer to Urusharta Jamaah Sdn Bhd (an MOF Inc vehicle) for
  RM19.9 billion — RM19.6 billion in two sukuk tranches plus RM300 million cash.
- **2018** — Distribution falls to 1.25%. Deposits subsequently fall from about
  RM73 billion to RM69 billion (reported against the 2019 declaration).
- **20 Jan 2022** — Six commissioners appointed and commissioned by the 16th Yang di-Pertuan
  Agong; six-month term ending 19 July 2022.
- **~2023** — Anwar: "Three years ago, we were not in a position to publish the report."
- **24 Jul 2026** — Anwar confirms the report was withheld to avoid public panic and
  withdrawals, and signals imminent release.
- **29 Jul 2026** — Cabinet agrees to declassify (reported as reclassification to OPEN under
  s.2C of the Official Secrets Act 1972); JAKIM publishes the 211-page report — executive
  summary, four chapters, list of exhibits — with 25 recommendations.
- **30 Jul 2026** — MACC forms a task force and sends a team to TH headquarters; AGC to
  assess for prosecution. TH issues a statement defending the 2018 restructuring.
- **1 Aug 2026** — TH says it has distributed on audited results since 2022 and has
  implemented about 75% of the recommendations.

## ACTORS

- **Lembaga Tabung Haji (TH)** — statutory pilgrimage savings fund; more than 9.8 million
  depositors (TH, Aug 2026); deposits reported at RM88 billion in the RCI's
  recommendation context.
- **The Royal Commission of Inquiry** — six members, appointed 20 Jan 2022 by the 16th Yang
  di-Pertuan Agong. Reported chair: former Chief Justice Md Raus Sharif, with members
  including former Chief Secretary Samsudin Osman and RHB founder Abdul Rashid Hussain.
  *Composition to be confirmed against the report's own title page before publication.*
- **PricewaterhouseCoopers** — special review that produced the deficit and restatement
  findings; with Ernst & Young and Roland Berger, one of the three studies the RCI's terms
  of reference were built on.
- **National Audit Department / Auditor-General** — issued the annual certifications; the
  RCI cites a lack of firmness among the contributing factors.
- **JAKIM** — publisher of the declassified report.
- **MACC** — task force and probe opened 30 July 2026. **AGC** — assessing for prosecution.
- **Abdul Azeez Abdul Rahim** — TH chairman during part of the period; author of the
  11 Dec 2018 rebuttal that the 2014-2017 declarations complied with s.22(3)(a).
- **Religious affairs ministers over the period** — Jamil Khir Baharom, Mujahid Yusof Rawa,
  Zulkifli Mohamad Al-Bakri (Bernama). Cited by the commission in the context of ministerial
  expertise being confined to religious affairs, not as culpable parties.
- **Urusharta Jamaah Sdn Bhd (UJSB)** — MOF Inc special-purpose vehicle for the 2018
  transfer.
- **Anwar Ibrahim** — Prime Minister; author of the stated reason for withholding the report.

## RELEVANT LAW

- **Tabung Haji Act 1995 (Act 535), s.22 "Declaration of distributable profit"** —
  **verbatim, extracted 2026-08-03 from the AGC reprint [P2]** (Laws of Malaysia, online
  version of updated text of reprint, as at 1 December 2011, pp. 21-22):

  > **22.** (1) Subject to this section, the Lembaga may at its absolute discretion determine
  > at any time whether it is prudent to declare a sum as distributable profit in respect of
  > any particular period or year of the Fund and if it determines to so declare, the Lembaga
  > shall, with the approval of the Minister, declare a sum as distributable profit in respect
  > of any particular period or year of the Fund.
  >
  > (3) No distributable profit shall be declared unless the Lembaga has first established a
  > Reserve Fund, and no distributable profit shall be declared in any year unless at the end
  > of that year—
  >
  > (a) the assets of the Fund were not less than the aggregate liabilities of the Fund,
  > amounts due to depositors being calculated as if immediately payable; and
  >
  > (b) the assets of the Reserve Fund were not less than such percentage of the amounts
  > actually standing to the credit of the depositors as at the end of that year including the
  > distributable profit, as the Treasury may approve.

  **Three corrections to the earlier paraphrase in this brief, all load-bearing:**

  1. **The statutory term is "distributable profit", not "bonus".** Nothing in s.22 uses
     "bonus" or "hibah". Cards must not put the word "bonus" inside a description of the
     statutory test. The hibah is what TH declared; "distributable profit" is what the Act
     gates. Keep them distinct.
  2. **Limb (b) is a Reserve Fund adequacy test, not a profitability test.** The earlier
     paraphrase ("a second limb requires distributable profit") was wrong. (a) and (b) are
     conjunctive — both must hold. Press coverage and the reported RCI finding both centre on
     (a); (b) is an independent gate that this brief has seen no reporting on. **Do not assert
     the commission ignored (b)** — that requires reading P1. It is a question for Stage 3,
     not a claim for Stage 1.
  3. **There is a threshold precondition before either limb:** a Reserve Fund must first have
     been established.

  Also note s.22(1): a declaration requires **the Minister's approval**. That places the
  religious affairs minister of the day inside the approval chain as a matter of statute —
  relevant to the RCI's finding on ministerial powers, and to be handled with the naming
  discipline in ACCURACY POSTURE above.

  **Residual caveat:** the AGC online text is stated as updated to **1 December 2011**. No
  later reprint is listed on the act-detail page (reprints: 1995 gazette, 2002, 2006, 2011).
  Whether any amendment act between 2011 and FY2017 altered s.22 is **not yet confirmed** —
  check before any card asserts this was the wording in force in 2017.
- **Tabung Haji Act 1995 generally** — the RCI finds it confers broad ministerial powers
  over haj operations, funds and investments, and recommends amendment.
- **Malaysian Financial Reporting Standards / FRS 140** — impairment assessment and fair
  value of investment property; the standards whose full application produces the
  RM1.4 billion loss.
- **Official Secrets Act 1972, s.2C** — the declassification route reported for the report's
  release.
- **Audit Act 1957** — the National Audit Department's certification mandate.
- **Securities Commission Malaysia** — proposed regulator of the recommended Haj Fund
  department and of senior investment appointments.
- **MACC Act 2009** — basis of the current probe. No charges exist; presumption of innocence
  applies (Federal Constitution Art. 5).

## KEY STATISTICS (each traced to a numbered source below)

- **RM3.4 billion** — profit reported by TH for FY2017. [S1, S2, S3]
- **RM1.4 billion** — net loss the RCI says FY2017 should have shown under full MFRS. [S1, S3, P6]
- **RM3.324 billion** — cost of the FY2017 distribution, from the commission's own reproduction
  of the PwC table at paras 3.9.2 (p. 74) and 3.13.7 (p. 109). ✅ **CORRECTION:** the earlier
  draft of this brief carried **RM2.75 billion** for the FY2017 distribution, sourced to press
  reporting [S5, S9]. The report does not support it. **Do not publish RM2.75 billion.** The
  distribution series in the report reads (RM'million): 2013 **2,632**, 2014 **3,237**, 2015
  **3,220**, 2016 **2,871**, 2017 **3,324**.
- **RM70.317 billion assets vs RM74.409 billion liabilities** — the 2017 position, and
  ✅ **attribution corrected**: these are **KAN's audit findings** as recorded by the commission
  at para 3.11.11 (pp. 93–94), not PwC's. PwC's own table (3.13.7, p. 109) states 2017 assets
  **70,317** against liabilities and depositors' saving fund **(71,086)** pre-distribution, a
  shortfall of **(769)**, becoming **(4,093)** after the 3,324 distribution. The RM4.1 billion
  figure is the **post-distribution** shortfall — never describe it as the pre-distribution gap.
- **RM4.683 billion** — adjusted accumulated loss at 31.12.2017 per PwC, reproduced at para
  3.13.11 (p. 111). Round to **RM4.7 billion** only with the measure named. ✅
- **RM1,313 million → RM171 million → RM1 million** — impairment charge at the >70%, >85% and
  >90% policy thresholds; LTH recorded RM1.0 million for 2017 (paras 3.13.8–3.13.9, p. 110). ✅
- **RM37.52 billion** — total hibah including haj hibah distributed to depositors 1966–2021;
  **1.46 million** Malaysians taken on haj 1963–2021; **RM2.02 billion** in HAFIS subsidy since
  2001; **8.6 million** depositors as at 22 July 2022 (para 4.2, p. 191). ✅
- **RM227.81 million** — impairment losses not recognised across subsidiaries and associates,
  of which **RM164.58 million** relates to TH Heavy Engineering Bhd. [S5]
- **RM74 million** — 2014 staff bonus allocation, at up to 13 months' salary (11 annual +
  2 special); bonuses of 2 to 13 months paid between 2010 and 2017. [S6]
- **HAFIS subsidy cost:** RM106 million (2014) → RM300 million (2019) → RM742.47 million
  projected annually by 2030. [S5]
- **RM9.63 billion market value transferred for RM19.9 billion** (RM19.6 billion sukuk +
  RM300 million cash), completed 28 Dec 2018. [S13, P9]
- **RM12.6 billion** — total investment losses TH says were addressed (RM10 billion via the
  2018 recovery plan, RM2.6 billion via later impairments). [P4 via S8]
- **1.25% (2018) → 3.25% (2024)**, and **3.10% (2023) → 3.50% (2025), highest in eight
  years** — TH's own distribution-rate series, from two separate statements. [P4, P5]
- **211 pages**, executive summary + 4 chapters + exhibit list; **25 recommendations**;
  period **2014-2020**. [P1 via P7, S6]
- **9.8 million+ depositors** (TH, Aug 2026); **RM88 billion** deposits (RCI context). [P5, S4]
- **20 Jan 2022** appointment, **six-month term to 19 July 2022**, published **29 Jul 2026**. [P7]

## 12-DIMENSION RISK ASSESSMENT

| Dimension | Level | Justification |
|---|---|---|
| **Sentiment** | HIGH | Depositors' savings tied to a religious obligation. Anger is legitimate but must land on process, not on the institution's religious function or on depositors. |
| **Political** | HIGH | The period spans BN and PH administrations; the 2018 restructuring is claimed as a rescue by one side and questioned as an over-valued bailout by others. Both readings must appear. Not CRITICAL: the commission is the source, not a party. |
| **Ethnic** | LOW | No ethnic dimension. Do not import one. |
| **Religious** | MEDIUM-HIGH | TH is a religious-purpose institution and hibah is a Syariah-framed concept. Critique fund governance and statutory compliance only. Never adjudicate the theology of hibah, never imply the haj obligation or pilgrims' savings are the problem. This is the single highest-risk line in the issue. |
| **Narrative** | MEDIUM | Competing frames: "creative accounting scandal" vs "already fixed, 75% implemented". The gap between them is the issue. |
| **Completeness** | MEDIUM | The report itself has not yet been read end to end (see gaps). Findings are currently sourced through wire and press reporting of it. |
| **Temporal** | MEDIUM | Live and moving: MACC probe open, AGC assessing, Act amendments signalled, a special sitting mooted. Anything published must be time-stamped and must not pre-empt an outcome. |
| **Confidence** | MEDIUM-HIGH on the headline restatement (multiple independent outlets converge on RM3.4b / RM1.4b); MEDIUM on secondary figures until the report PDF is opened. |
| **Sources** | MEDIUM | Good spread across state wire, government-aligned, independent and business press, plus the institution's own statements and the former chairman's rebuttal. Weak on opposition-aligned response, international coverage and depositor voice. |
| **Geographic** | LOW | National. |
| **Economic** | HIGH | RM88 billion in deposits; sukuk obligations to 2029; a distribution policy that binds future returns. |
| **Gender** | LOW | Not a salient dimension here. |

**Stage 5 escalation call:** religious risk is assessed MEDIUM-HIGH, not HIGH, because the
subject is a statutory fund's accounts rather than belief. That is a borderline call. If
Stage 3 returns `source_diversity_estimate` below 0.4, or if the draft's framing drifts
toward hibah-as-theology, re-enable the Grok contrarian stress-test per CLAUDE.md and
ADR-0004.

## RECOMMENDED LENSES

**Governance** (the statutory gate and who tested it), **Economic** (the distribution and
what it cost), **Legal** (s.22(3)(a) and the audited-accounts remedy). Reserve **Historical**
as an alternative for the 2018 restructuring card if the economic angle duplicates a fact
card.

## CONTRADICTIONS

1. **Four different "loss" numbers, four different measures.** RM1.4 billion is the restated
   FY2017 net loss under full MFRS. RM4.7 billion is PwC's accumulated losses to end-2017.
   RM4.1 billion is the 2017 asset-liability deficit. RM12.6 billion is TH's own figure for
   total investment losses addressed across the recovery. **Most authoritative for the
   headline claim: RM1.4 billion**, because it is the commission's own restatement of a
   specific year's result and is the figure every outlet attributes to the report. Any card
   using another figure must name the measure explicitly. Never present them as the same
   quantity, and never sum them.
2. **Two asset values for the same year — this is the story, not noise.** PwC: RM70.3 billion
   assets against RM74.4 billion liabilities for 2017. The former chairman's RAV figures:
   RM74.7 billion against RM74.4 billion, a RM373 million surplus. Same fund, same year,
   opposite verdicts on the statutory test. Both must appear; the reframe lives here.
   Most authoritative for the *accounting* question: the audited/PwC basis, because
   s.22 compliance was subsequently found to require audited figures. Most authoritative
   for the *fairness* question: report both, and attribute the RAV figures to Azeez.
3. **TH's own distribution-rate series differs between statements.** The 30 July statement
   gives 1.25% (2018) → 3.25% (2024); the 1 August statement gives 3.10% (2023) → 3.50%
   (2025), "highest in eight years". Not contradictory, but different windows chosen for
   different arguments. Use one series and date it.
4. **How long was the report withheld? — ✅ RESOLVED.** The report's own title page records
   that it was **presented to the Yang di-Pertuan Agong on 30 Ogos 2022**. Publication was
   **29 July 2026**. The withholding period is therefore **three years and eleven months**,
   and that is now safe to publish. Anwar's "three years ago, we were not in a position to
   publish" (24 July 2026) is consistent — it describes when the decision was revisited, not
   the length of the delay.
5. **2018 transfer value.** Market value reported as RM9.63 billion (UJSB/The Edge) and
   RM9.7 billion (TH). Consideration RM19.9 billion in both. Use RM9.63 billion with the
   UJSB attribution, or round consistently and attribute.
6. **Deposit base.** RM88 billion (RCI recommendation context, 2026), RM73 billion falling to
   RM69 billion (2019), 9.8 million depositors (2026). All plausibly correct at their own
   dates. Always date the figure.

## SOURCE SPECTRUM CHECK

- **State / government wire:** Bernama [P6, P7].
- **Government-aligned press:** New Straits Times [S2, S11].
- **Independent:** Malay Mail [S1, S7, S8], Malaysiakini [S10], Scoop [S6], The Star [S3, S4].
- **Business:** The Edge [S5], Asia Asset Management [S13].
- **Malay-language mainstream:** Harian Metro [S9], Sinar Harian [S10].
- **Party-aligned (UMNO) / subject's own defence:** the former chairman's statement [P10].
- **Institutional voice:** Tabung Haji's own statements [P4, P5] and annual reports [P3].
- **Academic:** Malay Mail op-ed by Mohamed Hadi Abd Hamid and Mohd Zaidi Md Zabri [S14].

**Gaps in spectrum:** no opposition-bloc (PAS/Bersatu) response captured; no international
wire; no depositor or pilgrim-association voice; no Syariah-governance scholar on the hibah
question. The first and third should be filled before Stage 1 — a fund story with no
depositor voice is exactly the omission T4A exists to correct.

## SOURCES

**Primary** (official documents, official publications, institutional statements)

- **[P1] Laporan Suruhanjaya Siasatan Diraja bagi Menyiasat Isu Pengurusan dan Operasi
  Lembaga Tabung Haji dari Tahun 2014 hingga 2020** — presented to the Yang di-Pertuan Agong
  **30 Ogos 2022**; reclassified OPEN under s.2C, Akta Rahsia Rasmi 1972 [Akta 88] by Cabinet
  decision of **29 Julai 2026**, which directed JAKIM to publish it. ✅ **OPENED AND READ
  2026-08-09.**
  Announcement page: https://www.islam.gov.my/ms/pengumuman/5085-laporan-suruhanjaya-siasatan-diraja-rci-tabung-haji-ini-disediakan-oleh-suruhanjaya-yang-dilantik-oleh-kdymm-seri-paduka-banginda-yang-di-pertuan-agong-pada-20-januari-2022
  Document (the official link from that page, uploaded by JAKIM's Unit Komunikasi Korporat):
  https://online.fliphtml5.com/kaxni/WJD22-0447-Laporan-Suruhanjaya-RCI-1f93/
  252 page images; report page N = image N+38. Retrieval method and the certificate-chain fix
  are documented under PRIMARY SOURCE above. Cite as: *Laporan RCI Tabung Haji* (2022), para
  X.Y.Z, p. N.
- **[P2] Tabung Haji Act 1995 (Act 535)**, Laws of Malaysia, online version of updated text
  of reprint, as at 1 December 2011, Attorney General's Chambers — landing page
  https://lom.agc.gov.my/act-detail.php?language=BI&act=535; PDF at
  `https://lom.agc.gov.my/ilims/upload/portal/akta/LOM/EN/Act%20535%20-%20Tabung%20Haji%20Act%201995.pdf`
  (43 pp; s.22 at pp. 21-22). **OPENED 2026-08-03**; s.22(1) and s.22(3) quoted verbatim in
  RELEVANT LAW. The landing page embeds the PDF in a pdf.js viewer, which is why the earlier
  fetch attempt returned metadata only — request the `/ilims/` path directly.
- **[P3] Tabung Haji annual reports and statistics** —
  https://www.tabunghaji.gov.my/laporan-tahunan-dan-statistik. FY2017 report required for the
  declared profit and distribution rates. **Not yet opened.**
- **[P4] Tabung Haji official statement, 30 July 2026** — defence of the 2018 restructuring
  (RM10 billion gap, RM9.7 billion assets, RM19.9 billion consideration, RM12.6 billion
  losses addressed, TRX land and plantation repurchases, 75% of recommendations
  implemented). Retrieved via Malay Mail [S8].
- **[P5] Tabung Haji official statement, 1 August 2026** — "profit distribution is only
  announced based on audited financial results"; implementing since 2022; 3.50% in 2025;
  9.8 million depositors. Retrieved via Malay Mail:
  https://www.malaymail.com/news/malaysia/2026/08/01/tabung-haji-welcomes-rci-recommendations-says-already-distributes-profits-based-on-audited-results/229809
- **[P6] Bernama, "RCI Report Reveals Governance Weaknesses, Political Interference In Tabung
  Haji"** — https://www.bernama.com/en/general/news.php?id=2587753. National news agency;
  findings on political involvement 2014-2018, ministerial powers under Act 535,
  restructuring recommendations.
- **[P7] Bernama, "211-Page Tabung Haji RCI Report Released"** —
  https://bernama.com/en//general/news.php?id=2587728. Appointment 20 Jan 2022 by the 16th
  Yang di-Pertuan Agong, six-month term to 19 July 2022, terms of reference built on PwC, EY
  and Roland Berger.
- **[P8] Official Secrets Act 1972, s.2C** — declassification mechanism reported for the
  release. **Text not yet pulled.**
- **[P9] Urusharta Jamaah Sdn Bhd completion statement, Dec 2018** — transfer terms.
  Retrieved via The Edge: https://theedgemalaysia.com/article/tabung-haji-asset-transfer-part-rescue-restructuring-plan-completed-%E2%80%94-urusharta-jamaah
- **[P10] Abdul Azeez Abdul Rahim, media statement, Parliament lobby, 11 Dec 2018** — the
  RAV defence and the 2015/2016/2017 surplus figures.
  https://umno-online.my/2018/12/11/isytihar-hibah-2014-2017-tidak-langgar-akta-tabung-haji-1995/

**Secondary**

- **[S1]** Malay Mail, "RCI finds Tabung Haji's 2017 profit should have been a RM1.4b loss",
  30 Jul 2026 — https://www.malaymail.com/news/malaysia/2026/07/30/rci-finds-tabung-hajis-2017-profit-should-have-been-a-rm14b-loss/229482
- **[S2]** New Straits Times, "Tabung Haji RCI: TH overstated 2017 financial position",
  29 Jul 2026 — https://www.nst.com.my/news/nation/2026/07/1499871/ (403 to the fetcher;
  headline and framing captured via search index)
- **[S3]** The Star, "Poor accounting practices masked Tabung Haji's true financial position",
  29 Jul 2026 — https://www.thestar.com.my/news/nation/2026/07/29/poor-accounting-practices-masked-tabung-hajis-true-financial-position-says-rci-report
- **[S4]** The Star, "RCI recommends dedicated Haj Fund department under Tabung Haji",
  30 Jul 2026 — https://www.thestar.com.my/news/nation/2026/07/30/rci-recommends-dedicated-haj-fund-department-under-tabung-haji
- **[S5]** The Edge Malaysia, "'Creative accounting' propped up Tabung Haji's high hibah
  payouts — RCI", 30 Jul 2026 — https://theedgemalaysia.com/node/812534
- **[S6]** Scoop, "Up to 13 months' salary: RCI recommends recovery of Tabung Haji bonuses",
  30 Jul 2026 — https://www.scoop.my/news/294907/
- **[S7]** Malay Mail, "PM Anwar: Tabung Haji RCI report kept under wraps to avoid public
  panic, withdrawals", 24 Jul 2026 — https://www.malaymail.com/news/malaysia/2026/07/24/pm-anwar-tabung-haji-rci-report-kept-under-wraps-to-avoid-public-panic-withdrawals/228816
- **[S8]** Malay Mail, "Tabung Haji defends 2018 restructuring, says RM10b asset sale
  prevented insolvency", 31 Jul 2026 — https://www.malaymail.com/news/malaysia/2026/07/31/tabung-haji-defends-2018-restructuring-says-rm10b-asset-sale-prevented-insolvency/229636
- **[S9]** Harian Metro, "TH tidak sepatutnya isytihar hibah 2017 RM2.75 bilion", 30 Jul 2026
- **[S10]** Malaysiakini / Sinar Harian, 211-page report published, 29-30 Jul 2026 —
  https://www.malaysiakini.com/news/780940
- **[S11]** New Straits Times, MACC task force and probe at TH headquarters, 30 Jul 2026
- **[S12]** ~~Reporting of the PwC 2017 position (RM70.3b vs RM74.4b).~~ **SUPERSEDED
  2026-08-09** — the figures are now read directly from P1 (paras 3.11.11 p. 93 and 3.13.7
  p. 109), and the attribution has changed: RM70.317b / RM74.409b is **KAN's** finding, not
  PwC's. Cite P1. Do not cite S12.
- **[S13]** Asia Asset Management, "Malaysia's Tabung Haji sells property assets to
  government for 19.9 billion ringgit", 2018
- **[S14]** Malay Mail op-ed, "What Tabung Haji's buyback is really telling us" — Mohamed
  Hadi Abd Hamid and Mohd Zaidi Md Zabri, 31 Jul 2026

## VERIFICATION GAPS — must close before Stage 1

1. **[STILL OPEN — BLOCKING] Open the RCI report PDF [P1].** Every headline figure should be
   read in the commission's own words, not through press summaries. Also confirms: the six
   commissioners' names, the submission date, the exact recommendation count and wording, and
   whether the commission characterises the s.22 issue as a breach.
   **Retry log.** 2026-08-03 ~11:30 (Phase 1, two attempts, 503); ~17:00 (503 to the fetcher,
   TCP connect failure from curl on `www.islam.gov.my`, 502 CONNECT on `jakim.gov.my`);
   ~21:10 (both hosts still unreachable, announcement page still 503). Six failures across
   roughly ten hours. This is a host-level outage or block, not a wrong URL — the announcement
   page remains in the search index at the path recorded under [P1]. No mirror of the PDF has
   been located.
   2026-08-04 through 2026-08-06 11:33: retried on every session check-in, nine further
   failures, fifteen consecutive in total. The failure has settled into two distinct and
   unchanging signatures: `www.islam.gov.my` fails TLS certificate verification through the
   session proxy and does so even when curl is given the proxy CA bundle explicitly
   (`--cacert /root/.ccr/ca-bundle.crt`), while `jakim.gov.my` is refused at the proxy gateway
   with a 502 on the CONNECT tunnel. The proxy's own status endpoint reports zero recent relay
   failures throughout, so it is not a reliable indicator here; the live request is. Note that
   the session container's clock lagged real time by up to two days during this window, so
   individual timestamps in this log are approximate and the interval between the ~21:10 entry
   and the present one is longer than the earlier stamps suggest. Gap 1 remains open and the
   issue remains held.
   2026-08-06, 11:33 to 21:04: five further retries across the day, twenty consecutive failures
   in total, both signatures unchanged at every attempt. Twenty attempts spread over three days
   against two separate hosts, with the failure mode stable rather than intermittent, is enough
   to treat this as a standing condition rather than an outage that will clear on its own —
   further hourly retries are not an efficient use of a session. Whoever picks this up next
   should retry once at the start of the session and, if it still fails, spend the effort on
   the Hansard route instead: a special Dewan Rakyat sitting to debate the RCI report was set
   for 11 Aug 2026, and the official report of proceedings is a primary source under the
   Accuracy Standard that does not depend on the JAKIM hosts being reachable. It would not
   close gap 1 on its own terms — the commission's own words in the PDF are what gap 1 asks
   for — but it can independently establish several of the same specifics. Gap 1 remains open
   and the issue remains held.

   **2026-08-09 — ✅ CLOSED. The report was opened and read.** The twenty-first attempt
   succeeded once the failure was diagnosed correctly: it was never a block or an outage, it
   was a **broken certificate chain on the origin** (leaf issued by GlobalSign *ECC* OV SSL CA
   2018, RSA intermediate served). Supplying the correct intermediate from the leaf's AIA
   extension makes `www.islam.gov.my` reachable; a browser User-Agent clears the WAF 403. The
   announcement page then reveals that JAKIM published **no PDF at all** — the official
   document link is a FlipHTML5 flipbook uploaded by JAKIM's own communications unit, which is
   why four days of hunting for a `.pdf` found nothing. Full method, and the page-cited
   findings, are in **PRIMARY SOURCE — READ 2026-08-09** above. The Hansard fallback is no
   longer needed for gap 1, though the 11 Aug 2026 sitting remains worth capturing for
   post-publication reaction.

   Retained as a standing warning: several search results purporting to summarise the report's
   contents are machine-authored social posts — non-primary under the Accuracy Standard and
   not usable even as corroboration. One of them misstates where the document is hosted.
2. **[CLOSED 2026-08-03] Extract s.22(3)(a) verbatim from the AGC reprint [P2].** Done — full
   text of s.22(1) and s.22(3)(a)-(b) is now quoted in RELEVANT LAW above, pulled from the
   Act 535 PDF at `lom.agc.gov.my/ilims/upload/portal/akta/LOM/EN/`. The extraction corrected
   three errors in this brief's earlier paraphrase; see that section. One residual: confirm no
   post-2011 amendment altered s.22 before FY2017.
3. **Pull TH's FY2017 annual report [P3]** for the reported profit and the declared rates.
   **Downgraded to optional** — the reported RM3.412 billion profit and the 2013–2017
   distribution series are now read from P1 itself (paras 3.9.2, 3.13.7, 3.13.11).
4. **[CLOSED 2026-08-09] Confirm the 2017 asset/liability figures.** Done, with an attribution
   correction: RM70.317b vs RM74.409b is **KAN's** finding (para 3.11.11), not PwC's. See
   KEY STATISTICS.
5. **[CLOSED 2026-08-09] Establish the submission date.** Presented to the Yang di-Pertuan
   Agong on **30 Ogos 2022** (title page). Withholding period: three years, eleven months.
6. **[STILL OPEN] Fill two spectrum gaps:** an opposition-bloc response and a depositor or
   pilgrim-association voice. Neither is blocking, but a fund story with no depositor voice is
   exactly the omission T4A exists to correct — fill before Stage 1 if practical.
7. **[NEW, OPTIONAL] Section 3.14–3.16 not yet read.** Problem investments, staff bonuses
   (3.12), and the HAFIS subsidy liability (3.16) were sampled but not read end to end. The
   bonus-recovery recommendation is confirmed at para 3.12.29 (p. 107); the "up to 13 months'
   salary" detail is still press-sourced [S6] and must be traced to the report before use.

**Status: the issue is no longer held.** Gaps 1, 4 and 5 are closed against the primary
document; gap 2 was closed on 2026-08-03. Stage 1 may begin on the user's approval. The
standing rule still applies: for a 3R-adjacent institution the verification bar is higher, not
lower — every card must cite the report paragraph, not a press summary of it.
