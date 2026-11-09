<script lang="ts">
  /**
   * Reader-facing source list for one issue.
   *
   * Rendered in three places: the desktop reader (expanded), the mobile reader's
   * completion card (collapsed) and the static SSG article (collapsed, works
   * without JS because it is a native <details>). Entries come from the issue's
   * research brief via scripts/build-issue-sources.mjs.
   *
   * No source list on file: pre-pipeline issues (legacyAudit) render nothing,
   * because their caveat already says sources are not on file; every other
   * issue gets one quiet line.
   */
  import { untrack } from 'svelte';
  import type { SourceEntry } from '../data/issue-types';
  import { sourcesState } from '../lib/issue-sources-state';

  interface Props {
    issue: { id: string; legacyAudit?: boolean; sourceList?: SourceEntry[] };
    /** Expanded on first render. */
    open?: boolean;
    /** Surface rendering the block; also keeps heading ids unique per page. */
    variant?: 'desktop' | 'mobile' | 'static';
  }
  let { issue, open = false, variant = 'desktop' }: Props = $props();

  let isOpen = $state(untrack(() => open));
  let entries = $derived(issue.sourceList ?? []);
  let state = $derived(sourcesState(issue));
  let primaryCount = $derived(entries.filter((e) => e.primary).length);
  let headingId = $derived(`issue-sources-${variant}-${issue.id}`);
  // The static article keeps the list in the HTML for no-JS readers and search.
  // Interactive readers mount it only while expanded, so a collapsed block adds
  // no hidden links to the mobile reader's focus trap.
  let renderList = $derived(variant === 'static' || isOpen);

  function host(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }

  function meta(entry: SourceEntry): string {
    const by = entry.publisher ?? (entry.url ? host(entry.url) : null);
    return [by, entry.date].filter(Boolean).join(' · ');
  }
</script>

{#if state === 'list'}
  <section
    class="sources"
    data-variant={variant}
    data-issue-sources
    data-source-count={entries.length}
    aria-labelledby={headingId}
  >
    <details bind:open={isOpen}>
      <!-- tabindex keeps the summary in InsightReader's focus-trap query -->
      <summary class="sources-summary" tabindex="0">
        <span class="sources-heading" id={headingId}>Sources ({entries.length})</span>
        {#if primaryCount > 0}
          <span class="sources-count">{primaryCount} primary</span>
        {/if}
        <svg class="sources-chevron" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </summary>
      {#if renderList}
        <ol class="sources-list">
          {#each entries as entry (entry.n)}
            {@const line = meta(entry)}
            <li class="sources-item" data-source-entry data-primary={entry.primary ? 'true' : 'false'}>
              {#if entry.url}
                <a class="sources-title sources-link" href={entry.url} target="_blank" rel="noopener noreferrer">{entry.title}<span class="sources-ext" aria-hidden="true">&#8599;</span><span class="sr-only"> (opens in a new tab)</span></a>
              {:else}
                <span class="sources-title">{entry.title}</span>
              {/if}
              {#if entry.primary || line}
                <span class="sources-meta">
                  {#if entry.primary}<span class="sources-badge">Primary</span>{/if}
                  {#if line}<span>{line}</span>{/if}
                </span>
              {/if}
            </li>
          {/each}
        </ol>
      {/if}
    </details>
  </section>
{:else if state === 'empty'}
  <p class="sources-empty" data-variant={variant} data-issue-sources-empty>Source list not yet on file for this issue.</p>
{/if}

<style>
  /*
    Tokens carry hex fallbacks because the static article must stay readable
    when the design-system stylesheet is blocked (see ADR-0002 note in
    src/pages/issue/[id].astro). Contrast on bg-elevated, light / dark:
    text-tertiary 5.8:1 / 6.0:1, status-green-text 6.1:1 / 8.9:1,
    text-primary 14.6:1 / 12.3:1, score-info (link hover) 4.8:1 / 6.1:1.
  */
  .sources {
    width: 100%;
    margin: 32px 0 0;
    text-align: left;
    font-family: var(--font-body, system-ui, -apple-system, sans-serif);
    border-top: 1px solid var(--border-subtle, #e9ecef);
  }

  .sources[data-variant='desktop'] {
    margin-top: 20px;
    padding: 4px 24px 8px;
    border: 1px solid var(--border-subtle, #e9ecef);
    border-radius: var(--radius-xl, 24px);
    background: var(--bg-elevated, #f8f9fa);
  }

  .sources[data-variant='mobile'] {
    max-width: 340px;
    margin: 0;
  }

  .sources-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 0;
    cursor: pointer;
    list-style: none;
    border-radius: var(--radius-sm, 6px);
  }

  .sources-summary::-webkit-details-marker {
    display: none;
  }

  .sources-summary:focus-visible {
    outline: 2px solid var(--focus, #1971c2);
    outline-offset: 2px;
  }

  .sources-heading {
    font-size: var(--text-xs, 0.6875rem);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary, #5c636a);
  }

  .sources-count {
    font-size: var(--text-xs, 0.6875rem);
    color: var(--text-tertiary, #5c636a);
  }

  .sources-chevron {
    margin-left: auto;
    color: var(--text-tertiary, #5c636a);
    transition: transform 150ms ease-out;
  }

  details[open] .sources-chevron {
    transform: rotate(180deg);
  }

  .sources-list {
    margin: 4px 0 12px;
    padding: 0 0 0 1.75em;
    /* The global reset strips list markers; the numbers are part of the design. */
    list-style: decimal outside;
  }

  .sources-item {
    display: list-item;
    padding-left: 4px;
    font-size: var(--text-ui, 0.8125rem);
    line-height: 1.5;
    color: var(--text-primary, #212529);
    overflow-wrap: anywhere;
  }

  .sources[data-variant='desktop'] .sources-item {
    font-size: var(--text-body, 0.875rem);
  }

  .sources-item::marker {
    font-size: var(--text-xs, 0.6875rem);
    font-variant-numeric: tabular-nums;
    color: var(--text-tertiary, #5c636a);
  }

  .sources-title {
    font-weight: 600;
  }

  .sources-link {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: var(--border-divider, #dee2e6);
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }

  .sources-link:focus-visible {
    outline: 2px solid var(--focus, #1971c2);
    outline-offset: 2px;
    border-radius: 2px;
  }

  @media (hover: hover) {
    .sources-link:hover {
      color: var(--score-info, #1971c2);
      text-decoration-color: currentColor;
    }
  }

  .sources-ext {
    margin-left: 3px;
    font-weight: 400;
    color: var(--text-tertiary, #5c636a);
  }

  .sources-item + .sources-item {
    margin-top: 12px;
  }

  .sources-meta {
    display: block;
    margin-top: 2px;
    font-size: var(--text-xs, 0.6875rem);
    line-height: 1.45;
    color: var(--text-tertiary, #5c636a);
  }

  .sources-badge {
    display: inline-block;
    margin-right: 6px;
    padding: 0 5px;
    border: 1px solid var(--border-divider, #dee2e6);
    border-radius: var(--radius-sm, 6px);
    font-size: var(--text-micro, 0.625rem);
    font-weight: 700;
    letter-spacing: 0.06em;
    line-height: 1.6;
    text-transform: uppercase;
    color: var(--status-green-text, #1b6d30);
  }

  .sources-empty {
    margin: 24px 0 0;
    font-size: var(--text-xs, 0.6875rem);
    line-height: 1.5;
    color: var(--text-tertiary, #5c636a);
    text-align: left;
  }

  .sources-empty[data-variant='mobile'] {
    margin: 0;
    max-width: 340px;
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .sources-chevron {
      transition: none;
    }
  }
</style>
