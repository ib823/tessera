<script lang="ts">
  import IssueRow from './IssueRow.svelte';
  import { inAppClick, issueHref } from '../lib/link-open';

  import type { IssueSummary } from '../lib/issues-loader';
  import type { ReadState } from '../stores/reader';

  interface Props {
    issue: IssueSummary;
    readState: ReadState | null;
    isActive: boolean;
    tabIndex?: number;
    itemIndex?: number;
    onClick: () => void;
    hasConnections?: boolean;
    searchTerms?: string;
  }
  let { issue, readState, isActive, tabIndex = 0, itemIndex = 0, onClick, hasConnections = false, searchTerms = '' }: Props = $props();
</script>

<!-- A real link (playbook §06) that keeps the listbox option role: new tab,
     copy link and crawlers follow the href; a plain click opens in place.
     The row itself is the shared IssueRow, so the reading list matches
     Latest, Saved and Search; only the selection marker is its own. -->
<a
  href={issueHref(issue.id)}
  class="feed-row"
  class:feed-row--active={isActive}
  data-index={itemIndex}
  onclick={inAppClick(onClick)}
  onkeydown={(e) => { if (e.key === ' ') { e.preventDefault(); onClick(); } }}
  role="option"
  aria-selected={isActive}
  tabindex={tabIndex}
>
  <IssueRow {issue} {readState} density="compact" headingTag="span" {hasConnections} {searchTerms} />
</a>

<style>
  .feed-row {
    display: block;
    padding: 14px 16px 14px 19px;
    border-bottom: 1px solid var(--fora-rule);
    color: inherit;
    text-decoration: none;
    box-shadow: inset 3px 0 0 transparent;
    transition: background var(--duration-fast, 150ms) ease;
  }
  .feed-row:hover { background: var(--bg-sunken); }
  .feed-row--active,
  .feed-row--active:hover {
    background: var(--fora-brand-tint);
    box-shadow: inset 3px 0 0 var(--fora-brand);
  }
  .feed-row:focus-visible {
    outline: 2px solid var(--fora-focus);
    outline-offset: -2px;
  }
  @media (forced-colors: active) {
    .feed-row--active { box-shadow: none; border-left: 3px solid Highlight; }
  }
  @media (prefers-reduced-motion: reduce) {
    .feed-row { transition: none; }
  }
</style>
