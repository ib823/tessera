# Sources & provenance

All data: **Department of Statistics Malaysia (DOSM)**, licensed **CC-BY 4.0**. Attribute DOSM.

| Field | Dataset | URL | Year |
|---|---|---|---|
| `receipts_rm_b` | Domestic Tourism Survey (States) 2024 | https://www.dosm.gov.my/portal-main/release-content/domestic-tourism-survey-states-2024 | 2024 |
| `gdp_rm_b` (nominal) | GDP by State, 2024 (rel. 1 Jul 2025) | https://www.dosm.gov.my/portal-main/release-content/gross-domestic-product-gdp-by-state-2024 | 2024 |

Machine-readable GDP catalogue (parquet/CSV, no API key):
`https://open.dosm.gov.my/data-catalogue/gdp_state_real_supply` ·
`https://storage.dosm.gov.my/gdp/...` (nominal counterpart for the denominator).

## Map asset
The choropleth uses real state boundaries from **DOSM open data** (`dosm-malaysia/data-open`,
`datasets/geodata/administrative_1_state.geojson`), simplified to 3-decimal coordinates and
stored locally as `malaysia-states.geojson` so the render is offline-reproducible. Same
publisher as the statistics (DOSM), CC-BY 4.0 — no GADM non-commercial restriction. The earlier
hand-coded tile grid is retired. The `grid` field is still present in `data.json` but unused.

## Confidence flags (in data.json)
- `verified` — transcribed from the DOSM primary release listed above. **All 16 states are now `verified`.**
- `search-unverified` — sourced from web-search summaries of DOSM reporting (no longer used).
- `pending` — not yet obtained (no longer used).

## Verified 2024 figures (final)

**Nominal GDP** — *GDP by State 2024*, Table 43 "GDP by state at current prices", column `2024p`
(workbook `https://storage.dosm.gov.my/gdp/gdp_state_2024.xlsx`). DOSM reports no standalone
Putrajaya GDP; it is folded into W.P. Kuala Lumpur (RM298.3b).

**Domestic tourism receipts** — each state's *Domestic Tourism Survey 2024* report, "Jumlah
Terimaan / Total Receipts (RM million)", 2024 column of the Key Statistics table (RM b):

| State | Receipts | State | Receipts |
|---|--:|---|--:|
| Selangor | 14.23 | Sarawak | 7.96 |
| Kuala Lumpur | 14.08 | Negeri Sembilan | 5.87 |
| Pahang | 8.71 | Terengganu | 5.17 |
| Sabah | 8.63 | Kedah | 4.96 |
| Melaka | 7.93 | Kelantan | 4.54 |
| Johor | 7.81 | Perlis | 1.00 |
| Pulau Pinang | 7.42 | Putrajaya | 0.94 |
| Perak | 7.22 | Labuan | 0.26 |

**Reconciliation:** these sum to RM106,746 million ≈ **RM106.7b**, exactly the published
national domestic-tourism receipts total for 2024 — confirming the per-state transcription.

**Putrajaya merge:** the infographic folds Putrajaya receipts (RM0.94b) into the Kuala Lumpur
tile (combined RM15.02b), because KL's nominal GDP already includes Putrajaya.

## Resolved contradiction
- Selangor 2024 domestic receipts confirmed at **RM14.23b** (RM14,226m) from the DTS 2024
  Selangor report — superseding the RM13.2b figure seen in older 2023-vintage reporting.
