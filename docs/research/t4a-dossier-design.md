# T4A Dossier Format — Design Brainstorm

**Status:** brainstorm / proposal for discussion. Not yet decided.
**Author:** Claude (Opus 4.7) on `claude/malaysia-political-strategy-5rMDT`
**Last edited:** 2026-05-17
**Reads-in-tandem-with:** `malaysia-new-party-strategy.md`, `malaysia-political-intelligence.md`

---

## 0. The brief, restated

We want a *second* T4A content product:

- Visually distinct from the regular bite-size card (the user proposed **red or pink** to mark "special edition").
- Longer — **more than 7 cards**, no upper cap, optimised for "best outcome" not for a fixed length.
- Includes **diagrams, tables, timelines** and other visual aids.
- Reads like a **short course**, not a bite-size feed item.
- Anchors a **T4A series** — repeated thematic dives, not a one-off.
- First candidate is the Malaysian political strategy work we just published as two internal memos.

This memo is the brainstorm. It maps the design space, names the tradeoffs, sketches the first dossier, and lists the decisions you need to make before code lands.

---

## 1. What the product actually is (and isn't)

**It is:**
- A long-form, structured, illustrated explainer on a topic worth 15–25 minutes of a reader's life.
- A reference document a reader returns to, links from WhatsApp, prints, and cites.
- A *coursebook chapter*: there is an arc, there are diagrams, there is a TLDR up top and a summary at the bottom, there are sections with anchors.
- A *trust artefact*: heavier sourcing, more primary citations, more visible footnotes than the regular issue.

**It is not:**
- A blog post (no scroll-of-paragraphs; still structured).
- A regular T4A issue with more cards bolted on (the data model and reader UX need to diverge).
- A landing page (no marketing language; same non-partisan editorial register).
- A subscription paywall (not yet — that's a separate product decision).

The closest external references are *The Economist*'s "briefings," *FT*'s "Big Reads," Stratechery's "concepts" posts, *Our World in Data*'s topic pages, the *NYT* "Upshot" deep dives, and academic primers. Pick the level of seriousness from any of them; we want to land between Stratechery and *Our World in Data*.

---

## 2. Naming and identity — what do we call this product

Naming matters because the reader's expectation is set by the label. Five candidates:

| Name | Vibe | Pros | Cons |
|---|---|---|---|
| **Dossier** | intelligence brief | conveys depth and rigour; matches the "intelligence-gathering" frame in the second memo | slightly conspiratorial connotation; some readers will associate with spy/police files |
| **Primer** | educational | accessible; "short course" framing; honest | slightly schoolbook; less prestigious |
| **The Long Read** | journalistic | familiar from *Guardian* / *FT*; reader knows what to expect | generic; doesn't mark T4A-specific |
| **Field Guide** | practical, applied | suggests usefulness in the world, not just understanding | informal; doesn't fit policy topics well |
| **Brief** | government / policy register | crisp; matches T4A non-partisan policy frame | overloaded word (press brief, legal brief, marketing brief) |

**Recommendation:** call the product **Dossier** in the back-end and the URL slug, but display either **"Dossier"** or **"The Long Read"** in the UI badge. Dossier reads slightly intelligence-y, which is consonant with the editorial brand (we surface what's hiding in plain sight). It also has zero collision with existing T4A vocabulary.

Open to your call; this is the kind of decision that compounds, so worth getting right.

---

## 3. Visual identity — the red / pink question

You proposed **red or pink** for the special-edition mark. Here is the design space.

### The candidates

| Colour | Hex (suggested) | Editorial register | Risk |
|---|---|---|---|
| **Deep crimson** | `#B91C1C` or `#991B1B` | serious, "stop and read," classified-document red | reads political/aggressive on a Malaysian site (PKR blue + UMNO red associations) |
| **Burgundy / wine** | `#7F1D1D` | intellectual, *NYRB*-cover red | low risk; reads "premium long-form" |
| **Vermilion / Pantone red** | `#DC2626` | tabloid red; high alert | reads partisan |
| **Hot pink / magenta** | `#DB2777` | distinctive, modern, "new" | reads consumer / startup, not journalism |
| **Coral / dusty rose** | `#E11D48` | warm, distinctive, contemporary | risk of looking lifestyle-magazine |
| **Oxblood + gold accent** | `#5C0E0E` + `#D4AF37` | premium, archival, *Economist*-cover | risk of feeling stuffy / colonial |

### What's already on the site

The existing T4A palette is dark navy (`#0f0f23`) + white with score-tier accents (greens / yellows / oranges). A red or pink for the dossier label is a *single accent*, not a full palette change. The dark navy background stays.

### Recommendation

**Burgundy `#7F1D1D` for the badge, label, and section-divider thin-rule, with white text on it.** Read it as:
- Distinctive enough to mark "this is not the usual feed."
- Serious enough to read as editorial rather than promotional.
- Politically neutral in Malaysian context (PKR's blue and UMNO's deeper red are both visually distant from this hue).
- Pairs well with the existing dark navy without competing.

If you want a brighter accent, **`#DC2626`** is a fine fallback. Avoid hot pink unless the brand intentionally pivots to a warmer, more contemporary register; on the current site it would feel like a different product.

A pink/red **edge bar on the feed card** (a 4–6px left border in burgundy) plus a small "DOSSIER" or "LONG READ" pill-badge in burgundy with white text on the top of the card would be enough to mark these without overhauling the feed.

---

## 4. Card types — beyond the usual 7

The bite-size product has six types: `hook`, `fact`, `reframe`, `analogy`, `view`, plus the optional `analogy`. The dossier needs more vocabulary because it has more work to do.

Proposed type set for dossiers (each is a section, not a 60-second card):

| Type | Purpose | Required? | Diagram-bearing? |
|---|---|---|---|
| `cover` | Title, subtitle, est. read time, "what you'll learn" promise | yes (1) | optional hero illustration |
| `tldr` | 5–8 bullet points; the entire dossier in 60 seconds for readers who won't finish | yes (1) | no |
| `chapter` | Section divider with chapter number and title | yes (≥3) | no |
| `concept` | Introduce a key term, framework, or model | as needed | often a diagram |
| `fact` | Empirical finding with lens and primary source, like the bite-size fact card but longer | as needed | optional |
| `diagram` | Standalone figure with caption, alt-text, primary-source citation | as needed | yes |
| `table` | Structured comparison (rows × cols) | as needed | n/a (the table is the visual) |
| `timeline` | Chronological sequence of events with dates and citations | as needed | yes (rendered timeline) |
| `quote` | Block quote from a primary source, attributed and cited | as needed | no |
| `case` | Worked example or case study (e.g., "GRS 2020 step by step") | as needed | optional |
| `reframe` | Same role as bite-size reframe — restructures the reader's mental model | yes (≥1) | no |
| `analogy` | Bridge to familiar concept; can include illustration | as needed | optional |
| `mistake` | Common misconception explicitly named and corrected | as needed | no |
| `glossary` | Inline term-and-definition box | as needed | no |
| `further_reading` | Annotated bibliography section near the end | yes (1) | no |
| `view` | Editorial synthesis at the close, same role as bite-size view | yes (1) | no |
| `cite_as` | Academic-style "how to cite this dossier" block | yes (1) | no |

A typical dossier might use 15–25 sections drawing from this set. The order matters; the data structure should be an ordered array of sections, like the existing `cards`.

---

## 5. Diagrams and visual aids — what counts and how to ship them

Three classes of visuals:

1. **Inline SVG figures.** Authored in code or in a tool like Excalidraw / Figma and exported as SVG. Scale on retina, accessible, theme-aware (dark navy background). First choice.
2. **PNG/JPG figures.** For photos, complex charts, or third-party images. Stored under `public/dossiers/{id}/fig-{n}.png`. Always need alt-text and a primary-source citation in the caption.
3. **Rendered HTML components.** A timeline, a comparison table, a numbered list with badges — built once as Svelte components and reused across dossiers. These are not "images" per se but are visual structure that the regular issue does not have.

**Hard rules I'd suggest:**
- Every figure has a caption.
- Every figure has alt-text (accessibility + LLM crawling + SEO).
- Every figure has a primary-source citation (URL, document, page/section).
- Figures are numbered (Figure 1, Figure 2) and referenced by number from the text.
- Dark-mode native: SVG and PNGs designed for the `#0f0f23` background.
- Print-friendly: figures must render legibly on a B&W A4 print.

**Diagrams worth building for the Malaysia dossier specifically** (concrete examples to make the spec feel real):
- **Figure 1.** Malapportionment ratio — bar chart of voters per seat across 10 sample constituencies. Source: EC voter roll.
- **Figure 2.** The party-formation chain 1951–2024 — timeline graphic of every major launch with arrows for splits and absorptions.
- **Figure 3.** The Shapley pivot — visual showing how a 30-seat third party in an 80-80-30 chamber holds disproportionate bargaining power.
- **Figure 4.** The Sarawak fiscal lever — a Sankey-style flow of oil-and-gas revenue showing where the 5% state sales tax sits.
- **Figure 5.** International comparisons table — rendered as a styled HTML table, not a screenshot.
- **Figure 6.** The brokerage stack — vertical diagram of what a defector brings: branch chairs → JKKK → contractors → Felda settler ties.
- **Figure 7.** The anti-hopping loophole — visual flowchart of "individual defection blocked" vs "party-level exit allowed."

Seven well-designed figures across a 20-section dossier is the right density. More dilutes; fewer makes it feel like a long text article.

---

## 6. Reader experience — how this reads on phone and desktop

### Mobile (the dominant device)

The regular bite-size product is a horizontal swipe through cards. The dossier should not be. A 20-section dossier swiped one-section-per-screen is a UX disaster — the reader loses orientation, can't skip ahead, can't go back.

Proposed mobile UX:
- **Vertical scroll** through sections, like an article.
- **Sticky top bar** with: dossier title (truncated), section number / total, progress bar (% scrolled), TOC button.
- **TOC drawer** slides up from the bottom, lists every section by title with chapter number; tap to jump.
- **Section anchors** with deep-link share buttons (so a reader can WhatsApp a single section to a friend).
- **Floating "Save" and "Share whole dossier" actions** in the bottom corner.
- **Reading progress saved in localStorage** so a reader can resume.
- **Estimated read time** rendered at the top (e.g., "18 min").
- **Diagrams** render full-width; tap to zoom into lightbox.

### Desktop

- Three-column layout: left TOC (sticky), centre reading column (max-width ~720px for readability), right margin for figure expansions and pull-quotes.
- TOC highlights current section as you scroll.
- Keyboard navigation (↓ next section, ↑ previous, T toggle TOC).
- Print stylesheet that produces a clean A4 PDF when the reader hits print.
- "Cite this dossier" floating button with copy-to-clipboard.

### Anti-patterns to avoid

- Infinite scroll across multiple dossiers (each dossier is a self-contained artefact).
- Embedded ads, related-content carousels, or recommendation widgets (this is a coursebook chapter, not a content farm).
- Hidden content behind "read more" interactions (the reader either commits or doesn't).

---

## 7. Data model — how dossiers live in the codebase

Two options.

### Option A — extend `Issue` with a `format` discriminator

Add `format: "issue" | "dossier"` to the existing `Issue` type. Dossiers go in `src/data/issues/` alongside regular issues, with the discriminator switching the reader component.

Pros: minimum new code, shared search index, shared OG pipeline, shared notifications worker.
Cons: schema gets fat with optional fields used only by one format; the validator has to branch; risk of regular-issue conventions leaking into dossier authoring.

### Option B — separate `Dossier` type and `src/data/dossiers/` directory

A parallel type with its own schema, its own loader, its own validator, its own reader component, its own route (`/dossier/[id]`).

Pros: clean separation; the dossier schema can evolve freely; dossier-specific validations don't pollute the issue path; reader UX components don't need to handle a regulated set of additional cases.
Cons: more new code; needs to integrate into search and notifications separately.

**Recommendation: Option B.** The dossier is genuinely a different product. Mixing it into the issue path now will create a refactor in six months when we want to give dossiers their own subscription model, their own series page, their own RSS feed, or their own analytics. Keep them parallel.

Proposed directory structure:
```
src/data/dossiers/{id}.json
src/data/dossier-types.ts
src/components/DossierReader.svelte
src/components/DossierTOC.svelte
src/components/DossierFigure.svelte
public/dossiers/{id}/fig-1.svg
public/dossiers/{id}/og-1200x630.png
```

Proposed schema (sketch, not final):
```json
{
  "id": "D001",
  "series": "malaysia-political-strategy",
  "title": "How New Parties Are Built in Malaysia",
  "subtitle": "A Field Guide to the Launch-and-Pivot Playbook",
  "estReadMinutes": 22,
  "published": true,
  "sourceDate": "2026-05-17",
  "edition": 1,
  "status": "new",
  "primaryLens": "Political",
  "sections": [ { "t": "cover", "..." }, ... ],
  "figures": [
    { "id": "fig-1", "src": "/dossiers/D001/fig-1.svg", "caption": "...", "alt": "...", "source": "..." }
  ],
  "citeAs": "The Fourth Angle (2026). How New Parties Are Built in Malaysia. Dossier D001.",
  "stageScores": { "pa": ..., "ba": ..., "fc": ..., "sr": ... },
  "finalScore": 0,
  "related": [],
  "relatedIssues": ["0142", "0173"],
  "legalCheckPassed": true
}
```

---

## 8. Numbering and URLs

Bite-size issues use `0001`, `0002`, ... up through `9999`. To prevent collision and signal the different product:

- Dossier IDs use a **`D` prefix**: `D001`, `D002`, ...
- Route: `/dossier/D001-how-new-parties-are-built-in-malaysia` (slug appended for SEO and shareability).
- OG image at `public/dossiers/D001/og-1200x630.png` with the burgundy DOSSIER badge baked in.
- Section anchors: `/dossier/D001#malapportionment` (each section gets a slug).

The `D` prefix also makes it trivial to grep, to filter the feed, and to gate behaviour in shared utilities. It's the cheapest possible signal.

---

## 9. The series concept — what holds multiple dossiers together

The user said "make it special for the T4A series." A *series* is a sequence of related dossiers under a single theme, with shared visual identity and cross-linking.

Proposed first three series:

1. **Malaysia Political Mechanics.** D001 (this one — new-party launch playbook), D002 (malapportionment and the EC), D003 (the GLC patronage substrate), D004 (Sabah / Sarawak fiscal autonomy), D005 (Article 40 and the YDPA's discretionary power).
2. **Money, Power, and the Malaysian State.** A future series on PETRONAS, Khazanah, EPF, Tabung Haji, 1MDB lessons, sovereign-wealth governance.
3. **The 3R Question.** A future series on Race, Religion, Royalty as institutional architecture, written with care.

Each series has:
- A landing page (e.g., `/series/malaysia-political-mechanics`).
- An intro card on each dossier explaining the series context.
- A "next in series" link at the end of each dossier.
- A series-level cite-as.

This is the structural difference between a one-off long read and a project. T4A's brand benefits from the project framing.

---

## 10. Editorial pipeline — what changes for dossiers

The existing 4-stage pipeline (Stages 1+2+3+6) was designed for ~1,300-character bite-size issues. A 5,000–8,000-word dossier needs adjustments:

1. **Phase 1 (research brief):** larger — 30–50 primary sources, not 15–25. Multiple sub-topics each with their own source list.
2. **Phase 2 (Stage 1 primary analysis):** authored section by section, not as a single card array. Each section has its own confidence tag.
3. **Phase 3 (browser prompts):** Stage 2 (Gemini bias audit) and Stage 3 (ChatGPT fact verification) need to chunk the dossier into sections to fit in their context windows. The prompt generator needs updating.
4. **Phase 4 (collect outputs):** same as before, but per-section.
5. **Phase 5 (synthesis):** Stage 6 re-verifies, with explicit tagging per section.
6. **Phase 6 (legal + accuracy + figure check):** new sub-checks for figures — every figure caption traced to primary source, every chart's underlying numbers traced.
7. **Stage 5 (Grok contrarian) re-enabled by default for dossiers.** Length and ambition increase the risk of overclaim; the contrarian stress-test is worth the extra cycle for a deep dive.

A new preamble file: `engine/templates/dossier-preamble.txt`, layered on top of `stage1-preamble.txt`, that names the dossier-specific bars (figures, citations, TOC discipline, the long-form length budget).

---

## 11. The first dossier — a concrete sketch

To make this design feel real, here is a section-by-section outline of **D001 — How New Parties Are Built in Malaysia.** Built from the two memos already on this branch.

```
1. cover     — Title + subtitle + 22 min + "What you'll learn in 5 bullets"
2. tldr      — The launch-and-pivot playbook in 7 bullets
3. chapter   — Part One: The Move
4. concept   — What "pivotal-player status" means
5. fact      — Base rates of new-party survival 1988-2024
6. timeline  — [Figure 1] Every major party launch 1951-2024
7. case      — Bersatu 2016: the textbook successful launch
8. case      — Pejuang 2020: the textbook failed launch
9. reframe   — The launch is not about you. It is about the morning after the count.
10. chapter  — Part Two: Why Malaysia
11. concept  — Lipset-Rokkan cleavages, applied
12. fact     — Six structural conditions
13. diagram  — [Figure 2] Malapportionment by constituency, EC roll
14. fact     — The Anti-Hopping Law loophole (Article 49A)
15. quote    — Excerpt of Article 49A
16. chapter  — Part Three: Sabah, the Laboratory
17. timeline — [Figure 3] Eight Sabah ruling configurations in 40 years
18. case     — GRS 2020: speed beats depth
19. diagram  — [Figure 4] Sarawak's RM3bn/year fiscal lever
20. chapter  — Part Four: Reading It as a Voter
21. concept  — The three things a launch is probably doing
22. mistake  — "They are all the same" — why this is wrong
23. mistake  — "This one is different" — why this is also wrong
24. concept  — The pivotal-player problem from your chair
25. view     — Vote by judging who will be in the room, not by judging the speech
26. further_reading — Annotated bibliography
27. cite_as  — How to cite this dossier
```

26 sections. ~6,500 words. Four figures. Estimated read time 22 minutes. Drawn entirely from material already on the branch — the dossier is a *production* of the existing research, not new research.

---

## 12. Editorial register — how the dossier reads differently

The bite-size product is *Smart Brevity* — verbs of finding, short sentences, no abstraction. A dossier is longer but should not be looser. Proposed register rules:

- Sentences slightly longer than the bite-size product (the reader has committed; they will not bounce on a 25-word sentence).
- Section openings always concrete — first 8 words name a number, a person, or a date.
- Figures referenced inline as "(Figure 4)" and the eye can find them.
- Footnote-style citations at end of section, not inline — keep the prose clean.
- One elevated word per section maximum (the same standard as `docs/research/language-quality.md` §6).
- The view card's WhatsApp-quote test still applies — the final synthesis sentence should be paste-shareable.

The tone should land between *The Economist* (compressed, authoritative, occasionally witty) and *Our World in Data* (data-driven, transparent about uncertainty). Not Stratechery (too theory-heavy). Not the *Atlantic* long read (too literary).

---

## 13. The hard questions you should answer before code

Calling these out because they compound. Each is small individually; together they decide whether the product feels coherent.

1. **Name.** Dossier? Long Read? Primer? Something else? My pick: **Dossier**.
2. **Colour.** Burgundy, vermilion, or pink? My pick: **burgundy `#7F1D1D`** with white text.
3. **Data model.** Extend Issue, or separate Dossier type? My pick: **separate Dossier**.
4. **ID scheme.** `D001` prefix, or continue the issue numbering? My pick: **`D` prefix**.
5. **First dossier scope.** Combine both memos into D001 (the political-launch playbook), or split into two dossiers (D001 strategy + D002 mechanics)? **My pick: one D001 that combines, with the mechanics integrated as Parts III–IV. The reader gets the whole picture once. Splitting risks the second one being underread.**
6. **Diagrams: SVG, PNG, or HTML components?** My pick: **all three, in that order of preference**.
7. **Series mark.** Should the first dossier explicitly say "Series 1 of the Malaysia Political Mechanics series"? My pick: **yes, but understated** — a single line on the cover, not a marketing banner.
8. **Stage-5 contrarian on dossiers.** Re-enable by default? My pick: **yes, the length increases the overclaim risk**.
9. **Distribution.** Push notification when a new dossier ships? Or hold to a separate, opt-in dossier list? My pick: **push to all subscribers, but mark "Special Edition" in the notification copy** — they signed up for the editorial product, this is its premium form.
10. **Authoring workflow.** Authored card-by-card in JSON like issues, or in Markdown with a converter? My pick: **JSON, for consistency with the existing pipeline, but with a Markdown-import script as future quality-of-life**.

---

## 14. What I am *not* recommending right now

To keep this brainstorm honest:

- **Paywall / subscription.** Tempting for long-form, but premature. Build the product, see if it earns the trust, then think about monetisation.
- **Comments.** Adds moderation cost and partisan-flame risk that contradicts T4A's brand. Direct sharing (WhatsApp, X) is enough.
- **Interactive widgets / quizzes.** Cute but expensive and doesn't ship. The diagrams are enough.
- **Audio narration.** Real demand but a separate product. Maybe in a year.
- **Translations.** Bahasa Malaysia version would multiply reach. Defer until the English product proves out.
- **A separate brand.** Some publishers spin off long-form into a sub-brand (NYT Magazine, FT Weekend). T4A is too young; one brand, one register, one trust signal.

These are deferrals, not refusals. Each is worth revisiting after 3–5 dossiers are live.

---

## 15. Next steps if you green-light the proposal

Suggested order of implementation (assuming the answers in §13 stand):

1. **Decide the answers in §13.** Quick — 10 minutes if you read this in one go.
2. **Build the data model.** `src/data/dossier-types.ts`, `src/data/dossiers/`, `src/data/dossiers.ts` loader.
3. **Build the reader components.** `DossierReader.svelte`, `DossierTOC.svelte`, `DossierFigure.svelte`, `DossierTable.svelte`, `DossierTimeline.svelte`.
4. **Build the route.** `/dossier/[id]` with section anchors.
5. **Build the feed integration.** Burgundy edge bar + DOSSIER badge on the homepage feed for dossier entries.
6. **Build the validator.** `scripts/validate-dossiers.mjs` mirrors `validate-issues.mjs` with dossier-specific checks (figures, citations, length budget per section).
7. **Build the prompt generator update.** `scripts/generate-stage-prompts.mjs` extended to chunk dossiers for Stage 2/3 review.
8. **Author D001 from the two existing memos.** This is the validation that the product works.
9. **Author Figures 1–7.** SVG / PNG to the dossier directory.
10. **Run the pipeline.** Stages 1, 2 (Gemini), 3 (ChatGPT), 5 (re-enabled Grok), 6 (synthesis), Phase 6 legal/accuracy/figure check.
11. **Publish D001.** Notify subscribers with "Special Edition" copy.
12. **Iterate.** D002 onwards refines what D001 taught us.

Estimated total work for D001 end-to-end, assuming the design choices in §13 are accepted: **3–5 days of focused build + author time**. Each subsequent dossier in the same series: **1–2 days**, because the platform amortises.

---

## 16. The single most important call

If I had to pick one design choice that decides whether this product succeeds: **do not let the dossier become a blog**. The reader's expectation must be that this is *more* structured than a regular issue, not less. The discipline that makes T4A's bite-size product good — one claim per card, every number cited, no scaffolding language, no em-dashes, anger-at-process not anger-at-people — must travel into the dossier intact, just stretched over more sections.

The risk of long-form is regression to "essay." The defence is the schema: typed sections, required figures, required citations, required TLDR, required final view. The structure is the editorial discipline.

If you read no other line of this memo, read that one.

---

*Awaiting your direction on the §13 questions before any code lands.*
