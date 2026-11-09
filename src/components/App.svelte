<script lang="ts">
  import { onMount } from 'svelte';
  import type { Issue } from '../data/issue-types';
  import { issueCategory, CARD_TYPES } from '../data/issue-types';
  import { addNotification } from '../stores/notifications';
  import { loadFeedIssues, loadFullIssue, primeFullIssue, loadFactGraph, getConnections, getConnectionCount, isFactGraphLoaded } from '../lib/issues-loader';
  import Header from './Header.svelte';
  import DesktopCard from './DesktopCard.svelte';
  import DesktopFeed from './DesktopFeed.svelte';
  import DesktopReader from './DesktopReader.svelte';
  import HighlightsPanel from './HighlightsPanel.svelte';
  import StorageBlockedBanner from './StorageBlockedBanner.svelte';
  import { migrate as migrateReadingState } from '../lib/reading-state';
  import LibraryTabs from './LibraryTabs.svelte';
  import MobileDock from './MobileDock.svelte';
  import SurfaceNav from './SurfaceNav.svelte';
  import TodayView from './TodayView.svelte';
  import SearchEmpty from './SearchEmpty.svelte';
  import MobileBrowser from './MobileBrowser.svelte';
  import InsightReader from './InsightReader.svelte';
  import { countHighlights, readIssues, getSavedPosition, savePosition, clearPosition, getReactions, reactions, computeAffinity, scoreIssue } from '../stores/reader';
  import { loadSearchIndex, search as doSearch, isLoaded as searchReady, isLoading as searchLoading } from '../lib/search';
  import { getAnimationTier } from '../lib/animation';
  import { buildFeedSections, type FeedSection, type SortMode, type SectionKind, type TodayMode } from '../lib/feed-sections';
  import { BUILD_ID, getSiteOrigin } from '../lib/build';
  import { startAutoSync, checkUrlSync, linkAngleCode, getAngleCode, schedulePush, isLinked as isSyncLinked, onSyncChange } from '../lib/sync';
  import { initInstallState, canInstall as canInstallCheck, isIOS as isIOSCheck, triggerInstall, dismissInstall, onInstallChange } from '../lib/install-state';
  import AngleCode from './AngleCode.svelte';
  import { choosePrompt, countCompleted, markPromptSpent, promptSpent, sharedLanding, type RelationshipPrompt } from '../lib/prompt-budget';
  import { buildTopicClusters } from '../lib/topics';

  interface FeedIssue {
    id: string;
    opinionShift: number;
    sourceDate?: string;
    status: "new" | "updated" | null;
    edition: number;
    headline: string;
    context: string;
    stageScores?: { pa: number; ba: number; fc: number; sr: number; af?: number; ct?: number };
    finalScore?: number;
    cards: Array<{ t: string; lens?: string }>;
  }

  interface Props {
    initialIssueId?: string;
    /**
     * Full issue for a deep link (/issue/[id]). When present, the reader is
     * the very first thing App renders: no empty-feed homepage state, no
     * network round-trip before the article appears. With it set, App renders
     * nothing until onMount (server and hydration markup are empty), so the
     * first real render can already pick the right shell for the viewport.
     */
    initialIssue?: Issue;
    feedData?: FeedIssue[];
  }
  let { initialIssueId, initialIssue, feedData = [] }: Props = $props();
  if (initialIssue) primeFullIssue(initialIssue);
  // See the {#if shellReady} gate at the top of the markup.
  let shellReady = $state(!initialIssue);

  type SurfaceMode = 'today' | 'library';
  type LibraryMode = 'reading' | 'highlights' | 'archive';
  type HistoryMode = 'push' | 'replace' | 'none';

  function normalizeLibraryMode(mode: string | null | undefined): LibraryMode {
    if (mode === 'archive' || mode === 'explore') return 'archive';
    return mode === 'highlights' || mode === 'saved' ? 'highlights' : 'reading';
  }

  function locationAppState(): { surfaceMode: SurfaceMode; libraryMode: LibraryMode } {
    if (typeof window === 'undefined') return { surfaceMode: 'today', libraryMode: 'reading' };
    const params = new URL(window.location.href).searchParams;
    const view = params.get('view');
    const libraryMode = normalizeLibraryMode(params.get('tab'));
    if (view === 'library') return { surfaceMode: 'library', libraryMode };
    if (view === 'saved') return { surfaceMode: 'library', libraryMode: 'highlights' };
    if (view === 'marked') return { surfaceMode: 'library', libraryMode: 'highlights' };
    return { surfaceMode: 'today', libraryMode };
  }

  function initialSurfaceMode(): SurfaceMode {
    return locationAppState().surfaceMode;
  }

  function initialLibraryMode(): LibraryMode {
    return locationAppState().libraryMode;
  }

  function libraryLabel(mode: LibraryMode): string {
    if (mode === 'highlights') return 'Highlights';
    if (mode === 'archive') return 'Archive';
    return 'Reading';
  }

  function surfaceUrl(mode: SurfaceMode, nextLibraryMode: LibraryMode): string {
    if (mode === 'today') return '/';
    return `/?view=library&tab=${nextLibraryMode}`;
  }

  function libraryEmptyTitle(mode: LibraryMode): string {
    if (mode === 'highlights') return 'No highlights yet.';
    if (mode === 'archive') return 'No archive issues available yet.';
    return 'No unfinished issues yet.';
  }

  function libraryEmptyCopy(mode: LibraryMode): string {
    if (mode === 'highlights') return 'Tap Highlight on any card while reading, and every marked angle will stay here as your personal trail.';
    if (mode === 'archive') return 'Every published issue will appear here as the archive grows.';
    return 'Start an issue and it will remain here until you finish the reading path.';
  }

  function pageHeading(mode: SurfaceMode, activeLibraryMode: LibraryMode): string {
    if (mode === 'library') return libraryEmptyTitle(activeLibraryMode);
    return 'See what deserves your full attention.';
  }

  function detectViewMode(w: number, h: number): 'mobile' | 'desktop' {
    const compactLandscape = w < 960 && h < 640;
    return w < 768 || compactLandscape ? 'mobile' : 'desktop';
  }

  // The homepage hydrates server markup rendered as 'desktop', so it must start
  // there and switch in onMount. Deep links (initialIssue) render nothing until
  // mounted, so they can start in the right shell and the first painted frame
  // is already final.
  let viewMode = $state<'mobile' | 'desktop'>(
    initialIssue && typeof window !== 'undefined' ? detectViewMode(window.innerWidth, window.innerHeight) : 'desktop'
  );
  let viewportWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1440);
  let cinemaPeek = $state(false);
  // Cinema Mode dismissal persists for the entire tab session via sessionStorage:
  // first issue per session gets the wow moment, dismissing keeps the sidebar
  // visible for every subsequent issue until the tab closes.
  let cinemaDismissed = $state(
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('tfa-cinema-dismissed') === '1'
  );

  function dismissCinema() {
    cinemaDismissed = true;
    cinemaPeek = false;
    if (typeof sessionStorage !== 'undefined') {
      try { sessionStorage.setItem('tfa-cinema-dismissed', '1'); } catch {}
    }
  }
  // The mobile card feed (Library, search) keeps its own scroller and pull-to-refresh.
  let allowBrowserPullRefresh = $state(false);
  let searchQuery = $state('');
  let searchActive = $state(false);
  let surfaceMode = $state<SurfaceMode>(initialSurfaceMode());
  let libraryMode = $state<LibraryMode>(initialLibraryMode());

  // Feed data comes from Astro props (SSR-available) or from async fetch
  let issues = $state<FeedIssue[]>(feedData);

  // Feed summaries arrive later on deep links (fetched in onMount). Until then
  // the Today surface renders nothing instead of its empty "Coming soon" state.
  let feedLoaded = $state(feedData.length > 0);

  // Full issue for the reader (has card text)
  let activeFullIssue = $state<Issue | null>(initialIssue ?? null);
  // A deep-linked reader is the landing page itself, so it appears in place
  // with no entrance animation. Any reader opened later animates as usual.
  let readerIsLanding = $state(!!initialIssue);
  $effect(() => {
    if (!activeFullIssue) readerIsLanding = false;
  });
  let issueLoadError = $state(false);
  let issueLoading = $state(false);
  let isOffline = $state(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  let feedSort: SortMode = $state('latest');
  let archiveFilter = $state<'all' | SectionKind>('all');
  let angleCodeOpen = $state(false);
  let syncLinked = $state(isSyncLinked());
  let showInstall = $state(false);
  let installIsIOS = $state(false);
  let isStandalone = $state(false);

  // ── Relationship prompts: one interruption budget (R-1) ──
  // The sync prompt used to have two dismissal keys (mobile dock card and
  // desktop sidebar banner); either one now dismisses the single prompt.
  function readFlag(key: string): boolean {
    try { return typeof localStorage !== 'undefined' && localStorage.getItem(key) === '1'; } catch { return false; }
  }
  function writeFlag(key: string) {
    try { localStorage.setItem(key, '1'); } catch { /* storage blocked: dismissal lasts this page */ }
  }
  let syncDismissed = $state(readFlag('tfa:v1:sync-banner-dismissed') || readFlag('tfa:v1:sync-prompt-dismissed'));
  let welcomeDismissed = $state(readFlag('tfa:v1:welcome-dismissed'));
  let landingActive = $state(sharedLanding.get());
  let promptsSpent = $state(promptSpent.get());
  $effect(() => sharedLanding.subscribe((v) => { landingActive = v; }));
  $effect(() => promptSpent.subscribe((v) => { promptsSpent = v; }));

  function dismissSyncPrompt() {
    writeFlag('tfa:v1:sync-banner-dismissed');
    writeFlag('tfa:v1:sync-prompt-dismissed');
    syncDismissed = true;
    markPromptSpent();
  }
  function dismissWelcome() {
    writeFlag('tfa:v1:welcome-dismissed');
    welcomeDismissed = true;
    markPromptSpent();
  }
  function openSyncPanel() {
    angleCodeOpen = true;
    markPromptSpent();
  }
  function dismissInstallPrompt() {
    dismissInstall();
    markPromptSpent();
  }
  function acceptInstallPrompt() {
    markPromptSpent();
    void triggerInstall();
  }

  // Keep syncLinked and install state reactive
  $effect(() => {
    const unsubSync = onSyncChange(() => { syncLinked = isSyncLinked(); });
    const unsubInstall = onInstallChange(() => { showInstall = canInstallCheck(); installIsIOS = isIOSCheck(); });
    return () => { unsubSync(); unsubInstall(); };
  });

  let isSearching = $derived(searchQuery.trim().length >= 2);

  // ── Today: Top / Latest (H-2) ──
  // sessionStorage: the chosen mode lasts for this visit only.
  const TODAY_MODE_KEY = 'tfa:v1:today-mode';
  let todayMode = $state<TodayMode>('top');
  function setTodayMode(mode: TodayMode) {
    todayMode = mode;
    try { sessionStorage.setItem(TODAY_MODE_KEY, mode); } catch { /* storage blocked */ }
  }

  // ── Tablet (768-1023 px): the sidebar is a drawer behind a toggle ──
  let sidebarOpen = $state(false);
  let sidebarEl: HTMLElement | undefined = $state(undefined);
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    if (sidebarOpen) requestAnimationFrame(() => sidebarEl?.focus());
  }
  function closeSidebar(restoreFocus = false) {
    if (!sidebarOpen) return;
    sidebarOpen = false;
    if (restoreFocus) requestAnimationFrame(() => (document.querySelector('[data-browse-toggle]') as HTMLElement | null)?.focus());
  }

  let dockHeight = $state(0);
  let desktopHeaderHeight = $state(0);

  // Search no-results: suggest the largest topics.
  let searchTopics = $derived(buildTopicClusters(issues).slice(0, 6).map(({ topic, slug, count }) => ({ topic, slug, count })));
  function browseAllFromSearch() {
    onSearchClear();
    openLibrary('archive');
  }

  function onSearchFocus() {
    loadSearchIndex();
    searchActive = true;
  }

  function onSearchClear() {
    searchQuery = '';
    searchActive = false;
  }

  // Restore position: initialIssueId (from URL) takes priority, then saved position
  let restoredPosition = getSavedPosition();
  // A saved position only applies to a deep link when it is for that same issue.
  let restoredCardIndex = $state(
    initialIssue && restoredPosition?.feedIssueId !== initialIssue.id ? 0 : (restoredPosition?.cardIndex ?? 0)
  );
  let showContextWhisper = $state(!!restoredPosition && restoredPosition.cardIndex > 0);

  // Active issue in feed context (summary)
  let activeIssue: FeedIssue | null = $state(
    initialIssue
      ? initialIssue
      : initialIssueId
      ? issues.find(i => i.id === initialIssueId) ?? null
      : restoredPosition
        ? issues.find(i => i.id === restoredPosition!.feedIssueId) ?? null
        : null
  );
  let readMap: Record<string, string> = $state({});

  // Compute initial feed index for mobile browser
  let initialFeedIndex = $state(
    restoredPosition
      ? Math.max(0, issues.findIndex(i => i.id === restoredPosition!.feedIssueId))
      : 0
  );

  function getState(id: string) {
    const raw = readMap[id];
    if (!raw) return null;
    if (raw === 'true') return { state: 'completed', progress: 6 };
    try { return JSON.parse(raw); } catch { return null; }
  }

  $effect(() => {
    const unsub = readIssues.subscribe(v => {
      readMap = { ...v };
      schedulePush(); // Angle Code: sync on reading state change
    });
    return unsub;
  });

  // Reactions subscription for real-time heart indicators
  let reactionRaw = $state('{}');
  $effect(() => {
    const unsub = reactions.subscribe(v => {
      reactionRaw = v;
      schedulePush(); // Angle Code: sync on reaction change
    });
    return unsub;
  });
  let appReactionMap: Record<string, number[]> = $derived.by(() => {
    try { return JSON.parse(reactionRaw); } catch { return {}; }
  });
  function hasReaction(issueId: string): boolean {
    return (appReactionMap[issueId]?.length ?? 0) > 0;
  }

  let readingIssueIds = $derived.by(() => {
    return new Set(
      Object.entries(readMap)
        .filter(([, value]) => {
          if (!value || value === 'true') return false;
          try {
            return JSON.parse(value).state === 'started';
          } catch {
            return false;
          }
        })
        .map(([id]) => id)
    );
  });
  let highlightedIssueIds = $derived.by(() => {
    const ids = new Set<string>();
    for (const [id, cards] of Object.entries(appReactionMap)) {
      if ((cards?.length ?? 0) > 0) ids.add(id);
    }
    return ids;
  });
  let highlightCount = $derived(countHighlights(appReactionMap));
  let completedCount = $derived(countCompleted(readMap));

  // One relationship prompt at a time, only after a completed issue, never
  // on the first screen of a shared-link visit, one per session (R-1).
  let activePrompt = $derived<RelationshipPrompt | null>(
    choosePrompt({
      completedCount,
      sharedLanding: landingActive,
      spent: promptsSpent,
      readerOpen: !!activeFullIssue || issueLoading,
      candidates: {
        welcome: !welcomeDismissed && surfaceMode === 'today' && !isSearching,
        sync: !syncLinked && !syncDismissed && !isStandalone,
        // Only the mobile dock offers install.
        install: viewMode === 'mobile' && showInstall && !isStandalone,
      },
    }),
  );
  let dockPrompt = $derived(activePrompt === 'sync' || activePrompt === 'install' ? activePrompt : null);
  let readingCount = $derived(readingIssueIds.size);
  let libraryCount = $derived.by(() => new Set([...readingIssueIds, ...highlightedIssueIds]).size);
  let scopedIssues = $derived.by(() => {
    if (surfaceMode === 'library') {
      if (libraryMode === 'highlights') return issues.filter(i => highlightedIssueIds.has(i.id));
      if (libraryMode === 'archive') return issues;
      return issues.filter(i => readingIssueIds.has(i.id));
    }
    return issues;
  });
  let filteredIssues = $derived.by(() => {
    const source = scopedIssues;
    if (!searchQuery.trim() || !isSearching) return source;
    const ids = doSearch(searchQuery);
    if (ids.length === 0) return [];
    const idSet = new Set(ids);
    return source.filter(i => idSet.has(i.id));
  });
  let searchResultCount = $derived(isSearching ? filteredIssues.length : -1);
  let searchStatusMessage = $derived.by(() => {
    if (!isSearching) return '';
    const term = searchQuery.trim();
    if (searchResultCount === 0) return `No results for "${term}".`;
    return `${searchResultCount} result${searchResultCount !== 1 ? 's' : ''} for "${term}".`;
  });

  // Save position whenever active issue changes
  $effect(() => {
    if (activeIssue) {
      savePosition(activeIssue.id, 0);
    }
  });

  // Interest-based feed sorting — computed ONCE on load, stable during session.
  // Prevents jarring list reorder when the user clicks/reads an issue.
  let stableSortOrder: string[] | null = null;

  function computeStableSort(issueList: FeedIssue[], rMap: Record<string, string>): FeedIssue[] {
    const completedCount = Object.values(rMap).filter(v => {
      if (!v) return false;
      if (v === 'true') return true;
      try { return JSON.parse(v).state === 'completed'; } catch { return false; }
    }).length;
    if (completedCount < 10) return issueList;

    const reactionMap = getReactions();
    const affinity = computeAffinity(rMap, reactionMap, issueList);

    const read = issueList.filter(i => rMap[i.id]);
    const unread = issueList.filter(i => !rMap[i.id]);

    const scored = unread.map(i => ({ issue: i, score: scoreIssue(i, affinity) }));
    scored.sort((a, b) => b.score - a.score);

    return [...scored.map(s => s.issue), ...read];
  }

  // Compute sort order once when issues first load, then freeze it
  $effect(() => {
    if (issues.length > 0 && !stableSortOrder) {
      const sorted = computeStableSort(issues, readMap);
      stableSortOrder = sorted.map(i => i.id);
    }
  });

  // Apply stable sort to filtered results — order stays fixed during session
  let sortedIssues = $derived.by(() => {
    const base = filteredIssues;
    if (!stableSortOrder) return base;
    const orderMap = new Map(stableSortOrder.map((id, idx) => [id, idx]));
    return [...base].sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));
  });

  // Feed sections: computed from sorted issues + read state
  let feedSections = $derived.by(() => {
    if (isSearching) return []; // search bypasses sections
    return buildFeedSections(sortedIssues, readMap, new Date(), feedSort);
  });

  // Archive grid: filter by sidebar section
  let archiveIssues = $derived.by(() => {
    if (archiveFilter === 'all') return sortedIssues;
    const section = feedSections.find(s => s.kind === archiveFilter);
    if (!section) return sortedIssues;
    const ids = new Set(section.issues.map(i => i.id));
    return sortedIssues.filter(i => ids.has(i.id));
  });

  function archiveSectionLabel(filter: 'all' | SectionKind): string {
    if (filter === 'all') return 'Full archive';
    const section = feedSections.find(s => s.kind === filter);
    return section?.label ?? 'Full archive';
  }

  // #63: Highest-impact unread issue for empty state hero card
  let topUnreadIssue = $derived.by(() => {
    const unread = issues.filter(i => !readMap[i.id]);
    if (unread.length === 0) return null;
    return unread.reduce((winner, issue) => {
      const issueDate = issue.sourceDate ?? '';
      const winnerDate = winner.sourceDate ?? '';
      if (issueDate !== winnerDate) return issueDate > winnerDate ? issue : winner;
      return issue.opinionShift > winner.opinionShift ? issue : winner;
    });
  });

  function syncSurfaceUrl(mode: SurfaceMode, historyMode: Exclude<HistoryMode, 'none'> = 'replace', nextLibraryMode: LibraryMode = libraryMode) {
    if (typeof window === 'undefined') return;
    const target = surfaceUrl(mode, nextLibraryMode);
    const current = window.location.pathname + window.location.search;
    const state = { surface: mode, libraryMode: nextLibraryMode };
    if (historyMode === 'push' && current !== target) {
      history.pushState(state, '', target);
      return;
    }
    history.replaceState(state, '', target);
  }

  // ── Document scroll (X-8) ──
  // Today scrolls the document instead of an inner .today-shell region, so
  // mobile browser bars collapse, pull-to-refresh and scroll restoration are
  // native, and keyboard scrolling needs no focusable region. Surfaces that
  // need a fixed-height shell (the mobile card feed, the desktop reader)
  // keep it.
  let docScroll = $derived(
    shellReady &&
      surfaceMode === 'today' &&
      !isSearching &&
      (viewMode === 'mobile' || (!activeFullIssue && !issueLoading && !issueLoadError)),
  );
  let docScrollWas = false;
  let docScrollSettled = false;
  let savedDocScrollY = 0;
  $effect(() => {
    const on = docScroll;
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('app-doc-scroll', on);
    if (!docScrollSettled) {
      // First pass: leave the browser's own scroll restoration alone.
      docScrollSettled = true;
      docScrollWas = on;
      return;
    }
    if (on === docScrollWas) return;
    docScrollWas = on;
    if (!on) {
      // Leaving Today: keep its place, start the next surface at the top.
      savedDocScrollY = window.scrollY;
      window.scrollTo(0, 0);
    } else {
      const y = savedDocScrollY;
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  });

  // A shared-link visit stays prompt-free until the reader leaves the
  // issue it landed on (R-1).
  function leaveLanding() {
    if (sharedLanding.get()) sharedLanding.set(false);
  }

  function checkViewport() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const compactLandscape = w < 960 && h < 640;

    viewportWidth = w;
    if (w < 768 || compactLandscape) viewMode = 'mobile';
    else viewMode = 'desktop';
  }

  // G1: Debounced resize handler
  let resizeTimer: ReturnType<typeof setTimeout>;
  function debouncedResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(checkViewport, 150);
  }

  function isStandaloneDisplay(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: fullscreen)').matches
      || ('standalone' in window.navigator && window.navigator.standalone === true);
  }

  function syncShellModeClass() {
    const standalone = isStandaloneDisplay();
    document.body.classList.toggle('app-shell-standalone', standalone);
    isStandalone = standalone;
    allowBrowserPullRefresh = !standalone;
  }

  function refreshApp() {
    window.location.reload();
  }

  const goOffline = () => { isOffline = true; };
  const goOnline = () => { isOffline = false; };

  onMount(() => {
    // Phase 1 migration: copy legacy tfa-* keys → tfa:v1:*. Idempotent; short-
    // circuits after first successful pass via the tfa:v1:migrated sentinel.
    // Must run before any other code reads state, so we do it first here and
    // before the storage-availability probe used by StorageBlockedBanner.
    try { migrateReadingState(); } catch { /* storage unavailable; banner handles UI */ }
    document.body.classList.add('app-shell-root');
    if (initialIssue || initialIssueId) sharedLanding.set(true);
    try {
      if (sessionStorage.getItem(TODAY_MODE_KEY) === 'latest') todayMode = 'latest';
    } catch { /* storage blocked */ }
    syncShellModeClass();
    initInstallState();
    showInstall = canInstallCheck();
    installIsIOS = isIOSCheck();
    document.body.dataset.buildId = BUILD_ID;
    checkViewport();
    shellReady = true;
    // Angle Code links (/?sync=CODE) must be read before syncSurfaceUrl below
    // rewrites the URL to the canonical surface path, which drops the query.
    const syncToken = checkUrlSync();
    const currentState = locationAppState();
    surfaceMode = currentState.surfaceMode;
    libraryMode = currentState.libraryMode;
    if (!window.location.pathname.startsWith('/issue/')) {
      syncSurfaceUrl(surfaceMode, 'replace', libraryMode);
    }
    window.addEventListener('resize', debouncedResize);

    // Angle Code: confirm a ?sync= link, then start auto-sync.
    // A ?sync= link must not join this browser silently: linking merges this
    // browser's reading history into the code, where anyone holding it can read it.
    if (syncToken && syncToken !== getAngleCode()) {
      const current = getAngleCode();
      const message =
        `This link connects this browser to Angle Code ${syncToken}.\n\n` +
        'Your reading history on this browser will be added to that code, and anyone who has the code can see it.' +
        (current ? `\n\nIt replaces the code ${current} on this browser.` : '') +
        '\n\nConnect?';
      if (window.confirm(message)) {
        linkAngleCode(syncToken);
      }
    }
    startAutoSync();

    // K2: Offline detection
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    const tier = getAnimationTier();
    document.documentElement.classList.add('anim-tier-' + tier);

    // Deep link with the full issue already in hand: the reader rendered on the
    // first frame. Record the reader entry in history; nothing to fetch.
    if (initialIssue) {
      history.replaceState(
        { reader: true, issueId: initialIssue.id, surface: surfaceMode, libraryMode },
        '',
        window.location.pathname + window.location.search + window.location.hash,
      );
      readerHistoryPushed = true;
    }

    // If feedData was not passed as SSR prop (issue pages), fetch lazily
    if (issues.length === 0) {
      loadFeedIssues().then(data => {
        issues = data;
        feedLoaded = true;
        if (initialIssue) return;
        // Deep link without the issue payload: find it in the feed and open it
        if (initialIssueId) {
          const found = data.find(i => i.id === initialIssueId);
          if (found) {
            activeIssue = found;
            loadAndOpenIssue(found.id, 'replace');
          }
        }
      }).catch(() => { feedLoaded = true; });
    }

    // Load fact graph lazily (non-blocking, low priority)
    loadFactGraph().then(() => { graphLoaded = true; });

    // If feedData was SSR-provided (homepage), deep link is already resolved
    if (initialIssueId && activeIssue && !initialIssue) {
      loadAndOpenIssue(activeIssue.id, 'replace');
    }

    // If position restore (returning user within 24h), auto-open the reader
    if (!initialIssueId && restoredPosition && restoredPosition.cardIndex > 0 && activeIssue) {
      loadAndOpenIssue(activeIssue.id);
    }

    // Push notification: inbox sync + heartbeat + clear on focus
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Listen for incoming notifications to add to inbox
      navigator.serviceWorker.addEventListener('message', (e: MessageEvent) => {
        if (e.data?.type === 'NOTIFICATION_RECEIVED') {
          addNotification({
            title: e.data.title || '',
            body: e.data.body || '',
            issueId: e.data.issueId || '',
            url: e.data.url || '/',
            timestamp: e.data.timestamp || Date.now(),
          });
        }
      });

      // Wait for SW to be ready before sending messages
      navigator.serviceWorker.ready.then((reg) => {
        const sw = reg.active;
        if (!sw) return;

        // Heartbeat
        try {
          const endpoint = localStorage.getItem('tfa:v1:push-endpoint');
          if (endpoint) sw.postMessage({ type: 'HEARTBEAT', endpoint });
        } catch {}

        // Clear notifications on app open
        sw.postMessage({ type: 'APP_VISIBLE' });
      });

      // Clear on tab refocus (with cleanup reference)
      const visHandler = () => {
        if (document.visibilityState === 'visible') {
          navigator.serviceWorker.ready.then((reg) => {
            reg.active?.postMessage({ type: 'APP_VISIBLE' });
          });
        }
      };
      document.addEventListener('visibilitychange', visHandler);
    }

    // Keep SPA state in sync with browser history
    function onPopState(e: PopStateEvent) {
      const nextState = locationAppState();
      const issueMatch = window.location.pathname.match(/^\/issue\/([^/]+)$/);

      searchActive = false;
      searchQuery = '';

      if (issueMatch) {
        const issueId = issueMatch[1];
        surfaceMode = e.state?.surface === 'library' ? 'library' : nextState.surfaceMode;
        libraryMode = normalizeLibraryMode(e.state?.libraryMode ?? nextState.libraryMode);
        if (issues.some((item) => item.id === issueId)) {
          readerHistoryPushed = true;
          void openIssueById(issueId, 'none');
        }
        return;
      }

      readerHistoryPushed = false;
      activeIssue = null;
      activeFullIssue = null;
      surfaceMode = nextState.surfaceMode;
      libraryMode = nextState.libraryMode;
    }
    window.addEventListener('popstate', onPopState);

    const standaloneMedia = window.matchMedia('(display-mode: standalone)');
    const fullscreenMedia = window.matchMedia('(display-mode: fullscreen)');
    standaloneMedia.addEventListener('change', syncShellModeClass);
    fullscreenMedia.addEventListener('change', syncShellModeClass);

    // Signal to the /issue/[id] SSG article CSS that the interactive reader
    // has successfully mounted — the static article hides via a CSS rule keyed
    // on this class. Deferred to the next frame, and placed AFTER all setup
    // above, so any synchronous error earlier in onMount leaves the static
    // article visible. An island crash must never produce a blank page.
    // See ADR-0002 + ADR-0003, and src/pages/issue/[id].astro.
    requestAnimationFrame(() => {
      try {
        document.documentElement.classList.add('js-reader-mounted');
      } catch {
        // If even this throws, the static article remains visible — the
        // resilience story holds.
      }
    });

    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('popstate', onPopState);
      standaloneMedia.removeEventListener('change', syncShellModeClass);
      fullscreenMedia.removeEventListener('change', syncShellModeClass);
    };
  });

  // --- Keep browser tab & meta tags in sync with active issue ---
  const defaultTitle = 'The Fourth Angle — Bite-Sized Malaysian Issues Analysis';
  const defaultDesc = 'Bite-size clarity for smarter thinking and better questions. The strongest check on power is a public that reads.';
  function setMeta(attr: string, value: string, content: string) {
    const el = document.querySelector(`meta[${attr}="${value}"]`);
    if (el) el.setAttribute('content', content);
  }
  function setCanonical(href: string) {
    const el = document.querySelector('link[rel="canonical"]');
    if (el) el.setAttribute('href', href);
  }

  $effect(() => {
    const siteUrl = getSiteOrigin();
    const homeUrl = `${siteUrl}/`;
    if (activeFullIssue) {
      const i = activeFullIssue;
      const title = `${i.headline} — The Fourth Angle`;
      const desc = i.context;
      const url = `${siteUrl}/issue/${i.id}`;
      const image = `${siteUrl}/og/issue-${i.id}.png?v=${encodeURIComponent(BUILD_ID)}`;
      document.title = title;
      setMeta('name', 'description', desc);
      setMeta('property', 'og:title', title);
      setMeta('property', 'og:description', desc);
      setMeta('property', 'og:url', url);
      setMeta('property', 'og:image', image);
      setMeta('property', 'og:image:alt', `${i.headline} — Independent Malaysian issues analysis`);
      setMeta('name', 'twitter:title', title);
      setMeta('name', 'twitter:description', desc);
      setMeta('name', 'twitter:image', image);
      setMeta('name', 'twitter:image:alt', `${i.headline} — Independent Malaysian issues analysis`);
      setCanonical(url);
    } else {
      document.title = defaultTitle;
      setMeta('name', 'description', defaultDesc);
      setMeta('property', 'og:title', defaultTitle);
      setMeta('property', 'og:description', defaultDesc);
      setMeta('property', 'og:url', homeUrl);
      setMeta('property', 'og:image', `${siteUrl}/og-image.png?v=${encodeURIComponent(BUILD_ID)}`);
      setMeta('property', 'og:image:alt', `${defaultTitle} — Independent Malaysian issues analysis`);
      setMeta('name', 'twitter:title', defaultTitle);
      setMeta('name', 'twitter:description', defaultDesc);
      setMeta('name', 'twitter:image', `${siteUrl}/og-image.png?v=${encodeURIComponent(BUILD_ID)}`);
      setMeta('name', 'twitter:image:alt', `${defaultTitle} — Independent Malaysian issues analysis`);
      setCanonical(homeUrl);
    }
  });

  // --- History state for reader back-button support ---
  let readerHistoryPushed = false;

  async function loadAndOpenIssue(id: string, historyMode: HistoryMode = 'push') {
    issueLoading = true;
    issueLoadError = false;
    try {
      const full = await loadFullIssue(id);
      if (full) {
        activeFullIssue = full;
        issueLoadError = false;
      } else {
        issueLoadError = true;
      }
    } catch {
      issueLoadError = true;
    }
    issueLoading = false;
    // Sync URL to reflect the active issue
    const issuePath = `/issue/${id}`;
    if (historyMode === 'none') {
      return;
    }
    if (historyMode === 'push') {
      history.pushState({ reader: true, issueId: id, surface: surfaceMode, libraryMode }, '', issuePath);
      readerHistoryPushed = true;
    } else {
      history.replaceState({ reader: true, issueId: id, surface: surfaceMode, libraryMode }, '', issuePath);
      readerHistoryPushed = true;
    }
  }

  async function openIssueById(id: string, historyMode: HistoryMode = 'push') {
    if (historyMode !== 'none') leaveLanding();
    const target = issues.find((item) => item.id === id) ?? null;
    if (target) {
      activeIssue = target;
    }
    readerOriginRect = null;
    restoredCardIndex = 0;
    await loadAndOpenIssue(id, historyMode);
  }

  // Origin rect for shared-element transition
  let readerOriginRect: DOMRect | null = $state(null);

  // Fact graph loaded flag — triggers re-render of connection dots on feed cards
  let graphLoaded = $state(false);

  function issueHasConnections(id: string): boolean {
    if (!graphLoaded) return false;
    return getConnectionCount(id) >= 2;
  }

  // Connections for the active issue — derived from fact graph
  let activeConnections = $derived.by(() => {
    if (!activeIssue) return [];
    return getConnections(activeIssue.id);
  });

  // Resolve connection data: enrich with headlines, read state, reactions from feed
  let resolvedConnections = $derived.by(() => {
    return activeConnections.map(c => {
      const feedIssue = issues.find(i => i.id === c.id);
      const readRaw = readMap[c.id];
      let readState: string | null = null;
      if (readRaw === 'true') readState = 'completed';
      else if (readRaw) {
        try { readState = JSON.parse(readRaw).state ?? null; } catch {}
      }
      return {
        ...c,
        headline: feedIssue?.headline ?? '',
        opinionShift: feedIssue?.opinionShift ?? 0,
        readState,
        hasReaction: hasReaction(c.id),
      };
    }).filter(c => c.headline);
  });

  // Navigate to a connected issue from within a reader
  function navigateToIssue(issueId: string) {
    leaveLanding();
    const target = issues.find(i => i.id === issueId);
    if (target) {
      activeIssue = null;
      activeFullIssue = null;
      readerOriginRect = null;
      // Small delay for reader to close, then open new issue
      requestAnimationFrame(() => openIssue(target));
    }
  }

  // Preload issue data on pointerdown — starts fetch before tap fires
  function prefetchIssue(issue: FeedIssue) {
    loadFullIssue(issue.id); // fire-and-forget, result is cached
  }

  function openIssue(issue: FeedIssue, originRect?: DOMRect) {
    leaveLanding();
    closeSidebar();
    activeIssue = issue;
    readerOriginRect = originRect ?? null;
    restoredCardIndex = 0; // Clear resume position — only used once on return
    cinemaPeek = false;
    loadAndOpenIssue(issue.id, 'push');
  }

  function openIssueAtCard(issue: FeedIssue, cardIndex: number) {
    leaveLanding();
    closeSidebar();
    activeIssue = issue;
    readerOriginRect = null;
    restoredCardIndex = Math.max(0, Math.min(cardIndex, Math.max(issue.cards.length - 1, 0)));
    savePosition(issue.id, restoredCardIndex);
    cinemaPeek = false;
    loadAndOpenIssue(issue.id, 'push');
  }

  function activateSurface(mode: SurfaceMode, historyMode: Exclude<HistoryMode, 'none'> = 'push', nextLibraryMode: LibraryMode = libraryMode) {
    leaveLanding();
    searchQuery = '';
    searchActive = false;
    surfaceMode = mode;
    libraryMode = nextLibraryMode;
    if (activeIssue || activeFullIssue) {
      activeIssue = null;
      activeFullIssue = null;
      readerHistoryPushed = false;
    }
    syncSurfaceUrl(mode, historyMode, nextLibraryMode);
  }

  function goToday() {
    activateSurface('today', 'push');
  }

  function openLibrary(nextMode: LibraryMode = libraryMode, historyMode: Exclude<HistoryMode, 'none'> = 'push') {
    activateSurface('library', historyMode, nextMode);
  }

  function openReadingLibrary() {
    openLibrary('reading');
  }

  function openHighlightsLibrary() {
    openLibrary('highlights');
  }

  function openArchiveLibrary() {
    openLibrary('archive');
  }

  function closeReader(historyMode: Exclude<HistoryMode, 'none'> = 'replace') {
    leaveLanding();
    activeIssue = null;
    activeFullIssue = null;
    readerHistoryPushed = false;
    cinemaPeek = false;
    syncSurfaceUrl(surfaceMode, historyMode, libraryMode);
  }

  function openNextIssue() {
    if (!activeIssue) return;
    leaveLanding();
    const sequence = sortedIssues.length > 0 ? sortedIssues : issues;
    const idx = sequence.findIndex(i => i.id === activeIssue!.id);
    if (idx >= 0 && idx < sequence.length - 1) {
      const next = sequence[idx + 1];
      activeIssue = next;
      loadAndOpenIssue(next.id, 'replace');
    }
  }

  let isLastIssue = $derived.by(() => {
    if (!activeIssue) return true;
    const sequence = sortedIssues.length > 0 ? sortedIssues : issues;
    const idx = sequence.findIndex(i => i.id === activeIssue!.id);
    return idx >= sequence.length - 1;
  });

  let nextHeadline = $derived.by(() => {
    if (!activeIssue) return '';
    const sequence = sortedIssues.length > 0 ? sortedIssues : issues;
    const idx = sequence.findIndex(i => i.id === activeIssue!.id);
    return idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1].headline : '';
  });

  $effect(() => {
    if (typeof window === 'undefined' || activeIssue || activeFullIssue || window.location.pathname.startsWith('/issue/')) return;
    const target = surfaceUrl(surfaceMode, libraryMode);
    if (window.location.pathname + window.location.search !== target) {
      history.replaceState({ surface: surfaceMode, libraryMode }, '', target);
    } else if (history.state?.surface !== surfaceMode || history.state?.libraryMode !== libraryMode) {
      history.replaceState({ surface: surfaceMode, libraryMode }, '', target);
    }
  });

  // Keyboard nav for desktop feed
  onMount(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !searchActive)) {
        if (viewMode !== 'mobile') {
          e.preventDefault();
          onSearchFocus();
          const input = document.querySelector('[data-search-input]') as HTMLInputElement;
          input?.focus();
          return;
        }
      }
      if (e.key === 'Escape' && sidebarOpen) { closeSidebar(true); return; }
      if (e.key === 'Escape' && searchActive) { onSearchClear(); return; }
      if (viewMode !== 'desktop') return;
      if (e.key === 'Escape' && activeIssue) {
        // First Escape in cinema mode: dismiss focus mode (sidebar returns
        // for the rest of this tab session)
        if (activeFullIssue && viewportWidth >= 1920 && !cinemaDismissed) {
          dismissCinema();
          return;
        }
        closeReader();
        return;
      }
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!activeIssue && issues.length) { openIssue(issues[0]); return; }
        const idx = issues.findIndex(i => i.id === activeIssue!.id);
        if (idx < issues.length - 1) openIssue(issues[idx + 1]);
      }
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!activeIssue) return;
        const idx = issues.findIndex(i => i.id === activeIssue!.id);
        if (idx > 0) openIssue(issues[idx - 1]);
      }
      if (e.key === 'Enter') {
        if (!activeIssue && issues.length) { openIssue(issues[0]); return; }
        if (activeIssue) openIssue(activeIssue);
      }
    }
    window.addEventListener('keydown', onKeyDown);

    // Listen for notification clicks to open specific issues
    function onNotifOpen(e: Event) {
      const id = (e as CustomEvent).detail?.issueId;
      if (id) {
        void openIssueById(id, 'push');
      }
    }
    window.addEventListener('t4a-open-issue', onNotifOpen);

    // Listen for SW navigate messages (notification click when app already open)
    function onSwMessage(e: MessageEvent) {
      if (e.data?.type === 'NAVIGATE_TO' && e.data.url) {
        const match = e.data.url.match(/\/issue\/(\w+)/);
        if (match) {
          void openIssueById(match[1], 'push');
        }
      }
    }
    navigator.serviceWorker?.addEventListener('message', onSwMessage);

    return () => {
      document.body.classList.remove('app-shell-root');
      document.body.classList.remove('app-shell-standalone');
      delete document.body.dataset.buildId;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('t4a-open-issue', onNotifOpen);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      navigator.serviceWorker?.removeEventListener('message', onSwMessage);
    };
  });
</script>

<!--
  Deep links render nothing on the server and while hydrating (shellReady is
  false until onMount), so the static article is the only thing on screen
  until the reader can replace it in a single frame. Keeping the island
  server-rendered (rather than client:only) keeps its CSS in the chunk the
  homepage already uses.
-->
{#if shellReady}
{#if isOffline}
  <div role="status" aria-live="polite" style="background:var(--score-warning);color:#fff;text-align:center;padding:6px;font-family:var(--font-body);font-size: var(--text-sm);font-weight:600;position:sticky;top:0;left:0;right:0;z-index:9999;flex-shrink:0;">You're offline — reading cached content</div>
{/if}
<StorageBlockedBanner />

  {#if viewMode === 'mobile'}
  <div class="app-shell app-shell--mobile" class:app-shell--doc={docScroll} style={docScroll ? `--dock-space:${dockHeight}px;` : undefined}>
    <Header
      issues={issues.map(i => ({id: i.id, headline: i.headline}))}
      onHome={goToday}
      homeActive={surfaceMode === 'today' && !activeIssue}
      onSearchToggle={() => { searchActive = true; loadSearchIndex(); }}
      searchMode={searchActive}
      {searchQuery}
      onSearchInput={(q) => { searchQuery = q; }}
      onSearchClear={onSearchClear}
      collapseOnScroll={docScroll && !searchActive}
    />
    <main class="app-main">
      {#if !searchActive}
        {#if surfaceMode !== 'today' && !(surfaceMode === 'library' && libraryMode === 'highlights' && sortedIssues.length > 0)}
          <h1 class="sr-only">{pageHeading(surfaceMode, libraryMode)}</h1>
        {/if}
        {#if surfaceMode === 'library'}
          <!-- Only Library has a secondary bar; on Today an empty bordered
               strip used to sit under the header (H-7). -->
          <div class="mobile-secondary-bar mobile-secondary-bar--library">
            <LibraryTabs
              libraryMode={libraryMode}
              {readingCount}
              {highlightCount}
              archiveCount={issues.length}
              panelId="mobile-library-panel"
              idPrefix="mobile-library"
              onOpenReading={openReadingLibrary}
              onOpenHighlights={openHighlightsLibrary}
              onOpenArchive={openArchiveLibrary}
            />
          </div>
        {/if}
      {/if}
    {#if isSearching}
      <div class="sr-only" role="status" aria-live="polite">{searchStatusMessage}</div>
    {/if}
    {#if surfaceMode === 'today' && !isSearching}
      <div class="mobile-today-panel">
        <TodayView loading={!feedLoaded} issueCount={issues.length} topIssue={topUnreadIssue} issues={sortedIssues} sections={feedSections} {readMap} {readingCount} highlightCount={highlightCount} mode={todayMode} onModeChange={setTodayMode} idPrefix="mobile" showWelcome={activePrompt === 'welcome'} onDismissWelcome={dismissWelcome} onOpenIssue={openIssue} onOpenLibraryReading={openReadingLibrary} onOpenLibraryHighlights={openHighlightsLibrary} onOpenLibraryArchive={openArchiveLibrary} />
      </div>
    {:else if isSearching && sortedIssues.length === 0}
      <div class="mobile-search-empty">
        <SearchEmpty query={searchQuery} topics={searchTopics} onClear={onSearchClear} onBrowseAll={browseAllFromSearch} />
      </div>
    {:else if !isSearching && surfaceMode === 'library' && libraryMode === 'highlights' && sortedIssues.length > 0}
      <div
        id="mobile-library-panel"
        role="tabpanel"
        aria-labelledby="mobile-library-highlights"
        tabindex="0"
        style="flex:1;min-height:0;display:flex;flex-direction:column;"
      >
        <HighlightsPanel
          issues={sortedIssues}
          reactionMap={appReactionMap}
          onOpenHighlight={openIssueAtCard}
        />
      </div>
    {:else if !isSearching && surfaceMode === 'library' && sortedIssues.length === 0}
      <section style="flex:1;display:flex;align-items:center;justify-content:center;padding:24px 18px 32px;background:linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg) 28%);">
        <div style="max-width:320px;text-align:center;">
          <div style="font-size: var(--text-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-tertiary);">Library · {libraryLabel(libraryMode)}</div>
	          <p style="margin:10px 0 0;font-family:var(--font-display);font-size: var(--text-title-lg);line-height:1.04;letter-spacing:-0.04em;color:var(--text-primary);">{libraryEmptyTitle(libraryMode)}</p>
          <p style="font-size: var(--text-body);line-height:1.6;color:var(--text-secondary);margin:16px 0 0;">{libraryEmptyCopy(libraryMode)}</p>
          <button onclick={goToday} style="margin-top:18px;padding:0 18px;min-height:44px;border-radius: var(--radius-pill);border:1px solid var(--border-divider);background:var(--bg-elevated);color:var(--text-primary);font:inherit;font-size: var(--text-ui);font-weight:700;cursor:pointer;">Return to Today</button>
        </div>
      </section>
    {:else if surfaceMode === 'library' && !isSearching}
      <div
        id="mobile-library-panel"
        role="tabpanel"
        aria-labelledby={`mobile-library-${libraryMode}`}
        tabindex="0"
        style="flex:1;min-height:0;display:flex;flex-direction:column;"
      >
        <MobileBrowser issues={sortedIssues} sections={feedSections} onOpenIssue={openIssue} onPrefetch={prefetchIssue} {initialFeedIndex} {issueHasConnections} searchQuery={isSearching ? searchQuery : ''} sortMode={feedSort} onSortChange={(mode) => { feedSort = mode; }} allowPullRefresh={allowBrowserPullRefresh} onPullRefresh={refreshApp} />
      </div>
    {:else}
      <MobileBrowser issues={sortedIssues} sections={feedSections} onOpenIssue={openIssue} onPrefetch={prefetchIssue} {initialFeedIndex} {issueHasConnections} searchQuery={isSearching ? searchQuery : ''} sortMode={feedSort} onSortChange={(mode) => { feedSort = mode; }} allowPullRefresh={allowBrowserPullRefresh} onPullRefresh={refreshApp} />
    {/if}
    </main>
    {#if !searchActive && !activeFullIssue}
      <MobileDock
        surfaceMode={surfaceMode}
        {libraryCount}
        onGoToday={goToday}
        onOpenLibrary={() => openLibrary()}
        prompt={dockPrompt}
        {installIsIOS}
        onSyncTap={openSyncPanel}
        onSyncDismiss={dismissSyncPrompt}
        onInstallTap={acceptInstallPrompt}
        onInstallDismiss={dismissInstallPrompt}
        floating={docScroll}
        bind:height={dockHeight}
      />
    {/if}
  </div>

  {#if activeFullIssue}
    <InsightReader issue={activeFullIssue} onClose={closeReader} onReturnHome={goToday} onNext={isLastIssue ? undefined : openNextIssue} onNavigateToIssue={navigateToIssue} initialCardIndex={restoredCardIndex} originRect={readerOriginRect ?? undefined} connections={resolvedConnections} nextIssueHeadline={nextHeadline} animateEntry={!readerIsLanding} />
  {/if}

{:else}
  {@const cinemaActive = !!activeFullIssue && viewportWidth >= 1920 && !cinemaDismissed}
  {@const cinemaCollapsed = cinemaActive && !cinemaPeek}
  <div class="app-shell app-shell--desktop" class:app-shell--doc={docScroll} class:cinema={cinemaActive} class:cinema-collapsed={cinemaCollapsed} class:sidebar-open={sidebarOpen} style={`--app-header-height:${desktopHeaderHeight || 64}px;`}>
    {#if cinemaActive && activeFullIssue}
      <div
        class="cinema-stage"
        aria-hidden="true"
        style="background-image:url(/og/backgrounds/issue-{activeFullIssue.id}-bg.png);"
      ></div>
      <div
        class="cinema-peek-zone"
        aria-hidden="true"
        onmouseenter={() => { cinemaPeek = true; }}
      ></div>
      <button
        type="button"
        class="cinema-exit"
        aria-label="Exit focus mode"
        title="Exit focus mode (Esc) — sidebar stays visible for the rest of this session"
        onclick={dismissCinema}
      >Exit focus</button>
    {/if}
    <div class="desktop-header-wrap" bind:offsetHeight={desktopHeaderHeight}>
      <Header issues={issues.map(i => ({id: i.id, headline: i.headline}))} onHome={goToday} homeActive={surfaceMode === 'today' && !activeIssue} onBrowseToggle={toggleSidebar} browseOpen={sidebarOpen} />
    </div>
    {#if sidebarOpen}
      <!-- Tablet drawer backdrop; hidden by CSS from 1024 px, where the sidebar is always shown. -->
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (Escape closes it from the keyboard) -->
      <div class="sidebar-backdrop" aria-hidden="true" onclick={() => closeSidebar(true)}></div>
    {/if}

    <div
      class="app-main app-main--desktop"
      onmouseleave={() => { if (cinemaActive) cinemaPeek = false; }}
    >
      <!-- Sidebar first in the DOM: it is on the left, so keyboard and
           screen-reader order now match what is on screen. -->
      <aside id="app-sidebar" class="app-sidebar" bind:this={sidebarEl} tabindex="-1" style="display:flex;flex-direction:column;flex-shrink:0;" aria-label="Sidebar">
      <DesktopFeed
        issues={sortedIssues}
        sections={feedSections}
        loading={!feedLoaded}
        activeId={activeIssue?.id ?? null}
        {readMap}
        {surfaceMode}
        {libraryMode}
        {readingCount}
        {highlightCount}
        archiveCount={issues.length}
        {libraryCount}
        onGoToday={goToday}
        onOpenLibrary={() => openLibrary()}
        onOpenReading={() => openLibrary('reading', 'replace')}
        onOpenHighlights={openHighlightsLibrary}
        onOpenArchive={() => openLibrary('archive', 'replace')}
        onSelectIssue={(issue) => {
          closeSidebar();
          if (surfaceMode === 'library' && libraryMode === 'highlights') {
            openIssueAtCard(issue, appReactionMap[issue.id]?.[0] ?? 0);
            return;
          }
          openIssue(issue);
        }}
        {searchQuery}
        onSearchInput={(q) => { searchQuery = q; }}
        {onSearchFocus}
        {onSearchClear}
        {issueHasConnections}
        sortMode={feedSort}
        onSortChange={(mode) => { feedSort = mode; }}
        {archiveFilter}
        onArchiveFilter={(kind) => { archiveFilter = kind; }}
        showSyncBanner={activePrompt === 'sync'}
        onSyncBannerTap={openSyncPanel}
        onSyncBannerDismiss={dismissSyncPrompt}
      />
      </aside>

      <main class="desktop-main-panel">
        {#if issueLoadError}
          <!-- I1: Error state with offline differentiation -->
          <div style="flex:1;display:flex;align-items:center;justify-content:center;">
            <div style="text-align:center;max-width:300px;">
              <p style="font-family:var(--font-display);font-size: var(--text-body);font-weight:600;color:var(--text-primary);margin:0 0 8px;">{isOffline ? "You're offline" : "Couldn't load this issue"}</p>
              <p style="font-family:var(--font-body);font-size: var(--text-ui);color:var(--text-muted);margin:0 0 16px;">{isOffline ? "This issue hasn't been cached yet. Connect to the internet to read it." : "Something went wrong. Try again."}</p>
              <button onclick={() => { if (activeIssue) loadAndOpenIssue(activeIssue.id); }} style="padding:8px 20px;background:var(--text-primary);color:var(--bg);border:none;border-radius: var(--radius-md);font-size: var(--text-ui);font-weight:600;cursor:pointer;min-height:44px;">Retry</button>
            </div>
          </div>
        {:else if issueLoading}
          <!-- I2: Skeleton loader -->
          <div style="flex:1;padding:40px 24px;max-width:640px;margin:0 auto;">
            <div style="height:28px;width:70%;background:var(--bg-sunken);border-radius: var(--radius-sm);margin-bottom:16px;animation:shimmer 1.5s infinite;"></div>
            <div style="height:16px;width:100%;background:var(--bg-sunken);border-radius: var(--radius-sm);margin-bottom:8px;animation:shimmer 1.5s infinite;"></div>
            <div style="height:16px;width:85%;background:var(--bg-sunken);border-radius: var(--radius-sm);margin-bottom:24px;animation:shimmer 1.5s infinite;"></div>
            <div style="height:6px;width:100%;background:var(--bg-sunken);border-radius: var(--radius-pill);margin-bottom:32px;animation:shimmer 1.5s infinite;"></div>
            <div style="height:20px;width:50%;background:var(--bg-sunken);border-radius: var(--radius-sm);margin-bottom:12px;animation:shimmer 1.5s infinite;"></div>
            <div style="height:14px;width:90%;background:var(--bg-sunken);border-radius: var(--radius-sm);margin-bottom:8px;animation:shimmer 1.5s infinite;"></div>
            <div style="height:14px;width:75%;background:var(--bg-sunken);border-radius: var(--radius-sm);animation:shimmer 1.5s infinite;"></div>
          </div>
        {:else if activeFullIssue}
          <DesktopReader
            issue={activeFullIssue}
            onReturnHome={goToday}
            onNext={isLastIssue ? undefined : openNextIssue}
            {nextHeadline}
            connections={resolvedConnections}
            onNavigateToIssue={navigateToIssue}
            initialCardIndex={restoredCardIndex}
          />
        {:else if surfaceMode === 'library' && sortedIssues.length === 0}
          <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:32px;background:linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg) 24%);">
            <div style="max-width:420px;text-align:center;">
              <div style="font-size: var(--text-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-tertiary);">
                Library · {libraryLabel(libraryMode)}
              </div>
              <h1 style="margin:10px 0 0;font-family:var(--font-display);font-size: var(--text-title-lg);line-height:1.15;letter-spacing:-0.04em;color:var(--text-primary);">{libraryEmptyTitle(libraryMode)}</h1>
              <p style="font-size: var(--text-body);line-height:1.6;color:var(--text-secondary);margin:16px 0 0;">
                {libraryEmptyCopy(libraryMode)}
              </p>
            </div>
          </div>
        {:else if surfaceMode === 'library' && libraryMode === 'highlights'}
          <HighlightsPanel
            issues={sortedIssues}
            reactionMap={appReactionMap}
            onOpenHighlight={openIssueAtCard}
          />
        {:else if surfaceMode === 'library' && libraryMode === 'archive'}
          <!-- Archive grid: browsable card grid in main panel -->
          <div style="flex:1;overflow-y:auto;padding:32px 24px;">
            <div style="margin-bottom:24px;">
              <div style="font-size: var(--text-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-tertiary);">Library · Archive</div>
              <div style="display:flex;align-items:baseline;gap:12px;margin:8px 0 0;">
                <h1 style="margin:0;font-family:var(--font-display);font-size: var(--text-title-lg);line-height:1.15;letter-spacing:-0.02em;color:var(--text-primary);">{archiveSectionLabel(archiveFilter)}</h1>
                {#if archiveFilter !== 'all'}
                  <button onclick={() => { archiveFilter = 'all'; }} style="background:none;border:none;cursor:pointer;font-size:var(--text-sm);color:var(--score-info);font-weight:600;padding:0;">Show all</button>
                {/if}
              </div>
              <p style="font-size: var(--text-body);line-height:1.6;color:var(--text-secondary);margin:8px 0 0;">{archiveIssues.length}{archiveFilter !== 'all' ? ` of ${sortedIssues.length}` : ''} issues{archiveFilter === 'all' ? ' published' : ''}</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;">
              {#each archiveIssues as issue, i}
                <DesktopCard {issue} index={i} readState={getState(issue.id)} onOpen={() => openIssue(issue)} onPrefetch={() => prefetchIssue(issue)} hasReaction={hasReaction(issue.id)} hasConnections={issueHasConnections(issue.id)} />
              {/each}
            </div>
          </div>
        {:else if surfaceMode === 'library'}
          <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:32px;background:linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg) 24%);">
            <div style="max-width:420px;text-align:center;">
              <div style="font-size: var(--text-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-tertiary);">Library · {libraryLabel(libraryMode)}</div>
              <h1 style="margin:12px 0 0;font-family:var(--font-display);font-size: var(--text-title-lg);line-height:1.15;letter-spacing:-0.04em;color:var(--text-primary);">
                {libraryMode === 'highlights'
                  ? 'Choose an issue with saved angles.'
                  : 'Choose the next issue from your library.'}
              </h1>
              <p style="font-size: var(--text-body);line-height:1.6;color:var(--text-secondary);margin:16px 0 0;">
                {libraryMode === 'highlights'
                  ? 'The left rail shows every issue with highlights. Open one to revisit the angles you kept.'
                  : 'The left rail already holds your current reading memory. Pick an issue there to continue.'}
              </p>
            </div>
          </div>
        {:else if isSearching && sortedIssues.length > 0}
          <!-- Search results in main panel -->
          <div style="flex:1;overflow-y:auto;padding:32px 24px;">
            <div style="margin-bottom:24px;">
              <div style="font-size: var(--text-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-tertiary);">Search results</div>
              <p style="font-size: var(--text-body);color:var(--text-secondary);margin:8px 0 0;">{searchResultCount} result{searchResultCount !== 1 ? 's' : ''} for "{searchQuery.trim()}"</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;">
              {#each sortedIssues as issue, i}
                <DesktopCard {issue} index={i} readState={getState(issue.id)} onOpen={() => openIssue(issue)} onPrefetch={() => prefetchIssue(issue)} hasReaction={hasReaction(issue.id)} hasConnections={issueHasConnections(issue.id)} />
              {/each}
            </div>
          </div>
        {:else if isSearching}
          <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:32px;">
            <SearchEmpty query={searchQuery} topics={searchTopics} onClear={onSearchClear} onBrowseAll={browseAllFromSearch} />
          </div>
        {:else}
          <TodayView loading={!feedLoaded} issueCount={issues.length} topIssue={topUnreadIssue} issues={sortedIssues} sections={feedSections} {readMap} {readingCount} highlightCount={highlightCount} mode={todayMode} onModeChange={setTodayMode} idPrefix="desktop" showWelcome={activePrompt === 'welcome'} onDismissWelcome={dismissWelcome} onOpenIssue={openIssue} onOpenLibraryReading={openReadingLibrary} onOpenLibraryHighlights={openHighlightsLibrary} onOpenLibraryArchive={openArchiveLibrary} />
        {/if}
      </main>
    </div>
  </div>
{/if}

<!-- Angle Code panel (bottom sheet on mobile/tablet, overlay on desktop) -->
{#if angleCodeOpen}
  <div
    class="angle-overlay"
    onclick={(e) => { if (e.target === e.currentTarget) angleCodeOpen = false; }}
    role="dialog"
    aria-modal="true"
    aria-label="Angle Code — cross-device sync"
  >
    <div class="angle-sheet">
      <div class="angle-sheet-handle"></div>
      <AngleCode onClose={() => { angleCodeOpen = false; }} />
    </div>
  </div>
{/if}
{/if}

<style>
  .app-shell {
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--bg);
  }

  .app-shell--mobile,
  .app-shell--desktop {
    height: 100vh;
    height: -webkit-fill-available; /* Safari 15.0–15.3 fallback */
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Today: the document scrolls (X-8). The shell grows with its content;
     overflow must stay visible so the sticky header and sidebar stick to
     the viewport. */
  .app-shell.app-shell--doc {
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
    overflow: visible;
  }

  .app-shell--doc .app-main {
    flex: 1 0 auto;
    overflow: visible;
  }

  /* Keep the last line clear of the fixed dock. */
  .app-shell--mobile.app-shell--doc .app-main {
    padding-bottom: var(--dock-space, 88px);
  }

  .desktop-header-wrap {
    flex-shrink: 0;
    border-bottom: 1px solid var(--bg-sunken);
    position: relative;
    z-index: 30;
  }

  .app-shell--doc .desktop-header-wrap {
    position: sticky;
    top: 0;
  }

  /* With the document scrolling, the sidebar sticks under the header and
     keeps its own scroll. */
  .app-shell--doc .app-main--desktop :global(aside.app-sidebar) {
    position: sticky;
    top: var(--app-header-height, 64px);
    height: calc(100vh - var(--app-header-height, 64px));
    height: calc(100dvh - var(--app-header-height, 64px));
    align-self: flex-start;
  }

  .app-sidebar:focus {
    outline: none;
  }

  /* ─────────────────────────────────────────────────────────────────
     Cinema Mode — focused reader at ≥1920px
     The sidebar retreats, the issue's background art tints the flanks
     at very low opacity, the prose stays at readable width.
     Hover the left edge to peek the sidebar; press Esc to exit.
     ───────────────────────────────────────────────────────────────── */
  .app-shell--desktop.cinema {
    position: relative;
  }

  .cinema-stage {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(96px) saturate(1.45);
    opacity: 0.11;
    pointer-events: none;
    /* Vignette: keep the centre clean (where prose lives), let the
       blurred art tint only the flanks */
    -webkit-mask-image: radial-gradient(ellipse 880px 110% at center, transparent 0%, transparent 24%, rgba(0,0,0,0.85) 72%, black 100%);
    mask-image: radial-gradient(ellipse 880px 110% at center, transparent 0%, transparent 24%, rgba(0,0,0,0.85) 72%, black 100%);
    animation: cinema-stage-in 720ms cubic-bezier(0.32, 0.72, 0, 1) both;
  }

  @keyframes cinema-stage-in {
    from { opacity: 0; filter: blur(120px) saturate(1.45); }
    to   { opacity: 0.11; filter: blur(96px) saturate(1.45); }
  }

  /* Hover-edge sentinel: invisible 18px strip on the left.
     When the cursor enters it, peek the sidebar back. */
  .cinema-peek-zone {
    position: fixed;
    top: 0;
    left: 0;
    width: 18px;
    height: 100vh;
    z-index: 8;
    pointer-events: auto;
  }

  /* Subtle "Exit focus" affordance: small ghost pill, top-right.
     Visible only when not actively reading the centre column. */
  .cinema-exit {
    position: fixed;
    top: 78px;
    right: 24px;
    z-index: 11;
    padding: 7px 14px;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--text-tertiary);
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-pill);
    cursor: pointer;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 320ms ease, transform 320ms cubic-bezier(0.32, 0.72, 0, 1), background 200ms ease;
    animation: cinema-exit-in 720ms 480ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
  }

  @keyframes cinema-exit-in {
    to { opacity: 1; transform: translateY(0); }
  }

  @media (hover: hover) {
    .cinema-exit:hover {
      background: rgba(255, 255, 255, 0.85);
      color: var(--text-primary);
    }
  }

  /* Collapsed sidebar: width animates to 0, content fades */
  .app-shell--desktop.cinema-collapsed :global(aside[aria-label="Sidebar"]) {
    width: 0 !important;
    opacity: 0;
    pointer-events: none;
    overflow: hidden;
    transition:
      width 480ms cubic-bezier(0.32, 0.72, 0, 1),
      opacity 320ms ease;
  }

  /* Peek state: sidebar floats back over the content (does not reflow) */
  .app-shell--desktop.cinema:not(.cinema-collapsed) :global(aside[aria-label="Sidebar"]) {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 7;
    box-shadow: 0 24px 64px rgba(15, 15, 35, 0.22);
    transition:
      transform 420ms cubic-bezier(0.32, 0.72, 0, 1),
      box-shadow 320ms ease;
  }

  /* Sidebar transition baseline (so collapse/peek animate smoothly both ways) */
  .app-shell--desktop.cinema :global(aside[aria-label="Sidebar"]) {
    transition:
      width 480ms cubic-bezier(0.32, 0.72, 0, 1),
      opacity 320ms ease;
    will-change: width, opacity;
  }

  /* Header and main content sit above the cinema-stage */
  .app-shell--desktop.cinema .app-main--desktop {
    position: relative;
    z-index: 1;
  }

  /* Dark mode: the tint is naturally warmer/darker; bump opacity slightly */
  @media (prefers-color-scheme: dark) {
    .cinema-stage {
      opacity: 0.18;
      filter: blur(96px) saturate(1.6) brightness(1.15);
    }
    .cinema-exit {
      background: rgba(28, 28, 32, 0.55);
      color: var(--text-secondary);
    }
    .cinema-exit:hover {
      background: rgba(28, 28, 32, 0.85);
      color: var(--text-primary);
    }
  }

  /* Reduced motion: no animations, instant transitions */
  @media (prefers-reduced-motion: reduce) {
    .cinema-stage,
    .cinema-exit,
    .app-shell--desktop.cinema :global(aside[aria-label="Sidebar"]) {
      animation: none !important;
      transition: none !important;
    }
    .cinema-exit { opacity: 1; transform: none; }
  }

  .app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  /* Capped canvas (H-8): one width from 1440 px up, so wide screens get
     margins instead of 180-character lines. */
  .app-main--desktop {
    flex-direction: row;
    max-width: 1440px;
    margin: 0 auto;
    width: 100%;
  }

  .desktop-main-panel {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  /* Tablet (768-1023 px): the sidebar is a drawer behind the header's
     Browse toggle, so the reading column gets the full width. */
  @media (min-width: 768px) and (max-width: 1023px) {
    .app-main--desktop :global(aside.app-sidebar) {
      position: fixed !important;
      top: 0 !important;
      bottom: 0;
      left: 0;
      z-index: 60;
      width: min(360px, 88vw) !important;
      height: 100% !important;
      background: var(--bg-elevated);
      box-shadow: 0 24px 64px rgba(15, 15, 35, 0.22);
      transform: translateX(-104%);
      visibility: hidden;
      transition: transform 240ms var(--ease-out-cubic, ease-out), visibility 0s linear 240ms;
    }

    .sidebar-open .app-main--desktop :global(aside.app-sidebar) {
      transform: none;
      visibility: visible;
      transition: transform 240ms var(--ease-out-cubic, ease-out);
    }

    .app-main--desktop :global(aside.desktop-sidebar) {
      width: 100% !important;
    }

    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      z-index: 55;
      background: rgba(15, 15, 35, 0.48);
    }
  }

  @media (max-width: 767px), (min-width: 1024px) {
    .sidebar-backdrop {
      display: none;
    }
  }

  /* Mid-range sidebar for 1024-1280px */
  @media (min-width: 1024px) and (max-width: 1280px) {
    .app-main--desktop :global(aside[aria-label]) {
      width: 280px !important;
    }
  }

  .mobile-secondary-bar {
    flex-shrink: 0;
    padding: 4px 16px 6px;
    border-bottom: 1px solid var(--border-subtle);
    background:
      linear-gradient(180deg, rgba(248, 249, 250, 0.82) 0%, rgba(248, 249, 250, 0.54) 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .mobile-secondary-bar--library {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .mobile-today-panel {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
  }

  .mobile-search-empty {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  @media (prefers-color-scheme: dark) {
    .mobile-secondary-bar {
      border-bottom-color: rgba(255, 255, 255, 0.08);
      background:
        linear-gradient(180deg, rgba(22, 20, 18, 0.94) 0%, rgba(22, 20, 18, 0.78) 100%);
    }
  }

  /* Angle Code overlay */
  .angle-overlay {
    position: fixed;
    inset: 0;
    z-index: 9000;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    animation: fadeIn 0.15s ease;
  }

  .angle-sheet {
    width: 100%;
    max-width: 420px;
    background: var(--bg-elevated);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.16);
    animation: slideUp 0.25s cubic-bezier(0.33, 1, 0.68, 1);
    max-height: 85vh;
    overflow-y: auto;
  }

  .angle-sheet-handle {
    width: 36px;
    height: 4px;
    background: var(--border-divider);
    border-radius: 2px;
    margin: 10px auto 0;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  /* Short landscape (844x390): an opaque backdrop and the full height, so
     the page underneath does not show through a thin sheet. */
  @media (orientation: landscape) and (max-height: 500px) {
    .angle-overlay {
      background: var(--bg);
      align-items: stretch;
    }

    .angle-sheet {
      max-width: none;
      max-height: none;
      height: 100%;
      border-radius: 0;
      box-shadow: none;
    }

    .angle-sheet-handle {
      display: none;
    }
  }

  /* Desktop: center the sheet instead of bottom-anchoring */
  @media (min-width: 769px) and (min-height: 501px) {
    .angle-overlay {
      align-items: center;
    }

    .angle-sheet {
      border-radius: var(--radius-xl);
      max-height: 70vh;
    }

    .angle-sheet-handle {
      display: none;
    }
  }
</style>
