# Accepted preparation work, private registration and receipts

Participation is free and a wallet/provider account is not required. Scope and
acceptance live in issues #2/#3/#4. Agree on accepted work and any approved budget
with a steward before accrual; review/merge alone is not a payment promise.

Request a steward-established private registration channel. Never place payout
addresses, personal data, credentials or secrets in public issues or profile
exports. Only minimum consented payout identity may be registered. Explain that
future on-chain payments and receipts expose payout addresses permanently.
No donor contributor roster or private registration is included.

## Current state and commands

- `contributor-accounts.json`: empty contributors.
- `payroll-assets.json`: activated false; empty assets; no router, RPC or wallets.
- `payroll-queue.json`: empty pending/settled/retained.
- `npm run payroll:validate`: offline inactive-state validation.
- `npm run payroll:merge` and `npm run payroll:settle`: reject inactive config.

Existing DecentBusking `createBountyEntries`, accrual, merge parsing, validation
and settlement logic is adapted, not a newly invented payroll engine. Immutable
donor files and notices are in `vendor/decent-payroll/`. Supported adapters are
`scripts/` and `payroll-runtime/`.

## Explicit future activation gates

There is **no financial activation now**. A separate steward-reviewed change must
configure an approved Base router, token assets, consented private accounts and
HTTPS RPC. Set `activated: true` only in that reviewed change.
`BABELBET_PAYROLL_ENABLED=true`, `GITHUB_ACTIONS=true`, exact repository
`TheJollyLaMa/BabelBet` and named steward `TheJollyLaMa` are also checked by
`scripts/payrollGate.js`.

Create the protected `steward-payroll` Actions environment with required steward
reviewers and main-only deployment branch rules; keep the repository/environment
activation variable unset until approval. Environment protection must be set in
GitHub, not assumed from YAML. The merge workflow runs only after main merges (or
steward manual dispatch), checks out main rather than untrusted PR heads, and
uses the existing merge parser. Queue writes require explicit steward activation.

After activation, validation runs before and after workflow mutation. Queue
writers share concurrency. Repository protection permitting these exact bot
writes must be reviewed; a refused push is an error, not a delivered accrual.
No private identities should be committed without informed approval.

## Exact receipt settlement, never sending funds

Manual settlement requires the protected environment and named steward. It reads
an already-confirmed transaction. The adapted donor `verifyRepositoryPayment`
requires Base 8453, a successful receipt, two confirmations, canonical block hash,
one exact `PayrollPaid` event from the configured router, and matching fund,
asset, recipient, amount, work reference, repository and contributor hashes.
Wrong network/router/recipient/asset/amount/hash, orphaned block, duplicate event
or missing proof is rejected. The receiving settlement boundary additionally
rejects duplicate or previously settled work identities before verification;
the existing `settleEntries` moves only selected pending entries.

No signer/private key or transfer operation exists in the supported settlement
workflow. Offline tests inject receipt/RPC fixtures. No live endpoint, payout,
budget, router deployment or source verification has been run or claimed.
Payroll gates do not enable Duolingo, challenges, email, wagering or assistants.
