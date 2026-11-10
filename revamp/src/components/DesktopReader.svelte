<script lang="ts">
  import { primaryLens, topicHref } from '../lib/topics';
  import { onMount, onDestroy } from 'svelte';
  import OpinionBar from './OpinionBar.svelte';
  import VerdictBar from './VerdictBar.svelte';
  import { CARD_TYPES, opinionColor, opinionLabel } from '../data/issue-types';
  import { getReadState, markCompleted, updateProgress } from '../stores/reader';
  import { countUp } from '../lib/animation';
  import SaveButton from './SaveButton.svelte';
  import ShareModal from './ShareModal.svelte';
  import PushPrompt from './PushPrompt.svelte';
  import VerifyCopyButton from './VerifyCopyButton.svelte';
  import IssueImage from './IssueImage.svelte';
  import IssueSources from './IssueSources.svelte';
  import IssueMeta from './IssueMeta.svelte';
  import IssueChanges from './IssueChanges.svelte';
  import CardSources from './CardSources.svelte';
  import { withBuildId } from '../lib/build';
  import { initialCardFromLocation } from '../lib/card-anchor';
  import { resolveRelatedIssue, type RelatedPick } from '../lib/related-next';
  import { truncateAtWord } from '../lib/seo';

  import type { Issue } from '../data/issue-types';

  interface Connection {
    id: string;
    weight: number;
    sharedEntities: string[];
    headline: string;
    opinionShift: number;
    readState: string | null;
    hasReaction: boolean;
  }

  interface Props {
    issue: Issue;
    onReturnHome?: () => void;
    onNext?: () => void;
    nextHeadline?: string;
    connections?: Connection[];
    onNavigateToIssue?: (issueId: string) => void;
    initialCardIndex?: number;
  }
  let { issue, onReturnHome, onNext, nextHeadline, connections = [], onNavigateToIssue, initialCardIndex = 0 }: Props = $props();

  // Reactions handled by SaveButton component
  let scrollEl: HTMLDivElement | undefined = $state(undefined);
  let completionMarker: HTMLDivElement | undefined = $state(undefined);
  let cardEls: Array<HTMLDivElement | undefined> = $state([]);
  let shareOpen = $state(false);
  let shareCardIndex: number | null = $state(null);
  // "Continue: related" in the completion block (A-8).
  let relatedPick = $state<RelatedPick | null>(null);
  // A card deep link (/issue/{id}#card-N, SH-2) applies to the issue in the
  // URL until the reader has scrolled to it once.
  const hashIssueId = issue.id;
  const hashCard = initialCardFromLocation(issue.id, issue.cards.length);
  let hashCardApplied = hashCard === null;
  let activeStep = $state(Math.max(0, Math.min(initialCardIndex, Math.max(issue.cards.length - 1, 0))));
  let persistedProgress = $state(0);
  let pendingInitialCardIndex: number | null = $state(initialCardIndex > 0 ? initialCardIndex : null);
  // The reading path stays pinned to the top of the reading column, so it
  // shows where you are while you read instead of scrolling away above the
  // headline (where it always showed card 1).
  let progressShell: HTMLDivElement | undefined = $state();
  let pathSentinel: HTMLDivElement | undefined = $state();
  let pathHeight = $state(0);
  let pathStuck = $state(false);

  function cardLabel(card: Issue['cards'][number]) {
    const m = CARD_TYPES[card.t] ?? CARD_TYPES.hook;
    return card.t === 'fact' && card.lens ? `${m.label} \u00B7 ${card.lens}` : m.label;
  }

  // Screen Wake Lock: keep screen on while reading
  let wakeLock: WakeLockSentinel | null = null;
  let visCleanup: (() => void) | null = null;

  onMount(async () => {
    // Acquire wake lock
    if ('wakeLock' in navigator) {
      try { wakeLock = await navigator.wakeLock.request('screen'); } catch {}
    }
    // Re-acquire on visibility change (released when tab goes background)
    const onVis = async () => {
      if (document.visibilityState === 'visible' && !wakeLock) {
        try { wakeLock = await navigator.wakeLock.request('screen'); } catch {}
      }
    };
    document.addEventListener('visibilitychange', onVis);
    visCleanup = () => document.removeEventListener('visibilitychange', onVis);

    // Clear notification for this issue
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'ISSUE_OPENED', issueId: issue.id });
    }
  });

  onDestroy(() => {
    wakeLock?.release().catch(() => {});
    wakeLock = null;
    visCleanup?.();
    countUpCancel?.();
  });

  // C1: Animated opinion shift count-up
  let displayOS = $state(issue.opinionShift);
  let countUpCancel: (() => void) | null = null;

  // F13: Content fade+slide on article switch
  let transitioning = $state(false);
  let lastId = $state(issue.id);
  $effect(() => {
    if (issue.id !== lastId) {
      lastId = issue.id;
      transitioning = true;
      requestAnimationFrame(() => {
        // C2: Smooth scroll to top
        scrollEl?.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { transitioning = false; }, 50);
      });
      // C1: Count-up animation on issue switch
      countUpCancel?.();
      displayOS = 0;
      setTimeout(() => {
        countUpCancel = countUp(0, issue.opinionShift, 600, (v) => { displayOS = v; });
      }, 100);
    }
  });

  $effect(() => {
    if (!completionMarker) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        markCompleted(issue.id, issue.cards.length);
      }
    }, { threshold: 0.5 });
    obs.observe(completionMarker);
    return () => obs.disconnect();
  });

  let viewCard = $derived(issue.cards.findLast((c) => c.t === 'view'));
  let activeStageLabel = $derived(cardLabel(issue.cards[activeStep] ?? issue.cards[0]));

  let barColor = $derived(opinionColor(issue.opinionShift));

  let label = $derived(opinionLabel(issue.opinionShift));

  function opinionNarrative(score: number): string {
    if (score >= 80) return `Reading only the headline would hide about ${score}% of the story.`;
    if (score >= 60) return `The headline leaves out most of the context that changes the meaning.`;
    if (score >= 40) return `The headline is directionally true, but it still misses a consequential layer.`;
    return `The headline gets the outline, but the deeper frame still matters.`;
  }

  // The current card is the last one whose top has passed a reading line
  // just under the pinned reading path. (Picking the most visible card, as
  // before, put two fully visible cards in a tie that the later one won, so
  // jumping to card 4 marked card 5.) At the end of the article the last
  // card is current.
  function updateActiveStep() {
    if (!scrollEl) return;
    const els = cardEls.filter(Boolean) as HTMLDivElement[];
    if (els.length === 0) return;
    const line = scrollEl.getBoundingClientRect().top + (progressShell?.offsetHeight ?? 0) + 24;
    let index = 0;
    for (let i = 0; i < els.length; i++) {
      if (els[i].getBoundingClientRect().top <= line) index = i;
      else break;
    }
    if (scrollEl.scrollTop > 0 && scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 2) index = els.length - 1;
    activeStep = index;
    const nextProgress = index + 1;
    if (index > 0 && nextProgress > persistedProgress) {
      persistedProgress = nextProgress;
      updateProgress(issue.id, nextProgress);
    }
  }

  let stepFrame = 0;
  function onReaderScroll() {
    if (stepFrame) return;
    stepFrame = requestAnimationFrame(() => { stepFrame = 0; updateActiveStep(); });
  }

  function setupStepObserver() {
    requestAnimationFrame(() => {
      if (!scrollEl) return;
      const els = cardEls.filter(Boolean) as HTMLDivElement[];
      if (els.length === 0) return;

      if (pendingInitialCardIndex != null && pendingInitialCardIndex > 0) {
        const targetIndex = Math.max(0, Math.min(pendingInitialCardIndex, els.length - 1));
        const targetEl = els[targetIndex];
        if (targetEl) {
          scrollEl.scrollTop = Math.max(0, targetEl.offsetTop - (progressShell?.offsetHeight ?? 0) - 16);
          activeStep = targetIndex;
          hashCardApplied = true;
        }
        pendingInitialCardIndex = null;
      } else {
        updateActiveStep();
      }
    });
  }

  $effect(() => {
    const root = scrollEl;
    if (!root) return;
    root.addEventListener('scroll', onReaderScroll, { passive: true });
    return () => {
      root.removeEventListener('scroll', onReaderScroll);
      if (stepFrame) cancelAnimationFrame(stepFrame);
      stepFrame = 0;
    };
  });

  $effect(() => {
    const target = issue;
    relatedPick = null;
    let cancelled = false;
    resolveRelatedIssue(target).then((pick) => {
      if (!cancelled) relatedPick = pick;
    });
    return () => { cancelled = true; };
  });

  function startCardIndex(): number {
    if (!hashCardApplied && hashCard !== null && issue.id === hashIssueId) return hashCard;
    return initialCardIndex;
  }

  onMount(() => {
    // The browser already jumped the window to the static article's
    // #card-N section before the reader replaced it; the reader scrolls its
    // own column, so put the window back at the top.
    if (hashCard !== null) window.scrollTo(0, 0);
  });

  $effect(() => {
    void issue.id;
    void initialCardIndex;
    const nextInitialIndex = Math.max(0, Math.min(startCardIndex(), Math.max(issue.cards.length - 1, 0)));
    activeStep = nextInitialIndex;
    persistedProgress = getReadState(issue.id)?.progress ?? 0;
    pendingInitialCardIndex = nextInitialIndex > 0 ? nextInitialIndex : null;
    // Do not reset cardEls here: bind:this fills it once per element and does
    // not re-run, so clearing it left the step observer with no cards. The
    // "Reading path" never advanced on scroll and a start card (resume or
    // #card-N) was never scrolled to.
    setupStepObserver();
  });

  $effect(() => {
    const ready = cardEls.filter(Boolean).length;
    if (ready === issue.cards.length && ready > 0) {
      setupStepObserver();
    }
  });

  // A rule under the reading path once it is pinned over the text.
  $effect(() => {
    const sentinel = pathSentinel;
    const root = scrollEl;
    if (!sentinel || !root) return;
    const observer = new IntersectionObserver(([entry]) => { pathStuck = !entry.isIntersecting; }, { root });
    observer.observe(sentinel);
    return () => observer.disconnect();
  });

  // J/K keyboard navigation between cards
  function onReaderKeyDown(e: KeyboardEvent) {
    // Don't intercept if user is typing in an input
    if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
    const els = cardEls.filter(Boolean) as HTMLDivElement[];
    if (els.length === 0) return;
    if (e.key === 'j' || e.key === 'ArrowDown') {
      const next = Math.min(activeStep + 1, els.length - 1);
      if (next !== activeStep) {
        e.preventDefault();
        els[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      const prev = Math.max(activeStep - 1, 0);
      if (prev !== activeStep) {
        e.preventDefault();
        els[prev]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
</script>

<svelte:window onkeydown={onReaderKeyDown} />
<div bind:this={scrollEl} role="article" aria-label="Issue reader — use J/K or arrow keys to navigate between cards" class:reader-switching={transitioning}
  style="flex:1;overflow-y:auto;background:var(--bg);--reading-path-offset:{pathHeight + 16}px;transition:opacity var(--duration-fast, 150ms) ease-out, transform var(--duration-fast, 150ms) ease-out;">
  <!-- Screen reader announcement for issue change -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">Now reading: {issue.headline}</div>
  <div class="reader-content-wrap">
    <div class="reader-path-sentinel" bind:this={pathSentinel} aria-hidden="true"></div>
    <div class="reader-progress-shell" class:reader-progress-shell--stuck={pathStuck} bind:this={progressShell} bind:offsetHeight={pathHeight} data-reading-path>
      <div class="reader-progress-copy">
        <div class="reader-progress-kicker" data-reading-path-position>Card {activeStep + 1} of {issue.cards.length}</div>
        <div class="reader-progress-label balance-title">{activeStageLabel}</div>
      </div>
      <div class="reader-progress-track" style="--steps:{issue.cards.length};" role="navigation" aria-label="Reading path — click to jump to a card">
        {#each issue.cards as card, i}
          {@const cardMeta = CARD_TYPES[card.t] ?? CARD_TYPES.hook}
          <button
            class="reader-progress-segment"
            class:reader-progress-segment--done={i < activeStep}
            class:reader-progress-segment--active={i === activeStep}
            aria-current={i === activeStep ? 'step' : undefined}
            onclick={() => { const el = cardEls[i]; if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
            title="{cardMeta.label}{card.lens ? ' · ' + card.lens : ''}"
            aria-label="Card {i + 1}: {cardMeta.label}{card.lens ? ' — ' + card.lens : ''}"
          ></button>
        {/each}
      </div>
    </div>

    <div class="reader-head">
      <div class="reader-headline-wrap">
        <h1 class="reader-headline balance-title">{issue.headline}</h1>
        <IssueMeta {issue} variant="desktop" />
        {#if primaryLens(issue.cards)}<a class="fora-issue-topic" href={topicHref(primaryLens(issue.cards)!)}>More on {primaryLens(issue.cards)} <span aria-hidden="true">→</span></a>{/if}
      </div>
      <div class="reader-actions">
        <button onclick={() => { shareCardIndex = null; shareOpen = true; }} style="flex-shrink:0;display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius: var(--radius-pill);border:1px solid var(--border-subtle);background:var(--bg-elevated);cursor:pointer;transition:background 0.2s ease-out,border-color 0.2s ease-out;margin-top:4px;min-height:44px;" onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--border-subtle)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-divider)'; }} onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'; }} aria-label="Share this issue" aria-expanded={shareOpen} aria-haspopup="dialog">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          <span style="font-size: var(--text-sm);font-weight:700;color:var(--text-tertiary);">Share</span>
        </button>
      </div>
    </div>
    {#if issue.legacyAudit}
      <div role="note" aria-label="Pre-pipeline issue notice" style="display:flex;align-items:flex-start;gap:8px;margin:14px 0 0;padding:10px 12px;background:var(--bg-sunken);border-left:3px solid var(--border-subtle);border-radius:var(--radius-sm);font-size:var(--text-sm);line-height:1.5;color:var(--text-muted);max-width:62ch;">
        <span aria-hidden="true" style="flex-shrink:0;font-weight:700;color:var(--text-tertiary);">&#9432;</span>
        <span style="flex:1;">Pre-pipeline issue &mdash; primary sources for the claims below are not on file yet. The editorial review trail predates the current 4-stage pipeline. <a href="/disclaimer" style="color:var(--text-muted);text-decoration:underline;text-underline-offset:2px;">Read more</a>.</span>
      </div>
    {/if}
    <p style="font-size: var(--text-reading-lg);color:var(--text-secondary);font-weight: 400;line-height:1.65;margin:16px 0 0;max-width:62ch;">{issue.context}</p>

    <div class="fora-reader-art"><IssueImage issueId={issue.id} size="hero" aspectRatio="1.91/1" borderRadius="0" alt="" eager={true}/></div>

    <div style="margin:24px 0 0;padding:20px 24px;border-radius: var(--radius-xl);border:1px solid var(--border-subtle);background:var(--fora-brand-tint);display:grid;grid-template-columns:minmax(110px, 0.4fr) minmax(0, 1fr);gap:20px;align-items:center;">
      <div>
        <div style="font-size: var(--text-xs);font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-tertiary);">Opinion Shift</div>
        <div style="font-family:var(--font-display);font-size: var(--text-display);line-height:0.9;letter-spacing:-0.05em;color:{barColor};margin-top:12px;">{displayOS}</div>
        <div style="font-size: var(--text-xs);font-weight:700;color:{barColor};text-transform:uppercase;letter-spacing:0.06em;margin-top:8px;">{label}</div>
      </div>
      <div>
        <p style="font-size: var(--text-reading-lg);font-weight:700;line-height:1.35;color:var(--text-primary);margin:0;">{opinionNarrative(issue.opinionShift)}</p>
        <p style="font-size: var(--text-ui);line-height:1.6;color:var(--text-secondary);margin:8px 0 0;">This is FORA's own measure: how much the story changes when you read beyond the first telling.</p>
        <div style="margin-top:16px;"><OpinionBar score={issue.opinionShift} height={8} showLabel={false} /></div>
      </div>
    </div>

    {#if issue.finalScore}
      {@const nsColor = issue.finalScore >= 75 ? 'var(--score-info)' : issue.finalScore >= 50 ? 'var(--score-warning)' : 'var(--score-critical, var(--score-strong))'}
      <div style="display:flex;align-items:center;gap:12px;margin:12px 0 0;padding:12px 16px;border-radius:var(--radius-lg);border:1px solid var(--border-subtle);background:var(--bg-elevated);">
        <span style="font-family:var(--font-display);font-size:var(--text-title);font-weight:800;color:{nsColor};font-variant-numeric:tabular-nums;">{Math.round(issue.finalScore)}</span>
        <div>
          <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;">Editorial Quality Score</div>
          <div style="font-size:var(--text-sm);color:var(--text-secondary);margin-top:2px;">Combined score across this issue's review stages. Higher means more balanced and thorough analysis.</div>
        </div>
      </div>
    {/if}

    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:16px 0 32px;">
      {#if issue.status === 'new'}
        <span style="font-size: var(--text-micro);font-weight:700;color:var(--status-green-text);background:var(--status-green-bg);padding:4px 8px;border-radius: var(--radius-pill);text-transform:uppercase;">New</span>
      {:else if issue.status === 'updated'}
        <span style="font-size: var(--text-micro);font-weight:700;color:var(--status-blue-text);background:var(--status-blue-bg);padding:4px 8px;border-radius: var(--radius-pill);text-transform:uppercase;">Updated</span>
      {/if}
      {#if issue.edition > 1}
        <span style="font-size: var(--text-xs);font-weight:700;color:var(--text-secondary);padding:4px 8px;border-radius: var(--radius-pill);background:var(--bg-elevated);border:1px solid var(--border-subtle);">Edition {issue.edition}</span>
      {/if}
    </div>

    <!-- 6 Perspectives -->
    {#each issue.cards as card, i}
      {@const meta = CARD_TYPES[card.t] ?? CARD_TYPES.hook}
      <div class="fora-reading-step" bind:this={cardEls[i]} data-step={i} style="margin-bottom:20px;">
        <div style="padding:24px;border-radius: var(--radius-xl);background:var(--bg-elevated);border:1px solid var(--border-subtle);box-shadow:0 16px 36px rgba(24,24,24,0.05);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
              <div style="width:32px;height:32px;border-radius: var(--radius-round);display:flex;align-items:center;justify-content:center;background:{meta.bg};color:{meta.color};font-size: var(--text-sm);font-weight: 700;">{i + 1}</div>
              <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius: var(--radius-pill);background:{meta.bg};">
                <span style="width:20px;height:20px;border-radius: var(--radius-round);display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.66);">
                  {#if card.t === 'hook'}
                    <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={meta.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {:else if card.t === 'fact'}
                    <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={meta.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6"></circle><path d="m20 20-3.5-3.5"></path></svg>
                  {:else if card.t === 'reframe'}
                    <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={meta.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
                  {:else if card.t === 'analogy'}
                    <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={meta.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>
                  {:else}
                    <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={meta.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><path d="m14.5 9.5-3 7-1-4-4-1z"></path></svg>
                  {/if}
                </span>
                <span style="font-size: var(--text-sm);font-weight:700;color:{meta.color};">{cardLabel(card)}</span>
              </div>
            </div>
            <SaveButton issueId={issue.id} cardIndex={i} />
          </div>

          <p class="fora-card-lead">{card.big}</p>
          {#if card.sub}
            <p class="fora-card-body">{card.sub}</p>
          {/if}
          <CardSources {card} entries={issue.sourceList} variant="desktop" />
          {#if card.t === 'fact' && connections.length > 0}
            <button onclick={() => completionMarker?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style="font-size:var(--text-xs);font-weight:700;color:var(--score-info);margin-top:16px;display:inline-flex;align-items:center;gap:4px;background:none;border:none;cursor:pointer;padding:0;font-family:inherit;transition:color 0.15s ease;" onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }} onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--score-info)'; }}>
              Tracked in {connections.length} {connections.length === 1 ? 'issue' : 'issues'} <span aria-hidden="true">↓</span>
            </button>
          {/if}
        </div>
      </div>
    {/each}

    <div bind:this={completionMarker} style="height:1px;"></div>

    <div style="margin-top:20px;padding:24px;border-radius: var(--radius-xl);border:1px solid rgba(46,125,50,0.16);background:linear-gradient(180deg, rgba(46,125,50,0.08) 0%, rgba(255,255,255,0.92) 100%);">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div style="width:34px;height:34px;border-radius: var(--radius-round);display:flex;align-items:center;justify-content:center;background:rgba(46,125,50,0.14);color:var(--status-green);">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div style="font-family:var(--font-display);font-size: var(--text-title);line-height:1.05;letter-spacing:-0.03em;color:var(--text-primary);">You’ve seen the full picture.</div>
          <div style="font-size: var(--text-ui);line-height:1.55;color:var(--text-secondary);margin-top:4px;">The headline, the evidence, the reframing, and the considered view are now on the table.</div>
        </div>
      </div>

      <!-- Connected issues -->
      {#if connections.length >= 2}
        <div style="margin:20px 0 16px;">
          <div style="font-size: var(--text-xs);font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em;">{connections.length} connected issues</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            {#each connections as conn}
              <button
                onclick={() => onNavigateToIssue?.(conn.id)}
                style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius: var(--radius-md);background:var(--bg-elevated);border:1px solid var(--border-subtle);cursor:pointer;text-align:left;width:100%;transition:background 0.2s ease-out;"
                onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-sunken)'; }}
                onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; }}
              >
                <div style="width:36px;height:36px;flex-shrink:0;border-radius: var(--radius-sm);overflow:hidden;background:var(--bg-sunken);">
                  <picture>
                    <source type="image/avif" srcset={withBuildId(`/og/issue-${conn.id}-640w.avif`)} />
                    <source type="image/webp" srcset={withBuildId(`/og/issue-${conn.id}-640w.webp`)} />
                    <img src={withBuildId(`/og/issue-${conn.id}-640w.jpg`)} alt="" width="36" height="36" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;" onerror={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
                  </picture>
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    {#if conn.readState === 'completed'}
                      <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--status-green)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>
                    {:else if conn.readState === 'started'}
                      <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><circle cx="12" cy="12" r="9" stroke="var(--score-warning)" stroke-width="2" fill="none"/><path d="M12 3a9 9 0 0 1 0 18" fill="var(--score-warning)"/></svg>
                    {/if}
                    <div style="font-size: var(--text-sm);font-weight:{conn.readState === 'completed' ? '600' : '600'};color:{conn.readState === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)'};line-height:1.35;">{conn.headline}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                    <span style="font-size: var(--text-micro);color:var(--text-muted);">{conn.sharedEntities.slice(0, 3).join(' · ')}</span>
                    {#if conn.hasReaction}
                      <svg aria-hidden="true" width="9" height="9" viewBox="0 0 24 24" fill="var(--highlight-accent)" stroke="none" style="flex-shrink:0;opacity:0.6;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    {/if}
                  </div>
                </div>
                <span style="font-size: var(--text-sm);font-weight:700;color:{opinionColor(conn.opinionShift)};font-variant-numeric:tabular-nums;flex-shrink:0;">{conn.opinionShift}%</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Editorial Audit — revealed after reading all perspectives -->
      {#if issue.stageScores && issue.finalScore}
        <div style="margin:0 0 20px;padding:20px;background:var(--bg-elevated);border-radius: var(--radius-lg);border:1px solid var(--border-subtle);">
          <div style="font-size: var(--text-xs);font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em;">Editorial Audit</div>
          <p style="font-size: var(--text-ui);line-height:1.55;color:var(--text-secondary);margin:0 0 12px;">Tap any stage to see what was being tested and how this issue held up under that part of the editorial process.</p>
          <VerdictBar scores={issue.stageScores} finalScore={issue.finalScore} />
        </div>
      {/if}

      <div class="reader-completion-actions">
        <!-- A-8: a related issue first; the feed order stays as "Next in Latest". -->
        {#if relatedPick && onNavigateToIssue}
          <button onclick={() => { if (relatedPick) onNavigateToIssue?.(relatedPick.id); }} class="completion-primary-btn completion-related-btn" data-continue-related={relatedPick.id}>
            <span class="completion-related-kicker">Continue: related</span>
            <span>{truncateAtWord(relatedPick.headline, 90)}</span>
          </button>
        {/if}
        {#if onNext}
          <button onclick={onNext} class={relatedPick ? 'completion-secondary-btn' : 'completion-primary-btn'}>
            {nextHeadline ? `${relatedPick ? 'Next in Latest' : 'Next'}: ${truncateAtWord(nextHeadline, 50)}` : 'Read next issue'}
          </button>
        {/if}
        {#if onReturnHome}
          <button onclick={onReturnHome} class={onNext || relatedPick ? 'completion-secondary-btn' : 'completion-primary-btn'}>
            Back to Today
          </button>
        {/if}

        <div class="completion-verify-row">
          <VerifyCopyButton {issue} variant="link" />
        </div>
      </div>
    </div>

    <IssueSources {issue} open variant="desktop" />
    <IssueChanges {issue} open variant="desktop" />

    <PushPrompt />

    <div style="height:60px;"></div>
  </div>
</div>

{#if shareOpen}
  <ShareModal {issue} cardIndex={shareCardIndex} onClose={() => { shareOpen = false; }} />
{/if}

<style>
  .reader-content-wrap {
    --wrap-pad: 24px;
    max-width: 760px;
    margin: 0 auto;
    padding: 32px var(--wrap-pad) 56px;
  }

  /* Slightly more breathing room past 1600px */
  @media (min-width: 1600px) {
    .reader-content-wrap {
      --wrap-pad: 32px;
      max-width: 800px;
      padding: 40px var(--wrap-pad) 64px;
    }
  }

  /* QHD 27" — wider prose comfort + generous flanks */
  @media (min-width: 1920px) {
    .reader-content-wrap {
      --wrap-pad: 40px;
      max-width: 840px;
      padding: 48px var(--wrap-pad) 72px;
    }
  }

  /* Large QHD — push max prose width slightly, more padding */
  @media (min-width: 2560px) {
    .reader-content-wrap {
      max-width: 880px;
      padding: 56px 48px 80px;
    }
  }

  /* 34" ultra-wide */
  @media (min-width: 3440px) {
    .reader-content-wrap {
      max-width: 920px;
      padding: 64px 56px 88px;
    }
  }

  .reader-switching {
    opacity: 0;
    transform: translateY(8px);
  }

  .reader-path-sentinel {
    height: 1px;
    margin-bottom: -1px;
  }

  /* Pinned to the top of the reading column; the background spans the
     column's padding so text scrolls cleanly underneath. */
  .reader-progress-shell {
    position: sticky;
    top: 0;
    z-index: 3;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0 calc(-1 * var(--wrap-pad)) 28px;
    padding: 12px var(--wrap-pad) 6px;
    background: var(--bg);
    border-bottom: 1px solid transparent;
    transition: border-color var(--duration-fast, 150ms) ease-out;
  }

  .reader-progress-shell--stuck {
    border-bottom-color: var(--fora-rule);
  }

  /* Jumping to a card (segment, J/K, #card-N) lands below the pinned path. */
  .fora-reading-step {
    scroll-margin-top: var(--reading-path-offset, 112px);
  }

  .reader-progress-copy {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .reader-progress-kicker {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .reader-progress-label {
    font-size: var(--text-ui);
    font-weight: 700;
    line-height: 1.35;
    color: var(--text-secondary);
    max-width: 30ch;
  }

  .reader-progress-track {
    display: grid;
    grid-template-columns: repeat(var(--steps, 6), minmax(0, 1fr));
    gap: 8px;
  }

  /* X-6 (WCAG 2.5.8): the button is a 24px-tall target; the 8px bar is
     drawn by ::before, so the look is unchanged. */
  .reader-progress-segment {
    position: relative;
    height: 24px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  /* Read cards in the brand teal, the current card in ink, the rest in the
     rule colour. */
  .reader-progress-segment::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 9px;
    height: 6px;
    border-radius: var(--radius-pill);
    background: var(--fora-rule);
    transition: background 0.2s ease-out, transform 0.15s ease;
  }

  .reader-progress-segment:hover::before {
    transform: scaleY(1.5);
  }

  .reader-progress-segment--done::before {
    background: var(--fora-brand);
  }

  .reader-progress-segment--active::before {
    background: var(--fora-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    .reader-progress-shell,
    .reader-progress-segment::before { transition: none; }
  }

  @media (forced-colors: active) {
    .reader-progress-segment::before { forced-color-adjust: none; background: Canvas; border: 1px solid CanvasText; }
    .reader-progress-segment--done::before { background: GrayText; }
    .reader-progress-segment--active::before { background: Highlight; }
    .reader-progress-shell--stuck { border-bottom-color: CanvasText; }
  }

  @media print {
    .reader-progress-shell { display: none; }
  }

  .reader-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 20px;
  }

  .reader-headline-wrap {
    min-width: 0;
  }

  .reader-headline {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-reader-title-fluid);
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    line-height: 1.01;
    max-width: 24ch;
  }

  .reader-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .reader-completion-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
  }

  .completion-primary-btn,
  .completion-secondary-btn {
    width: 100%;
    border-radius: var(--radius-pill);
    font: inherit;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition:
      background 200ms ease-out,
      border-color 200ms ease-out,
      color 200ms ease-out,
      transform 200ms ease-out,
      box-shadow 200ms ease-out;
  }

  .completion-primary-btn {
    min-height: 48px;
    padding: 0 24px;
    border: 1px solid rgba(210, 140, 40, 0.22);
    background: linear-gradient(180deg, rgba(210, 140, 40, 0.12), rgba(210, 140, 40, 0.08));
    color: var(--score-warning);
    font-size: var(--text-ui);
    font-weight: 700;
    box-shadow: 0 14px 28px rgba(210, 140, 40, 0.08);
  }

  .completion-secondary-btn {
    min-height: 48px;
    padding: 0 24px;
    border: 1px solid var(--border-subtle);
    background: var(--bg-elevated);
    color: var(--text-secondary);
    font-size: var(--text-ui);
    font-weight: 700;
  }

  @media (hover: hover) {
    .completion-secondary-btn:hover {
      border-color: var(--border-divider);
      background: var(--bg-sunken);
    }
  }

  @media (hover: hover) {
    .completion-primary-btn:hover {
      border-color: rgba(210, 140, 40, 0.3);
      background: linear-gradient(180deg, rgba(210, 140, 40, 0.15), rgba(210, 140, 40, 0.1));
      transform: translateY(-1px);
      box-shadow: 0 18px 32px rgba(210, 140, 40, 0.12);
    }
  }

  .completion-verify-row {
    display: flex;
    justify-content: center;
  }

  .completion-related-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 2px;
    padding: 12px 24px;
    border-radius: var(--radius-lg);
    text-align: left;
    line-height: 1.35;
  }

  .completion-related-kicker {
    font-size: var(--text-micro);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  @media (prefers-color-scheme: dark) {
    .completion-primary-btn {
      border-color: rgba(200, 150, 58, 0.24);
      background: linear-gradient(180deg, rgba(200, 150, 58, 0.13), rgba(200, 150, 58, 0.08));
      box-shadow: 0 16px 30px rgba(0, 0, 0, 0.22);
    }
  }

  @media (prefers-color-scheme: dark) and (hover: hover) {
    .completion-primary-btn:hover {
      border-color: rgba(200, 150, 58, 0.3);
      background: linear-gradient(180deg, rgba(200, 150, 58, 0.16), rgba(200, 150, 58, 0.1));
      box-shadow: 0 20px 36px rgba(0, 0, 0, 0.26);
    }
  }

  @media (max-width: 720px) {
    .reader-head {
      grid-template-columns: 1fr;
    }

    .reader-actions {
      justify-content: flex-start;
    }

    .reader-headline {
      max-width: 100%;
      font-size: var(--text-reader-title-mobile);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .completion-primary-btn {
      transition: none;
    }
  }

  .reader-headline { font:700 clamp(2rem,3.8vw,3.5rem)/1.08 var(--fora-serif); letter-spacing:-.02em; }
  .fora-reading-step { border-top:1px solid var(--fora-rule); padding-top:24px; }
  .fora-reading-step > div { background:transparent !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; padding:12px 0 24px !important; }
  .fora-card-lead { font:700 1.75rem/1.25 var(--fora-serif); max-width:40ch; margin:0; color:var(--fora-ink); }
  .fora-card-body { font:400 1.1875rem/1.7 var(--fora-serif); max-width:65ch; margin:16px 0 0; color:var(--fora-ink-2); }
  .reader-progress { background:var(--fora-paper); }
  @media(max-width:1023px) { .fora-card-lead { font-size:1.5rem; } .fora-card-body { font-size:1.125rem; } }
  .fora-reader-art { margin:24px 0; }
  .fora-issue-topic { display:inline-flex; align-items:center; min-height:44px; color:var(--fora-brand); font:600 .8125rem/1.5 var(--fora-sans); text-decoration:underline; text-underline-offset:3px; gap:8px; }
</style>
