const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createServer } = require('../index');
const root = path.resolve(__dirname, '..');
const unsafeFlags = { ...process.env, ENABLE_WATCHER: 'true', DUOLINGO_ENABLED: 'true', ENABLE_DUOLINGO: 'true', ENABLE_LEGACY: 'true', ENABLE_PAYOUTS: 'true', ENABLE_STAKING: 'true', BABELBET_PAYROLL_ENABLED: 'true', GITHUB_ACTIONS: 'true', GITHUB_ACTOR: 'TheJollyLaMa', GITHUB_REPOSITORY: 'TheJollyLaMa/BabelBet', GITHUB_TOKEN: 'offline-fixture-not-a-token' };

test('supported static server serves prep and blocks every historical route/mutation', async t => {
  const server = createServer(); server.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(base);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /No Duolingo access/);
  assert.match(html, /app.mjs/);
  assert.doesNotMatch(html, /ClientWebApp|ChallengeFactory|web3.min|duolingo-api/);
  assert.match(response.headers.get('content-security-policy'), /frame-src 'none'/);
  assert.doesNotMatch(response.headers.get('content-security-policy'), /duolingo|openai|pinata|publicnode/);
  for (const route of ['/challenge_watcher.js','/index.js','/server.js','/login','/accept','/counter_offer','/initiate_challenge','/view_challenge','/Challenge/dashboard.html','/public/js/ClientWebApp.js','/scripts/duolingo.py','/history/index.js.source','/payroll-queue.json','/contributor-accounts.json','/contracts/Challenge.sol','/.env','/%2e%2e%2findex.js']) {
    assert.equal((await fetch(base + route)).status, 410, route);
  }
  for (const method of ['POST','PUT','PATCH','DELETE']) assert.equal((await fetch(base + '/accept', { method })).status, 405);
  assert.equal((await fetch(base + '/%00.js')).status, 400);
  assert.equal((await fetch(base + '/app.mjs', { method: 'HEAD' })).status, 200);
  assert.deepEqual(await (await fetch(base + '/health')).json(), { mode: 'preparation-only', providerAccess: false, wagering: false });
});

test('legacy JS routes/watchers/consoles/deployment and Python entrypoints fail closed despite old flags', () => {
  const js = ['challenge_watcher.js','truffle.js','truffle_console.js',...fs.readdirSync(path.join(root,'routes')).map(name => `routes/${name}`),...fs.readdirSync(path.join(root,'migrations')).map(name => `migrations/${name}`)];
  for (const script of js) {
    const result = spawnSync(process.execPath, [script], { cwd: root, env: unsafeFlags, encoding: 'utf8' });
    assert.notEqual(result.status, 0, script); assert.match(result.stderr, /Preparation only|preparation only/, script);
    assert.equal(fs.readFileSync(path.join(root,script),'utf8').includes('require('), false, script);
  }
  for (const name of fs.readdirSync(path.join(root,'scripts')).filter(name => name.endsWith('.py'))) {
    const result = spawnSync('python3', ['scripts/'+name], { cwd: root, env: unsafeFlags, encoding: 'utf8' });
    assert.notEqual(result.status, 0, name); assert.match(result.stderr, /Preparation only/, name);
    assert.match(fs.readFileSync(path.join(root,'scripts',name),'utf8'), /^raise RuntimeError/);
  }
});

test('supported packages and source graph exclude all legacy runtime dependencies', () => {
  const pkg = require('../package.json');
  assert.equal(pkg.scripts.start, 'node server.js'); assert.equal(pkg.scripts.dev, 'node server.js');
  assert.deepEqual(Object.keys(pkg.dependencies), ['ethers']);
  for (const name of ['index.js','server.js']) {
    assert.doesNotMatch(fs.readFileSync(path.join(root,name),'utf8'), /duolingo-api|challenge_watcher|node-cron|nodemailer|dotenv|truffle|routes\//);
  }
  const lock = require('../package-lock.json');
  assert.doesNotMatch(JSON.stringify(Object.keys(lock.packages)), /duolingo|truffle|nodemailer|node-cron|axios/);
  for (const name of ['LICENSE','NOTICE']) assert.ok(fs.existsSync(path.join(root,name)));
  for (const name of ['index.js','server.js','challenge_watcher.js','scripts/duolingo.py','README.md']) assert.ok(fs.existsSync(path.join(root,'history',name+'.source')));
});

test('inactive payroll CLI rejects even spoofed steward activation before any network operation', () => {
  for (const script of ['scripts/processMergedBounty.js','scripts/settlePayroll.js']) {
    const result = spawnSync(process.execPath, [script], { cwd: root, env: unsafeFlags, encoding: 'utf8' });
    assert.notEqual(result.status, 0); assert.match(result.stderr, /Payroll inactive/);
  }
  const valid = spawnSync(process.execPath, ['scripts/validatePayrollQueue.js'], { cwd: root, env: unsafeFlags, encoding: 'utf8' });
  assert.equal(valid.status, 0, valid.stderr); assert.match(valid.stdout, /inactive, empty/);
});
