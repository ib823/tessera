<script lang="ts">
  /**
   * One issue, drawn the same way in every list: the desktop reading list,
   * Latest, Saved, Search and the phone and tablet feeds. Same order, same
   * words, at every width:
   *
   *   meta      Lens · 2 days ago · Updated · Edition 4
   *   headline
   *   context   (two lines in the compact reading list)
   *   signal    Opinion Shift 72 · Significant
   *   state     Continue at card 4 of 7 · 2 highlights · Connected issues
   *   progress  a 3px bar while an issue is in progress
   *
   * "compact" is the 320px desktop reading list beside an open issue;
   * "regular" is every other list. Card numbers match the reader's own
   * "Card 4 of 7" counter. Nothing sits in a side column, so the headline
   * always gets the full row width, whatever the row's state.
   */
  import IssueImage from './IssueImage.svelte';
  import { opinionColor, opinionLabel } from '../data/issue-types';
  import { formatIssueDate, publishedDay, updatedSinceRead } from '../lib/issue-meta';
  import { absoluteDate, relativeDate } from '../lib/relative-date';
  import { primaryLens } from '../lib/topics';
  import { reactions } from '../stores/reader';
  import type { IssueSummary } from '../lib/issues-loader';
  import type { ReadState } from '../stores/reader';

  interface Props {
    issue: IssueSummary;
    readState: ReadState | null;
    density?: 'compact' | 'regular';
    /** The issue's line art beside the copy (regular rows only). */
    art?: boolean;
    eager?: boolean;
    /** span inside a listbox option, where headings are not allowed. */
    headingTag?: 'h2' | 'h3' | 'span';
    hasConnections?: boolean;
    searchTerms?: string;
  }
  let { issue, readState, density = 'regular', art = false, eager = false, headingTag = 'span', hasConnections = false, searchTerms = '' }: Props = $props();

  const day = $derived(publishedDay(issue));
  const lens = $derived(primaryLens(issue.cards));
  const cardCount = $derived(Math.max(issue.cards.length, 1));
  const started = $derived(readState?.state === 'started');
  const completed = $derived(readState?.state === 'completed');
  const nextCard = $derived(Math.min((readState?.progress ?? 0) + 1, cardCount));
  const percent = $derived(Math.min(100, ((readState?.progress ?? 0) / cardCount) * 100));

  // Highlight counts come from the one store every surface writes to.
  let reactionRaw = $state(reactions.get());
  $effect(() => reactions.subscribe((value) => { reactionRaw = value; }));
  const highlights = $derived.by(() => {
    try { return (JSON.parse(reactionRaw)[issue.id] ?? []).length as number; } catch { return 0; }
  });

  const stateParts = $derived([
    started ? `Continue at card ${nextCard} of ${cardCount}` : completed ? 'Read' : '',
    highlights > 0 ? `${highlights} highlight${highlights === 1 ? '' : 's'}` : '',
    hasConnections ? 'Connected issues' : '',
  ].filter(Boolean));

  // Search terms are marked as text, never injected as HTML.
  const headlineParts = $derived.by(() => {
    const terms = searchTerms.trim();
    if (terms.length < 2) return [{ text: issue.headline, hit: false }];
    const pattern = new RegExp(`(${terms.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return issue.headline.split(pattern).filter(Boolean).map((text) => ({ text, hit: text.toLowerCase() === terms.toLowerCase() }));
  });
</script>

<div class="issue-row" class:issue-row--read={completed} data-issue-row data-density={density}>
  {#if art && density === 'regular' && issue.hasImage}
    <div class="row-art"><IssueImage issueId={issue.id} size="card" aspectRatio="4/3" borderRadius="4px" alt="" {eager} /></div>
  {/if}
  <div class="row-copy">
    <div class="row-meta">
      {#if lens}<span class="row-lens">{lens}</span>{/if}
      {#if day}<time datetime={day} title={absoluteDate(day)} data-relative-date>{relativeDate(day)}</time>{/if}
      {#if updatedSinceRead(issue, readState)}
        <span class="row-flag" data-updated-since-read title="Updated {formatIssueDate(issue.modifiedAt)}, after you finished it">Updated since you read it</span>
      {:else if issue.status === 'updated'}
        <span class="row-flag">Updated</span>
      {:else if issue.status === 'new' && !readState}
        <span class="row-flag">New</span>
      {/if}
      {#if issue.edition > 1}<span>Edition {issue.edition}</span>{/if}
      {#if issue.legacyAudit}<span title="Pre-pipeline issue: primary sources are not on file yet.">Pre-pipeline</span>{/if}
    </div>
    <svelte:element this={headingTag} class="row-headline balance-title" data-row-headline>{#each headlineParts as part}{#if part.hit}<mark>{part.text}</mark>{:else}{part.text}{/if}{/each}</svelte:element>
    <p class="row-context">{issue.context}</p>
    <p class="row-signal" data-row-signal title="{issue.opinionShift} — {opinionLabel(issue.opinionShift)}: Reading only the headline would hide about {issue.opinionShift}% of the story">Opinion Shift <strong style="color:{opinionColor(issue.opinionShift)};">{issue.opinionShift}</strong> · {opinionLabel(issue.opinionShift)}</p>
    {#if stateParts.length}<p class="row-state" data-row-state>{stateParts.join(' · ')}</p>{/if}
    {#if started}<div class="row-progress" aria-hidden="true"><span style="width:{percent}%;"></span></div>{/if}
  </div>
</div>

<style>
  .issue-row { display:flex; flex-direction:row-reverse; align-items:flex-start; gap:20px; min-width:0; }
  .row-art { flex:0 0 clamp(64px, 14vw, 144px); margin-top:4px; }
  .row-copy { flex:1; min-width:0; }
  .row-meta { display:flex; flex-wrap:wrap; gap:2px 8px; font:.75rem/1.5 var(--fora-sans); color:var(--fora-muted); }
  .row-lens { color:var(--fora-brand); font-weight:600; }
  .row-flag { color:var(--fora-ink); font-weight:600; }
  .row-headline { display:block; margin:8px 0 10px; font:700 clamp(1.375rem, 1.2rem + .5vw, 1.625rem)/1.18 var(--fora-serif); color:var(--fora-ink); overflow-wrap:break-word; }
  .issue-row--read .row-headline { color:var(--fora-ink-2); }
  .row-headline mark { background:var(--fora-brand-tint); color:inherit; border-radius:2px; padding:0 1px; }
  :global(a:hover) .row-headline { text-decoration:underline; text-underline-offset:3px; }
  .row-context { margin:0 0 10px; font:.9375rem/1.6 var(--fora-sans); color:var(--fora-ink-2); }
  .row-signal, .row-state { margin:0; font:.75rem/1.5 var(--fora-sans); color:var(--fora-muted); }
  .row-signal strong { font-weight:700; }
  .row-state { margin-top:2px; }
  .row-progress { height:3px; margin-top:10px; border-radius:2px; overflow:hidden; background:var(--fora-rule); }
  .row-progress span { display:block; height:100%; background:var(--fora-brand); }

  .issue-row[data-density='compact'] .row-headline { margin:6px 0; font-size:1.0625rem; line-height:1.3; }
  .issue-row[data-density='compact'] .row-context { margin-bottom:8px; font-size:.8125rem; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .issue-row[data-density='compact'] .row-progress { margin-top:8px; }

  @media (forced-colors: active) {
    .row-progress { border:1px solid CanvasText; }
    .row-progress span { forced-color-adjust:none; background:Highlight; }
  }
</style>
