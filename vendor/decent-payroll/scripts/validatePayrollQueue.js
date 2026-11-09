const fs = require('fs');
const path = require('path');
const { DBUSK_REPO_FUND, blockedPayoutReason, isRetainInFund, normalizeAmount, normalizeCurrency, PAYROLL_ASSET_CONFIG, SUPPORTED_CURRENCIES } = require('./payroll');

const QUEUE_PATH = path.join(__dirname, '..', 'payroll-queue.json');
const ACCOUNTS_PATH = path.join(__dirname, '..', 'contributor-accounts.json');
const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const ISSUE_REF_RE = /^[^/]+\/[^/]+#\d+$/;
const VALID_CURRENCIES = new Set([...SUPPORTED_CURRENCIES, 'ETH']);
const SUPPORTED_ROLES = new Set(['contributor', 'implementer', 'idea-originator', 'tester']);
const LEGACY_CUTOFF = Date.parse('2026-09-16T00:00:00.000Z');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(QUEUE_PATH)) fail('payroll-queue.json is missing');
if (!fs.existsSync(ACCOUNTS_PATH)) fail('contributor-accounts.json is missing');

let queue;
let accounts;
try { queue = readJson(QUEUE_PATH); } catch (error) { fail(`payroll-queue.json is not valid JSON: ${error.message}`); }
try { accounts = readJson(ACCOUNTS_PATH); } catch (error) { fail(`contributor-accounts.json is not valid JSON: ${error.message}`); }

if (!queue || typeof queue !== 'object' || Array.isArray(queue)) fail('payroll-queue.json must be a JSON object');
if (!Array.isArray(queue.pending)) fail('payroll-queue.json.pending must be an array');
if (!Array.isArray(queue.settled)) fail('payroll-queue.json.settled must be an array');
if (queue.retained !== undefined && !Array.isArray(queue.retained)) fail('payroll-queue.json.retained must be an array');
if (!Array.isArray(queue.retained)) queue.retained = [];
if (!accounts || typeof accounts !== 'object' || Array.isArray(accounts)) fail('contributor-accounts.json must be a JSON object');
if (!Array.isArray(accounts.contributors)) fail('contributor-accounts.json.contributors must be an array');

if (!Number.isInteger(PAYROLL_ASSET_CONFIG.chainId) || PAYROLL_ASSET_CONFIG.chainId <= 0) fail('payroll-assets.json.chainId must be a positive integer');
if (!/^0x[a-fA-F0-9]{40}$/.test(String(PAYROLL_ASSET_CONFIG.routerAddress || ''))) fail('payroll-assets.json.routerAddress must be a valid contract address');
if (!/^[a-z0-9][a-z0-9-]*$/.test(String(PAYROLL_ASSET_CONFIG.fundSlug || ''))) fail('payroll-assets.json.fundSlug must be a lowercase slug');
if (!PAYROLL_ASSET_CONFIG.assets || typeof PAYROLL_ASSET_CONFIG.assets !== 'object' || Array.isArray(PAYROLL_ASSET_CONFIG.assets) || Object.keys(PAYROLL_ASSET_CONFIG.assets).length === 0) {
  fail('payroll-assets.json.assets must contain at least one configured token');
}
if (PAYROLL_ASSET_CONFIG.blockedPayoutAddresses !== undefined && !Array.isArray(PAYROLL_ASSET_CONFIG.blockedPayoutAddresses)) {
  fail('payroll-assets.json.blockedPayoutAddresses must be an array');
}
for (const [index, item] of (PAYROLL_ASSET_CONFIG.blockedPayoutAddresses || []).entries()) {
  if (!ADDRESS_RE.test(String(item?.address || ''))) fail(`payroll-assets.json.blockedPayoutAddresses[${index}].address must be a valid address`);
  if (!String(item?.reason || '').trim()) fail(`payroll-assets.json.blockedPayoutAddresses[${index}].reason is required`);
}
if (PAYROLL_ASSET_CONFIG.assets?.ETH) fail('ETH is reserved for historical Optimism payouts and cannot be configured as a Base token');
for (const [symbol, asset] of Object.entries(PAYROLL_ASSET_CONFIG.assets || {})) {
  if (!/^[A-Z][A-Z0-9]{1,9}$/.test(symbol)) fail(`payroll-assets.json asset symbol is invalid: ${symbol}`);
  if (!ADDRESS_RE.test(String(asset.address || ''))) fail(`payroll-assets.json ${symbol}.address must be a valid contract address`);
  if (!Number.isInteger(asset.decimals) || asset.decimals < 0 || asset.decimals > 36) fail(`payroll-assets.json ${symbol}.decimals must be between 0 and 36`);
  if (!Number.isInteger(asset.ledgerDecimals) || asset.ledgerDecimals < 0 || asset.ledgerDecimals > 18 || asset.ledgerDecimals > asset.decimals) {
    fail(`payroll-assets.json ${symbol}.ledgerDecimals must be between 0 and min(18, token decimals)`);
  }
}

const contributors = new Map();
for (const [index, contributor] of accounts.contributors.entries()) {
  if (!contributor || typeof contributor !== 'object' || Array.isArray(contributor)) {
    fail(`contributor-accounts.json.contributors[${index}] must be an object`);
  }
  const github = String(contributor.github || '').trim();
  const wallet = String(contributor.walletAddress || '').trim();
  if (!github) fail(`contributor-accounts.json.contributors[${index}].github is required`);
  const retain = isRetainInFund(contributor);
  if (contributor.payoutMode !== undefined && !retain) fail(`contributor-accounts.json.contributors[${index}].payoutMode must be "retain-in-fund" when set`);
  if (retain && wallet) fail(`contributor-accounts.json.contributors[${index}] retains credit in the fund and must not have a walletAddress`);
  if (!retain && !ADDRESS_RE.test(wallet)) fail(`contributor-accounts.json.contributors[${index}].walletAddress must be a valid Ethereum address`);
  if (!retain && blockedPayoutReason(wallet)) fail(`contributor-accounts.json.contributors[${index}].walletAddress is blocked: ${blockedPayoutReason(wallet)}`);
  const key = github.toLowerCase();
  if (contributors.has(key)) fail(`duplicate contributor GitHub handle: ${github}`);
  contributors.set(key, retain ? null : wallet.toLowerCase());
}

const seen = new Set();
function validateEntry(entry, section, index) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) fail(`${section}[${index}] must be an object`);
  const issueRef = String(entry.issueRef || '').trim();
  const github = String(entry.contributorGithub || '').trim();
  const wallet = String(entry.contributor || '').trim();
  const amount = String(entry.amount || '').trim();
  const currency = normalizeCurrency(entry);
  const role = String(entry.role || 'contributor').trim().toLowerCase();
  const queuedAt = String(entry.queuedAt || '').trim();

  if (!ISSUE_REF_RE.test(issueRef)) fail(`${section}[${index}].issueRef must look like owner/repo#123`);
  if (!github) fail(`${section}[${index}].contributorGithub is required`);
  if (section === 'retained') {
    if (wallet) fail(`${section}[${index}].contributor must be omitted for retained credit`);
    if (entry.retainedInFund !== true) fail(`${section}[${index}].retainedInFund must be true`);
  } else if (!ADDRESS_RE.test(wallet)) fail(`${section}[${index}].contributor must be a valid Ethereum address`);
  if (section === 'pending' && blockedPayoutReason(wallet)) fail(`${section}[${index}].contributor is blocked: ${blockedPayoutReason(wallet)}`);
  if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) fail(`${section}[${index}].amount must be positive`);
  if (!VALID_CURRENCIES.has(currency)) fail(`${section}[${index}].currency must be configured in payroll-assets.json or be legacy ETH`);
  if (SUPPORTED_CURRENCIES.includes(currency)) {
    try { normalizeAmount(amount, currency); } catch (error) { fail(`${section}[${index}].amount is invalid for ${currency}: ${error.message}`); }
    if (entry.fund !== DBUSK_REPO_FUND) fail(`${section}[${index}].fund must be ${DBUSK_REPO_FUND}`);
  }
  if (!entry.currency && Date.parse(queuedAt) >= LEGACY_CUTOFF) fail(`${section}[${index}].currency is required for new entries`);
  if (!SUPPORTED_ROLES.has(role)) fail(`${section}[${index}].role is not supported: ${role}`);

  const key = `${issueRef}:${github.toLowerCase()}:${role}:${currency}`;
  if (seen.has(key)) fail(`duplicate payroll entry detected for ${issueRef} / ${github} / ${currency}`);
  seen.add(key);
  if (!contributors.has(github.toLowerCase())) fail(`${section}[${index}].contributorGithub is not registered in contributor-accounts.json`);
  const registeredWallet = contributors.get(github.toLowerCase());
  if (section !== 'retained' && registeredWallet === null) fail(`${section}[${index}] cannot be paid: ${github} retains credit in the fund`);
  if (section !== 'retained' && registeredWallet !== wallet.toLowerCase()) fail(`${section}[${index}].contributor does not match the registered wallet for ${github}`);
  if (section === 'retained' && registeredWallet !== null) fail(`${section}[${index}].contributorGithub must use payoutMode "retain-in-fund"`);

  if (!queuedAt) fail(`${section}[${index}].queuedAt is required`);
  if (!String(entry.queuedBy || '').trim()) fail(`${section}[${index}].queuedBy is required`);
  if (section === 'settled') {
    if (!String(entry.settledAt || '').trim()) fail(`${section}[${index}].settledAt is required`);
    if (!String(entry.settledBy || '').trim()) fail(`${section}[${index}].settledBy is required`);
  }
  if (section === 'retained') {
    if (!String(entry.retainedAt || '').trim()) fail(`${section}[${index}].retainedAt is required`);
    if (!String(entry.retainedBy || '').trim()) fail(`${section}[${index}].retainedBy is required`);
  }
}

queue.pending.forEach((entry, index) => validateEntry(entry, 'pending', index));
queue.settled.forEach((entry, index) => validateEntry(entry, 'settled', index));
queue.retained.forEach((entry, index) => validateEntry(entry, 'retained', index));
console.log(`✅ payroll-queue.json and contributor-accounts.json validated (${queue.pending.length} pending, ${queue.settled.length} settled, ${queue.retained.length} retained in fund; currency-less entries treated as legacy ETH)`);
