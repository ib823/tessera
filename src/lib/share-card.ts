/**
 * Generates a shareable card image (V2 — "The Attribution").
 *
 * Two formats:
 *   - "feed"  → 1080×1350 (4:5) — Instagram feed, Facebook, LinkedIn, Twitter, WhatsApp, Telegram
 *   - "story" → 1080×1920 (9:16) — Instagram Stories, WhatsApp Status, Facebook Stories
 *
 * Two colors: "black" (#000) or "white" (#FFF).
 *
 * Statement centered → logo + wordmark as attribution → issue stamp at the
 * bottom: date, edition and a short link to the card (audit SH-3), so the
 * image can still be read and checked after it leaves the site.
 * Uses Canvas API for pixel-perfect cross-browser output.
 */

import { cardAnchor } from './card-anchor';

const SIZES = {
  feed:  { w: 1080, h: 1350 },  // 4:5
  story: { w: 1080, h: 1920 },  // 9:16
} as const;

function wrapText(ctx: CanvasRenderingContext2D, str: string, maxWidth: number): string[] {
  const words = str.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export type CardVariant = 'black' | 'white';
export type CardFormat = 'feed' | 'story';

/** Which issue (and card) an exported image came from. */
export interface ShareCardMeta {
  issueId: string;
  edition?: number;
  /** ISO date (YYYY-MM-DD); the issue's sourceDate stands in for its publication date. */
  sourceDate?: string;
  /** 0-based card index, or null for the whole issue. */
  cardIndex?: number | null;
}

export const SHARE_HOST = 'thefourthangle.pages.dev';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "8 Apr 2026" from "2026-04-08"; empty for anything else. Fixed format, no locale drift. */
export function formatStampDate(iso: string | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!m) return '';
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${Number(m[3])} ${month} ${m[1]}` : '';
}

/** The stamp lines printed at the foot of an exported image. */
export function shareCardStamp(meta: ShareCardMeta): { line: string; url: string } {
  const parts = [formatStampDate(meta.sourceDate), meta.edition ? `Edition ${meta.edition}` : ''].filter(Boolean);
  const hash = meta.cardIndex == null ? '' : `#${cardAnchor(meta.cardIndex)}`;
  return { line: parts.join(' \u00B7 '), url: `${SHARE_HOST}/issue/${meta.issueId}${hash}` };
}

export async function generateShareCard(
  text: string,
  variant: CardVariant = 'black',
  format: CardFormat = 'feed',
  meta?: ShareCardMeta
): Promise<Blob> {
  await document.fonts.load('bold 42px "Manrope"');
  await document.fonts.load('bold 17px "Manrope"');
  await document.fonts.load('13px "Nunito Sans"');
  await document.fonts.load('600 24px "Nunito Sans"');

  const { w: W, h: H } = SIZES[format];
  const isBlack = variant === 'black';
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = isBlack ? '#000000' : '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  const cx = W / 2;
  const maxTextW = W - 180;

  // ── Measure to center the statement+attribution block ──
  ctx.font = 'bold 42px "Manrope"';
  const lines = wrapText(ctx, text, maxTextW);
  const lineH = 60;
  const textH = lines.length * lineH;
  const gap = 52;
  const logoH = 28;
  const brandH = logoH + 14 + 17 + 22 + 12;
  const totalH = textH + gap + brandH;

  // Center the block vertically, shifted slightly up
  let y = (H - totalH) / 2 - 30;

  // ── STATEMENT ──
  ctx.font = 'bold 42px "Manrope"';
  ctx.fillStyle = isBlack ? '#FFFFFF' : '#111111';
  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineH;
  }

  // ── ATTRIBUTION ──
  y += gap;

  // Logo
  try {
    const logo = await loadImg('/logo.png');
    const lw = logoH * (logo.width / logo.height);
    if (!isBlack) {
      ctx.globalAlpha = 0.92;
      ctx.drawImage(logo, cx - lw / 2, y, lw, logoH);
      ctx.globalAlpha = 1;
    } else {
      const tmp = document.createElement('canvas');
      tmp.width = logo.width;
      tmp.height = logo.height;
      const tc = tmp.getContext('2d')!;
      tc.drawImage(logo, 0, 0);
      tc.globalCompositeOperation = 'source-in';
      tc.fillStyle = '#FFFFFF';
      tc.fillRect(0, 0, tmp.width, tmp.height);
      ctx.globalAlpha = 0.9;
      ctx.drawImage(tmp, cx - lw / 2, y, lw, logoH);
      ctx.globalAlpha = 1;
    }
  } catch {}
  y += logoH + 14;

  // Wordmark
  ctx.font = 'bold 17px "Manrope"';
  ctx.fillStyle = isBlack ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.7)';
  ctx.fillText('The Fourth Angle', cx, y);
  y += 22;

  // Tagline
  ctx.font = '12px "Nunito Sans"';
  ctx.fillStyle = isBlack ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  ctx.fillText('Read past the first telling.', cx, y);

  // ── Issue stamp at bottom: date · edition, then the short link ──
  // Large enough to read on a phone screenshot, contrast ≥ 4.5:1 on both backgrounds.
  const stamp = meta ? shareCardStamp(meta) : { line: '', url: SHARE_HOST };
  ctx.fillStyle = isBlack ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.62)';
  if (stamp.line) {
    ctx.font = '600 24px "Nunito Sans"';
    ctx.fillText(stamp.line, cx, H - 104);
  }
  ctx.font = '24px "Nunito Sans"';
  ctx.fillText(stamp.url, cx, H - 64);

  ctx.textAlign = 'left';

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

export async function shareCardAsImage(
  text: string,
  variant: CardVariant = 'black',
  format: CardFormat = 'feed',
  meta?: ShareCardMeta
): Promise<void> {
  const blob = await generateShareCard(text, variant, format, meta);
  const fileName = meta
    ? `the-fourth-angle-${meta.issueId}${meta.cardIndex == null ? '' : `-${cardAnchor(meta.cardIndex)}`}.png`
    : 'the-fourth-angle.png';
  const file = new File([blob], fileName, { type: 'image/png' });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch {}
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
