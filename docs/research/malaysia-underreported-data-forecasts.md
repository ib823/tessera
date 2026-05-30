# Malaysia's Silent Data: Open-Source Series and Defensible Forecasts

**Compiled 2026-05-30.** A working reference for T4A editorial. Two parts: **(A)** a catalogue of the
publicly open Malaysian data sources worth mining, and **(B)** worked forecasts on the issues that are
plainly visible in that data yet under-covered by Malaysian media.

This document obeys the T4A Accuracy Standard. Every figure is tagged **[ACTUAL]**, **[EST]** (official
revised estimate), **[OFFICIAL PROJ]** (a forecast the government/IMF/UN already published), or
**[T4A EXTRAPOLATION]** (computed here, with method shown). The four cardinal sins — overclaim, underclaim,
misleading framing, unverified detail — apply with full force. **No [T4A EXTRAPOLATION] figure may be
published in an issue as if it were an observed fact.** Forecasts are framed as "on current trend" and
carry their confidence band. Where the underlying data cannot support a forecast, that is stated, not papered over.

> **Reproducibility.** All Part B numbers come from `scripts/`-style computation (OLS with prediction
> intervals where n≥3, CAGR compounding, the standard debt-dynamics recursion, and logistic fits). The
> method appendix (§D) gives every equation and input so any figure can be regenerated and challenged.

---

## How to read the "silent issue" claim

An issue qualifies as *silent* here when **all three** hold:
1. The data is **publicly open** — a primary Malaysian source, no FOI request, no paywall.
2. The **trend is unambiguous** in that data — not a single scary year, a multi-point series.
3. **Mainstream Malaysian coverage looks elsewhere** — reports the reassuring headline number while the
   structurally important number sits one table away.

The editorial value is precisely in the gap between (2) and (3): the reframe writes itself.

---

# PART A — THE OPEN-DATA SOURCE CATALOGUE

## A.1 The machine-readable backbone

| Source | What it gives | Coverage | Cadence | Access | Notes |
|---|---|---|---|---|---|
| **OpenDOSM / data.gov.my** | Population, fertility, CPI, labour, trade, GDP, fiscal | Most series 1980s/2000s→present | Monthly–annual by series | **Open API + raw Parquet** at `storage.dosm.gov.my/<domain>/<series>.parquet` (no auth) | The canonical machine-readable source. The HTML dashboards 403 to bots; pull the Parquet/CSV directly. |
| **Bank Negara Malaysia (BNM)** | Debt, household debt, monetary, external, fiscal sector | Long monthly series | Monthly + semi-annual FSR | National Summary Data Page (NSDP) + BNM API | Use BNM Monthly Statistical Bulletin for a clean RM debt series rather than mixing with World Bank. |
| **World Bank Open Data** | Debt %GDP, health exp %GDP, suicide rate, emigration | Annual, cross-country | Annual | Open API (`GC.DOD.TOTL.GD.ZS`, `SH.XPD.CHEX.GD.ZS`, `SH.STA.SUIC.P5`) | Best for international benchmarking; coverage differs slightly from MOF. |
| **IMF (WEO + Article IV)** | General-govt gross debt, net lending, growth | Annual + forecast | Apr/Oct WEO; annual Art IV | DataMapper API | Independent forecast cross-check on MOF's own numbers. |
| **UN World Population Prospects** | Population, TFR, age structure, dependency | To 2100 | ~Biennial | Open CSV/API | Independent cross-check on DOSM projections. |

## A.2 Fiscal & debt

| Source | Series | Access / cadence |
|---|---|---|
| **MOF Fiscal Outlook** (annual, with Budget, October) | Federal debt, statutory debt, deficit, guarantees, emoluments, pensions, debt service | `belanjawan.mof.gov.my/.../sectionN.pdf` — **bot-protected (403); open the PDF manually to confirm table/page before publishing.** |
| **MOF Budget / Economic Outlook** | Revenue, OpEx/DevEx breakdown | Annual |
| **Dewan Rakyat Hansard** | Pension headcount + spend, contract-doctor counts | Per parliamentary answer (primary, citable) |
| **KWAP annual report** | Pension fund size vs pay-as-you-go gap | Annual |
| **Public Finance & Fiscal Responsibility Act 2023 (Act 850)** | Statutory caps: deficit ≤3%, debt ≤60% medium-term, guarantees ≤25% GDP | The legal benchmark to measure outcomes against |

## A.3 Demographics & labour

| Source | Series | Access / cadence |
|---|---|---|
| **DOSM Vital Statistics** | TFR (national/ethnic/state), births, deaths | Annual (~Oct/Nov); Parquet `demography/fertility.parquet` |
| **DOSM Population Projections 2020–2060** | Age structure, dependency, the population peak | Periodic; the official cohort-component projection |
| **DOSM Census 2020 + Current Population Estimates** | Total population, ethnic composition | Decennial census + annual estimates |
| **DOSM Labour Force Survey / Labour Market Review** | LFPR, employment, unemployment | Monthly + annual |
| **DOSM Informal Sector Survey** | Informal employment outside EPF/SOCSO | Periodic (not annual) |
| **DOSM Household Income Survey (HIES)** | B40/M40/T20 thresholds, median/mean income | ~Biennial |
| **World Bank Malaysia Economic Monitor** | Brain-drain / diaspora size and skill share | Irregular (major reports 2011, 2026) |
| **Immigration Dept / IOM / DOSM Int'l Migration** | Documented + undocumented foreign workers | Quarterly (documented); periodic estimates |

## A.4 Environment & climate

| Source | Series | Access / cadence |
|---|---|---|
| **NAHRIM** | Sea-level-rise projections by coastal segment; storm surge | Irregular major studies (2010, 2017); `mycoast.nahrim.gov.my` |
| **SPAN — Water & Sewerage Factbook** | Non-revenue water (national + state), per-capita use | Annual factbook |
| **Air Selangor Sustainability Report** | Treated-water reserve margin | Annual |
| **DOSM flood special reports** | Flood losses by asset class, %GDP | Ad-hoc per major event (a gap — no fixed annual series) |
| **NADMA** | Evacuees, relief centres, warnings | Near-real-time in monsoon |
| **Global Forest Watch (Hansen/UMD)** | Annual tree-cover & primary-forest loss | Annual (April); `globalforestwatch.org/dashboards/country/MYS` |
| **DOSM Supply & Utilization Accounts** | Self-sufficiency ratios (54 commodities), import dependency | Annual |
| **NRES / UNFCCC NDC registry** | Emissions targets, net-zero 2050 | Per NDC cycle (~5 yr) |

## A.5 Health & social

| Source | Series | Access / cadence |
|---|---|---|
| **MOH / IKU — NHMS** | Diabetes, obesity, hypertension, depression, suicidal ideation | ~Every 4 yr (2011/2015/2019/2023); fact sheets at `iku.nih.gov.my` |
| **MOH Health Facts (annual)** | Doctor/nurse/specialist counts and ratios | Annual |
| **MOH National Health Accounts (MNHA)** | Total health expenditure, public/private, out-of-pocket | Annual (1997→present) |
| **NAPIC / JPPH** | House Price Index, residential overhang by price band | Quarterly + annual |
| **Khazanah Research Institute** | Housing median-multiple (Demographia method) | Periodic reports |
| **BNM Financial Stability Review** | Household debt / GDP, impairment | Semi-annual |
| **IDF Diabetes Atlas** | External diabetes projection (adults 20–79) | ~Biennial; the only published forward diabetes projection |

### A.6 Access reality (important for any pipeline built on this)
Most Malaysian government **portals 403 automated fetches** (DOSM HTML, MOF PDFs, SPAN, GFW, IKU, MOH).
Two practical consequences:
- **Pull Parquet/CSV from `storage.dosm.gov.my`** rather than scraping dashboards — it is open and un-gated.
- **Before any number is published in a T4A issue, the named primary PDF must be opened manually** to confirm
  the table/page. Search-surfaced figures (how Part B's raw inputs were gathered) are a *lead*, not a citation.

---

# PART B — THE SILENT ISSUES, WITH WORKED FORECASTS

Each issue: the open data → the method → the math → the forecast with its honest band → the silent angle → a
ready T4A hook. Forecasts are "on current trend"; none is a prophecy.

---

## B.1 FISCAL — The pension burden nobody caps

**The data [ACTUAL, Dewan Rakyat]:** Federal pension spend RM26.39B (2020) → RM28.04B (2021) → RM30.26B
(2022) → RM32.01B (2023); pensioners 859,422 (2020) → 931,707 (2023), nearing 1 million. Pension spend was
~RM11B in 2010. Retirement charges hit RM40.06B in 2025 [EST] and a forecast RM42.8B in 2026 [OFFICIAL PROJ].

**Method:** log-linear OLS on 2020–2023 (R²=0.997) and CAGR 2010→2023, cross-checked against the
government's own published projection.

**The forecast [T4A EXTRAPOLATION]:**
- CAGR 2010–2023 = **8.6%/yr**.
- Pension spend on trend: **~RM51B by 2030** (95% PI RM46–56B), **~RM98B by 2040** (95% PI RM79–121B).
- The government's own published projection: **RM46.4B (2030), RM120B (2040).** Our independent fit
  **brackets** the official numbers — they are mutually corroborating, not in conflict.

**The silent angle:** Emoluments + pensions are already **~45% of operating expenditure** and rising
faster than revenue. The unfunded actuarial liability — variously put at RM483B (2017), ~RM800B, or
RM1.3 trillion (no single audited figure exists) — sits **entirely outside** the debt-to-GDP ratio and
**outside any statutory cap.** Coverage debates the 65% debt ceiling; the pension liability dwarfs it and
is uncapped.

**T4A hook:** *"Putrajaya will pay roughly RM100 billion a year in civil-service pensions by 2040, triple
today's bill — and not one ringgit of it counts against the debt ceiling everyone argues about."*

---

## B.2 FISCAL — Three debt numbers, one ceiling, and the path that matters

**The data [ACTUAL]:** Three nested debt concepts media routinely blur — **statutory debt 63.5%** (the only
one legally capped, at 65%), **total federal debt 64.7%**, and **total debt + liabilities 84.1%** of GDP
(RM1.69 trillion, end-June 2025). Guarantees RM424.7B (21.1% GDP, under the 25% cap). Deficit **4.1% in 2024**
[ACTUAL], 3.8% (2025) and 3.5% (2026) targets; FRA statutory benchmark is **3% deficit / 60% debt**.

**Method:** the standard debt-dynamics recursion `bₜ = bₜ₋₁·(1+r)/(1+g) + primary deficitₜ`, with effective
interest r=4.2% (debt service RM54.3B ÷ ~RM1.3T), under two scenarios.

**The forecast [T4A EXTRAPOLATION], total federal debt/GDP from 64.7% (2025):**

| Path | Assumptions | 2030 | 2035 |
|---|---|---|---|
| **Consolidation** | nominal g=6%, primary deficit falls 1.0%→0.3% by 2029 | **62.2%** | **58.5%** |
| **Stalled reform** | nominal g=4.5%, primary deficit stuck at 1.1% | **69.2%** | **73.7%** |

The whole story is the **fork**: stick to the consolidation glide-path and debt drifts comfortably below
the ceiling; let growth slow and reform stall and the *statutory* measure plausibly **breaches 65% as early
as 2026** (independent analysts already flag RM1.33T ≈ 65.9% of 2025 GDP if growth disappoints).

**The silent angle:** "4.1% deficit, target beaten" is true and reassuring — and it obscures that the FRA's
*own* statutory benchmarks (3% deficit, 60% debt) are **both still being missed**, with the 3% goal pushed
to 2028, two years past the original window. Only statutory debt is capped; the RM424.7B in guarantees and
RM153B in PPP/PFI face no ceiling at all, and the stress test puts all-in exposure near **97% of GDP**.

**T4A hook:** *"Malaysia beat its deficit target and still missed the law. The Fiscal Responsibility Act
says 3% and 60%; we are at 3.8% and 64.7%, and the only number legally capped is the one chosen to look best."*

---

## B.3 DEMOGRAPHICS — Below replacement since 2013, and nobody reversed it

**The data [ACTUAL, DOSM]:** TFR **1.6 in 2024** (1.7 in 2023); below the 2.1 replacement rate **continuously
since 2013**. Live births **414,918 in 2024 — the fewest in 40+ years.** Chinese-Malaysian TFR **0.9** (among
the world's lowest); Malay 1.9; Terengganu 2.6 vs Penang 1.2.

**Method:** linear OLS on the post-2013 TFR points — presented strictly as *momentum*, not a point forecast.

**The forecast [T4A EXTRAPOLATION — illustrative only]:** the post-2013 slope is **−0.043/yr**. Carried
forward it implies TFR ~1.37 by 2030, but the 95% prediction interval is enormous ([0.5, 2.2]) on just three
points, and fertility has demographic floor effects linear models cannot see. **The defensible claim is not a
2040 number — it is that 11 straight years of below-replacement fertility show no reversal in the data**, and
DOSM's own cohort-component projection already has the **population peaking in 2059 (~42.4M) then declining** —
a turning point almost never reported.

**The silent angle:** Coverage treats each year's birth drop as news; the structural fact is that this crossed
a decade ago and one major community already sits near a TFR of 0.9. Population is framed as forever-growing
while the official projection says it ends mid-century.

**T4A hook:** *"Malaysia stopped replacing itself in 2013. 2024 saw the fewest babies in four decades, and
the government's own projection has the population shrinking from 2059 — the year nobody mentions."*

---

## B.4 DEMOGRAPHICS — Four workers per retiree, and the informal-sector blind spot

**The data:** 65+ population **2.6M = 7.7% (2024)** [ACTUAL]; Malaysia crossed the 7% "ageing" threshold in
**2021** [ACTUAL]; "aged nation" (14%) projected **2048** [OFFICIAL PROJ — note a 2044/2048 band across sources].
Old-age dependency ratio **12.6 (2022) → 21.7 (2040)** [OFFICIAL PROJ]. And **3.45M informal workers (2023)**
sit largely outside EPF/SOCSO.

**Method:** convert the official dependency ratio into an intuitive support ratio (working-age per elderly).

**The forecast [from OFFICIAL PROJ]:** support ratio falls from **7.9 working-age adults per elderly person
(2022) to 4.6 by 2040** — a 42% erosion of the working base behind each retiree in under two decades.

**The silent angle:** The "ageing nation by 2048" headline is a date; the *mechanism* — fewer than five workers
funding each pensioner by 2040, while 3.45M informal workers reach old age with no EPF — connects directly to
B.1's uncapped pension bill. Three open datasets (age structure, informal employment, pension spend) tell one
story media tells as three unrelated ones.

**T4A hook:** *"In 2022, eight working Malaysians stood behind every retiree. By 2040 it's under five — and
3.45 million informal workers will reach old age with no EPF to fall back on."*

---

## B.5 ENVIRONMENT — A water-loss target the trend says we miss

**The data [ACTUAL, SPAN 2023]:** National non-revenue water **34.6%** (analyst figures cite ~37% — carry the
34–37% band). State spread is the real story: **Perlis 64.5%**, Kelantan 54.5%, Kedah 50.7% vs Johor/Penang
26.3%. Several states **worsened** 2018→2023 (Melaka 21.2%→35.1%). Government target: **28.8% by 2030**.

**Method:** required-pace arithmetic against the official target, plus per-state OLS where two comparable
points exist.

**The forecast [T4A EXTRAPOLATION]:** hitting 28.8% by 2030 from 34.6% (2023) requires **−0.83 points/yr,
sustained for seven years.** The national trend has been **flat-to-rising**, and high-loss states are moving
the *wrong* way. On the 2018→2023 trajectory, Melaka alone heads toward ~54% by 2030. **On current trend the
2030 target is not reached.**

**The silent angle:** NRW is always reported as one national number. Perlis losing **nearly two of every three
litres** it treats — while the country builds new treatment capacity to compensate for leaks rather than
fixing them — is the story the single average hides.

**T4A hook:** *"Perlis loses 64 sen of every ringgit of treated water to leaks and theft. The national target
needs losses to fall every year to 2030; they have been rising."*

---

## B.6 ENVIRONMENT — The rice-security target moving away from us

**The data [ACTUAL, DOSM SUA]:** Rice self-sufficiency **56.2% in 2023 — down 6.4 points in one year** (from
~62.6%), the lowest in years. Government target: **80% by 2030.** Meanwhile the **food import bill nearly
doubled**: RM42.64B (2014) → RM78.8B (2023).

**Method:** required-pace vs realised-pace on SSR; CAGR on the import bill.

**The forecast [T4A EXTRAPOLATION]:**
- Rice SSR needs **+3.4 points/yr** to reach 80% by 2030; it just moved **−6.4 points** in a year. The target
  and the trend point in **opposite directions** — without a structural break, 80% by 2030 is unreachable.
- Food import bill CAGR 2014–2023 = **7.1%/yr** → **~RM127B by 2030** on trend. (Keep distinct from the *net*
  food trade deficit of ~RM31B — a different quantity often conflated with the gross bill.)

**The silent angle:** Coverage celebrates the 26 commodities where Malaysia is >100% self-sufficient. The
pressure point — the staple, rice, sliding through 56% while a 4-point-higher target is restated — gets far
less ink. And the doubling import bill is partly a ringgit story hiding inside a food story.

**T4A hook:** *"Malaysia wants 80% rice self-sufficiency by 2030. It just fell to 56%, dropping six points in
a single year. The target and the trend are walking away from each other."*

---

## B.7 HEALTH — One in two adults overweight, and a prevalence curve still climbing

**The data [ACTUAL, NHMS]:** Obesity among adults rose **4.4% (1996) → 17.7% (2015) → 19.7% (2019) → 21.8%
(2023)**; overweight + obese combined **54.4% — one in two adults.** Diabetes **11.2% (2011) → 13.4% (2015) →
15.6% (2023)** on the internally consistent series. **Critical caveat:** NHMS 2019's 18.3% diabetes figure used
a different glycaemic cut-off and is **not comparable** — the widely-reported 2019→2023 "decline" is largely a
definition artefact, not real improvement.

**Method:** linear OLS (n=4 obesity, n=3 diabetes) with prediction intervals, plus a logistic-saturation
sensitivity. **Honest disclosure:** with so few comparable points, the logistic ceiling is **poorly identified**
— the fit collapses toward near-term saturation and its covariance can't be estimated. So the linear trend is
the primary projection; logistic is shown only as a "if Malaysia saturates like comparator countries" bound.

**The forecast [T4A EXTRAPOLATION]:**
- **Obesity:** linear → **26.9% by 2030** (95% PI 23.4–30.4%), **33.4% by 2040** (PI 29.1–37.8%). Logistic
  saturation sensitivity: plateau ~25%. **Range to publish: high-20s% by 2030.**
- **Diabetes:** linear → **18.2% by 2030** (95% PI wide). Treat as "approaching one in five adults," not a
  precise point. The IDF Diabetes Atlas is the only external published forward projection to triangulate against.

**The silent angle:** The "diabetes fell since 2019" reading is a **measurement artefact** few outlets flag.
The real, clean signal is obesity's uninterrupted climb toward one-in-two adults — the upstream driver that
makes the diabetes and healthcare-cost trajectories close to baked in.

**T4A hook:** *"Headlines said diabetes fell after 2019. It didn't — the ruler changed. On the numbers that
are actually comparable, obesity has climbed every survey for 27 years, toward one in two adults."*

---

## B.8 HEALTH — Out-of-pocket health spending, and a doubling in youth depression

**The data [ACTUAL]:** Out-of-pocket health spending **RM24.6B = 31.5% of total health expenditure (2021)**,
up 9% YoY and more than tripled in 15 years — high for a system marketed as "free." Household debt **84.2% of
GDP (end-2024)** [ACTUAL, BNM], among Asia's highest. Adult depression **doubled from 2.3% (2019) to 4.6%
(2023)** [ACTUAL, NHMS]; among 16–19s it is 7.9%; children 5–15 with a mental-health problem rose 7.9%→16.5%.

**Method:** CAGR on the two depression points — flagged **illustrative only** (two points cannot support a real
forecast); annual MNHA OOP and BNM household-debt series are robust enough for trend statements.

**The forecast [T4A EXTRAPOLATION — illustrative]:** the 2019→2023 depression doubling is an 18.9%/yr pace;
naively extended it implies ~9% by 2027. **This is not a credible point forecast** — it is a flag that the
*direction and speed* warrant the continuous series Malaysia does not currently collect.

**The silent angle:** Two genuine data gaps hide here. (1) "Free public healthcare" coexists with a third of
health spending coming straight from households' pockets — a burden concentrated on lower-income families.
(2) Malaysia has **no continuous authoritative suicide series** — the National Suicide Registry lapsed after
2010 and its successor is still being implemented — so the youth mental-health trend rests on two-point survey
snapshots and police counts known to undercount.

**T4A hook:** *"Public healthcare is 'free,' yet Malaysians paid RM24.6 billion out of pocket for health in
2021 — a third of the bill, tripled in 15 years. The squeeze lands hardest on the households least able to absorb it."*

---

# §C — DATA-QUALITY & CONTRADICTION REGISTER

Carry these as explicit ranges; never silently pick the favourable number (T4A "When sources contradict" rule).

| Item | The disagreement | T4A handling |
|---|---|---|
| Aged-nation date | DOSM 2024 implied ~2044; Finance Minister II (Aug 2025) says **2048** at 14% | Use 2048 (latest official); note 2044–2048 band |
| Debt ratio | Statutory **63.5%** vs total federal **64.7%** vs all-in **84.1%** | Always name which; only statutory is ceiling-bound |
| RON95 subsidy savings | Initial **RM8B** → revised **RM2.5–4B** → World Bank disputes even that | Wide range, not a point estimate |
| Pension actuarial liability | RM483B (2017) / ~RM800B / RM1.3T — different methods, none audited | Report as a range; flag no single audited figure |
| Non-revenue water | SPAN **34.6%** vs analysts **~37%** (2023) | 34–37% band; cite the specific document |
| Selangor reserve margin | 12.1% / 17.4% / 18.6% by definition | State the definition used |
| Forest cover | Independent Gaveau **~47%** vs higher government figure | The plantation-counting dispute *is* the story |
| Rice SSR | ~63% (earlier year) vs **56.2% (2023)** | 56.2% is current; ~63% is stale |
| Food bill | Gross import **~RM79B** vs net deficit **~RM31B** | Distinct quantities — never conflate |
| Diabetes 2019 | 18.3% used a different cut-off; **not comparable** to 2015/2023 | Drop 2019 or add a definition dummy in any fit |
| TFR 2025 (1.67) | A projection input, **above** the 2024 actual (1.6) | Latest hard actual is 1.6 (2024) |
| Foreign workers | Documented 2.41M (firm) vs all-in **2.6–5.5M** (wide) | Carry the uncertainty; don't present documented as total |

---

# §D — METHOD APPENDIX (so any forecast can be regenerated and challenged)

**D.1 OLS linear / log-linear trend.** Fit `y = a + b·t` (or `ln y = a + b·t` for constant-growth series).
95% **prediction interval** at year t₀: `ŷ ± t_{0.975,n−2}·s·√(1 + 1/n + (t₀−t̄)²/Σ(tᵢ−t̄)²)`, where `s` is
the residual standard error. Used for pension spend (log-linear), obesity, diabetes, TFR momentum, NRW.
With n<3 no interval is computed and the result is labelled **illustrative**.

**D.2 CAGR.** `g = (v₁/v₀)^(1/n) − 1`; projection `vₜ = v₀·(1+g)^(t−t₀)`. Used for pension (8.6%), food import
bill (7.1%), depression-pace flag (18.9%, illustrative).

**D.3 Debt dynamics.** `bₜ = bₜ₋₁·(1+r)/(1+g) + primary deficitₜ`, where `b` = debt/GDP, `r` = effective
nominal interest rate on debt (≈ debt service ÷ debt stock ≈ 4.2%), `g` = nominal GDP growth, primary deficit
= overall deficit − interest. Two scenarios (g=6% consolidation; g=4.5% stalled) bracket the path.

**D.4 Cohort-component / support ratio.** Where DOSM's official cohort-component projection exists (population,
age structure, dependency to 2060), it is the anchor — superior to any trend extrapolation. Support ratio =
100 ÷ old-age dependency ratio. T4A should **defer to the official projection** and use trend models only to
illustrate momentum.

**D.5 Logistic saturation.** `P(t) = L / (1 + e^(−k(t−t₀)))`, the academically correct curve for a bounded
prevalence (0–100%). **Limitation made explicit:** with only 3–4 survey points the ceiling L is poorly
identified; for diabetes the fit collapsed (covariance not estimable). Logistic is therefore a *sensitivity
bound*, not the headline, until more NHMS waves exist.

**D.6 Honesty rules baked in.** (1) Every forecast is "on current trend," never a prediction of fact.
(2) Prediction intervals are shown wherever n≥3. (3) Two-point projections are labelled illustrative.
(4) Where official projections exist (debt, population, pensions, diabetes-IDF), T4A's independent number is
presented as a *cross-check that brackets* the official figure, not a rival truth.

---

# §E — EDITORIAL SHORTLIST (highest opinion-shift potential)

Ranked by the gap between what the data shows and what coverage says:

1. **B.2 The three debt numbers** — "beat the target, missed the law"; only the flattering number is capped.
2. **B.7 The diabetes definition artefact** — the reported "decline" is a changed ruler; obesity never stopped.
3. **B.1 + B.4 The uncapped pension bill meets the collapsing support ratio** — one story told as three.
4. **B.6 Rice security walking away from its own target** — −6.4 pts in a year against a +3.4-pts/yr requirement.
5. **B.3 Below replacement since 2013** — the population peak in 2059 nobody reports.
6. **B.5 Perlis's 64% water loss** — the national average hides the states bleeding out.
7. **B.8 The "free healthcare" that costs households a third of the bill** — plus the suicide series Malaysia stopped keeping.

Each maps cleanly onto T4A's hook → 3 facts → reframe → view structure, and each reframe is a genuine model
rotation (the flattering metric, the changed ruler, the uncapped liability), not an additive "there are also concerns."

---

*All [T4A EXTRAPOLATION] figures are computed projections on stated assumptions, not observed facts, and must
be presented as such in any published issue. Raw inputs were search-surfaced from the primary sources named in
Part A; per the T4A Accuracy Standard, the named primary PDF/dataset must be opened and the table/page confirmed
before any specific number is published.*
