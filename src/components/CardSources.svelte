<script lang="ts">
  /**
   * The sources behind one hook or fact card (audit P0-2), shown under the
   * card text. Numbers match the issue's full Sources list.
   *
   * desktop / static: title as the link, then publisher and date.
   * mobile: publisher as the link, to keep the card short; the title is in
   * the link's accessible name and tooltip.
   */
  import type { Card, SourceEntry } from '../data/issue-types';
  import { cardSources, sourcePublisher } from '../lib/card-sources';

  interface Props {
    card: Pick<Card, 't' | 'src'>;
    entries?: SourceEntry[] | null;
    variant?: 'desktop' | 'mobile' | 'static';
  }
  let { card, entries = null, variant = 'desktop' }: Props = $props();

  let items = $derived(cardSources(card, entries));
  let compact = $derived(variant === 'mobile');
</script>

{#if items.length > 0}
  <div class="card-sources" data-card-sources data-variant={variant} data-count={items.length}>
    <span class="card-sources-label">{items.length === 1 ? 'Source' : 'Sources'}</span>
    <ul class="card-sources-list">
      {#each items as entry (entry.n)}
        {@const by = sourcePublisher(entry)}
        <li class="card-sources-item" data-source-n={entry.n}>
          <span class="card-sources-n" aria-hidden="true">{entry.n}</span>
          {#if compact}
            {#if entry.url}
              <a class="card-sources-link" href={entry.url} target="_blank" rel="noopener noreferrer" title={entry.title} onclick={(e) => e.stopPropagation()}>{by}<span class="sr-only">: {entry.title}, source {entry.n} (opens in a new tab)</span></a>
            {:else}
              <span title={entry.title}>{by}<span class="sr-only">: {entry.title}, source {entry.n}</span></span>
            {/if}
          {:else}
            {#if entry.url}
              <a class="card-sources-link" href={entry.url} target="_blank" rel="noopener noreferrer">{entry.title}<span class="sr-only">, source {entry.n} (opens in a new tab)</span></a>
            {:else}
              <span class="card-sources-title">{entry.title}<span class="sr-only">, source {entry.n}</span></span>
            {/if}
            <span class="card-sources-meta">{[entry.publisher, entry.date].filter(Boolean).join(' · ')}</span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  /* Hex fallbacks keep the static article readable without the token sheet. */
  .card-sources {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 16px;
    font-family: var(--font-body, system-ui, -apple-system, sans-serif);
    font-size: var(--text-ui, 0.8125rem);
    line-height: 1.5;
    color: var(--text-tertiary, #5c636a);
    text-align: left;
  }

  .card-sources-label {
    flex-shrink: 0;
    font-size: var(--text-xs, 0.75rem);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .card-sources-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .card-sources[data-variant='mobile'] {
    margin-top: 0;
  }

  .card-sources[data-variant='mobile'] .card-sources-list {
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: 12px;
    row-gap: 0;
  }

  .card-sources-item {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .card-sources-n {
    display: inline-block;
    min-width: 1.4em;
    margin-right: 4px;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }

  .card-sources-link {
    display: inline-block;
    min-height: 24px;
    color: var(--text-secondary, #495057);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
  }

  .card-sources-link:focus-visible {
    outline: 2px solid var(--focus, #1971c2);
    outline-offset: 2px;
    border-radius: 2px;
  }

  @media (hover: hover) {
    .card-sources-link:hover {
      color: var(--score-info, #1971c2);
    }
  }

  .card-sources-title {
    color: var(--text-secondary, #495057);
  }

  .card-sources-meta {
    display: block;
    margin-left: calc(1.4em + 4px);
  }

  .card-sources-meta:empty {
    display: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
