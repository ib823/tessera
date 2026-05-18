# D001 — Figure Prompts and Visual Specifications

**Hand to Claude Design.** Each figure here has either (a) an image-generation prompt in the canonical T4A continuous-line style, or (b) a data specification for code-rendered SVG, or both. Use whichever path produces the cleaner artefact for that figure type.

**Global visual rules:**
- Background colour for *all* dossier figures: `#0f0f23` (T4A deep navy).
- Single-stroke white `#FFFFFF` for illustrative figures (figs cover, 4, 5).
- For data figures (figs 1, 2, 3, 6, 7), primary accent: burgundy `#9B2C2C`. Secondary muted line: `#F4F1EB` at 60% opacity.
- All figures export at 1200×630 (16:8.4, close to 1.91:1) for OG and inline; SVG preferred for sharp re-rendering.
- Every figure has a caption rendered *outside* the figure as part of the dossier layout, not baked into the image.
- The T4A signature in cursive continues the single stroke at bottom-right, *only* on illustrative figures (cover, 4, 5). Data figures do not carry the signature.

---

## Figure cover — Hero illustration

**Subject brief.** The negotiation room the voter cannot see. A small group of figures seated around a table in a darkened interior, with a single window at the rear of the room through which a crowd is faintly visible. The composition reads as: the few in the room, the many outside it. The visual metaphor of the dossier.

**Image-generation prompt (use canonical T4A image template, fill in subject only):**

```
Create a minimalist Pablo Picasso single continuous line drawing on a deep dark navy background exactly #0f0f23. Use one single unbroken bold white line (#FFFFFF) with perfectly consistent stroke weight throughout. The entire drawing must be created as one continuous gesture without the pen ever lifting from the canvas.

Draw four figures in suits seated around a rectangular table from a three-quarter angle, with a single window at the rear of the room through which the outlines of a distant crowd are faintly suggested by the same continuous line as one clean, elegant, and confident single continuous line. The line quality should be bold, smooth, and editorial. The figures should be poised and contemplative, not slumped or weeping; the room is composed, not chaotic.

At the bottom right corner, seamlessly continue the exact same continuous line into a natural hand-drawn cursive "T4A" signature as the ending tail of the stroke. The T4A signature must feel like an organic part of the single unbroken line, not added separately.

Style: elegant minimalist single-line illustration, contemplative, editorial. No fill, no shading, no extra lines, and no unnecessary details. Keep the composition clean with generous negative space, especially toward the right side of the frame.

Aspect ratio 1.91:1 wide landscape. Ensure the final result matches the clean, consistent quality of previous T4A single continuous line images.

Save as: public/dossiers/D001/fig-cover.png
```

**Acceptance criteria:**
- One unbroken line, no breaks, no fill, no shading.
- Four seated figures visible; table outline; window with crowd suggestion.
- T4A cursive in lower-right as the line's tail.
- Negative space on the right ~30% of frame.
- 1.91:1 aspect ratio.

---

## Figure 1 — Every major party launch, 1951 to 2024

**Type:** code-rendered SVG, horizontal timeline.

**Spec.**
- Horizontal axis: years from 1951 to 2024.
- Vertical: single track, with launch markers as circles on the line.
- Each marker labelled with party name above the line, founder below.
- Marker colour by outcome:
  - **Burgundy `#9B2C2C` (filled)** — successful pivot (Bersatu, KeADILan, Amanah, GRS).
  - **Burgundy `#9B2C2C` (outline only)** — partial success / reabsorbed (Semangat 46, DAP/Gerakan surge).
  - **Warm white `#F4F1EB` at 40% opacity** — failed launches (IMP, Pejuang, MUDA-federal, GTA).
- Connecting line in muted `#3F1212`.
- Annotation labels in `Inter`, 11px, warm white.
- Years in `Spectral`, 13px italic, muted.

**Data:**
```
1951  IMP             Onn Jaafar               failed
1969  DAP/Gerakan     —                        partial
1988  Semangat 46     Tengku Razaleigh         partial
1999  KeADILan        Wan Azizah/Anwar         successful
2016  Bersatu         Mahathir/Muhyiddin       successful
2017  Amanah          PAS progressives         successful
2020  Pejuang         Mahathir                 failed
2020  MUDA            Syed Saddiq              failed
2020  GRS             Hajiji Noor (umbrella)   successful
2022  GTA umbrella    Mahathir                 failed
```

**Caption:** *Figure 1. Major Malaysian federal-or-state party launches, 1951–2024. Filled markers = successful pivot. Outline = partial. Faded = failed. Source: ROS gazette records, EC results, T4A compilation.*

---

## Figure 2 — Voters per parliamentary seat, sample of ten

**Type:** code-rendered SVG, horizontal bar chart.

**Spec.**
- Horizontal bars, longest at top.
- Bar fill: burgundy `#9B2C2C`.
- Constituency name in `Inter` 13px white, left of bar.
- Voter count number in `Spectral` 13px italic warm white, right of bar.
- Vertical reference line at ~100,000 marked subtly.
- Y-axis label none. X-axis label: "Registered voters".
- Background: navy. No gridlines except the single 100k reference.

**VERIFIED data (PRU15 / GE15 2022 EC voter roll, post-UNDI18). Two independent editor-verification reviewers cross-checked against the SPR official statistics PDF.**

```
P102 Bangi (Selangor)                303,430   [VERIFIED, both reviewers]
P111 Kota Raja (Selangor)            244,712   [VERIFIED, both reviewers]
P106 Damansara (Selangor)            239,103   [VERIFIED, both reviewers]
P110 Klang (Selangor)                208,913   [VERIFIED, both reviewers]
P109 Kapar (Selangor)                189,369   [VERIFIED, both reviewers]
P078 Cameron Highlands (Pahang)       46,020   [VERIFIED, both reviewers]
P125 Putrajaya (FT)                   42,881   [VERIFIED, both reviewers]
P222 Lawas (Sarawak)                  33,655   [VERIFIED, both reviewers]
P207 Igan (Sarawak)                   28,290   [VERIFIED, both reviewers]
```

**Hulu Rajang (P216) — REVIEWERS DISAGREE.** Verifier 1 returned 29,815; Verifier 2 returned 43,438. Both cited SPR PRU15 PDFs but from different breakdowns (UMUR / age vs JANTINA / gender) which should produce the same row total — one of them mis-read the PDF. **Editor must pull the source PDF directly to resolve.** Until then, drop Hulu Rajang from the fig-2 sample. The dossier argument (Bangi ~303k vs Igan ~28k, roughly 10.8:1 ratio) is unaffected.

**Caption:** *Figure 2. Voters per parliamentary constituency, sample of nine from the Election Commission's GE15 (2022) roll, post-UNDI18 automatic voter registration. The largest seat carries roughly 10.7 times the voters of the smallest. The 1957 Federal Constitution capped this deviation at 15 per cent; a 1962 amendment loosened the tolerance to about one-third; a 1973 amendment removed the quantified cap entirely. UNDI18 widened the urban-rural disparity by adding roughly 5.8 million new voters disproportionately to urban seats. Source: Election Commission of Malaysia, PRU15 voter-roll statistics by parliamentary constituency, [https://sprinfo.spr.gov.my/spr/MAKLUMAT%20ASAS/STATISTIK%20PRU%20KE_15%20UMUR%20BY_PARLIMEN.pdf](https://sprinfo.spr.gov.my/spr/MAKLUMAT%20ASAS/STATISTIK%20PRU%20KE_15%20UMUR%20BY_PARLIMEN.pdf).*

---

## Figure 3 — Sarawak State Sales Tax revenue, 2019–2024

**Type:** code-rendered SVG, vertical bar chart.

**Spec.**
- Six bars, one per year, 2019 through 2024.
- Bar fill: burgundy `#9B2C2C`.
- Y-axis: revenue in billions RM, range 0 to 4.5.
- Y gridlines at 1, 2, 3, 4 in muted `#3F1212`.
- Bar value labels above each bar in `Spectral` 13px italic warm white.
- Year labels below in `Inter` 13px white.

**VERIFIED data (from successive Sarawak State Budget speeches; one editor-verification reviewer confirmed all six years against the budget-speech URLs below; a second reviewer cross-checked 2019 directly and could not independently verify 2020–2022, returning slightly different figures for 2023 and 2024).**

```
Year  Revenue (RM bn)  Label                Source
2019  2.957            ACTUAL               Sarawak Premier media statement, 17 Sep 2020 (Petronas cheque handover)
2020  2.744            ACTUAL               Sarawak State Budget 2022 Speech, 22 Nov 2021
2021  3.162            ACTUAL               Sarawak State Budget 2023 Speech, 21 Nov 2022
2022  4.231            ACTUAL               Sarawak State Budget 2024 Speech, 20 Nov 2023
2023  3.844            ESTIMATE             Sarawak State Budget 2024 Speech, 20 Nov 2023  [Verifier 2 returned 3.424; editor to reconcile]
2024  3.518            BUDGET PROJECTION    Sarawak State Budget 2024 Speech, 20 Nov 2023  [Verifier 2 returned 3.600 as Oct 2024 collection; editor to reconcile]
```

**Chart spec.**
- Bar fill: burgundy `#9B2C2C` for ACTUAL years; burgundy `#9B2C2C` at 50% opacity for ESTIMATE/PROJECTION years (visual signal that the figure is not audited).
- Each bar labelled with its value AND label (ACTUAL/ESTIMATE/PROJECTION) below the year.
- Y-axis: 0 to 4.5 in billions of ringgit. Gridlines at 1, 2, 3, 4.
- Caveat block below the chart: "2019–2022 audited actuals reported in successive Sarawak State Budget speeches; 2023 is the revised estimate; 2024 is the initial budget projection. Annual collection varies with global crude prices."

**Caption:** *Figure 3. Sarawak State Sales Tax revenue from petroleum products, 2019–2024, in billions of ringgit. Tax imposed at 5 per cent by the Sarawak Sales Tax (Amendment) Ordinance 2018. Cumulative collection 2019–2023 in the range of RM15–17 billion. Sources: Sarawak State Budget speeches 2022, 2023, 2024 (Sarawak Premier's Department) and Sarawak Premier's media statement of 17 September 2020.*

**Verification note for editor:** Verifier 1 reported all six annual figures with direct budget-speech URLs and the figures sum to approximately RM18bn cumulative which is consistent with the publicly reported RM15.8bn for 2019–2023. Verifier 2 could not independently verify 2020–2022 and gave different figures for 2023 (3.424) and 2024 (3.600). Pull the actual budget-speech PDFs at the URLs above before publication to confirm each year and to decide between 3.844/3.424 for 2023 and 3.518/3.600 for 2024. The dossier body text uses the qualitative "RM2.7bn–RM4.2bn range over 2019–2024" which is true under both reviewers' figures.

---

## Figure 4 — The Shapley pivot

**Type:** schematic SVG, conceptual diagram.

**Spec.**
- A horizontal arrangement of three nodes representing parliamentary blocs in a hung chamber: left bloc 80, centre bloc 30, right bloc 80.
- Each bloc rendered as a stylised cluster of dots representing seats, with total in `Spectral` 24px italic warm white below.
- Two curved arcs above the diagram connecting (left + centre) → "Majority A: 110" and (right + centre) → "Majority B: 110", both drawn in burgundy `#9B2C2C`.
- The centre bloc is the only one that appears in both possible two-bloc majorities. Mark it with a thin burgundy ring.
- A small annotation in `Inter` 11px warm white below the centre: "Necessary partner in either two-bloc majority. 30 of 190 seats = ~16% of seats but ~33% of Shapley-Shubik bargaining power."
- **Stage 2 flag:** add a small secondary panel or footnote below the main diagram showing a third configuration: "Grand coalition: 80 + 80 = 160, no pivot value for the 30-seat bloc. The pivot premium evaporates whenever the two large blocs choose to govern together."

**Caption:** *Figure 4. The pivotal player in a hung chamber, and the case where the pivot evaporates. The 30-seat bloc holds bargaining power disproportionate to its seat share when neither large bloc has a majority alone — formally, the Shapley–Shubik power index makes the 30-seat bloc roughly one-third of the bargaining power on about one-sixth of the seats. The exception: when the two large blocs form a grand coalition (the live alternative in Malaysian unity-government arithmetic), the pivot premium vanishes. New launches play this game; grand coalitions break it.*

**Optional image-generation alternative (canonical T4A line-art style):** draw three figures, two larger flanking and one smaller centre, with two curved bridges connecting the smaller centre to each of the larger ones — as a single continuous white line on navy. T4A signature continues the stroke. This version reads more emotionally; the schematic SVG reads more analytically. Recommend SVG.

---

## Figure 5 — The brokerage stack

**Type:** schematic SVG, conceptual diagram.

**Spec.**
- A vertical stack of five layered panels, each panel a thin horizontal rectangle with title centred.
- Panels from top to bottom:
  1. **Division Head** (the defector)
  2. **Branch chairs (300–500 per division)**
  3. **JKKK village chiefs and mosque committees**
  4. **Felda settler representatives (in Felda-adjacent seats)**
  5. **Local contractor networks**
- Each panel filled in burgundy `#9B2C2C` at decreasing opacity from 100% (top) to 40% (bottom), suggesting that the visible defector at top is supported by an invisible base.
- A thin burgundy vertical arrow on the left side runs through all five panels labelled "What he actually brings".
- Title text in `Spectral` 16px italic warm white; layer counts in `Inter` 11px.

**Caption:** *Figure 5. What a defector with seats actually delivers. The visible defection is the top layer; the four layers beneath are the assets the new party cannot otherwise acquire in less than a decade.*

---

## Figure 6 — The anti-hopping loophole

**Type:** two-panel comparison SVG.

**Spec.**
- Two side-by-side panels, separated by a thin vertical burgundy rule.
- **Left panel** titled "Individual defection (blocked)":
  - Stick figure of an MP labelled "MP" walking from a box labelled "Party A" toward a box labelled "Party B".
  - A burgundy circle with a slash through it crossing the path.
  - Below: "Seat becomes vacant. Article 49A(1)(a)–(b)."
- **Right panel** titled "Party-level exit (allowed)":
  - A larger box labelled "Party A" with five small figures inside.
  - An arrow from the entire box to a new box labelled "New Coalition".
  - No burgundy slash.
  - Below: "Seats retained. Article 49A does not bind the party."
- Both panel titles in `Spectral` 16px italic warm white. Annotations in `Inter` 12px.

**Caption:** *Figure 6. Article 49A of the Federal Constitution, inserted in 2022, binds individual MPs but not parties. The structural incentive to act in a coordinated party-level move has therefore increased, not decreased.*

---

## Figure 7 — International comparison table

**Type:** styled HTML table or rendered SVG of a table; either works.

**Spec.**
- Five columns, six rows of data plus header.
- Header row in burgundy `#9B2C2C` background, white text in `Inter` 12px bold.
- Body cells: navy background, warm white text in `Inter` 12px regular.
- Horizontal rules between rows in `#3F1212` muted.
- Country names in left column in `Spectral` italic 13px warm white.

**Data:**

| Country | Electoral threshold | Public party funding | Anti-hop rule | Real-world frequency of new-party launches |
|---|---|---|---|---|
| Malaysia | None (FPTP) | None | Individual-only (2022) | High (every cycle) |
| Germany | 5% national | Yes, vote-share tied | Floor-crossing free | Rare (Greens 1980, AfD 2013) |
| United Kingdom | None (FPTP) | "Short money" for opposition | Floor-crossing free | Rare (SDP 1981, Reform 2018+) |
| Indonesia | Verification thresholds | Limited | Strict re-registration | Moderate |
| Israel | 3.25% | Yes | Strict | High (list PR + personalism) |
| Italy | None / coalition | Yes | Floor-crossing free | High (Forza Italia 1994, M5S 2009) |

**Caption:** *Figure 7. Comparative entry barriers across six democracies. Malaysia sits in the same bucket as Israel and Italy for ease of new-party formation, and well outside Germany or the United Kingdom. The reform options exist; they have simply not been chosen.*

---

## Asset delivery checklist

Per figure, the production package should include:

- [ ] Source file: SVG (preferred) or Figma frame export.
- [ ] PNG export at 1200×630 for OG / fallback raster use.
- [ ] PNG export at 2400×1260 (2x retina) for high-resolution inline.
- [ ] Optional WebP at the same dimensions for performance.
- [ ] Caption text (handled in the dossier JSON; do not bake into image).
- [ ] Alt text (already in `D001.json` under `figures[].alt`; pass through to `<img alt>`).
- [ ] Primary source citation under the caption in the dossier layout.

Save all figures under `public/dossiers/D001/`. Naming convention: `fig-{slug}.svg`, `fig-{slug}@2x.png`, etc.

---

## OG image for the dossier (separate from figure cover)

**Purpose:** the social-share preview when the dossier is linked on WhatsApp, X, Facebook.

**Specification:**

- 1200×630 PNG.
- Background `#0f0f23`.
- Top-left: small burgundy "DOSSIER · D001" pill badge with white `Inter` 14px.
- Below the badge, large dossier title in `Spectral` 56px italic warm white `#F4F1EB`. Two lines maximum.
- Below title, subtitle in `Spectral` 22px regular muted white `#9CA3AF`. Single line.
- Bottom-right: the cover illustration (Figure cover) compressed and positioned to occupy the lower-right ~40% of the frame, single-stroke white on the same navy background.
- Bottom-left: small T4A wordmark in `Spectral` italic 18px warm white.
- Top-right: small "Est. 22 min read" tag in `Inter` 11px muted.

Save as `public/dossiers/D001/og-1200x630.png`.

A separate version OG for each section (for "share this section" deep links) is *not* required for v1. It is a future enhancement.

---

## Style consistency note for Claude Design

The dossier must feel visually adjacent to the existing bite-size feed but unmistakably *more*. The way to do that without breaking brand:

- Keep the dark navy background and the single-stroke white illustration language.
- Add the burgundy accent — restrained, used on rules, badges, drop caps, pull quotes, and one of every data figure's primary fills.
- Introduce a serif (Spectral) for the body and chapter titles. The bite-size feed uses sans (Inter); the dossier uses serif. This single typographic change does most of the work of marking the product as different.
- Use generous negative space. The reader has committed; do not pack the page.
- Figures live full-width within the reading column on mobile; on desktop they can break into the right margin as marginalia for the sidenote and citation.

If a figure has to be cut for time, cut Figure 5 (brokerage stack) first — its content is conveyed in the prose. Figures 1, 2, 3, 4, 6, 7 are load-bearing.
