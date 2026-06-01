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
No external boundary file is used. The cartogram is a **hand-coded tile grid** (one tile per
state) defined by the `grid` field in `data.json`, so there is no third-party map licence to
track. This sidesteps GADM's non-commercial restriction and the network block on GeoJSON
downloads in this environment.

## Confidence flags (in data.json)
- `verified` — transcribed from the DOSM primary release listed above.
- `search-unverified` — sourced from web-search summaries of DOSM reporting; **must** be
  reconfirmed against the primary PDF before publishing.
- `pending` — not yet obtained.

## Firmly-reported 2024 figures (from DOSM release reporting; reconfirm before final)
- Domestic tourism receipts: Selangor RM14.2b · Kuala Lumpur RM14.1b · Pahang RM8.7b · Sabah RM8.6b.
- Most-visited by domestic visitors: Selangor 34.5m · Kuala Lumpur 27.0m · Perak 21.8m.

## Known contradiction to resolve at finalization
- Selangor domestic receipts appear as **RM13.2b** in some 2023-vintage reporting and
  **RM14.2b** for 2024. Use the 2024 figure and cite the 2024 release explicitly.
