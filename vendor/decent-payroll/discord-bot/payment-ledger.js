import { Interface, id, parseUnits } from 'ethers';
import { createFailoverProvider } from './rpc-failover.js';

export const PAYMENT_EVENT_ABI = ['event PayrollPaid(bytes32 indexed fundId,address indexed asset,address indexed recipient,uint256 amount,bytes32 workReference,bytes32 repositoryIdHash,bytes32 contributorIdHash,string metadataUri,bytes32 metadataHash)'];
const iface = new Interface(PAYMENT_EVENT_ABI);
const repositoryHash = id('TheJollyLaMa/DecentBusking');

export async function verifyRepositoryPayment({ entry, config, txHash, provider = createFailoverProvider(config) }) {
  const currency = String(entry.currency || '').toUpperCase();
  const asset = config.assets[currency];
  if (!asset || currency === 'ETH') throw new Error('Only configured Base repository assets can settle');
  if (Number((await provider.getNetwork()).chainId) !== 8453) throw new Error('Repository proof is Base-only');
  const receipt = await provider.getTransactionReceipt(txHash);
  const head = await provider.getBlockNumber();
  if (!receipt || receipt.status !== 1 || head - receipt.blockNumber + 1 < 2) throw new Error('Repository payment needs two successful Base confirmations');
  if ((await provider.getBlock(receipt.blockNumber))?.hash !== receipt.blockHash) throw new Error('Repository payment is not canonical');
  const base = `${entry.issueRef}:${entry.contributorGithub}:${entry.role || 'contributor'}`;
  const workReference = id(currency === 'ART' ? base : `${base}:${currency}`);
  const matches = receipt.logs.filter(log => {
    if (log.address?.toLowerCase() !== config.routerAddress.toLowerCase()) return false;
    let event;
    try { event = iface.parseLog(log); } catch { return false; }
    const args = event?.args;
    return event?.name === 'PayrollPaid' && args.fundId === id(entry.fund || config.fundSlug) &&
      args.asset.toLowerCase() === asset.address.toLowerCase() && args.recipient.toLowerCase() === entry.contributor.toLowerCase() &&
      args.amount === parseUnits(String(entry.amount), asset.decimals) && args.workReference === workReference &&
      args.repositoryIdHash === id(entry.issueRef.split('#')[0]) && args.contributorIdHash === id(entry.contributorGithub.trim());
  });
  if (matches.length !== 1) throw new Error('No exact router payment proof for this repository ledger entry');
  return { txHash, workReference, blockNumber: receipt.blockNumber };
}

export function createPaymentLedger({ provider, routerAddress, restore = async () => null, save = async () => '', startBlock,
  confirmations = 2, now = () => Date.now(), onVerified = async () => {} }) {
  let entries = new Map();
  let scannedFrom = null;
  let scannedThrough = null;
  let snapshotUri = '';
  let backupPending = false;
  let lastCheckedAt = null;
  let lastError = '';
  let comparisonOffset = 0;
  let task = Promise.resolve();
  const pending = new Set();
  const address = routerAddress.toLowerCase();
  const run = operation => {
    const result = task.then(operation);
    task = result.catch(() => {});
    return result;
  };
  function snapshot() {
    return { schemaVersion: 1, chainId: 8453, routerAddress, scannedFrom, scannedThrough,
      lastCheckedAt, entries: [...entries.values()] };
  }
  async function initialize() {
    if (startBlock !== undefined && (!Number.isSafeInteger(startBlock) || startBlock < 0)) throw new Error('PAYROLL_START_BLOCK must be a nonnegative block number');
    if (Number((await provider.getNetwork()).chainId) !== 8453) throw new Error('Payment ledger is Base-only');
    const saved = await restore();
    if (saved) {
      if (saved.schemaVersion !== 1 || saved.chainId !== 8453 || saved.routerAddress?.toLowerCase() !== address || !Array.isArray(saved.entries)) throw new Error('Invalid payment ledger checkpoint');
      entries = new Map(saved.entries.map(entry => [entry.workReference, { ...entry, verification: 'restored-awaiting-comparison' }]));
      scannedFrom = saved.scannedFrom;
      scannedThrough = saved.scannedThrough;
      if (!Number.isSafeInteger(scannedFrom) || scannedFrom < 0 || !Number.isSafeInteger(scannedThrough) || scannedThrough < scannedFrom - 1) throw new Error('Invalid payment scan checkpoint');
      snapshotUri = saved.snapshotUri || '';
    }
    const head = await provider.getBlockNumber();
    if (scannedFrom === null) scannedFrom = Number.isSafeInteger(startBlock) && startBlock >= 0 ? startBlock : Math.max(0, head - 2000);
    if (scannedThrough === null) scannedThrough = scannedFrom - 1;
    return compare();
  }
  async function persist() {
    if (!backupPending) return;
    try {
      const nextUri = await save({ ...snapshot(), previousSnapshotUri: snapshotUri || null });
      if (!/^ipfs:\/\//.test(nextUri)) throw new Error('Payment backup did not return an IPFS URI');
      snapshotUri = nextUri;
      backupPending = false;
    } catch (error) { lastError = `IPFS backup pending: ${error.message}`; }
  }
  async function verifyTransaction(txHash, head) {
    if (!/^0x[0-9a-fA-F]{64}$/.test(txHash || '')) throw new Error('Invalid payment transaction hash');
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) throw new Error('Payment transaction is not successful and confirmed');
    const relevantEvent = receipt.logs.some(log => {
      try { return log.address.toLowerCase() === address && iface.parseLog(log)?.args.repositoryIdHash === repositoryHash; } catch { return false; }
    });
    if (!relevantEvent) throw new Error('No DecentBusking PayrollPaid event from the configured router');
    if (head - receipt.blockNumber + 1 < confirmations) { pending.add(txHash); return { pending: true, entries: [] }; }
    const block = await provider.getBlock(receipt.blockNumber);
    if (!block || block.hash !== receipt.blockHash) throw new Error('Payment receipt is not on the canonical Base chain');
    const verified = [];
    for (const log of receipt.logs) {
      if (log.address?.toLowerCase() !== address) continue;
      let event;
      try { event = iface.parseLog(log); } catch { continue; }
      if (event?.name !== 'PayrollPaid' || event.args.repositoryIdHash !== repositoryHash) continue;
      const values = event.args;
      const entry = { chainId: 8453, routerAddress, txHash: receipt.hash || txHash, blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash, logIndex: log.index ?? log.logIndex, fundId: values.fundId,
        asset: values.asset, recipient: values.recipient, amountUnits: values.amount.toString(), workReference: values.workReference,
        repositoryIdHash: values.repositoryIdHash, contributorIdHash: values.contributorIdHash,
        metadataUri: values.metadataUri, metadataHash: values.metadataHash, verification: 'verified',
        paidAt: new Date(Number(block.timestamp) * 1000).toISOString() };
      if (JSON.stringify(entries.get(entry.workReference)) !== JSON.stringify(entry)) {
        entries.set(entry.workReference, entry);
        backupPending = true;
      }
      verified.push(entry);
      await onVerified(entry);
    }
    if (!verified.length) throw new Error('No DecentBusking PayrollPaid event from the configured router');
    pending.delete(txHash);
    return { pending: false, entries: verified };
  }
  async function reconcile(txHash) {
    return run(async () => {
      const result = await verifyTransaction(txHash, await provider.getBlockNumber());
      lastCheckedAt = new Date(now()).toISOString();
      await persist();
      return { ...result, snapshotUri, backupPending };
    });
  }
  async function compare() {
    return run(async () => {
      try {
        lastError = '';
        const head = await provider.getBlockNumber();
        const end = Math.min(head - confirmations + 1, scannedThrough + 1000);
        if (end >= scannedFrom && end > scannedThrough) {
          const from = Math.max(scannedFrom, scannedThrough - 12);
          const logs = await provider.getLogs({ address: routerAddress, topics: [iface.getEvent('PayrollPaid').topicHash], fromBlock: from, toBlock: end });
          for (const txHash of new Set(logs.map(log => log.transactionHash))) {
            const receipt = await provider.getTransactionReceipt(txHash);
            const relevant = receipt?.logs.some(log => {
              try { return log.address.toLowerCase() === address && iface.parseLog(log)?.args.repositoryIdHash === repositoryHash; } catch { return false; }
            });
            if (relevant) await verifyTransaction(txHash, head);
          }
          scannedThrough = end;
          if (logs.length) backupPending = true;
        }
        const records = [...entries.values()];
        const checking = Array.from({ length: Math.min(20, records.length) }, (_, offset) => records[(comparisonOffset + offset) % records.length]);
        comparisonOffset = records.length ? (comparisonOffset + checking.length) % records.length : 0;
        for (const entry of checking) {
          const block = await provider.getBlock(entry.blockNumber);
          if (!block || block.hash !== entry.blockHash) { entry.verification = 'chain-mismatch'; backupPending = true; continue; }
          try {
            const proof = await verifyTransaction(entry.txHash, head);
            if (!proof.entries.some(value => value.workReference === entry.workReference)) {
              entry.verification = 'proof-mismatch';
              entries.set(entry.workReference, entry);
              backupPending = true;
            }
          } catch (error) {
            if (/not successful|No DecentBusking|not on the canonical/.test(error.message)) {
              entry.verification = 'proof-mismatch'; entries.set(entry.workReference, entry); backupPending = true;
            } else throw error;
          }
        }
        for (const hash of pending) await verifyTransaction(hash, head);
        lastCheckedAt = new Date(now()).toISOString();
        await persist();
      } catch (error) { lastError = error.message; throw error; }
      return getState();
    });
  }
  function getState() { return { ...snapshot(), snapshotUri, backupPending, pendingTransactions: [...pending], lastError }; }
  return { initialize, reconcile, compare, getState };
}