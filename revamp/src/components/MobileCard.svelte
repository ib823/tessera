<script lang="ts">
  import IssueImage from './IssueImage.svelte';
  import { opinionLabel } from '../data/issue-types';
  import { publishedDay, formatIssueDate, updatedSinceRead } from '../lib/issue-meta';
  import { absoluteDate, relativeDate } from '../lib/relative-date';
  import { primaryLens } from '../lib/topics';
  import { inAppClick, issueHref } from '../lib/link-open';
  import type { IssueSummary } from '../lib/issues-loader';
  import type { ReadState } from '../stores/reader';
  interface Props { issue:IssueSummary; readState:ReadState|null; onOpen:()=>void; onPrefetch?:()=>void; hasReaction?:boolean; hasConnections?:boolean; eager?:boolean; }
  let { issue, readState, onOpen, onPrefetch, hasReaction=false, hasConnections=false, eager=false }:Props=$props();
  let nextAngle=$derived(Math.min((readState?.progress??0)+1,issue.cards.length));
</script>
<article class="mobile-card">
  <a class="card-link" href={issueHref(issue.id)} onclick={inAppClick(onOpen)} onpointerenter={() => onPrefetch?.()} onfocus={() => onPrefetch?.()}>
    {#if issue.hasImage}<div class="mobile-card-art"><IssueImage issueId={issue.id} size="card" aspectRatio="4/3" borderRadius="4px" alt="" {eager}/></div>{/if}
    <div class="card-copy">
      <div class="card-meta"><span class="card-lens">{primaryLens(issue.cards)}</span>{#if publishedDay(issue)}<time datetime={publishedDay(issue)} title={absoluteDate(publishedDay(issue))} data-relative-date>{relativeDate(publishedDay(issue))}</time>{/if}</div>
      <h2 class="headline balance-title">{issue.headline}</h2>
      <p class="context-text">{issue.context}</p>
      <p class="card-score">Opinion Shift <strong>{issue.opinionShift}</strong> · {opinionLabel(issue.opinionShift)}</p>
      <div class="card-meta card-state">
        {#if updatedSinceRead(issue,readState)}<span data-updated-since-read title="Updated {formatIssueDate(issue.modifiedAt)}, after you finished it">Updated since you read it</span>{:else if issue.status==='updated'}<span>Updated</span>{:else if issue.status==='new'&&!readState}<span>New</span>{/if}
        {#if issue.edition>1}<span>Edition {issue.edition}</span>{/if}
        {#if issue.legacyAudit}<span>Pre-pipeline</span>{/if}
        {#if hasReaction}<span>Highlighted</span>{/if}
        {#if hasConnections}<span>Connected issues</span>{/if}
        {#if readState?.state==='completed'}<span>Complete</span>{:else if readState?.state==='started'}<span>Continue from angle {nextAngle}</span>{/if}
      </div>
      {#if readState?.state==='started'}<div class="reading-progress" aria-label={`Reading progress: ${readState.progress} of ${issue.cards.length} angles`}><span style={`width:${Math.min(100,readState.progress/issue.cards.length*100)}%`}></span></div>{/if}
    </div>
  </a>
</article>
<style>
  .mobile-card { position:relative; border-bottom:1px solid var(--fora-rule); padding:24px 0; }
  .card-link { display:flex; flex-direction:row-reverse; gap:20px; color:inherit; text-decoration:none; }
  .mobile-card-art { flex:0 0 88px; width:88px; align-self:flex-start; margin-top:4px; }
  .card-copy { min-width:0; flex:1; }
  .card-meta { display:flex; flex-wrap:wrap; gap:8px; font:.75rem/1.5 var(--fora-sans); color:var(--fora-muted); }
  .card-lens { color:var(--fora-brand); font-weight:600; }
  .headline { font:700 1.5rem/1.15 var(--fora-serif); margin:8px 0 12px; overflow-wrap:break-word; }
  .card-link:hover .headline { text-decoration:underline; text-underline-offset:3px; }
  .context-text { font:.9375rem/1.6 var(--fora-sans); color:var(--fora-ink-2); margin:0 0 12px; }
  .card-score { font:.75rem/1.5 var(--fora-sans); color:var(--fora-muted); margin:0 0 10px; }
  .reading-progress { height:3px; margin-top:12px; background:var(--fora-rule); }
  .reading-progress span { display:block; height:100%; background:var(--fora-brand); }
  @media(max-width:380px) { .mobile-card-art { flex-basis:64px; width:64px; } .card-link { gap:12px; } }
</style>
