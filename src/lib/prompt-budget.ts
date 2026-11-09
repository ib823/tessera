/**
 * One interruption budget for relationship prompts (audit R-1).
 *
 * The welcome card, the sync prompt, the install prompt and the push prompt
 * used to appear together on a first visit and persist on every page. The
 * rules now:
 *   1. At most one prompt on screen at a time.
 *   2. The welcome card is for a reader's first visit to Today: it needs no
 *      completed issue, and once on screen it is that session's one prompt
 *      until it is dismissed. Later visits skip it.
 *   3. The sync, install and push prompts wait until the reader has
 *      completed at least one issue.
 *   4. None on the first screen of a shared-link visit: a cold landing on
 *      /issue/{id} stays prompt-free until the reader leaves that issue.
 *   5. One per session: once a prompt is dismissed or acted on, the rest
 *      wait for the next visit.
 *
 * Push lives on the reader's completion screen (PushPrompt); App hides every
 * other prompt while a reader is open, so rule 1 holds there too.
 */
import { atom } from 'nanostores';

export type RelationshipPrompt = 'welcome' | 'sync' | 'install';

/** Priority when more than one prompt is eligible. */
export const PROMPT_ORDER: readonly RelationshipPrompt[] = ['welcome', 'sync', 'install'];

// sessionStorage: the budget resets on the next visit. '1' once a prompt has
// been dismissed or used; 'welcome' while the welcome card holds the budget.
const SPENT_KEY = 'tfa:v1:prompt-spent';
const WELCOME_HOLD = 'welcome';
// localStorage: the welcome card has been shown on some visit.
const WELCOME_SEEN_KEY = 'tfa:v1:welcome-seen';

function readSession(): string | null {
  try {
    return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SPENT_KEY) : null;
  } catch {
    return null;
  }
}

const initialSpent = readSession();

/** True from a cold /issue/{id} landing until the reader leaves that issue. */
export const sharedLanding = atom(false);

/** True once this session's prompt has been shown (welcome), dismissed or used. */
export const promptSpent = atom(initialSpent === '1' || initialSpent === WELCOME_HOLD);

/** True while the welcome card holds this session's one prompt. */
export const welcomeSession = atom(initialSpent === WELCOME_HOLD);

/** The welcome card showed on an earlier visit, so this visit skips it. */
export function welcomeSeenOnEarlierVisit(): boolean {
  if (welcomeSession.get()) return false;
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(WELCOME_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

/** The welcome card is on screen: it takes this session's budget. */
export function markWelcomeShown(): void {
  if (welcomeSession.get()) return;
  welcomeSession.set(true);
  promptSpent.set(true);
  try {
    sessionStorage.setItem(SPENT_KEY, WELCOME_HOLD);
  } catch {
    /* storage blocked: the budget still holds for this page */
  }
  try {
    localStorage.setItem(WELCOME_SEEN_KEY, '1');
  } catch {
    /* storage blocked: the card may show again on a later visit */
  }
}

export function markPromptSpent(): void {
  welcomeSession.set(false);
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
  /** The welcome card already holds this session's budget. */
  welcomeSession: boolean;
  /** A reader is on screen; only its own completion-screen prompt may show. */
  readerOpen: boolean;
  /** Prompts that are available and not dismissed. */
  candidates: Partial<Record<RelationshipPrompt, boolean>>;
}

export function choosePrompt(input: PromptInput): RelationshipPrompt | null {
  if (input.readerOpen || input.sharedLanding) return null;
  // First visit: the welcome card needs no completed issue, and keeps the
  // session's budget until it is dismissed.
  if (input.candidates.welcome && (input.welcomeSession || !input.spent)) return 'welcome';
  if (input.spent || input.welcomeSession || input.completedCount < 1) return null;
  for (const kind of PROMPT_ORDER) {
    if (kind !== 'welcome' && input.candidates[kind]) return kind;
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
