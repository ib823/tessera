/**
 * Reading time from word count. 230 words a minute is a typical adult
 * silent-reading pace for non-fiction; the dossier's stated times had drifted
 * to about 120 wpm (audit T-9: "Est. 16 min" for 1,900 words).
 */
export const READING_WPM = 230;

export function readMinutes(wordCount: number, wpm: number = READING_WPM): number {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return 1;
  return Math.max(1, Math.round(wordCount / wpm));
}
