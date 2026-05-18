<!--
  DossierChapterBreak.svelte
  ---------------------------------------------------------------
  Section divider with a large burgundy roman/arabic numeral and
  Part / Subtitle pair. Used for `t: 'chapter'` sections.

  No props beyond the section payload; the styling lives in
  src/styles/dossier.css under `.chapter`.
-->
<script lang="ts">
  import type { DossierChapterSection } from '../data/dossier-types';

  interface Props {
    section: DossierChapterSection;
  }

  let { section }: Props = $props();

  // Roman numerals up to V; arabic past that. Cheap, no library.
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  let numeral = $derived(ROMAN[section.n] ?? String(section.n));
</script>

<section
  class="section chapter"
  id={section.id}
  data-section-type="chapter"
  aria-labelledby="{section.id}-title"
>
  <div class="chapter__numeral" aria-hidden="true">{numeral}</div>
  <div class="chapter__meta">
    <p class="chapter__label">{section.title}</p>
    <h2 class="chapter__title" id="{section.id}-title">{section.subtitle}</h2>
  </div>
</section>
