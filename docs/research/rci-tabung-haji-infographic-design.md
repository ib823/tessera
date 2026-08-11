# RCI Tabung Haji — infographic design research

Design record for a standalone data graphic explaining the Royal Commission of
Inquiry into Lembaga Tabung Haji (2014–2020), published 29 July 2026. Companion
to `engine/briefs/tabung-haji-rci-2017-restatement.md`, which holds the
primary-source findings and page citations.

This document decided *what* to build and *why*, so the build was an execution
step rather than a series of taste calls. **It has since been built** — see §9
for what shipped, what was deferred, and which of the open questions the report
reading closed. Where the built page departs from this plan, the page is right
and the departure is recorded in §9.

## 0. The brief, restated

Make a page that is interesting, relatable, easy to follow, and unbiased, on a
report about a religious-purpose savings institution holding roughly RM88 billion
for 9.8 million depositors, where no one has been charged.

Those four goals are not equally hard. "Interesting" and "relatable" are close to
free — the report contains one of the most vivid governance facts in Malaysian
public record (see §2b). **"Unbiased" is the whole problem**, and it is not
solved by neutral-sounding prose. It has to be solved structurally.

## 1. The governing principle: bias enters through the words, not the bars

The single most useful finding in the literature for this page:

> Kong, Liu & Karahalios found that a **slanted title changes what readers take
> away from the identical chart** — and readers persistently rate the
> visualization as impartial anyway. Recall aligns with the *title* more often
> than with the *visualization*.
> ([Frames and Slants in Titles of Visualizations on Controversial Topics](https://www.semanticscholar.org/paper/Frames-and-Slants-in-Titles-of-Visualizations-on-Kong-Liu/327655416cb3f92ff58a4dde64166c340c654b97))

The implication is uncomfortable and clarifying. A chart cannot launder a slanted
headline, and a scrupulous chart will not protect us: readers will absorb the
title's slant and *still* believe they read something neutral. So on this page the
neutrality budget goes overwhelmingly into **titles, captions, and annotations** —
not into agonising over bar colors.

The second principle, from the trust literature: readers judge a graphic's
trustworthiness through credibility, clarity, reliability, familiarity and
confidence, and they penalise **data shown without context** as much as data shown
wrongly ([Trustworthy by Design](https://arxiv.org/pdf/2503.10892);
[COVID-19 visualisation trust case study](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10375234/)).
Our defence is the one T4A already uses elsewhere: **show your work on the page**
— full dataset table, method, and every figure attributed to whoever computed it.

The hard consequence, stated up front:

> **Every number on this page carries the name of who computed it** — the
> National Audit Department (KAN), PwC, Tabung Haji's own statements, or the
> commission. Not "the RCI found RM70.3b in assets." The commission recorded
> *KAN's* finding. This distinction is not pedantry: the press got exactly this
> wrong, and so did an earlier draft of our own brief.

## 2. What the data actually is

Five datasets, each with a different job. Cataloguing them first prevents the
classic failure of picking a chart type and then hunting for data to fill it.

### (a) The counterfactual restatement — the headline

PwC's reconciliation as reproduced by the commission (para 3.13.11, p. 111),
RM million: profit 3,412 → less AFS equity impairment (4,258) → less AFS debt (7)
→ less other adjustments (580) → **adjusted loss (1,433)**.

**Job:** show how a reported profit becomes a loss. Sequential, additive, signed.

**The catch that governs its design:** this is a **counterfactual**, not an
observed outcome. It is what the accounts *would have* shown under full MFRS. It
must never be drawn in the same visual language as the reported figure, or the
page asserts as fact something the report frames as a restatement.

### (b) The impairment dial — the most relatable fact in the report

Paras 3.13.8–3.13.9 (p. 110). Impairment was recognised only once an investment
fell **70%** below cost; in FY2017 the threshold moved to **85%**, then **90%**.
PwC's sensitivity: RM1,313m charge at >70%, RM171m at >85%, **RM1m at >90%**.
TH recorded RM1.0 million.

The report supplies its own analogy (para 3.9.8, p. 77): a RM1,000 shareholding
was written down only once it was worth **RM100**.

**Job:** a single devastating comparison. This is the fact a reader repeats to
someone else, and it is *the report's own framing*, which makes it maximally safe.

### (c) The asset–liability position

PwC's table (para 3.13.7, p. 109), RM million, 2013–2017: total assets, total
liabilities including depositors' saving fund, shortfall pre-distribution, the
distribution declared, shortfall post-distribution. 2017: 70,317 / (71,086) /
(769) / (3,324) / **(4,093)**.

**Job:** show that the gap predates 2017 and that the distribution is what turns a
manageable shortfall into a large one. Separately, KAN's own figures (para
3.11.11, pp. 93–94) give 70,317 against 74,409 — the same year on a different
basis. Both belong on the page, labelled.

### (d) The governance chain

Not numeric. Act 535 s.6(2) requires only that a board member be Muslim and
Malaysian, with no competence criterion; s.22(1) puts hibah declaration behind
ministerial approval; depositors' funds sat in equity from 2010; KAN certified the
accounts; the gate cleared.

**Job:** explain *how* it was possible, which is the part a bar chart cannot do.

### (e) The timeline, including the withholding

Appointed 20 Jan 2022 → presented to the Agong 30 Aug 2022 → published 29 Jul
2026. Plus the commission's own request at para 4.6 that the Government publish
it. Three years eleven months.

**Job:** the reframe. Also the highest-risk element on the page (§5).

## 3. Form decisions, with verdicts

Following the house procedure (form first, color last; `dataviz` skill).

### (a) The restatement — **annotated bridge, revealed in steps. Accept, with conditions.**

The waterfall/bridge is the natural form and the honest one. But the evidence for
lay comprehension is weaker than its popularity suggests: I found **no controlled
study** of waterfall comprehension in non-expert audiences. Practitioner sources
converge on the opposite warning — bridges "may resemble conventional bar charts
with gaps," and are "standard in corporate finance… but may puzzle audiences
outside these industries"
([Sigma](https://www.sigmacomputing.com/blog/waterfall-charts-data-visualization);
[Zebra BI](https://zebrabi.com/excel-waterfall-chart/)).

So: keep the form, and carry the comprehension on the annotation layer, which
*does* have evidence behind it. Additive annotations — ones that introduce new
content rather than restate the visual — measurably improve comprehension
([Survey on Annotations in InfoVis](https://arxiv.org/pdf/2410.05579);
[Designing Annotations in Visualization](https://arxiv.org/html/2604.07691)).
Amanda Cox's formulation is the standard: *"the annotation layer is the most
important thing we do… otherwise it's a case of here it is, you go figure it
out."*

Conditions:
- Every step gets a plain-language annotation naming what the adjustment *is*.
- The endpoints are **stat tiles**, not bars — the reported RM3.4b profit and the
  restated RM1.4b loss are the two numbers that must survive. A hero figure is a
  documented form for exactly this; a one-bar bar chart is an anti-pattern.
- The counterfactual half is drawn **hatched / ghosted**, never solid. This
  follows both the counterfactual-visualization work and the uncertainty
  literature's core warning that static uncertainty gets read as deterministic
  ([Wang, Borland & Gotz 2024](https://vaclab.unc.edu/publication/iv_2024_wang/iv_2024_wang.pdf);
  [Wilke, *Visualizing Uncertainty*](https://clauswilke.com/dataviz/visualizing-uncertainty.html)).
  It also reuses T4A's existing encoding vocabulary — the Plumb Line already
  hatches provisional values.
- Caveat carried from the same study: counterfactual charts can "muddy the
  waters" and cost response time. Hence stepwise reveal rather than all-at-once,
  and a table view underneath.

### (b) The impairment dial — **not a chart. Accept as a pictorial unit comparison.**

RM1,313m vs RM171m vs RM1m spans three orders of magnitude. On a linear axis the
third bar vanishes; on a log axis a general reader misreads it. Both are worse
than the report's own device.

Build it as **the RM1,000 note that gets written down only at RM100**, with the
three thresholds as a small stepped scale beside it, and the three impairment
figures as text. This is a unit/pictorial comparison, not a magnitude chart, and
it inherits the report's authorship — we are illustrating the commission's own
illustration, not inventing a rhetorical device.

Rejected here: gauge/speedometer (chartjunk, no baseline), log-scale bars
(misread by non-technical readers), 3D coin stacks (embellishment is a documented
deception tactic — [ACM](https://dl.acm.org/doi/fullHtml/10.1145/3380851.3416762)).

### (c) The asset–liability position — **emphasis line vs baseline. Accept.**

Five years, two measures of the same scale, one crossing point. Draw the shortfall
against a zero baseline with the distribution shown as the step that pushes it
down. **Emphasis form** — 2017 in the accent hue, other years recessive — rather
than five categorical colors.

Hard rule from the house guidance and the deception literature alike: **no
dual-axis chart**, and **no truncated baseline**. Truncation is the canonical
"message exaggeration" tactic and is precisely what a hostile reader will look for
here. Zero must be on the axis and visible.

### (d) The governance chain — **a numbered diagram, not a flowchart.**

Four steps, each with a citation. Flowcharts with decision diamonds imply a
process that was followed correctly. A numbered vertical sequence states what the
report found without dramatising it.

### (e) The timeline — **vertical, mobile-first, uncolored by government.**

See §5 for why the coloring rule matters.

### Rejected outright

| Form | Why not |
|---|---|
| Sankey / money-flow | There is no flow data. The RCI is an accounting-standards finding, not a follow-the-money story. A Sankey would imply misappropriation the report does not allege. **This is the single most tempting and most dangerous form on the table.** |
| Pie / donut | Two-slice pies and close-value donuts are anti-patterns; nothing here is part-to-whole. |
| Dual-axis | Never. Deposits and rates on one plot is the #1 chart mistake. |
| Org chart of named individuals | No one has been charged. See §5. |
| Full scrollytelling page | See §6. |

## 4. Relatable without distorting

The perspectives literature is encouraging and has a specific bonus for a
trust-first brand: Goldstein, Hofman & Barrio found that adding perspectives to
unfamiliar large numbers improved recall, improved estimation, **and improved
readers' ability to detect manipulated numbers**
([Reynolds Center summary](https://businessjournalism.org/2017/10/writing-millennials-making-big-numbers-relatable/)).
Perspectives make readers better auditors of us, which is the point.

**Safe perspectives for this page:**
- The report's own RM1,000 → RM100 write-down example.
- RM3,324m distributed against a RM769m pre-distribution shortfall — a ratio
  internal to the report's own table.
- Waiting time: the commission's own claim that raising the Muassasah minimum from
  RM1,300 to RM12,980 would cut the haj queue from **130 years to 33 years**
  (p. 198). Concrete, human, and the commission's arithmetic, not ours.

**Perspectives to refuse, and why** — these are the ways this page could go
wrong while looking clever:
- **RM/depositor division.** "RM1.4b ÷ 9.8m depositors = RM143 each" is arithmetic
  that implies a per-person loss which **did not occur**. Depositors were paid
  their hibah; the gap was closed by the 2018 restructuring. This framing would be
  an overclaim under the Accuracy Standard's first cardinal sin.
- **Summing the loss figures.** RM1.4b (restated 2017 net loss), RM4.1b (2017
  post-distribution shortfall), RM4.7b (accumulated loss), RM10b (losses at the
  point of rescue), RM12.6b (TH's own total addressed). Five different measures.
  Stacking or adding them produces a fictitious number. The page must show them as
  **five distinct measures on one labelled scale**, never as a total.
- **Comparisons to 1MDB.** Different mechanism, different findings, no charges
  here. An adjacency graphic would import a verdict the report does not make.
- **Anything per-pilgrim or per-haj-slot** that implies pilgrims were denied haj.

## 5. Unbiased by construction — the checklist

This is the section to re-read before publishing.

1. **Descriptive titles, never verdicts.** Per Kong et al., the title is where
   slant actually lands. "What the commission found in Tabung Haji's 2017
   accounts" — not "How Tabung Haji hid a RM1.4 billion loss." The second is a
   causal claim about intent that the report does not make.
2. **Attribute every figure to its computer** — KAN, PwC, TH, or the commission.
3. **Mark the counterfactual as counterfactual.** Hatched, and captioned "what the
   accounts would have shown under full MFRS," every time.
4. **Carry the commission's own positive findings.** Para 4.1–4.2 (p. 191) records
   that TH is an admired institution that has taken 1.46 million Malaysians on
   haj, distributed RM37.52b in hibah since 1966, and subsidised RM2.02b through
   HAFIS. Para 4.3 records that the commission **rejected** proposals to break TH
   up. Omitting this would be misleading framing by selection — the third cardinal
   sin — and it is also the most surprising thing on the page.
5. **Carry the rescue argument at full strength.** Paras 3.13.13–3.13.17: without a
   hibah, a possible bank run across 9.2 million depositors, fire-sales into four
   markets, and activation of the s.24 government guarantee with a sovereign
   rating risk. A page that shows only the accounting failure and not the systemic
   stakes is a partisan page.
6. **Carry TH's current position.** TH says it has distributed on audited results
   since 2022 and implemented about 75% of the recommendations. Dated, attributed.
7. **No named individuals as wrongdoers.** MACC and AGC processes are live and
   nobody has been charged. Officeholders may be named as officeholders where the
   report names them; culpability is not ours to assign.
8. **Do not color the timeline by government.** The period spans BN and PH
   administrations, board appointments 2014–2018, terminations in 2021, and
   publication in 2026 under a third. Any party coloring converts a governance
   finding into a partisan scoreboard. Use one neutral hue and let the dates speak.
9. **3R discipline.** Tabung Haji is a religious-purpose institution and hibah is a
   Syariah-framed concept. **No Kaaba, no pilgrims, no religious iconography, no
   mosque silhouettes.** The subject is a statutory fund's accounts. The visual
   register is documents, thresholds, and ledgers. Never adjudicate the theology of
   hibah; never imply the haj obligation or depositors' savings are the problem.
10. **The withholding is the reframe — state it, don't editorialise it.** The
    commission asked for publication (para 4.6); publication came three years
    eleven months later; the stated reason was depositor confidence. Put those
    three facts on one timeline and let the reader draw the conclusion. Adding an
    accusatory caption would forfeit the strongest thing the page has.

## 6. Structure and format

### Scrollytelling — **verdict: no, with one exception.**

The evidence is more modest than the marketing. In a controlled comparison,
scrollytelling's "comprehension accuracy [was] statistically indistinguishable
from most alternative formats," winning on *experience* rather than understanding;
and when exposure time is accounted for, **plain text is the most efficient
medium** ([Scrollytelling as an Alternative Format](https://arxiv.org/pdf/2603.04367);
[Impact of Scrollytelling on Long-Form Journalism](https://dl.acm.org/doi/fullHtml/10.1145/3605655.3605683)).

The house has already made this call once: the Plumb Line's Tier 4 scrollytelling
explainer was deferred in favour of shipping static tiers first.

**Exception:** one scroll-driven reveal on the restatement bridge (§3a), because
the stepwise mechanism *is* the content and narrative sequencing acts as
pre-training for the mental model. Everything else is static and readable in one
pass, degrading to a plain vertical article with no JS.

### Page skeleton — follow the `tourism-state` precedent exactly

That page is the house pattern and it is a good one: hero graphic → "the one-line
version" → "what the metric is and is not" → what the numbers say → **full dataset
table** → method → sources → a compiled-by footer. It also carries the label
**"Data graphic · Not an editorial issue"**, which matters here: this page has no
`opinionShift`, no `stageScores`, and does not enter the 4-stage pipeline.

Proposed section order:

1. Hero: the two stat tiles (RM3.4b reported / RM1.4b restated) with the hatch.
2. The one-line version.
3. **What this is and is not** — moved up from the tourism page's position,
   because on this topic the caveats are load-bearing: a restatement is not a
   finding of theft; no one has been charged; the fund's position was restored.
4. The bridge (scroll-revealed).
5. The RM1,000 → RM100 dial.
6. The asset–liability position.
7. How it was possible — the four-step governance chain.
8. What the commission recommended (25 syor, the four that matter).
9. Timeline, including the withholding.
10. What TH says now.
11. Full dataset table — every figure, its measure, its source paragraph.
12. Method, sources, compiled-by.

### Static PNG or live SVG?

The tourism page ships a rasterised PNG built by `render.mjs` + `sharp`. That is
right for a choropleth. Here I'd recommend **inline theme-aware SVG components**
(the `src/components/figures/` pattern used by the dossiers) as the primary
surface, for three reasons: the hatch encoding needs to survive dark mode; the
scroll-reveal needs live elements; and SVG stays sharp at 200% zoom, which the
accessibility guidance specifically calls for. Keep a rendered PNG **as well**,
for OG/social and for the reader who prints.

### Accessibility, from the checklist

- Contrast ≥ 4.5:1 body, ≥ 3:1 for graphic elements.
- **Never encode by color alone.** The hatch on the counterfactual is doing double
  duty here — it is both the honesty marker and the CVD-safe secondary encoding.
- Alt text on every figure stating the trend and the key numbers.
- The dataset table is not an afterthought — it is the non-visual equivalent of
  the whole page.
- Dark mode is designed, not auto-flipped (house tokens already handle this).
- Print-legible in B&W: the hatch survives, a hue difference would not.

### Language

The source document is in Malay; the audience is bilingual. Recommendation: page
in English, with the report's own terms kept in Malay and glossed on first use —
*hibah* (profit distribution), *rosot nilai* (impairment), *syor* (recommendation),
*Kumpulan Wang Pendeposit* (depositors' fund). Quotations from the report stay in
Malay with an English gloss beneath, which is both more accurate and a visible
signal that we read the original.

## 7. Integrating back into T4A

### Files

```
infographics/rci-tabung-haji/
  data.json        # every figure with measure, value, unit, source para + page
  render.mjs       # SVG → PNG via sharp, for OG + print (matches tourism-state)
  WRITEUP.md       # the prose, authored here, mirrored into the .astro
  SOURCES.md       # primary sources, all pointing at the report
  README.md
src/pages/infographics/rci-tabung-haji.astro
src/components/figures/RciFig1Bridge.svelte      # scroll-revealed
src/components/figures/RciFig2Threshold.svelte
src/components/figures/RciFig3Position.svelte
src/components/figures/RciFig4Timeline.svelte
public/infographics/rci-tabung-haji.png
public/infographics/rci-tabung-haji-og.png
```

Register in `src/pages/infographics/index.astro` (the hub already lists two items
and takes a third without modification).

### Relationship to issue 2010

The pending editorial issue and this page do different jobs, and that is the
argument for building both. A T4A issue is seven cards inside a ~1,300-character
budget — it cannot carry PwC's five-line reconciliation, five distinct loss
measures, or a 25-recommendation list. **The infographic is the "show your work"
surface the card format structurally cannot hold.**

Integration, once issue 2010 publishes:
- The issue's `view` or `reframe` card links to the graphic.
- The graphic links back to the issue.
- Both cite `engine/briefs/tabung-haji-rci-2017-restatement.md` as the shared
  source of record.
- Run `scripts/build-fact-graph.mjs` — the entity extractor already recognises
  MACC, AGC, Parliament and RM-amount patterns, so the page will connect to
  existing issues without new plumbing.

**Sequencing question worth deciding deliberately:** the graphic can ship *before*
the issue. It has no `opinionShift` and does not need the 4-stage pipeline — it
needs the Accuracy Standard, which the brief has already satisfied. Publishing the
graphic first would put the primary-source record out while the editorial take is
still in review, which is arguably the more honest order.

### Build and CI

No new dependencies: `sharp` is already a devDependency, the SVG-in-JS render
pattern exists in `infographics/tourism-state/render.mjs` and
`scripts/render-plumb-poster.mjs`, and Svelte figure components exist under
`src/components/figures/`. Existing gates apply unchanged — `npm run check`,
`lint`, `test`, `check-bundle`, and the `@axe-core/playwright` e2e pass. Add a
render step only if the PNG is wanted in CI.

`validate-issues.mjs` does not cover infographic pages; the dataset table plus
`SOURCES.md` is the substitute control, and every row must carry a paragraph and
page number from the report.

## 8. Build order

1. `data.json` — every figure with its measure, source paragraph and page. This is
   the artifact everything else derives from, and writing it first forces the
   five-distinct-measures discipline from §4.
2. The two hero stat tiles and the "what this is and is not" block. If those two
   are right, the page is already honest.
3. `RciFig2Threshold` — the RM1,000 → RM100 dial. Highest relatability per unit of
   effort, and self-contained.
4. `RciFig1Bridge` with scroll reveal. The hard one; do it once the vocabulary is
   settled.
5. `RciFig3Position`, `RciFig4Timeline`.
6. Dataset table, method, sources.
7. `render.mjs` for OG/print, then register in the hub.

## 9. Decisions

1. **Ship before or after issue 2010? — DECIDED 2026-08-10: before.** The graphic
   publishes first, ahead of the editorial issue. It carries no opinion score and
   does not enter the 4-stage pipeline; it is bound by the Accuracy Standard,
   which the brief satisfies. Putting the primary-source record out while the
   editorial take is still in review is the more honest order, and it means the
   issue can later link to a published record rather than assert its figures
   unaided.
2. **[OPEN] English-only with Malay terms glossed, or a full BM version?** A full
   translation doubles the surface and the maintenance, but this story's most
   affected audience reads Malay first. Shipping in English does not foreclose it.
3. **[OPEN] How prominent is the withholding?** Currently a timeline section,
   which is where it shipped. Promoting it to the hero would be an editorial
   verdict rather than a presentation choice.
4. **[CLOSED] Sections 3.12 and 3.14–3.16 read 2026-08-09.** They changed the
   page: the bonus, police-report and MACC-referral claims moved from press
   sourcing to paragraph citations, the RM2.19m figure was corrected to a
   two-year sum, "replace the Auditor-General" was corrected to a statutory
   exemption under Act 240, and the haj-cost projection became Figure 5.
5. **[CLOSED] The count of problematic investments is 14**, counted from the
   report (¶3.14.6, pp.139–155) rather than inherited from coverage.

### Shipped, and what was deferred

Shipped: the page at `/infographics/rci-tabung-haji`, five inline SVG figures,
the full dataset table, an OG card, and a per-figure share card for each figure.
Zero client JavaScript, no external hosts, theme-aware through `tokens.css`.

Deferred deliberately, neither changing a number: the scroll-driven reveal on
Figure 1, and a Bahasa Malaysia edition.

## 10. Sources

Design and evidence:
[Kong, Liu & Karahalios, *Frames and Slants in Titles*](https://www.semanticscholar.org/paper/Frames-and-Slants-in-Titles-of-Visualizations-on-Kong-Liu/327655416cb3f92ff58a4dde64166c340c654b97) ·
[*Trustworthy by Design*](https://arxiv.org/pdf/2503.10892) ·
[COVID-19 visualisation trust case study](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10375234/) ·
[*The Deceptive Potential of Common Design Tactics*](https://dl.acm.org/doi/fullHtml/10.1145/3380851.3416762) ·
[*A Survey on Annotations in Information Visualization*](https://arxiv.org/pdf/2410.05579) ·
[*Designing Annotations in Visualization*](https://arxiv.org/html/2604.07691) ·
[Wang, Borland & Gotz, *Counterfactual Visualization*](https://vaclab.unc.edu/publication/iv_2024_wang/iv_2024_wang.pdf) ·
[Wilke, *Visualizing Uncertainty*](https://clauswilke.com/dataviz/visualizing-uncertainty.html) ·
[*Scrollytelling as an Alternative Format*](https://arxiv.org/pdf/2603.04367) ·
[*The Impact of Scrollytelling on Long-Form Journalism*](https://dl.acm.org/doi/fullHtml/10.1145/3605655.3605683) ·
[Goldstein/Hofman/Barrio perspectives, via Reynolds Center](https://businessjournalism.org/2017/10/writing-millennials-making-big-numbers-relatable/) ·
[A11Y Collective, accessible charts checklist](https://www.a11y-collective.com/blog/accessible-charts/) ·
[Sigma on waterfall charts](https://www.sigmacomputing.com/blog/waterfall-charts-data-visualization) ·
[Reuters Institute Digital News Report — Malaysia](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2025/malaysia).

Subject matter: *Laporan Suruhanjaya Siasatan Diraja bagi Menyiasat Isu Pengurusan
dan Operasi Lembaga Tabung Haji dari Tahun 2014 hingga 2020* (presented 30 Ogos
2022, published by JAKIM 29 Julai 2026) —
[announcement](https://www.islam.gov.my/ms/pengumuman/5085-laporan-suruhanjaya-siasatan-diraja-rci-tabung-haji-ini-disediakan-oleh-suruhanjaya-yang-dilantik-oleh-kdymm-seri-paduka-banginda-yang-di-pertuan-agong-pada-20-januari-2022) ·
[document](https://online.fliphtml5.com/kaxni/WJD22-0447-Laporan-Suruhanjaya-RCI-1f93/).
All paragraph and page citations in this document trace to
`engine/briefs/tabung-haji-rci-2017-restatement.md`.

House precedent: `docs/research/plumb-line-visual-design.md` (encoding rules,
hatching for provisional values, the show-the-doubt principle) ·
`docs/research/t4a-dossier-design.md` §5 (figure rules) ·
`infographics/tourism-state/` (the page pattern this one follows).
