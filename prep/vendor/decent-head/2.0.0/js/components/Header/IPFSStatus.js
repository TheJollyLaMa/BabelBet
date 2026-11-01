import './IPFSControls.js';
import { config } from '../../config.js';
import { ipfs } from '../../ipfs.js';
import { orbitMarkup, orbitCSS, setRing } from './orbit.js';
const PROVIDER_LABELS = { pinata: 'PINATA', local: 'YOUR NODE' };
export class IPFSStatus extends HTMLElement {
  connectedCallback() {
    if (!config.enableIPFS) return;
    if (this.shadowRoot) { window.addEventListener('decenthead:ipfs', this.update); this.renderState(); return; }
    this.attachShadow({ mode: 'open' }).innerHTML = `<style>${orbitCSS}
      :host { display:grid; justify-items:center; align-content:start; gap:4px; font:12px/1.35 system-ui,sans-serif; color:var(--dh-muted,#b9cfe0); }
      ::slotted(ipfs-controls) { width:100%; height:100%; }
      p { margin:0; letter-spacing:.04em; text-align:center; }
      @media(max-width:600px) { :host { font-size:10.5px; } }
      </style>${orbitMarkup('<slot></slot>')}<p id="label"></p>`;
    const controls = document.createElement('ipfs-controls');
    controls.dataset.docked = '';
    const hasData = typeof config.data?.export === 'function' || typeof config.data?.import === 'function';
    controls.adapter = config.ipfsAdapter || {
      version: 1, label: config.appName,
      capabilities: hasData ? { backup: { open: () => controls.openBackup() } } : {},
      getStatus: async () => hasData ? { backup: { state: 'idle', detail: 'Host data controls available; no backup verified.' } } : {},
    };
    ipfs.adapter = controls.adapter;
    this.replaceChildren(controls);
    this.update = event => this.renderState(event?.detail);
    window.addEventListener('decenthead:ipfs', this.update);
    this.renderState();
  }
  disconnectedCallback() { window.removeEventListener('decenthead:ipfs', this.update); }
  orbRect() { return this.shadowRoot?.querySelector('.orb')?.getBoundingClientRect(); }
  renderState(detail = ipfs.snapshot()) {
    const provider = PROVIDER_LABELS[detail.provider] || String(detail.provider || 'IPFS').toUpperCase();
    const ready = detail.credentialsConfigured || detail.provider === 'local';
    const cid = detail.cid ? ` ✦ ${detail.cid.slice(0, 12)}…` : '';
    setRing(this.shadowRoot, `✦ IPFS ✦ ${provider}${cid} ✦ YOUR DATA ✦ YOUR CHOICE `, ready ? 'ready' : 'idle');
    this.shadowRoot.querySelector('#label').textContent = `IPFS · ${detail.provider === 'local' ? 'your node' : detail.provider}`;
  }
}
if (!customElements.get('ipfs-status')) customElements.define('ipfs-status', IPFSStatus);
