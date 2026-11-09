import { describe, it, expect } from 'vitest';
import { choosePrompt, canShowPushPrompt, countCompleted, PROMPT_ORDER } from '../prompt-budget';

const base = {
  completedCount: 1,
  sharedLanding: false,
  spent: false,
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

  it('waits for a completed issue', () => {
    expect(choosePrompt({ ...base, completedCount: 0 })).toBeNull();
  });

  it('stays quiet on the first screen of a shared-link visit', () => {
    expect(choosePrompt({ ...base, sharedLanding: true })).toBeNull();
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
