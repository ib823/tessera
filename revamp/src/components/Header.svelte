<script lang="ts">
  import SurfaceNav from './SurfaceNav.svelte';
  import Logo from './Logo.svelte';
  import NotificationBell from './NotificationBell.svelte';
  import { readIssues } from '../stores/reader';
  import { loadSearchIndex, search as doSearch } from '../lib/search';

  interface Props {
    surfaceMode?: 'today' | 'library';
    todayMode?: 'top' | 'latest';
    libraryCount?: number;
    onGoLatest?: () => void;
    onOpenLibrary?: () => void;
    issues?: Array<{id: string; headline: string}>;
    onSearchToggle?: () => void;
    searchMode?: boolean;
    searchQuery?: string;
    onSearchInput?: (q: string) => void;
    onSearchClear?: () => void;
    onHome?: () => void;
    homeActive?: boolean;
    /** Mobile, document scrolling: slide away on scroll down, return on scroll up. */
    collapseOnScroll?: boolean;
    /** 768-1023 px: opens the sidebar drawer (#app-sidebar). */
    onBrowseToggle?: () => void;
    browseOpen?: boolean;
  }
  let { surfaceMode = 'today', todayMode = 'top', libraryCount = 0, onGoLatest, onOpenLibrary, issues = [], onSearchToggle, searchMode = false, searchQuery = '', onSearchInput, onSearchClear, onHome, homeActive = false, collapseOnScroll = false, onBrowseToggle, browseOpen = false }: Props = $props();

  // Collapse on scroll: a 56px header is 7% of a 844px phone screen.
  let collapsed = $state(false);
  $effect(() => {
    if (!collapseOnScroll || typeof window === 'undefined') {
      collapsed = false;
      return;
    }
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - lastY;
        if (y < 72) collapsed = false;
        else if (delta > 8) collapsed = true;
        else if (delta < -8) collapsed = false;
        if (Math.abs(delta) > 8) lastY = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      collapsed = false;
    };
  });

  let readCount = $state(0);
  let readMap: Record<string, string> = $state({});
  let searchInputEl: HTMLInputElement | undefined = $state(undefined);

  $effect(() => {
    if (searchMode && searchInputEl) {
      loadSearchIndex();
      searchInputEl.focus();
    }
  });

  function segmentColor(id: string): string {
    const raw = readMap[id];
    if (!raw) return 'var(--border-subtle)';
    if (raw === 'true') return 'var(--status-green)';
    try {
      const s = JSON.parse(raw);
      return s.state === 'completed' ? 'var(--status-green)' : 'var(--score-warning)';
    } catch { return 'var(--status-green)'; }
  }

  $effect(() => {
    const unsub = readIssues.subscribe(val => {
      readMap = { ...val };
      readCount = Object.entries(val).filter(([_, v]) => {
        if (!v) return false;
        if (v === 'true') return true;
        try { return JSON.parse(v).state === 'completed'; } catch { return false; }
      }).length;
    });
    return unsub;
  });
</script>

<header class="site-header" class:site-header--collapsed={collapsed} onfocusin={() => { collapsed = false; }} data-collapsed={collapsed ? 'true' : undefined}>
  {#if searchMode}
    <a class="search-brand" href="/" aria-label="FORA — The Fourth Angle home"><Logo size={112} /></a>
    <form role="search" aria-label="Search issues" onsubmit={(event) => event.preventDefault()} style="flex:1;display:flex;align-items:center;gap:8px;">
      <label class="sr-only" for="header-search">Search issues</label>
      <div style="position:relative;flex:1;">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          id="header-search"
          bind:this={searchInputEl}
          type="text"
          placeholder="Search issues..."
          aria-label="Search issues"
          value={searchQuery}
          oninput={(e) => onSearchInput?.((e.currentTarget as HTMLInputElement).value)}
          style="width:100%;min-height:44px;box-sizing:border-box;padding:8px 12px 8px 36px;font-size:var(--text-body);border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--bg-sunken);color:var(--text-primary);outline:none;"
        />
      </div>
      <button type="button" onclick={() => onSearchClear?.()} style="background:none;border:none;cursor:pointer;font-size:var(--text-ui);font-weight:600;color:var(--text-tertiary);padding:8px;min-height:44px;">Cancel</button>
    </form>
  {:else}
    <a
      class="brand"
      href="/"
      aria-label="FORA — The Fourth Angle home"
      aria-current={homeActive ? 'page' : undefined}
      onclick={(event) => {
        if (!onHome || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onHome();
      }}
    >
      <Logo size={112} />

    </a>
    {#if onGoLatest}
      <div class="masthead-nav"><SurfaceNav {surfaceMode} {todayMode} {libraryCount} onGoToday={onHome} {onGoLatest} {onOpenLibrary} /></div>
    {/if}
    <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
      {#if onBrowseToggle}
        <button
          type="button"
          class="browse-toggle"
          aria-controls="app-sidebar"
          aria-expanded={browseOpen}
          onclick={onBrowseToggle}
          data-browse-toggle
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>
          <span>Browse</span>
        </button>
      {/if}
      {#if onSearchToggle}
        <button class="search-icon" onclick={onSearchToggle} style="background:none;border:none;cursor:pointer;padding:10px;display:flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;border-radius:var(--radius-md);transition:background 0.2s ease-out;" aria-label="Search" aria-expanded={searchMode} onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-sunken)'; }} onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      {/if}
      <a href="/infographics" class="graphics-link" aria-label="Graphics" title="Graphics"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 21h18M6 18v-7m6 7V4m6 14v-4"/></svg></a>
      <NotificationBell />
      <a href="/about" aria-label="About" style="text-decoration:none;padding:8px;border-radius:var(--radius-md);min-height:44px;min-width:44px;display:flex;align-items:center;justify-content:center;transition:background 0.2s ease-out;" onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-sunken)'; }} onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary, #6C757D)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></a>
    </div>
  {/if}
  <div style="position:absolute;bottom:0;left:0;right:0;display:flex;gap:1px;height:1.5px;">
    {#each issues as issue}
      <div style="flex:1;background:{segmentColor(issue.id)};" title={issue.headline}></div>
    {/each}
  </div>
</header>

<style>
  .site-header {
    height: 56px;
    padding: 0 16px;
    padding-top: env(safe-area-inset-top, 0);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: var(--z-header, 40);
    background: var(--header-bg);
    border-bottom: 1px solid rgba(17, 24, 39, 0.05);
    transition: transform 220ms var(--ease-out-cubic, ease-out);
  }

  .site-header--collapsed {
    transform: translateY(-100%);
  }

  /* Browse: only where the sidebar becomes a drawer (768-1023 px). */
  .browse-toggle {
    display: none;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 14px;
    margin-right: 4px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-subtle);
    background: var(--bg);
    color: var(--text-primary);
    font: inherit;
    font-size: var(--text-ui);
    font-weight: 700;
    cursor: pointer;
  }

  .browse-toggle[aria-expanded='true'] {
    background: var(--bg-sunken);
    border-color: var(--border-divider);
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    .browse-toggle {
      display: inline-flex;
    }
  }
  @supports ((backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px))) {
    .site-header {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
  }

  /* ── Brand block: mark + text ── */
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    min-height: 44px;
    text-decoration: none;
    border-radius: var(--radius-lg);
  }

  .brand-text-block {
    display: flex;
    align-items: baseline;
    gap: 0 10px;
    min-width: 0;
  }

  .brand-name {
    font-size: var(--text-body);
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.015em;
    white-space: nowrap;
    /* At large text sizes the name truncates rather than push the icons off-screen. */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .brand-tagline {
    display: none;
  }

  /* ── Mobile: mark + name only ── */
  @media (max-width: 768px) {
    .search-icon { display: flex !important; }
  }

  @media (max-width: 480px), (max-height: 640px) {
    .site-header { height: 54px; padding-inline: 12px; }
    .brand { gap: 10px; }
    .brand-name { font-size: var(--text-body); }
  }

  /* Very small phones (iPhone SE, budget Android): hide brand text to prevent icon overflow */
  @media (max-width: 360px) {
    .brand-name { display: none; }
    .brand { gap: 6px; }
  }

  /* ── Desktop: stacked name + tagline beside mark ── */
  @media (min-width: 769px) {
    .site-header { height: 60px; }
    /* The search icon renders only in the mobile shell, which also covers
       short landscape screens (844x390); keep it visible there (H-3). */
    .brand { gap: 14px; }

    .brand-text-block {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1px;
    }

    .brand-name {
      font-size: var(--text-body-lg);
      line-height: 1.2;
    }

    .brand-tagline {
      display: block;
      font-family: var(--font-body);
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 0.02em;
      line-height: 1.3;
      white-space: nowrap;
    }
  }

  /* ── Large desktop: slightly more generous ── */
  @media (min-width: 1024px) {
    .site-header { height: 62px; }
    .brand { gap: 16px; }
    .brand-name { font-size: var(--text-reading); }
    .brand-tagline { font-size: var(--text-sm); }
  }

  /* The header content follows the 1440px canvas cap (H-8). */
  @media (min-width: 1472px) {
    .site-header { padding-inline: calc((100% - 1440px) / 2 + 16px); }
  }

  @media (min-width: 1440px) {
    .site-header { height: 64px; }
    .brand-name { font-size: var(--text-reading-lg); }
    .brand-tagline { font-size: var(--text-sm); letter-spacing: 0.015em; }
  }
  .masthead-nav { display:none; }
  .graphics-link { display:flex; align-items:center; justify-content:center; min-height:44px; min-width:44px; color:var(--fora-muted); }
  .site-header { border-color:var(--fora-rule); }
  @media(min-width:1024px) {
    .masthead-nav { display:block; margin-inline:32px auto; }
    .site-header { padding-inline:max(24px, calc((100vw - 1360px) / 2)); }
  }
  .search-brand { display:none; flex-shrink:0; margin-right:32px; }
  @media(min-width:1024px) { .search-brand { display:block; } }
</style>
