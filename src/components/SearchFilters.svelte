<script lang="ts">
  // Narrow search results by story type and topic (playbook §05, screen 08).
  // Only values present in the current matches are offered, with counts, so
  // a chip never leads to an empty list; a chosen value stays visible so it
  // can always be cleared.
  import { primaryLens } from '../lib/topics';
  import type { IssueSummary } from '../lib/issues-loader';

  interface Props {
    matches: IssueSummary[];
    type: string;
    topic: string;
    onType: (type: string) => void;
    onTopic: (topic: string) => void;
    /** 'scroll' keeps each row on one line that scrolls sideways (phones). */
    variant?: 'wrap' | 'scroll';
  }
  let { matches, type, topic, onType, onTopic, variant = 'wrap' }: Props = $props();

  const TYPE_ORDER = ['Analysis', 'Explainer', 'Fact-check'];

  function countBy(values: string[]): Array<{ value: string; count: number }> {
    const counts = new Map<string, number>();
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
    return [...counts].map(([value, count]) => ({ value, count }));
  }

  let types = $derived.by(() => {
    const list = countBy(matches.map((i) => i.type ?? 'Analysis'));
    if (type && !list.some((t) => t.value === type)) list.push({ value: type, count: 0 });
    return list.sort((a, b) => TYPE_ORDER.indexOf(a.value) - TYPE_ORDER.indexOf(b.value));
  });
  let topics = $derived.by(() => {
    const list = countBy(matches.map((i) => primaryLens(i.cards)).filter((t): t is string => !!t));
    if (topic && !list.some((t) => t.value === topic)) list.push({ value: topic, count: 0 });
    return list.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  });
</script>

{#if types.length > 1 || topics.length > 1 || type || topic}
  <div class="search-filters" class:search-filters--scroll={variant === 'scroll'} data-search-filters>
    {#if types.length > 1 || type}
      <div class="filter-row" role="group" aria-label="Story type">
        <span class="filter-label" aria-hidden="true">Type</span>
        <button class="chip" aria-pressed={!type} onclick={() => onType('')}>All</button>
        {#each types as t (t.value)}
          <button class="chip" aria-pressed={type === t.value} onclick={() => onType(type === t.value ? '' : t.value)} data-filter-type={t.value}>
            {t.value} <span class="chip-count">{t.count}</span>
          </button>
        {/each}
      </div>
    {/if}
    {#if topics.length > 1 || topic}
      <div class="filter-row" role="group" aria-label="Topic">
        <span class="filter-label" aria-hidden="true">Topic</span>
        <button class="chip" aria-pressed={!topic} onclick={() => onTopic('')}>All</button>
        {#each topics as t (t.value)}
          <button class="chip" aria-pressed={topic === t.value} onclick={() => onTopic(topic === t.value ? '' : t.value)} data-filter-topic={t.value}>
            {t.value} <span class="chip-count">{t.count}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .search-filters {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .search-filters--scroll {
    padding: 8px 16px 4px;
  }
  .search-filters--scroll .filter-row {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .search-filters--scroll .filter-row::-webkit-scrollbar {
    display: none;
  }
  .search-filters--scroll .chip {
    flex-shrink: 0;
  }
  .filter-label {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin-right: 2px;
    min-width: 44px;
  }
  .chip {
    min-height: 36px;
    padding: 0 12px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-subtle);
    background: var(--bg);
    color: var(--text-secondary);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
  }
  .chip[aria-pressed='true'] {
    background: var(--text-primary);
    border-color: var(--text-primary);
    color: var(--bg);
  }
  @media (pointer: coarse) {
    .chip {
      min-height: 44px;
    }
  }
  .chip-count {
    font-variant-numeric: tabular-nums;
    opacity: 0.75;
    margin-left: 2px;
  }
  .chip:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
  @media (forced-colors: active) {
    .chip[aria-pressed='true'] {
      outline: 2px solid CanvasText;
    }
  }
</style>
