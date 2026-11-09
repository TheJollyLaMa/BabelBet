# Opt-in IPFS host controls (v1)

DecentHead's reusable boundary is a control surface, not a universal data
schema, storage service or rewards program. The host owns its data, selected
provider, serialization, encryption, wallet authorization and explicit
upload/restore/pin/claim confirmation.

In v2, supply `DECENT_CONFIG.ipfsAdapter` before loading the header module.
The provider choices are always available, and adapter capabilities are opt-in.
No capability is inferred from provider selection. Mounting or opening the
header does not request credentials, inspect local storage, upload, or connect
a wallet. `enableIPFS: false` hides the left button.

The shared provider session supports Pinata and local Kubo; a host panel may
use `window.DecentHead.getIpfs()` or retain its own provider. The header does
not assume a host-owned provider has switched when the shared provider changes.
See [ADOPTING.md](ADOPTING.md) for data hooks and provider configuration.

`getIpfs().verifyConnection()` is an explicit read-only connection check, never
called on mount or provider selection. Pinata uses the fixed HTTPS
`/data/testAuthentication` endpoint with the user's personal credential in
headers; Kubo uses POST `/api/v0/version` on a credential-free loopback endpoint
and never receives Pinata headers. Both reject redirects and time out after
15 seconds. HTTP errors, invalid response shapes and network/CORS failures
remain errors. Snapshots expose `connection.state` (`unverified`, `checking`,
`ready`, `error`) and a credential-free detail, not credentials. Configuration
changes reset verification and stale checks cannot verify a different provider.
`ready` describes only authentication/version response, not storage retention,
upload permissions, rewards or remotely enforced UCAN. Shared-provider
verification does not verify a separate host-owned storage transport.

## Contract

```js
window.DECENT_CONFIG = {
  ...window.DECENT_CONFIG,
  ipfsAdapter: {
    version: 1,
    label: 'My app',
    capabilities: {
      backup: { open: () => openMyBackupPanel() },
      replication: { open: () => openMyPublicPinningDialog() },
      // Omit rewards until this app has its own participation/eligibility UI.
    },
    getStatus: async () => ({
      backup: { state: 'idle', detail: 'Local data only; choose a provider in app controls.' },
      replication: { state: 'ready', detail: 'A public manifest is available; nothing has been pinned by this action.' },
    }),
  },
};
```

This is an interface example, not a configured provider. The two `openMy...`
functions must exist in the host. Configure it in a module that loads the host
controls before importing `js/main.js`; do not leave a second main script
racing that initialization. The adapter may also be assigned directly to a
standalone `<ipfs-controls>` element before appending it to the document.

Supported capabilities:

| Key | Responsibility |
| --- | --- |
| `backup` | Host panel chooses hosted Pinata, personal provider or local Kubo; explicit save/export/restore. |
| `replication` | Host panel pins an explicitly public, allowlisted manifest; distinguishes request acceptance from retained bytes. |
| `rewards` | Host-specific request/approval/check/proof/claim workflow; no universal amount, eligibility, or payment policy. |

Omitted capabilities display **unavailable**, not a fake working button.
Every advertised capability needs an `open()` function and an explicit
`getStatus()` entry. Supported states are `unavailable`, `idle`, `pending`,
`ready`, and `error`, each with a nonempty `detail`. Status reads may not
request signatures, change providers, or write data. `ready` means the app
reports controls/provider readiness, not independent proof of storage.
`unavailable` and `pending` disable that action; `idle`, `ready` and `error`
allow opening host controls (including troubleshooting).

`open()` opens the host's own controls and may be async. The header closes its
dialog first so it does not trap focus above the host panel. The host owns the
panel's focus and cancellation behavior. Throw/reject if it cannot open;
unsupported, missing or invalid actions must not silently succeed. Return
values are deliberately not rendered as storage receipts. The header reports
only that app controls opened, not that data was backed up, pinned or paid.

The component performs no status request until the user opens it or presses
**Refresh status**. Mounting it is inert. It uses native dialog keyboard focus,
Escape dismissal, text-only adapter messages, and pending locks. Refresh
errors disable all actions until a successful status refresh.
Closing during a pending status check unlocks the button for retry and ignores
the dismissed check's eventual result. The host still owns request timeouts
and cancellation of its underlying reads. `open()` must settle when its panel
opens, not wait for a later upload, wallet confirmation or payment to complete.

## Dapp migration gates

1. **BigNuten:** complete synthetic backup repair first. Real health uploads
   require a separate encryption and recoverable-key decision. Do not infer
   public sharing from backup consent.
2. **Busking:** reuse its signed-upload/local-Kubo paths and community manifest
   pinning. Its inspected community UI marks availability rewards inactive;
   pinning must not advertise a payment.
3. **Canopy:** reuse public pin-by-CID and its own reward-request/approval rules.
   Do not copy Canopy reward rates into other apps.
4. **DecentHead consumers:** inventory copied headers, overrides and imports.
   Changing this repository does not wire app data or migrate embedded headers.
   Pin a tested revision and verify one app at a time, with rollback.

No production host adapters are enabled by this change. Full host data schemas,
upload authorization and storage implementations remain in their applications;
this contract avoids creating a competing copy of them.

The first local consumer is BigNuten's `js/ipfsHostAdapter.js`. Its opt-in
factory delegates to existing backup panels without the old icon's implicit
upload. It advertises backup only, keeps the confidentiality warning explicit,
and accepts a host-owned focus-return callback. Synthetic cross-repository
checks cover hosted, personal Pinata and Desktop routing, read-back/restore,
JSON export and failure retention; provider responses and the signer are mocked.
This is not an enabled production consumer or evidence of community pinning,
reward payments or actual hosted authorization.

## Validation

Run `node --test test/ipfs-host.test.cjs`. Tests use synthetic hosts and no
network/provider credentials. Contract tests are not real storage, reward,
onboarding or cross-app integration evidence. Browser checks should cover
inert mounting, opening by keyboard, separate states/actions, errors,
Escape/focus restoration and a 390px viewport before enabling a consumer.

Serve the repository locally and open [the two-host browser fixture](../test/ipfs-host.html)
to inspect the opt-in path without external services or real data.
Its failure toggles exercise status and host-panel errors. The fixture is not
linked from the production demo. The **Validate IPFS Host Contract** workflow
runs dependency-free contract/syntax checks; browser checks remain separate.

Isolated Chrome checks passed with two synthetic hosts: keyboard opening,
Escape/focus return, independent capability states, host-panel handoff,
text-only failures, pending-operation locks, retry after a dismissed status
check, disabled/missing configuration and 390px dialog bounds. They made no
external requests. This validates the opt-in elements, not a production dapp
migration or the complete header layout in every consuming application.
