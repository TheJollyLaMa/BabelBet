const test = require('node:test');
const assert = require('node:assert/strict');
test('local profile has strict schema, no imported secrets, limits and explicit persistence consent', async () => {
  const { emptyProfile,parseProfile,persistProfile,readProfile,PROFILE_KEY } = await import('../prep/profile.mjs');
  const profile = {...emptyProfile(),nickname:'A learner',languages:'Spanish',notes:'Offline preparation'};
  const entries = new Map(), storage={getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,value),removeItem:key=>entries.delete(key)};
  assert.deepEqual(readProfile(storage),emptyProfile());
  persistProfile(storage,profile,false); assert.equal(entries.size,0);
  persistProfile(storage,profile,true); assert.equal(entries.has(PROFILE_KEY),true);
  assert.deepEqual(readProfile(storage),profile);
  persistProfile(storage,profile,false); assert.equal(entries.size,0);
  for (const bad of [{...profile,apiKey:'not-accepted'},{...profile,address:'not-accepted'},{...profile,version:2},{...profile,notes:1},{...profile,notes:'x'.repeat(2001)},[],null]) assert.throws(()=>parseProfile(JSON.stringify(bad)));
  assert.throws(()=>parseProfile(' '.repeat(65537)),/64 KiB/);
  assert.throws(()=>parseProfile('{"version":1,"nickname":"","languages":"","notes":"","__proto__":{}}'));
});
test('shared version-1 IPFS host exposes real local backup controls and unavailable omitted public capabilities',async()=>{
  const {createPreparationIPFSHost}=await import('../prep/ipfs-adapter.mjs');
  const {readIPFSHostStatus,openIPFSHostControls}=await import('../prep/vendor/decent-head/2.0.0/js/ipfs-host.js');
  let opened=0;
  const adapter=createPreparationIPFSHost({openLocalBackup:()=>opened++});
  const status=await readIPFSHostStatus(adapter);
  assert.equal(status.backup.state,'idle');
  assert.match(status.backup.detail,/local profile JSON/);
  assert.equal(status.replication.state,'unavailable');
  assert.equal(status.rewards.state,'unavailable');
  await openIPFSHostControls(adapter,'backup');assert.equal(opened,1);
  await assert.rejects(openIPFSHostControls(adapter,'replication'),/not configured/);
  assert.throws(()=>createPreparationIPFSHost({}),/required/);
});
