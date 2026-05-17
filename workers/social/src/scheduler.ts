/**
 * Per-minute coin-flip scheduler.
 *
 * Goal: 5-10 posts/day spread irregularly across MYT 08:00-22:00, with
 * a ≥75-min cooldown between posts. Time-of-day weighting biases toward
 * commute hours and lunch.
 *
 * Called from the `* * * * *` cron. Returns true if this minute should post.
 */
import type { Env } from './types';
import { getLastPostAt } from './kv';

const MYT_OFFSET_MS = 8 * 60 * 60 * 1000; // MYT = UTC+8

function mytHour(now: number): number {
  const d = new Date(now + MYT_OFFSET_MS);
  return d.getUTCHours();
}

function timeOfDayWeight(hour: number): number {
  // Tuned for Malaysian audience activity peaks.
  if (hour >= 8 && hour < 9) return 1.3;
  if (hour >= 9 && hour < 11) return 1.0;
  if (hour >= 11 && hour < 14) return 1.2;
  if (hour >= 14 && hour < 17) return 0.8;
  if (hour >= 17 && hour < 19) return 1.3;
  if (hour >= 19 && hour < 22) return 1.0;
  return 0;
}

export interface ScheduleDecision {
  shouldPost: boolean;
  reason: string;
}

export async function shouldPostNow(env: Env, now: number = Date.now()): Promise<ScheduleDecision> {
  const startHour = Number(env.POST_WINDOW_START_HOUR_MYT || '8');
  const endHour = Number(env.POST_WINDOW_END_HOUR_MYT || '22');
  const targetPerDay = Number(env.TARGET_POSTS_PER_DAY || '7');
  const cooldownMin = Number(env.COOLDOWN_MINUTES || '75');

  const hour = mytHour(now);
  if (hour < startHour || hour >= endHour) {
    return { shouldPost: false, reason: `outside-window (MYT hour ${hour})` };
  }

  const last = await getLastPostAt(env);
  if (last !== null && now - last < cooldownMin * 60 * 1000) {
    const minsAgo = Math.floor((now - last) / 60000);
    return { shouldPost: false, reason: `cooldown (last post ${minsAgo}m ago)` };
  }

  const windowMinutes = (endHour - startHour) * 60;
  const baseRate = targetPerDay / windowMinutes;
  const weighted = baseRate * timeOfDayWeight(hour);
  const roll = Math.random();
  if (roll < weighted) {
    return { shouldPost: true, reason: `roll ${roll.toFixed(4)} < p ${weighted.toFixed(4)}` };
  }
  return { shouldPost: false, reason: `roll ${roll.toFixed(4)} ≥ p ${weighted.toFixed(4)}` };
}
