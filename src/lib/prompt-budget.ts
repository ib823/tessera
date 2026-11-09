/**
 * One interruption budget for relationship prompts (audit R-1).
 *
 * The welcome card, the sync prompt, the install prompt and the push prompt
 * used to appear together on a first visit and persist on every page. The
 * rules now:
 *   1. At most one prompt on screen at a time.
 *   2. None until the reader has completed at least one issue.
 *   3. None on the first screen of a shared-link visit: a cold landing on
 *      /issue/{id} stays prompt-free until the reader leaves that issue.
 *   4. One per session: once a prompt is dismissed or acted on, the rest
 *      wait for the next visit.
 *
 * Push lives on the reader's completion screen (PushPrompt); App hides every
 * other prompt while a reader is open, so rule 1 holds there too.
 */
import { atom } from 'nanostores';

export type RelationshipPrompt = 'welcome' | 'sync' | 'install';

/** Priority when more than one prompt is eligible. */
export const PROMPT_ORDER: readonly RelationshipPrompt[] = ['welcome', 'sync', 'install'];

// sessionStorage: the budget resets on the next visit.
const SPENT_KEY = 'tfa:v1:prompt-spent';

function readSpent(): boolean {
  try {
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SPENT_KEY) === '1';
  } catch {
    return false;
  }
}

/** True from a cold /issue/{id} landing until the reader leaves that issue. */
export const sharedLanding = atom(false);

/** True once a prompt has been dismissed or used in this browser session. */
export const promptSpent = atom(readSpent());

export function markPromptSpent(): void {
  promptSpent.set(true);
  try {
    sessionStorage.setItem(SPENT_KEY, '1');
  } catch {
    /* storage blocked: the budget still holds for this page */
  }
}

export interface PromptInput {
  completedCount: number;
  sharedLanding: boolean;
  spent: boolean;
  /** A reader is on screen; only its own completion-screen prompt may show. */
  readerOpen: boolean;
  /** Prompts that are available and not dismissed. */
  candidates: Partial<Record<RelationshipPrompt, boolean>>;
}

export function choosePrompt(input: PromptInput): RelationshipPrompt | null {
  if (input.readerOpen || input.sharedLanding || input.spent || input.completedCount < 1) return null;
  for (const kind of PROMPT_ORDER) {
    if (input.candidates[kind]) return kind;
  }
  return null;
}

/** The completion-screen push prompt follows the same budget. */
export function canShowPushPrompt(input: Pick<PromptInput, 'completedCount' | 'sharedLanding' | 'spent'>): boolean {
  return !input.sharedLanding && !input.spent && input.completedCount >= 1;
}

/** Completed issues in a read map (values are 'true' or JSON read states). */
export function countCompleted(readMap: Record<string, string>): number {
  let count = 0;
  for (const raw of Object.values(readMap)) {
    if (!raw) continue;
    if (raw === 'true') {
      count += 1;
      continue;
    }
    try {
      if (JSON.parse(raw).state === 'completed') count += 1;
    } catch {
      /* ignore malformed entries */
    }
  }
  return count;
}
