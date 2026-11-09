<script lang="ts">
  /**
   * Search no-results state: say what happened, suggest a next step, and
   * give two ways out (clear the search, or browse every issue).
   */
  interface TopicLink {
    topic: string;
    slug: string;
    count: number;
  }

  interface Props {
    query: string;
    topics?: TopicLink[];
    onClear?: () => void;
    onBrowseAll?: () => void;
  }

  let { query, topics = [], onClear, onBrowseAll }: Props = $props();
</script>

<div class="search-empty" data-search-empty>
  <p class="search-empty-title">No issues match "{query.trim()}".</p>
  <p class="search-empty-copy">Check the spelling, or try a shorter or broader word, such as a place, a law or an institution.</p>
  {#if topics.length > 0}
    <p class="search-empty-label">Or browse a topic</p>
    <ul class="search-empty-topics">
      {#each topics as topic (topic.slug)}
        <li><a href={`/topic/${topic.slug}`}>{topic.topic} <span class="search-empty-count">{topic.count}</span></a></li>
      {/each}
    </ul>
  {/if}
  <div class="search-empty-actions">
    <button type="button" class="search-empty-primary" onclick={() => onClear?.()}>Clear search</button>
    {#if onBrowseAll}
      <button type="button" class="search-empty-secondary" onclick={() => onBrowseAll?.()}>Browse every issue</button>
    {/if}
  </div>
</div>

<style>
  .search-empty {
    max-width: 440px;
    margin: 0 auto;
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
  }

  .search-empty-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-body-lg);
    font-weight: 700;
    color: var(--text-primary);
    overflow-wrap: anywhere;
  }

  .search-empty-copy {
    margin: 0;
    font-size: var(--text-body);
    line-height: 1.55;
    color: var(--text-secondary);
  }

  .search-empty-label {
    margin: 8px 0 0;
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .search-empty-topics {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .search-empty-topics a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 14px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-subtle);
    background: var(--bg-elevated);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: 600;
    text-decoration: none;
  }

  .search-empty-count {
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }

  .search-empty-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
  }

  .search-empty-primary,
  .search-empty-secondary {
    min-height: 44px;
    padding: 0 18px;
    border-radius: var(--radius-pill);
    font: inherit;
    font-size: var(--text-ui);
    font-weight: 700;
    cursor: pointer;
  }

  .search-empty-primary {
    border: none;
    background: var(--text-primary);
    color: var(--bg);
  }

  .search-empty-secondary {
    border: 1px solid var(--border-divider);
    background: var(--bg-elevated);
    color: var(--text-primary);
  }

  @media (hover: hover) {
    .search-empty-topics a:hover {
      border-color: var(--border-divider);
      color: var(--text-primary);
    }
  }
</style>
