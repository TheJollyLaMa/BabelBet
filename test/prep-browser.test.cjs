const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { createServer } = require('../index');

async function setup(t, wallet = false) {
  const server = createServer(); server.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true});
  t.after(async()=>{await browser.close();await new Promise(resolve=>server.close(resolve));});
  const context=await browser.newContext({reducedMotion:'reduce'});
  const external=[],errors=[];
  await context.route('**/*', async route=>{
    if (route.request().url().startsWith(base+'/')) return route.continue();
    external.push(route.request().url());return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(({ wallet })=>{
    window.__walletRequests=[];
    if (wallet) {
      const provider={
        request:async ({method})=>{
          window.__walletRequests.push(method);
          if (method==='eth_requestAccounts') return ['0x3333333333333333333333333333333333333333'];
          if (method==='eth_chainId') return '0x2105';
          if (method==='wallet_switchEthereumChain') return null;
          throw new Error(`Unapproved wallet operation ${method}`);
        },on(){},removeListener(){}
      };
      window.ethers={BrowserProvider:class{constructor(provider){this.provider=provider;}}};
      window.addEventListener('eip6963:requestProvider',()=>window.dispatchEvent(new CustomEvent('eip6963:announceProvider',{detail:{info:{uuid:'offline-provider',name:'Offline wallet',rdns:'org.example.offline',icon:'https://invalid.example/icon'},provider}})));
    }
    const fetchOriginal=window.fetch;
    window.fetch=(url,...args)=>{
      const target=new URL(typeof url==='string'?url:url.url,location.href);
      if (target.origin!==location.origin) throw new Error('External network forbidden in receiving tests');
      return fetchOriginal(url,...args);
    };
  },{wallet});
  await page.goto(base);await page.locator('decent-header ankh-menu[side="right"] button').waitFor({state:'attached'});
  assert.deepEqual(errors,[]);
  return {page,context,base,external,errors};
}

test('receiving browser: full prep UI, optional wallet, menus, privacy, tutorial, IPFS gates, radio consent; no external requests', async t=>{
  const {page,context,external,errors}=await setup(t);
  assert.deepEqual(await page.evaluate(()=>window.__walletRequests),[]);
  assert.equal(await page.evaluate(() => {
    const ipfs = window.DecentHead.getIpfs(), prototype = Object.getPrototypeOf(ipfs);
    return ['configure','request','upload','restore','pin'].every(method=>ipfs[method]===prototype[method]);
  }),true);
  assert.equal(await page.locator('#wallet-state').textContent(),'Wallet optional · not connected');
  assert.equal(await page.locator('decent-header ipfs-status #label').textContent(),'IPFS · unconfigured · local files only');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('decenthead:ipfs',{detail:window.DecentHead.getIpfs().snapshot()})));
  assert.equal(await page.locator('decent-header ipfs-status #label').textContent(),'IPFS · unconfigured · local files only');
  assert.doesNotMatch(await page.locator('decent-header ipfs-status #label').textContent(),/pinata|ready/i);
  assert.equal(await page.locator('#radio-load').isDisabled(),true);
  assert.match(await page.locator('#radio-status').textContent(),/no external request/);
  await page.locator('decent-header ankh-menu[side="left"] summary').click();
  await page.locator('decent-header ankh-menu[side="left"] button').click();
  assert.equal(await page.locator('#admin-dialog').evaluate(node=>node.open),true);
  assert.equal(await page.locator('#admin-dialog button').first().isDisabled(),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('decent-header ankh-menu[side="left"] summary').evaluate(node=>node.getRootNode().activeElement===node),true);
  await page.locator('decent-header ankh-menu[side="right"] summary').click();
  await page.locator('decent-header ankh-menu[side="right"] button').click();
  await page.locator('#nickname').fill('Offline learner');
  await page.locator('#languages').fill('English, Spanish');
  await page.locator('#notes').fill('Help with accessible preparation');
  await page.locator('#profile-form button[type="submit"]').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('babelbet-preparation-profile-v1')),null);
  assert.equal(await page.locator('#profile-export').isDisabled(),true);
  await page.locator('#remember-profile').check();
  await page.locator('#profile-form button[type="submit"]').click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('babelbet-preparation-profile-v1')).nickname),'Offline learner');
  await page.locator('#export-consent').check();
  const downloaded=page.waitForEvent('download');
  await page.locator('#profile-export').click();
  assert.equal((await downloaded).suggestedFilename(),'babelbet-preparation-profile.json');
  await page.locator('#profile-import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,nickname:'',languages:'',notes:'',apiKey:'rejected'}))});
  await page.waitForFunction(()=>document.getElementById('profile-status').textContent.startsWith('Import rejected'));
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('#profile-import').setInputFiles({name:'good.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,nickname:'Imported locally',languages:'French',notes:'No upload'}))});
  await page.waitForFunction(()=>document.getElementById('nickname').value==='Imported locally');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('babelbet-preparation-profile-v1')).nickname),'Offline learner');
  await page.locator('#profile-clear').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('babelbet-preparation-profile-v1')),null);
  await page.keyboard.press('Escape');
  await page.locator('#tutorial-open').click();
  assert.equal(await page.locator('.bunny').evaluate(node=>getComputedStyle(node).animationName),'none');
  for(let index=0;index<5;index++){
    assert.match(await page.locator('#tutorial-progress').textContent(),new RegExp(`Hop ${index+1} of 5`));
    await page.locator('#tutorial-next').click();
  }
  assert.equal(await page.locator('#tutorial-dialog').evaluate(node=>node.open),false);
  assert.equal(await page.locator('#tutorial-open').evaluate(node=>document.activeElement===node),true);
  await page.locator('decent-header ipfs-controls #open').click();
  await page.waitForFunction(()=>{
    const header=document.querySelector('decent-header');
    const controls=header.shadowRoot.querySelector('ipfs-status').querySelector('ipfs-controls');
    return controls.shadowRoot.getElementById('replication-status').textContent.startsWith('unavailable:');
  });
  assert.equal(await page.locator('decent-header ipfs-controls #provider-settings').isVisible(),false);
  assert.equal(await page.locator('decent-header ipfs-controls #save-provider').isDisabled(),true);
  await page.locator('decent-header ipfs-controls #save-provider').evaluate(node=>node.onclick());
  assert.equal(await page.evaluate(()=>window.DecentHead.getIpfs().snapshot().credentialsConfigured),false);
  assert.equal(await page.locator('decent-header ipfs-controls [data-capability="replication"]').isDisabled(),true);
  assert.equal(await page.locator('decent-header ipfs-controls [data-capability="rewards"]').isDisabled(),true);
  await page.locator('decent-header ipfs-controls [data-capability="backup"]').click();
  assert.equal(await page.locator('#profile-dialog').evaluate(node=>node.open),true);
  await page.keyboard.press('Escape');
  await page.locator('#about-open').click();
  assert.match(await page.locator('decent-header about-modal dialog').textContent(),/BabelBet/);
  await page.keyboard.press('Escape');
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
  // Fulfill the pinned module locally; never contact CDN/worker/stream.
  await context.route('https://cdn.jsdelivr.net/**',route=>route.fulfill({contentType:'text/javascript',body:'export function mount(element,options){globalThis.__radioOptions=options;element.textContent="Offline radio · press Play";return{destroy(){element.textContent="";globalThis.__radioDestroyed=true;}}}'}));
  await page.locator('#radio-consent').check();
  await page.locator('#radio-load').click();
  await page.waitForFunction(()=>globalThis.__radioOptions);
  assert.equal(await page.evaluate(()=>globalThis.__radioOptions.autoplay),undefined);
  assert.equal(await page.evaluate(()=>globalThis.__radioOptions.head),undefined);
  await page.locator('#radio-consent').uncheck();
  assert.equal(await page.evaluate(()=>globalThis.__radioDestroyed),true);
  assert.equal(await page.locator('#radio-widget').textContent(),'');
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
});

test('explicit host bridge preserves generic upstream default when host-only mode is absent', async t => {
  const {page,context,base,external,errors}=await setup(t);
  await context.route(base+'/app.mjs',route=>route.fulfill({
    contentType:'text/javascript',
    body:"globalThis.DECENT_CONFIG={ens:{enabled:false}};await import('./vendor/decent-head/2.0.0/js/main.js');"
  }));
  await page.reload();
  await page.locator('decent-header ipfs-controls #open').click();
  assert.equal(await page.locator('decent-header ipfs-controls #provider-settings').isVisible(),true);
  assert.equal(await page.locator('decent-header ipfs-controls #save-provider').isDisabled(),false);
  assert.equal(await page.locator('decent-header ipfs-controls #community-settings').isVisible(),true);
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
});

test('radio consent has stable accessible target at 1024x768 and scroll/check needs no force',async t=>{
  const {page,external,errors}=await setup(t);
  await page.setViewportSize({width:1024,height:768});
  const consent=page.locator('#radio-consent');
  await consent.scrollIntoViewIfNeeded({timeout:5000});
  const first=await consent.boundingBox();
  await page.waitForTimeout(150);
  const second=await consent.boundingBox();
  assert.deepEqual(second,first);
  assert.ok((await page.locator('.radio-consent-target').boundingBox()).height>=44);
  await consent.check({timeout:5000});
  assert.equal(await consent.isChecked(),true);
  assert.equal(await page.locator('#radio-load').isEnabled(),true);
  await consent.uncheck({timeout:5000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>scrollTo(0,0));
  await consent.scrollIntoViewIfNeeded({timeout:5000});
  await consent.check({timeout:5000});
  assert.equal(await consent.isChecked(),true);
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
});

test('receiving browser: actual EIP-6963 session is click-only, never signs/sends or grants admin, disconnect clears identity',async t=>{
  const {page,external,errors}=await setup(t,true);
  assert.deepEqual(await page.evaluate(()=>window.__walletRequests),[]);
  await page.locator('decent-header wallet-connect #connect').click();
  await page.waitForFunction(()=>document.getElementById('wallet-state').textContent.includes('connected:'));
  const methods=await page.evaluate(()=>window.__walletRequests);
  assert.deepEqual(methods,['eth_requestAccounts','eth_chainId','eth_chainId']);
  assert.equal(await page.evaluate(()=>window.DecentHead.getWallet().snapshot().connected),true);
  assert.equal(await page.evaluate(()=>window.DecentHead.getWallet().snapshot().ensStatus),'idle');
  await page.locator('#admin-open').click();
  assert.equal(await page.locator('#admin-dialog button').first().isDisabled(),true);
  await page.keyboard.press('Escape');
  await page.locator('decent-header wallet-connect #connect').click();
  assert.equal(await page.evaluate(()=>window.DecentHead.getWallet().snapshot().connected),false);
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
});
