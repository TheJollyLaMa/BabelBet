const fs = require('fs');
const path = require('path');

const { renderArtFiComment } = require('./commentArt');
const { postIssueComment, repositoryCoordinates } = require('./githubApi');
const { settleEntries, SUPPORTED_CURRENCIES } = require('./payroll');

const ROOT = path.resolve(__dirname, '..');
const QUEUE_PATH = path.join(ROOT, 'payroll-queue.json');
const ACCOUNTS_PATH = path.join(ROOT, 'contributor-accounts.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function buildSettlementComment({ settledCount, actor, txHash, issueNumber, currency, role }) {
  const body = [
    `✅ Settled ${settledCount} ${currency || 'ART'} ${role ? `${role} ` : ''}payroll entr${settledCount === 1 ? 'y' : 'ies'} by @${actor}.`,
    txHash ? `🔗 Tx: ${txHash}` : '',
  ].filter(Boolean).join('\n');
  return renderArtFiComment(body, issueNumber, 'settlement');
}

function selectSettlementCandidates(queue, { contributorGithub = '', issueRef = '', role = '', currency = '' } = {}) {
  return (queue.pending || []).filter(entry => {
    const entryCurrency = String(entry.currency || 'ETH').trim().toUpperCase();
    return entryCurrency !== 'ETH' &&
      (!contributorGithub || String(entry.contributorGithub || '').trim().toLowerCase() === contributorGithub.toLowerCase()) &&
      (!issueRef || String(entry.issueRef || '').trim() === issueRef) &&
      (!role || String(entry.role || 'contributor').trim().toLowerCase() === role) &&
      (!currency || entryCurrency === currency);
  });
}

function groupByIssue(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const key = `${entry.issueRef}|${entry.currency}|${entry.role || 'contributor'}`;
    if (!groups.has(key)) groups.set(key, { issueRef: String(entry.issueRef || ''), currency: entry.currency, role: entry.role || 'contributor', entries: [] });
    groups.get(key).entries.push(entry);
  }
  return [...groups.values()];
}

async function main() {
  const { owner, repo } = repositoryCoordinates();
  const contributorGithub = String(process.env.INPUT_CONTRIBUTOR_GITHUB || '').trim();
  const issueRef = String(process.env.INPUT_ISSUE_REF || '').trim();
  const role = String(process.env.INPUT_ROLE || '').trim().toLowerCase().replace(/^any$/, '');
  const currency = String(process.env.INPUT_CURRENCY || '').trim().toUpperCase();
  const txHash = String(process.env.INPUT_TX_HASH || '').trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) throw new Error('tx_hash must be a 32-byte transaction hash');
  if (issueRef && !/^[^/]+\/[^/]+#\d+$/.test(issueRef)) throw new Error('issue_ref must look like owner/repo#123');
  if (role && !['contributor', 'implementer', 'idea-originator', 'tester'].includes(role)) throw new Error(`unsupported payroll role: ${role}`);
  if (currency === 'ETH') throw new Error('Legacy ETH cannot be settled by the active Base workflow');
  if (currency && !SUPPORTED_CURRENCIES.includes(currency)) throw new Error(`unsupported payroll asset: ${currency}`);

  const queue = readJson(QUEUE_PATH);
  const accounts = readJson(ACCOUNTS_PATH);
  const candidates = selectSettlementCandidates(queue, { contributorGithub, issueRef, role, currency });
  if (!candidates.length) { console.log('No matching pending Base entries found.'); return; }
  const config = readJson(path.join(ROOT, 'payroll-assets.json'));
  const { verifyRepositoryPayment } = await import('../discord-bot/payment-ledger.js');
  const { createFailoverProvider } = await import('../discord-bot/rpc-failover.js');
  const provider = createFailoverProvider(config);
  // With only a tx hash, settle every pending entry that the transaction exactly proves (batch payouts).
  const exact = Boolean(contributorGithub && issueRef && role && currency);
  const proven = [];
  for (const entry of candidates) {
    try {
      await verifyRepositoryPayment({ entry, config, txHash, provider });
      proven.push(entry);
    } catch (error) {
      if (exact || !/No exact router payment proof/.test(error.message)) throw error;
    }
  }
  if (!proven.length) throw new Error('This transaction does not prove payment for any pending payroll entry');

  const settledAt = new Date().toISOString();
  const settledBy = process.env.GITHUB_ACTOR || 'github-actions[bot]';
  const settled = proven.flatMap(entry => settleEntries({
    queue,
    accounts,
    contributorGithub: entry.contributorGithub,
    issueRef: entry.issueRef,
    role: String(entry.role || 'contributor').toLowerCase(),
    currency: String(entry.currency || '').toUpperCase(),
    txHash,
    settledAt,
    settledBy,
  }));
  if (settled.length === 0) {
    console.log('No matching pending entries found.');
    return;
  }

  writeJson(QUEUE_PATH, queue);
  writeJson(ACCOUNTS_PATH, accounts);
  for (const group of groupByIssue(settled)) {
    const issueMatch = group.issueRef.match(/#(\d+)$/);
    if (!issueMatch || !group.issueRef.startsWith(`${owner}/${repo}#`)) continue;
    const issueNumber = Number(issueMatch[1]);
    await postIssueComment(owner, repo, issueNumber, buildSettlementComment({
      settledCount: group.entries.length,
      actor: settledBy,
      txHash,
      issueNumber,
      currency: group.currency,
      role: group.role,
    }));
  }
  console.log(`Settled ${settled.length} payroll entr${settled.length === 1 ? 'y' : 'ies'} from ${txHash}.`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

module.exports = { buildSettlementComment, selectSettlementCandidates, groupByIssue };