// Local static test server: resolve clean .html URLs before directories.
// Cloudflare Pages can serve /infographics.html alongside /infographics/*;
// a generic directory-first server incorrectly returns 404 for that route.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.xml':'application/xml', '.txt':'text/plain', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.avif':'image/avif', '.ico':'image/x-icon', '.woff2':'font/woff2', '.woff':'font/woff', '.pdf':'application/pdf' };
async function isFile(path) { try { return (await stat(path)).isFile(); } catch { return false; } }
// Keep idle connections open longer than any client does. Node's default
// keepAliveTimeout (5 s) matches the client's idle socket timeout, so a
// request sent on a reused socket as the server closed it failed with
// "socket hang up" (matrix run 42901354224, firefox-3840x2160). The client
// now always closes first. headersTimeout must exceed keepAliveTimeout.
function withLongKeepAlive(server) {
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
  return server;
}
export function createPreviewServer(directory) {
return withLongKeepAlive(createServer(async (request, response) => {
  try {
    const root = resolve(typeof directory === 'function' ? directory() : directory);
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const requested = resolve(root, `.${pathname}`);
    if (requested !== root && !requested.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    const candidates = pathname === '/' ? [resolve(root, 'index.html')] : [requested + '.html', requested, resolve(requested, 'index.html')];
    let path;
    for (const candidate of candidates) if (await isFile(candidate)) { path = candidate; break; }
    const status = path ? 200 : 404;
    path ??= resolve(root, '404.html');
    if (!await isFile(path)) { response.writeHead(404).end(); return; }
    response.writeHead(status, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    if (request.method === 'HEAD') response.end();
    else createReadStream(path).pipe(response);
  } catch { response.writeHead(400).end(); }
}));
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const port = Number(process.argv[3] ?? 4325);
  createPreviewServer(process.argv[2] ?? 'dist').listen(port, '127.0.0.1', () => console.log(`Built revamp: http://127.0.0.1:${port}`));
}
