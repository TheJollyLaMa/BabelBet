const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const project = path.resolve(__dirname, '..');
  const babel = fs.existsSync(path.join(project, 'prep'));
  const root = path.join(project, fs.existsSync(path.join(project, 'course')) ? 'course' : 'public');
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
  const server = babel ? require('../index').createServer() : http.createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (error, bytes) => {
      res.writeHead(error ? 404 : 200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      res.end(error ? '' : bytes);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const base = `http://127.0.0.1:${server.address().port}`;
    const entries = fs.existsSync(path.join(root, 'course-ledger.html')) ? ['/index.html', '/course-ledger.html'] : ['/'];
    for (const entry of entries) {
      const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
      const probes = [], errors = [], unexpected = [];
      let mode = '401';
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', async route => {
        const request = route.request(), url = request.url();
        if (url.startsWith(base + '/')) return route.continue();
        if (url === 'https://api.pinata.cloud/data/testAuthentication') {
          assert.equal(request.method(), 'GET');
          assert.equal(request.postData(), null);
          assert.equal(request.headers().authorization, 'Bearer synthetic-browser-credential');
          probes.push('pinata');
          if (mode === 'network') return route.abort('failed');
          return route.fulfill({ status: mode === '401' ? 401 : 200,
            json: mode === '401' ? { error: 'Unauthorized' } : { message: 'Congratulations! You are communicating with the Pinata API!' } });
        }
        if (url === 'http://127.0.0.1:5001/api/v0/version') {
          assert.equal(request.method(), 'POST');
          assert.equal(request.postData(), null);
          assert.equal(request.headers().authorization, undefined);
          assert.equal(request.headers().pinata_api_key, undefined);
          probes.push('local');
          return route.fulfill({ json: { Version: '0.34.0' } });
        }
        if (!url.startsWith('https://fonts.googleapis.com/') && !url.startsWith('https://cdnjs.cloudflare.com/')) unexpected.push(url);
        return route.abort();
      });
      await page.goto(base + entry);
      await page.locator('decent-header ipfs-controls #open').click();
      await page.locator('decent-header ipfs-controls #backup-status').waitFor();
      const controls = 'decent-header ipfs-controls ';
      await page.locator(controls + '#provider-settings > summary').click();
      assert.deepEqual(probes, []);
      await page.locator(controls + '#provider').selectOption('pinata');
      await page.locator(controls + '#jwt').fill('synthetic-browser-credential');
      await page.locator(controls + '#save-provider').click();
      assert.deepEqual(probes, []);
      assert.equal(await page.locator(controls + '#jwt').inputValue(), '');
      const message = page.locator(controls + '#provider-message');
      await page.locator(controls + '#verify-provider').click();
      await message.filter({ hasText: 'HTTP 401' }).waitFor();
      assert.equal(await page.evaluate(() => window.DecentHead.getIpfs().snapshot().connection.state), 'error');
      mode = 'network';
      await page.locator(controls + '#verify-provider').click();
      await message.filter({ hasText: 'failed or timed out' }).waitFor();
      mode = 'ready';
      await page.locator(controls + '#verify-provider').click();
      await message.filter({ hasText: 'Pinata authenticated' }).waitFor();
      assert.equal(await page.evaluate(() => window.DecentHead.getIpfs().snapshot().connection.state), 'ready');
      assert.match(await page.locator('decent-header ipfs-status #label').textContent(), /ready/);
      assert.equal(await page.locator(controls + '[data-capability="replication"]').isDisabled(), true);
      assert.equal(await page.locator(controls + '[data-capability="rewards"]').isDisabled(), true);
      if (!babel) assert.equal(await page.locator(controls + '[data-capability="backup"]').isDisabled(), true);
      assert.doesNotMatch(await message.textContent(), /synthetic-browser-credential/);
      assert.equal(await page.evaluate(() => JSON.stringify(window.DecentHead.getIpfs().snapshot()).includes('synthetic-browser-credential')), false);
      assert.equal(await page.evaluate(() => JSON.stringify({ ...localStorage }).includes('synthetic-browser-credential')), false);
      await page.locator(controls + '#provider').selectOption('local');
      await page.locator(controls + '#save-provider').click();
      assert.equal(await page.evaluate(() => window.DecentHead.getIpfs().snapshot().connection.state), 'unverified');
      assert.deepEqual(probes, ['pinata', 'pinata', 'pinata']);
      await page.locator(controls + '#verify-provider').click();
      await message.filter({ hasText: 'Local Kubo version endpoint responded' }).waitFor();
      assert.equal(await page.evaluate(() => window.DecentHead.getIpfs().snapshot().connection.state), 'ready');
      assert.deepEqual(probes, ['pinata', 'pinata', 'pinata', 'local']);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.deepEqual(unexpected, []);
      assert.deepEqual(errors, []);
      console.log(`${entry}: explicit Pinata401/network/ready and Kubo ready; no automatic probes/uploads; 375px passed`);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
