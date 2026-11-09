const fs = require('fs');
const path = require('path');

const { applyAccountAccrual, applyRetainedAccrual, createBountyEntries, extractIssueNumbers } = require('./payroll');
const { renderArtFiComment } = require('./commentArt');
const { githubRequest, postIssueComment, repositoryCoordinates } = require('./githubApi');

const ROOT = path.resolve(__dirname, '..');
const QUEUE_PATH = path.join(ROOT, 'payroll-queue.json');
const ACCOUNTS_PATH = path.join(ROOT, 'contributor-accounts.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function buildMergedPayrollComment({ entries, retained = [], isManual, prNumber, issueNumber }) {
  const lines = entries.map(entry =>
    `- **${entry.amount} ${entry.currency || 'ART'}** from ${entry.fund || 'dbusk-repo-dev'} to @${entry.contributorGithub}${entry.role ? ` (${entry.role})` : ''}`
  );
  const retainedLines = retained.map(entry =>
    `- **${entry.amount} ${entry.currency || 'ART'}** credited to @${entry.contributorGithub}${entry.role ? ` (${entry.role})` : ''} stays in ${entry.fund || 'dbusk-repo-dev'}`
  );
  return renderArtFiComment([
    `✅ Payroll ${entries.length ? 'queued' : 'recorded'} from ${isManual ? 'manual recovery for' : 'merged'} PR #${prNumber}:`,
    '',
    ...lines,
    ...(retainedLines.length ? [...(lines.length ? [''] : []), ...retainedLines] : []),
    '',
    ...(lines.length ? ['The entries are queued for settlement from the dbusk-repo-dev fund on the shared Base Settlement Router.'] : []),
    ...(retainedLines.length ? ['Retained credit is not paid out; it remains in the repo-dev fund for future contributor payroll.'] : []),
  ].join('\n'), issueNumber, 'merged-payroll');
}

function canQueueMergedPullRequest(pr) {
  return pr?.merged === true;
}

async function linkedIssueNumbers(owner, repo, prNumber) {
  const data = await githubRequest('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query($owner: String!, $repo: String!, $pr: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $pr) {
            closingIssuesReferences(first: 50) { nodes { number } }
          }
        }
      }`,
      variables: { owner, repo, pr: prNumber },
    }),
  });
  if (data.errors) throw new Error(`GitHub GraphQL failed: ${JSON.stringify(data.errors)}`);
  return data.data.repository.pullRequest.closingIssuesReferences.nodes.map(node => node.number);
}

async function main() {
  const { owner, repo } = repositoryCoordinates();
  const event = readJson(process.env.GITHUB_EVENT_PATH);
  const manualPrNumber = Number(process.env.INPUT_PR_NUMBER || 0);
  const manualIssueNumbers = String(process.env.INPUT_ISSUE_NUMBER || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  const isManual = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
  const pr = event.pull_request || (manualPrNumber
    ? await githubRequest(`/repos/${owner}/${repo}/pulls/${manualPrNumber}`)
    : null);

  if (!pr) throw new Error('A pull request payload or pr_number input is required');
  if (!canQueueMergedPullRequest(pr)) {
    if (isManual) {
      throw new Error(`PR #${pr.number} has not been merged; refusing manual payroll recovery.`);
    }
    console.log(`PR #${pr.number} was closed without merge; no payout was queued.`);
    return;
  }

  let linked = [];
  try {
    linked = await linkedIssueNumbers(owner, repo, pr.number);
  } catch (error) {
    console.warn(`Could not load GitHub-linked closing issues: ${error.message}`);
  }
  const issueNumbers = extractIssueNumbers({
    body: pr.body || '',
    title: pr.title || '',
    linked,
    override: manualIssueNumbers,
  });
  if (issueNumbers.length === 0) {
    console.log(`PR #${pr.number} has no issue references in its body, title, or GitHub closing links.`);
    return;
  }

  const queue = readJson(QUEUE_PATH);
  const accounts = readJson(ACCOUNTS_PATH);
  if (!Array.isArray(queue.pending)) queue.pending = [];
  if (!Array.isArray(queue.settled)) queue.settled = [];
  if (!Array.isArray(queue.retained)) queue.retained = [];
  if (!Array.isArray(accounts.contributors)) accounts.contributors = [];

  const planned = [];
  const plannedRetained = [];
  const results = [];
  for (const issueNumber of issueNumbers) {
    const issue = await githubRequest(`/repos/${owner}/${repo}/issues/${issueNumber}`);
    if (issue.pull_request) continue;
    const result = createBountyEntries({
      issue,
      pr,
      accounts,
      queue: { pending: [...queue.pending, ...planned], settled: queue.settled, retained: [...queue.retained, ...plannedRetained] },
      repoSlug: `${owner}/${repo}`,
      queuedAt: new Date().toISOString(),
      queuedBy: process.env.GITHUB_ACTOR || 'github-actions[bot]',
    });
    if (result.reason === 'missing-bounty-label') {
      console.log(`Skipping issue #${issueNumber}: no supported "bounty: <amount> SYMBOL" label.`);
      continue;
    }
    if (isManual) [...result.entries, ...result.retained].forEach(entry => { entry.retroactive = true; });
    result.retained.forEach(entry => { entry.retainedAt = entry.queuedAt; entry.retainedBy = entry.queuedBy; });
    planned.push(...result.entries);
    plannedRetained.push(...result.retained);
    results.push({ issueNumber, result });
  }

  if (planned.length === 0 && plannedRetained.length === 0) {
    console.log('No new payroll entries were needed.');
    return;
  }
  queue.pending.push(...planned);
  queue.retained.push(...plannedRetained);
  applyAccountAccrual(accounts, planned);
  applyRetainedAccrual(accounts, plannedRetained);
  writeJson(QUEUE_PATH, queue);
  writeJson(ACCOUNTS_PATH, accounts);

  for (const { issueNumber, result } of results) {
    if (result.entries.length === 0 && result.retained.length === 0) continue;
    await postIssueComment(owner, repo, issueNumber, buildMergedPayrollComment({
      entries: result.entries,
      retained: result.retained,
      isManual,
      prNumber: pr.number,
      issueNumber,
    }));
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Payroll queue updated\n\nQueued ${planned.length} token payout entries (${plannedRetained.length} retained in fund) from PR #${pr.number}.\n`);
  }
  console.log(`Queued ${planned.length} token payout entries (${plannedRetained.length} retained in fund) from PR #${pr.number}.`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

module.exports = { buildMergedPayrollComment, canQueueMergedPullRequest };