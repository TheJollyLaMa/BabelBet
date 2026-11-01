import { wallet } from '../../wallet.js';
import { config } from '../../config.js';
import { safeURL, escapeHTML } from '../../ui.js';
import { CHAIN_ICONS } from '../../chains.js';
import { orbitMarkup, orbitCSS, setRing } from './orbit.js';
const base = new URL('../../../', import.meta.url).href;
const chainName = chainId => {
  const id = BigInt(chainId);
  if (id === BigInt(config.chain.chainId)) return config.chain.chainName;
  return { 1: 'Ethereum', 10: 'Optimism', 137: 'Polygon', 8453: 'Base', 42161: 'Arbitrum' }[Number(id)] || `chain ${id}`;
};
export class WalletConnect extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() {
    const icon = safeURL(config.art.walletIcon) || `${base}img/MetaMaskFox.png`;
    this.shadowRoot.innerHTML = `<style>${orbitCSS}
      :host { display:grid; justify-items:center; align-content:start; gap:4px; font:12px/1.35 system-ui,sans-serif; color:var(--dh-text,#eef8ff); }
      #connect { width:100%; height:100%; border:0; border-radius:50%; padding:0; cursor:pointer; display:grid; place-items:center;
        background:radial-gradient(circle at 32% 28%,#ffffff2b,#ffffff08 62%),var(--dh-bg-1,#0a1220);
        --glow:#ff6b6bbf; box-shadow:0 0 0 2px #ff6b6b22,0 0 26px #ff6b6b5c,0 10px 26px #0008; transition:transform .18s ease, box-shadow .3s ease; }
      #connect::before { content:''; position:absolute; inset:-14%; z-index:-1; border-radius:50%; background:radial-gradient(circle,var(--glow) 0%,transparent 62%); filter:blur(6px); }
      #connect:hover:not(:disabled) { transform:scale(1.05); } #connect:active:not(:disabled) { transform:scale(.97); }
      #connect:disabled { cursor:default; filter:grayscale(.55) brightness(.8); }
      #connect:focus-visible { outline:3px solid var(--dh-accent,#7af0c6); outline-offset:4px; }
      #connect img { width:64%; height:64%; object-fit:contain; filter:drop-shadow(0 2px 6px #0009); }
      .orb[data-state="connected"] #connect { --glow:color-mix(in srgb,var(--dh-accent,#7af0c6) 78%,transparent);
        box-shadow:0 0 0 2px color-mix(in srgb,var(--dh-accent,#7af0c6) 18%,transparent),0 0 28px color-mix(in srgb,var(--dh-accent,#7af0c6) 45%,transparent),0 10px 26px #0008; }
      .meta { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:6px; max-width:200px; text-align:center; }
      select,a { font:inherit; color:var(--dh-text,#eef8ff); background:color-mix(in srgb,var(--dh-bg-2,#10202a) 85%,transparent);
        border:1px solid color-mix(in srgb,var(--dh-accent,#7af0c6) 55%,transparent); border-radius:999px; padding:3px 10px; text-decoration:none; }
      select { max-width:150px; }
      select:focus-visible,a:focus-visible { outline:2px solid var(--dh-accent,#7af0c6); outline-offset:2px; }
      .account-orbit { position:absolute; inset:0; pointer-events:none; animation:dh-spin 18s linear infinite; }
      .account-orbit .ring { position:absolute; inset:0; width:100%; height:100%; overflow:visible; animation:none; }
      .account-orbit .ring text { dominant-baseline:central; }
      .account-logos { position:absolute; inset:0; opacity:.35; }
      .account-logos img { position:absolute; left:50%; top:50%; width:10%; height:10%; border-radius:50%;
        transform:translate(-50%,-50%) rotate(var(--angle)) translateY(calc(var(--orb-size) * -.4));
        filter:drop-shadow(0 0 5px var(--dh-accent,#7af0c6)); }
      .orb[data-state="connected"] .account-logos { opacity:1; }
      .spark.chain { background:none; border:0; border-radius:50%; width:8%; height:8%; object-fit:contain; }
      .identity-note { font-size:10px; color:var(--dh-muted,#b9cfe0); margin:0; text-align:center; }
      @media(prefers-reduced-motion:reduce) { .account-orbit { animation:none; } }
      #status { margin:0; color:var(--dh-muted,#b9cfe0); letter-spacing:.04em; overflow-wrap:anywhere; }
      [hidden] { display:none !important; }
      @media(max-width:600px) { :host { font-size:10.5px; } .meta { max-width:104px; gap:3px; } select { max-width:100px; } select,a { padding:2px 7px; } }
      </style>${orbitMarkup(`<button id="connect" type="button" aria-label="Connect wallet"><img alt="" src="${escapeHTML(icon)}" /></button>`)}
      <div class="meta"><select aria-label="Choose wallet"></select>
      <a id="mobile" hidden>Open MetaMask</a><p id="status" role="status"></p></div><p class="identity-note" role="status"></p>`;
    const logos = document.createElement('div');
    logos.className = 'account-logos';
    logos.setAttribute('aria-hidden', 'true');
    for (const angle of [180, 204, 228, 252]) {
      const picture = document.createElement('picture');
      const still = document.createElement('source');
      still.media = '(prefers-reduced-motion: reduce)';
      still.srcset = `${base}img/Ens_Eth_Breathe-still.png`;
      const image = document.createElement('img');
      image.src = `${base}img/Ens_Eth_Breathe.png`;
      image.alt = '';
      image.style.setProperty('--angle', `${angle}deg`);
      picture.append(still, image);
      logos.append(picture);
    }
    const orbit = document.createElement('div');
    orbit.className = 'account-orbit';
    orbit.append(this.shadowRoot.querySelector('.ring'), logos);
    this.shadowRoot.querySelector('.orb').append(orbit);
    this.shadowRoot.querySelectorAll('.spark').forEach((spark, i) => {
      if (i % 2) return;
      const image = document.createElement('img');
      image.className = 'spark chain';
      image.style.cssText = spark.style.cssText;
      image.alt = '';
      image.hidden = true;
      spark.after(image);
      spark.dataset.chainPlaceholder = '';
    });
    this.update = () => this.renderState();
    window.addEventListener('decenthead:providers', this.update);
    window.addEventListener('decenthead:wallet', this.update);
    this.shadowRoot.querySelector('#connect').onclick = async () => {
      if (this.connecting) return;
      if (wallet.snapshot().connected) { wallet.forget(); return; }
      this.connecting = true;
      let failure;
      this.renderState();
      try {
        const index = Number(this.shadowRoot.querySelector('select').value);
        await wallet.connect(wallet.available()[index]?.provider);
      } catch (error) { failure = error.shortMessage || error.message; }
      finally {
        this.connecting = false;
        this.renderState();
        if (failure) { this.shadowRoot.querySelector('#status').textContent = failure; setRing(this.shadowRoot, '✦ CONNECTION FAILED ✦ TAP THE FOX TO TRY AGAIN ', 'error'); }
      }
    };
    this.renderState();
  }
  disconnectedCallback() {
    window.removeEventListener('decenthead:providers', this.update);
    window.removeEventListener('decenthead:wallet', this.update);
  }
  orbRect() { return this.shadowRoot.querySelector('.orb')?.getBoundingClientRect(); }
  renderState() {
    const root = this.shadowRoot, available = wallet.available(), state = wallet.snapshot();
    const select = root.querySelector('select'), previous = select.value, connect = root.querySelector('#connect');
    select.replaceChildren(...available.map((item, i) => new Option(item.info.name, String(i))));
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
    select.hidden = available.length < 2 || state.connected;
    connect.disabled = !state.connected && (this.connecting || !available.length);
    connect.setAttribute('aria-label', state.connected ? 'Disconnect wallet' : 'Connect wallet');
    connect.title = state.connected ? `${state.ensName || state.address} · click to disconnect this dapp` : available.length ? 'Connect wallet' : 'No injected wallet detected';
    connect.setAttribute('aria-pressed', String(state.connected));
    const mobile = root.querySelector('#mobile');
    mobile.hidden = !!available.length;
    mobile.href = `https://metamask.app.link/dapp/${location.host}${location.pathname}${location.search}${location.hash}`;
    root.querySelector('#status').textContent = state.connected
      ? `${state.ensName || `${state.address.slice(0, 6)}…${state.address.slice(-4)}`} · ${chainName(state.chainId)}`
      : this.connecting ? 'Check your wallet…' : available.length ? 'Connect only when you choose.' : 'No injected wallet detected.';
    root.querySelector('.identity-note').textContent = state.ensStatus === 'unavailable' ? 'ENS unavailable · showing address' : '';
    setRing(root, '', state.connected ? 'connected' : 'idle');
    const path = root.querySelector('textPath');
    // Reserve the final arc for the four logos; text and logos share one rotor.
    path.setAttribute('textLength', '342');
    path.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    path.setAttribute('startOffset', '2%');
    path.textContent = state.connected
      ? `${state.ensName || state.address.slice(0, 6)} · ${state.address.slice(-4)}`
      : this.connecting ? 'CHECK YOUR WALLET' : 'CONNECT WALLET';
    const chainIcon = state.connected ? CHAIN_ICONS[Number(BigInt(state.chainId))] : null;
    root.querySelectorAll('.spark.chain').forEach(image => {
      image.hidden = !chainIcon;
      if (chainIcon) image.src = chainIcon;
    });
    root.querySelectorAll('[data-chain-placeholder]').forEach(spark => { spark.hidden = !!chainIcon; });
  }
}
if (!customElements.get('wallet-connect')) customElements.define('wallet-connect', WalletConnect);
