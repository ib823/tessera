# ISSUE 1994 — Malaysia's USD-Stablecoin Blind Spot: How Banning USDT On Licensed Exchanges Hid The Exposure Instead Of Removing It

## ISSUE
The Securities Commission Malaysia does not approve any USD-pegged
stablecoin (USDT, USDC, or otherwise) for trading on the country's six
licensed Digital Asset Exchanges. The official rationale is to prevent
foreign-currency outflow and keep regulated crypto activity denominated
in ringgit. The unofficial outcome is that Malaysian retail and
corporate demand for USD stablecoins has migrated to peer-to-peer
networks, offshore exchanges, self-custody wallets, and DeFi — venues
where Bank Negara Malaysia has no telemetry, no off-ramp data, and no
ability to size the exposure. Three things have changed the stakes:
the US **GENIUS Act** signed on 18 July 2025 federalised USD stablecoin
issuance and made on-chain sanctions enforcement a domestic-law
obligation; **Standard Chartered** in October 2025 modelled
US$1 trillion in deposit outflows from emerging-market banks into USD
stablecoins by 2028; and Tether has now frozen **7,268 addresses
holding US$3.29 billion** at OFAC and US law-enforcement request,
demonstrating that a USD stablecoin balance can be made inaccessible
extraterritorially with no Malaysian process attached. BNM's response
has been to open a sandbox for **ringgit-denominated** stablecoins and
tokenised deposits — addressing a different question than the one the
exposure poses. The substantive issue is not whether ringgit
tokenisation is good policy; it is whether the existing blanket ban on
USD stablecoins on licensed venues has produced visibility or hidden it.

## PERIOD
August 2023 (Singapore MAS finalises stablecoin framework — the first
peer model) through 17 May 2026 (brief drafting), with key inflection
points at 18 July 2025 (GENIUS Act signed), June 2025 (BNM Digital
Asset Innovation Hub launched), October 2025 (Standard Chartered
US$1T projection), and December 2025 (RMJDT private ringgit stablecoin
launched outside the BNM core sandbox).

## CONTEXT (Timeline)

- **15 May 2018**: Bank Negara Malaysia issues "Anti-Money Laundering
  and Counter Financing of Terrorism (AML/CFT) — Digital Currencies
  (Sector 6)" guidelines (BNM/RH/PD 030-2). Digital-currency exchangers
  brought under AML reporting institution status. Foundational document
  for current dual SC/BNM oversight.
  <https://www.bnm.gov.my/documents/20124/65312/20180515+-+PD+Digital+currency.pdf/>
- **March 2019**: Securities Commission Malaysia begins recognising
  Digital Asset Exchanges (DAX) under the *Guidelines on Recognized
  Markets*. Each DAX must obtain SC approval for every asset listed.
  By 2026 there are **six SC-registered DAX operators**: Luno, Tokenize,
  SINEGY, MX Global, HATA, and Torum International.
  <https://www.sc.com.my/regulation/guidelines/recognizedmarkets/list-of-registered-digital-asset-exchanges>
- **August 2023**: Monetary Authority of Singapore finalises its
  Stablecoin Regulatory Framework under the Payment Services Act. The
  framework explicitly covers single-currency stablecoins pegged to the
  Singapore Dollar **or any G10 currency including the US dollar**.
  Reserve assets must equal 100% of coins in circulation; issuers must
  publish whitepapers and reserve audits; lending and staking are
  prohibited. Singapore becomes the first major Asian jurisdiction to
  regulate USD-pegged stablecoins on its own statutory terms.
  <https://www.mas.gov.sg/news/media-releases/2023/mas-finalises-stablecoin-regulatory-framework>
- **2024 (full year)**: Total crypto trading volume on Malaysia's
  licensed exchanges rises to **RM13.9 billion**, up from **RM5.4
  billion** in 2023 — a **157% year-on-year increase** on regulated
  venues alone. Luno Malaysia reaches 1 million registered users and
  RM4.28 billion in assets under custody. SC reports listing 22
  approved digital assets; USD-pegged stablecoins remain absent.
  Source: SC Malaysia 2024 disclosures; Luno Malaysia public statement.
  <https://ringgitplus.com/en/blog/cryptocurrency/luno-malaysia-surpasses-1-million-users-as-digital-asset-investments-gain-traction.html>
- **June 2024**: Securities Commission Malaysia publishes Consultation
  Paper No. 1/2024 on proposed amendments to the *Guidelines on
  Digital Assets*. The paper does not propose to admit USD stablecoins
  to the approved-asset list.
  <https://www.sc.com.my/regulation/guidelines/digital-assets>
- **June 2025**: Bank Negara Malaysia launches the **Digital Asset
  Innovation Hub (DAIH)** — a regulatory sandbox for tokenisation and
  stablecoin experimentation. BNM later reports that **over 30**
  domestic and international participants have engaged with the hub.
  The sandbox scope is **ringgit-denominated** stablecoins and
  tokenised deposits; USD stablecoins are out of scope.
  <https://fintechnews.my/56513/blockchain/bnm-stablecoin-tokenised-deposits/>
- **18 July 2025**: President Donald Trump signs the **Guiding and
  Establishing National Innovation for US Stablecoins (GENIUS) Act**
  into US federal law (Public Law 119-27, having passed the House
  on 17 July 2025). The Act:
  - Creates the first US federal regulatory regime for payment
    stablecoins
  - Requires **100% backing in liquid USD assets** (cash or short-term
    Treasuries) with **monthly public reserve disclosures**
  - Brings issuers under the **Bank Secrecy Act**, mandating AML and
    sanctions-compliance programmes
  - **Requires payment-stablecoin issuers to maintain on-chain freezing
    capabilities** compliant with OFAC sanctions
  - Takes effect on the earlier of 18 months after enactment or 120
    days after primary federal stablecoin regulators issue
    implementing regulations.
  <https://www.whitehouse.gov/fact-sheets/2025/07/fact-sheet-president-donald-j-trump-signs-genius-act-into-law/>
  <https://www.lw.com/en/insights/the-genius-act-of-2025-stablecoin-legislation-adopted-in-the-us>
- **6 October 2025**: Standard Chartered's Geoffrey Kendrick and Madhur
  Jha publish "EM stablecoin savings — the next leg of dollarisation,"
  modelling stablecoin savings rising from **US$173 billion** today to
  **US$1.22 trillion by 2028** across 16 vulnerable EMs (Egypt,
  Pakistan, Turkey, India, Brazil, South Africa, Bangladesh, Sri Lanka,
  Colombia and others), implying **>US$1 trillion in deposit outflows**
  from EM banks. Malaysia is not on the named "most vulnerable" list
  but is exposed via the same mechanism.
  <https://www.theblock.co/post/373510/standard-chartered-estimates-1-trillion-could-exit-emerging-market-bank-deposits-for-us-stablecoins>
- **November 2025**: BNM publishes a discussion paper outlining a
  three-year asset-tokenisation roadmap (2025–2027) with greater
  regulatory clarity on ringgit stablecoins and tokenised deposits
  promised by **end-2026**.
  <https://fintechnews.my/54847/blockchain/bank-negara-malaysia-bnm-roadmap-for-asset-tokenisation-in-finance/>
- **9 December 2025**: Bullish Aim Sdn Bhd (chaired by Tunku Ismail
  Ibni Sultan Ibrahim) launches **RMJDT**, a ringgit-backed stablecoin
  issued on the Zetrix blockchain, backed by ringgit cash deposits and
  short-term Malaysian government securities. Launched under joint
  SC/BNM sandbox oversight, not full licensure. Bullish Aim also
  establishes a Digital Asset Treasury Company (DATCO) with an initial
  treasury allocation of RM500 million in Zetrix tokens, plans to
  scale to RM1 billion.
  <https://www.freemalaysiatoday.com/category/highlight/2025/12/09/tmj-launches-ringgit-backed-stablecoin-for-payments>
  <https://www.theasianbanker.com/press-releases/malaysia-s-regent-of-johor-launches-ringgit-backed-stablecoin-rmjdt-on-zetrix>
- **12 December 2025**: Capital A Berhad (AirAsia parent) and Standard
  Chartered Bank Malaysia announce a Letter of Intent to develop a
  separate ringgit-denominated B2B settlement stablecoin under BNM's
  DAIH sandbox.
  <https://theedgemalaysia.com/node/785749>
- **11 February 2026**: BNM publicly confirms **three** stablecoin /
  tokenised-deposit pilots will run in 2026: (a) Capital A +
  Standard Chartered MYR stablecoin; (b) Maybank tokenised deposits;
  (c) CIMB tokenised deposits. All three are **ringgit-denominated**.
  <https://www.cryptotimes.io/2026/02/11/malaysia-plans-wholesale-ringgit-stablecoin-and-tokenised-deposits/>
- **Early May 2026**: Aggregate stablecoin market capitalisation passes
  **US$323 billion**. USDT alone holds **US$171 billion**, USDC
  **US$60 billion** — combined ~US$231B, ~71% of the market in
  USD-pegged tokens. (The remaining ~US$92B spans other USD-pegged
  issuers — PYUSD, FDUSD, RLUSD — plus a small share of non-USD pegs.)
  USDT routinely processes **~US$703 billion in transactions per
  month**, peaking at **US$1.01 trillion in June 2025**. Tether holds
  **US$127 billion in US Treasury bills** as of Q2 2025, making it
  among the largest holders of US government debt globally.
  <https://www.fool.com/investing/2026/03/27/usdt-vs-usdc-which-will-win-the-stablecoin-race/>
  <https://www.plasma.to/learn/stablecoin-transaction-volume>
- **Cumulative to May 2026**: Tether has blacklisted **7,268 wallet
  addresses** holding a combined **US$3.29 billion** in USDT at OFAC,
  DOJ, FBI, and US Secret Service direction. Specific 2025 freezes
  include US$23M (Russian Garantex, March), US$9M (Bybit hack, March),
  US$225M (DOJ civil forfeiture, June), and US$344M (Iran sanctions
  evasion, April). The freezes are unilateral on-chain actions by the
  issuer; non-US holders have no domestic-court remedy.
  <https://blog.amlbot.com/stablecoin-freezes-2023-2025-a-data-backed-analysis-of-usdt-vs-usdc-by-amlbot/>
  <https://tether.io/news/tether-supports-freeze-of-more-than-344-million-in-usdt-in-coordination-with-ofac-and-u-s-law-enforcement/>

## THE FOUR STRUCTURAL EXPOSURES

This brief identifies four distinct exposures that the existing
licensing ban does not address. Cards should anchor on two of these
plus the reframe.

### 1. Visibility exposure (the blind spot itself)
Banning USDT/USDC on licensed exchanges does not stop Malaysians from
acquiring them; it removes BNM's ability to size the holding. Demand
routes via: (a) Binance P2P and OKX P2P in MYR; (b) offshore CEX
deposits funded by SWIFT or international card rails; (c) self-custody
wallets receiving USDT from foreign senders; (d) DeFi protocols
denominated in USD stablecoins. None of these surface in the
SC-published volume figure of RM13.9 billion for 2024. Malaysia is in
the FATF "in progress" category on Recommendation 15 implementation
(March 2024 status), and the latest mutual evaluation cycle noted
improvement but did not certify off-ramp telemetry as sufficient.
**The number BNM cannot quote is itself the policy artefact.**

### 2. Sanctions / extraterritorial exposure
The GENIUS Act subjects all permitted USD-stablecoin issuers to the
Bank Secrecy Act and the OFAC sanctions regime, and explicitly
requires on-chain freezing capability. Tether's existing track
record — 7,268 frozen addresses, US$3.29 billion frozen, freezes
executed without prior notice to non-US holders — demonstrates the
mechanism is live. For a Malaysian individual or corporate holding
USDT (whether onshore self-custodied or offshore-exchange-held), a US
sanctions designation can render the balance inaccessible immediately,
with no Malaysian court process available to compel reversal.
Malaysian banks face the same risk on the secondary-sanctions track:
any USD-denominated transaction that touches a US person, US
correspondent bank, or US clearing system pulls the institution into
OFAC jurisdiction. **For the first time in modern Malaysian financial
history, a foreign legislature has effective veto power over a USD
holding sitting in a Malaysian wallet.**

### 3. Currency-substitution exposure
The Standard Chartered model — US$1 trillion of EM bank-deposit
outflows into USD stablecoins by 2028 — names Malaysia's regional
peers but not Malaysia. The mechanism, however, is not jurisdiction-
specific: when a yield-on-USD instrument is one tap away on a phone,
the marginal saver in any country with FX volatility is rational to
hold some balance in it. The MYR/USD pair has traded in a 4.20–4.80
range from 2023 to early 2026, with episodes of pressure during US
rate-hike cycles. The IMF's 2025 working paper on stablecoin flows
identifies "digital dollarisation" as a distinct risk channel from
classical dollarisation precisely because it removes friction. The
BIS in April 2026 identified five risk categories — credit supply,
financial stability, monetary policy, fiscal policy, regulatory
circumvention — all of which apply to a small open economy with an
unpegged currency.
<https://www.imf.org/-/media/files/publications/wp/2025/english/wpiea2025141-source-pdf.pdf>
<https://www.bis.org/speeches/sp260420.pdf>

### 4. Adjacent ringgit-stablecoin governance exposure
Two separate ringgit-denominated stablecoins are now live or imminent
under Malaysian sandbox oversight: RMJDT (Bullish Aim, Dec 2025) and
the Capital A + Standard Chartered MYR settlement coin (LOI Dec 2025).
RMJDT is issued by a private company; the Capital A coin is bank-
issued. The two carry different reserve assumptions, redemption
mechanisms, and points of failure. Neither addresses the USD
stablecoin exposure that the *ban* on USD stablecoins was supposed to
defend against; they are a parallel programme aimed at faster
domestic payment rails. BNM has not yet published the full unified
framework that would govern fail-modes (de-pegging, issuer insolvency,
reserve-asset stress) across multiple issuer types. **The
ringgit-stablecoin track is a real policy initiative answering a
real question; it is not the answer to the question this issue
poses.**

## ACTORS

- **Bank Negara Malaysia (BNM)** — central bank. Runs the Digital
  Asset Innovation Hub; sets monetary policy; oversees AML/CFT
  digital-currency framework (Sector 6, since 2018); not yet
  regulating USD stablecoins.
- **Securities Commission Malaysia (SC)** — markets regulator.
  Licenses the six Digital Asset Exchanges; maintains the approved-
  asset list (22 tokens as of mid-2025); responsible for the
  prohibition on USD-pegged stablecoins on regulated venues.
- **The six SC-registered DAX operators** — Luno Malaysia, Tokenize
  Xchange, SINEGY, MX Global, HATA, Torum International. None offer
  USDT/USDC trading pairs.
- **United States Treasury, OFAC, and the Stablecoin Certification
  Review Committee (SCRC)** — under the GENIUS Act, the principal
  federal regulators of USD stablecoin issuers.
- **Tether Operations Limited** — issuer of USDT (~US$171B market
  cap, May 2026). Has frozen US$3.29B at US authority direction.
- **Circle Internet Group Inc.** — issuer of USDC (~US$60B market
  cap). Publicly listed; Deloitte attests monthly reserves.
- **Standard Chartered Bank Malaysia + Capital A Berhad** —
  designated lead participants in BNM's 2026 ringgit-stablecoin
  B2B settlement pilot.
- **Maybank, CIMB** — designated lead participants in BNM's 2026
  tokenised-deposit pilots.
- **Bullish Aim Sdn Bhd** — private issuer of RMJDT (December 2025);
  ringgit stablecoin operating under joint SC/BNM sandbox.
- **Monetary Authority of Singapore (MAS)** — peer regulator with
  the closest fully-articulated stablecoin framework covering USD
  pegs (Aug 2023).
- **Financial Action Task Force (FATF)** — sets Recommendation 15
  on virtual assets; assessed Malaysia in 2025 mutual-evaluation cycle.
- **International Monetary Fund (IMF)** and **Bank for International
  Settlements (BIS)** — independent voices flagging digital-
  dollarisation and stablecoin transmission risk to EMs.
- **Geoffrey Kendrick (Global Head of Digital Assets Research,
  Standard Chartered)** — author of the October 2025 US$1T EM
  outflow model.

## RELEVANT LAW

**Malaysia**
- *Central Bank of Malaysia Act 2009*: recognises the Malaysian ringgit
  as the sole legal tender of Malaysia.
- *Financial Services Act 2013* and *Islamic Financial Services Act
  2013*: regulate payment instruments and approved licensed activities
  in Malaysian financial system; provide the statutory hook BNM uses
  to assess whether a stablecoin would constitute a payment instrument
  requiring approval.
- *Capital Markets and Services Act 2007 (CMSA)*: under SC's
  *Capital Markets and Services (Prescription of Securities) (Digital
  Currency and Digital Token) Order 2019*, certain digital tokens are
  prescribed as securities, bringing them within SC's jurisdiction.
- *Anti-Money Laundering, Anti-Terrorism Financing and Proceeds of
  Unlawful Activities Act 2001 (AMLA)*: read with BNM's 2018 Digital
  Currency Sector 6 Guidelines, makes digital currency exchangers
  reporting institutions.
- *Guidelines on Recognized Markets* (SC, latest revision under
  consultation 2024): governs DAX licensing and the approved-asset
  list. Section on approved digital assets is the operative
  prohibition on USDT/USDC trading.

**United States (relevant to extraterritorial reach)**
- *Guiding and Establishing National Innovation for US Stablecoins
  Act of 2025* (GENIUS Act), Public Law 119-27: federal regime for
  payment stablecoin issuers; reserve, disclosure, AML/sanctions,
  and on-chain-freeze obligations.
- *International Emergency Economic Powers Act* (IEEPA), 50 U.S.C.
  § 1701 et seq. — statutory basis for OFAC sanctions designations.
- *Bank Secrecy Act* (BSA) — AML reporting framework now expressly
  applied to permitted payment stablecoin issuers via GENIUS.

**Singapore (peer benchmark)**
- *Payment Services Act 2019* as amended; MAS *Stablecoin
  Regulatory Framework* (Aug 2023) covering SCS pegged to SGD or any
  G10 currency including USD.

**International standards**
- *FATF Recommendation 15* and INR.15 (revised 2019) on virtual
  assets and virtual-asset service providers. Malaysia's
  implementation status: "in progress" (FATF March 2024 snapshot);
  reassessed in 2025 mutual evaluation cycle (improvement noted; not
  certified Compliant).

## KEY STATISTICS

- **0** — number of USD-pegged stablecoins on the SC's approved
  digital asset list (May 2026).
- **22** — total approved digital assets across Malaysia's six
  licensed DAX operators (mid-2025).
- **6** — number of SC-registered DAX operators in Malaysia (Luno,
  Tokenize, SINEGY, MX Global, HATA, Torum).
- **RM13.9 billion** — total crypto trading volume on Malaysia's
  licensed exchanges, 2024.
- **RM5.4 billion** — same metric, 2023.
- **157%** — year-on-year growth in licensed-exchange volume
  (2023 → 2024).
- **~4 million** — estimated Malaysians using cryptocurrency in
  2025 (≈12.5% of population, ≈1 in 8).
- **US$323 billion** — total stablecoin market capitalisation,
  May 2026.
- **US$171 billion** — Tether (USDT) market cap, May 2026.
- **US$60 billion** — Circle (USDC) market cap, May 2026.
- **~71%** — combined USDT + USDC share of total stablecoin market
  cap (May 2026).
- **US$703 billion / month** — USDT transaction volume, June 2024 –
  June 2025 average.
- **US$1.01 trillion** — USDT peak monthly volume (June 2025).
- **US$127 billion** — Tether's US Treasury bill holdings (Q2 2025).
- **7,268** — Tether wallet addresses blacklisted at OFAC and US
  law-enforcement direction (cumulative to May 2026).
- **US$3.29 billion** — total USDT frozen in those blacklisted
  addresses.
- **US$1 trillion** — Standard Chartered projection (Oct 2025) for
  emerging-market deposit outflows into USD stablecoins by 2028.
- **US$173 billion → US$1.22 trillion** — EM stablecoin savings
  trajectory, today to 2028, in the Standard Chartered model.
- **18 months** (or 120 days after final regulations) — GENIUS Act
  effective-date trigger from 18 July 2025 enactment.
- **End-2026** — BNM's self-set deadline for greater clarity on
  ringgit stablecoins and tokenised deposits.
- **30+** — domestic and international participants engaged with
  BNM's Digital Asset Innovation Hub since June 2025.
- **3** — ringgit-side stablecoin and tokenised-deposit pilots
  greenlit for 2026 under DAIH.
- **0** — pilots in scope addressing USD-pegged stablecoin exposure
  on unregulated rails.

## 12-DIMENSION RISK ASSESSMENT

1. **Sentiment** — MEDIUM: Crypto coverage in Malaysia oscillates
   between boosterism and panic. Cards must hold the structural
   register — no scolding of users, no cheerleading of innovation.
2. **Political** — MEDIUM: Critique is of regulatory architecture,
   not of any party. BNM and the SC are both technocratic
   institutions; the brief should not be read as criticism of any
   minister or coalition.
3. **Ethnic** — LOW: Not an ethnic narrative.
4. **Religious** — LOW: Not a religious matter (Shariah-compliant
   tokenisation is mentioned but is not central).
5. **Narrative** — HIGH: Mainstream framings (innovation-as-progress
   vs. caution-as-virtue) both miss the structural gap. T4A's
   contribution lives in that gap.
6. **Completeness** — MEDIUM: BNM has not yet published off-ramp
   telemetry; the size of unregulated MYR→USDT flow is the central
   unknown. Cards must label this gap, not invent a number.
7. **Temporal** — MEDIUM: GENIUS Act effective date is sliding;
   BNM's framework deadline is end-2026. Cards should avoid implying
   any regime is final.
8. **Confidence** — HIGH on US, Singapore, global numbers (multiple
   independent sources). MEDIUM on Malaysia-specific off-ramp scale
   (no primary telemetry).
9. **Sources** — HIGH: Bernama, NST, The Star, Edge, FMT, BNM
   official statements, MAS official, US White House, SEC.gov, Law
   firm primers (Latham, Mayer Brown), BIS, IMF, Standard Chartered
   research. Spectrum: government, opposition-leaning, technocratic,
   international.
10. **Geographic** — MEDIUM: Story is national in scope; Johor
    (RMJDT launch) and KL (BNM, SC, Capital A, Maybank, CIMB) are
    the relevant nodes.
11. **Economic** — HIGH: Issue is fundamentally about monetary and
    financial-stability transmission channels. Cards must be precise
    on the mechanism (currency substitution, deposit flight,
    sanctions reach) without overclaiming the size.
12. **Gender** — LOW: Not a gendered story.

**3R-specific note (Royalty):** RMJDT is issued by a company chaired
by Tunku Ismail Ibni Sultan Ibrahim, Crown Prince (Tunku Mahkota) of
Johor. T4A's editorial line is to critique policy, not personalities,
and never to direct critique at royal figures. RMJDT belongs in the
brief because it is the live ringgit-stablecoin data point and was
launched outside the BNM core sandbox; the brief notes it factually,
positions it inside the *Adjacent ringgit-stablecoin governance
exposure* (Exposure 4), and **does not** make it the centre of the
issue. Cards must not name the Tunku or frame RMJDT as the story.
The story is the structural USD-stablecoin gap on the BNM/SC side.

## RECOMMENDED LENSES
Economic, Governance, Regional (Singapore comparator), Technology,
Legal (GENIUS Act / OFAC reach), Security (sanctions exposure).
Prioritise **Economic**, **Governance**, **Regional** for fact-card
lens diversity.

## SOURCES

**Primary / official / statutory**
1. Bank Negara Malaysia, "AML/CFT — Digital Currencies (Sector 6),"
   BNM/RH/PD 030-2, 15 May 2018.
   <https://www.bnm.gov.my/documents/20124/65312/20180515+-+PD+Digital+currency.pdf/>
2. Bank Negara Malaysia, official position page on Digital Currencies.
   <https://www.bnm.gov.my/digital-currencies>
3. Bank Negara Malaysia, "BNM and SC's Joint Response on 'Policy
   confusion over cryptocurrencies'."
   <https://www.bnm.gov.my/-/bnm-and-sc-s-joint-response-on-policy-confusion-over-cryptocurrencies->
4. Bank Negara Malaysia, Statement on Bitcoin.
   <https://www.bnm.gov.my/-/statement-on-bitcoin>
5. Securities Commission Malaysia, "List of Registered Digital Asset
   Exchanges — Recognized Markets."
   <https://www.sc.com.my/regulation/guidelines/recognizedmarkets/list-of-registered-digital-asset-exchanges>
6. Securities Commission Malaysia, Digital Assets — Guidelines.
   <https://www.sc.com.my/regulation/guidelines/digital-assets>
7. Capital Markets and Services (Prescription of Securities) (Digital
   Currency and Digital Token) Order 2019, P.U.(A) 12/2019.
8. White House, "Fact Sheet: President Donald J. Trump Signs GENIUS
   Act into Law," 18 July 2025.
   <https://www.whitehouse.gov/fact-sheets/2025/07/fact-sheet-president-donald-j-trump-signs-genius-act-into-law/>
9. US Securities and Exchange Commission, Atkins Statement on
   GENIUS Act, 18 July 2025.
   <https://www.sec.gov/newsroom/speeches-statements/atkins-statement-genius-act-071825>
10. Monetary Authority of Singapore, "MAS Finalises Stablecoin
    Regulatory Framework," August 2023.
    <https://www.mas.gov.sg/news/media-releases/2023/mas-finalises-stablecoin-regulatory-framework>

**International standards / supranational analysis**
11. Financial Action Task Force, "Targeted Update on Implementation
    of the FATF Standards on Virtual Assets and VASPs," June 2024.
    <https://www.fatf-gafi.org/content/dam/fatf-gafi/recommendations/2024-Targeted-Update-VA-VASP.pdf.coredownload.inline.pdf>
12. FATF, "Status of implementation of Recommendation 15 by FATF
    Members and Jurisdictions with Materially Important VASP
    Activity" — Malaysia entry, status "in progress" (March 2024).
    <https://www.fatf-gafi.org/en/publications/Virtualassets/VACG-Snapshot-Jurisdictions.html>
13. IMF Working Paper WP/25/141, "How to Estimate International
    Stablecoin Flows," 2025.
    <https://www.imf.org/-/media/files/publications/wp/2025/english/wpiea2025141-source-pdf.pdf>
14. BIS, Pablo Hernández de Cos, "Stablecoins: framing the debate,"
    speech, April 2026.
    <https://www.bis.org/speeches/sp260420.pdf>
15. BIS Working Papers No. 1270, "Stablecoins and safe asset prices."
    <https://www.bis.org/publ/work1270.pdf>
16. Standard Chartered research, "EM stablecoin savings — the next
    leg of dollarisation," reported by The Block, October 2025.
    <https://www.theblock.co/post/373510/standard-chartered-estimates-1-trillion-could-exit-emerging-market-bank-deposits-for-us-stablecoins>

**GENIUS Act legal analysis**
17. Latham & Watkins, "The GENIUS Act of 2025: Stablecoin
    Legislation Adopted in the US."
    <https://www.lw.com/en/insights/the-genius-act-of-2025-stablecoin-legislation-adopted-in-the-us>
18. Mayer Brown, "GENIUS Act Signed into Law US Enacts Federal
    Stablecoin Legislation," July 2025.
    <https://www.mayerbrown.com/en/insights/publications/2025/07/genius-act-signed-into-law-us-enacts-federal-stablecoin-legislation>
19. Arnold & Porter, "Analyzing the GENIUS Act," July 2025.
    <https://www.arnoldporter.com/en/perspectives/advisories/2025/07/new-stablecoin-legislation-analyzing-the-genius-act>

**Malaysia digital-asset coverage (national and trade press)**
20. Fintech News Malaysia, "BNM to Test Ringgit Stablecoins and
    Tokenised Deposits This Year," 2026.
    <https://fintechnews.my/56513/blockchain/bnm-stablecoin-tokenised-deposits/>
21. Fintech News Malaysia, "BNM Roadmap for Asset Tokenisation in
    Finance," November 2025.
    <https://fintechnews.my/54847/blockchain/bank-negara-malaysia-bnm-roadmap-for-asset-tokenisation-in-finance/>
22. The Edge Malaysia, "Capital A teams up with Standard Chartered
    Malaysia to explore ringgit-backed stablecoin," December 2025.
    <https://theedgemalaysia.com/node/785749>
23. AirAsia Newsroom, "Capital A and Standard Chartered Malaysia
    set to explore MYR stablecoin sandbox initiative," 12 Dec 2025.
    <https://newsroom.airasia.com/news/2025/12/12/capital-a-and-standard-chartered-malaysia-set-to-explore-myr-stablecoin-sandbox-initiative>
24. FMT, "TMJ launches ringgit-backed stablecoin for payments,"
    9 December 2025.
    <https://www.freemalaysiatoday.com/category/highlight/2025/12/09/tmj-launches-ringgit-backed-stablecoin-for-payments>
25. The Asian Banker, "Malaysia's Regent of Johor launches
    ringgit-backed stablecoin RMJDT on Zetrix," December 2025.
    <https://www.theasianbanker.com/press-releases/malaysia-s-regent-of-johor-launches-ringgit-backed-stablecoin-rmjdt-on-zetrix>
26. RinggitPlus, "Luno Malaysia Surpasses 1 Million Users As
    Digital Asset Investments Gain Traction."
    <https://ringgitplus.com/en/blog/cryptocurrency/luno-malaysia-surpasses-1-million-users-as-digital-asset-investments-gain-traction.html>
27. AInvest, "The Strategic Case for Investing in Malaysia's
    Evolving Digital Asset Ecosystem," December 2025.
    <https://www.ainvest.com/news/strategic-case-investing-malaysia-evolving-digital-asset-ecosystem-2512/>

**Stablecoin freeze / OFAC enforcement data**
28. AMLBot, "Stablecoin Freezes 2023–2025: Data Analysis of USDT
    vs USDC."
    <https://blog.amlbot.com/stablecoin-freezes-2023-2025-a-data-backed-analysis-of-usdt-vs-usdc-by-amlbot/>
29. Tether.io, "Tether Supports Freeze of More Than $344 Million
    in USD₮ in Coordination with OFAC and U.S. Law Enforcement."
    <https://tether.io/news/tether-supports-freeze-of-more-than-344-million-in-usdt-in-coordination-with-ofac-and-u-s-law-enforcement/>
30. TRM Labs, "OFAC Sanctions Crypto Addresses Associated with the
    Central Bank of Iran, Freezes USD 344 Million."
    <https://www.trmlabs.com/resources/blog/ofac-sanctions-crypto-addresses-associated-with-the-central-bank-of-iran-freezes-usd-344-million>

**Market data**
31. Motley Fool, "USDT vs. USDC: Which Will Win the Stablecoin
    Race?," March 2026.
    <https://www.fool.com/investing/2026/03/27/usdt-vs-usdc-which-will-win-the-stablecoin-race/>
32. Plasma, "Stablecoin Transaction Volume Trends in 2026."
    <https://www.plasma.to/learn/stablecoin-transaction-volume>
33. Chainalysis, "2024 Global Crypto Adoption Index."
    <https://www.chainalysis.com/blog/2024-global-crypto-adoption-index/>
34. Chainalysis, "Crypto Adoption Accelerates in APAC Region"
    (2025).
    <https://www.chainalysis.com/blog/asia-pacific-crypto-adoption-2025/>

**Regulatory comparator analysis**
35. PANews, "Overview of Cryptocurrency in Malaysia: Dual
    Regulatory Model."
    <https://www.panewslab.com/en/articles/lc23yr39f56e>
36. The Sumsuber, "Crypto Regulations in Malaysia — 2025 Guide."
    <https://sumsub.com/blog/crypto-regulations-in-malaysia-guide/>
37. Disruption Banking, "Why Singapore's Crypto Regulation Is
    Outshining MiCA in 2025."
    <https://www.disruptionbanking.com/2025/12/29/why-singapores-crypto-regulation-is-outshining-mica-in-2025/>

## CONTRADICTIONS

- **Total stablecoin market cap May 2026** — Reported variously as
  "near $323 billion" (FXStreet) and "$320 billion" (Yellowcard
  rounding). Use **US$323 billion** in cards as the more granular
  figure, with the option of "more than US$300 billion" if character
  count is tight. The USDT + USDC combined figure of "~71%" is
  computed from US$231B / US$323B and is consistent with the "USDT +
  USDC together account for ~90%" framing from older Standard
  Chartered analyses that defined the market as USDT + USDC + a small
  basket of other USD pegs; the difference is denominator scope, not
  contradiction. Cards should use 71% with the US$323B denominator.

- **Tether freezes — "blacklisted 7,268 addresses, $3.29 billion"
  vs "275 law enforcement agencies, 59 jurisdictions"** — The first
  is a cumulative on-chain count; the second is a cooperation-
  partner count. Both are from Tether's own public disclosures and
  do not contradict; cards should use the on-chain count.

- **Standard Chartered model: "16 vulnerable countries" — Malaysia
  not named** — The original Kendrick-Jha report names Egypt,
  Pakistan, Turkey, India, Brazil, South Africa, Bangladesh, Sri
  Lanka, Colombia and others. **Malaysia is not on the named list.**
  Cards must not imply Standard Chartered specifically forecast
  Malaysian outflows; the brief uses the model to illustrate the
  mechanism, not to put a number on Malaysia. Frame as: "the same
  mechanism applies."

- **Approved digital assets in Malaysia: "22" vs Luno's coin list of
  50+** — The "22 approved digital assets" figure is the SC's
  aggregate list across all six DAX; each individual DAX offers a
  subset (Luno offers more than Tokenize). Some of the Luno list
  appears to exceed 22 because the count cited in regulatory
  commentary may be a point-in-time figure and the SC list is
  updated. Cards should use "fewer than 25" or "around 22" rather
  than the precise number, and footnote that the list is updated.

- **BNM "DAIH launched June 2025" vs some sources saying "earlier
  2025"** — June 2025 is the date BNM cites in subsequent
  communications. Use June 2025.

- **GENIUS Act enactment date** — Some sources say "July 17"
  (House passage); some say "July 18" (Trump signature). The
  Act became law on **18 July 2025** when signed; cards should use
  this date.

## SOURCE SPECTRUM CHECK

- **Malaysian government / national / regulatory**: Bank Negara
  Malaysia (own statements and discussion papers), Securities
  Commission Malaysia (own lists and guidelines), Bernama-line
  coverage via The Star and NST.
- **Centrist / independent Malaysian press**: The Edge, FMT,
  Malaysiakini, Malay Mail, Fintech News Malaysia.
- **International press / trade**: The Block, CoinDesk, FXStreet,
  Yahoo Finance, Bloomberg (TMJ launch).
- **Supranational / official sources**: IMF (working paper), BIS
  (speech + working paper), FATF (targeted update + jurisdiction
  snapshot).
- **US government / regulatory**: White House (GENIUS Act fact
  sheet), SEC.gov (Atkins statement), OFAC (sanctions designations
  via TRM Labs reporting), Tether's own disclosures.
- **Banking research**: Standard Chartered (Geoffrey Kendrick research).
- **Legal practitioner notes**: Latham & Watkins, Mayer Brown,
  Arnold & Porter, Practical Law (GENIUS Act primers).

Spectrum coverage is broad — government, opposition-leaning,
technocratic, supranational, US regulatory, and private-bank
analytical all present. The weakest leg is **community voice** —
no primary survey of Malaysian retail crypto users about USD
stablecoin usage exists in this brief. Cards should reflect this
gap by not putting words in users' mouths.

## EDITORIAL FRAME (provisional, for Stage 1)

The mainstream framings sort along two predictable axes:

1. **"BNM is innovating responsibly with ringgit stablecoins"**
   (innovation-as-progress). True at the level of the pilots; misses
   that the pilots address a different exposure than the one created
   by the USD-stablecoin ban.
2. **"Malaysia is sensibly cautious on crypto"** (caution-as-virtue).
   True at the level of the licensed-exchange experience; misses
   that the caution is on the licensed surface only and the actual
   exposure has been pushed into the dark.

T4A's distinct contribution is **the structural visibility question**:

- Banning USDT/USDC on regulated exchanges did not remove the
  exposure; it removed the data.
- The exposure has been growing through unregulated rails during
  a period when (a) the US has federalised USD-stablecoin issuance
  with extraterritorial sanctions reach via GENIUS, and (b)
  Standard Chartered has put a US$1 trillion number on the EM
  outflow trajectory.
- BNM's ringgit-side pilots are a real initiative but they answer
  the wrong question for this exposure. They address how
  Malaysians might *use* tokenised ringgit; they do not address
  how Malaysians are already *holding* tokenised dollars.

The reframe should rotate readers from "is BNM keeping up?" to
**"When the dollar moves on-chain, who has standing to defend the
ringgit?"** — which is a structural question about jurisdiction
(US federal law over USDT/USDC holds anywhere in the world) more
than a question about BNM's pace.

Working WhatsApp-test view-card sentence (draft): *"The ban on
dollar stablecoins did not remove the exposure. It removed the
number."*

Alternative: *"The dollar is now a piece of software. Malaysia has
six licensed exchanges that cannot touch it, one foreign legislature
that can freeze it, and no number for how much of it Malaysians
already hold."*

## HOOK ENGINEERING — DRAFT SURFACES

**Headline candidates (75-char target, 100 max):**
- "Malaysia banned USDT on licensed exchanges. The exposure went where BNM cannot see it." (94)
- "Six exchanges, zero dollar stablecoins, one foreign law that can freeze them all." (82)
- "BNM's stablecoin sandbox tests ringgit. Malaysians are already holding dollars." (79)

**Hook card big (120-180 char target):**
- "Malaysia's six licensed exchanges list 22 approved digital assets. Zero are USD stablecoins. The dollar has not stopped coming in; it moved to rails the regulator cannot see."

**Hook card sub (160-220 char target):**
- "Standard Chartered models US$1 trillion exiting emerging-market bank deposits for USD stablecoins by 2028. Malaysia is not on the named list. The mechanism does not require being named."

## RISK FLAGS

- **3R (Royalty)**: MEDIUM-HIGH at the data level (RMJDT issuer
  chair is the Tunku Mahkota of Johor). Cards must not name the
  Tunku, not characterise RMJDT as the story, and not be readable
  as criticism of royalty. RMJDT is one data point in Exposure 4
  and stays as a data point.
- **3R (Race, Religion)**: LOW. Not implicated.
- **Defamation**: LOW. All named institutions (BNM, SC, Tether,
  Circle, Standard Chartered, Capital A, Maybank, CIMB) are
  discussed as policy actors with reference to their own published
  statements and licensed activities.
- **OSA**: None — all sources public, including BNM/SC published
  guidelines and discussion papers.
- **Sedition Act**: None — critique is of regulatory architecture.
- **CMA Section 233**: None — no offensive content.
- **Stage-3 fact-verification priorities**: Verify (a) the exact
  GENIUS Act enactment date; (b) the SC's current approved-asset
  count (the 22 number may have moved); (c) the Tether frozen-
  address and frozen-dollar cumulative figures (these grow);
  (d) the Standard Chartered US$1T figure attribution; (e) the
  RM13.9B vs RM5.4B trading volume figures (Luno disclosure).
- **Information gap to label in cards**: BNM has not published an
  official estimate of MYR→USD-stablecoin off-ramp flow. **This is
  itself the point.** Cards must label this absence rather than
  invent a number.
- **No banned terms**: The brief uses "AI", "model", "Claude",
  "GPT", and similar zero times in the headline/context/card-
  facing sections. Internal references to BIS / IMF / Standard
  Chartered authors are fine as named attributions; they are not
  AI references.

## STAGE 1 GUIDANCE

The reader needs to leave with three things:
1. The licensed-exchange ban exists and is binding; the dollar
   stablecoin exposure exists anyway, on rails the regulator does
   not measure.
2. The US has federalised the asset; OFAC freezes have already
   happened at billion-dollar scale; the exposure now carries a
   foreign-policy attribute the ringgit does not.
3. The ringgit-stablecoin pilots are real but answer a different
   question from the one this issue poses.

The reframe must be structural, not partisan. The view card must
pass the WhatsApp test — a single sentence a thoughtful reader
would paste into a group chat with no commentary.
