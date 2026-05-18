<!--
  DossierMistake.svelte
  ---------------------------------------------------------------
  Renders `t: 'mistake'` sections — a common misconception named
  visibly and corrected. Editorial intent: the wrong claim is
  shown, struck through; the correction sits below it.

  Accessible: the claim is announced as a quotation; the correction
  is announced as a clarification. Screen-readers read the strike
  via the `text-decoration` style; we annotate explicitly with
  the visible "Claim" / "Correction" labels so the relationship is
  obvious without sight.
-->
<script lang="ts">
  import type { DossierMistakeSection } from '../data/dossier-types';

  interface Props {
    section: DossierMistakeSection;
    n?: number;
  }

  let { section, n }: Props = $props();
</script>

<section
  class="section mistake"
  id={section.id}
  data-section-type="mistake"
>
  {#if n != null}
    <div class="section__num" aria-hidden="true">{String(n).padStart(2, '0')}</div>
  {/if}
  <div class="mistake__claim">
    <span class="mistake__claim-tag">Claim</span>
    <q class="mistake__claim-text">{section.claim}</q>
  </div>
  <div class="mistake__correction">
    <span class="mistake__correction-tag">Why it's wrong</span>
    <p class="mistake__correction-text">{section.correction}</p>
  </div>
</section>
