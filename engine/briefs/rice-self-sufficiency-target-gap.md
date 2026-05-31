# Brief — Issue 2002: Malaysia's rice self-sufficiency target vs the actual rate

**Slug:** rice-self-sufficiency-target-gap
**Status:** DRAFT (`published: false`). Stage 1 + Stage 6 done; independent verification done.
**External Stage 2 (Bias) and Stage 3 (Fact) NOT run.** **Source retrieval date:** 2026-05-31.
Built from the environment cluster (B.6) of `docs/research/malaysia-underreported-data-forecasts.md`.

## ISSUE
The government raised its rice self-sufficiency ratio (SSR) target to 80% by 2030 (up from 75%), while the
actual SSR is 56.2%. Coverage reports the ambitious target; the under-reported signal is that the target
rose while the rate did not, leaving a gap of nearly 24 points that has not been narrowing.

## VERIFICATION (load-bearing facts)
- **Rice SSR = 56.2%.** SOLID. Stated by Agriculture Minister Mohamad Sabu, reported by Malay Mail
  (14 Nov 2024, "Food security: Malaysia's rice self-sufficiency rate at 56.2%"); also DOSM Supply and
  Utilisation Accounts (SUA) 2020-2024. Multiple-source corroboration.
- **Target 80% by 2030, raised from 75%.** SOLID. The Edge ("Malaysia targets 80% rice self-sufficiency
  by 2030, up from 75% — Mohamad"); Malay Mail; NST (75% prior target). Attributable to the same minister.
- **Required pace:** from 56.2% to 80% by 2030 is ~24 points over ~6 years = ~4 points/year. The SSR has
  been broadly flat to declining, not climbing. Card states "about four points a year" and "broadly flat" —
  defensible without asserting a precise contested slope. NOTE: The Edge reported padi PRODUCTION grew 2.9%
  in 2024; SSR can still be flat/low because consumption and base effects differ. The cards do NOT claim
  production is falling, only that the SSR is not climbing toward the goal.

## CLAIMS DROPPED / SOFTENED FOR ACCURACY
- The earlier research framing "SSR fell 6.4 points in a year (from ~62.6%)" was NOT used as the lead,
  because the prior-year 62.6% figure could not be independently confirmed (DOSM/CEIC/Statista all 403).
  The published reframe instead rests on the target-vs-actual gap, where both numbers trace to the same
  ministerial statement. This is the cleaner, fully-sourced framing.
- India 2023 export curb: India banned non-basmati white rice exports in July 2023 (well documented).
  Card frames Malaysia's exposure softly ("importing nations including Malaysia faced tighter supply and
  higher prices") rather than asserting a precise Malaysia-specific price impact.

## KEY STATISTICS
- Rice SSR 56.2% (Agriculture Ministry, Nov 2024; DOSM SUA). Import dependence ~44% (100 - 56.2).
- Target 80% by 2030 (raised from 75%).
- Food import bill RM42.64B (2014) -> RM78.80B (2023) [DOSM External Trade, via research agent]; CAGR ~7.1%.
  GROSS import bill, distinct from NET food trade deficit ~RM31B (2022). The cards keep these distinct.
- Malaysia >100% self-sufficient in 26 commodities (poultry, eggs, some fish/fruit) [DOSM SUA] — context
  for the reframe (surplus items get attention while the staple slides); not asserted in a card to keep length.

## 12-DIMENSION RISK (abbreviated)
- 3R: LOW. Political: LOW-MEDIUM (critiques target-setting vs delivery, non-partisan, applies to any
  government). Sentiment/narrative: MEDIUM (anxiety-of-precedent on food security; anger-at-process on
  target inflation, not sadness). Sources: MEDIUM (primary DOSM SUA PDF not opened directly, 403;
  corroborated via ministerial statement + multiple outlets). Economic/geographic: relevant.

## RECOMMENDED LENSES
Primary **Economic** (SSR gap + import bill appear twice); secondary **Regional** (import dependence /
exporter exposure).

## SOURCES
1. Malay Mail, "Food security: Malaysia's rice self-sufficiency rate at 56.2%, says Mohamad", 14 Nov 2024 —
   https://www.malaymail.com/news/malaysia/2024/11/14/food-security-malaysias-rice-self-sufficiency-rate-at-562-says-mohamad/156855
2. The Edge, "Malaysia targets 80% rice self-sufficiency by 2030, up from 75% — Mohamad" —
   https://theedgemalaysia.com/node/735110
3. DOSM, Supply and Utilisation Accounts Selected Agricultural Commodities 2020-2024 (OpenDOSM sua_2024) —
   https://open.dosm.gov.my/publications/sua_2024 (PRIMARY; 403 to automated fetch, open manually)
4. The Edge, "Padi production grew 2.9% in 2024 — DOSM" — https://theedgemalaysia.com/node/769163
5. NST, "Rice self-sufficiency rate target" (75% prior target) — https://www.nst.com.my/news/nation/2024/11/1135437/rice-self-sufficiency-rate-target
6. DOSM External Trade / OpenDOSM (food import bill) — https://open.dosm.gov.my/dashboard/external-trade
7. Khazanah Research Institute, "Securing Malaysia's Rice Bowl" — https://www.krinstitute.org/

## CONNECTIONS (Sherlock)
A first substring scan produced two FALSE matches (1485 "Contraceptive Access", 1962 "Generals charged...
cartel") that have nothing to do with rice; those links were reverted. The genuine rice connections, all
currently unpublished drafts, are:
- 1213 "Import Permit System for Rice Generates RM800M in Rent-Seeking" — the import side of the same staple
  (Malaysia buys ~44% of its rice abroad; the permit regime governs that flow). Strongest connection.
- 1155 "Paddy Farmers Protest RM1,200 Per Tonne Price Cap" — the producer-incentive side of low SSR.
- 1555 "Kedah Rice Fields Lose 8,400 Hectares to Development Since 2015" — padi-land loss, a named driver of
  the falling self-sufficiency rate.
- Bidirectional related[] added to 1213, 1155, 1555.

## PRE-PUBLISH CHECKLIST
- Open DOSM SUA 2024 PDF manually, confirm 56.2% and the year it attaches to.
- Run external Stage 2 (Bias) + Stage 3 (Fact).
- Confirm food import bill RM78.8B (2023) against DOSM External Trade table.
- Then set published:true, sourceDate today, validate, commit.
