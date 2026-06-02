# How tourism-dependent is each Malaysian state?

*Domestic tourism receipts as a share of state GDP, 2024. A standalone data graphic — not a
T4A editorial issue.*

## The one-line version

Tourism's weight in a state economy has little to do with how many ringgit it pulls in.
**Selangor earns the most domestic tourism money in the country — RM14.2 billion in 2024 — yet
tourism is only 2.9% of its economy.** In **Melaka (13.9%)**, **Kelantan (13.8%)** and
**Perlis (13.7%)**, the same activity carries four to five times more economic weight, because
the state economies underneath are small. Dependency is a ratio, and the denominator is the
story.

## What the metric is — and is not

The graphic plots one derived ratio for each state:

```
dependency (%) = domestic tourism receipts (2024)  ÷  nominal state GDP (2024)  × 100
```

Two honesty notes built into the graphic:

1. **Domestic tourism only.** Malaysia publishes *international* tourism receipts nationally,
   not by state (international arrivals are counted at the point of entry, not the destination
   state). So this is **not** comparable to the country-level "international tourism receipts as
   % of GDP" charts. It measures money spent by Malaysians travelling within Malaysia.
2. **A derived ratio.** DOSM does not publish this percentage. The numerator (receipts) and
   denominator (GDP) come from two different DOSM products. Treat the ratio as indicative, not
   an official statistic.

**Putrajaya is merged into Kuala Lumpur.** DOSM reports Putrajaya's tourism receipts separately
(RM0.94b) but folds Putrajaya's GDP into W.P. Kuala Lumpur — there is no standalone Putrajaya
GDP. A separate Putrajaya ratio is therefore impossible from primary data, so the map shades
Putrajaya with KL and the KL figure combines both (RM14.08b + RM0.94b = RM15.02b receipts over
KL GDP).

## What the numbers say

- **Most dependent (tourism is a big slice of a small economy):** Melaka 13.9%, Kelantan 13.8%,
  Perlis 13.7%, Terengganu 12.9%, Pahang 10.5%. The east-coast and the small northern/historic
  states lean hardest on domestic visitors.
- **Least dependent (large or resource/industrial economies):** Selangor 2.9%, Labuan 3.0%,
  Johor 4.2%, Sarawak 4.3%. Tourism is real money here but a thin slice of a big pie.
- **The Selangor paradox:** biggest receipts in absolute terms (RM14.2b), lowest dependency
  (2.9%) — because its RM485b economy dwarfs everything else.
- **Sabah vs Sarawak:** similar absolute receipts (RM8.6b vs RM8.0b) but Sabah is meaningfully
  more dependent (7.5% vs 4.3%), since Sarawak's economy is larger and more resource-heavy.

## The dataset

| State | Nominal GDP 2024 (RM m) | Domestic receipts 2024 (RM m) | Dependency |
|---|--:|--:|--:|
| Selangor | 485,299 | 14,226 | 2.9% |
| W.P. Kuala Lumpur* | 298,334 | 14,078 | — |
| Johor | 187,385 | 7,814 | 4.2% |
| Sarawak | 184,894 | 7,957 | 4.3% |
| Pulau Pinang (Penang) | 136,890 | 7,424 | 5.4% |
| Sabah | 114,530 | 8,634 | 7.5% |
| Perak | 100,202 | 7,224 | 7.2% |
| Pahang | 82,771 | 8,710 | 10.5% |
| Negeri Sembilan | 66,875 | 5,869 | 8.8% |
| Kedah | 60,466 | 4,961 | 8.2% |
| Melaka | 57,120 | 7,933 | 13.9% |
| Terengganu | 39,972 | 5,170 | 12.9% |
| Kelantan | 32,798 | 4,541 | 13.8% |
| Perlis | 7,330 | 1,003 | 13.7% |
| W.P. Labuan | 8,774 | 265 | 3.0% |
| W.P. Putrajaya* | (in KL) | 937 | — |
| **Malaysia** | **1,932,292** | **106,746** | **5.5%** |

\*Chart tile **Kuala Lumpur** combines KL + Putrajaya receipts (15,015 RM m) over KL GDP →
**5.0%**. GDP figures are rounded to RM0.1b and receipts to RM0.01b in `data.json`; the table
above shows the underlying RM-million source values.

The **Malaysia** GDP total (RM1,932,292m) is DOSM's official national figure and exceeds the
sum of the state rows because it also includes a non-state **"Supra"** residual (RM68,652m in
2024) that DOSM does not allocate to any state. The national dependency ratio (5.5%) uses that
official total.

**Verification check:** the 16 per-state receipts sum to **RM106,746 million ≈ RM106.7 billion**
— exactly DOSM's published national domestic-tourism receipts total for 2024. This reconciliation
is how each per-state figure was confirmed.

## Method

1. **GDP (denominator).** Nominal (current-price) GDP for 2024, transcribed from the official
   *GDP by State 2024* publication workbook, Table 43 "GDP by state at current prices", column
   `2024p`.
2. **Receipts (numerator).** Each state's *Domestic Tourism Survey 2024* report, "Jumlah
   Terimaan / Total Receipts (RM million)", 2024 column of the Key Statistics table — cross-read
   against each report's prose sentence ("…berjumlah RM x.xx bilion pada tahun 2024") and
   reconciled to the RM106.7b national total.
3. **Map.** True geographic choropleth from DOSM's open `administrative_1_state` boundary file
   (equirectangular projection; KL/Putrajaya enclaves rendered with fill-rule evenodd).
4. **Confidence.** Every GDP and receipts value is flagged `verified` in `data.json` (transcribed
   from a DOSM primary release).

## Sources

All data: **Department of Statistics Malaysia (DOSM)**, **CC-BY 4.0**. Attribute DOSM.

1. **GDP by State, 2024** — DOSM. Table 43, "GDP by state, 2015–2024 at current prices (RM
   million)", column `2024p`.
   - Publication: https://open.dosm.gov.my/publications/gdp_state_2024
   - Data workbook (used): https://storage.dosm.gov.my/gdp/gdp_state_2024.xlsx
   - Portal release: https://www.dosm.gov.my/portal-main/release-content/gross-domestic-product-gdp-by-state-2024
   - Accessed 2026-06-01.

2. **Domestic Tourism Survey (States), 2024** — DOSM. Per-state reports (16); "Jumlah Terimaan /
   Total Receipts (RM million)", 2024 column of each state's Key Statistics table.
   - Portal release: https://www.dosm.gov.my/portal-main/release-content/domestic-tourism-survey-states-2024
   - Download: https://www.statistics.gov.my/site/downloadrelease?id=domestic-tourism-survey-states-2024&lang=English
   - Accessed 2026-06-02.

3. **Domestic Tourism Survey, 2024** (annual) — DOSM. National total receipts (RM106.7b), used to
   reconcile the per-state sum.
   - Publication: https://open.dosm.gov.my/publications/tourism_domestic_annual_2024
   - Data workbook: https://storage.dosm.gov.my/tourism/tourism_domestic_2024.xlsx

4. **State boundaries** — DOSM open data, `datasets/geodata/administrative_1_state.geojson`.
   - https://github.com/dosm-malaysia/data-open
   - Stored locally (simplified) as `malaysia-states.geojson`.

*Compiled by The Fourth Angle. Figures are official DOSM statistics; the dependency ratio is a
derived presentation, not an official DOSM figure.*
