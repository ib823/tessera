<!--
  DossierFigure.svelte
  ---------------------------------------------------------------
  Wrapper for a single figure (data chart, illustration, diagram).
  Provides the dark navy frame, the caption block, the source line,
  the focus-ring, and the click-to-zoom handle.

  Children pass their SVG as the default slot. The wrapper is dumb;
  it doesn't know what figure it's rendering. DossierReader keys
  off `figure.id` to mount the right inner component.

  Click + Enter/Space opens the parent's lightbox via the dispatched
  `zoom` event. Lightbox itself lives in DossierLightbox.svelte and
  is mounted once at the reader level.

  Accessibility:
  • The frame is a `button` so it's keyboard focusable.
  • alt text is rendered as the figure's accessible name via aria-label.
  • Caption + source are not "alt" — they're separate visible text.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { DossierFigure } from '../data/dossier-types';

  interface Props {
    figure: DossierFigure;
    caption?: string;
    sourceLine?: string;
    onZoom?: (fig: DossierFigure) => void;
    children?: Snippet;
  }

  let { figure, caption, sourceLine, onZoom, children }: Props = $props();

  function handleZoom() {
    onZoom?.(figure);
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleZoom();
    }
  }
</script>

<figure class="figure" id={figure.id} data-figure-id={figure.id}>
  <div
    class="figure__frame"
    role="button"
    tabindex="0"
    aria-label="{figure.alt}. Activate to zoom."
    onclick={handleZoom}
    onkeydown={handleKey}
  >
    {@render children?.()}
    <span class="figure__zoom" aria-hidden="true">
      <!-- inline expand glyph -->
      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4">
        <path d="M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3" />
      </svg>
    </span>
  </div>

  {#if caption}
    <figcaption class="figure__caption">
      <strong>{figure.title.replace(/^Figure\s+/i, 'Figure ')}</strong>
      {caption}
    </figcaption>
  {/if}

  {#if sourceLine}
    <p class="figure__source">{sourceLine}</p>
  {/if}
</figure>
