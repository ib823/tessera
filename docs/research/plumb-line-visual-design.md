# The Plumb Line — visual design

How the accountability index is presented to readers, and why. This document is
the design record behind the `/plumb-line` preview (`src/components/PlumbLine*`,
`src/components/LeaderFingerprint.svelte`).

## 1. The governing principle: show the doubt

Every governance index that loses public trust loses it the same way — **false
precision**: a confident number, podium, or single grade the underlying data
cannot support. The Plumb Line's differentiator is the opposite reflex. The
visualization must encode the instrument's honesty — uncertainty, provisional
status, coverage gaps, and the deliberate refusal to rank — as the *product*,
not hide them behind a clean league table.

This is grounded in the closest analogues and the methods literature:

- **V-Dem** (multi-coder, multi-dimensional democracy data — the nearest peer)
  renders multi-coder disagreement as *graded "shadows" of uncertainty* around
  every estimate, and offers drill-down country graphs, scatter, and heatmaps
  rather than a single ranking ([V-Dem tools](https://www.v-dem.net/data_analysis/CountryGraph/)).
- The **uncertainty-in-ranking** literature shows confidence intervals on ranks
  are usually wide enough that rank *differences* are not meaningful, and warns
  that plain error bars cause "deterministic construal errors"
  ([Wilke](https://clauswilke.com/dataviz/visualizing-uncertainty.html);
  [*Uncertainty in Ranking*, arXiv](https://arxiv.org/pdf/2107.03459)).
- The **OECD/JRC Handbook on Composite Indicators** notes that the visualization
  choice itself changes the policy message — it is an editorial act
  ([OECD/JRC](https://www.oecd.org/en/publications/handbook-on-constructing-composite-indicators_533411815016.html)) —
  and the radial-visualization evaluation found **radar charts the least
  effective and least liked**, with flower/profile forms preferred
  ([*Off the Radar*, IEEE TVCG](https://pubmed.ncbi.nlm.nih.gov/26529525/)).
- Non-partisan trackers (**GovTrack**, **ProPublica**) succeed on an explicit
  "no sides" stance and report-card framing; GovTrack even derives ideology from
  co-sponsorship networks — the analogue of our C3 dimension
  ([GovTrack](https://www.govtrack.us/about)).
- **Scrollytelling** improves comprehension/retention for methodology narratives
  and suits mobile, though the headline engagement multipliers are vendor
  marketing and should be discounted
  ([INMA](https://www.inma.org/blogs/product-initiative/post.cfm/scrollytelling-format-helps-news-publishers-grow-mobile-engagement)).

### The hard consequence

**No ranked scoreboard while 0 subjects are ranked.** All 37 are `on file, not
ranked`; the badge is withheld; conduct coverage is 22–33% on a single coder. A
leaderboard would contradict the instrument's own honesty gates. The hero shows
**position with uncertainty**, never a podium. A ranked board (as rank *ranges*,
never points — per the `rankRange` field and Saisana/Saltelli perturbation) is
unlocked only after the independent Layer B coder panel clears the bias gates.

## 2. Verdict on the obvious candidates

- **Scoreboard / leaderboard** — deferred; resurfaces only post-panel, as ranges.
- **Quadrant** — legitimate *because* the two-track axes (Conduct & Structure ×
  Delivery) are concretely defined, unlike the vague/unbounded political-compass
  axes the literature criticises. Blocked until Delivery data exists; avoid
  labelling a "best corner" (imports a moral verdict).
- **Animation** — sparingly and to teach (e.g. rank-ranges collapsing as coders
  are added), never decoration.
- **Radar** — rejected (evidence-against).
- **Single per-leader grade** — rejected (collapses multidimensional honesty).

## 3. The four-tier system

| Tier | View | Job | Status |
|---|---|---|---|
| 1 | **The Field** (beeswarm) | At-a-glance distribution of the provisional conduct signal, benchmark reference lines bracketing the domestic field. No ranks. | **Built** (`PlumbLineField.svelte`) |
| 2 | **Fingerprint** (profile) | Per-subject dimension profile, two-track grouped, provisional dims quarantined, integrity as a status pill. | **Built** (`LeaderFingerprint.svelte`) |
| 3 | **Cohort matrix** (heatmap) | Subjects × dimensions; shows the board is mostly gaps, filling in. Also a QA view. | **Built** (`PlumbLineHeatmap.svelte`) |
| 4 | **Scrollytelling explainer** | "Why nobody is ranked yet" — the gates, the two tracks, rank-range collapse animation. | Deferred |
| — | **Ranked range-board** | The eventual headline, as rank ranges. | Blocked until the coder panel clears the gates |

### Encoding rules (consistent across tiers)

- **Scored** → solid fill, track-coloured, intensity by value.
- **Provisional** (single-coder Layer B) → hatched, low-opacity, with a `1/3
  coders` chip. Never blended with scored marks.
- **On file / awaiting peer set** → faint marker.
- **Jurisdiction-excluded** → grey diagonal, disclosed (never silently dropped).
- **No data** → empty cell / omitted dot, counted ("+N awaiting data").
- **Coverage** → dot opacity in the Field; a meter on the card.
- **Coalition** → deliberately **desaturated** colour: identity, never rank.
- **Track colour** → Conduct & Structure (blue), Delivery (orange).
- **Integrity (A5)** → status pill banded clean / caution / adverse
  (e.g. `none-on-record`, `pardoned`, `convicted`).

## 4. Surfaces & build notes

- Page: `src/pages/plumb-line.astro` — reads the built `public/leaderboard.json`
  at `process.cwd()`, `noindex`, with an "internal preview, unpublished,
  provisional, not an endorsement" banner; not linked from nav.
- Islands hydrate `client:load`; everything reuses T4A design tokens
  (`tokens.css`) so it adapts to light/dark automatically.
- The board offers a Cards ↔ Matrix toggle; the Field sits above both.
- Tier 4 lives at `src/pages/plumb-line-why.astro` (`PlumbLineExplainer.svelte`):
  a scroll-driven methodology explainer with the rank-range-collapse animation;
  its leaders are illustrative (A–F), never real subjects.
- **Browserless stills:** `node scripts/render-plumb-line-preview.mjs [outdir]`
  rasterises all four tiers to PNG via sharp (no Chromium needed), for docs,
  social, and review in CI/sandboxes. Output is gitignored (`*.png`); run
  `npm run build-leaderboard` first.

## 5. Open decisions (carried from the methodology work)

1. **A5 severity weighting** — `convicted` is 0.0 regardless of offence, so a
   minor tax-filing conviction ranks level with a grave one and below a
   47-charge corruption DNAA (`discharged`, 0.85). Consider weighting by class.
2. **`pardoned` scalar** (0.7) — adjustable.
3. **Benchmark high anchors** — whether to cap the benchmark 4s.

## 6. Ethics gate for go-live

The viz may be built and reviewed now, but **must not go live** until the
independent Layer B coder panel clears the inter-coder-reliability and
partisan-signal gates — the same discipline as `published: false` on the
underlying data. Publishing provisional conduct scores on named living leaders
before the panel would breach the Accuracy Standard.

**This is now enforced in code, so `main` can carry the feature safely.** Until
`biasAudited` is granted: `scripts/audit-scoreboard.mjs` redacts the deployed
`public/leaderboard.json` to counts + methodology only (no names, no scores),
and `src/pages/plumb-line.astro` renders an "in audit" hold view. Both the JSON
asset and the page were verified to leak zero living-people scores in a
production build. The full board (and, later, the ranked range-board) auto-reveal
the moment the badge is granted — launch is a data event, not a deploy.
`PLUMB_PREVIEW=1` keeps the full data for internal review only.

Sources: [V-Dem](https://www.v-dem.net/data_analysis/CountryGraph/) ·
[Wilke, *Visualizing Uncertainty*](https://clauswilke.com/dataviz/visualizing-uncertainty.html) ·
[*Uncertainty in Ranking*](https://arxiv.org/pdf/2107.03459) ·
[OECD/JRC Handbook](https://www.oecd.org/en/publications/handbook-on-constructing-composite-indicators_533411815016.html) ·
[*Off the Radar*](https://pubmed.ncbi.nlm.nih.gov/26529525/) ·
[GovTrack](https://www.govtrack.us/about) ·
[INMA on scrollytelling](https://www.inma.org/blogs/product-initiative/post.cfm/scrollytelling-format-helps-news-publishers-grow-mobile-engagement).
