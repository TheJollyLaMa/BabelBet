# BabelBet preparation workspace

The only supported product is the preparation-only experience in `prep/`.
Node 22+; no build step. Commands from repository root:

- `npm ci --ignore-scripts --no-audit --no-fund`
- `npx playwright install chromium`: one-time browser-test prerequisite; CI uses
  `npx playwright install --with-deps chromium` for its Linux runner.
- `npm start` or `npm run dev`: localhost preparation server, default port 8888.
- `node index.js`: identical safe server.
- `npm test`: local receiving tests with mocked requests/providers only.
- `npm run payroll:validate`: offline schema validation.
- `npm run payroll:merge` / `npm run payroll:settle`: steward-only workflows;
  disabled current configuration. Never activate, fund or run them against live
  services as part of development or tests.

Do not load or restore Duolingo clients (official/unofficial), legacy watchers,
challenge/email/stake/payout code, live endpoints/tests, contracts, migrations,
deployment wallets or consoles. There is no provider/runtime reactivation flag.
`history/*.source` is byte-preserved evidence, not supported executable code.
Existing contracts and historical documents are historical only.

Do not introduce a game, challenge lifecycle, oracle or contract implementation.
Do not expose browser API keys, wallet secrets, credentials or provider accounts.
No assistant activation, private helper handoff/context/deployment copying or
external AI calls. No transfers, deployment, merging or payroll activation without
separate explicit steward approval. Never copy `.env`, donor financial
configuration, contributor rosters, private data or wallet addresses.

Keep participation free; optional wallets never prove admin authority.
Maintain local-profile consent/export/import limits, truthful unavailable states,
keyboard/reduced-motion tutorial and opt-in radio with no autoplay. Stub radio
imports and all RPCs in tests. Stop test servers and helper processes.

Payroll is adapted from pinned DecentBusking source and must retain its exact
Base canonical two-confirmation `PayrollPaid` proof. Accounts/assets/queue start
empty. Activation requires reviewed configuration, explicit environment gate,
named steward and protected Actions environment. Validation must reject dormant
financial data. No receipt-only transfer guesses or new payment engine.

For future provider work, follow `wiki/Provider-Etiquette.md`: written permission
and consent first, minimum data, provider-approved finite rate limits, caching,
capped jittered backoff, circuit breaker and honest outage states. Default
provider request budget is zero. No unofficial fallback.

Use committed donor sources only (`git show <pin>:<path>`); pins and reuse
decisions are in `wiki/Reuse-First.md`. Preserve LICENSE/NOTICE, attribution and
relative vendor imports. Update directly related guides when behavior changes.
The three explicit component host-bridge patches are documented in
`wiki/DecentHead-Host-Bridge.md`; do not silently monkeypatch shared facade methods
or traverse private header shadows in app code. Use the version-1 host adapter,
host-bridge menu event/About method, config and wallet events. Local-profile
backup/restore is available; public IPFS publishing requires separate reviewed
capability configuration, consent and CSP, not a browser key form.
Do not modify other worktrees or dirty originals. A passing local test is not
deployment, source verification, financial activation or a live integration.
