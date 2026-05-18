# Claude Design Handoff — Dossier D001 Visual Build

**For:** the Claude session that will build the front-end visual product for Dossier D001.
**From:** the editorial pipeline that produced and verified D001 (fc 90, READY_TO_PUBLISH).
**Status:** content is final. Visual build is the remaining work.

---

## How to use this document

You (the operator) will do **two things**:

1. **Upload five files** to a fresh Claude session (Claude.ai web, Claude Code, or any Claude interface that accepts file uploads).
2. **Paste the prompt** in Section B below as your message.

Then Claude Design will read the files, ask any clarifying questions, and produce the deliverables in Section D. You will then paste the deliverables back into the T4A repo per Section E.

---

## A. Files to upload

Upload **all five** of these to the Claude Design session, in this order. Paths are relative to the repo root.

| # | File | Why this file | Approx size |
|---|---|---|---|
| 1 | `src/data/dossiers/D001.json` | The dossier content — 26 sections, all final wording, design tokens, figure references | ~15 KB |
| 2 | `engine/output/dossier-D001-figures.md` | Specifications for 7 figures + cover + OG image, including chart data, image-generation prompts in the canonical T4A continuous-line style, accent colour codes, captions, and verified primary-source URLs | ~12 KB |
| 3 | `docs/research/t4a-dossier-design.md` | Visual identity decisions (burgundy `#9B2C2C`, Spectral serif typography, layout discipline, mobile/desktop reader UX, the "memorable layer" design direction) | ~30 KB |
| 4 | `engine/output/dossier-D001-stage6-synthesis.md` | Twelve-step change log documenting every editorial decision through five Stage 3 review passes. Optional but useful for Claude Design to understand the "why" behind specific wording choices | ~25 KB |
| 5 | `engine/briefs/dossier-D001-how-new-parties-are-built.md` | Research brief with 38 primary sources. Optional but useful if Claude Design needs to verify a figure's underlying citation while building it | ~18 KB |

**Total upload:** ~100 KB across five files. Well within any Claude interface's attachment limit.

### Where these files are on the branch

All five are on the branch `claude/malaysia-political-strategy-5rMDT`. You can either:
- Download them from the GitHub branch view, or
- Run `git checkout claude/malaysia-political-strategy-5rMDT` locally and grab them from the working tree.

---

## B. The prompt to paste into Claude Design

Copy everything between the two divider lines below and paste it as your first message in the Claude Design session, **after** you've attached the five files.

═══════════════════════════════════════════════════════════════════
PASTE STARTS HERE
═══════════════════════════════════════════════════════════════════

I'm building a long-form editorial product called a "Dossier" for The Fourth Angle (T4A) — a non-partisan Malaysian issues analysis platform. The content has cleared a five-pass editorial pipeline and is publication-ready. I need you to build the visual product.

## What T4A is

T4A is a static site (Astro + Svelte 5, deployed to Cloudflare Pages) that publishes short bite-size editorial cards on Malaysian public issues. The existing product is 7-card swipeable issues optimised for 60-second mobile reads. We're now launching a SECOND product called a "Dossier" — a long-form, illustrated, short-course-style deep dive marked with a distinctive burgundy accent and serif typography to signal it is the premium editorial form.

D001 — "How New Parties Are Built in Malaysia" — is the first in a series called "Malaysia Political Mechanics." 26 sections, ~6,500 words, 22-minute read, 7 figures.

## What I've attached

I've uploaded five files. Read all of them before responding:

1. **`D001.json`** — the final dossier content. 26 typed sections (cover, tldr, chapter, concept, fact, timeline, case, reframe, quote, diagram, mistake, view, further_reading, cite_as). This is the data your reader component will render.

2. **`dossier-D001-figures.md`** — specifications for all 7 figures plus cover and OG image. Each figure has either an image-generation prompt (for illustrative figures, in the canonical T4A continuous-line Picasso-style on dark navy) or a code-rendered SVG spec (for data charts and conceptual diagrams) with the actual data tables.

3. **`t4a-dossier-design.md`** — the full visual identity direction: typography (Spectral serif body, Inter UI), colour palette (dark navy `#0f0f23` background, burgundy `#9B2C2C` accent, warm white `#F4F1EB` body text), layout discipline (mobile vertical scroll, desktop three-column with sticky TOC), interactive elements (progress bar, anchor share, lightbox figures, print stylesheet), and the "memorable layer" design direction.

4. **`dossier-D001-stage6-synthesis.md`** — the editorial change log documenting every wording decision across five Stage 3 review passes. Useful when you're unsure why a particular section is worded as it is.

5. **`dossier-D001-how-new-parties-are-built.md`** — the research brief with 38 primary sources. Useful when you need to verify a figure's underlying data while building it.

## The task — build the D001 visual product

You will deliver eight things:

### B1. Data model and loader

Create the TypeScript type and loader:

- **`src/data/dossier-types.ts`** — TypeScript types matching the D001.json shape. Define `Dossier`, `DossierSection` (a discriminated union by `t` field), `DossierFigure`, `DossierSeriesMeta`, and helper types. Mirror the discipline of the existing `src/data/issue-types.ts`.
- **`src/data/dossiers.ts`** — loader that aggregates per-dossier JSONs via `import.meta.glob`, analogous to the existing `src/data/issues.ts`.

### B2. Reader components (Svelte 5)

Create these Svelte 5 components under `src/components/`:

- **`DossierReader.svelte`** — the main reader component. Renders all 26 section types. Responsive: vertical scroll on mobile, three-column on desktop (left TOC, centre reading column max-width 720px, right margin for figure expansions and sidenotes).
- **`DossierTOC.svelte`** — sticky table of contents on desktop; bottom-sheet drawer on mobile.
- **`DossierFigure.svelte`** — figure container with caption, alt text, primary-source citation, and lightbox-zoom on tap.
- **`DossierTimeline.svelte`** — renders `t: timeline` section type as a horizontal timeline (desktop) or vertical sequence (mobile). Used for the launches-timeline section.
- **`DossierTable.svelte`** — renders structured comparison tables (used for the international-comparison fig-7).
- **`DossierQuote.svelte`** — renders `t: quote` sections with proper attribution, the paraphrase note, and the editor note for Article 49A.
- **`DossierMistake.svelte`** — renders `t: mistake` sections with the visible "claim" / "correction" structure.
- **`DossierChapterBreak.svelte`** — renders chapter dividers with large burgundy numerals.
- **`DossierProgress.svelte`** — sticky top bar with reading progress, section number/total, share-section deep-link button.
- **`DossierCiteAs.svelte`** — citation block at the foot with copy-to-clipboard.

Follow the existing T4A component patterns in `src/components/` (look at `InsightReader.svelte`, `DesktopReader.svelte`, `MobileCard.svelte`). Reuse existing primitives where it makes sense.

### B3. Route

Create:

- **`src/pages/dossier/[id].astro`** — the dossier reading route. Loads from `src/data/dossiers.ts`, renders `<DossierReader>`, sets correct `<head>` metadata (Open Graph image, structured data, canonical URL `https://thefourthangle.pages.dev/dossier/D001`).

### B4. Feed integration

Add a visible "DOSSIER · D001" treatment to the homepage feed where dossiers appear alongside regular issues:

- **Burgundy left edge bar (4–6px)** on the feed card to mark dossier entries.
- **Burgundy "DOSSIER" pill badge** in the top-right of the card.
- Modify `src/components/FeedRow.svelte` (or whichever component renders feed cards) to handle the new `format: "dossier"` discriminator. Regular issues continue to render unchanged.

### B5. Figures — the seven visuals

Build the seven figures per `dossier-D001-figures.md`:

- **fig-cover** — generate the image using the prompt in the spec (single continuous white line drawing of four figures around a table, a window suggesting a distant crowd, on `#0f0f23` background, T4A signature continues the stroke). Save as `public/dossiers/D001/fig-cover.png` at 1200×630.
- **fig-1, fig-2, fig-3, fig-4, fig-5, fig-6, fig-7** — code-rendered SVGs per the data tables and styling specifications in the spec file. Save as SVGs under `public/dossiers/D001/` AND export 2x PNG fallbacks. Captions and alt text live in the dossier JSON; do not bake into the image.

For data charts (fig-2 voter bars, fig-3 SST revenue bars, fig-7 country comparison table) consider whether to render as Svelte components in code or as static SVG files in `public/`. Static SVG is more cacheable; component-rendered is more themeable. Your call — but keep the dark-navy + burgundy palette intact either way.

### B6. OG image

Generate the social-share preview at `public/dossiers/D001/og-1200x630.png` per the OG image spec in the figures file. Burgundy "DOSSIER · D001" pill at top-left, Spectral title, subtitle in muted white, the cover illustration occupying the lower-right of the frame, T4A wordmark at bottom-left, "Est. 22 min read" at top-right. 1200×630 PNG.

### B7. Design tokens and CSS

Add a stylesheet `src/styles/dossier.css` (or extend the existing global stylesheet) implementing the design tokens already declared in D001.json's `designTokens` object:

```
accent: #9B2C2C        (burgundy, the dossier mark)
accentDim: #5C0E0E     (deeper burgundy for hover/active rules)
background: #0f0f23    (existing T4A dark navy, unchanged)
bodyText: #F4F1EB      (warm white, easier on eyes for long reads)
mutedText: #9CA3AF     (sidenotes, captions, citations)
ruleColor: #3F1212     (thin horizontal rules between sections)
fontBody: Spectral, Source Serif Pro, Georgia, serif
fontUI: Inter, system-ui, sans-serif
fontMono: JetBrains Mono, IBM Plex Mono, monospace
```

Load Spectral and Inter from Google Fonts or self-host (T4A already has a font budget — check `scripts/check-font-budget.mjs` for the limit before adding new families). If Spectral pushes the budget over, fall back to a system serif (Georgia or `ui-serif`) and document the choice.

### B8. Validation script

Create:

- **`scripts/validate-dossiers.mjs`** — analogue of the existing `scripts/validate-issues.mjs`. Walks every dossier JSON in `src/data/dossiers/` and validates: required fields present, section types valid, figures referenced exist as files, citations present where required, no banned terms (the stealth check from CLAUDE.md), word counts plausible.

Add it to the build pipeline in `package.json` so `npm run build` runs `validate-dossiers` after `validate-issues`.

## Acceptance criteria

The build is done when:

- [ ] `npm run dev` starts cleanly with no Astro or Svelte errors.
- [ ] Visiting `/dossier/D001` on mobile (375px viewport) renders the full dossier in a single vertical scroll with a sticky top progress bar and a bottom-sheet TOC.
- [ ] Visiting `/dossier/D001` on desktop (1440px+ viewport) renders a three-column layout: left TOC sticky, centre reading column max 720px, right margin holding figure expansions and citations.
- [ ] All seven figures load and render legibly at retina resolution.
- [ ] The cover illustration matches the canonical T4A continuous-line style on dark navy.
- [ ] Sharing the URL on WhatsApp or Twitter shows the OG image with the burgundy "DOSSIER · D001" mark.
- [ ] The homepage feed shows D001 with the burgundy edge bar and DOSSIER pill badge, alongside regular issues unchanged.
- [ ] Print stylesheet produces a clean A4-printable version.
- [ ] `npm run validate-dossiers` passes with zero errors.
- [ ] No accessibility regressions — every figure has alt text, all rendered text passes WCAG AA contrast on the dark navy background.
- [ ] The dossier respects the user's `prefers-reduced-motion` setting (no scroll-driven animations if it's set).

## Code conventions

- **Svelte 5** with `<script lang="ts">` runes syntax (`$state`, `$derived`, `$effect`). Look at existing components for the in-repo style.
- **Astro static output** — the dossier route must build at compile time, not require client-side data fetching.
- **No new dependencies** without checking the existing `package.json` first. T4A intentionally minimises dependencies.
- **Existing component patterns** — when in doubt, mirror the approach in `InsightReader.svelte` or `DesktopReader.svelte`.
- **No client-side analytics or trackers.** T4A is privacy-first.

## Editorial guardrails

These are non-negotiable from the editorial side and must not be broken by visual choices:

1. **No AI references anywhere in user-facing UI** — no "AI-generated," no "powered by," no model names. Use "multi-stage editorial review" if the editorial process is referenced anywhere in the UI.
2. **The burgundy accent is the dossier mark.** Use it sparingly: badges, rule lines, drop caps, pull-quote borders, primary chart fills. Do not use it for body text (white on navy stays).
3. **The Article 49A quote section has an `editorNote` field.** Render this as a subtle italic note below the paraphrase, in muted text — visible to readers, not hidden in a tooltip. Editorial transparency is part of the brand.
4. **Citations are required visible** — every figure and every `fact` section with citations renders them below the content, not in a hover or modal.

## Where to ask questions

If anything in the data, figures spec, or design direction is ambiguous, ask me before guessing. Specific things you might need to clarify:

- Whether to render fig-7's international comparison table as a Svelte component or a static SVG.
- Whether the dossier feed entries should appear inline with regular issues or in a separate "Dossiers" sub-section.
- Whether to ship D001 as a soft-launch (visible only via direct URL) or wide-launch (linked from homepage) — this affects the feed integration scope.

I will answer each before you proceed.

## Deliverables format

When you're done, give me:

1. A list of every file you created or modified, with path.
2. The diff or paste-ready content for each.
3. A short test plan I can walk through to verify before merging to main.

═══════════════════════════════════════════════════════════════════
PASTE ENDS HERE
═══════════════════════════════════════════════════════════════════

---

## C. What Claude Design will likely ask

Anticipating clarifying questions so you have answers ready:

| Question | Answer to give |
|---|---|
| "Should D001 appear on the homepage feed or only via direct URL?" | Soft-launch first — visible at the URL but not yet linked from homepage. Add to feed in a follow-up after a 48-hour soak-test. |
| "Should I add a 'Save for later' button on dossiers?" | Yes — match the existing SaveButton.svelte behaviour. Dossiers are exactly the kind of content readers save. |
| "Spectral pushes the font budget over the limit. Fall back?" | Yes, fall back to Georgia or `ui-serif`. Document the choice in a code comment. |
| "Should the figure captions appear above or below the figure?" | Below, in muted white, smaller font. Caption → source citation on a new line. |
| "Do you want the URL slug `/dossier/D001` or `/dossier/D001-how-new-parties-are-built-in-malaysia`?" | The longer slug for SEO. Set the canonical URL accordingly. |
| "Reading time auto-calculated or use the JSON's `estReadMinutes`?" | Use the JSON value (22 minutes). It was set deliberately based on the content. |
| "Should I add comments/reactions to dossiers?" | No. T4A is comment-free by editorial decision (in the design doc). |

---

## D. Expected deliverables from Claude Design

Claude Design should hand back a comprehensive set of artefacts. Here's the checklist to verify against before you accept:

### Files created
- [ ] `src/data/dossier-types.ts`
- [ ] `src/data/dossiers.ts`
- [ ] `src/components/DossierReader.svelte`
- [ ] `src/components/DossierTOC.svelte`
- [ ] `src/components/DossierFigure.svelte`
- [ ] `src/components/DossierTimeline.svelte`
- [ ] `src/components/DossierTable.svelte`
- [ ] `src/components/DossierQuote.svelte`
- [ ] `src/components/DossierMistake.svelte`
- [ ] `src/components/DossierChapterBreak.svelte`
- [ ] `src/components/DossierProgress.svelte`
- [ ] `src/components/DossierCiteAs.svelte`
- [ ] `src/pages/dossier/[id].astro`
- [ ] `src/styles/dossier.css` (or equivalent additions to global)
- [ ] `scripts/validate-dossiers.mjs`
- [ ] `public/dossiers/D001/fig-cover.png` (1200×630)
- [ ] `public/dossiers/D001/fig-1.svg` through `fig-7.svg`
- [ ] `public/dossiers/D001/fig-1@2x.png` through `fig-7@2x.png`
- [ ] `public/dossiers/D001/og-1200x630.png`

### Files modified
- [ ] `src/components/FeedRow.svelte` (or feed-card component) — burgundy edge bar + DOSSIER pill for dossier entries
- [ ] `package.json` — `validate-dossiers` added to the build pipeline
- [ ] Any global stylesheet to register the burgundy/Spectral design tokens

### Documentation handed back
- [ ] List of every file created/modified
- [ ] Test plan walking the acceptance criteria
- [ ] Screenshots (mobile + desktop) for visual sign-off
- [ ] Notes on any deviations from the spec, with rationale

---

## E. How to integrate the deliverables back into the repo

Once Claude Design hands back the files:

1. **Save each file** to its specified path in your working tree. If Claude Design returns inline content, copy it into the file. If it returns a patch/diff, apply with `git apply`.
2. **Run the build locally**:
   ```bash
   npm install              # if any new deps were added
   npm run dev              # start the dev server
   ```
3. **Walk the acceptance criteria** (Section B above) one by one. Take screenshots on mobile (375px Chrome devtools) and desktop (1440px).
4. **Run the validators**:
   ```bash
   npm run validate-dossiers
   npm run validate         # existing issue validator should still pass
   npm run build            # full production build
   ```
5. **Run the stealth check** on the build output:
   ```bash
   grep -riE 'claude|gpt|chatgpt|gemini|grok|deepseek|anthropic|openai|llm|language model|artificial intelligence' dist/ | grep -v node_modules
   ```
   Expect zero matches in `dist/`.
6. **Visual QA**:
   - Open `/dossier/D001` on a real mobile device, not just devtools. Reading flow matters.
   - Verify the seven figures load and read clearly at retina resolution.
   - Share the URL to WhatsApp and confirm the OG preview shows the burgundy mark.
   - Print to PDF and check the print stylesheet produces a clean document.
7. **Commit and push**:
   ```bash
   git add -A
   git commit -m "Build D001 dossier visual product — reader, components, figures, route, feed integration"
   git push origin claude/malaysia-political-strategy-5rMDT
   ```
8. **Merge to main** when satisfied. The existing GitHub Actions deploy pipeline will publish the dossier to Cloudflare Pages.

---

## F. Common failure modes to watch for

When you review the Claude Design output, scan specifically for:

- **Layout drift on small mobile** (≤360px). Long dossiers fail first on narrow viewports.
- **Figure SVGs not rendering on Safari**. SVG support is mostly fine but some advanced features (e.g., `<foreignObject>` for HTML inside SVG) break in WebKit. Stick to plain SVG primitives.
- **Spectral webfont loading flash**. If the serif loads after the page renders, the first read is jarring. Either preload it or use `font-display: swap` with a matching-metric fallback.
- **TOC scroll-spy off by one section** — common Intersection Observer bug. Test by scrolling through and watching which TOC item is highlighted at each section.
- **Print stylesheet absent**. Easy to forget. Long dossiers do get printed.
- **Editorial drift** — Claude Design occasionally "improves" wording during component-building. The dossier text in D001.json is final and verified through five Stage 3 passes. Any text change is a regression. Verify with a diff of the rendered text against the JSON source.

---

## G. After D001 ships

Once D001 is live and visible at the URL:

1. Soak-test 48 hours. Watch for reader feedback, broken links, render issues across browsers.
2. Add the homepage feed link (the burgundy edge-bar treatment from B4).
3. Consider whether to push notification subscribers about the first dossier (the worker in `workers/notify/` can do this; the runbook in CLAUDE.md describes the Tue/Thu/Sat cadence).
4. Begin **D002 — Coalition Fragmentation and the Sheraton Move** using the same pipeline. The Stage 5.1 supplementary material on the Sheraton Move (`engine/output/dossier-D001-stage5.1-sheraton-deepdive.md`) is the starter research.

---

## H. One-line summary if you have to brief Claude Design verbally

"Build the visual product for a 26-section editorial dossier called D001. Read the five attached files. Deliver Svelte 5 components, an Astro route, seven figures, an OG image, and a validator. The visual identity is burgundy `#9B2C2C` accent on dark navy `#0f0f23`, Spectral serif body. Do not change any text in D001.json — it's final and verified. The full task spec, file list, and acceptance criteria are in the document I'm pasting."

That sentence plus the attached files plus the prompt in Section B is the complete handoff.
