<script lang="ts">
  import { onMount } from 'svelte';
  import { opinionLabel, opinionColor as issueOpinionColor } from '../data/issue-types';
  import IssueImage from './IssueImage.svelte';

  import type { IssueSummary } from '../lib/issues-loader';
  import type { FeedSection, TodayMode } from '../lib/feed-sections';
  import { getDossierFeedEntries } from '../data/dossiers';
  import { absoluteDate, isWithinDays, newestDate, relativeDate } from '../lib/relative-date';
  import { buildTopicClusters, primaryLens, topicHref } from '../lib/topics';

  // Featured dossiers — surfaces the new long-form product on the
  // homepage with a distinctive burgundy-accented card. The list is
  // gated on SHOW_DOSSIERS_IN_FEED inside getDossierFeedEntries(); when
  // the flag is false, this returns [] and the banner does not render.
  const featuredDossiers = getDossierFeedEntries();

  interface Props {
    /** Feed summaries still in flight: render nothing rather than an empty state. */
    loading?: boolean;
    issueCount?: number;
    topIssue?: IssueSummary | null;
    issues?: IssueSummary[];
    sections?: FeedSection[];
    readMap?: Record<string, string>;
    readingCount?: number;
    highlightCount?: number;
    /** Top: the editor's front page. Latest: every issue, newest first (H-2). */
    mode?: TodayMode;
    onModeChange?: (mode: TodayMode) => void;
    /** Keeps ids unique when more than one layout is in the DOM. */
    idPrefix?: string;
    /**
     * The page heading's level. h2 while an issue reader sits on top of
     * Today, so the issue's headline is the page's only <h1> (A-9).
     */
    headingLevel?: 'h1' | 'h2';
    /** Set by App's interruption budget (R-1). */
    showWelcome?: boolean;
    onDismissWelcome?: () => void;
    onOpenIssue?: (issue: IssueSummary) => void;
    onOpenLibraryReading?: () => void;
    onOpenLibraryHighlights?: () => void;
    onOpenLibraryArchive?: () => void;
  }
  let {
    loading = false,
    issueCount = 0,
    topIssue = null,
    issues = [],
    sections = [],
    readMap = {},
    mode = 'top',
    onModeChange,
    idPrefix = 'today',
    headingLevel = 'h1',
    showWelcome = false,
    onDismissWelcome,
    onOpenIssue,
  }: Props = $props();

  // The quote list is ~70 KB raw (~19 KB brotli), about a fifth of the App
  // chunk, to show one line in the footer. Load it after mount so it stays
  // off the critical path of every page (home and all issue pages).
  let quote = $state('');
  // Relative dates ("3 days ago") are computed against the reader's clock.
  // The server render uses the build time; mount refreshes it.
  let now = $state(new Date());
  onMount(() => {
    let cancelled = false;
    now = new Date();
    import('../data/quotes')
      .then(({ QUOTES }) => {
        if (!cancelled) quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  });

  /** "New This Week" uses the same seven-day window. */
  const RECENT_DAYS = 7;

  let hasIssues = $derived(issueCount > 0);
  let continueIssue = $derived(sections.find((section) => section.kind === 'continue')?.issues[0] ?? null);
  let continueProgress = $derived.by(() => {
    if (!continueIssue) return 0;
    const raw = readMap[continueIssue.id];
    if (!raw) return 0;
    if (raw === 'true') return 6;
    try { return JSON.parse(raw).progress ?? 0; } catch { return 0; }
  });
  let nextContinueAngle = $derived(Math.min(continueProgress + 1, continueIssue?.cards.length ?? 6));

  function byNewest(a: IssueSummary, b: IssueSummary): number {
    const dates = (b.sourceDate ?? '').localeCompare(a.sourceDate ?? '');
    return dates !== 0 ? dates : b.opinionShift - a.opinionShift;
  }

  let latestIssues = $derived([...issues].sort(byNewest));
  let lastPublished = $derived(newestDate(issues));

  // H-9: the lead is the newest issue this reader has not opened. When they
  // have already opened the newest one, say so instead of presenting a
  // different lead without explanation.
  let newestIssue = $derived(latestIssues[0] ?? null);
  let leadIsPersonal = $derived(!!topIssue && !!newestIssue && topIssue.id !== newestIssue.id && !!readMap[newestIssue.id]);

  // H-1: the briefing holds recent issues only. When nothing recent is left
  // unopened, it becomes "Start here" with the strongest unopened reads.
  let recentUnread = $derived(
    latestIssues.filter((issue) => issue.id !== topIssue?.id && !readMap[issue.id] && isWithinDays(issue.sourceDate, RECENT_DAYS, now)),
  );
  let briefingIsRecent = $derived(recentUnread.length > 0);
  let briefingIssues = $derived.by(() => {
    if (briefingIsRecent) return recentUnread.slice(0, 3);
    return issues
      .filter((issue) => issue.id !== topIssue?.id && !readMap[issue.id])
      .sort((a, b) => b.opinionShift - a.opinionShift)
      .slice(0, 3);
  });
  let briefingMinutes = $derived(Math.max(3, briefingIssues.length * 3));

  // H-4: every topic is shown, so the chip counts add up to the heading.
  let topicClusters = $derived(
    buildTopicClusters(issues).map((cluster) => ({
      ...cluster,
      issues: [...cluster.issues].sort((a, b) => b.opinionShift - a.opinionShift),
    })),
  );
  let topicIssueTotal = $derived(topicClusters.reduce((sum, cluster) => sum + cluster.count, 0));

  let activeTopic = $state<string | null>(null);
  let activeCluster = $derived(topicClusters.find((c) => c.topic === activeTopic) ?? null);
  let activeTopicIssues = $derived(activeCluster?.issues.slice(0, 5) ?? []);

  let readyMinutes = $derived(Math.max(4, briefingIssues.length * 3 + (continueIssue ? 2 : 0)));
  let todayDeckCopy = $derived.by(() => {
    if (mode === 'latest') return 'Every issue, newest first.';
    if (continueIssue) return 'Start with the lead, then resume where you stopped.';
    return briefingIsRecent ? 'Start with the lead, then move into the briefing.' : 'Start with the lead, then pick a strong place to start.';
  });

  // Latest mode renders in pages so the first paint stays light.
  const LATEST_PAGE = 20;
  let latestLimit = $state(LATEST_PAGE);
  let latestVisible = $derived(latestIssues.slice(0, latestLimit));

  function readLabel(id: string): string {
    const raw = readMap[id];
    if (!raw) return '';
    if (raw === 'true') return 'Read';
    try {
      const state = JSON.parse(raw).state;
      return state === 'completed' ? 'Read' : state === 'started' ? 'In progress' : '';
    } catch {
      return '';
    }
  }

  const modes: Array<{ key: TodayMode; label: string }> = [
    { key: 'top', label: 'Top' },
    { key: 'latest', label: 'Latest' },
  ];

  function onModeKeyDown(event: KeyboardEvent) {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next: TodayMode;
    if (event.key === 'Home') next = 'top';
    else if (event.key === 'End') next = 'latest';
    else next = mode === 'top' ? 'latest' : 'top';
    onModeChange?.(next);
    requestAnimationFrame(() => {
      document.getElementById(`${idPrefix}-today-mode-${next}`)?.focus();
    });
  }

  function formatLongDate(iso: string): string {
    return absoluteDate(iso) || iso;
  }

  function opinionTone(score: number): string {
    if (score >= 80) return 'The headline hides most of the real story.';
    if (score >= 60) return 'The headline misses major context.';
    if (score >= 40) return 'The headline only gives you part of it.';
    return 'The headline gets the surface, not the full frame.';
  }

  function opinionColor(score: number): string {
    if (score >= 80) return 'var(--score-strong)';
    if (score >= 60) return 'var(--score-medium)';
    if (score >= 40) return 'var(--score-partial)';
    return 'var(--score-neutral)';
  }
</script>

{#snippet dateStamp(iso: string | null | undefined)}
  {#if iso && relativeDate(iso, now)}
    <time class="date-stamp" datetime={iso} title={absoluteDate(iso)} data-relative-date>{relativeDate(iso, now)}</time>
  {/if}
{/snippet}

<div class="today-shell">
  <div class="today-wrap">
    {#if hasIssues}
      <div class="today-topline">
        <div>
          <div class="today-kicker">Today</div>
          <svelte:element this={headingLevel} class="today-title">See what deserves your full attention.</svelte:element>
          <p class="today-intro pretty-copy">{todayDeckCopy}</p>
        </div>
        <div class="today-status">
          {#if mode === 'top'}
            <span>about {readyMinutes} min</span>
            <span class="today-divider"></span>
          {/if}
          {#if lastPublished}
            <span data-last-published>Last published <time datetime={lastPublished}>{formatLongDate(lastPublished)}</time></span>
          {/if}
        </div>
      </div>

      <div class="today-modes" role="tablist" aria-label="Today view">
        {#each modes as option}
          <button
            id={`${idPrefix}-today-mode-${option.key}`}
            class="today-mode"
            class:today-mode--active={mode === option.key}
            role="tab"
            type="button"
            aria-selected={mode === option.key}
            aria-controls={`${idPrefix}-today-mode-panel`}
            tabindex={mode === option.key ? 0 : -1}
            onclick={() => onModeChange?.(option.key)}
            onkeydown={onModeKeyDown}
            data-today-mode={option.key}
          >{option.label}</button>
        {/each}
      </div>

      {#if showWelcome}
        <div class="welcome-card" role="note" aria-label="Welcome to The Fourth Angle" data-prompt="welcome">
          <div class="welcome-content">
            <p class="welcome-text"><strong>The Fourth Angle</strong> is a nonpartisan Malaysian issues platform. We show you what every side left out, then let you decide.</p>
            <p class="welcome-text">The <strong>Opinion Shift</strong> number on each issue tells you how much you would miss by reading only the headline. Higher means more hidden complexity.</p>
            <a href="/about" class="welcome-link">How this works <span aria-hidden="true">→</span></a>
          </div>
          <button class="welcome-dismiss" onclick={() => onDismissWelcome?.()} aria-label="Dismiss welcome message">&times;</button>
        </div>
      {/if}

      <div
        id={`${idPrefix}-today-mode-panel`}
        class="today-mode-panel"
        role="tabpanel"
        aria-labelledby={`${idPrefix}-today-mode-${mode}`}
      >
      {#if mode === 'latest'}
        <section class="latest-section" aria-labelledby={`${idPrefix}-latest-heading`}>
          <h2 id={`${idPrefix}-latest-heading`} class="panel-title">All {latestIssues.length} issues</h2>
          <ol class="latest-list" data-latest-list>
            {#each latestVisible as issue (issue.id)}
              {@const lens = primaryLens(issue.cards)}
              {@const state = readLabel(issue.id)}
              <li>
                <button class="latest-item" onclick={() => onOpenIssue?.(issue)}>
                  <div class="latest-meta">
                    {@render dateStamp(issue.sourceDate)}
                    {#if lens}<span class="latest-topic">{lens}</span>{/if}
                    {#if state}<span class="latest-state">{state}</span>{/if}
                  </div>
                  <div class="latest-headline balance-title">{issue.headline}</div>
                  <div class="latest-context pretty-copy">{issue.context}</div>
                  <div class="latest-score" style="color:{opinionColor(issue.opinionShift)};"><span class="sr-only">Opinion Shift </span>{issue.opinionShift} <span class="latest-score-label">{opinionLabel(issue.opinionShift)}</span></div>
                </button>
              </li>
            {/each}
          </ol>
          {#if latestIssues.length > latestLimit}
            <button class="latest-more" onclick={() => { latestLimit += LATEST_PAGE; }}>Show {Math.min(LATEST_PAGE, latestIssues.length - latestLimit)} more</button>
          {/if}
        </section>
      {:else}
      {#if topIssue && onOpenIssue}
        <article class="hero-entry" aria-labelledby={`${idPrefix}-lead-issue-title`}>
        <!-- Named by its visible content (WCAG 2.5.3): no aria-label, and the art is
             decorative here because the headline is already part of the name. -->
        <button
          class="hero-card"
          onclick={() => onOpenIssue?.(topIssue)}
        >
          {#if topIssue.hasImage}
            <div class="hero-art">
              <IssueImage issueId={topIssue.id} size="hero" aspectRatio="16/9" borderRadius="0" alt="" eager={true} />
            </div>
          {/if}
          <div class="hero-scrim"></div>
          <div class="hero-grid">
            <div class="hero-copy">
              <div class="hero-badge-row">
                <span class="hero-badge" data-lead-label>{leadIsPersonal ? "You've opened the latest issue. Next up:" : 'Latest issue'}</span>
                {@render dateStamp(topIssue.sourceDate)}
              </div>
              <h2 id={`${idPrefix}-lead-issue-title`} class="hero-headline balance-title">{topIssue.headline}</h2>
              <p class="hero-context pretty-copy">{topIssue.context}</p>
            </div>
            <div class="hero-shift">
              <div class="hero-shift-kicker">Opinion Shift</div>
              <div class="hero-shift-score" style="color:{opinionColor(topIssue.opinionShift)};">{topIssue.opinionShift}</div>
              <p class="hero-shift-copy">{opinionTone(topIssue.opinionShift)}</p>
              <div class="hero-shift-meter">
                <div class="hero-shift-fill" style="width:{topIssue.opinionShift}%;background:{opinionColor(topIssue.opinionShift)};"></div>
              </div>
              <div class="hero-shift-foot">How much the headline hides.</div>
              <div class="hero-cta">Start reading <span aria-hidden="true">→</span></div>
            </div>
          </div>
        </button>
        </article>
      {/if}

      {#if featuredDossiers.length > 0}
        <section class="featured-dossiers" aria-labelledby={`${idPrefix}-featured-dossiers-heading`}>
          <h2 id={`${idPrefix}-featured-dossiers-heading`} class="sr-only">Featured Dossier</h2>
          {#each featuredDossiers as d (d.id)}
            <a class="dossier-card" href={d.href} data-dossier-id={d.id}>
              <div class="dossier-card__body">
                <div class="dossier-card__top">
                  <span class="dossier-card__pill">DOSSIER · {d.id}</span>
                  <span class="dossier-card__series">{d.series.name}</span>
                </div>
                <div class="dossier-card__title">{d.title}</div>
                <div class="dossier-card__subtitle">{d.subtitle}</div>
                <div class="dossier-card__meta">
                  {#if d.sourceDate && relativeDate(d.sourceDate, now)}
                    <time datetime={d.sourceDate} title={absoluteDate(d.sourceDate)} data-relative-date>{relativeDate(d.sourceDate, now)}</time>
                    <span class="dot" aria-hidden="true">·</span>
                  {/if}
                  <span>{d.estReadMinutes} min read</span>
                  <span class="dot" aria-hidden="true">·</span>
                  <span>Long-form editorial</span>
                  <span class="dot" aria-hidden="true">·</span>
                  <span>{d.primaryLens} lens</span>
                </div>
              </div>
            </a>
          {/each}
        </section>
      {/if}

      <div class="today-grid">
        {#if continueIssue && onOpenIssue}
        <section class="today-panel" aria-labelledby={`${idPrefix}-continue-reading-heading`}>
          <div class="panel-kicker">Continue Reading</div>
          <h2 id={`${idPrefix}-continue-reading-heading`} class="sr-only">Continue Reading</h2>
            <button class="panel-issue" onclick={() => onOpenIssue?.(continueIssue)}>
              {@render dateStamp(continueIssue.sourceDate)}
              <div class="panel-issue-title balance-title">{continueIssue.headline}</div>
              <div class="panel-issue-copy pretty-copy">Next: angle {nextContinueAngle}. Pick up where the argument starts to turn.</div>
              <div class="panel-progress-row">
                <div class="panel-progress-track">
                  <div class="panel-progress-fill" style="width:{Math.min(100, (continueProgress / (continueIssue?.cards.length ?? 6)) * 100)}%;"></div>
                </div>
                <span>Angle {nextContinueAngle} next</span>
              </div>
            </button>
        </section>
        {/if}

        {#if briefingIssues.length > 0}
        <section class="today-panel" aria-labelledby={`${idPrefix}-briefing-heading`} data-briefing={briefingIsRecent ? 'recent' : 'start-here'}>
          <div class="panel-kicker">{briefingIsRecent ? 'Daily Briefing' : 'Start Here'}</div>
          <h2 id={`${idPrefix}-briefing-heading`} class="panel-title">
            {#if briefingIsRecent}
              New this week.
            {:else}
              {briefingIssues.length === 1 ? 'A strong place to start.' : `${briefingIssues.length === 2 ? 'Two' : 'Three'} strong places to start.`}
            {/if}
          </h2>
          <div class="panel-subtitle">{briefingIsRecent ? `Published in the last ${RECENT_DAYS} days.` : 'The biggest gaps between headline and story.'} About {briefingMinutes} minutes.</div>
          <div class="brief-list">
            {#each briefingIssues as issue (issue.id)}
              <button class="brief-item" onclick={() => onOpenIssue?.(issue)}>
                <div class="brief-score" style="color:{opinionColor(issue.opinionShift)};" title="{issue.opinionShift} — {opinionLabel(issue.opinionShift)}: Reading only the headline would hide about {issue.opinionShift}% of the story">{issue.opinionShift}</div>
                <div class="brief-copy">
                  {@render dateStamp(issue.sourceDate)}
                  <div class="brief-headline balance-title">{issue.headline}</div>
                  <div class="brief-context pretty-copy">{issue.context}</div>
                </div>
              </button>
            {/each}
          </div>
        </section>
        {/if}
      </div>

      {#if topicClusters.length > 0}
        <section class="topic-section" aria-labelledby={`${idPrefix}-topic-heading`}>
          <div class="topic-header">
            <div class="panel-kicker">Browse by Topic</div>
            <h2 id={`${idPrefix}-topic-heading`} class="panel-title" data-topic-summary>{topicIssueTotal} issues across {topicClusters.length} topics.</h2>
          </div>
          <div class="topic-chips" role="group" aria-label="Topics">
            {#each topicClusters as cluster (cluster.topic)}
              <button
                class="topic-chip"
                class:topic-chip--active={activeTopic === cluster.topic}
                onclick={() => { activeTopic = activeTopic === cluster.topic ? null : cluster.topic; }}
                aria-expanded={activeTopic === cluster.topic}
                aria-controls={`${idPrefix}-topic-panel`}
                data-topic-chip={cluster.slug}
              >
                <span class="topic-chip-name">{cluster.topic}</span>
                <span class="topic-chip-count" data-topic-count>{cluster.count}</span>
              </button>
            {/each}
          </div>
          <div id={`${idPrefix}-topic-panel`} class="topic-issues" hidden={!activeCluster}>
            {#if activeCluster}
              {#each activeTopicIssues as issue (issue.id)}
                <button class="topic-issue" onclick={() => onOpenIssue?.(issue)}>
                  <span class="topic-issue-score" style="color:{issueOpinionColor(issue.opinionShift)};">{issue.opinionShift}</span>
                  <div class="topic-issue-copy">
                    {@render dateStamp(issue.sourceDate)}
                    <div class="topic-issue-headline balance-title">{issue.headline}</div>
                    <div class="topic-issue-context pretty-copy">{issue.context}</div>
                  </div>
                </button>
              {/each}
              <a class="topic-all-link" href={topicHref(activeCluster.topic)}>All {activeCluster.count} {activeCluster.topic} issues <span aria-hidden="true">→</span></a>
            {/if}
          </div>
        </section>
      {/if}
      {/if}
      </div>

      <footer class="today-footer">
        {#if quote}<div class="today-quote">"{quote}"</div>{/if}
        <div class="today-ethos">Editorial ethos</div>
        <nav class="today-footer-links" aria-label="Footer navigation">
          <a href="/about">How This Works</a>
          <a href="/disclaimer">Disclaimer</a>
          <a href="/verify">Verify Content</a>
          <a href="/privacy">Privacy</a>
          <a href="/corrections">Corrections</a>
          <a href="/contact">Contact</a>
          <a href="/rss.xml" type="application/rss+xml">RSS</a>
        </nav>
      </footer>
    {:else if !loading}
      <div class="coming-soon">
        <div class="today-kicker">Today</div>
        <svelte:element this={headingLevel} class="today-title">No issues to show right now.</svelte:element>
        <p class="today-intro pretty-copy">Check back soon, or read <a class="welcome-link" href="/about">how this works</a>.</p>
        {#if quote}<p class="today-quote">"{quote}"</p>{/if}
      </div>
    {/if}
  </div>
</div>

<style>
  /* Not a scroll container: the document scrolls (X-8), so mobile browser
     bars collapse, native pull-to-refresh and scroll restoration work. */
  .today-shell {
    position: relative;
    flex: 1 0 auto;
    background:
      radial-gradient(circle at top right, rgba(210, 140, 40, 0.08), transparent 28%),
      linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg) 22%, var(--bg) 100%);
  }

  /* Capped canvas (H-8): no tier grows it past 1080px, so lines stay readable. */
  .today-wrap {
    max-width: 1080px;
    margin: 0 auto;
    padding: 32px 24px 56px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* ── Welcome card ── */
  .welcome-card {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    background: var(--bg-elevated);
  }

  .welcome-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .welcome-text {
    font-size: var(--text-body);
    line-height: 1.55;
    color: var(--text-secondary);
    margin: 0;
    max-width: 68ch;
  }

  /* Links in running text are underlined (WCAG 1.4.1, audit X-10). */
  .welcome-link {
    font-weight: 700;
    color: var(--score-medium);
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }

  .welcome-content .welcome-link {
    font-size: var(--text-sm);
  }

  .welcome-dismiss {
    align-self: flex-start;
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--text-body);
    color: var(--text-muted);
    padding: 4px 8px;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }

  /* ── Top / Latest (H-2) ── */
  .today-modes {
    display: inline-grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: fit-content;
    padding: 4px;
    gap: 4px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-subtle);
    background: var(--bg-elevated);
  }

  .today-mode {
    min-height: 40px;
    min-width: 88px;
    padding: 0 18px;
    border: none;
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--text-secondary);
    font: inherit;
    font-size: var(--text-ui);
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .today-mode--active {
    background: var(--bg);
    color: var(--text-primary);
    box-shadow: 0 4px 12px rgba(17, 24, 39, 0.08);
  }

  .today-mode-panel {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* ── Dates (H-1) ── */
  .date-stamp {
    display: block;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.01em;
  }

  .panel-issue .date-stamp,
  .brief-copy .date-stamp,
  .topic-issue-copy .date-stamp {
    margin-bottom: 4px;
  }

  .hero-badge-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
  }

  .hero-badge-row .date-stamp {
    color: rgba(255, 255, 255, 0.82);
  }

  /* ── Latest list ── */
  .latest-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .latest-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
    gap: 12px;
  }

  .latest-item {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
    background: var(--bg);
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.15s ease, transform 0.15s ease;
  }

  @media (hover: hover) {
    .latest-item:hover {
      border-color: var(--border-divider);
      transform: translateY(-1px);
    }
  }

  .latest-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 10px;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-muted);
  }

  .latest-topic,
  .latest-state {
    font-size: var(--text-sm);
  }

  .latest-state {
    color: var(--status-green-text);
  }

  .latest-headline {
    font-size: var(--text-body);
    font-weight: 700;
    line-height: 1.3;
    color: var(--text-primary);
  }

  .latest-context {
    font-size: var(--text-ui);
    line-height: 1.5;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .latest-score {
    margin-top: auto;
    font-family: var(--font-display);
    font-size: var(--text-body);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .latest-score-label {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-muted);
  }

  .latest-more {
    align-self: center;
    min-height: 44px;
    padding: 0 20px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-divider);
    background: var(--bg-elevated);
    color: var(--text-primary);
    font: inherit;
    font-size: var(--text-ui);
    font-weight: 700;
    cursor: pointer;
  }

  .today-topline {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
  }

  .today-kicker,
  .panel-kicker {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .today-title {
    margin: 12px 0 0;
    font-family: var(--font-display);
    font-size: var(--text-home-title-fluid);
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    max-width: 20ch;
  }

  .today-intro {
    margin: 12px 0 0;
    max-width: 40ch;
    font-size: var(--text-body);
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .today-status {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-subtle);
    background: rgba(255, 255, 255, 0.72);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-weight: 600;
    white-space: nowrap;
  }

  .hero-entry {
    display: block;
  }

  .today-divider {
    width: 4px;
    height: 4px;
    border-radius: var(--radius-round);
    background: var(--border-divider);
  }

  .hero-card,
  .panel-issue,
  .brief-item {
    width: 100%;
    border: none;
    cursor: pointer;
    font: inherit;
    text-align: left;
  }

  .hero-card {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-xl);
    min-height: 340px;
    background: linear-gradient(135deg, rgba(20, 20, 20, 0.94), rgba(28, 28, 28, 0.82));
    color: #fff;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  }

  .hero-art,
  .hero-art :global(img),
  .hero-art :global(picture) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .hero-scrim {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(10, 10, 10, 0.82) 0%, rgba(10, 10, 10, 0.56) 45%, rgba(10, 10, 10, 0.7) 100%),
      linear-gradient(180deg, rgba(210, 140, 40, 0.16), transparent 36%);
  }

  .hero-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
    gap: 28px;
    min-height: 340px;
    padding: 32px;
    align-items: end;
  }

  .hero-copy {
    max-width: 56ch;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .hero-badge {
    display: inline-flex;
    text-align: left;
    align-items: center;
    width: fit-content;
    padding: 8px 12px;
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.18);
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .hero-headline {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-issue-title-fluid);
    line-height: 1.15;
    letter-spacing: -0.02em;
    max-width: 20ch;
  }

  .hero-context,
  .hero-shift-copy,
  .hero-shift-foot {
    margin: 0;
  }

  .hero-context {
    font-size: var(--text-body);
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.78);
    max-width: 56ch;
  }

  .hero-shift {
    padding: 24px;
    border-radius: var(--radius-xl);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .hero-shift-kicker {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.7);
  }

  .hero-shift-score {
    font-family: var(--font-display);
    font-size: var(--text-display);
    line-height: 0.88;
    letter-spacing: -0.05em;
    margin-top: 14px;
  }

  .hero-shift-copy {
    font-size: var(--text-body);
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.82);
    margin-top: 10px;
  }

  .hero-shift-meter,
  .panel-progress-track {
    height: 8px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: var(--radius-pill);
    overflow: hidden;
    margin-top: 14px;
  }

  .hero-shift-fill,
  .panel-progress-fill {
    height: 100%;
    border-radius: var(--radius-pill);
  }

  .hero-shift-foot {
    margin-top: 10px;
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.02em;
    color: rgba(255, 255, 255, 0.58);
  }

  .hero-cta {
    margin-top: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-ui);
    font-weight: 700;
    color: #fff;
  }

  .today-grid {
    display: grid;
    /* auto-fit so 1 panel fills the row, 2 panels sit side-by-side.
       brief-list inside each panel adapts independently via its own auto-fit. */
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 18px;
  }

  .today-panel {
    padding: 24px;
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-subtle);
    background: rgba(255, 255, 255, 0.76);
    box-shadow: 0 12px 28px rgba(20, 20, 20, 0.05);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .panel-title {
    font-family: var(--font-display);
    font-size: var(--text-title);
    line-height: 1.04;
    letter-spacing: -0.03em;
    color: var(--text-primary);
  }

  .panel-subtitle,
  .panel-empty-copy,
  .panel-issue-copy,
  .brief-context,
  .today-quote {
    font-size: var(--text-ui);
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .panel-issue,
  .brief-item {
    padding: 16px;
    border-radius: var(--radius-lg);
    background: var(--bg);
    border: 1px solid var(--border-subtle);
    transition: transform 0.2s ease-out, border-color 0.2s ease-out, box-shadow 0.2s ease-out;
  }

  @media (hover: hover) {
    .panel-issue:hover,
    .brief-item:hover {
      transform: translateY(-2px);
    }

    .hero-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 32px 80px rgba(0, 0, 0, 0.12);
    }
  }

  .panel-issue-title,
  .brief-headline {
    font-size: var(--text-body);
    font-weight: 700;
    line-height: 1.28;
    color: var(--text-primary);
  }

  .panel-progress-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-secondary);
  }

  .panel-progress-track {
    flex: 1;
    height: 6px;
    margin-top: 0;
    background: var(--bg-sunken);
  }

  .panel-progress-fill {
    background: var(--score-warning);
  }

  .panel-empty-title {
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .brief-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
    gap: 12px;
  }

  .brief-item {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
  }

  .brief-score {
    font-family: var(--font-display);
    font-size: var(--text-metric);
    line-height: 0.92;
    letter-spacing: -0.05em;
  }

  /* ── Browse by topic ── */
  .topic-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .topic-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .topic-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .topic-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-subtle);
    background: var(--bg-elevated);
    cursor: pointer;
    font: inherit;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }

  .topic-chip-name {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-secondary);
  }

  .topic-chip-count {
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--text-faint);
    font-variant-numeric: tabular-nums;
  }

  .topic-chip--active {
    border-color: var(--score-medium);
    background: rgba(210, 140, 40, 0.08);
  }

  .topic-chip--active .topic-chip-name {
    color: var(--text-primary);
  }

  .topic-chip--active .topic-chip-count {
    color: var(--score-medium);
  }

  @media (hover: hover) {
    .topic-chip:hover {
      border-color: var(--border-divider);
      background: var(--bg-sunken);
    }
  }

  .topic-issues {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .topic-issues[hidden] {
    display: none;
  }

  .topic-issue {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 16px;
    border-radius: var(--radius-lg);
    background: var(--bg);
    border: 1px solid var(--border-subtle);
    cursor: pointer;
    text-align: left;
    font: inherit;
    width: 100%;
    transition: transform 0.15s ease, border-color 0.15s ease;
  }

  @media (hover: hover) {
    .topic-issue:hover {
      border-color: var(--border-divider);
      transform: translateY(-1px);
    }
  }

  .topic-issue-score {
    font-family: var(--font-display);
    font-size: var(--text-reading);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    min-width: 32px;
    flex-shrink: 0;
    padding-top: 2px;
  }

  .topic-issue-copy {
    flex: 1;
    min-width: 0;
  }

  /* Headlines are never line-clamped: with user text spacing (WCAG 1.4.12) a
     clamp hides part of the headline. Context excerpts below stay clamped. */
  .topic-issue-headline {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.35;
  }

  .topic-issue-context {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.5;
    margin-top: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (prefers-color-scheme: dark) {
    .topic-chip {
      background: rgba(34, 31, 27, 0.7);
    }
    .topic-chip--active {
      background: rgba(210, 140, 40, 0.14);
    }
  }

  .today-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px 2px 0;
    border-top: 1px solid var(--border-subtle);
  }

  .today-quote {
    font-style: italic;
    max-width: 44ch;
    text-align: center;
  }

  .today-ethos {
    font-size: var(--text-micro);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-faint);
  }

  .today-footer-links {
    display: flex;
    align-items: center;
    gap: 0 4px;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* 44px targets (X-6). */
  .today-footer-links a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 10px;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: none;
    border-radius: var(--radius-sm);
    transition: color 0.15s ease;
  }

  .today-footer-links a:hover {
    color: var(--text-primary);
    text-decoration: underline;
  }

  .topic-all-link {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 4px;
    font-size: var(--text-ui);
    font-weight: 700;
    color: var(--score-info);
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }

  .coming-soon {
    padding: 40px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  @media (min-width: 1024px) {
    .panel-issue,
    .brief-item {
      padding: 20px;
    }

    /* Fix: title at 1024px was cramped at 12ch/line. Span full width above hero. */
    .today-topline {
      flex-direction: column;
      align-items: flex-start;
    }

    .today-title {
      max-width: none;
    }

    /* Constrain hero context to prevent 82ch+ line lengths on wide viewports */
    .hero-context {
      max-width: 40ch;
    }
  }

  @media (min-width: 1024px) {
    .topic-issues:not([hidden]) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
  }

  /* Tablet: increase body text for arm's-length reading */
  @media (min-width: 769px) and (max-width: 1023px) {
    .today-intro,
    .hero-context {
      font-size: var(--text-body-lg);
    }
  }

  @media (max-width: 1023px) {
    .hero-grid {
      grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.85fr);
      min-height: 360px;
      padding: 24px;
      gap: 24px;
      align-items: end;
    }

  }

  @media (max-width: 767px) {
    .today-wrap {
      padding: 16px 16px 28px;
      gap: 16px;
    }

    .today-topline {
      flex-direction: column;
      align-items: flex-start;
    }

    .today-status {
      flex-wrap: wrap;
      white-space: normal;
      padding: 8px 14px;
    }

    .hero-card {
      min-height: 0;
      border-radius: var(--radius-xl);
    }

    .hero-grid {
      grid-template-columns: 1fr;
      min-height: 0;
      padding: 20px;
      gap: 20px;
    }

    .hero-headline {
      max-width: none;
    }

    .hero-shift-score {
      font-size: var(--text-display);
    }

    .today-grid {
      grid-template-columns: 1fr;
    }

    .today-panel {
      padding: 16px;
      border-radius: var(--radius-xl);
    }

    .brief-list {
      grid-template-columns: 1fr;
    }

    .brief-score {
      font-size: var(--text-title-lg);
    }

    .today-quote {
      text-align: center;
      max-width: none;
    }
  }

  @media (prefers-color-scheme: dark) {
    .today-shell {
      background:
        radial-gradient(circle at top right, rgba(200, 150, 58, 0.12), transparent 28%),
        linear-gradient(180deg, #141312 0%, #171614 22%, #171614 100%);
    }

    .today-status {
      background: rgba(38, 34, 29, 0.88);
      border-color: var(--border-divider);
      color: var(--text-secondary);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    .today-divider {
      background: rgba(255, 255, 255, 0.16);
    }

    .today-modes {
      background: rgba(34, 31, 27, 0.9);
      border-color: var(--border-divider);
    }

    .today-mode--active {
      background: rgba(200, 150, 58, 0.16);
      box-shadow: none;
    }

    .latest-item {
      background: rgba(25, 24, 22, 0.96);
      border-color: var(--border-divider);
    }

    .today-panel {
      background: rgba(34, 31, 27, 0.92);
      border-color: rgba(255, 255, 255, 0.06);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.28);
    }

    .panel-issue,
    .brief-item {
      background: rgba(25, 24, 22, 0.96);
      border-color: var(--border-divider);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
    }

  }

  @media (prefers-color-scheme: dark) and (hover: hover) {
    .hero-card:hover,
    .panel-issue:hover,
    .brief-item:hover {
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.34);
    }

    .today-quote {
      color: var(--text-muted);
    }
  }

  /* ----------------------------------------------------------------
   * Featured Dossier card — surfaces the long-form editorial product
   * on the homepage. Distinctive burgundy edge bar + serif title to
   * mark it as different from regular bite-size issues.
   * ---------------------------------------------------------------- */
  .featured-dossiers {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 28px 0 32px;
  }
  .dossier-card {
    position: relative;
    display: block;
    text-decoration: none;
    color: inherit;
    background: #0f0f23;
    border: 1px solid rgba(155, 44, 44, 0.35);
    border-radius: var(--radius-md, 6px);
    overflow: hidden;
    transition: border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
  }
  .dossier-card:hover,
  .dossier-card:focus-visible {
    border-color: rgba(155, 44, 44, 0.7);
    transform: translateY(-1px);
    box-shadow: 0 16px 36px -16px rgba(0, 0, 0, 0.5);
  }
  .dossier-card__body {
    padding: 22px 24px 20px 24px;
  }
  .dossier-card__top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  .dossier-card__pill {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #F4F1EB;
    background: #9B2C2C;
    padding: 4px 10px;
    border-radius: 2px;
  }
  .dossier-card__series {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #9CA3AF;
  }
  .dossier-card__title {
    font-family: 'Spectral', 'Source Serif Pro', Georgia, serif;
    font-style: italic;
    font-weight: 300;
    font-size: 24px;
    line-height: 1.2;
    color: #F4F1EB;
    margin: 0 0 8px;
    text-wrap: balance;
  }
  .dossier-card__subtitle {
    font-family: 'Spectral', 'Source Serif Pro', Georgia, serif;
    font-size: 15px;
    color: #F4F1EB;
    opacity: 0.78;
    line-height: 1.5;
    margin: 0 0 14px;
    text-wrap: pretty;
  }
  .dossier-card__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 12px;
    color: #9CA3AF;
    letter-spacing: 0.04em;
  }
  .dossier-card__meta .dot { color: #3F1212; }

  @media (max-width: 560px) {
    .dossier-card__body { padding: 18px 18px 18px 18px; }
    .dossier-card__top { margin-bottom: 12px; }
    .dossier-card__title { font-size: 21px; }
    .dossier-card__subtitle { font-size: 14px; }
  }
</style>
