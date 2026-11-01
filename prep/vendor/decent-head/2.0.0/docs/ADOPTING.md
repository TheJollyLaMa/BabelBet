# Adopting DecentHead 2.0.0

## Vendor manifest (no build step)

Copy these files, preserving their relative paths, into
`vendor/decent-head/2.0.0/` in the host dapp:

- `js/main.js`, `js/config.js`, `js/ui.js`, `js/wallet.js`, `js/wallet-logic.js`, `js/ens.js`, `js/chains.js`,
  `js/ipfs.js`, `js/ipfs-host.js`
- `js/components/Header.js`
- `js/components/Header/{AppTitle,WalletConnect,AboutModal,IPFSStatus,IPFSControls,AnkhMenu,orbit}.js`
- `js/vendor/ethers.umd.min.js`, `js/vendor/ethers.LICENSE.md`
- `css/decent-head.css`, `img/IPFS_Logo.png`, `img/MetaMaskFox.png`,
  `img/Ens_Eth_Breathe.png`, `img/Ens_Eth_Breathe-still.png`, `img/chains/*.svg`
- `LICENSE`, `NOTICE`, `LICENSES/CC-BY-4.0.txt`

Copy `decent-head.config.js` to your app, edit it, and load it **before** the
module. Keep one head/session per page. Paths resolve from `import.meta.url`,
including nested static-site/IPFS deployment paths. Serve HTTP(S), not `file:`.

```html
<script src="./decent-head.config.js"></script>
<script type="module" src="./vendor/decent-head/2.0.0/js/main.js"></script>
<decent-header></decent-header>
```

The exported `DecentHead` in `js/main.js` is also installed at
`window.DecentHead`. Configuration is snapshotted once at module load; set it
before importing (use a module config followed by `await import(...)` if your
adapter itself imports modules). No CSS, fonts, wallet scripts, or assets are
fetched from a CDN. ethers 6.16.0 is loaded locally only when needed.
The optional purchase route additionally needs `supporter/buy.html`,
`supporter/buy.js`, and `js/supporter-purchase.js` at the same relative paths.

## Ankh menu skeletons

Two themed ankh buttons flank the title (below it on mobile). The left opens
**Admin** and the right opens **My Profile**. These are intentionally inert
placeholder buttons: clicking an item does not navigate, open another view,
request a wallet, or grant privileges. The menus close on outside click or
Escape; Escape returns focus to their trigger. These are not an authorization
system or a profile implementation. Host-specific behavior is future work.

## Branding and chain

Edit `appName`, `subtitle`, `about.title`, `about.summary`, `about.sections`
(`{title, body}`), `links` and `relatedDapps` (`{label, url}`). Text is escaped;
links accept HTTP(S) and IPFS URIs, not script URLs. Set `theme` with names such
as `accent`, `accent-2`, `bg-1` through `bg-3`, `title`, `text`, and `muted`, or full
`--dh-*` property names. Also: `--dh-title-font`, `--dh-orbit-size`, `--dh-orbit-size-mobile`. Alternatively set CSS properties on `decent-header`;
remove conflicting config theme keys to let external CSS win. Set `art.ipfsIcon`,
`art.titleIcon`, and `art.walletIcon` (defaults to the MetaMask fox) to host image URLs
(relative URLs resolve against the page), `art.titleEnds` to the two glyphs that frame
the title (`['::-', '-::']` by default; `['', '']` hides them),
and `--dh-background-image` to a CSS image/gradient for fully host-owned art.

`chain` accepts `{chainId, chainName, nativeCurrency, rpcUrls,
blockExplorerUrls}` (the wallet-add-chain shape, with numeric or hexadecimal
chainId). Base is the boilerplate default, not a requirement. Connection
requests accounts only on an explicit click, then switches/adds the configured
chain. Later manual network changes emit events, not unsolicited switch prompts.
Wallet announcements are untrusted display data; no provider icons are loaded.

### Wallet identity and disconnect

The fox button toggles this dapp's session: click to connect, click again to
disconnect. Disconnect clears the shared session and listeners; it does **not**
revoke the wallet extension's permission for this site. Revoke that in the
wallet's connected-sites settings if desired.

With `ens.enabled: true` (default), a connected address is reverse-resolved on
Ethereum mainnet and forward-checked before its ENS name is displayed. This
works while the wallet is on Base or another chain without switching it.
The mainnet endpoint is `ens.rpcUrl`; use your own endpoint or set
`ens.enabled: false` if you do not want to disclose public addresses to that RPC.
Lookup failures show "ENS unavailable" and retain the address. Account changes
and disconnect discard outstanding name lookups. ENS names are mutable display
identities, never payment destinations or authorization proofs.

The ring shows the verified name (or address prefix), four ENS/ETH Breathe
icons, and the address suffix. Base, Ethereum, and Optimism have bundled chain
glyphs replacing four blinking sparks. Unknown chains keep neutral sparks,
never a guessed chain logo. Full addresses remain available in wallet state
and the button tooltip.
Forget removes this head’s session/listeners, not the wallet’s site permissions.
No-wallet visitors get a MetaMask dapp link, also useful on mobile. Short
addresses avoid unnecessary ENS/RPC traffic.

## IPFS context adapter

The head must never infer which localStorage records belong to your app. The
[version 1 host contract](IPFS-HOST.md) remains unchanged. Prefer an adapter
that opens your app’s own backup, public replication and reward participation
panels. Each capability supplies its own state and detail; missing capabilities
are unavailable. Opening a control is not confirmation that storage or payment
succeeded.

```js
window.DECENT_CONFIG = {
  appName: 'My dapp',
  ipfsAdapter: {
    version: 1, label: 'My dapp data controls',
    capabilities: {
      backup: { open: () => openMyBackupPanel() },
      replication: { open: () => openMyPublicPins() },
      // Only expose rewards when your app implements program terms and claims.
    },
    getStatus: async () => ({
      backup: { state: 'idle', detail: 'No backup verified; local data only.' },
      replication: { state: 'idle', detail: 'Not enrolled in community pinning.' },
    }),
  },
};
```

If you need the built-in JSON backup panel instead, omit `ipfsAdapter` and set:

```js
window.DECENT_CONFIG.data = {
  export: async () => serializeAndEncryptMySelectedData(),
  import: async backup => {
    const validated = validateAndDecryptMyBackup(backup);
    await applyMyBackup(validated);
  },
};
```

Open **App backups** to show upload/restore controls. Both actions require
confirmation. Restore retrieves JSON by CID, then invokes only the host’s
import hook after confirmation. Validate schema, size, version and origin;
never blindly merge an untrusted backup into app state. The header does not
encrypt for you. Public IPFS data may be retained forever. Use only synthetic
or already-public data until your host adapter encrypts sensitive content.
A custom adapter may also use the shared session directly:

```js
const storage = window.DecentHead.getIpfs();
const cid = await storage.upload(await exportSelectedEncryptedData());
const backup = await storage.restore(cid);
await validateAndRestore(backup);
```

These methods do not show consent prompts themselves: a calling host/widget
must provide its own explicit consent/validation UI.

## Storage controls

The IPFS dialog initially shows compact storage/community choices and supported
host actions. Expand **Storage provider** to enter credentials; local-node
selection hides irrelevant Pinata fields. **Community pinning** and **Restore a
backup** reveal their inputs only when requested. About sections are likewise
collapsed. Both dialogs close using the sticky top-right cross, Escape, or a
click outside the dialog; closing does not cancel an already-submitted upload
or blockchain transaction.

### Providers and community pinning

`providers.default` is `pinata` or `local`. Pinata’s public API needs the user’s
JWT, or API key + secret, entered into the provider dialog. Credentials are
memory-only for this tab and cleared on reload; do not embed a shared secret in
config, source, or a static hosting environment variable. **Use provider**
selects credentials, not a health/backup verification. Re-enter credentials to
replace or clear them.

For an app-owned Pinata worker, configure `providers.pinata.uploadUrl` and
`pinUrl` as HTTPS endpoints implementing the Pinata file/JSON API response
shapes. The worker must authenticate users, authorize operations, rate-limit,
and hold its secret server-side. Pinata upload returns `{IpfsHash}`; pin-by-hash
accepts `{hashToPin}`. Do not trust client-side opt-in as backend authorization.

For IPFS Desktop/Kubo set `providers.local.apiUrl` (default
`http://127.0.0.1:5001`). Enable Kubo API CORS **only for your exact host origin**,
including scheme/port; never expose its admin API publicly or use wildcard
origins. Browser private-network/mixed-content rules may require localhost
hosting or an authenticated HTTPS bridge. The header uses POST `add`, `cat`,
and `pin/add`; it does not silently proxy around browser security.
`providers.gateway` defaults to `https://ipfs.io/ipfs/` for Pinata-side restore.
Community pin requests require checking the opt-in box; accepted requests are
not proof of durable replication or rewards. Program enrollment, eligibility,
reward accounting and claims belong to the host capability, not this header.

## Widget host API (S12)

```js
const head = window.DecentHead; // or import { DecentHead } from the main module
const off = head.on('wallet', state => {
  console.log(state.address, state.chainId); // never log credentials/data
});
const wallet = head.getWallet();
const { connected, address, provider } = wallet.snapshot(); // ethers BrowserProvider
// In a widget click handler only:
await wallet.connect();
await wallet.ensureChain(myChainConfig);
const signer = await wallet.snapshot().provider.getSigner();
// Unmount:
off();
```

`getIpfs()` and `getWallet()` return shared session objects, not new connections.
`on` returns an unsubscribe callback and accepts `wallet`, `ipfs`, `providers`,
`ready` or full `decenthead:*` DOM event names. Wallet events contain
`{connected,address,chainId,provider,ensName,ensStatus}`. `ensStatus` is `idle`,
`loading`, `resolved`, `not-found`, or `unavailable`. IPFS events contain provider selection
state and, on backup completion, action/CID; never credentials or backup data.
Listen on `window` for `decenthead:ready` if the widget loads before the head.
Do not request accounts at widget mount.

## Supporter listing and payments

`supporter/buy.html?chainId=8453&escrow=0x31b07b83e99A9bdF379bf40225b8A80d3804C89d&listingId=ID`
is a purchase landing route for the approved Base Supporter deployment. It reads
the listing, requires an active stocked $10 USDC token from the approved NFT
contract, and enables **Review purchase** only after verification. Buying still
requires an explicit wallet action, chain confirmation and exact approval.
The price is rechecked before purchase; a changed price is rejected.
This route does not mint or prove that a particular version is registered:
the [release protocol](SUPPORTER-RELEASES.md) binds that separately to metadata
and mint evidence before announcing its purchase link.

No contract/listing is bundled as a live sales default. Set `supporterDnft`:

```js
window.DECENT_CONFIG.supporterDnft = {
  title: 'My app supporter edition',
  contract: '0xYourNFTContract', tokenId: '1',
  chain: window.DECENT_CONFIG.chain,
  marketUrl: 'https://your-market.example/item/1',
  escrowAddress: '0xYourEscrowContract', listingId: '0',
  // Required when the escrow listing represents its default token as address(0):
  paymentToken: '0xYourChainUSDC',
  paypal: { clientId: 'YOUR_PUBLIC_PAYPAL_CLIENT_ID', amount: '10.00',
    currency: 'USD', adminEmail: 'merchant@example.org' },
};
```

Use real addresses before enabling purchase buttons. Omit escrow or PayPal
fields to disable those flows. The escrow ABI retains `getListing`,
`getNFTBalance`, `purchaseWithETH`, and `purchaseWithToken` from v1. A purchase
uses the shared discovered wallet, ensures the listing chain, verifies the
configured NFT/tokenId and live inventory, confirms price, approves only the
required ERC-20 amount and waits for confirmation. Prices are shown in ETH or
raw token units to avoid guessing arbitrary token decimals.

PayPal amounts are configured independently from token pricing. Its SDK loads
only on click. Captures show a receipt and optional **Email merchant** link;
no email is automatically sent and no fulfillment deadline is promised.
Production merchants must verify captures server-side and prevent duplicate
fulfillment before signing an NFT transfer. No wallet private keys are used.

## Planned UCAN authorization

`providers.ucanAuth: null` is a reserved **planned**, inert extension point.
Do not treat setting it as authorization. The future email → UCAN delegation
flow should reuse ArtFi’s `docs/IPFS_UCAN.md`, `scripts/browserEmailAuth.mjs`
and `scripts/ucanStorage.mjs`: browser identity, wallet binding, expiring email
confirmation and audience-checked delegations; a service verifies invocations
before minting a short-lived Pinata upload URL. Nothing in this release issues
or validates delegations. Service design, threat review, and consent UI remain
follow-ups, not a hidden fallback.

## Migrating from v1

This is a breaking major release. Remove the retired provider browser script
and email login wiring. `ipfsMode` is gone; host adapters are the default path.
The host contract stays at version 1. Stop relying on header-owned fitness
snapshots, selectedAddress auto-connect, hard-coded supporter contracts,
Optimism purchases, token/subscription menus or the old stylesheet internals.
Use explicit data hooks, a configured chain, the new widget API, and inherited
`--dh-*` properties instead. Base is only the default and changes no deployed
contracts. Legacy dropdown/subscription components remain unmounted source,
not part of the vendored v2 surface. Keep Apache-2.0/NOTICE and art/docs
attribution when distributing the head; ethers remains MIT licensed.
