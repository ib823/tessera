<script lang="ts">
  /**
   * "Published 8 Apr 2026 · Updated 12 May 2026 · Analysis" under an issue's
   * headline. Rendered by the static article, the desktop reader and the mobile
   * reader. "Updated" appears only when the last substantive change fell on a
   * later day than first publication (see src/lib/issue-meta.ts).
   */
  import { formatIssueDate, issueDateTime, wasUpdated } from '../lib/issue-meta';

  interface Props {
    issue: { id: string; publishedAt?: string; modifiedAt?: string; type?: string };
    /** Surface rendering the line; sets size and spacing. */
    variant?: 'desktop' | 'mobile' | 'static';
  }
  let { issue, variant = 'desktop' }: Props = $props();

  let updated = $derived(wasUpdated(issue));
</script>

{#if issue.publishedAt || issue.type}
  <p class="issue-meta" data-variant={variant} data-issue-meta>
    {#if issue.publishedAt}
      <span>Published <time datetime={issueDateTime(issue.publishedAt)} data-published>{formatIssueDate(issue.publishedAt)}</time></span>
    {/if}
    {#if updated}
      <span class="issue-meta-sep" aria-hidden="true">·</span>
      <span>Updated <time datetime={issueDateTime(issue.modifiedAt)} data-modified>{formatIssueDate(issue.modifiedAt)}</time></span>
    {/if}
    {#if issue.type}
      {#if issue.publishedAt}<span class="issue-meta-sep" aria-hidden="true">·</span>{/if}
      <span class="issue-meta-type" data-story-type={issue.type}>{issue.type}</span>
    {/if}
  </p>
{/if}

<style>
  /*
    Hex fallbacks keep the line readable in the static article when the
    design-system stylesheet is blocked (ADR-0002). text-tertiary is
    5.8:1 / 6.0:1 on the page and reader backgrounds, light / dark.
  */
  .issue-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 6px;
    row-gap: 2px;
    margin: 8px 0 0;
    font-family: var(--font-body, system-ui, -apple-system, sans-serif);
    font-size: var(--text-sm, 0.75rem);
    line-height: 1.45;
    color: var(--text-tertiary, #5c636a);
    font-variant-numeric: tabular-nums;
  }

  .issue-meta[data-variant='static'] {
    margin: 0 0 12px;
    font-size: 0.875rem;
  }

  .issue-meta[data-variant='mobile'] {
    margin: 0 0 6px;
    font-size: var(--text-xs, 0.6875rem);
  }

  .issue-meta time {
    white-space: nowrap;
  }

  .issue-meta-type {
    font-weight: 700;
    color: var(--text-secondary, #495057);
  }
</style>
