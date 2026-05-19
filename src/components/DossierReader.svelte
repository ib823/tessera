<!--
  DossierReader.svelte
  ===============================================================
  The main dossier reading component. Renders every section type,
  manages the three-column layout, the sticky progress bar, the
  TOC (rail on desktop, sheet on mobile), and the figure lightbox.

  Section rendering: switches on `section.t` and mounts the right
  per-type sub-component. Figures are rendered inline below the
  prose for sections that carry a `figure` ref; figure id maps to
  the right SVG component via FIGURE_COMPONENTS.

  Editorial note: fig-6 (international comparisons) does NOT have
  a textual anchor section in the D001 content — it sits as a
  freestanding comparative figure at the end of Part Two, after
  the Article 49A quote and before the Part Three chapter break.
  That placement is hardcoded below; the comment marks the seam.

  Progress + active-section tracking:
  • IntersectionObserver fires when each section crosses the
    "anchor line" (60px below the progress bar). The most recent
    intersecting section wins.
  • Progress is window scrollY / (scrollHeight - viewport).
  • Both are throttled via requestAnimationFrame.

  All scroll listeners short-circuit when prefers-reduced-motion
  is set (the active-section tracker still runs, but smooth-scroll
  on anchor jump becomes instant).
-->
<script lang="ts">
  import type {
    Dossier,
    DossierSection,
    DossierFigure as FigureRecord,
  } from '../data/dossier-types';
  import { COUNTED_SECTION_TYPES, isCover } from '../data/dossier-types';

  import DossierProgress from './DossierProgress.svelte';
  import DossierTOC from './DossierTOC.svelte';
  import DossierLightbox from './DossierLightbox.svelte';
  import DossierFigure from './DossierFigure.svelte';
  import DossierChapterBreak from './DossierChapterBreak.svelte';
  import DossierTimeline from './DossierTimeline.svelte';
  import DossierMistake from './DossierMistake.svelte';
  import DossierQuote from './DossierQuote.svelte';
  import DossierCiteAs from './DossierCiteAs.svelte';
  import DossierTable from './DossierTable.svelte';

  // Figure components
  // fig-cover used to have a placeholder Svelte (DossierFigCover); it's
  // removed now that the real PNG is in place and routed via <img>.
  import DossierFig1Shapley from './figures/DossierFig1Shapley.svelte';
  import DossierFig3Brokerage from './figures/DossierFig3Brokerage.svelte';
  import DossierFig4VoterBars from './figures/DossierFig4VoterBars.svelte';
  import DossierFig5AntiHop from './figures/DossierFig5AntiHop.svelte';
  import DossierFig7Sarawak from './figures/DossierFig7Sarawak.svelte';

  // Map figure-id → Svelte component (for inline render & lightbox).
  // When a figure has both a registered component AND a raster src, the
  // component wins — components that load their own raster (e.g. fig-5
  // which mounts /dossiers/D001/fig-5-bg.png internally and overlays
  // captions) need to render the wrapper, not the bare <img>.
  // fig-2 is rendered by DossierTimeline directly (the timeline IS fig-2).
  // fig-6 is rendered by DossierTable using FIG6_DATA below.
  // fig-cover has no entry — it routes to the raster <img> branch.
  const FIGURE_COMPONENTS: Record<string, any> = {
    'fig-1': DossierFig1Shapley,
    'fig-3': DossierFig3Brokerage,
    'fig-4': DossierFig4VoterBars,
    'fig-5': DossierFig5AntiHop,
    'fig-7': DossierFig7Sarawak,
  };

  const FIG6_HEADERS = [
    'Country',
    'Electoral threshold',
    'Public party funding',
    'Anti-hop rule',
    'New-party launches',
  ];
  const FIG6_ROWS: string[][] = [
    ['Malaysia', 'None (FPTP)', 'None', 'Individual-only (2022)', 'High — every cycle'],
    ['Germany', '5% national', 'Yes, vote-share tied', 'Floor-crossing free', 'Rare — Greens 1980, AfD 2013'],
    ['United Kingdom', 'None (FPTP)', '"Short money" — opposition only', 'Floor-crossing free', 'Rare — SDP 1981, Reform 2018+'],
    ['Indonesia', 'Verification thresholds', 'Limited', 'Strict re-registration', 'Moderate'],
    ['Israel', '3.25%', 'Yes', 'Strict', 'High — list PR + personalism'],
    ['Italy', 'None / coalition', 'Yes', 'Floor-crossing free', 'High — Forza Italia 1994, M5S 2009'],
  ];

  interface Props {
    dossier: Dossier;
  }

  let { dossier }: Props = $props();

  /* ---------------------------- helpers ---------------------------- */

  function figureById(id: string): FigureRecord | null {
    return dossier.figures.find((f) => f.id === id) ?? null;
  }

  // Split a body string on blank lines into discrete paragraphs.
  // Enables rhythm-varied prose — short hammer sentences alongside
  // longer argumentative blocks — without changing the data shape.
  function splitParagraphs(body: string): string[] {
    return body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  }

  /* ---------------------- counted-section index --------------------- */
  // Pre-compute a 1-indexed reading-order number per section id, used
  // for the section gutter labels and the progress bar denominator.

  const countedIds = $derived(
    dossier.sections.filter((s) => COUNTED_SECTION_TYPES.includes(s.t)).map((s) => s.id)
  );
  const sectionTotal = $derived(countedIds.length);
  const sectionNumberMap = $derived.by(() => {
    const m = new Map<string, number>();
    countedIds.forEach((id, i) => m.set(id, i + 1));
    return m;
  });

  /* ---------------------- progress + active id --------------------- */

  let progress = $state(0);
  let activeId = $state<string>(dossier.sections[0]?.id ?? '');
  let sheetOpen = $state(false);

  function scheduleProgress() {
    if (typeof window === 'undefined') return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress = max <= 0 ? 0 : window.scrollY / max;
  }

  $effect(() => {
    if (typeof window === 'undefined') return;

    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scheduleProgress();
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    scheduleProgress();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  });

  $effect(() => {
    if (typeof window === 'undefined') return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('.reading [data-section-anchor]')
    );
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to (but above) the trigger line.
        let best: { id: string; top: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = (e.target as HTMLElement).dataset.sectionAnchor || '';
          const top = e.boundingClientRect.top;
          if (!best || Math.abs(top) < Math.abs(best.top)) best = { id, top };
        }
        if (best) activeId = best.id;
      },
      {
        rootMargin: '-72px 0px -65% 0px',
        threshold: [0, 0.1, 0.5, 1],
      }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });

  let sectionIndex = $derived(sectionNumberMap.get(activeId) ?? 1);

  /* ---------------------- lightbox state --------------------- */

  let lightboxFigure = $state<FigureRecord | null>(null);
  let lightboxOpen = $state(false);

  function openLightbox(fig: FigureRecord) {
    lightboxFigure = fig;
    lightboxOpen = true;
  }
  function closeLightbox() {
    lightboxOpen = false;
  }

  /* ---------------------- TOC handlers --------------------- */

  function toggleSheet() {
    sheetOpen = !sheetOpen;
  }
  function onJump() {
    sheetOpen = false;
  }

  /* ---------------------- citation rendering helper --------------------- */

  function renderCitations(citations: string[] | undefined) {
    if (!citations || citations.length === 0) return null;
    return citations;
  }
</script>

<!-- ============================== shell ============================== -->

<DossierProgress
  title={dossier.title}
  dossierId={dossier.id}
  sectionIndex={sectionIndex}
  sectionTotal={sectionTotal}
  progress={progress}
  onToggleToc={toggleSheet}
/>

<div class="shell">
  <article class="dossier" aria-labelledby="dossier-title">
    <!-- ===================== left rail TOC (desktop) ===================== -->
    <DossierTOC
      sections={dossier.sections}
      activeId={activeId}
      variant="rail"
      onJump={onJump}
    />

    <!-- ===================== reading column ===================== -->
    <main class="reading">
      {#each dossier.sections as section, i (section.id)}
        {@const n = sectionNumberMap.get(section.id)}

        <!-- COVER -->
        {#if section.t === 'cover'}
          <section
            class="section cover"
            id={section.id}
            data-section-type="cover"
            data-section-anchor={section.id}
          >
            <p class="cover__series">
              <span class="cover__series-meta">{section.seriesMark}</span>
            </p>
            <h1 class="cover__title" id="dossier-title">{section.title}</h1>
            <p class="cover__subtitle">{section.subtitle}</p>

            <div class="cover__meta">
              <span class="cover__meta-item">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 4v4l3 2" />
                </svg>
                <strong>Est. {section.estReadMinutes} min</strong>
              </span>
              <span class="cover__meta-item">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                  <path d="M2 4h12M2 8h12M2 12h8" />
                </svg>
                <strong>{dossier.wordCount.toLocaleString()} words</strong>
              </span>
              <span class="cover__meta-item">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                  <rect x="2" y="3" width="12" height="11" rx="1" />
                  <path d="M5 1v3M11 1v3M2 7h12" />
                </svg>
                <strong>Published {new Date(dossier.sourceDate).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
              </span>
              <span class="cover__meta-item">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                  <path d="M3 3h10v10H3z" />
                  <path d="M3 6h10M6 3v10" />
                </svg>
                <strong>{dossier.primaryLens} lens</strong>
              </span>
            </div>

            <p class="cover__promise-label">What you'll learn</p>
            <ol class="cover__promise">
              {#each section.whatYoullLearn as point}
                <li>{point}</li>
              {/each}
            </ol>

            <!-- Hero figure (cover illustration / placeholder) -->
            {#if section.heroFigure}
              {@const fig = figureById(section.heroFigure)}
              {#if fig}
                <div style:margin-top="56px">
                  <DossierFigure figure={fig} caption={fig.caption} sourceLine={fig.sourceLine} onZoom={openLightbox}>
                    {@const Comp = FIGURE_COMPONENTS[fig.id]}
                    {@const isRaster = /\.(png|jpe?g|webp|avif|gif)$/i.test(fig.src ?? '')}
                    {#if Comp}
                      <Comp />
                    {:else if isRaster && fig.src}
                      <img
                        src={fig.src}
                        alt={fig.alt}
                        loading="eager"
                        decoding="async"
                        width="1200"
                        height="630"
                        style:width="100%"
                        style:height="auto"
                        style:display="block"
                      />
                    {/if}
                  </DossierFigure>
                </div>
              {/if}
            {/if}
          </section>

        <!-- TLDR -->
        {:else if section.t === 'tldr'}
          <section
            class="section tldr-wrap"
            id={section.id}
            data-section-type="tldr"
            data-section-anchor={section.id}
          >
            <div class="tldr">
              <p class="tldr__label">The dossier in 7 lines</p>
              <h2 class="tldr__title">{section.title}</h2>
              <ol class="tldr__list">
                {#each section.bullets as bullet}
                  <li>{bullet}</li>
                {/each}
              </ol>
            </div>
          </section>

        <!-- CHAPTER -->
        {:else if section.t === 'chapter'}
          <div data-section-anchor={section.id}>
            <DossierChapterBreak section={section} />
          </div>

        <!-- CONCEPT, FACT, CASE — prose blocks (with optional figure anchor) -->
        {:else if section.t === 'concept' || section.t === 'fact' || section.t === 'case'}
          <section
            class="section prose-block"
            class:concept-section={section.t === 'concept'}
            id={section.id}
            data-section-type={section.t}
            data-section-anchor={section.id}
          >
            {#if n}<div class="section__num" aria-hidden="true">{String(n).padStart(2, '0')}</div>{/if}
            <a href="#{section.id}" class="section__anchor" aria-label="Permalink to this section">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                <path d="M7 9a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2L8 4M9 7a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2L8 12" />
              </svg>
            </a>
            <p class="section__kind">{section.t === 'concept' ? 'Concept' : section.t === 'fact' ? 'Fact' : 'Case'}</p>
            {#if section.t === 'fact'}<span class="lens">{section.lens}</span>{/if}
            <h2 class="section__title">{section.title}</h2>
            <div class="section__body drop-cap-allowed">
              {#each splitParagraphs(section.body) as para}
                <p>{para}</p>
              {/each}
            </div>

            {#if section.citations && section.citations.length}
              <div class="citations">
                <span class="citations__label">Sources</span>
                {#each section.citations as cite}
                  <span class="citations__item">{cite}</span>
                {/each}
              </div>
            {/if}

            {#if section.figure}
              {@const fig = figureById(section.figure)}
              {#if fig && FIGURE_COMPONENTS[fig.id]}
                {@const Comp = FIGURE_COMPONENTS[fig.id]}
                <DossierFigure figure={fig} caption={fig.caption} sourceLine={fig.sourceLine} onZoom={openLightbox}>
                  <Comp />
                </DossierFigure>
              {/if}
            {/if}
          </section>

        <!-- TIMELINE — renders fig-2 inline as part of the section markup. -->
        {:else if section.t === 'timeline'}
          <div data-section-anchor={section.id}>
            <DossierTimeline section={section} n={n} />
          </div>

        <!-- REFRAME -->
        {:else if section.t === 'reframe'}
          <section
            class="section reframe-wrap"
            id={section.id}
            data-section-type="reframe"
            data-section-anchor={section.id}
          >
            <blockquote class="reframe">{section.body}</blockquote>
          </section>

        <!-- DIAGRAM — figure-first section. Body prose follows the figure. -->
        {:else if section.t === 'diagram'}
          {@const fig = figureById(section.figure)}
          <section
            class="section prose-block diagram"
            id={section.id}
            data-section-type="diagram"
            data-section-anchor={section.id}
          >
            {#if n}<div class="section__num" aria-hidden="true">{String(n).padStart(2, '0')}</div>{/if}
            <p class="section__kind">{fig ? fig.title.replace(/\s+—.*$/, '') : 'Figure'}</p>
            <h2 class="section__title">{section.title}</h2>

            {#if fig && FIGURE_COMPONENTS[fig.id]}
              {@const Comp = FIGURE_COMPONENTS[fig.id]}
              <DossierFigure figure={fig} caption={fig.caption} sourceLine={fig.sourceLine} onZoom={openLightbox}>
                <Comp />
              </DossierFigure>
            {/if}

            <div class="section__body">
              {#each splitParagraphs(section.body) as para}
                <p>{para}</p>
              {/each}
            </div>

            {#if section.citations && section.citations.length}
              <div class="citations">
                <span class="citations__label">Sources</span>
                {#each section.citations as cite}
                  <span class="citations__item">{cite}</span>
                {/each}
              </div>
            {/if}
          </section>

        <!-- QUOTE -->
        {:else if section.t === 'quote'}
          <div data-section-anchor={section.id}>
            <DossierQuote section={section} n={n} />
          </div>

          <!-- ────────────────────────────────────────────────────────
               fig-6 (international comparison) has no textual anchor
               in the editorial content. Inserted here as a freestanding
               comparative reference, immediately after the Article 49A
               quote — thematic adjacency to the legal-context block.
               If the editorial layout changes, move this insert too.
               ──────────────────────────────────────────────────────── -->
          {#if section.id === 'article-49a-text'}
            {@const fig6 = figureById('fig-6')}
            {#if fig6}
              <figure class="figure" id="fig-6">
                <div class="figure__frame" style:cursor="default" style:padding="20px 22px">
                  <p class="section__kind" style:margin-bottom="6px">Figure 6 · International comparison</p>
                  <DossierTable
                    headers={FIG6_HEADERS}
                    rows={FIG6_ROWS}
                    caption={fig6.alt}
                  />
                </div>
                <figcaption class="figure__caption">
                  <strong>{fig6.title}</strong>
                  {fig6.caption}
                </figcaption>
                {#if fig6.sourceLine}
                  <p class="figure__source">{fig6.sourceLine}</p>
                {/if}
              </figure>
            {/if}
          {/if}

        <!-- MISTAKE -->
        {:else if section.t === 'mistake'}
          <div data-section-anchor={section.id}>
            <DossierMistake section={section} n={n} />
          </div>

        <!-- VIEW (editorial close) -->
        {:else if section.t === 'view'}
          <section
            class="section view"
            id={section.id}
            data-section-type="view"
            data-section-anchor={section.id}
          >
            {#if n}<div class="section__num" aria-hidden="true">{String(n).padStart(2, '0')}</div>{/if}
            <p class="view__label">The view</p>
            <div class="view__body">
              {#each section.body.split(/\n\n+/) as para}
                <p>{para}</p>
              {/each}
            </div>
          </section>

        <!-- FURTHER READING -->
        {:else if section.t === 'further_reading'}
          <section
            class="section further-reading"
            id={section.id}
            data-section-type="further_reading"
            data-section-anchor={section.id}
          >
            {#if n}<div class="section__num" aria-hidden="true">{String(n).padStart(2, '0')}</div>{/if}
            <p class="section__kind">Annotated bibliography</p>
            <h2 class="section__title">{section.title}</h2>

            {#each Array.from(new Set(section.items.map((i) => i.category))) as cat}
              <div class="further-reading__group">
                <p class="further-reading__group-label">{cat}</p>
                <ul class="further-reading__list">
                  {#each section.items.filter((i) => i.category === cat) as item}
                    <li>
                      <div class="further-reading__title">
                        {#if item.url}
                          <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                        {:else}
                          {item.title}
                        {/if}
                      </div>
                      <div class="further-reading__note">{item.note}</div>
                    </li>
                  {/each}
                </ul>
              </div>
            {/each}
          </section>

        <!-- CITE AS -->
        {:else if section.t === 'cite_as'}
          <div data-section-anchor={section.id}>
            <DossierCiteAs section={section} />
          </div>
        {/if}
      {/each}

      <div class="end-rule"></div>
      <p class="end-rule__caption">End of dossier</p>
    </main>

    <!-- ===================== right margin rail ===================== -->
    <aside class="margin-rail" aria-label="Dossier marginalia">
      <div class="margin-rail__sticky">
        <p class="margin-rail__label">In this dossier</p>
        <p style:font-family="var(--font-body)" style:font-style="italic" style:font-size="14px" style:color="var(--body)" style:line-height="1.55">
          {dossier.series.name} —
          <span style:color="var(--accent)">Dossier {dossier.series.ordinal} of the series.</span>
        </p>
        <p style:font-family="var(--font-ui)" style:font-size="12px" style:color="var(--muted)" style:line-height="1.55" style:margin-top="20px">
          Published after a {dossier.stageScoresNote ? 'multi-stage editorial review' : 'review'}. Every figure has a primary-source citation visible below it. Every fact section names its sources.
        </p>

        <div style:margin-top="32px" style:padding-top="20px" style:border-top="1px solid var(--rule)">
          <p class="margin-rail__label">Citation</p>
          <p style:font-family="var(--font-mono)" style:font-size="11px" style:line-height="1.6" style:color="var(--muted)">
            T4A ({new Date(dossier.sourceDate).getFullYear()}). {dossier.title}. Dossier {dossier.id}.
          </p>
        </div>
      </div>
    </aside>
  </article>
</div>

<!-- ===================== mobile TOC sheet ===================== -->
<DossierTOC
  sections={dossier.sections}
  activeId={activeId}
  variant="sheet"
  open={sheetOpen}
  onJump={onJump}
/>

<!-- ===================== lightbox ===================== -->
<DossierLightbox
  figure={lightboxFigure}
  caption={lightboxFigure?.caption}
  sourceLine={lightboxFigure?.sourceLine}
  open={lightboxOpen}
  onClose={closeLightbox}
>
  {#if lightboxFigure}
    {@const Comp = FIGURE_COMPONENTS[lightboxFigure.id]}
    {@const isRasterLB = /\.(png|jpe?g|webp|avif|gif)$/i.test(lightboxFigure.src ?? '')}
    {#if Comp}
      <Comp />
    {:else if isRasterLB && lightboxFigure.src}
      <img
        src={lightboxFigure.src}
        alt={lightboxFigure.alt}
        loading="eager"
        decoding="async"
        style:width="100%"
        style:height="auto"
        style:max-height="92vh"
        style:object-fit="contain"
        style:display="block"
      />
    {/if}
  {/if}
</DossierLightbox>
