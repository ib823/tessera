<script lang="ts">
  /**
   * "Copy for verification" (audit T-6). Copies the issue text in the exact
   * form the build signs (src/lib/verification-text.mjs), so pasting it into
   * /verify reports AUTHENTIC. Shown in the share sheet and at the end of the
   * article on every width; /verify links back to it.
   */
  import { buildVerificationText } from '../lib/verification-text.mjs';
  import type { Issue } from '../data/issue-types';

  interface Props {
    issue: Pick<Issue, 'headline' | 'context' | 'opinionShift' | 'stageScores' | 'finalScore' | 'status' | 'cards'>;
    /** 'button': full-width outline button. 'link': compact text button. */
    variant?: 'button' | 'link';
  }

  let { issue, variant = 'button' }: Props = $props();

  let copyState: 'idle' | 'copied' | 'failed' = $state('idle');
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  function fallbackCopy(text: string): boolean {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }

  async function copy() {
    const text = buildVerificationText(issue);
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = fallbackCopy(text);
    }
    copyState = ok ? 'copied' : 'failed';
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { copyState = 'idle'; }, 2500);
  }
</script>

<div class="verify-copy" class:verify-copy--link={variant === 'link'}>
  <button type="button" class="verify-copy__btn" class:verify-copy__btn--done={copyState === 'copied'} onclick={copy} data-verify-copy>
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    Copy for verification
  </button>
  <a href="/verify" class="verify-copy__help">What is this?</a>
  <span class="verify-copy__status" role="status" aria-live="polite">
    {#if copyState === 'copied'}Copied. Paste it at /verify to check it.{:else if copyState === 'failed'}Could not copy. Your browser blocked the clipboard.{/if}
  </span>
</div>

<style>
  .verify-copy {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 4px 12px;
    width: 100%;
  }

  .verify-copy__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 1 1 auto;
    min-height: 44px;
    padding: 10px 18px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border-subtle);
    background: transparent;
    color: var(--text-secondary);
    font: inherit;
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    transition: background var(--duration-fast, 150ms) ease, border-color var(--duration-fast, 150ms) ease;
  }

  .verify-copy--link .verify-copy__btn {
    flex: 0 0 auto;
    border-color: transparent;
    padding: 10px 8px;
  }

  .verify-copy__btn--done {
    border-color: var(--status-green);
    color: var(--status-green-text);
  }

  @media (hover: hover) {
    .verify-copy__btn:hover {
      background: var(--bg-elevated);
    }
  }

  .verify-copy__help {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-secondary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .verify-copy__status {
    flex-basis: 100%;
    text-align: center;
    font-size: var(--text-xs);
    color: var(--text-secondary);
    min-height: 0;
  }
</style>
