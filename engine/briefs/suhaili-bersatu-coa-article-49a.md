# BRIEF: Article 49A's expulsion carve-out, blocked from court by the Societies Act (Research Brief, Issue 2000, reframed)

**Slug:** `suhaili-bersatu-coa-article-49a`
**Headline (working):** Article 49A's expulsion carve-out — four years on, still untested on its merits
**Source date:** 2026-05-22 (brief written, reframed after assumed procedural-only CoA ruling)
**Edition:** 1 (new)
**Issue ID:** 2000
**Issue source date:** 2026-04-29 (published cards)
**Backfill date: 2026-11-08**
**Backfill note:** source-list backfill. SOURCES compiled, and CLAIM VERIFICATION and SINCE PUBLICATION added; CONTRADICTIONS and SOURCE SPECTRUM CHECK rewritten with findings. All other sections are kept as written on 2026-05-22. Issue cards unchanged.

> **Reframe notice (2026-05-22).** Original brief framed the story as the Court of Appeal narrowing Article 49A(2)(c)'s expulsion carve-out. After preliminary verification indicated the CoA ruling was on procedural grounds (not merits engagement of the carve-out), the brief has been reframed to a narrower, more verifiable angle: **the absence of substantive judicial interpretation of the carve-out itself**. The earlier framing is preserved in commit `d1d891d`'s version of this file (`git log --follow` for history).
>
> **Many specifics in this brief are still [LOW] confidence pending direct access to the CoA grounds of judgment. Do not proceed past Stage 2 until [LOW] items are verified.**

## ISSUE

Article 49A(2)(c) of the Federal Constitution carves out expulsion from a political party as a non-trigger for loss of MP status. The carve-out was inserted in October 2022 to prevent party leaderships from disciplining elected representatives by simply expelling them. Four years on, the carve-out has not been tested on its substantive merits at the Court of Appeal level. Suhaili Abdul Rahman's 29 April 2026 appeal was reportedly dismissed on procedural grounds; the earlier Zuraida Kamaruddin ruling (December 2024) struck down a party-internal bond on Contracts Act grounds, not on 49A interpretation. **The result is a constitutional protection whose actual operating envelope is unknown — because no court has been asked, or has agreed, to interpret it.**

## PERIOD

P7 (Hybrid Instability). Reference window:
- 5 October 2022 — Constitution (Amendment) (No. 3) Act 2022 in force; Article 49A inserted, including (2)(c) expulsion carve-out.
- December 2024 — Court of Appeal reduces Zuraida Kamaruddin's RM10M PKR bond to RM100,000 on contracts-grounds, not on 49A interpretation.
- 29 April 2026 — Court of Appeal dismisses Suhaili Abdul Rahman's appeal in Bersatu-membership-cessation suit. [LOW] grounds: procedural per assumed reframe.
- 17 May 2026 — Rafizi Ramli + Nik Nazmi Nik Ahmad vacate seats voluntarily under Article 51, sequenced to avoid 49A(1)(a) — the OPPOSITE pole of the question 49A(2)(c) addresses (T4A issue 1993).

## CONTEXT (Timeline)

**The constitutional text.** Article 49A creates three triggers for automatic seat loss: voluntary resignation from one's party (49A(1)(a)), joining a party as an independent (49A(1)(b)), and circumstantial triggers in 49A(2). The legislative carve-out at **49A(2)(c)** excludes expulsion from triggering loss. The carve-out's design logic — articulated in Parliament during the October 2022 second reading [LOW: Hansard to confirm] — is voter-protective: a party that could expel and force out an inconvenient MP would gain unilateral power over the electorate's representative.

**What we DON'T know after four years.** The carve-out has not been judicially interpreted in any reported decision. Specifically unresolved:

- *Does deemed-resignation route around the carve-out?* If a party's internal constitution treats membership cessation (whatever the mechanism) as a deemed-resignation, does 49A(1)(a) bite — overriding 49A(2)(c)?
- *Does Article 51 voluntary-resignation-of-seat count as 49A(1)(a) resignation-from-party?* The Rafizi-Nik Nazmi sequence (resign seat, then leave party) bets that the answer is no. Not yet judicially confirmed.
- *Are intra-party expulsions reviewable by civil courts?* If courts treat party constitutions as private-association contracts, the substantive 49A interpretation never reaches them.

**The two CoA data points so far.**

*Zuraida Kamaruddin (December 2024).* PKR sued former Vice President Zuraida Kamaruddin for the RM10M anti-defection bond she signed before leaving with nine others in 2020. High Court awarded the RM10M; CoA panel led by Datuk See Mee Chun reduced to RM100,000, ruling "no room" for representatives to contract away their constitutional right to choose a party. **This ruling addressed contracts law, not Article 49A.** It signals voter-protective doctrine at the CoA level but does not interpret the carve-out.

*Suhaili Abdul Rahman (29 April 2026).* Labuan MP, sued Bersatu over membership cessation; High Court dismissed; CoA unanimously dismissed appeal. [LOW] Per the reframing assumption, the dismissal was on procedural grounds (locus standi for party-internal dispute, exhaustion of internal remedies, or time-bar). **The substantive carve-out question was not engaged.**

**Why "untested" is itself a finding.** A constitutional protection that exists on paper but has no judicial interpretation is in a peculiar half-state: parties cannot rely on it for tactical certainty (they don't know if their constitutions will be read around it), MPs cannot rely on it for protection (they don't know if expulsion will or won't trigger loss), and Parliament cannot tell whether its drafting achieved the protective intent. Four years of operative law plus two CoA-level cases that didn't reach the substantive question is the precedent-doctrine gap this issue surfaces.

**Adjacency:** T4A issue 1993 (Rafizi-Nik Nazmi 17 May 2026 voluntary resignation route) is the same-week, opposite-pole story. Suhaili tests what happens when the party initiates; Rafizi tests what happens when the MP initiates. Both leave the substantive 49A reading open.

## ENGINE CONTEXT — ge15-actual (federal)

*Source: T4A simulation engine, 5-mechanism pipeline. **Internal use only — not for publication as numerical claims.** Engine MAPE on GE12-15 backtest is 30.3%; qualitative coalition family is more reliable than specific seat counts.*

**Scenario:** GE15 federal 2022 — actual documented seats (post-electoral, no electoral mechanism run).

**Inputs — seats (electoral pass-through):**

| Party | Seats |
|---|---:|
| PH | 82 | PN | 74 | BN | 30 | GPS | 23 | GRS | 6 | Warisan | 3 | MUDA | 1 |

**Coalition mechanism — top-1 (formateur PH):** GPS+GRS+PH+Warisan, 114/222 seats, selection weight 0.223, coherence 0.86.
**Royal intervention:** FIRED (crisis 0.73). Broadened to 145 seats with BN + MUDA.
**Patronage:** BN entry driven by legal-exposure 0.85.

**Engine reading specific to this REFRAMED issue.** The relevant engine layer is `drift` §5.5, which tracks cumulative constitutional drift across seven axes including `electoral_independence`. The current cumulative drift on that axis is **-0.10** (per the capstone analysis at `docs/research/sim-engine-capstone-ge16-cards.md`) — driven exclusively by the Johor appointed-assemblymen amendment (T4A issue 1977). **The Suhaili procedural ruling does NOT contribute drift** by the engine's classification rules, because the engine reads procedural dismissals as non-events on the substantive axis they avoid engaging.

This is itself a useful structural point for the reframed issue: the absence-of-interpretation has zero recorded engine effect, even though it shapes how parties and MPs actually behave in the shadow of an untested protection. Engines, like courts, only register what is engaged. The "shadow" of an untested constitutional protection is real but invisible to mechanical tracking — only inferential.

**Coalition-arithmetic relevance to this issue:** minimal. The Unity Government coalition family is structurally over-determined across 8/8 scenarios in the engine's capstone analysis; the Suhaili procedural ruling doesn't change BN's entry or any other party's calculus. **Engine output here is contextual background only, not a structural argument carrier.** The substantive argument for this issue lives in constitutional-doctrine territory, not coalition-arithmetic territory.

## ACTORS

- **Suhaili Abdul Rahman** — Labuan MP, formerly Bersatu (until membership cessation [LOW]). Appellant in CoA case.
- **Bersatu** — Parti Pribumi Bersatu Malaysia. Party that initiated the membership cessation.
- **High Court (Kuala Lumpur)** — [LOW] Original civil court; dismissed Suhaili's challenge.
- **Court of Appeal panel (29 April 2026)** — [LOW] Three judges, names to verify. Unanimous dismissal.
- **Zuraida Kamaruddin** — Former PKR VP, defendant in the RM10M anti-defection bond case (December 2024 CoA ruling), referenced for contrast.
- **Drafting Committee, Article 49A (2022)** — drafters of the carve-out at issue. [LOW] Identify specific MPs / Bills Committee members from Hansard October 2022.

## RELEVANT LAW

1. **Federal Constitution Article 49A** — Loss of Membership of House of Representatives on Party Hopping.
   - **49A(1)(a)** — voluntary resignation from party triggers seat loss.
   - **49A(2)(c)** — expulsion does NOT trigger seat loss.
2. **Federal Constitution Article 51** — voluntary resignation of seat (the Rafizi-Nik Nazmi mechanism).
3. **Federal Constitution Article 54** — vacancy in House of Representatives.
4. **Contracts Act 1950** — basis of the Zuraida 2024 CoA ruling on the RM10M bond.
5. **Specific Relief Act 1950 / Rules of Court 2012** — likely procedural grounds for Suhaili's dismissal at High Court and CoA [LOW — to verify which specific provisions].
6. **Bersatu Party Constitution** — membership-termination clauses [LOW].
7. **Societies Act 1966** — governs party registrations.

## KEY STATISTICS

- **Article 49A in force:** 5 October 2022 to present — **~3 years, 7 months** of operation as of 22 May 2026.
- **Article 49A-engaging CoA rulings on substantive merits to date:** **0** (per reframe assumption).
- **CoA rulings adjacent to Article 49A but on other grounds:** **2** (Zuraida 2024 on contracts; Suhaili 2026 on procedure).
- **Article 49A seat vacancies actually triggered to date:** [LOW] need EC and Hansard data; estimate is small (the high-profile resignations under it would have been documented).
- **Voluntary-resignation route used to circumvent 49A(1)(a):** at least 2 confirmed (Rafizi, Nik Nazmi, May 2026; T4A issue 1993).
- **Radar metrics for Suhaili story:** news mentions 6, social mentions 8, expected 420 (silence ratio 99%).

## 12-DIMENSION RISK ASSESSMENT

- **sentiment** — LOW.
- **political** — MEDIUM (down from HIGH in original framing). The narrower angle is doctrinally interesting but not coalition-shifting; risk of being read as wonky/academic.
- **ethnic** — LOW.
- **religious** — LOW.
- **narrative** — LOW-MED. The "untested protection" framing is robust to confirmation/refutation of specific case ratios. Lower overclaim risk than the original.
- **completeness** — MED. Brief acknowledges the specific procedural ground for Suhaili remains [LOW]; structural argument doesn't depend on resolving it.
- **temporal** — LOW.
- **confidence** — MED-HIGH (improved from MED). Reframed argument is more verifiable.
- **sources** — MED. Smaller source list needed; Hansard + the two CoA rulings + commentary covers most.
- **geographic** — LOW.
- **economic** — LOW.
- **gender** — LOW.

**Aggregate:** improved from original. The reframe trades political "splash" for doctrinal honesty. **The issue is now publishable on a Tier 2 leverage basis** — not the headline-grabbing structural finding of the original framing, but a clean, defensible "what mainstream missed" piece for a Saturday slot rather than a Tuesday push.

## RECOMMENDED LENSES

- **Legal** — primary lens. Constitutional doctrine and judicial-review scope.
- **Historical** — close second. Four years of operative law without substantive interpretation is itself the historical observation.
- **Political** — tertiary. The political consequence (parties operate in the shadow of an untested rule) follows but isn't the headline.

## CLAIM VERIFICATION

Backfill pass of 2026-11-08 against the published cards of issue 2000 (source date 2026-04-29). Sources are numbered as
in SOURCES below. The source list planned in the earlier "(to compile)" section has been replaced by the sources
actually opened. The judgments themselves (Suhaili High Court and Court of Appeal, Zuraida Court of Appeal), the
October 2022 Hansard, an EC count of Article 49A vacancies and the Bersatu constitution were not publicly reachable.
Court facts therefore rest on consistent reporting.

| Claim (card) | Status | Source(s) | Note |
|---|---|---|---|
| Article 49A(2)(c) exempts expulsion from triggering loss of an MP's seat (context, hook sub) | VERIFIED | 1 | Act A1663 s.4, new Art. 49A(2): an MP does not cease to be a member "hanya disebabkan oleh ... (c) pemecatannya daripada keanggotaan dalam parti politiknya". |
| Section 18C of the Societies Act 1966 bars courts from hearing party-membership disputes (context) | VERIFIED | 3, 10, 11, 12 | s.18C makes a party's decision "on any matter relating to the affairs of the party" final and conclusive, not to be "called in question in any court on any ground". It is retained in the 2021 revised edition (Act 832). Suhaili's suit was struck out on this ground (High Court 15 Apr 2025; Court of Appeal 29 Apr 2026, citing "binding authority" on s.18C). |
| The two laws produce a protection courts "cannot practically interpret" (context); "blocked from court by the Societies Act" (headline) | PARTLY | 3, 11, 12, 13, 14 | Holds for Suhaili. A different High Court in Feb 2025 let Azizi Abu Naim's challenge to his Bersatu membership cessation proceed despite a s.18C objection (13). That suit concerned a state seat (the Eighth Schedule, not Art. 49A) and was later withdrawn. Separately, the Federal Court (9 Jan 2026, 2-1) held the Speaker's Art. 49A seat decisions non-justiciable under Arts. 63 and 72 (14), a second barrier that is not s.18C. |
| A Labuan MP's appeal over the cessation of his Bersatu membership was dismissed at the Court of Appeal on 29 April 2026 (hook) | VERIFIED | 11, 12 | Panel of Azizul Azmi Adnan, Ong Chee Kwan and Amarjeet Singh JJCA, unanimous, RM30,000 costs. |
| "After 3 years 7 months, no court has interpreted the carve-out on its merits" (hook sub) | PARTLY | 1, 5, 11, 12, 14 | Duration: 5 Oct 2022 to 29 Apr 2026 is 3 years 6 months 24 days, so "3 years 7 months" rounds up. No reported merits ruling on Art. 49A(2)(c) was found. Suhaili argued his removal was in effect an expulsion protected by Art. 49A (8), but the courts disposed of the case on s.18C. An absence claim cannot be fully proven. |
| Article 49A inserted by Constitution (Amendment) (No. 3) Act 2022 (Act A1663), in force 5 Oct 2022 (Legal big) | VERIFIED | 1, 5, 6 | Royal assent 31 Aug 2022, gazetted 6 Sep 2022. The King appointed 5 Oct 2022 under ss.1(2)-(3). Section 6 (Eighth Schedule, state assemblies) was excluded from that date (6). The earlier version of this brief said "Act A1664", which is wrong: the Act text reads "Akta A1663". |
| The text prevents a party from causing an MP's seat to be vacated merely by expelling that MP (Legal sub) | VERIFIED | 1, 7 | Art. 49A(2)(c), as above. Fulcrum (7) reads it the same way. |
| Zuraida Kamaruddin's case (Court of Appeal, December 2024) was decided on Contracts Act s.75 proportionality, not Article 49A (Governance big) | PARTLY | 16, 17, 19 | Court of Appeal, 11 Dec 2024 (See Mee Chun JCA presiding). The reports quote the court finding RM10m "cannot be construed as reasonable compensation" and "unreasonable and extravagant", which is s.75 language, and s.75 was argued at the Federal Court (19). FMT (17) records PKR claiming under s.71. "Proportionality" is the card's word, not the court's as reported. "Not Article 49A" is consistent: the reports mention no Art. 49A reasoning, and Zuraida's exit predates the 2022 amendment. Grounds of judgment not opened. |
| The court held the RM10 million bond disproportionate and reduced compensation to RM100,000; the breach was upheld (Governance sub) | VERIFIED | 16, 17 | Breach upheld unanimously, quantum reduced to RM100,000, PKR ordered to pay RM40,000 costs. "Disproportionate" paraphrases "unreasonable and extravagant" and "exorbitant". |
| PKR's Federal Court appeal hears 16 July 2026 (Governance sub) | STALE-SINCE-PUBLICATION | 18, 19 | Correct at the source date (fixed 10 Apr 2026). The appeal was heard on 14 Sep 2026 before Chief Justice Wan Ahmad Farid Wan Salleh, Azizah Nawawi and Azmi Ariffin, and the decision was reserved. No judgment was found up to the backfill date. |
| Rafizi Ramli and Nik Nazmi (May 2026) used Article 51 to vacate Pandan and Setiawangsa before leaving PKR (Political big) | VERIFIED | 4, 20 | Seats declared vacant under Art. 51. They announced on 17 May that they would vacate their seats on 18 May and leave PKR on 19 May (20). The sequence in the card matches. |
| The Election Commission treated the vacancies as Article 51 resignations and stated no by-elections under Article 54(1)'s two-year window (Political sub) | VERIFIED | 2, 4 | EC media statement Bil. 11/2026, 20 May 2026: the Speaker's letter of 20 May said the vacancies need not be filled under Art. 54(1), so no by-election. The second proviso to Art. 54(1) contains the two-year rule (2). |
| Reframe, analogy and view (a constitutional protection that s.18C keeps courts from reaching) | PARTLY | 1, 3, 11, 13, 14 | Interpretive. Supported by Suhaili. Qualified by Azizi (13): one High Court treated s.18C as no bar at the strike-out stage. |

## CONTRADICTIONS

The three open questions from the earlier draft of this brief, resolved where the sources allow:

- **Have any Art. 49A seat vacancies been triggered?** No EC count was located. The known contests (the six Bersatu MPs
  of 2024, the four Sabah MPs) ended with the Speaker declining to declare vacancies and the courts declining to
  review that decision (9, 14, 15). This is consistent with the "untested" framing.
- **Does Hansard record the intent of Art. 49A(2)(c)?** Not checked; Hansard for Jul-Aug 2022 was not opened.
- **Missed lower-court merits rulings?** The Azizi High Court ruling of 19 Feb 2025 (13) let a membership-cessation
  challenge go to trial despite s.18C. It was not a merits ruling on Art. 49A(2)(c), and the suit was later withdrawn.
  It does show the s.18C bar is not applied uniformly at first instance.

Further contradictions found in this pass:

- **Contracts Act basis in Zuraida.** FMT (17) reports PKR claiming under s.71. The Star (19) reports s.75 argued at the
  Federal Court, and the Court of Appeal's "reasonable compensation" test tracks s.75. The written grounds would settle
  it but were not available.
- **Forum of Suhaili's suit.** Malay Mail (8) reports a filing at the Kuala Lumpur High Court in July 2024. FMT (10) and The
  Star (11) report that the Shah Alam High Court struck it out. The later reports are used for the decision.
- **EC notification date.** The EC statement (4) cites a Speaker's letter dated 20 May 2026. Malay Mail (20) says the EC
  received it on 21 May. The EC's own statement is authoritative.

## SINCE PUBLICATION

- **14 Sep 2026:** the Federal Court heard PKR's appeal in the Zuraida bond case and reserved its decision (19). The
  Governance card's "hears 16 July 2026" is overtaken.
- No further appeal by Suhaili to the Federal Court was found in reporting.

## SOURCE SPECTRUM CHECK

- **Government / state institutions:** Act A1663 and the Federal Constitution (1, 2), Societies Act (3), Election
  Commission (4), law minister's announcement (5), Dewan Rakyat Speaker's decisions as reported (9, 15).
- **Government coalition party:** PKR as litigant against Zuraida (16-19).
- **Opposition party:** Bersatu as litigant and Muhyiddin Yassin's criticism of the Speaker (8, 9, 14, 15).
- **Former party members:** Suhaili, Azizi and Zuraida as litigants (8, 10-13, 16-19); Rafizi and Nik Nazmi (4, 20).
- **Independent legal and academic commentary:** Rahmat Lim & Partners (6), Fulcrum / ISEAS (7).
- **Courts:** Court of Appeal and Federal Court rulings as reported (11, 12, 14, 16, 17).

## SOURCES

1. **[P]** Undang-Undang Malaysia, *Akta A1663: Akta Perlembagaan (Pindaan) (No. 3) 2022*, 6 Sep 2022, seksyen 1 and 4. https://e-perundangan.pkns.gov.my/img/AKTA%20PERLEMBAGAAN%20(PINDAAN)%20(NO.%203)%202022.pdf
2. **[P]** Commissioner of Law Revision, *Federal Constitution (Reprint as at 15 October 2020)*, 15 Oct 2020, Articles 51 and 54(1). https://lom.agc.gov.my/ilims/upload/portal/akta/LOM/EN/Federal%20Constitution%20(Reprint%202020).pdf
3. **[P]** Commissioner of Law Revision, *Societies Act 1966, Act 832, Revised 2021*, 15 Nov 2021, section 18C. https://www.mdi.gov.my/wp-content/uploads/2025/06/Akta-832-Akta-Pertubuhan-1966.pdf
4. **[P]** Suruhanjaya Pilihan Raya Malaysia, *Kenyataan Media Bil. 11/2026: Status Kekosongan Luar Jangka Kerusi Parlimen P.100 Pandan dan P.118 Setiawangsa*, 20 May 2026. https://spr.gov.my/wp-content/uploads/2026/07/KM-BIL.11-2026-STATUS-KEKOSONGAN-LUAR-JANGKA-KERUSI-PARLIMEN-P.100-DAN-P.188.pdf
5. **[S]** Malay Mail, "Anti-hopping law effective from tomorrow, says Wan Junaidi", 4 Oct 2022. https://www.malaymail.com/news/malaysia/2022/10/04/anti-hopping-law-effective-from-tomorrow-says-wan-junaidi/31621
6. **[S]** Rahmat Lim & Partners, "Anti-party hopping laws introduced in Federal Constitution of Malaysia", 31 Oct 2022. https://www.rahmatlim.com/publication/articles/22605/anti-party-hopping-laws-introduced-in-federal-constitution-of-malaysia
7. **[S]** Fulcrum, ISEAS-Yusof Ishak Institute, "Malaysia's Anti-hopping Law: Some Loopholes to Mull Over", 19 Oct 2022. https://fulcrum.sg/malaysias-anti-hopping-law-some-loopholes-to-mull-over/
8. **[S]** Malay Mail, "Labuan MP drags Bersatu to court over effective expulsion for Anwar support", 11 Jul 2024. https://www.malaymail.com/news/malaysia/2024/07/11/labuan-mp-drags-bersatu-to-court-over-effective-expulsion-for-anwar-support/143373
9. **[S]** The Star, "Six get to keep their seats", 11 Jul 2024. https://thestar.com.my/news/nation/2024/07/11/six-get-to-keep-their-seats
10. **[S]** Free Malaysia Today, "Suhaili files appeal after court tosses out suit against Bersatu", 29 Apr 2025. https://www.freemalaysiatoday.com/category/nation/2025/04/29/suhaili-files-appeal-after-court-tosses-out-suit-against-bersatu
11. **[S]** The Star, "Labuan MP fails in appeal to revive lawsuit over Bersatu membership cessation", 29 Apr 2026. https://www.thestar.com.my/news/nation/2026/04/29/labuan-mp-fails-in-appeal-to-revive-lawsuit-over-bersatu-membership-cessation
12. **[S]** Free Malaysia Today, "Labuan MP fails in bid to revive lawsuit over cessation of Bersatu membership", 29 Apr 2026. https://www.freemalaysiatoday.com/category/nation/2026/04/29/labuan-mp-fails-in-bid-to-revive-lawsuit-over-cessation-of-bersatu-membership
13. **[S]** Free Malaysia Today, "High Court to hear Azizi's lawsuit over loss of Bersatu membership", 19 Feb 2025. https://www.freemalaysiatoday.com/category/nation/2025/02/19/high-court-to-hear-azizis-lawsuit-over-loss-of-bersatu-membership
14. **[S]** Free Malaysia Today, "End of legal route for Bersatu over Sabah MPs case", 9 Jan 2026. https://www.freemalaysiatoday.com/category/nation/2026/01/09/end-of-legal-route-for-bersatu-over-sabah-mps-case
15. **[S]** Free Malaysia Today, "Bersatu withdraws suit against speaker over 5 MPs' seats", 5 Mar 2026. https://www.freemalaysiatoday.com/category/nation/2026/03/05/bersatu-withdraws-suit-against-speaker-over-5-mps-seats
16. **[S]** The Star, "Former PKR vice-president Zuraida ordered to pay RM100,000 for bond breach", 11 Dec 2024. https://thestar.com.my/news/nation/2024/12/11/former-pkr-vice-president-zuraida-ordered-to-pay-rm100000-for-bond-breach
17. **[S]** Free Malaysia Today, "Zuraida's damages for breaching PKR bond slashed from RM10mil to RM100,000", 11 Dec 2024. https://www.freemalaysiatoday.com/category/nation/2024/12/11/zuraidas-damages-for-breaching-pkr-bond-slashed-from-rm10mil-to-rm100000
18. **[S]** Malay Mail, "Federal Court to hear PKR appeal over Zuraida's RM100,000 bond ruling on July 16", 10 Apr 2026. https://www.malaymail.com/news/malaysia/2026/04/10/federal-court-to-hear-pkr-appeal-over-zuraidas-rm100000-bond-ruling-on-july-16/215837
19. **[S]** The Star, "Federal Court told Zuraida's RM10mil bond reasonable, decision reserved", 14 Sep 2026. https://www.thestar.com.my/news/nation/2026/09/14/federal-court-told-zuraida039s-rm10mil-bond-reasonable-decision-reserved
20. **[S]** Malay Mail, "EC: No by-elections for Pandan, Setiawangsa seats after vacancies declared", 21 May 2026. https://www.malaymail.com/news/malaysia/2026/05/21/ec-no-byelections-for-pandan-setiawangsa-seats-after-vacancies-declared/220758

Primary count is 4 of 20. The court judgments, Hansard and the Bersatu constitution were not publicly reachable, so the
8-primary target is not met. Every court fact is carried by at least two outlets, except the Azizi and Sabah-MP rulings,
which have one outlet each.

---

## Brief-author honest assessment (reframe edition)

**What changed:** The original brief made a strong structural claim ("expulsion carve-out being narrowed by judicial practice") that depended on the CoA's actual ratio. Under reframe assumption (procedural-only), that claim is unsupported. The reframed brief makes a weaker but more verifiable claim ("the carve-out has never been tested on merits"), which is true regardless of how exactly the Suhaili case was decided.

**What stayed:** Engine context block, period assignment, list of relevant articles. The structural-doctrine angle now lives in the absence-of-interpretation observation, not in any specific case's ratio.

**What still needs verification before Stage 1:**
1. *Confirmed:* Suhaili CoA was on procedural grounds (the working assumption that triggered this reframe).
2. *Still needed:* The specific procedural ground (locus standi? time-bar? exhaustion of internal remedies?). Affects the brief's tertiary detail but not the structural argument.
3. *Still needed:* The Article 49A vacancy count from EC records. Affects the strength of the "untested" framing but not its direction.

**Brief is ready for Phase 2 (Stage 1 Primary Analysis) at the operator's approval.** The structural argument is honest about what we do and don't know, and the publishable take is "what mainstream coverage of the case missed is that the case didn't decide the question Parliament left open" — a clean T4A reframe move.

## CORRECTION (2026-11-09)

Edition 2. Changes to `src/data/issues/2000.json`:

- **Hook sub.** "After 3 years 7 months" overstated the span. From 5 Oct 2022 (in force, sources 1, 5) to 29 Apr 2026 is
  3 years 6 months 24 days, so the card now says "three and a half years after it took effect". "No court has
  interpreted" became "no reported ruling has tested it", which is what the absence search supports.
- **Governance big.** "Decided on Contracts Act s.75 proportionality" became "turned on 'reasonable compensation' under
  the Contracts Act". The reports quote the court's "reasonable compensation" test (sources 16, 17), FMT records PKR
  claiming under s.71 (17), and The Star records s.75 argued at the Federal Court (19), so the card no longer names a
  section or uses "proportionality".
- **Governance sub.** "Disproportionate" became the reported words "unreasonable and extravagant" (16, 17). "PKR's
  Federal Court appeal hears 16 July 2026" was overtaken: the Federal Court heard the appeal on 14 Sep 2026 and reserved
  its decision (19). A web search on 2026-11-09 found no judgment yet.
- Headline, context, Legal and Political cards, reframe, analogy and view unchanged.
