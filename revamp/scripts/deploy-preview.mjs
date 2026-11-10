// An explicitly non-production Pages deployment. Never changes root workflows.
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const revamp=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist=resolve(revamp,'dist');
const branch='codex-t4a-revamp';
if(!existsSync(resolve(dist,'index.html')))throw new Error('Build the revamp first: npm --prefix revamp run build');
if(!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
  throw new Error('Preview deployment needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the environment. No deployment was attempted.');
}
const result=spawnSync(process.execPath,[resolve(revamp,'../node_modules/wrangler/bin/wrangler.js'),'pages','deploy',dist,'--project-name=thefourthangle',`--branch=${branch}`],{cwd:revamp,stdio:'inherit'});
process.exitCode=result.status??1;
