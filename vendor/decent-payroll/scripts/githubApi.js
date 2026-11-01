const API_ROOT = 'https://api.github.com';

function repositoryCoordinates() {
  const [owner, repo] = String(process.env.GITHUB_REPOSITORY || '').split('/');
  if (!owner || !repo) throw new Error('GITHUB_REPOSITORY must be owner/repo');
  return { owner, repo };
}

async function githubRequest(route, options = {}) {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is required');
  const response = await fetch(`${API_ROOT}${route}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${options.method || 'GET'} ${route} failed (${response.status}): ${await response.text()}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function postIssueComment(owner, repo, issueNumber, body) {
  try {
    await githubRequest(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
  } catch (error) {
    console.warn(`Could not comment on issue #${issueNumber}: ${error.message}`);
  }
}

module.exports = { githubRequest, postIssueComment, repositoryCoordinates };