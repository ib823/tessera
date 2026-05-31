# Brief — Malaysia's diabetes dip vs the obesity climb (NHMS 2011–2023)

**Issue ID:** 2001
**Slug:** diabetes-obesity-nhms-signal
**Status:** DRAFT (`published: false`). Stage 1 (Primary Analysis) and Stage 6 (Synthesis) done by
Claude; independent verification done. **External Stage 2 (Bias Audit / Gemini) and Stage 3 (Fact
Verification / ChatGPT) NOT yet run** — run `node scripts/generate-stage-prompts.mjs
diabetes-obesity-nhms-signal` and complete those before flipping `published: true` and merging to `main`.
**Source retrieval date:** 2026-05-31.

## ISSUE
Malaysia's National Health and Morbidity Survey (NHMS) 2023 put adult diabetes prevalence at 15.6%, down
from 18.3% in 2019. Coverage read this as the epidemic easing. The under-reported signal: the upstream
driver — combined overweight and obesity — rose again to 54.4%, the fourth consecutive increase across the
2011/2015/2019/2023 survey cycles, having crossed the "one in two adults" line around 2019.

## THE CLAIM THAT WAS DROPPED (accuracy discipline)
An earlier research pass asserted the 2019 diabetes figure (18.3%) used a *different glycaemic
definition/cut-off* from 2023, which would make the apparent decline a measurement artefact. **This claim
could NOT be verified against any primary source.** Both NHMS 2019 and 2023 appear to use fasting capillary
blood glucose (2019: FBG ≥7.0 mmol/L for the undiagnosed); the methodology paper (*Scientific Reports*
2025) and the IKU fact sheet both 403 to automated fetch, and four targeted searches found no source
stating the years are non-comparable. Per the T4A Accuracy Standard ("memory and training data do not count
as verification… when in doubt, drop the claim"), the "changed ruler" framing was removed. The published
reframe makes only defensible claims: (a) diabetes prevalence has not moved in a straight line, so one
survey's dip is not a trend reversal; (b) overweight/obesity, the driver, rose at every survey. The issue
does NOT assert *why* the 2019→2023 diabetes figure fell.

## KEY STATISTICS (with sources)
- Adult diabetes prevalence: **11.2% (2011) → 13.4% (2015) → 18.3% (2019) → 15.6% (2023)** [NHMS; IKU fact
  sheet 2023; corroborated by CodeBlue/Galen Centre, Scientific Reports 2025 methodology paper].
- 2023 diabetes split: **known 9.7% + raised blood glucose among undiagnosed 5.9% = 15.6%**; ~1 in 6
  adults; **2 in 5 diabetics unaware**; among adults **18–29, ~84% of those with diabetes are unaware**
  [NHMS 2023 fact sheet, via CodeBlue, The Vibes].
- Combined overweight + obese (BMI ≥25): **44.5% (2011) → 47.7% (2015) → 50.1% (2019) → 54.4% (2023)**;
  2023 split overweight ~32.6%, obese ~21.8%; **~11 million adults** [NHMS 2023; CodeBlue 16 May 2024; FMT
  16 May 2024; Medical Channel Asia; Sinar Daily].
- Physical inactivity: about **one in two adults** lead sedentary lifestyles; ~**84%** take part in no
  sport/fitness/leisure activity; one in three not physically active [NHMS 2023, via CodeBlue].
- Among adults aware they have diabetes, **56% do not have good blood-sugar control** [NHMS 2023].

## CONTRADICTIONS / COMPARABILITY NOTES
- The diabetes 2019→2023 figure FELL (18.3→15.6) while the long-run 2011→2023 trend is up. The series is
  non-monotonic; do not present the dip as a reversal, and do not assert a cause.
- The overweight+obese series is monotonic and consistently reported across years — the robust, publishable
  trend.
- Primary PDFs (IKU fact sheet, MOH Health Facts, Scientific Reports paper) 403 to automated fetch. Figures
  here are corroborated across ≥2 named outlets that cite the NHMS directly; **open the IKU fact sheet
  manually to confirm exact table values before flipping to published.**

## 12-DIMENSION RISK (abbreviated)
- 3R (race/religion/royalty): LOW — no ethnic/religious/royal dimension.
- Political: LOW — critiques narrative framing, not a party or person.
- Sentiment/narrative: MEDIUM — corrects a reassuring headline; emotion = anxiety-of-precedent (not sadness).
- Completeness: MEDIUM — external Stage 2/3 review pending.
- Sources: MEDIUM — NHMS is authoritative but primary PDFs not directly opened (403); corroborated via
  multiple secondary citations of the primary survey.

## RECOMMENDED LENSES
Primary **Health**; secondary **Social** (undiagnosed youth, sedentary behaviour).

## SOURCES
1. NHMS 2023 Fact Sheet, Institute for Public Health (IKU/NIH) — https://iku.nih.gov.my/images/nhms2023/fact-sheet-nhms-2023.pdf (PRIMARY; 403 to automated fetch, open manually)
2. "Conducting the National Health and Morbidity Survey 2023 in Malaysia…", Scientific Reports (2025) — https://www.nature.com/articles/s41598-025-08311-9 (PRIMARY methodology; 403)
3. CodeBlue / Galen Centre, "NHMS 2023: Over Half Of Malaysian Adults Overweight Or Obese", 16 May 2024 — https://codeblue.galencentre.org/2024/05/nhms-2023-over-half-of-malaysian-adults-overweight-or-obese/
4. FMT, "Survey shows over half of Malaysian adults overweight or obese", 16 May 2024 — https://www.freemalaysiatoday.com/category/nation/2024/05/16/survey-shows-over-half-of-malaysian-adults-overweight-or-obese
5. The Vibes, "High rate of undiagnosed diabetes among Malaysian youth raises concern"
6. PLOS One, "Prevalence of impaired fasting glucose… NHMS 2019" — https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0320993 (confirms 2019 FBG method, 18.3%)
7. "Rising Obesity in Malaysia (1990–2023)…", PMC12900780 — confirms the long-run obesity climb.
8. Sinar Daily, "Malaysia's obesity crisis: 11 million adults affected"

## CARD MAP (as published in 2001.json)
hook → diabetes fell, reported as relief, but one survey is not a trend.
fact (Health) → overweight+obese climbed every survey to 54.4% / ~11M.
fact (Health) → the undiagnosed iceberg: 2 in 5 unaware; 84% of 18–29s with diabetes don't know.
fact (Social) → one in two adults sedentary; 84% do no sport/fitness — the modifiable driver.
reframe → diabetes is the lagging indicator; body weight is the leading one.
analogy → judging the epidemic by one survey is like calling the tide by a single wave.
view → a system can lower a number for a year; it cannot outrun a population growing heavier every survey.
