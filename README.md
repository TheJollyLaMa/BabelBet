# BabelBet · preparation-only Decent language bridge

Free participation, thoughtful language preparation, optional wallet session,
private local profile files and accessible bunny-hop orientation.
**This is not a new game or wagering build.**

All official **and** unofficial Duolingo access, watcher/provider loading,
challenge/email/stake/payout runtime, deployment migrations and legacy consoles
are disabled. No old environment flag can restore them. Supported HTTP paths
serve only `prep/`; historical routes return 410 and mutations return 405.
Legacy JavaScript/Python entrypoints fail closed. Historical contracts, art,
documents, LICENSE and NOTICE remain; exact historical runtime source is archived
as non-executable `history/*.source` from `origin/main` **95a151d**.

## Run and validate

Node 22 or later:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npx playwright install chromium # one-time local browser-test prerequisite
npm start                   # http://127.0.0.1:8888
npm run dev                 # same preparation-only server
npm test                    # deterministic receiving tests; no live provider requests
npm run payroll:validate    # inactive empty schema validation
```

`PORT` / `HOST` only control the HTTP bind. Prefer localhost; no public deployment
is performed or implied. `node index.js` starts the same safe server.
Wallet connection is optional; it requests account access/Base network only,
never a signature or payment. ENS is disabled. Profiles stay in tab memory unless
explicitly saved locally, and export/import only validated plaintext local JSON.
Shared IPFS host controls expose working local-profile backup/restore and report
public upload/pinning/rewards unconfigured; provider selection is unverified and
does not establish storage.
Personal credentials are now accepted only in tab memory for the explicit
shared read-only connection check; no credential is bundled, logged or saved.
The shared facade is unchanged. Three explicit component host-bridge patches,
upstream limitations and future consent/config-gated publishing are documented in
[the host bridge](wiki/DecentHead-Host-Bridge.md).
No assistant or browser API key pattern is enabled.

The earlier opt-in radio widget is not mounted or served in this rollout.

Provider verification adapts the shared `IPFSSession.verifyConnection()` flow
and probe UI from the canonical DecentHead adoption at
`00691c4fe93fd280f5aec780bdc4fac651bfcdb1`. CSP permits only the exact Pinata
HTTPS authentication and loopback Kubo version endpoints, not uploads/pins.
`IPFSStatus` shows ready only after a successful explicit connectivity probe.
This does not verify backup, upload permissions, retention or rewards.
Local-profile import/export remains local files; UCAN is unimplemented.

`node test/provider-connect.browser.cjs` starts/stops its own preparation server
and tests actual CSP, synthetic Pinata401/network/ready and Kubo version
responses at 375px, with no automatic probes, upload/pin or credential leakage.

## Stewards, accepted work and future receipts

Participation is free. Accepted preparation work requires scope agreement and
steward review; a merged PR alone does not promise payment. Arrange contributor
registration privately. Never put payout addresses or secrets in public issues,
browser profiles or published snapshots.

The existing Decent accepted-work merge pipeline, validation and exact
`PayrollPaid` receipt verifier are adapted, but **inactive**:
`contributor-accounts.json`, `payroll-assets.json.assets`, and
`payroll-queue.json` are empty; no budgets, wallets, RPCs or deployment addresses
were copied. Named-steward Actions identity, repository activation, protected
`steward-payroll` environment approval and reviewed financial configuration are
required. CLI commands `npm run payroll:merge` / `npm run payroll:settle` refuse
current configuration, even with old flags or new environment gates set.
Receipt settlement records proven prior payment; it never sends funds.
Provider access and wagering have no activation gate.

## Guides and issues

- [In-app preparation/about/tutorial guide](prep/guide.html)
- [Preparation scope](wiki/Preparation.md)
- [Strict future provider etiquette](wiki/Provider-Etiquette.md)
- [Accepted work / payroll gates / private registration](wiki/Development-Payroll.md)
- [Exact donor provenance and reuse decision](wiki/Reuse-First.md)
- [Agent commands and safety](AGENTS.md)
- Public scope: [#2 experience](https://github.com/TheJollyLaMa/BabelBet/issues/2),
  [#3 payroll / etiquette](https://github.com/TheJollyLaMa/BabelBet/issues/3),
  [#4 oversight](https://github.com/TheJollyLaMa/BabelBet/issues/4).

Original Apache-2.0 LICENSE / NOTICE and CC BY 4.0 art/docs terms are unchanged.
Donor notices are included with immutable vendor source.
