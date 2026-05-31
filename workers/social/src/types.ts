/**
 * Shared types for the T4A social Worker.
 */

export interface Env {
  T4A_SOCIAL_KV: KVNamespace;
  AI: Ai;
  SITE_URL: string;
  BLUESKY_IDENTIFIER: string;
  BLUESKY_PDS: string;
  TARGET_POSTS_PER_DAY: string;
  COOLDOWN_MINUTES: string;
  POST_WINDOW_START_HOUR_MYT: string;
  POST_WINDOW_END_HOUR_MYT: string;
  TREND_CACHE_TTL_MIN: string;
  POSTED_CARD_TTL_DAYS: string;
  ISSUE_COOLDOWN_HOURS: string;
  ENABLE_X: string;
  ENABLE_MASTODON: string;
  MASTODON_INSTANCE: string;
  BLUESKY_APP_PASSWORD: string;
  MASTODON_ACCESS_TOKEN: string;
  ADMIN_SECRET: string;
}

export type CardType = 'hook' | 'fact' | 'reframe' | 'analogy' | 'view';

export interface SocialCard {
  issueId: string;
  cardIndex: number;
  cardType: CardType;
  big: string;
  sub: string;
  lens: string | null;
  entities: string[];
  topicKeywords: string[];
  sourceDate: string | null;
  imagePath: string;
  weight: number;
}

export interface CardIndex {
  generatedAt: string;
  issueCount: number;
  cardCount: number;
  cards: SocialCard[];
}

export interface TrendHeadline {
  source: string;
  title: string;
  url: string;
  publishedAt: string;
}

export interface TrendSnapshot {
  updatedAt: string;
  headlines: TrendHeadline[];
  entities: Record<string, number>;
  keywords: Record<string, number>;
}

export interface RadarSummary {
  generatedAt: string;
  selectedCount: number;
  // max(controversy_score) per entity/keyword across the selected radar items.
  // Score range 0–1; absence means "no radar signal for this term."
  entities: Record<string, number>;
  keywords: Record<string, number>;
}

export interface BlueskySession {
  accessJwt: string;
  refreshJwt: string;
  did: string;
  handle: string;
  expiresAt: number; // epoch ms
}

export interface PostLogEntry {
  issueId: string;
  cardIndex: number;
  postedAt: string;
  uri: string;
  cid: string;
}
