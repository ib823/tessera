<!--
  DossierLightbox.svelte
  ---------------------------------------------------------------
  Click-to-zoom figure modal.

  Mounted once by DossierReader. Stays in the DOM; toggles `is-open`.
  Escape closes. Clicking the backdrop closes. Inner click is stopped
  so the user can pan/select within the zoomed figure.

  The lightbox renders the figure CONTENT passed as a snippet by the
  parent. We deliberately don't re-mount the inner SVG component —
  the parent passes the same component instance via {@render}.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { DossierFigure } from '../data/dossier-types';

  interface Props {
    figure: DossierFigure | null;
    caption?: string;
    sourceLine?: string;
    open: boolean;
    onClose: () => void;
    children?: Snippet;
  }

  let { figure, caption, sourceLine, open, onClose, children }: Props = $props();

  $effect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose();
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
      };
    }
  });

  function backdrop() {
    onClose();
  }
  function inner(e: MouseEvent) {
    e.stopPropagation();
  }
</script>

<div
  class="lightbox"
  class:is-open={open}
  role="dialog"
  aria-modal="true"
  aria-label={figure?.alt ?? ''}
  aria-hidden={!open}
  onclick={backdrop}
>
  <button
    type="button"
    class="lightbox__close"
    onclick={onClose}
    aria-label="Close zoomed figure"
  >
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6">
      <line x1="3" y1="3" x2="13" y2="13" />
      <line x1="13" y1="3" x2="3" y2="13" />
    </svg>
  </button>

  <div class="lightbox__inner" role="document" onclick={inner}>
    <div class="lightbox__frame">
      {@render children?.()}
    </div>
    {#if caption}
      <p class="lightbox__caption">
        {#if figure}<strong style:color="#9B2C2C">{figure.title} — </strong>{/if}
        {caption}
      </p>
    {/if}
    {#if sourceLine}
      <p class="figure__source">{sourceLine}</p>
    {/if}
  </div>
</div>
