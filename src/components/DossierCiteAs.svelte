<!--
  DossierCiteAs.svelte
  ---------------------------------------------------------------
  Citation block at the foot of the dossier with copy-to-clipboard.
  Uses navigator.clipboard with a fallback. No analytics.
-->
<script lang="ts">
  import type { DossierCiteAsSection } from '../data/dossier-types';

  interface Props {
    section: DossierCiteAsSection;
  }

  let { section }: Props = $props();
  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(section.format);
    } catch {
      // Fallback for environments without clipboard API
      const ta = document.createElement('textarea');
      ta.value = section.format;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* noop */
      }
      document.body.removeChild(ta);
    }
    copied = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 1800);
  }
</script>

<section
  class="section cite-as"
  id={section.id}
  data-section-type="cite_as"
  aria-labelledby="{section.id}-title"
>
  <p class="cite-as__label">How to cite</p>
  <h2 class="cite-as__title" id="{section.id}-title">{section.title}</h2>
  <p class="cite-as__format">{section.format}</p>
  <div class="cite-as__row">
    <p class="cite-as__license">{section.license}</p>
    <button
      type="button"
      class="cite-as__copy"
      class:is-copied={copied}
      onclick={copy}
      aria-live="polite"
    >
      {copied ? 'Copied' : 'Copy citation'}
    </button>
  </div>
</section>
