const test = require('node:test');
const assert = require('node:assert/strict');
const { Interface, id } = require('ethers');
const { assertPayrollActivation } = require('../scripts/payrollGate');
const { assertUnsettledProofs } = require('../scripts/settlePayroll');
const { canQueueMergedPullRequest } = require('../scripts/processMergedBounty');
const { githubRequest } = require('../scripts/githubApi');

test('inactive public config has no accounts, assets, queue, RPC or router', () => {
  const config = require('../payroll-assets.json');
  assert.equal(config.activated, false); assert.equal(config.routerAddress, null); assert.equal(config.rpcUrl, null);
  assert.deepEqual(config.assets, {}); assert.deepEqual(config.rpcFallbackUrls, []);
  assert.deepEqual(require('../contributor-accounts.json'), { contributors: [] });
  assert.deepEqual(require('../payroll-queue.json'), { pending: [], settled: [], retained: [] });
  assert.throws(() => assertPayrollActivation({ BABELBET_PAYROLL_ENABLED:'true', GITHUB_ACTIONS:'true', GITHUB_ACTOR:'TheJollyLaMa', GITHUB_REPOSITORY:'TheJollyLaMa/BabelBet' }), /inactive/);
});
test('GitHub/RPC helper boundaries refuse network while inactive', async () => {
  let requests = 0;
  const previous = global.fetch; global.fetch = async () => { requests++; throw new Error('External request forbidden'); };
  try {
    await assert.rejects(githubRequest('/repos/TheJollyLaMa/BabelBet/issues/3'), /inactive/);
    const { createFailoverProvider } = await import('../payroll-runtime/rpc-failover.js');
    assert.throws(() => createFailoverProvider({ rpcUrl:'https://invalid.example',chainId:8453 }), /inactive/);
    assert.equal(requests, 0);
  } finally { global.fetch = previous; }
});
test('merge parser rejects unmerged PR and settlement boundary rejects replayed/duplicate work', () => {
  assert.equal(canQueueMergedPullRequest({ merged:false }), false);
  assert.equal(canQueueMergedPullRequest({ merged:true }), false);
  assert.equal(canQueueMergedPullRequest({ merged:true,base:{ref:'other',repo:{full_name:'TheJollyLaMa/BabelBet'}} }), false);
  assert.equal(canQueueMergedPullRequest({ merged:true,base:{ref:'main',repo:{full_name:'TheJollyLaMa/DecentBusking'}} }), false);
  assert.equal(canQueueMergedPullRequest({ merged:true,base:{ref:'main',repo:{full_name:'TheJollyLaMa/BabelBet'}} }), true);
  const entry = { issueRef:'TheJollyLaMa/BabelBet#3', contributorGithub:'offline-test',role:'implementer',currency:'TEST' };
  assert.throws(() => assertUnsettledProofs({ settled:[entry] },[entry]), /previously settled/);
  assert.throws(() => assertUnsettledProofs({ settled:[] },[entry,{...entry}]), /Duplicate/);
  assert.doesNotThrow(() => assertUnsettledProofs({ settled:[] },[entry]));
});
test('exact donor PayrollPaid verifier accepts offline canonical proof and rejects each mismatch', async () => {
  const { verifyRepositoryPayment, PAYMENT_EVENT_ABI } = await import('../payroll-runtime/payment-ledger.js');
  const iface = new Interface(PAYMENT_EVENT_ABI);
  const router = '0x1111111111111111111111111111111111111111';
  const asset = '0x2222222222222222222222222222222222222222';
  const recipient = '0x3333333333333333333333333333333333333333';
  const entry = { currency:'TEST', issueRef:'TheJollyLaMa/BabelBet#3', contributorGithub:'offline-test',role:'implementer',fund:'babelbet',contributor:recipient,amount:'2' };
  const config = { assets:{ TEST:{address:asset,decimals:6} },routerAddress:router,fundSlug:'babelbet' };
  const txHash = '0x'+'a'.repeat(64), blockHash = '0x'+'b'.repeat(64);
  const correct = [id('babelbet'),asset,recipient,2000000n,id(`${entry.issueRef}:offline-test:implementer:TEST`),id('TheJollyLaMa/BabelBet'),id('offline-test'),'ipfs://offline-fixture',id('offline-metadata')];
  const makeLog = (values = correct, address = router) => ({address,...iface.encodeEventLog(iface.getEvent('PayrollPaid'),values)});
  const verify = (overrides = {}) => verifyRepositoryPayment({entry,config,txHash,provider:{
    getNetwork:async()=>({chainId:overrides.chainId||8453}),
    getTransactionReceipt:async()=>({status:1,blockNumber:10,blockHash,logs:[makeLog()],...overrides.receipt}),
    getBlockNumber:async()=>overrides.head??11,
    getBlock:async()=>({hash:overrides.blockHash||blockHash})
  }});
  assert.equal((await verify()).workReference,correct[4]);
  await assert.rejects(verify({chainId:1}),/Base-only/);
  await assert.rejects(verify({head:10}),/two successful/);
  await assert.rejects(verify({receipt:{status:0}}),/two successful/);
  await assert.rejects(verify({blockHash:'0x'+'c'.repeat(64)}),/canonical/);
  await assert.rejects(verify({receipt:{logs:[]}}),/exact router/);
  await assert.rejects(verify({receipt:{logs:[makeLog(),makeLog()]}}),/exact router/);
  await assert.rejects(verify({receipt:{logs:[makeLog(correct,recipient)]}}),/exact router/);
  for (const index of [0,1,2,3,4,5,6]) {
    const wrong = [...correct];
    wrong[index] = index === 3 ? 3n : [1,2].includes(index) ? '0x4444444444444444444444444444444444444444' : id('wrong');
    await assert.rejects(verify({receipt:{logs:[makeLog(wrong)]}}),/exact router/,`field ${index}`);
  }
});
