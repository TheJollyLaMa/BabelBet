const PAYROLL_ASSET_CONFIG = require('../payroll-assets.json');
const SUPPORTED_CURRENCIES = Object.keys(PAYROLL_ASSET_CONFIG.assets || {});
const BOUNTY_LABEL_RE = /^bounty:\s*(\d+(?:\.\d+)?)\s*\$?([A-Za-z][A-Za-z0-9]{1,9})$/i;
const TEST_BOUNTY_LABEL_RE = /^test-bounty:\s*(\d+(?:\.\d+)?)\s*\$?([A-Za-z][A-Za-z0-9]{1,9})$/i;
const IDEA_CREDIT_LABEL_RE = /^idea-credit:\s*@?([-\w]+)$/i;
const CLOSING_ISSUE_RE = /(?:closes?|fixes?|resolves?)\s+(?:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)?#(\d+)/gi;
const TITLE_ISSUE_RE = /#(\d+)/g;
const AMOUNT_RE = /^\d+(?:\.\d+)?$/;
const LEGACY_CURRENCIES = PAYROLL_ASSET_CONFIG.legacy || {};
const DBUSK_REPO_FUND = PAYROLL_ASSET_CONFIG.fundSlug;

const CONTRIBUTOR_ALIASES = {
  'copilot-swe-agent': 'copilot',
  'copilot-swe-agent[bot]': 'copilot',
};

function normalizeLogin(login) {
  const value = String(login || '').trim();
  return CONTRIBUTOR_ALIASES[value.toLowerCase()] || value;
}

function normalizeCurrency(entryOrCurrency) {
  const value = typeof entryOrCurrency === 'object'
    ? entryOrCurrency && entryOrCurrency.currency
    : entryOrCurrency;
  return String(value || 'ETH').trim().toUpperCase();
}

function labelNames(issue) {
  return (issue.labels || []).map(label => typeof label === 'string' ? label : label.name);
}

function currencyDecimals(currency = 'ART', assetRegistry = PAYROLL_ASSET_CONFIG.assets) {
  const symbol = String(currency || 'ART').toUpperCase();
  const decimals = assetRegistry?.[symbol]?.ledgerDecimals ?? LEGACY_CURRENCIES[symbol]?.ledgerDecimals;
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new Error(`Unsupported payroll currency: ${currency}`);
  }
  return decimals;
}

function normalizeAmount(value, currency = 'ART', assetRegistry = PAYROLL_ASSET_CONFIG.assets) {
  const input = String(value).trim();
  if (!AMOUNT_RE.test(input)) throw new Error(`Invalid payout amount: ${value}`);

  let [whole, fraction = ''] = input.split('.');
  whole = whole.replace(/^0+(?=\d)/, '');
  fraction = fraction.replace(/0+$/, '');
  const decimals = currencyDecimals(currency, assetRegistry);
  if (fraction.length > decimals) {
    throw new Error(`${String(currency).toUpperCase()} payouts support at most ${decimals} decimal places: ${value}`);
  }
  if (BigInt(`${whole}${fraction}` || '0') <= 0n) throw new Error(`Invalid payout amount: ${value}`);
  return fraction ? `${whole}.${fraction}` : whole;
}

function parseAmountLabel(issue, pattern = BOUNTY_LABEL_RE, assetRegistry = PAYROLL_ASSET_CONFIG.assets) {
  for (const label of labelNames(issue)) {
    const match = String(label || '').match(pattern);
    if (match) {
      const currency = String(match[2] || 'ART').toUpperCase();
      if (!assetRegistry?.[currency]) continue;
      return { label, amount: normalizeAmount(match[1], currency, assetRegistry), currency };
    }
  }
  return null;
}

function parseAmountLabels(issue, pattern = BOUNTY_LABEL_RE, assetRegistry = PAYROLL_ASSET_CONFIG.assets) {
  const bounties = new Map();
  for (const label of labelNames(issue)) {
    const match = String(label || '').match(pattern);
    if (!match) continue;
    const currency = String(match[2] || 'ART').toUpperCase();
    if (!assetRegistry?.[currency]) continue;
    if (bounties.has(currency)) throw new Error(`Issue has more than one ${currency} bounty label`);
    bounties.set(currency, { label, amount: normalizeAmount(match[1], currency, assetRegistry), currency });
  }
  return [...bounties.values()];
}

function parseIdeaCredit(issue) {
  for (const label of labelNames(issue)) {
    const match = String(label || '').match(IDEA_CREDIT_LABEL_RE);
    if (match) return normalizeLogin(match[1]);
  }
  return null;
}

function extractIssueNumbers({ body = '', title = '', linked = [], override = [] } = {}) {
  const numbers = new Set();
  for (const value of override) {
    const number = Number(value);
    if (Number.isInteger(number) && number > 0) numbers.add(number);
  }
  for (const match of String(body).matchAll(CLOSING_ISSUE_RE)) numbers.add(Number(match[1]));
  for (const match of String(title).matchAll(TITLE_ISSUE_RE)) numbers.add(Number(match[1]));
  for (const value of linked) {
    const number = Number(value);
    if (Number.isInteger(number) && number > 0) numbers.add(number);
  }
  return [...numbers];
}

function amountToUnits(value, currency = 'ART', assetRegistry = PAYROLL_ASSET_CONFIG.assets) {
  if (/^0(?:\.0+)?$/.test(String(value).trim())) return 0n;
  const normalized = normalizeAmount(value, currency, assetRegistry);
  const [whole, fraction = ''] = normalized.split('.');
  const decimals = currencyDecimals(currency, assetRegistry);
  const scale = 10n ** BigInt(decimals);
  return BigInt(whole) * scale + BigInt(fraction.padEnd(decimals, '0') || '0');
}

function unitsToAmount(units, currency = 'ART', assetRegistry = PAYROLL_ASSET_CONFIG.assets) {
  const decimals = currencyDecimals(currency, assetRegistry);
  const scale = 10n ** BigInt(decimals);
  const whole = units / scale;
  const fraction = (units % scale).toString().padStart(decimals, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : String(whole);
}

function splitIdeaCredit(amount, currency = 'ART', assetRegistry = PAYROLL_ASSET_CONFIG.assets) {
  const units = amountToUnits(amount, currency, assetRegistry);
  const decimals = currencyDecimals(currency, assetRegistry);
  if (units % 5n !== 0n) {
    throw new Error(`Payout amount cannot be split exactly at ${decimals} decimal places: ${amount}`);
  }
  const originatorUnits = units / 5n;
  return {
    implementer: unitsToAmount(units - originatorUnits, currency, assetRegistry),
    originator: unitsToAmount(originatorUnits, currency, assetRegistry),
  };
}

function findAccount(accounts, login) {
  const normalized = normalizeLogin(login).toLowerCase();
  return (accounts.contributors || []).find(
    account => String(account.github || '').trim().toLowerCase() === normalized
  );
}

// Accounts whose bounties are never paid out; the amount stays in the repo-dev fund.
function isRetainInFund(account) {
  return String(account?.payoutMode || '').trim().toLowerCase() === 'retain-in-fund';
}

function blockedPayoutReason(address, config = PAYROLL_ASSET_CONFIG) {
  const normalized = String(address || '').trim().toLowerCase();
  if (!normalized) return null;
  const match = (config.blockedPayoutAddresses || [])
    .find(item => String(item.address || '').trim().toLowerCase() === normalized);
  return match ? (match.reason || 'blocked payout address') : null;
}

function requireWhitelistedAccount(accounts, candidates, description) {
  for (const login of candidates) {
    const account = findAccount(accounts, login);
    if (account && (String(account.walletAddress || '').trim() || isRetainInFund(account))) return account;
  }
  throw new Error(`No whitelisted wallet found for ${description}: ${candidates.filter(Boolean).join(', ') || 'none'}`);
}

function entryRole(entry) {
  return String(entry.role || 'contributor').toLowerCase();
}

function isDuplicate(queue, candidate) {
  const candidateIssueRef = String(candidate.issueRef || '').trim();
  const candidateGithub = String(candidate.contributorGithub || '').trim().toLowerCase();
  const candidateRole = entryRole(candidate);
  const candidateCurrency = normalizeCurrency(candidate);

  return [...(queue.pending || []), ...(queue.settled || []), ...(queue.retained || [])].some(entry => {
    if (String(entry.issueRef || '').trim() !== candidateIssueRef) return false;
    if (normalizeCurrency(entry) !== candidateCurrency) return false;

    const entryGithub = String(entry.contributorGithub || '').trim().toLowerCase();
    const entryRoleName = entryRole(entry);
    if (entryGithub === candidateGithub) return true;
    if (candidateRole === 'contributor') return false;
    return (entryRoleName === 'implementer' || entryRoleName === 'idea-originator') &&
      (candidateRole === 'implementer' || candidateRole === 'idea-originator');
  });
}

function pickWhitelistedTester({ assigneeLogins = [], accounts, commenter = '' } = {}) {
  const eligible = assigneeLogins
    .map(login => normalizeLogin(login))
    .filter(Boolean)
    .map(login => findAccount(accounts, login))
    .filter(account => account && String(account.walletAddress || '').trim());

  if (eligible.length === 0) throw new Error('No assigned tester on this issue has a whitelisted wallet.');

  const commenterKey = normalizeLogin(commenter).toLowerCase();
  const commenterMatch = eligible.find(
    account => String(account.github || '').trim().toLowerCase() === commenterKey
  );
  if (commenterMatch) return commenterMatch;
  if (eligible.length > 1) {
    throw new Error(`Multiple assigned testers have whitelisted wallets: ${eligible.map(account => account.github).join(', ')}`);
  }
  return eligible[0];
}

function createBountyEntries({ issue, pr, accounts, queue, repoSlug, queuedAt, queuedBy, assetRegistry = PAYROLL_ASSET_CONFIG.assets }) {
  const bounties = parseAmountLabels(issue, BOUNTY_LABEL_RE, assetRegistry);
  if (!bounties.length) return { entries: [], reason: 'missing-bounty-label' };

  const prAuthor = normalizeLogin(pr.user && pr.user.login);
  const assignees = (issue.assignees || []).map(assignee => normalizeLogin(assignee.login));
  const implementer = requireWhitelistedAccount(
    accounts,
    [...new Set([prAuthor, ...assignees].filter(Boolean))],
    'PR author or issue assignee'
  );
  const ideaOriginatorLogin = parseIdeaCredit(issue);
  const issueRef = `${repoSlug}#${issue.number}`;
  const originator = ideaOriginatorLogin
    ? requireWhitelistedAccount(accounts, [ideaOriginatorLogin], 'idea originator')
    : null;
  const entries = [];
  for (const bounty of bounties) {
    const common = {
      issueRef,
      currency: bounty.currency,
      fund: PAYROLL_ASSET_CONFIG.fundSlug,
      queuedAt,
      queuedBy,
      prNumber: pr.number,
    };
    const forAccount = (account, fields) => {
      if (isRetainInFund(account)) return { ...common, contributorGithub: account.github, ...fields, retainedInFund: true };
      const blocked = blockedPayoutReason(account.walletAddress);
      if (blocked) throw new Error(`Refusing to queue a payout for @${account.github}: ${blocked}`);
      return { ...common, contributor: account.walletAddress, contributorGithub: account.github, ...fields };
    };
    if (originator) {
      const split = splitIdeaCredit(bounty.amount, bounty.currency, assetRegistry);
      entries.push(
        forAccount(implementer, { amount: split.implementer, role: 'implementer' }),
        forAccount(originator, { amount: split.originator, role: 'idea-originator' }),
      );
    } else {
      entries.push(forAccount(implementer, { amount: bounty.amount }));
    }
  }

  const fresh = entries.filter(entry => !isDuplicate(queue, entry));
  const newEntries = fresh.filter(entry => !entry.retainedInFund);
  const retained = fresh.filter(entry => entry.retainedInFund);
  return {
    entries: newEntries,
    retained,
    skippedDuplicates: entries.length - fresh.length,
    bountyLabel: bounties.map(bounty => bounty.label).join(', '),
  };
}

function accountField(currency, suffix) {
  return `${currency.toLowerCase()}${suffix}`;
}

function updateAccountTotal(account, field, amount, currency, subtract = false) {
  const current = Number(account[field]) || 0;
  const decimals = currencyDecimals(currency);
  const currentUnits = amountToUnits(Math.max(0, current).toFixed(decimals), currency);
  const deltaUnits = amountToUnits(amount, currency);
  const nextUnits = subtract
    ? (currentUnits > deltaUnits ? currentUnits - deltaUnits : 0n)
    : currentUnits + deltaUnits;
  if (nextUnits < 0n) throw new Error(`Payroll balance cannot be negative: ${field}`);
  account[field] = Number(unitsToAmount(nextUnits, currency));
}

function applyAccountAccrual(accounts, entries) {
  for (const entry of entries) {
    const account = findAccount(accounts, entry.contributorGithub);
    if (!account) continue;
    const currency = normalizeCurrency(entry);
    updateAccountTotal(account, accountField(currency, 'Pending'), entry.amount, currency);
    if (!Array.isArray(account.issuesClosed)) account.issuesClosed = [];
    if (!account.issuesClosed.includes(entry.issueRef)) account.issuesClosed.push(entry.issueRef);
    if (entry.role === 'idea-originator') {
      if (!Array.isArray(account.ideasCredited)) account.ideasCredited = [];
      if (!account.ideasCredited.includes(entry.issueRef)) account.ideasCredited.push(entry.issueRef);
    }
  }
}

function applyRetainedAccrual(accounts, entries) {
  for (const entry of entries) {
    const account = findAccount(accounts, entry.contributorGithub);
    if (!account) continue;
    const currency = normalizeCurrency(entry);
    updateAccountTotal(account, accountField(currency, 'RetainedInFund'), entry.amount, currency);
    if (!Array.isArray(account.issuesClosed)) account.issuesClosed = [];
    if (!account.issuesClosed.includes(entry.issueRef)) account.issuesClosed.push(entry.issueRef);
  }
}

function settleEntries({
  queue,
  accounts,
  contributorGithub = '',
  issueRef = '',
  role = '',
  currency = '',
  txHash = '',
  settledAt,
  settledBy,
}) {
  const contributorFilter = String(contributorGithub).trim().toLowerCase();
  const issueFilter = String(issueRef).trim();
  const roleFilter = String(role).trim().toLowerCase();
  const currencyFilter = String(currency).trim().toUpperCase();
  const matches = entry =>
    (!contributorFilter || String(entry.contributorGithub || '').trim().toLowerCase() === contributorFilter) &&
    (!issueFilter || String(entry.issueRef || '').trim() === issueFilter) &&
    (!roleFilter || entryRole(entry) === roleFilter) &&
    (!currencyFilter || normalizeCurrency(entry) === currencyFilter);
  const selected = (queue.pending || []).filter(matches);
  queue.pending = (queue.pending || []).filter(entry => !matches(entry));

  const settled = selected.map(entry => ({
    ...entry,
    settledAt,
    settledBy,
    ...(txHash ? { txHash } : {}),
  }));
  if (!Array.isArray(queue.settled)) queue.settled = [];
  queue.settled.push(...settled);

  for (const entry of settled) {
    const account = findAccount(accounts, entry.contributorGithub);
    if (!account) continue;
    const entryCurrency = normalizeCurrency(entry);
    updateAccountTotal(account, accountField(entryCurrency, 'Pending'), entry.amount, entryCurrency, true);
    updateAccountTotal(account, accountField(entryCurrency, 'Earned'), entry.amount, entryCurrency);
  }
  return settled;
}

module.exports = {
  BOUNTY_LABEL_RE,
  DBUSK_REPO_FUND,
  PAYROLL_ASSET_CONFIG,
  SUPPORTED_CURRENCIES,
  TEST_BOUNTY_LABEL_RE,
  applyAccountAccrual,
  applyRetainedAccrual,
  blockedPayoutReason,
  createBountyEntries,
  isRetainInFund,
  extractIssueNumbers,
  findAccount,
  isDuplicate,
  normalizeAmount,
  parseAmountLabels,
  normalizeCurrency,
  normalizeLogin,
  parseAmountLabel,
  parseIdeaCredit,
  pickWhitelistedTester,
  settleEntries,
  splitIdeaCredit,
};