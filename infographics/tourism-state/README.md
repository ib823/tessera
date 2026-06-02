# Tourism dependency by Malaysian state — infographic

A standalone shareable infographic: **domestic tourism receipts as % of state GDP**, for all
16 Malaysian states and federal territories, 2024. Inspired by the country-level "tourism
receipts as % of GDP" choropleth, adapted to what open data actually supports at state level.

This artifact lives **outside** the T4A editorial issue pipeline. It is not a published issue.

## Why "domestic" and "derived"
- The country-level chart uses **international** tourism receipts. Malaysia publishes
  international receipts **nationally only** — international arrivals are counted by point of
  entry, not destination state — so an international per-state chart is not possible from open
  data.
- The honest state-level analog is **domestic tourism receipts ÷ nominal state GDP**, a ratio
  DOSM does not publish directly. It is **derived** here from two separate DOSM products.
- The graphic states both caveats on its face. Do not present it as equivalent to the
  international chart.

## Data
- `data.json` — one record per state: `gdp_rm_b`, `receipts_rm_b`, grid position, and a
  per-field `*_confidence` flag. Top-level `meta` carries the metric definition, caveats, and
  DOSM source citations; `bands` defines the legend thresholds.
- **Sources (both CC-BY 4.0, Department of Statistics Malaysia):**
  - Domestic tourism receipts → *Domestic Tourism Survey (States) 2024*
  - Nominal state GDP → *GDP by State, 2024* (released 1 July 2025)

### Verification status — FINAL
All 16 states are `verified`. Nominal GDP comes from the *GDP by State 2024* workbook
(Table 43, current prices, `2024p`); domestic tourism receipts come from each state's
*Domestic Tourism Survey 2024* report ("Jumlah Terimaan", 2024 column). The per-state receipts
sum to RM106.7b, matching the published national total — see `SOURCES.md` for the full table
and reconciliation. The DRAFT watermark is therefore off.

Putrajaya is merged into Kuala Lumpur: DOSM reports no standalone Putrajaya GDP (it sits inside
W.P. Kuala Lumpur), so the KL tile combines KL + Putrajaya receipts (RM14.08b + RM0.94b) over
KL GDP. 15 tiles render; the dependency ratio is honest for every one.

## Render
```
npm install sharp          # already a project dependency
node infographics/tourism-state/render.mjs
```
Writes `tourism-state.png` (1240×1500 logical, rasterised at 2×). The script:
- computes `pct = receipts ÷ gdp × 100` per state and buckets it into the legend bands,
- draws a **true geographic choropleth** from `malaysia-states.geojson` (equirectangular
  projection; peninsula left, Borneo right; Putrajaya shaded with KL),
- renders a boarding-pass header, banded legend, and two ranked panels (most tourism-dependent
  states; largest state economies), on a light paper theme,
- shows the DRAFT watermark until all 16 values are present.

Only `sharp` (SVG→PNG) and a local GeoJSON are used — no map library or headless browser. The
script is **not** part of `npm run build` and does not touch the site build or deploy.
