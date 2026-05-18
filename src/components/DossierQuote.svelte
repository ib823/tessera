<!--
  DossierQuote.svelte
  ---------------------------------------------------------------
  Block quote with attribution, commentary, and a visible inline
  editor note.

  Editorial discipline from the brief:
  • The editorNote is REQUIRED to be visible on first scroll. Not
    a tooltip, not a popover. We render it directly below the
    commentary with a small burgundy "Editor note:" prefix label.
  • The paraphrase note carries when Article 49A's body says
    "Paraphrase pending editor verification…" — readers see the
    editorial seam, which is the brand.
-->
<script lang="ts">
  import type { DossierQuoteSection } from '../data/dossier-types';

  interface Props {
    section: DossierQuoteSection;
    n?: number;
  }

  let { section, n }: Props = $props();
</script>

<section
  class="section quote"
  id={section.id}
  data-section-type="quote"
>
  {#if n != null}
    <div class="section__num" aria-hidden="true">{String(n).padStart(2, '0')}</div>
  {/if}
  <p class="quote__source">{section.source}</p>
  <blockquote class="quote__body" cite={section.source}>
    {section.body}
  </blockquote>

  {#if section.commentary}
    <p class="quote__commentary">{section.commentary}</p>
  {/if}

  {#if section.editorNote}
    <aside class="quote__editor-note" role="note">
      <span class="quote__editor-note-label">Editor note:</span>
      {section.editorNote}
    </aside>
  {/if}
</section>
