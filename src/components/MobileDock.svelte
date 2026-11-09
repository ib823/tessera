<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    surfaceMode: 'today' | 'library';
    libraryCount?: number;
    onGoToday?: () => void;
    onOpenLibrary?: () => void;
    /**
     * The one relationship prompt App's interruption budget allows (R-1), or
     * null. The dock never decides on its own whether to ask.
     */
    prompt?: 'sync' | 'install' | null;
    installIsIOS?: boolean;
    onSyncTap?: () => void;
    onSyncDismiss?: () => void;
    onInstallTap?: () => void;
    onInstallDismiss?: () => void;
    /** Fixed to the viewport while the document scrolls (Today). */
    floating?: boolean;
    /** Rendered height, so the page can keep its last line clear of the dock. */
    height?: number;
  }

  let {
    surfaceMode,
    libraryCount = 0,
    onGoToday,
    onOpenLibrary,
    prompt = null,
    installIsIOS = false,
    onSyncTap,
    onSyncDismiss,
    onInstallTap,
    onInstallDismiss,
    floating = false,
    height = $bindable(0),
  }: Props = $props();

  let visible = $state(false);
  let leaving = $state(false);
  let iosHint = $state(false);

  onMount(() => {
    requestAnimationFrame(() => {
      visible = true;
    });
  });

  function dismiss() {
    leaving = true;
    setTimeout(() => {
      if (prompt === 'install') onInstallDismiss?.();
      else onSyncDismiss?.();
      leaving = false;
    }, 200);
  }

  function handleInstallTap() {
    // iOS has no install prompt: say where the browser keeps the option.
    if (installIsIOS) {
      iosHint = !iosHint;
      return;
    }
    onInstallTap?.();
  }
</script>

<div class="dock-container" class:dock-container--floating={floating} bind:offsetHeight={height}>
  {#if prompt}
    <div class="dock-prompts">
      <!-- The action and the dismiss control are sibling buttons: a role=button
           wrapper around a real <button> is a nested interactive control, and
           its aria-label hid the visible text from speech-input users. -->
      <div
        class="dock-prompt-card"
        class:dock-prompt-card--visible={visible && !leaving}
        class:dock-prompt-card--leaving={leaving}
        data-prompt={prompt}
      >
        {#if prompt === 'install'}
          <button type="button" class="dock-prompt-action" onclick={handleInstallTap} aria-expanded={installIsIOS ? iosHint : undefined}>
            <svg class="dock-prompt-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span class="dock-prompt-copy">
              <span class="dock-prompt-text">{installIsIOS ? 'Add to your home screen' : 'Install for quick access'}</span>
              {#if installIsIOS && iosHint}
                <span class="dock-prompt-sub">In Safari, tap Share, then Add to Home Screen.</span>
              {/if}
            </span>
          </button>
          <button type="button" class="dock-prompt-dismiss" onclick={dismiss} aria-label="Dismiss install prompt">&times;</button>
        {:else}
          <button type="button" class="dock-prompt-action" onclick={() => onSyncTap?.()}>
            <svg class="dock-prompt-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span class="dock-prompt-copy">
              <span class="dock-prompt-text">Sync your reading progress</span>
              <!-- R-4: say where progress lives and how it is lost. -->
              <span class="dock-prompt-sub">It lives only in this browser. Clearing site data erases it.</span>
            </span>
          </button>
          <button type="button" class="dock-prompt-dismiss" onclick={dismiss} aria-label="Dismiss sync prompt">&times;</button>
        {/if}
      </div>
    </div>
  {/if}

  <nav class="mobile-dock" aria-label="Primary navigation">
    <button class="dock-item" class:dock-item--active={surfaceMode === 'today'} onclick={() => onGoToday?.()} aria-current={surfaceMode === 'today' ? 'page' : undefined}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path></svg>
      <span>Today</span>
    </button>
    <button class="dock-item" class:dock-item--active={surfaceMode === 'library'} onclick={() => onOpenLibrary?.()} aria-current={surfaceMode === 'library' ? 'page' : undefined}>
      <div class="dock-icon-wrap">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H20v15.5A2.5 2.5 0 0 0 17.5 16H3z"></path><path d="M20 18.5A2.5 2.5 0 0 1 17.5 21H6a3 3 0 0 1-3-3V5.5"></path></svg>
        {#if libraryCount > 0}
          <span class="dock-badge">{libraryCount > 9 ? '9+' : libraryCount}</span>
        {/if}
      </div>
      <span>Library</span>
    </button>
    <!-- H-3: the same destinations as the desktop sidebar. Graphics leaves
         the app for /infographics, so it is a link. -->
    <a class="dock-item" href="/infographics">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18"></path><rect x="5" y="11" width="3.6" height="7" rx="1"></rect><rect x="10.2" y="6" width="3.6" height="12" rx="1"></rect><rect x="15.4" y="14" width="3.6" height="4" rx="1"></rect></svg>
      <span>Graphics</span>
    </a>
  </nav>
</div>

<style>
  .dock-container {
    position: sticky;
    bottom: 0;
    z-index: 15;
    flex-shrink: 0;
    margin-top: auto;
  }

  /* Today scrolls the document, so the dock pins to the viewport. */
  .dock-container--floating {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    margin-top: 0;
  }

  /* No bottom nav on wide screens: the sidebar carries navigation there. */
  @media (min-width: 1024px) {
    .dock-container {
      display: none;
    }
  }

  /* ── Prompt card area ── */
  .dock-prompts {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0 14px;
    /* Baseline: solid gradient, readable without backdrop-filter support. */
    background:
      linear-gradient(180deg, rgba(248, 249, 250, 0.72) 0%, rgba(255, 255, 255, 0.96) 100%);
  }
  /* Enhancement: blur the content behind the dock. Safari 14-16 uses the
     -webkit- prefix; either clause triggers the rule. */
  @supports ((backdrop-filter: blur(16px)) or (-webkit-backdrop-filter: blur(16px))) {
    .dock-prompts {
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
  }

  .dock-prompt-card {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 4px 10px 14px;
    background: none;
    border: none;
    border-top: 1px solid rgba(17, 24, 39, 0.06);
    border-radius: 0;
    text-align: start;
    font: inherit;
    color: inherit;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 300ms ease-out, transform 300ms ease-out;
  }

  .dock-prompt-action {
    flex: 1;
    min-width: 0;
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }

  .dock-prompt-card--visible {
    opacity: 1;
    transform: translateY(0);
  }

  .dock-prompt-card--leaving {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 200ms ease-out, transform 200ms ease-out;
  }

  .dock-prompt-icon {
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .dock-prompt-copy {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dock-prompt-text {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
  }

  .dock-prompt-sub {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-secondary);
    line-height: 1.35;
  }

  .dock-prompt-dismiss {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--text-muted);
    font-size: var(--text-body);
    line-height: 1;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    transition: background 0.15s;
    flex-shrink: 0;
  }

  .dock-prompt-dismiss:hover {
    background: var(--bg-sunken);
  }

  /* ── Dock navigation ── */
  .mobile-dock {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    min-height: calc(72px + env(safe-area-inset-bottom, 0px));
    padding: 8px 14px max(10px, calc(8px + env(safe-area-inset-bottom, 0px)));
    border-top: 1px solid rgba(17, 24, 39, 0.08);
    background:
      linear-gradient(180deg, rgba(248, 249, 250, 0.72) 0%, rgba(255, 255, 255, 0.96) 100%);
    box-shadow: 0 -12px 30px rgba(17, 24, 39, 0.08);
  }
  @supports ((backdrop-filter: blur(16px)) or (-webkit-backdrop-filter: blur(16px))) {
    .mobile-dock {
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
  }

  .dock-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 54px;
    border: none;
    border-radius: var(--radius-lg);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    font: inherit;
    font-size: var(--text-xs);
    font-weight: 700;
    text-decoration: none;
    transition: background 0.2s ease-out, color 0.2s ease-out, transform 0.2s ease-out;
  }

  .dock-item--active {
    background: rgba(255, 255, 255, 0.9);
    color: var(--text-primary);
    box-shadow: 0 10px 22px rgba(17, 24, 39, 0.08);
  }

  .dock-icon-wrap {
    position: relative;
    display: inline-flex;
  }

  .dock-badge {
    position: absolute;
    top: -6px;
    right: -12px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: var(--radius-pill);
    background: rgba(210, 140, 40, 0.12);
    color: var(--score-warning);
    font-size: var(--text-micro);
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Landscape: compact dock to reclaim vertical space */
  @media (orientation: landscape) and (max-height: 500px) {
    .mobile-dock {
      min-height: calc(52px + env(safe-area-inset-bottom, 0px));
      padding: 4px 14px max(6px, calc(4px + env(safe-area-inset-bottom, 0px)));
    }
    .dock-item {
      min-height: 44px;
      flex-direction: row;
      gap: 6px;
    }
    .dock-prompts { display: none; }
  }

  @media (max-width: 480px) {
    .dock-prompts { padding: 0 12px; }
  }

  @media (prefers-color-scheme: dark) {
    .dock-prompts {
      background: linear-gradient(180deg, rgba(20, 19, 18, 0.78) 0%, rgba(20, 19, 18, 0.98) 100%);
    }
    .dock-prompt-card {
      border-top-color: rgba(255, 255, 255, 0.08);
    }
    .mobile-dock {
      background: linear-gradient(180deg, rgba(20, 19, 18, 0.78) 0%, rgba(20, 19, 18, 0.98) 100%);
      border-top-color: rgba(255, 255, 255, 0.08);
      box-shadow: 0 -18px 34px rgba(0, 0, 0, 0.28);
    }
    .dock-item--active {
      background: rgba(200, 150, 58, 0.14);
      box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
    }
  }
</style>
