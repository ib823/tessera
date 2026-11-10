<script lang="ts" module>
  // Latest mode renders in pages so the first paint stays light. How far a
  // reader has expanded it outlives the component: on desktop the reader
  // replaces Today, and Back must return to the same list (playbook §06).
  const LATEST_PAGE = 20;
  const latestLimitMemory = new Map<string, number>();
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { opinionLabel, opinionColor as issueOpinionColor } from '../data/issue-types';
  import IssueImage from './IssueImage.svelte';
  import IssueRow from './IssueRow.svelte';

  import type { IssueSummary } from '../lib/issues-loader';
  import type { ReadState } from '../stores/reader';
  import type { FeedSection, TodayMode } from '../lib/feed-sections';
  import { getDossierFeedEntries } from '../data/dossiers';
  import { absoluteDate, newestDate, relativeDate } from '../lib/relative-date';
  import { publishedDay } from '../lib/issue-meta';
  import { buildTopicClusters, primaryLens, topicHref } from '../lib/topics';
  import { inAppClick, issueHref } from '../lib/link-open';

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
    /** Whether an issue links to two or more others (App's fact graph). */
    issueHasConnections?: (id: string) => boolean;
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
    issueHasConnections,
  }: Props = $props();

  // The quote list is ~70 KB raw (~22 KB brotli) to show one line in the
  // footer. Load it only when the footer nears the screen: on a phone the
  // reader covers Today on every issue page, and most visits never reach the
  // footer, so the list stays off their JS budget (playbook §14).
  let quote = $state('');
  let quoteAnchor = $state<HTMLElement | null>(null);
  $effect(() => {
    const el = quoteAnchor;
    if (!el || quote) return;
    let cancelled = false;
    const load = () => {
      import('../data/quotes')
        .then(({ QUOTES }) => {
          if (!cancelled) quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        })
        .catch(() => {});
    };
    if (typeof IntersectionObserver === 'undefined') {
      load();
      return () => { cancelled = true; };
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        io.disconnect();
        load();
      }
    }, { rootMargin: '400px 0px' });
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  });
  // Relative dates ("3 days ago") are computed against the reader's clock.
  // The server render uses the build time; mount refreshes it.
  let now = $state(new Date());
  onMount(() => {
    now = new Date();
  });

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
    const dates = publishedDay(b).localeCompare(publishedDay(a));
    return dates !== 0 ? dates : b.opinionShift - a.opinionShift;
  }

  let latestIssues = $derived([...issues].sort(byNewest));
  let lastPublished = $derived(newestDate(issues.map(publishedDay)));

  // H-9: the lead is the newest issue this reader has not opened. When they
  // have already opened the newest one, say so instead of presenting a
  // different lead without explanation.
  let newestIssue = $derived(latestIssues[0] ?? null);
  let leadIsPersonal = $derived(!!topIssue && !!newestIssue && topIssue.id !== newestIssue.id && !!readMap[newestIssue.id]);

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

  let secondaryIssues = $derived(latestIssues.filter(issue => issue.id !== topIssue?.id).slice(0, 3));
  let railIssues = $derived(latestIssues.slice(0, 5));

  // svelte-ignore state_referenced_locally — idPrefix is fixed per instance
  let latestLimit = $state(latestLimitMemory.get(idPrefix) ?? LATEST_PAGE);
  let latestVisible = $derived(latestIssues.slice(0, latestLimit));

  // Latest is grouped by publication week (Monday start, Malaysia dates), the
  // natural unit at about three issues a week (playbook §05, screen 02).
  const WEEK_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function weekStart(day: string): string {
    const [y, m, d] = day.split('-').map(Number);
    const t = Date.UTC(y, m - 1, d);
    const dow = (new Date(t).getUTCDay() + 6) % 7;
    return new Date(t - dow * 86_400_000).toISOString().slice(0, 10);
  }
  function weekLabel(start: string, current: string): string {
    if (start === current) return 'This week';
    if (start === new Date(Date.parse(current) - 7 * 86_400_000).toISOString().slice(0, 10)) return 'Last week';
    const [y, m, d] = start.split('-').map(Number);
    return `Week of ${d} ${WEEK_MONTHS[m - 1]}${y === Number(current.slice(0, 4)) ? '' : ` ${y}`}`;
  }
  let latestWeeks = $derived.by(() => {
    const current = weekStart(new Date(now.getTime() + 8 * 3_600_000).toISOString().slice(0, 10));
    const weeks: Array<{ start: string; label: string; issues: IssueSummary[] }> = [];
    for (const issue of latestVisible) {
      const day = publishedDay(issue);
      const start = day ? weekStart(day) : '';
      const last = weeks[weeks.length - 1];
      if (last && last.start === start) last.issues.push(issue);
      else weeks.push({ start, label: start ? weekLabel(start, current) : 'Undated', issues: [issue] });
    }
    return weeks;
  });

  // The same state the other lists show (Continue at card N of M, Read).
  function readStateFor(id: string): ReadState | null {
    const raw = readMap[id];
    if (!raw) return null;
    if (raw === 'true') return { state: 'completed', progress: 6 };
    try { return JSON.parse(raw) as ReadState; } catch { return null; }
  }
  }

  const modes: Array<{ key: TodayMode; label: string }> = [
    { key: 'top', label: 'Top stories' },
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

  function opinionColor(score: number): string {
    if (score >= 80) return 'var(--score-strong)';
    if (score >= 60) return 'var(--score-medium)';
    if (score >= 40) return 'var(--score-partial)';
    return 'var(--score-neutral)';
  }
</script>

{#snippet dateStamp(iso: string | null | undefined)}
  {#if iso && relativeDate(iso, now)}<time class="date-stamp" datetime={iso} title={absoluteDate(iso)} data-relative-date>{relativeDate(iso, now)}</time>{/if}
{/snippet}

<div class="today-shell"><div class="today-wrap" data-fora-home>
{#if hasIssues}
  <header class="today-topline">
    <svelte:element this={headingLevel} class="today-title">{mode === 'latest' ? 'Latest' : 'Top stories'}</svelte:element>
    {#if lastPublished}<span class="today-status" data-last-published>Last published <time datetime={lastPublished}>{formatLongDate(lastPublished)}</time></span>{/if}
  </header>
  <div class="today-modes" role="tablist" aria-label="Today view">
    {#each modes as option}<button id={`${idPrefix}-today-mode-${option.key}`} class="today-mode" class:today-mode--active={mode === option.key} role="tab" type="button" aria-selected={mode === option.key} aria-controls={`${idPrefix}-today-mode-panel`} tabindex={mode === option.key ? 0 : -1} onclick={() => onModeChange?.(option.key)} onkeydown={onModeKeyDown} data-today-mode={option.key}>{option.label}</button>{/each}
  </div>
  <div id={`${idPrefix}-today-mode-panel`} class="today-mode-panel" role="tabpanel" aria-labelledby={`${idPrefix}-today-mode-${mode}`}>
  {#if mode === 'latest'}
        <section class="latest-section" aria-labelledby={`${idPrefix}-latest-heading`}>
          <h2 id={`${idPrefix}-latest-heading`} class="panel-title">All {latestIssues.length} issues</h2>
          <div class="latest-weeks" data-latest-list>
          {#each latestWeeks as week (week.start)}
          <h3 class="latest-week" id={`${idPrefix}-week-${week.start}`} data-latest-week>{week.label}</h3>
          <ol class="latest-list" aria-labelledby={`${idPrefix}-week-${week.start}`}>
            {#each week.issues as issue (issue.id)}
              <li>
                <a class="latest-item" href={issueHref(issue.id)} onclick={inAppClick(() => onOpenIssue?.(issue))}>
                  <IssueRow {issue} readState={readStateFor(issue.id)} density="regular" art={true} headingTag="span" hasConnections={issueHasConnections?.(issue.id) ?? false} />
                </a>
              </li>
            {/each}
          </ol>
          {/each}
          </div>
          {#if latestIssues.length > latestLimit}
            <button class="latest-more" onclick={() => { latestLimit += LATEST_PAGE; latestLimitMemory.set(idPrefix, latestLimit); }}>Show {Math.min(LATEST_PAGE, latestIssues.length - latestLimit)} more</button>
          {/if}
        </section>

  {:else}
    <div class="frontpage-grid">
    {#if topIssue && onOpenIssue}
      <article class="hero-entry" aria-labelledby={`${idPrefix}-lead-issue-title`}>
        <a class="hero-card" href={issueHref(topIssue.id)} onclick={inAppClick(() => onOpenIssue?.(topIssue))}>
          {#if topIssue.hasImage}<div class="hero-art"><IssueImage issueId={topIssue.id} size="hero" aspectRatio="16/9" borderRadius="0" alt="" eager={true} /></div>{/if}
          <div class="hero-copy">
            <div class="hero-badge-row"><span class="hero-badge" data-lead-label>{leadIsPersonal ? "You've opened the latest issue. Next up:" : 'Latest issue'}</span>{@render dateStamp(publishedDay(topIssue))}</div>
            <h2 id={`${idPrefix}-lead-issue-title`} class="hero-headline balance-title">{topIssue.headline}</h2>
            <p class="hero-context pretty-copy">{topIssue.context}</p>
            <div class="hero-meta"><span>{primaryLens(topIssue.cards)}</span><span class="hero-shift" style="color:{opinionColor(topIssue.opinionShift)};">Opinion Shift <strong>{topIssue.opinionShift}</strong> · {opinionLabel(topIssue.opinionShift)}</span></div>
            <span class="hero-cta">Read the issue <span aria-hidden="true">→</span></span>
          </div>
        </a>
      </article>
    {/if}
    <section class="secondary-stories" aria-label="More stories">
      {#each secondaryIssues as issue, index (issue.id)}
        <article class="secondary-story">
          <a href={issueHref(issue.id)} onclick={inAppClick(() => onOpenIssue?.(issue))}>
            {#if issue.hasImage}<div class="secondary-art" class:secondary-art--lead={index === 0}><IssueImage issueId={issue.id} size="card" aspectRatio="16/9" borderRadius="0" alt="" /></div>{/if}
            <div class="secondary-copy"><span class="story-lens">{primaryLens(issue.cards)}</span><h2>{issue.headline}</h2><div class="story-meta">{@render dateStamp(publishedDay(issue))}<span>Opinion Shift {issue.opinionShift}</span></div></div>
          </a>
        </article>
      {/each}
    </section>
    <section class="latest-rail" aria-labelledby={`${idPrefix}-rail-heading`}>
      <h2 id={`${idPrefix}-rail-heading`}>Latest</h2>
      <ol>{#each railIssues as issue (issue.id)}<li><a href={issueHref(issue.id)} onclick={inAppClick(() => onOpenIssue?.(issue))}>{@render dateStamp(publishedDay(issue))}<span>{issue.headline}</span></a></li>{/each}</ol>
      <button type="button" onclick={() => onModeChange?.('latest')}>All latest issues <span aria-hidden="true">→</span></button>
    </section>
    </div>
    {#if continueIssue && onOpenIssue}
      <section class="continue-panel" aria-labelledby={`${idPrefix}-continue-reading-heading`}>
        <h2 id={`${idPrefix}-continue-reading-heading`} class="panel-kicker">Continue reading</h2>
        <a class="panel-issue" href={issueHref(continueIssue.id)} onclick={inAppClick(() => onOpenIssue?.(continueIssue))}><span class="panel-issue-title">{continueIssue.headline}</span><span class="panel-issue-copy">Angle {nextContinueAngle} next</span><span class="panel-progress-track"><span class="panel-progress-fill" style="width:{Math.min(100, (continueProgress / (continueIssue?.cards.length ?? 6)) * 100)}%;"></span></span></a>
      </section>
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
                <a class="topic-issue" href={issueHref(issue.id)} onclick={inAppClick(() => onOpenIssue?.(issue))}>
                  <span class="topic-issue-score" style="color:{issueOpinionColor(issue.opinionShift)};">{issue.opinionShift}</span>
                  <div class="topic-issue-copy">
                    {@render dateStamp(publishedDay(issue))}
                    <div class="topic-issue-headline balance-title">{issue.headline}</div>
                    <div class="topic-issue-context pretty-copy">{issue.context}</div>
                  </div>
                </a>
              {/each}
              <a class="topic-all-link" href={topicHref(activeCluster.topic)}>All {activeCluster.count} {activeCluster.topic} issues <span aria-hidden="true">→</span></a>
            {/if}
          </div>
        </section>
      {/if}
  {/if}
  </div>
      {#if showWelcome}
        <div class="welcome-card" role="note" aria-label="Welcome to FORA" data-prompt="welcome">
          <div class="welcome-content">
            <p class="welcome-text"><strong>FORA</strong>, short for The Fourth Angle, is a nonpartisan Malaysian issues platform. We show you what every side left out, then let you decide.</p>
            <p class="welcome-text">The <strong>Opinion Shift</strong> number on each issue tells you how much you would miss by reading only the headline. Higher means more hidden complexity.</p>
            <a href="/about" class="welcome-link">How this works <span aria-hidden="true">→</span></a>
          </div>
          <button class="welcome-dismiss" onclick={() => onDismissWelcome?.()} aria-label="Dismiss welcome message">&times;</button>
        </div>
      {/if}
      <footer class="today-footer" bind:this={quoteAnchor}>
        {#if quote}<div class="today-quote">"{quote}"</div>{/if}
        <div class="today-ethos">Editorial ethos</div>
        <nav class="today-footer-links" aria-label="Footer navigation">
          <a href="/about">How This Works</a>
          <a href="/disclaimer">Disclaimer</a>
          <a href="/verify">Verify Content</a>
          <a href="/privacy">Privacy</a>
          <a href="/corrections">Corrections</a>
          <a href="/contact">Contact</a>
          <a href="/accessibility">Accessibility</a>
          <a href="/rss.xml" type="application/rss+xml">RSS</a>
        </nav>
        <p class="today-name-note">FORA is short for The Fourth Angle. T4A is our signature.</p>
      </footer>

{:else if !loading}
  <div class="coming-soon" bind:this={quoteAnchor}><svelte:element this={headingLevel} class="today-title">No issues to show right now.</svelte:element><p>Check back soon, or read <a href="/about">how this works</a>.</p></div>
{/if}
</div></div>

<style>
  .today-shell { flex:1 0 auto; background:var(--fora-paper); }
  .today-wrap { max-width:1360px; margin:auto; padding:0 24px 48px; }
  .today-topline { display:flex; align-items:baseline; justify-content:space-between; gap:16px; padding:24px 0 16px; }
  .today-title { margin:0; font:700 clamp(1.5rem, 2.5vw, 2rem)/1.1 var(--fora-serif); letter-spacing:-.015em; }
  .today-status, .date-stamp { font:.75rem/1.5 var(--fora-sans); color:var(--fora-muted); }
  .today-modes { display:flex; gap:24px; border-bottom:1px solid var(--fora-rule); margin-bottom:24px; }
  .today-mode { background:none; border:0; border-bottom:3px solid transparent; padding:10px 0; min-height:44px; font:600 .875rem/1.5 var(--fora-sans); color:var(--fora-muted); cursor:pointer; }
  .today-mode--active { color:var(--fora-brand); border-bottom-color:var(--fora-brand); }
  .frontpage-grid { display:grid; grid-template-columns:minmax(0, 7fr) minmax(0, 3.5fr) minmax(0, 3fr); gap:24px; align-items:start; }
  a { color:inherit; text-decoration:none; }
  a:hover h2, a:hover .topic-issue-headline { text-decoration:underline; text-underline-offset:3px; }
  .hero-art { margin-bottom:16px; overflow:hidden; }
  .hero-badge-row, .hero-meta, .story-meta { display:flex; flex-wrap:wrap; align-items:baseline; gap:8px 12px; }
  .hero-badge, .story-lens, .panel-kicker, .topic-header > .panel-kicker { font:700 .75rem/1.6 var(--fora-sans); text-transform:uppercase; letter-spacing:.08em; color:var(--fora-brand); }
  .hero-headline { font:700 clamp(1.875rem, 3.1vw, 2.75rem)/1.04 var(--fora-serif); margin:10px 0 14px; letter-spacing:-.018em; overflow-wrap:break-word; }
  .hero-context { margin:0 0 16px; font:400 1rem/1.6 var(--fora-sans); color:var(--fora-ink-2); }
  .hero-meta, .story-meta { font:.75rem/1.5 var(--fora-sans); color:var(--fora-muted); }
  .hero-cta { display:inline-flex; align-items:center; gap:12px; min-height:44px; margin-top:8px; color:var(--fora-brand); font:600 .875rem var(--fora-sans); }
  .secondary-story { padding:16px 0; border-bottom:1px solid var(--fora-rule); }
  .secondary-story:first-child { padding-top:0; }
  .secondary-art { display:none; margin-bottom:12px; }
  .secondary-art--lead { display:block; }
  .secondary-story h2 { font:700 1.375rem/1.15 var(--fora-serif); margin:6px 0 10px; }
  .latest-rail { border-left:1px solid var(--fora-rule); padding-left:20px; }
  .latest-rail h2 { font:700 .75rem var(--fora-sans); text-transform:uppercase; letter-spacing:.07em; margin:0; padding-bottom:12px; border-bottom:1px solid var(--fora-ink); }
  .latest-rail ol { list-style:none; padding:0; margin:0; }
  .latest-rail li { border-bottom:1px solid var(--fora-rule); }
  .latest-rail a { display:grid; gap:6px; padding:16px 0; font:700 1.125rem/1.25 var(--fora-serif); }
  .latest-rail button, .latest-more { border:0; background:transparent; color:var(--fora-brand); min-height:44px; padding:12px 0; cursor:pointer; font:600 .875rem var(--fora-sans); }
  .continue-panel { max-width:640px; margin-top:32px; border:1px solid var(--fora-rule); border-radius:12px; padding:20px; background:var(--fora-surface); }
  .panel-kicker { margin:0 0 8px; }
  .panel-issue { display:grid; gap:12px; }
  .panel-issue-title { font:700 1.375rem/1.2 var(--fora-serif); }
  .panel-issue-copy { font:.875rem var(--fora-sans); color:var(--fora-muted); }
  .panel-progress-track { height:3px; background:var(--fora-rule); display:block; }
  .panel-progress-fill { height:100%; display:block; background:var(--fora-brand); }
  .topic-section, .featured-dossiers { border-top:1px solid var(--fora-ink); margin-top:32px; padding-top:20px; }
  .panel-title { font:700 1.5rem/1.2 var(--fora-serif); margin:0 0 16px; }
  .topic-chips { display:flex; flex-wrap:wrap; gap:8px; }
  .topic-chip { display:flex; gap:12px; align-items:center; min-height:44px; border:1px solid var(--fora-control-edge); border-radius:24px; padding:8px 16px; background:transparent; font:500 .875rem var(--fora-sans); color:var(--fora-ink-2); cursor:pointer; }
  .topic-chip--active { color:var(--fora-brand); background:var(--fora-brand-tint); border-color:var(--fora-brand); }
  .topic-chip-count { color:var(--fora-muted); font-size:.75rem; }
  .topic-issues { max-width:900px; margin-top:16px; }
  .topic-issue { display:flex; align-items:baseline; gap:20px; border-top:1px solid var(--fora-rule); padding:20px 0; }
  .topic-issue-score { font:700 1.5rem var(--fora-serif); }
  .topic-issue-headline { font:700 1.375rem/1.2 var(--fora-serif); margin:5px 0 8px; }
  .topic-issue-context { color:var(--fora-ink-2); font:.9375rem/1.6 var(--fora-sans); }
  .topic-all-link { display:inline-flex; min-height:44px; align-items:center; color:var(--fora-brand); font:600 .875rem var(--fora-sans); }
  .dossier-card { display:block; padding:20px; background:var(--fora-surface); border:1px solid var(--fora-rule); border-radius:12px; }
  .dossier-card__top, .dossier-card__meta { display:flex; flex-wrap:wrap; gap:8px; color:var(--fora-muted); font:.75rem/1.6 var(--fora-sans); }
  .dossier-card__title { font:700 1.75rem/1.15 var(--fora-serif); margin:12px 0; }
  .dossier-card__subtitle { color:var(--fora-ink-2); margin-bottom:12px; }
  .latest-section { max-width:900px; margin:auto; }
  .latest-week { margin:32px 0 0; padding:12px 0; border-top:1px solid var(--fora-ink); font:700 .8125rem var(--fora-sans); color:var(--fora-brand); text-transform:uppercase; letter-spacing:.04em; }
  .latest-list { list-style:none; margin:0; padding:0; }
  .latest-list li { border-top:1px solid var(--fora-rule); }
  .latest-item { display:block; padding:24px 0; }
  .welcome-card { position:relative; margin-top:32px; padding:20px 56px 20px 20px; background:var(--fora-brand-tint); border-radius:12px; max-width:760px; }
  .welcome-text { font:.875rem/1.6 var(--fora-sans); margin:0 0 8px; }
  .welcome-link { color:var(--fora-brand); font:600 .875rem/1.6 var(--fora-sans); display:inline-flex; align-items:center; min-height:44px; }
  .welcome-dismiss { position:absolute; top:8px; right:8px; min-width:44px; min-height:44px; background:none; border:0; color:var(--fora-ink); font-size:1.5rem; cursor:pointer; }
  .today-footer { border-top:1px solid var(--fora-rule); margin-top:40px; padding-top:24px; text-align:center; }
  .today-quote { font:400 1.125rem/1.5 var(--fora-serif); max-width:55ch; margin:auto; }
  .today-ethos { font:.75rem/1.5 var(--fora-sans); text-transform:uppercase; letter-spacing:.08em; color:var(--fora-muted); margin:12px 0; }
  .today-footer-links { display:flex; flex-wrap:wrap; justify-content:center; gap:0 20px; }
  .today-name-note { font:.75rem/1.5 var(--fora-sans); color:var(--fora-muted); margin:8px 0 0; }
  .today-footer-links a { min-height:44px; display:inline-flex; align-items:center; font:.75rem var(--fora-sans); text-decoration:underline; text-underline-offset:3px; color:var(--fora-muted); }
  @media(max-width:1100px) { .frontpage-grid { grid-template-columns:minmax(0, 1.5fr) minmax(0, 1fr); } .latest-rail { grid-column:1 / -1; border-left:0; padding-left:0; } .latest-rail ol { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px; } }
  @media(max-width:600px) {
    .today-wrap { padding:0 16px 32px; }
    .today-topline { padding:18px 0 12px; align-items:flex-start; }
    .today-status { max-width:46%; text-align:right; }
    .today-modes { margin-bottom:16px; }
    .frontpage-grid { display:block; }
    .hero-headline { font-size:2rem; }
    .hero-art { margin-inline:-16px; }
    .secondary-stories { margin-top:12px; }
    .secondary-story { padding:20px 0; }
    .secondary-story a { display:flex; flex-direction:row-reverse; gap:16px; align-items:flex-start; }
    .secondary-copy { flex:1; min-width:0; }
    .secondary-art, .secondary-art--lead { display:block; width:88px; flex:0 0 88px; margin:4px 0 0; }
    .secondary-story h2 { font-size:1.375rem; }
    .latest-rail { margin-top:32px; }
    .latest-rail ol { display:block; }
    .topic-issue { gap:12px; }
  }
  @media(forced-colors:active) { .today-mode--active { border-color:Highlight; } .topic-chip--active { outline:2px solid Highlight; } }
</style>
