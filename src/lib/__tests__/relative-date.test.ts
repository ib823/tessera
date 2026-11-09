import { describe, it, expect } from 'vitest';
import { relativeDate, absoluteDate, daysSince, newestDate, isWithinDays } from '../relative-date';

// Local-time constructor: the helpers work on the reader's calendar day.
const now = new Date(2026, 10, 8, 15, 30); // 8 Nov 2026, 3:30 pm

describe('relativeDate', () => {
  it('labels same-day and next-day dates', () => {
    expect(relativeDate('2026-11-08', now)).toBe('Today');
    expect(relativeDate('2026-11-07', now)).toBe('Yesterday');
  });

  it('counts days, then weeks', () => {
    expect(relativeDate('2026-11-05', now)).toBe('3 days ago');
    expect(relativeDate('2026-11-01', now)).toBe('1 week ago');
    expect(relativeDate('2026-10-19', now)).toBe('2 weeks ago');
  });

  it('counts calendar months, then years', () => {
    // The audit's example: Gig Workers Act, sourced 8 Apr 2026.
    expect(relativeDate('2026-04-08', now)).toBe('7 months ago');
    expect(relativeDate('2026-10-01', now)).toBe('1 month ago');
    expect(relativeDate('2025-11-08', now)).toBe('1 year ago');
    expect(relativeDate('2023-06-01', now)).toBe('3 years ago');
  });

  it('treats future dates as today and hides unreadable ones', () => {
    expect(relativeDate('2026-11-20', now)).toBe('Today');
    expect(relativeDate('', now)).toBe('');
    expect(relativeDate(undefined, now)).toBe('');
    expect(relativeDate('not a date', now)).toBe('');
  });
});

describe('date helpers', () => {
  it('formats the absolute date', () => {
    expect(absoluteDate('2026-04-08')).toBe('8 April 2026');
    expect(absoluteDate(null)).toBe('');
  });

  it('counts whole calendar days', () => {
    expect(daysSince('2026-11-01', now)).toBe(7);
    expect(daysSince('bad', now)).toBeNull();
  });

  it('finds the newest date', () => {
    expect(newestDate(['2026-09-19', '2026-11-07', '', undefined])).toBe('2026-11-07');
    expect(newestDate([])).toBe('');
  });

  it('checks a recency window', () => {
    expect(isWithinDays('2026-11-08', 7, now)).toBe(true);
    expect(isWithinDays('2026-11-02', 7, now)).toBe(true);
    expect(isWithinDays('2026-11-01', 7, now)).toBe(false);
    expect(isWithinDays(undefined, 7, now)).toBe(false);
  });
});
