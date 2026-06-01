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

### Verification status
The hosting environment blocks DOSM/data.gov.my (allowlist), so figures could not be pulled
from the primary PDFs here. Values currently in `data.json` are either `pending` (null) or
`search-unverified`. **Before this ships as final**, every `gdp_rm_b` and `receipts_rm_b` must
be set from the DOSM releases and its `*_confidence` flag changed to `verified`. The render
script watermarks the image "DRAFT — PENDING DOSM VERIFICATION" while any value is missing.

To finalize: open the two DOSM releases above (or `data@dosm.gov.my` on request), transcribe
the 2024 per-state receipts and nominal GDP into `data.json`, flip the confidence flags, then
re-render.

## Render
```
npm install sharp          # already a project dependency
node infographics/tourism-state/render.mjs
```
Writes `tourism-state.png` (1200×1700 logical, rasterised at 2×). The script:
- computes `pct = receipts ÷ gdp × 100` per state and buckets it into the legend bands,
- draws a **tile-grid cartogram** (schematic, not a true boundary map — peninsula on the left,
  Borneo on the right; `●` marks federal territories),
- draws a ranked dependency table and a sources/caveats footer,
- shows the DRAFT watermark until all 16 values are present.

No map library, GeoJSON, or headless browser is used — only `sharp` for SVG→PNG. The script is
**not** part of `npm run build` and does not touch the site build or deploy.
