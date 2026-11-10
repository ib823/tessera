<script lang="ts">
  import FeedRow from './FeedRow.svelte';
  import SectionHeader from './SectionHeader.svelte';
  import LibraryTabs from './LibraryTabs.svelte';
  import SurfaceNav from './SurfaceNav.svelte';
  import AngleCodeBanner from './AngleCodeBanner.svelte';
  import { reactions } from '../stores/reader';

  import type { IssueSummary } from '../lib/issues-loader';
  import type { FeedSection, SectionKind, SortMode } from '../lib/feed-sections';

  type ArchiveFilter = 'all' | SectionKind;

  interface Props {
    issues: IssueSummary[];
    sections?: FeedSection[];
    /** Feed summaries still in flight (deep link): keep the list empty, no placeholder rows. */
    loading?: boolean;
    activeId: string | null;
    readMap: Record<string, string>;
    surfaceMode?: 'today' | 'library';
    todayMode?: 'top' | 'latest';
    onGoLatest?: () => void;
    libraryMode?: 'reading' | 'highlights' | 'archive';
    readingCount?: number;
    highlightCount?: number;
    archiveCount?: number;
    libraryCount?: number;
    onGoToday?: () => void;
    onOpenLibrary?: () => void;
    onOpenReading?: () => void;
    onOpenHighlights?: () => void;
    onOpenArchive?: () => void;
    onSelectIssue: (issue: IssueSummary) => void;
    searchQuery?: string;
    onSearchInput?: (query: string) => void;
    onSearchFocus?: () => void;
    onSearchClear?: () => void;
    issueHasConnections?: (id: string) => boolean;
    sortMode?: SortMode;
    onSortChange?: (mode: SortMode) => void;
    archiveFilter?: ArchiveFilter;
    onArchiveFilter?: (kind: ArchiveFilter) => void;
    showSyncBanner?: boolean;
    onSyncBannerTap?: () => void;
    onSyncBannerDismiss?: () => void;
  }
  let { issues, sections = [], loading = false, activeId, readMap, surfaceMode = 'today', todayMode = 'top', onGoLatest, libraryMode = 'reading', readingCount = 0, highlightCount = 0, archiveCount = 0, libraryCount = 0, onGoToday, onOpenLibrary, onOpenReading, onOpenHighlights, onOpenArchive, onSelectIssue, searchQuery = '', onSearchInput, onSearchFocus, onSearchClear, issueHasConnections, sortMode = 'latest', onSortChange, archiveFilter = 'all' as ArchiveFilter, onArchiveFilter, showSyncBanner = false, onSyncBannerTap, onSyncBannerDismiss }: Props = $props();
  function libraryHeading(mode: 'reading' | 'highlights' | 'archive') {
    if (mode === 'highlights') return 'Highlights library';
    if (mode === 'archive') return 'Archive library';
    return 'Reading library';
  }

  function feedAriaLabel(mode: 'today' | 'library', activeLibraryMode: 'reading' | 'highlights' | 'archive') {
    if (mode === 'library') return libraryHeading(activeLibraryMode);
    return 'Issue list';
  }

  let collapsedSections = $state<Record<string, boolean>>({});

  function defaultCollapsed(kind: SectionKind): boolean {
    return kind === 'completed' || kind === 'explore';
  }

  function issueReadState(id: string): { state: 'started' | 'completed'; progress: number } | null {
    const raw = readMap[id];
    if (!raw) return null;
    if (raw === 'true') return { state: 'completed', progress: 6 };
    try { return JSON.parse(raw); } catch { return null; }
  }

  let isSearching = $derived(searchQuery.trim().length >= 2);

  // Filter state
  type FilterMode = 'all' | 'new' | 'reading' | 'done';
  const filterTabs: Array<{ key: FilterMode; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'new', label: 'New' },
    { key: 'reading', label: 'Reading' },
    { key: 'done', label: 'Done' },
  ];
  let filterMode = $state<FilterMode>('all');

  // Reactions — subscribe to the atom for real-time updates
  let reactionRaw = $state('{}');
  $effect(() => {
    const unsub = reactions.subscribe(v => { reactionRaw = v; });
    return unsub;
  });
  let reactionMap: Record<string, number[]> = $derived.by(() => {
    try { return JSON.parse(reactionRaw); } catch { return {}; }
  });

  function hasReaction(issueId: string): boolean {
    return (reactionMap[issueId]?.length ?? 0) > 0;
  }

  // Compute counts
  let counts = $derived.by(() => {
    let newCount = 0;
    let readingCount = 0;
    let doneCount = 0;
    for (const issue of issues) {
      const state = issueReadState(issue.id);
      if (!state) { newCount++; }
      else if (state.state === 'started') { readingCount++; }
      else if (state.state === 'completed') { doneCount++; }
    }
    return { all: issues.length, new: newCount, reading: readingCount, done: doneCount };
  });

  // Apply filter
  let filteredByState = $derived.by(() => {
    if (filterMode === 'all') return issues;
    return issues.filter(issue => {
      const state = issueReadState(issue.id);
      if (filterMode === 'new') return !state;
      if (filterMode === 'reading') return state?.state === 'started';
      if (filterMode === 'done') return state?.state === 'completed';
      return true;
    });
  });

  // Search and library views use a flat issue list in the sidebar.
  let displayIssues = $derived(filteredByState);

  // Flat feed (search results / filter fallback). Rows flow at their natural
  // height: the list is at most the published issues (~100 rows, the same
  // count the section feed renders), and fixed-height virtual rows made a
  // row's text overlap the next one when users increase text spacing
  // (WCAG 1.4.12).
  let scrollContainerEl: HTMLDivElement | undefined = $state(undefined);

  let flatIssues = $derived(displayIssues);
  let issueIndexMap = $derived.by(() => new Map(flatIssues.map((issue, index) => [issue.id, index])));

  // What the list area holds. A listbox may contain only options, so the
  // section feed, whose collapse toggles are buttons, gets one listbox per
  // section panel instead of one around everything.
  let listBody = $derived<'loading' | 'sections' | 'empty' | 'flat'>(
    loading && !isSearching ? 'loading'
      : sections.length > 0 && !isSearching ? 'sections'
      : flatIssues.length === 0 && (isSearching || filterMode !== 'all') ? 'empty'
      : 'flat',
  );

  // Roving tabindex
  let focusedIndex = $state(-1);

  function onFeedKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      focusedIndex = Math.min(focusedIndex + 1, flatIssues.length - 1);
      scrollToFocused();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      focusedIndex = Math.max(focusedIndex - 1, 0);
      scrollToFocused();
    } else if (e.key === 'Enter' && focusedIndex >= 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      // Modified Enter falls through to the row's link (new tab or window).
      e.preventDefault();
      e.stopPropagation();
      onSelectIssue(flatIssues[focusedIndex]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      e.stopPropagation();
      focusedIndex = 0;
      scrollToFocused();
    } else if (e.key === 'End') {
      e.preventDefault();
      e.stopPropagation();
      focusedIndex = flatIssues.length - 1;
      scrollToFocused();
    }
  }

  function activateFilter(mode: FilterMode) {
    filterMode = mode;
  }

  function onFilterKeyDown(event: KeyboardEvent, mode: FilterMode) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const currentIndex = filterTabs.findIndex((tab) => tab.key === mode);
    if (event.key === 'Home') {
      activateFilter(filterTabs[0].key);
      return;
    }
    if (event.key === 'End') {
      activateFilter(filterTabs[filterTabs.length - 1].key);
      return;
    }
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + delta + filterTabs.length) % filterTabs.length;
    activateFilter(filterTabs[nextIndex].key);
  }

  function scrollToFocused() {
    if (!scrollContainerEl || focusedIndex < 0) return;
    requestAnimationFrame(() => {
      const el = scrollContainerEl?.querySelector(`[data-index="${focusedIndex}"]`) as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
      el?.focus();
    });
  }

  function rowTabIndex(issueId: string, index: number): number {
    if (focusedIndex === index) return 0;
    if (focusedIndex >= 0) return -1;
    if (!activeId) return index === 0 ? 0 : -1;
    return activeId === issueId ? 0 : -1;
  }

  // Reset scroll when filter changes
  $effect(() => {
    void filterMode;
    if (scrollContainerEl) {
      scrollContainerEl.scrollTop = 0;
    }
  });
</script>

<aside class="desktop-sidebar" aria-label={feedAriaLabel(surfaceMode, libraryMode)} style="width:320px;height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;border-right:1px solid var(--bg-sunken);flex-shrink:0;background:linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg) 18%);display:flex;flex-direction:column;">
  <h2 class="sr-only">{surfaceMode === 'today' ? 'Issue list' : libraryHeading(libraryMode)}</h2>
  <div style="padding:10px 18px 8px;flex-shrink:0;">
    <div class="feed-primary-nav" style="padding:0 0 12px;">
      <SurfaceNav {todayMode} {onGoLatest} variant="sidebar" {surfaceMode} {libraryCount} onGoToday={onGoToday} onOpenLibrary={onOpenLibrary} />
    </div>

    <!-- Search -->
    <form role="search" aria-label="Search issues" onsubmit={(event) => event.preventDefault()} style="position:relative;">
      <label class="sr-only" for="desktop-search">Search issues</label>
      <input
        id="desktop-search"
        data-search-input
        type="text"
        placeholder="Search issues..."
        aria-label="Search issues"
        value={searchQuery}
        oninput={(e) => onSearchInput?.((e.currentTarget as HTMLInputElement).value)}
        onfocus={() => onSearchFocus?.()}
        style="width:100%;padding:8px 32px 8px 12px;font-size: var(--text-ui);border:1px solid var(--border-subtle);border-radius: var(--radius-md);background:var(--bg-sunken);color:var(--text-primary);outline:none;transition:border-color 0.2s ease-out;"
        onfocusin={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--score-info)'; }}
        onfocusout={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'; }}
      />
      {#if isSearching}
        <button
          type="button"
          onclick={() => onSearchClear?.()}
          style="position:absolute;right:4px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size: var(--text-body);color:var(--text-tertiary);padding:8px;min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;"
          aria-label="Clear search"
        >x</button>
      {/if}
    </form>

    {#if !isSearching && surfaceMode === 'library'}
      <div style="padding:10px 0 4px;">
        <LibraryTabs
          {libraryMode}
          {readingCount}
          {highlightCount}
          {archiveCount}
          panelId="desktop-library-panel"
          idPrefix="desktop-library"
          onOpenReading={onOpenReading}
          onOpenHighlights={onOpenHighlights}
          onOpenArchive={onOpenArchive}
        />
      </div>
    {/if}


    <!-- Section headers or filter bar -->
    {#if isSearching}
      <div style="padding:6px 0;">
        <span class="sr-only" role="status" aria-live="polite">
          {#if issues.length === 0 && searchQuery.trim().length >= 2}
            No results for "{searchQuery.trim()}"
          {:else}
            {issues.length} result{issues.length !== 1 ? 's' : ''} for "{searchQuery.trim()}"
          {/if}
        </span>
        <span style="font-size: var(--text-xs);color:var(--text-tertiary);">
          {#if issues.length === 0 && searchQuery.trim().length >= 2}
            No results for "{searchQuery.trim()}"
          {:else}
            {issues.length} result{issues.length !== 1 ? 's' : ''} for "{searchQuery.trim()}"
          {/if}
        </span>
      </div>
    {:else if sections.length === 0 && surfaceMode !== 'library' && !loading}
      <!-- Fallback: filter tabs when no sections computed -->
      <div style="display:flex;gap:0;margin-top:8px;border-bottom:1px solid var(--bg-sunken);" role="tablist" aria-label="Filter issues">
        {#each filterTabs as tab}
          <button
            id={`desktop-filter-${tab.key}`}
            onclick={() => { activateFilter(tab.key); }}
            onkeydown={(event) => onFilterKeyDown(event, tab.key)}
            role="tab"
            aria-selected={filterMode === tab.key}
            aria-controls="desktop-feed-list"
            tabindex={filterMode === tab.key ? 0 : -1}
            style="
              flex:1;padding:8px 4px 10px;background:none;border:none;cursor:pointer;
              font-size: var(--text-xs);font-weight:{filterMode === tab.key ? '700' : '600'};
              color:{filterMode === tab.key ? 'var(--text-primary)' : 'var(--text-muted)'};
              border-bottom:2px solid {filterMode === tab.key ? 'var(--text-primary)' : 'transparent'};
              transition:color var(--duration-fast, 150ms) ease, border-color var(--duration-fast, 150ms) ease;
              display:flex;flex-direction:column;align-items:center;gap:1px;
              min-height:44px;justify-content:center;
            "
          >
            <span>{tab.label}</span>
            <span style="font-size: var(--text-micro);font-weight: 600;color:{filterMode === tab.key ? 'var(--text-tertiary)' : 'var(--text-faint)'};">
              {tab.key === 'all' ? counts.all : tab.key === 'new' ? counts.new : tab.key === 'reading' ? counts.reading : counts.done}
            </span>
          </button>
        {/each}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;">
        <span style="font-size: var(--text-micro);color:var(--text-muted);">{issues.length} issues</span>
      </div>
    {/if}

    {#if !isSearching && !!onSortChange && !(surfaceMode === 'library' && libraryMode === 'highlights')}
      <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0 2px;border-top:1px solid var(--bg-sunken);">
        <span style="font-size:var(--text-micro);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;">Sort</span>
        <button onclick={() => onSortChange?.(sortMode === 'latest' ? 'shift' : 'latest')} style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-pill);background:var(--bg-elevated);color:var(--text-secondary);font:inherit;font-size:var(--text-xs);font-weight:700;cursor:pointer;transition:color 180ms ease,border-color 180ms ease;" aria-label="Sort issues: currently {sortMode === 'latest' ? 'Latest' : 'Biggest Shift'}">
          {sortMode === 'latest' ? 'Latest' : 'Biggest Shift'}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    {/if}
  </div>

  {#if showSyncBanner}
    <div style="position:relative;padding:8px 18px 4px;" data-prompt="sync">
      <AngleCodeBanner onTap={() => onSyncBannerTap?.()} />
      <button onclick={() => onSyncBannerDismiss?.()} aria-label="Dismiss sync prompt" style="position:absolute;top:4px;right:14px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:50%;color:var(--text-muted);font-size:var(--text-body);cursor:pointer;line-height:1;z-index:1;">&times;</button>
    </div>
  {/if}

  <!-- Feed list -->
  <!-- A tabpanel only under Library's tabs; on Today no tab controls this
       list, and the old aria-labelledby pointed at an id that did not exist. -->
  <div
    id={surfaceMode === 'library' ? 'desktop-library-panel' : 'desktop-today-panel'}
    role={!isSearching && surfaceMode === 'library' ? 'tabpanel' : undefined}
    aria-labelledby={!isSearching && surfaceMode === 'library' ? `desktop-library-${libraryMode}` : undefined}
    tabindex={!isSearching && surfaceMode === 'library' ? 0 : undefined}
    style="flex:1;display:flex;flex-direction:column;min-height:0;"
  >
  <div
    id="desktop-feed-list"
    bind:this={scrollContainerEl}
    onkeydown={onFeedKeyDown}
    role={listBody === 'flat' ? 'listbox' : undefined}
    aria-label={listBody === 'flat' ? 'Issues' : undefined}
    aria-live="polite"
    aria-atomic="false"
    style="flex:1;overflow-y:auto;"
  >
    {#if listBody === 'loading'}
      <!-- Rows arrive with the feed fetch; render them in one pass so nothing below them moves. -->
    {:else if listBody === 'sections'}
      <!-- Section-based feed: each panel is a listbox labelled by its section heading. -->
      {#each sections as section, sectionIdx}
        {@const sectionHeadingId = `desktop-feed-section-${section.kind}-heading`}
        {@const sectionPanelId = `desktop-feed-section-${section.kind}-panel`}
        {@const sectionCollapsed = collapsedSections[section.kind] ?? defaultCollapsed(section.kind)}
        {@const sectionListbox = !sectionCollapsed && section.issues.length > 0}
        {@const isActiveArchiveFilter = surfaceMode === 'library' && libraryMode === 'archive' && archiveFilter === section.kind}
        <div role="group" aria-labelledby={sectionHeadingId} style={isActiveArchiveFilter ? 'background:var(--bg-sunken);' : ''}>
          <SectionHeader
            id={sectionHeadingId}
            controlsId={sectionPanelId}
            label={section.label}
            count={section.count}
            kind={section.kind}
            collapsed={sectionCollapsed}
            onToggle={() => {
              if (surfaceMode === 'library' && libraryMode === 'archive') {
                const nextFilter = archiveFilter === section.kind ? 'all' : section.kind;
                onArchiveFilter?.(nextFilter);
                collapsedSections[section.kind] = !sectionCollapsed;
              } else {
                collapsedSections[section.kind] = !sectionCollapsed;
              }
            }}
          />
          <div
            id={sectionPanelId}
            hidden={sectionCollapsed}
            role={sectionListbox ? 'listbox' : undefined}
            aria-labelledby={sectionListbox ? sectionHeadingId : undefined}
          >
            {#if !sectionCollapsed}
              {#each section.issues as issue}
                {@const idx = issueIndexMap.get(issue.id) ?? 0}
                <FeedRow {issue} readState={issueReadState(issue.id)} isActive={activeId === issue.id} tabIndex={rowTabIndex(issue.id, idx)} itemIndex={idx} onClick={() => { focusedIndex = idx; onSelectIssue(issue); }} hasReaction={hasReaction(issue.id)} reactionCount={reactionMap[issue.id]?.length ?? 0} hasConnections={issueHasConnections?.(issue.id) ?? false} searchTerms={isSearching ? searchQuery.trim() : ''} />
              {/each}
            {/if}
          </div>
        </div>
      {/each}
    {:else if listBody === 'empty'}
      <div style="padding:40px 20px;text-align:center;">
        <p style="font-size: var(--text-ui);color:var(--text-muted);">
          {#if isSearching}
            No issues match "{searchQuery}"
          {:else}
            No issues found
          {/if}
        </p>
      </div>
    {:else}
      <!-- Flat list (fallback / search results) -->
      {#each flatIssues as issue, idx (issue.id)}
        <FeedRow {issue} readState={issueReadState(issue.id)} isActive={activeId === issue.id} tabIndex={rowTabIndex(issue.id, idx)} itemIndex={idx} onClick={() => { focusedIndex = idx; onSelectIssue(issue); }} hasReaction={hasReaction(issue.id)} reactionCount={reactionMap[issue.id]?.length ?? 0} hasConnections={issueHasConnections?.(issue.id) ?? false} searchTerms={isSearching ? searchQuery.trim() : ''} />
      {/each}
    {/if}
  </div>
  </div>
</aside>

<style>
  /* The canvas is capped at 1440px (H-8), so the sidebar stops growing too. */
  @media (min-width: 1600px) {
    .desktop-sidebar {
      width: 340px !important;
    }
  }
  @media(min-width:1024px) { .feed-primary-nav { display:none; } }
</style>
