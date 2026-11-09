<script lang="ts">
  /**
   * "What changed": an issue's edition history, newest first.
   *
   * Rendered next to the Sources block in the desktop reader (expanded), the
   * mobile reader's completion card (collapsed) and the static article
   * (collapsed native <details>, so it works without JS). Entries come from
   * `changes[]` in src/data/issues/{id}.json; a summary starting with
   * "Correction:" is labelled as a correction. Issues with no entries render
   * nothing.
   */
  import { untrack } from 'svelte';
  import type { IssueChange } from '../data/issue-types';
  import { describeChange, formatIssueDate } from '../lib/issue-meta';

  interface Props {
    issue: { id: string; changes?: IssueChange[] };
    /** Expanded on first render. */
    open?: boolean;
    /** Surface rendering the block; also keeps heading ids unique per page. */
    variant?: 'desktop' | 'mobile' | 'static';
  }
  let { issue, open = false, variant = 'desktop' }: Props = $props();

  let isOpen = $state(untrack(() => open));
  let entries = $derived([...(issue.changes ?? [])].reverse().map((c) => ({ ...c, ...describeChange(c) })));
  let corrections = $derived(entries.filter((e) => e.kind === 'correction').length);
  let headingId = $derived(`issue-changes-${variant}-${issue.id}`);
  // As in IssueSources: the static article keeps the list in its HTML; the
  // interactive readers mount it only while expanded.
  let renderList = $derived(variant === 'static' || isOpen);
</script>

{#if entries.length > 0}
  <section class="changes" data-variant={variant} data-issue-changes data-change-count={entries.length} aria-labelledby={headingId}>
    <details bind:open={isOpen}>
      <!-- tabindex keeps the summary in InsightReader's focus-trap query -->
      <summary class="changes-summary" tabindex="0">
        <span class="changes-heading" id={headingId}>What changed ({entries.length})</span>
        {#if corrections > 0}
          <span class="changes-count">{corrections} {corrections === 1 ? 'correction' : 'corrections'}</span>
        {/if}
        <svg class="changes-chevron" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </summary>
      {#if renderList}
        <ol class="changes-list">
          {#each entries as entry, i (i)}
            <li class="changes-item" data-change-entry data-change-kind={entry.kind}>
              <span class="changes-meta">
                {#if entry.kind === 'correction'}<span class="changes-badge">Correction</span>{/if}
                <span>Edition {entry.edition} · <time datetime={entry.date}>{formatIssueDate(entry.date)}</time></span>
              </span>
              <span class="changes-text">{entry.text}</span>
            </li>
          {/each}
        </ol>
      {/if}
    </details>
  </section>
{/if}

<style>
  /* Mirrors IssueSources; hex fallbacks for the static article (ADR-0002). */
  .changes {
    width: 100%;
    margin: 0;
    text-align: left;
    font-family: var(--font-body, system-ui, -apple-system, sans-serif);
    border-top: 1px solid var(--border-subtle, #e9ecef);
  }

  .changes[data-variant='desktop'] {
    margin-top: 12px;
    padding: 4px 24px 8px;
    border: 1px solid var(--border-subtle, #e9ecef);
    border-radius: var(--radius-xl, 24px);
    background: var(--bg-elevated, #f8f9fa);
  }

  .changes[data-variant='mobile'] {
    max-width: 340px;
  }

  .changes[data-variant='static'] {
    margin-top: 16px;
  }

  .changes-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 0;
    cursor: pointer;
    list-style: none;
    border-radius: var(--radius-sm, 6px);
  }

  .changes-summary::-webkit-details-marker {
    display: none;
  }

  .changes-summary:focus-visible {
    outline: 2px solid var(--focus, #1971c2);
    outline-offset: 2px;
  }

  .changes-heading {
    font-size: var(--text-xs, 0.6875rem);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary, #5c636a);
  }

  .changes-count {
    font-size: var(--text-xs, 0.6875rem);
    color: var(--text-tertiary, #5c636a);
  }

  .changes-chevron {
    margin-left: auto;
    color: var(--text-tertiary, #5c636a);
    transition: transform 150ms ease-out;
  }

  details[open] .changes-chevron {
    transform: rotate(180deg);
  }

  .changes-list {
    margin: 4px 0 12px;
    padding: 0;
    list-style: none;
  }

  .changes-item {
    display: block;
    font-size: var(--text-ui, 0.8125rem);
    line-height: 1.5;
    color: var(--text-primary, #212529);
    overflow-wrap: anywhere;
  }

  .changes[data-variant='desktop'] .changes-item {
    font-size: var(--text-body, 0.875rem);
  }

  .changes-item + .changes-item {
    margin-top: 12px;
  }

  .changes-meta {
    display: block;
    margin-bottom: 2px;
    font-size: var(--text-xs, 0.6875rem);
    line-height: 1.45;
    color: var(--text-tertiary, #5c636a);
    font-variant-numeric: tabular-nums;
  }

  .changes-badge {
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
    color: var(--highlight-accent, #a35100);
  }

  .changes-text {
    display: block;
  }
</style>
