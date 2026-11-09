import { describe, it, expect, vi, afterEach } from 'vitest';
import { choosePrompt, canShowPushPrompt, countCompleted, PROMPT_ORDER } from '../prompt-budget';

const base = {
  completedCount: 1,
  sharedLanding: false,
  spent: false,
  welcomeSession: false,
  readerOpen: false,
  candidates: { welcome: true, sync: true, install: true },
};

describe('choosePrompt', () => {
  it('shows exactly one prompt, in priority order', () => {
    expect(PROMPT_ORDER).toEqual(['welcome', 'sync', 'install']);
    expect(choosePrompt(base)).toBe('welcome');
    expect(choosePrompt({ ...base, candidates: { sync: true, install: true } })).toBe('sync');
    expect(choosePrompt({ ...base, candidates: { install: true } })).toBe('install');
    expect(choosePrompt({ ...base, candidates: {} })).toBeNull();
  });

  it('shows the welcome card on a first visit, before any completed issue', () => {
    expect(choosePrompt({ ...base, completedCount: 0 })).toBe('welcome');
  });

  it('keeps the sync and install prompts waiting for a completed issue', () => {
    expect(choosePrompt({ ...base, completedCount: 0, candidates: { sync: true, install: true } })).toBeNull();
    expect(choosePrompt({ ...base, completedCount: 0, candidates: { install: true } })).toBeNull();
  });

  it('counts the welcome card as the one prompt for its session', () => {
    const welcomeHeld = { ...base, spent: true, welcomeSession: true };
    // It stays on Today for the rest of the session until dismissed...
    expect(choosePrompt(welcomeHeld)).toBe('welcome');
    // ...and nothing else takes its place, then or after it is dismissed.
    expect(choosePrompt({ ...welcomeHeld, candidates: { sync: true, install: true } })).toBeNull();
    expect(choosePrompt({ ...base, spent: true, candidates: { sync: true, install: true } })).toBeNull();
  });

  it('stays quiet on the first screen of a shared-link visit', () => {
    expect(choosePrompt({ ...base, sharedLanding: true })).toBeNull();
    expect(choosePrompt({ ...base, sharedLanding: true, completedCount: 0 })).toBeNull();
    expect(choosePrompt({ ...base, sharedLanding: true, welcomeSession: true, spent: true })).toBeNull();
  });

  it('stays quiet while a reader is open', () => {
    expect(choosePrompt({ ...base, readerOpen: true })).toBeNull();
  });

  it('allows one prompt per session', () => {
    expect(choosePrompt({ ...base, spent: true })).toBeNull();
  });
});

describe('canShowPushPrompt', () => {
  it('follows the same budget', () => {
    expect(canShowPushPrompt({ completedCount: 1, sharedLanding: false, spent: false })).toBe(true);
    expect(canShowPushPrompt({ completedCount: 0, sharedLanding: false, spent: false })).toBe(false);
    expect(canShowPushPrompt({ completedCount: 3, sharedLanding: true, spent: false })).toBe(false);
    expect(canShowPushPrompt({ completedCount: 3, sharedLanding: false, spent: true })).toBe(false);
  });
});

describe('welcome card session state', () => {
  function memoryStorage(seed: Record<string, string> = {}): Storage {
    const data = new Map(Object.entries(seed));
    return {
      get length() {
        return data.size;
      },
      clear: () => data.clear(),
      getItem: (k: string) => data.get(k) ?? null,
      key: (i: number) => [...data.keys()][i] ?? null,
      removeItem: (k: string) => {
        data.delete(k);
      },
      setItem: (k: string, v: string) => {
        data.set(k, String(v));
      },
    };
  }

  async function freshModule(local: Storage, session: Storage) {
    vi.stubGlobal('localStorage', local);
    vi.stubGlobal('sessionStorage', session);
    vi.resetModules();
    return import('../prompt-budget');
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('a first visit has not seen the welcome card', async () => {
    const mod = await freshModule(memoryStorage(), memoryStorage());
    expect(mod.welcomeSeenOnEarlierVisit()).toBe(false);
    expect(mod.welcomeSession.get()).toBe(false);
    expect(mod.promptSpent.get()).toBe(false);
  });

  it('showing the welcome card spends the session budget and marks it seen', async () => {
    const local = memoryStorage();
    const session = memoryStorage();
    const mod = await freshModule(local, session);
    mod.markWelcomeShown();
    expect(mod.welcomeSession.get()).toBe(true);
    expect(mod.promptSpent.get()).toBe(true);
    expect(mod.canShowPushPrompt({ completedCount: 2, sharedLanding: false, spent: mod.promptSpent.get() })).toBe(false);
    expect(local.getItem('tfa:v1:welcome-seen')).toBe('1');

    // A reload in the same session keeps the welcome card on.
    const reloaded = await freshModule(local, session);
    expect(reloaded.welcomeSession.get()).toBe(true);
    expect(reloaded.welcomeSeenOnEarlierVisit()).toBe(false);

    // The next visit (new session) skips it.
    const nextVisit = await freshModule(local, memoryStorage());
    expect(nextVisit.welcomeSession.get()).toBe(false);
    expect(nextVisit.promptSpent.get()).toBe(false);
    expect(nextVisit.welcomeSeenOnEarlierVisit()).toBe(true);
  });

  it('dismissing the welcome card ends its hold but keeps the budget spent', async () => {
    const mod = await freshModule(memoryStorage(), memoryStorage());
    mod.markWelcomeShown();
    mod.markPromptSpent();
    expect(mod.welcomeSession.get()).toBe(false);
    expect(mod.promptSpent.get()).toBe(true);
  });
});

describe('countCompleted', () => {
  it('counts legacy and JSON completed states', () => {
    expect(
      countCompleted({
        a: 'true',
        b: JSON.stringify({ state: 'completed', progress: 6 }),
        c: JSON.stringify({ state: 'started', progress: 2 }),
        d: 'garbage',
        e: '',
      }),
    ).toBe(2);
  });
});
