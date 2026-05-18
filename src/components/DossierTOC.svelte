<!--
  DossierTOC.svelte
  ---------------------------------------------------------------
  Table of contents. Two render modes from the same payload:
  • Sticky left-rail (desktop) — `variant="rail"`
  • Bottom-sheet drawer (mobile) — `variant="sheet"`

  Items are grouped by chapter. The chapter section's `n` and
  subtitle become the group heading; subsequent sections (until
  the next chapter) are the items beneath.

  Active section is highlighted via `activeId`. The parent reader
  computes that from the scroll position.
-->
<script lang="ts">
  import type { DossierSection } from '../data/dossier-types';

  interface TocItem {
    id: string;
    label: string;
    n: number; // 1-indexed reading-order
    type: DossierSection['t'];
  }

  interface TocGroup {
    chapterTitle: string;
    chapterSubtitle: string;
    items: TocItem[];
  }

  interface Props {
    sections: DossierSection[];
    activeId?: string;
    variant: 'rail' | 'sheet';
    open?: boolean; // sheet mode only
    onJump?: (id: string) => void;
  }

  let { sections, activeId, variant, open = false, onJump }: Props = $props();

  function titleFor(s: DossierSection): string {
    switch (s.t) {
      case 'cover': return s.title;
      case 'tldr': return s.title;
      case 'chapter': return s.subtitle;
      case 'concept':
      case 'fact':
      case 'timeline':
      case 'case':
      case 'diagram':
      case 'further_reading':
      case 'cite_as':
        return s.title;
      case 'reframe': return 'Reframe';
      case 'quote': return 'Quote — primary source';
      case 'mistake': return 'Mistake — ' + s.claim.replace(/[".]/g, '').slice(0, 56);
      case 'view': return 'View';
      default: return '';
    }
  }

  let groups = $derived.by((): TocGroup[] => {
    const out: TocGroup[] = [];
    let current: TocGroup | null = null;
    let n = 0;
    for (const s of sections) {
      if (s.t === 'cover') {
        // Cover gets its own implicit group so it shows up at the top.
        n += 1;
        current = { chapterTitle: 'Front matter', chapterSubtitle: 'Cover & TLDR', items: [] };
        out.push(current);
        current.items.push({ id: s.id, label: 'Cover', n, type: s.t });
        continue;
      }
      if (s.t === 'tldr') {
        n += 1;
        if (!current) {
          current = { chapterTitle: 'Front matter', chapterSubtitle: 'Cover & TLDR', items: [] };
          out.push(current);
        }
        current.items.push({ id: s.id, label: 'TLDR', n, type: s.t });
        continue;
      }
      if (s.t === 'chapter') {
        current = { chapterTitle: s.title, chapterSubtitle: s.subtitle, items: [] };
        out.push(current);
        continue;
      }
      n += 1;
      if (!current) {
        current = { chapterTitle: '', chapterSubtitle: '', items: [] };
        out.push(current);
      }
      current.items.push({ id: s.id, label: titleFor(s), n, type: s.t });
    }
    return out;
  });

  function handleClick(e: MouseEvent, id: string) {
    // Allow native anchor behaviour (deep-linkable), but also call
    // onJump so the parent can close the mobile sheet.
    onJump?.(id);
  }
</script>

{#if variant === 'rail'}
  <nav class="toc" aria-label="Dossier table of contents">
    <p class="toc__label">Contents</p>
    {#each groups as g}
      {#if g.chapterTitle}
        <p class="toc__chapter">{g.chapterTitle} — <em>{g.chapterSubtitle}</em></p>
      {/if}
      {#each g.items as item}
        <a
          href="#{item.id}"
          class="toc__item"
          class:is-active={item.id === activeId}
          onclick={(e) => handleClick(e, item.id)}
        >
          <span class="toc__item__n">{String(item.n).padStart(2, '0')}</span>
          <span>{item.label}</span>
        </a>
      {/each}
    {/each}
  </nav>
{:else}
  <div
    class="toc-sheet"
    class:is-open={open}
    role="dialog"
    aria-modal="true"
    aria-label="Dossier table of contents"
    aria-hidden={!open}
  >
    <div class="toc-sheet__handle" aria-hidden="true"></div>
    <div class="toc-sheet__body">
      <p class="toc__label">Contents</p>
      {#each groups as g}
        {#if g.chapterTitle}
          <p class="toc__chapter">{g.chapterTitle} — <em>{g.chapterSubtitle}</em></p>
        {/if}
        {#each g.items as item}
          <a
            href="#{item.id}"
            class="toc__item"
            class:is-active={item.id === activeId}
            onclick={(e) => handleClick(e, item.id)}
          >
            <span class="toc__item__n">{String(item.n).padStart(2, '0')}</span>
            <span>{item.label}</span>
          </a>
        {/each}
      {/each}
    </div>
  </div>
{/if}
