import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../publish-pipeline.mjs', import.meta.url));

function write(root, path, value) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), typeof value === 'string' ? value : JSON.stringify(value));
}

function run(root, command, args) {
  return spawnSync(command, args, { cwd: root, encoding: 'utf8', env: { ...process.env, GIT_DIR: undefined, GIT_WORK_TREE: undefined } });
}

function git(root, ...args) {
  const result = run(root, 'git', args);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function cli(root, ...args) {
  return run(root, process.execPath, ['scripts/publish-pipeline.mjs', ...args]);
}

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'publication-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const root = join(directory, 'checkout');
  mkdirSync(join(root, 'scripts'), { recursive: true });
  copyFileSync(script, join(root, 'scripts/publish-pipeline.mjs'));
  // Isolate publication orchestration from the separately tested corpus
  // validators, while verifying both pre-commit and post-rebase checks run.
  write(root, 'scripts/validate-issues.mjs', `
    import { appendFileSync, existsSync } from 'node:fs';
    appendFileSync('validation.log', 'issues\\n');
    if (existsSync('reject-publication')) process.exit(1);
  `);
  write(root, 'scripts/build-issue-sources.mjs', `
    import { appendFileSync, existsSync } from 'node:fs';
    if (!process.argv.includes('--check')) throw new Error('must not mutate source lists');
    appendFileSync('validation.log', 'sources\\n');
    if (existsSync('reject-sources')) process.exit(1);
  `);
  write(root, 'src/data/issues/0001.json', { id: '0001', headline: 'Existing issue', related: [] });
  write(root, 'unrelated.txt', 'unrelated committed work');
  git(root, 'init', '--initial-branch=main');
  git(root, 'config', 'user.name', 'Publication Test');
  git(root, 'config', 'user.email', 'publication@example.test');
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'Initial fixture');
  const remote = join(directory, 'remote.git');
  git(root, 'init', '--bare', '--initial-branch=main', remote);
  git(root, 'remote', 'add', 'origin', remote);
  git(root, 'push', '-u', 'origin', 'main');
  return { root, remote, directory };
}

function publication(root) {
  const result = cli(root, 'init', 'test-topic', '0002');
  assert.equal(result.status, 0, result.stderr);
  write(root, 'src/data/issues/0002.json', {
    id: '0002', published: true, related: ['0001'],
    headline: 'A "$(touch PWNED)" `touch PWNED2` headline', cards: [],
  });
  write(root, 'src/data/issues/0001.json', { id: '0001', headline: 'Existing issue', related: ['0002'] });
  write(root, 'engine/briefs/test-topic.md', '# Evidence');
  for (const suffix of ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6-synthesis', 'reader']) {
    write(root, `engine/output/test-topic-${suffix}.json`, { id: '0002' });
  }
  for (const stage of [2, 3, 4, 5]) write(root, `engine/prompts-generated/test-topic-stage${stage}-browser.txt`, 'Review this topic');
  write(root, 'public/og/backgrounds/issue-0002-bg.png', 'source background');
  write(root, 'public/og/backgrounds/issue-0002-thumb.webp', 'generated variant');
  write(root, 'src/data/sources/0002.json', []);
  write(root, 'another-topic-draft.txt', 'unrelated untracked work');
}

test('init reserves different IDs before either draft becomes an issue file', (t) => {
  const { root } = fixture(t);
  assert.equal(cli(root, 'init', 'first-topic').status, 0);
  assert.equal(cli(root, 'init', 'second-topic').status, 0);
  const first = JSON.parse(readFileSync(join(root, 'engine/output/first-topic-pipeline-state.json')));
  const second = JSON.parse(readFileSync(join(root, 'engine/output/second-topic-pipeline-state.json')));
  assert.equal(first.issue_id, '0002');
  assert.equal(second.issue_id, '0003');
  const duplicate = cli(root, 'init', 'third-topic', '0002');
  assert.equal(duplicate.status, 1);
  assert.match(duplicate.stderr, /reserved by first-topic/);
  assert.equal(existsSync(join(root, 'engine/output/.issue-id.lock')), false);
});

test('init permits an edition pipeline after the original has deployed', (t) => {
  const { root } = fixture(t);
  assert.equal(cli(root, 'init', 'first-topic', '0001').status, 0);
  assert.equal(cli(root, 'set-phase', 'first-topic', '9_deployed').status, 0);
  assert.equal(cli(root, 'init', 'first-topic-edition-two', '0001').status, 0);
});

test('init rejects paths and malformed issue IDs before creating states', (t) => {
  const { root } = fixture(t);
  assert.equal(cli(root, 'init', '../escaped').status, 1);
  assert.equal(cli(root, 'init', 'valid-topic', '1').status, 1);
  assert.equal(existsSync(join(root, 'engine/escaped-pipeline-state.json')), false);
});

test('collect rejects empty review JSON without overwriting the canonical review', (t) => {
  const { root } = fixture(t);
  assert.equal(cli(root, 'init', 'test-topic').status, 0);
  write(root, 'response.json', {});
  const result = cli(root, 'collect', 'test-topic', 'stage2', 'response.json');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /numeric bias_score/);
  assert.equal(existsSync(join(root, 'engine/output/test-topic-stage2.json')), false);
  const state = JSON.parse(readFileSync(join(root, 'engine/output/test-topic-pipeline-state.json')));
  assert.equal(state.phases['4_stage2_collected'].done, false);
});

test('deploy commits the complete bundle before rebasing, leaving unrelated files alone', (t) => {
  const { root, directory, remote } = fixture(t);
  publication(root);
  // Model a Radar commit reaching main while the editor is drafting.
  const writer = join(directory, 'other-checkout');
  git(root, 'clone', remote, writer);
  git(writer, 'config', 'user.name', 'Other Writer');
  git(writer, 'config', 'user.email', 'other@example.test');
  write(writer, 'remote-scan.json', { fresh: true });
  git(writer, 'add', 'remote-scan.json');
  git(writer, 'commit', '-m', 'Fresh scan');
  git(writer, 'push', 'origin', 'main');

  const result = cli(root, 'deploy', '0002');
  assert.equal(result.status, 0, result.stderr);
  const files = git(root, 'diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD').split('\n');
  for (const path of [
    'src/data/issues/0001.json', 'src/data/issues/0002.json', 'src/data/sources/0002.json',
    'engine/briefs/test-topic.md', 'engine/output/test-topic-pipeline-state.json',
    'engine/output/test-topic-stage1.json', 'engine/output/test-topic-stage2.json',
    'engine/output/test-topic-stage3.json', 'engine/output/test-topic-stage4.json',
    'engine/output/test-topic-stage5.json', 'engine/output/test-topic-stage6-synthesis.json',
    'engine/output/test-topic-reader.json', 'engine/prompts-generated/test-topic-stage2-browser.txt',
    'engine/prompts-generated/test-topic-stage3-browser.txt', 'engine/prompts-generated/test-topic-stage4-browser.txt',
    'engine/prompts-generated/test-topic-stage5-browser.txt', 'public/og/backgrounds/issue-0002-bg.png',
  ]) assert.ok(files.includes(path), `missing ${path}`);
  assert.ok(!files.includes('another-topic-draft.txt'));
  assert.ok(!files.includes('public/og/backgrounds/issue-0002-thumb.webp'));
  assert.equal(existsSync(join(root, 'PWNED')), false);
  assert.equal(existsSync(join(root, 'PWNED2')), false);
  assert.equal(existsSync(join(root, 'remote-scan.json')), true);
  assert.equal(git(root, 'rev-parse', 'HEAD'), git(root, 'rev-parse', 'origin/main'));
  assert.equal(readFileSync(join(root, 'validation.log'), 'utf8'), 'issues\nsources\nissues\nsources\n');
});

test('deploy refuses unrelated staged changes without committing them', (t) => {
  const { root } = fixture(t);
  publication(root);
  write(root, 'unrelated.txt', 'another task');
  git(root, 'add', 'unrelated.txt');
  const before = git(root, 'rev-parse', 'HEAD');
  const result = cli(root, 'deploy', '0002');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unrelated tracked changes/);
  assert.equal(git(root, 'rev-parse', 'HEAD'), before);
  assert.equal(git(root, 'diff', '--cached', '--name-only'), 'unrelated.txt');
});

test('deploy dry-run validates and lists its bundle without changing Git or remotes', (t) => {
  const { root } = fixture(t);
  publication(root);
  const before = git(root, 'rev-parse', 'HEAD');
  const result = cli(root, 'deploy', '0002', '--dry-run');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /engine\/briefs\/test-topic.md/);
  assert.match(result.stdout, /src\/data\/sources\/0002.json/);
  assert.match(result.stdout, /Dry run complete/);
  assert.equal(git(root, 'rev-parse', 'HEAD'), before);
  assert.equal(git(root, 'rev-parse', 'origin/main'), before);
  assert.equal(git(root, 'diff', '--cached', '--name-only'), '');
});

test('failed validation prevents staging, committing or pushing', (t) => {
  const { root } = fixture(t);
  publication(root);
  write(root, 'reject-publication', 'fail validation');
  const before = git(root, 'rev-parse', 'HEAD');
  const result = cli(root, 'deploy', '0002');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /validate-issues.mjs exited with 1/);
  assert.equal(git(root, 'rev-parse', 'HEAD'), before);
  assert.equal(git(root, 'diff', '--cached', '--name-only'), '');
  assert.equal(git(root, 'rev-parse', 'origin/main'), before);
});

test('source-reference validation blocks publication before staging', (t) => {
  const { root } = fixture(t);
  publication(root);
  write(root, 'reject-sources', 'a card references an absent source');
  const before = git(root, 'rev-parse', 'HEAD');
  const result = cli(root, 'deploy', '0002');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /build-issue-sources.mjs exited with 1/);
  assert.equal(git(root, 'rev-parse', 'HEAD'), before);
  assert.equal(git(root, 'diff', '--cached', '--name-only'), '');
});

test('a missing review prevents deployment even with issue and artwork present', (t) => {
  const { root } = fixture(t);
  publication(root);
  rmSync(join(root, 'engine/output/test-topic-stage3.json'));
  const before = git(root, 'rev-parse', 'HEAD');
  const result = cli(root, 'deploy', '0002');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /publication evidence missing:.*stage3/);
  assert.equal(git(root, 'rev-parse', 'HEAD'), before);
});

test('validation after rebase can stop a push and keep the publication local', (t) => {
  const { root, directory, remote } = fixture(t);
  publication(root);
  const writer = join(directory, 'other-checkout');
  git(root, 'clone', remote, writer);
  git(writer, 'config', 'user.name', 'Other Writer');
  git(writer, 'config', 'user.email', 'other@example.test');
  write(writer, 'reject-publication', 'new validation constraint');
  git(writer, 'add', 'reject-publication');
  git(writer, 'commit', '-m', 'A new constraint');
  git(writer, 'push', 'origin', 'main');
  const remoteHead = git(writer, 'rev-parse', 'HEAD');
  const result = cli(root, 'deploy', '0002');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /validate-issues.mjs exited with 1/);
  assert.equal(git(root, 'rev-parse', 'origin/main'), remoteHead);
  assert.notEqual(git(root, 'rev-parse', 'HEAD'), remoteHead);
  assert.equal(git(root, 'log', '-1', '--format=%s'), 'Publish: issue 0002 — A "$(touch PWNED)" `touch PWNED2` headline');
});

test('an ID reservation arriving from another checkout prevents the final push', (t) => {
  const { root, directory, remote } = fixture(t);
  publication(root);
  const writer = join(directory, 'other-checkout');
  git(root, 'clone', remote, writer);
  git(writer, 'config', 'user.name', 'Other Writer');
  git(writer, 'config', 'user.email', 'other@example.test');
  write(writer, 'engine/output/other-topic-pipeline-state.json', {
    slug: 'other-topic', issue_id: '0002', phases: {},
  });
  git(writer, 'add', '.');
  git(writer, 'commit', '-m', 'Reserve the same ID elsewhere');
  git(writer, 'push', 'origin', 'main');
  const remoteHead = git(writer, 'rev-parse', 'HEAD');
  const result = cli(root, 'deploy', '0002');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /multiple active pipelines reserve issue 0002/);
  assert.equal(git(root, 'rev-parse', 'origin/main'), remoteHead);
  assert.notEqual(git(root, 'rev-parse', 'HEAD'), remoteHead);
});
