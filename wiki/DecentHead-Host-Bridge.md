# Explicit DecentHead 2.0.0 host-bridge adaptation

Base pin: `426ccb7ad8de658cda374b11ebc4b544b35257e6`.
This receiving app uses the supported config, version-1 IPFS host adapter,
`DecentHead.on('wallet', ...)`, and wallet session. It does not replace or
monkeypatch `ipfs.configure/request/upload/restore/pin`, `openBackup`, or query
header shadow internals from host app code.

The provider is explicitly configured through the existing
`providers.default` config as `unconfigured · local files only`. The untouched
shared status renderer therefore keeps `IPFS · unconfigured · local files only`
even after shared IPFS events; it does not identify Pinata, a running local node,
or a verified backup. No private status mutation or facade replacement is used.

## Unavoidable upstream gaps and exact deviations

Pinned upstream 2.0.0 has inert ankh buttons, no host-facing About opener, and its
generic provider/pin forms remain enabled regardless of host capabilities.
There is no documented host-only configuration switch in that upstream pin.
A host adapter alone cannot safely represent local-only controls without exposing
those unrelated generic credential/publishing forms.

Three explicit component patches add a small host bridge:

1. `js/components/Header/AnkhMenu.js`: selecting the item closes the menu, focuses
   its visible summary, and dispatches composed/bubbling `decenthead:menu` with
   `{side: 'left'|'right'}`. The app listens on `<decent-header>`; this event grants
   no rights.
2. `js/components/Header.js`: public `openAbout()` delegates to its owned modal.
   The title retains its existing About behavior.
3. `js/components/Header/IPFSControls.js`: opt-in
   `DECENT_CONFIG.ipfsControlsMode = 'host-only'` hides/disables generic
   credential/upload/pin controls and declines their synthetic actions, while
   retaining the version-1 adapter status/open contract. Omitted capabilities
   remain visible with truthful unavailable status and disabled buttons. Default
   mode is unchanged for upstream adopters.

Exact original bytes for these three files are preserved in
`vendor/decent-head-upstream/js/components/*.source`, outside the served tree.
Other supported manifest files, wallet/IPFS modules, CSS, art, LICENSE and NOTICE
remain byte-pinned. These three adapted files must not be called exact upstream
bytes or an upstream-supported feature. Changes can be reviewed with:

```sh
git diff --no-index vendor/decent-head-upstream/js/components/Header.js.source prep/vendor/decent-head/2.0.0/js/components/Header.js
git diff --no-index vendor/decent-head-upstream/js/components/Header/AnkhMenu.js.source prep/vendor/decent-head/2.0.0/js/components/Header/AnkhMenu.js
git diff --no-index vendor/decent-head-upstream/js/components/Header/IPFSControls.js.source prep/vendor/decent-head/2.0.0/js/components/Header/IPFSControls.js
```

## Local backup/restore and future public publishing

`prep/ipfs-adapter.mjs:createPreparationIPFSHost` validates the actual shared
version-1 contract. Its backup capability opens working local-profile
export/import controls; strict schema, consent, file-size limit, no automatic
browser persistence and plaintext privacy warnings remain. This is truthful
local backup/restore, not an IPFS pin or durability guarantee.

Public publishing and replication are **not configured now**, not irreversibly
removed from the shared facade. The donor facade remains unchanged and no browser
key is supplied or accepted by this host. A separate reviewed storage integration
would add a host capability and consented service-boundary UI, configure only
approved public payloads/endpoints, and update the currently restrictive CSP.
Never turn generic browser-key forms on for this app. Private profiles must not
be published silently. Pinning does not imply rewards, financial activation or
provider-game permission; the latter remains permanently disabled.

Receiving tests verify facade method identity, adapter availability, local
backup/restore, menu/About events, denied-network initial load, consent and
unchanged upstream-default behavior. No live public-IPFS tests are run.
