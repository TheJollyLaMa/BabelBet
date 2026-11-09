import { IPFS_CAPABILITIES, readIPFSHostStatus, openIPFSHostControls, validateIPFSHost } from '../../ipfs-host.js';

import { ipfs } from '../../ipfs.js';
import { config } from '../../config.js';
import { modalStyles, safeURL, escapeHTML, modalHeading, bindModalClose } from '../../ui.js';

const base = new URL('../../../', import.meta.url).href;

export class IPFSControls extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.busy = false;
    this.operation = null;
    this.request = 0;
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        ${modalStyles}
        :host { display: block; font: 14px/1.5 system-ui, sans-serif; color: var(--dh-text, #edf9ff); }
        button { font: inherit; cursor: pointer; }
        button:focus-visible { outline: 3px solid var(--dh-accent, #73e8df); outline-offset: 3px; }
        button:disabled { cursor: not-allowed; opacity: .55; }
        #open { display: grid; place-items: center; width: 64px; height: 64px; padding: 0; border: 0; border-radius: 50%;
          background: radial-gradient(circle at 32% 28%, #ffffff2b, #ffffff08 62%), var(--dh-bg-1, #0a1220);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--dh-accent-2, #8d7cf7) 25%, transparent),
            0 0 26px color-mix(in srgb, var(--dh-accent-2, #8d7cf7) 50%, transparent), 0 10px 26px #0008;
          transition: transform .18s ease; }
        #open:hover { transform: scale(1.05); }
        #open:active { transform: scale(.97); }
        :host([data-docked]) #open { width: 100%; height: 100%; }
        #open img { width: 60%; height: 60%; object-fit: contain; filter: drop-shadow(0 2px 6px #0009); }
        dialog { box-sizing: border-box; width: min(30rem, calc(100vw - 24px)); max-height: calc(100dvh - 24px);
          overflow: auto;
          background: var(--dh-bg-1, #101b27); color: var(--dh-text, #edf9ff); overflow-wrap: anywhere; }
        dialog::backdrop { background: #000a; }
        section button, #refresh { padding: 8px 12px; }
        #message { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
        @media (max-width: 600px) { :host(:not([data-docked])) #open { width: 42px; height: 42px; } }
      </style>
      <button id="open" type="button" aria-label="Open IPFS controls" aria-haspopup="dialog">
        <img src="${escapeHTML(safeURL(config.art.ipfsIcon) || `${base}img/IPFS_Logo.png`)}" alt="" />
      </button>
      <p id="message" role="status" aria-live="polite"></p>
      <dialog aria-labelledby="title">
        ${modalHeading('IPFS data controls', 'title', '⬡')}
        <p>Choose your storage. Back up only what you want to share.</p>
        <p id="app" class="quiet"></p>
        <details id="provider-settings"><summary><span aria-hidden="true">⬡</span> <span>Storage provider</span></summary>
          <label for="provider">Provider</label><select id="provider"><option value="pinata">Pinata (default)</option><option value="local">IPFS Desktop / local Kubo</option></select>
          <p class="quiet">Credentials stay in this tab. Selecting a provider uploads nothing.</p>
          <div id="pinata-settings"><label>Own Pinata JWT <input id="jwt" type="password" autocomplete="off" /></label>
          <details><summary>API key instead</summary>
            <label>API key <input id="key" type="password" autocomplete="off" /></label>
            <label>API secret <input id="secret" type="password" autocomplete="off" /></label>
          </details></div>
          <p id="local-settings" class="quiet" hidden>Use your running IPFS Desktop / Kubo node. Allow this dapp’s origin in its CORS settings. See the setup guide below.</p>
          <button id="save-provider">Use provider</button>
          <p id="provider-message" role="status"></p>
        </details>
        <section id="data-controls" hidden><h3>Backup / restore</h3>
          <p class="quiet">IPFS is public. Only app-selected data is exported; encrypt private data first.</p>
          <button id="backup">Upload backup</button>
          <details><summary>Restore a backup</summary><label>Backup CID <input id="restore-cid" /></label><button id="restore">Restore backup</button></details>
          <p id="data-message" role="status"></p>
        </section>
        <details id="community-settings"><summary><span aria-hidden="true">◎</span> <span>Community pinning</span></summary>
          <p class="quiet">Keep a public copy using your provider. Pinning alone does not earn rewards.</p>
          <label>Public content CID <input id="pin-cid" /></label>
          <label><input id="consent" type="checkbox" /> I opt in to publicly pin this content with my provider.</label>
          <button id="pin">Request community pin</button>
          <p id="pin-message" role="status"></p>
        </details>
        ${Object.entries(IPFS_CAPABILITIES).map(([key, label]) => `
          <section data-host-capability="${key}"><h3>${{ backup: '↥', replication: '◎', rewards: '◈' }[key] || '↗'} ${label}</h3><p class="quiet" id="${key}-status">Not checked.</p>
            <button type="button" data-capability="${key}" disabled>Open ${label.toLowerCase()} controls</button>
          </section>`).join('')}
        <p id="status-error" role="alert"></p>
        <div class="modal-footer"><a href="${base}docs/ADOPTING.md#storage-controls" target="_blank" rel="noopener noreferrer">Storage setup guide ↗</a>
        <button id="refresh" type="button">Refresh status</button></div>
      </dialog>`;
    const root = this.shadowRoot;
    this.dialog = root.querySelector('dialog');
    bindModalClose(this.dialog);
    root.getElementById('provider').value = ipfs.provider;
    const showProvider = () => {
      const local = root.getElementById('provider').value === 'local';
      root.getElementById('local-settings').hidden = !local;
      root.getElementById('pinata-settings').hidden = local;
    };
    root.getElementById('provider').onchange = showProvider;
    showProvider();
    root.getElementById('save-provider').onclick = () => {
      try {
        ipfs.configure({ provider: root.getElementById('provider').value, jwt: root.getElementById('jwt').value.trim(),
          apiKey: root.getElementById('key').value.trim(), apiSecret: root.getElementById('secret').value.trim() });
        for (const id of ['jwt', 'key', 'secret']) root.getElementById(id).value = '';
        root.getElementById('provider-message').textContent = `${ipfs.provider} selected; not yet verified. No data uploaded.`;
      } catch (error) { root.getElementById('provider-message').textContent = error.message; }
    };
    this.action = async (id, run) => {
      const button = root.getElementById(id), message = root.getElementById(id === 'pin' ? 'pin-message' : 'data-message');
      if (this.dataBusy) return;
      this.dataBusy = true;
      button.disabled = true;
      message.textContent = 'Working…';
      try { message.textContent = await run(); } catch (error) { message.textContent = error.message; }
      finally { this.dataBusy = false; button.disabled = false; }
    };
    root.getElementById('backup').onclick = () => this.action('backup', async () => {
      if (!config.data?.export) throw new Error('Host export is not configured');
      if (!confirm('Upload the host-selected data to public IPFS? Encrypt private data first.')) return 'Cancelled.';
      return `Backup CID: ${await ipfs.upload(await config.data.export())}`;
    });
    root.getElementById('restore').onclick = () => this.action('restore', async () => {
      if (!config.data?.import) throw new Error('Host import is not configured');
      const data = await ipfs.restore(root.getElementById('restore-cid').value.trim());
      if (!confirm('Restore this backup? The host will validate and apply it; existing data may change.')) return 'Cancelled.';
      await config.data.import(data);
      return 'Host restore completed.';
    });
    root.getElementById('pin').onclick = () => this.action('pin', async () => {
      const result = await ipfs.pin(root.getElementById('pin-cid').value.trim(), { consent: root.getElementById('consent').checked });
      root.getElementById('consent').checked = false;
      return result.detail;
    });
    root.getElementById('open').addEventListener('click', () => {
      this.dialog.showModal();
      this.refresh();
    });
    this.dialog.addEventListener('close', () => {
      if (this.operation === 'status') {
        this.request++;
        this.setBusy(false);
        root.getElementById('message').textContent = 'Status check dismissed. Open the controls to retry.';
      }
    });
    root.getElementById('refresh').addEventListener('click', () => this.refresh());
    root.querySelectorAll('[data-capability]').forEach(button => {
      button.addEventListener('click', () => this.openControls(button.dataset.capability));
    });
  }

  openBackup() {
    this.shadowRoot.getElementById('data-controls').hidden = false;
    this.shadowRoot.getElementById('backup').disabled = !config.data?.export;
    this.shadowRoot.getElementById('restore').disabled = !config.data?.import;
    if (!this.dialog.open) this.dialog.showModal();
    this.shadowRoot.getElementById('data-controls').scrollIntoView({ block: 'nearest' });
  }

  disconnectedCallback() {
    this.request++;
    this.dialog?.close();
    this.busy = false;
    this.operation = null;
  }

  setBusy(busy) {
    this.busy = busy;
    if (!busy) this.operation = null;
    this.shadowRoot.getElementById('open').disabled = busy;
    this.shadowRoot.getElementById('refresh').disabled = busy;
    this.shadowRoot.querySelectorAll('[data-capability]').forEach(button => { button.disabled = true; });
  }

  async refresh() {
    if (this.busy) return;
    const request = ++this.request;
    this.operation = 'status';
    this.setBusy(true);
    const root = this.shadowRoot;
    root.getElementById('status-error').textContent = '';
    root.getElementById('app').textContent = '';
    root.getElementById('message').textContent = 'Checking app-reported IPFS status...';
    root.querySelectorAll('[id$="-status"]').forEach(el => { el.textContent = 'Checking...'; });
    try {
      validateIPFSHost(this.adapter);
      root.getElementById('app').textContent = this.adapter.label;
      const status = await readIPFSHostStatus(this.adapter);
      if (request !== this.request) return;
      this.setBusy(false);
      for (const [key, entry] of Object.entries(status)) {
        root.querySelector(`[data-host-capability="${key}"]`).hidden = !Object.hasOwn(this.adapter.capabilities, key);
        root.getElementById(`${key}-status`).textContent = `${entry.state}: ${entry.detail}`;
        root.querySelector(`[data-capability="${key}"]`).disabled =
          entry.state === 'unavailable' || entry.state === 'pending';
      }
      root.getElementById('message').textContent = 'Status supplied by this app; not independent storage or reward verification.';
    } catch (error) {
      if (request !== this.request) return;
      this.setBusy(false);
      root.getElementById('status-error').textContent = `IPFS status unavailable: ${error.message}`;
      root.getElementById('message').textContent = 'IPFS configuration or status failed. No storage action was performed.';
      root.querySelectorAll('[id$="-status"]').forEach(el => { el.textContent = 'Status unavailable; see error below.'; });
      console.warn('[DecentHead IPFS]', error);
    }
  }

  async openControls(capability) {
    if (this.busy) return;
    const request = ++this.request;
    this.operation = 'controls';
    this.setBusy(true);
    this.dialog.close();
    const message = this.shadowRoot.getElementById('message');
    message.textContent = 'Opening app controls...';
    try {
      await openIPFSHostControls(this.adapter, capability);
      if (request !== this.request) return;
      message.textContent = 'App controls opened. This is not confirmation of a backup, pin or reward.';
    } catch (error) {
      if (request !== this.request) return;
      this.dialog.showModal();
      this.shadowRoot.getElementById('status-error').textContent = `Could not open controls: ${error.message}`;
      message.textContent = 'App controls failed to open.';
      console.warn('[DecentHead IPFS]', error);
    } finally {
      if (request === this.request) this.setBusy(false);
    }
  }
}

if (!customElements.get('ipfs-controls')) customElements.define('ipfs-controls', IPFSControls);
