import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const siteUrl = 'https://thefourthangle.pages.dev';
const feedPath = join(process.cwd(), 'public', 'issues-feed.json');
const sitemapPath = join(process.cwd(), 'public', 'sitemap.xml');
const dossierDir = join(process.cwd(), 'src', 'data', 'dossiers');

const issues = JSON.parse(readFileSync(feedPath, 'utf8'));
const staticRoutes = [
  { loc: '/', lastmod: null, priority: '1.0' },
  { loc: '/about', lastmod: null, priority: '0.7' },
  { loc: '/disclaimer', lastmod: null, priority: '0.4' },
  // Cloudflare Pages serves verify.html at /verify (robots.txt disallows the .html form).
  { loc: '/verify', lastmod: null, priority: '0.4' },
];

// Same publish rule as getAllDossiers() in src/data/dossiers.ts, which
// drives getStaticPaths for /dossier/[id].
const dossierRoutes = readdirSync(dossierDir)
  .filter((name) => name.endsWith('.json'))
  .sort()
  .map((name) => JSON.parse(readFileSync(join(dossierDir, name), 'utf8')))
  .filter((dossier) => dossier?.id && dossier.format === 'dossier' && dossier.published)
  .map((dossier) => ({ loc: `/dossier/${dossier.id}`, priority: '0.8' }));

// lastmod: the issue's last substantive change, else its first publication
// (both from scripts/derive-issue-history.mjs). The homepage lists issues, so
// it takes the newest of them.
const issueRoutes = issues.map((issue) => ({
  loc: `/issue/${issue.id}`,
  lastmod: issue.modifiedAt || issue.publishedAt || null,
  priority: '0.8',
}));
const newestIssue = issueRoutes.reduce((max, r) => (r.lastmod && (!max || Date.parse(r.lastmod) > Date.parse(max)) ? r.lastmod : max), null);
staticRoutes[0].lastmod = newestIssue;

const routes = [...staticRoutes, ...dossierRoutes, ...issueRoutes];
const urls = routes
  .map(({ loc, lastmod, priority }) => {
    const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
    return `  <url>\n    <loc>${siteUrl}${loc}</loc>${lastmodTag}\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

writeFileSync(sitemapPath, xml, 'utf8');
console.log(`Sitemap written: ${sitemapPath} (${routes.length} URLs: ${staticRoutes.length} static, ${dossierRoutes.length} dossiers, ${issueRoutes.length} issues)`);
