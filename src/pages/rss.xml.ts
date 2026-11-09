/**
 * /rss.xml: RSS 2.0 feed of published issues, newest first (audit S-6).
 * Prerendered at build time like every other route; the XML itself is built
 * by src/lib/rss.ts so it can be unit-tested.
 */
import type { APIRoute } from 'astro';
import { ISSUES } from '../data/issues';
import { buildRssXml } from '../lib/rss';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.origin ?? 'https://thefourthangle.pages.dev';
  return new Response(buildRssXml(ISSUES, siteUrl), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
