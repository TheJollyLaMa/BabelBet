# Receiving need and committed-source reuse

## 2026-11-07 header rollout

The receiving base is the existing preparation worktree at
`e06528e0ba9c33a8afe06a1785dac5dfe85aa221`, not old main. Rechecked
DecentHead `00691c4fe93fd280f5aec780bdc4fac651bfcdb1`: the supported manifest
matches the earlier `426ccb7` vendor except the three documented host-bridge
patches. Kept `WalletSession`, `DecentHead.on`, `IPFSControls`, and
`createPreparationIPFSHost`; adapted host-only controls to permit unverified
provider selection without credentials or network. Local profile import/export
remains local, with no public profile upload or UCAN authorization. The earlier
radio widget is removed from this rollout; prior radio notes below are historical.
Receiving `npm test` and inactive `npm run payroll:validate` run offline; no
deployment, provider connection, storage durability or financial activation is
claimed.

The follow-up functional-connect acceptance adapts the explicit shared
`IPFSSession.verifyConnection()` flow and probe UI from canonical DecentHead
`00691c4`. Personal credential memory is permitted solely for explicit fixed-endpoint
Pinata authentication; Kubo uses credential-free loopback version reads.
`IPFSStatus` displays ready only after a valid probe response, never from
selection. Local backup remains private files, public uploads/pins/rewards
unavailable. Receiving `test/provider-connect.browser.cjs` exercises actual
preparation CSP with synthetic401/network/ready/Kubo responses and no uploads.

Need: safely retire legacy provider/wagering execution and deliver a truthful
preparation-only shared Decent experience, with existing payroll tools rigged but
inactive. Acceptance: receiving offline tests verify entrypoint denial, safe
serving, optional wallet, local privacy, consent/tutorial gates and exact receipt
proof; no live provider/RPC/radio tests.

Search scope: DecentCanopy `data/agency-map.json` curated offers/needs/evidence;
committed `origin/main` source from DecentHead, DecentBusking, BigNuten_Vanilla and
DecentCanopy; receiving HEAD/worktree status and historical README/source.
These four pins were resolved before implementation; later origin movement does
not silently update vendors. Original dirty BabelBet checkout is untouched.

| Donor / exact commit | Source | Decision / incompatibility |
| --- | --- | --- |
| DecentHead `426ccb7ad8de658cda374b11ebc4b544b35257e6` | `js/main.js`, `wallet.js` / `wallet-logic.js`, `ipfs-host.js`, header components, supported adoption manifest | Vendor supported 2.0.0 with relative module/asset paths and notices. ENS disabled. Three explicit component patches add host-only config, menu event and public About opener; exact originals preserved separately. Shared facade/wallet/IPFS modules are unchanged; adapter exposes real local-profile export/import. Public publishing remains unconfigured and requires reviewed capability/consent/CSP rather than a blanket permanent facade disable. See `DecentHead-Host-Bridge.md`. |
| DecentBusking `bf852757d23f7c088ef78e9b49261bcad7a9583a` | `scripts/payroll.js`, `processMergedBounty.js`, `validatePayrollQueue.js`, `settlePayroll.js`, `githubApi.js`, `commentArt.js`; `discord-bot/payment-ledger.js`, `rpc-failover.js` | Reuse existing accrual/validation/receipt logic; adapt exact repository identity and inactive/protected-steward gates. Keep immutable source/notices. Do **not** copy accounts/assets/queue values, budgets, router/RPC/wallet/deployment settings. Receipt verification is retained, not weakened. |
| DecentCanopy `bcf2572e57f0a934a4590af83fb5c9b5b805adbf` | `data/agency-map.json`, `scripts/canopy-radio.js` | Curated lead plus mount/destroy pattern; do not copy its auto-mount bootstrap. Actual standalone `A-Decent-Agency/DBuskRadio` widget pin `1fe9ed0c2afc61552328fdda10d0f199bc3eaee9`. Dynamic import only after consent; module unavailable/retry/cleanup states. |
| BigNuten_Vanilla `7bac130d393f390dd2d3a8aca0a38db9e89c5d47` | `scripts/payroll.js`, `settlePayroll.js`, `js/ipfsHostAdapter.js` | Inspected patterns; select supported Head host adapter and Busking exact router-event verifier. Browser API-key/helper patterns and weaker receipt checks are not reused. |

New host-specific code is only a static preparation surface, strict local profile
schema, tutorial, contextual menu binding and consent radio lifecycle. No shared
extraction for speculative consumers, provider engine, lifecycle/oracle/contracts
or browser keys. Runtime is Node's HTTP/fs, optional server-only ethers for future
receipt verification; donor Discord/game/AI dependencies are not installed. The server-side receipt package
uses ethers 6.17.0 (compatible 6.x API) to avoid the older package's vulnerable
WebSocket dependency; DecentHead's byte-pinned browser ethers vendor is unchanged.

Future helper parity is docs-only: committed Busking `agent-service/server.mjs`,
`model.mjs`, `routing.mjs` and tests identify a generic server-side boundary.
Private handoff routing/context/deployment, external AI endpoints and keys are
excluded. Nothing is activated.

Apache-2.0 LICENSE and NOTICE are retained with code; CC BY 4.0 terms remain for
donor art/docs. Original BabelBet license/NOTICE are unchanged. Historical source
from 95a151d is byte-preserved as `.source`; contracts/docs are historical only.
Candidate reuse is not deployment or live integration. No public Canopy inventory
change is included here, and no private finding is published.

## Receiving verification (2026-11-01)

`npm test`: **16/16 passing**, including real local Chromium integration with
external requests denied, an injected EIP-6963 wallet and a locally fulfilled
radio module; strict profile consent/import/export; disabled legacy JS/Python
entrypoints even with unsafe old flags; and exact synthetic canonical receipt
proofs with mismatch/replay rejection. No provider, live RPC, CDN, radio worker,
stream or AI endpoint was contacted by these tests.

`npm run payroll:validate` passes the inactive empty schema. `npm audit
--audit-level=moderate` reports **0 vulnerabilities**. `git diff --check` and
modified-runtime syntax checks pass. Actual `npm start`, `npm run dev` and
`node index.js` were responsive on localhost with old watcher/provider/payout
flags set: `/health` reported providerAccess false / wagering false and legacy
routes returned 410. All three smoke-test servers were stopped and confirmed
unresponsive afterward. Original LICENSE/NOTICE and all 69 historical archived
files were byte-compared with receiving 95a151d.

Blockers by design: no written provider permission/integration, no IPFS public
upload/pinning/reward configuration, no assistant, no private contributor
registration/approved budgets, no router/RPC/assets or protected-environment
financial activation. External radio availability is opt-in at runtime, not
live-tested or guaranteed. No app deployment, payout, merge or source-verification
claim is made.
