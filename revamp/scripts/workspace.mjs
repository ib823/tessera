import { cp, mkdir, readdir, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { existsSync, watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const revamp = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = resolve(revamp, '..');
const workspace = join(revamp, '.cache', 'app');
const marker = join(workspace, '.t4a-revamp-workspace');
const command = process.argv[2] ?? 'dev';
const excluded = new Set(['.git', '.astro', '.keys', '.wrangler', 'node_modules', 'dist', 'revamp', 'test-results', 'playwright-report', '__pycache__']);

async function overlay(directory, target) {
  if (!existsSync(directory)) return;
  await mkdir(target, { recursive: true });
  await cp(directory, target, { recursive: true, force: true });
}

async function prepare() {
  if (!existsSync(join(repository, 'node_modules', '.bin', 'astro'))) {
    throw new Error('Run npm ci in the repository root first. The revamp shares its pinned dependencies.');
  }
  if (existsSync(workspace)) {
    if (!existsSync(marker)) throw new Error(`Refusing to replace an unrecognized directory: ${workspace}`);
    await rm(workspace, { recursive: true });
  }
  await mkdir(workspace, { recursive: true });
  await writeFile(marker, 'Generated revamp build workspace. Edit revamp/src instead.\n');
  for (const entry of await readdir(repository, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.name.startsWith('.env') || entry.name === '.dev.vars') continue;
    await cp(join(repository, entry.name), join(workspace, entry.name), { recursive: true });
  }
  await symlink(join(repository, 'node_modules'), join(workspace, 'node_modules'), 'dir');
  await overlay(join(revamp, 'src'), join(workspace, 'src'));
  // Font replacement is confined to this disposable build workspace.
  await rm(join(workspace, 'public', 'fonts'), { recursive: true, force: true });
  await overlay(join(revamp, 'public'), join(workspace, 'public'));
  await overlay(join(revamp, 'build-scripts'), join(workspace, 'scripts'));
  await overlay(join(revamp, 'tests'), join(workspace, 'tests', 'e2e', 'revamp'));
  await overlay(join(revamp, 'regression-tests'), join(workspace, 'tests', 'e2e'));
  // Shared dependencies live outside the generated app root. Explicitly allow
  // this repository for development module requests while retaining Vite's guard.
  await rename(join(workspace, 'astro.config.mjs'), join(workspace, 'astro.base.config.mjs'));
  await writeFile(join(workspace, 'astro.config.mjs'), `import config from './astro.base.config.mjs';
export default { ...config, devToolbar: { enabled: false }, vite: { ...config.vite, cacheDir: ${JSON.stringify(join(workspace, ".vite"))}, server: { ...config.vite?.server, fs: { allow: ${JSON.stringify([repository, workspace])} } } } };
`);
  await writeFile(join(workspace, 'cloud.playwright.config.ts'), `import config from './playwright.config';
export default { ...config, use: { ...config.use, launchOptions: { ...config.use?.launchOptions, executablePath: '/usr/bin/chromium' } } };
`);
  console.log(`Prepared ${workspace}`);
}

function run(executable, args) {
  const child = spawn(executable, args, {
    cwd: workspace,
    stdio: 'inherit',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', GIT_DIR: join(repository, '.git') },
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => child.kill(signal));
  return new Promise((resolveResult, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => resolveResult(code ?? (signal ? 1 : 0)));
  });
}

async function main() {
  if (!['prepare', 'dev', 'build', 'preview', 'test'].includes(command)) throw new Error(`Unknown command: ${command}`);
  if (['prepare', 'dev', 'build'].includes(command)) await prepare();
  if (command === 'prepare') return 0;
  if (command === 'dev') {
    // Serialize overlay copies so rapid saves cannot race the development server.
    let pending = Promise.resolve();
    const watcher = watch(join(revamp, 'src'), { recursive: true }, (_event, name) => {
      if (!name || name.includes('..')) return;
      pending = pending.then(async () => {
        const from = join(revamp, 'src', name);
        const to = join(workspace, 'src', name);
        const original = join(repository, 'src', name);
        if (existsSync(from)) {
          await mkdir(dirname(to), { recursive: true });
          await cp(from, to, { recursive: true, force: true });
        } else if (existsSync(original)) {
          await cp(original, to, { recursive: true, force: true });
        } else {
          await rm(to, { recursive: true, force: true });
        }
      }).catch((error) => console.error('Could not refresh revamp source:', error));
    });
    try { return await run('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4323', ...process.argv.slice(3)]); }
    finally { watcher.close(); await pending; }
  }
  if (!existsSync(marker)) throw new Error('Run the revamp build first.');
  if (command === 'build') {
    const result = await run('npm', ['run', 'build']);
    if (result !== 0) return result;
    const budgetResult = await run('npm', ['run', 'check-bundle']);
    if (budgetResult !== 0) return budgetResult;
    const destination = join(revamp, 'dist');
    await mkdir(destination, { recursive: true });
    await rm(destination, { recursive: true });
    await cp(join(workspace, 'dist'), destination, { recursive: true });
    console.log(`Preview output: ${destination}`);
    return 0;
  }
  if (command === 'preview') return run('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4323', ...process.argv.slice(3)]);
  return run('node', ['node_modules/@playwright/test/cli.js', 'test', '--config', 'cloud.playwright.config.ts', '--project=chromium-desktop', '--workers=2', ...process.argv.slice(3)]);
}

process.exitCode = await main();
