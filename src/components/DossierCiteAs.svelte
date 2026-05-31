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
    url?: string;
  }

  let { section, url }: Props = $props();
  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  // The text actually copied: the citation string, plus the canonical URL
  // when the format does not already embed it. Keeps D001 (URL inline) from
  // doubling while ensuring dossiers like D002 (URL omitted) still copy a link.
  const citationText = $derived(
    url && !section.format.includes(url)
      ? `${section.format} ${url}`
      : section.format
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(citationText);
    } catch {
      // Fallback for environments without clipboard API
      const ta = document.createElement('textarea');
      ta.value = citationText;
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
  {#if url && !section.format.includes(url)}
    <p class="cite-as__url"><a href={url}>{url}</a></p>
  {/if}
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
