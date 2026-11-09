import { config } from './config.js';
export function validCID(cid) { return typeof cid === 'string' && /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,})$/.test(cid); }
export class IPFSSession {
  constructor(options = config.providers) {
    this.options = options;
    this.provider = options.default;
    this.credentials = {};
    this.adapter = null;
    this.revision = 0;
    this.connection = { state: 'unverified', detail: 'Provider connection has not been checked.' };
  }
  configure({ provider, jwt = '', apiKey = '', apiSecret = '' }) {
    if (!['pinata', 'local'].includes(provider)) throw new Error('Unknown IPFS provider');
    this.provider = provider;
    this.credentials = { jwt, apiKey, apiSecret };
    this.revision++;
    this.connection = { state: 'unverified', detail: 'Provider selected; connection not checked.' };
    window.dispatchEvent(new CustomEvent('decenthead:ipfs', { detail: this.snapshot() }));
  }
  snapshot() { return { provider: this.provider, adapter: this.adapter, credentialsConfigured: !!(this.credentials.jwt || this.credentials.apiKey), ucanAuth: 'planned', connection: { ...this.connection } }; }
  async verifyConnection() {
    if (this.connection.state === 'checking') throw new Error('A provider connection check is already running.');
    const revision = this.revision;
    const provider = this.provider;
    this.connection = { state: 'checking', detail: 'Checking provider connectivity; no upload or pin requested.' };
    window.dispatchEvent(new CustomEvent('decenthead:ipfs', { detail: this.snapshot() }));
    try {
      let url, options;
      if (provider === 'pinata') {
        if (!this.credentials.jwt && !(this.credentials.apiKey && this.credentials.apiSecret)) {
          throw new Error('Enter your personal Pinata JWT or API key and secret, then use provider.');
        }
        url = 'https://api.pinata.cloud/data/testAuthentication';
        options = { method: 'GET', headers: this.headers() };
      } else {
        const endpoint = new URL(this.options.local.apiUrl);
        if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password ||
            endpoint.search || endpoint.hash || !['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname)) {
          throw new Error('Local Kubo connectivity checks require a credential-free loopback HTTP(S) endpoint.');
        }
        url = `${endpoint.href.replace(/\/$/, '')}/api/v0/version`;
        options = { method: 'POST' };
      }
      let response;
      try {
        response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000), redirect: 'error', cache: 'no-store', credentials: 'omit' });
      } catch {
        throw new Error('Provider connection failed or timed out. Check the endpoint, network and local Kubo CORS configuration.');
      }
      if (!response.ok) throw new Error(`Provider connection failed (HTTP ${response.status}).`);
      let result;
      try { result = await response.json(); }
      catch { throw new Error('Provider connection returned invalid JSON.'); }
      if (provider === 'pinata'
        ? result?.message !== 'Congratulations! You are communicating with the Pinata API!'
        : typeof result?.Version !== 'string' || !result.Version.trim()) {
        throw new Error('Provider connection returned an unexpected authentication/version response.');
      }
      if (revision !== this.revision) throw new Error('Provider changed during the check. Verify the newly selected provider.');
      this.connection = { state: 'ready', detail: provider === 'pinata'
        ? 'Pinata authenticated for this credential. Upload permissions, retention, backups and rewards are not verified.'
        : 'Local Kubo version endpoint responded. Pinning, retention, backups and rewards are not verified.' };
      window.dispatchEvent(new CustomEvent('decenthead:ipfs', { detail: this.snapshot() }));
      return { ...this.connection };
    } catch (error) {
      if (revision === this.revision) {
        this.connection = { state: 'error', detail: error.message };
        window.dispatchEvent(new CustomEvent('decenthead:ipfs', { detail: this.snapshot() }));
      }
      throw error;
    }
  }
  headers() {
    const { jwt, apiKey, apiSecret } = this.credentials;
    if (jwt) return { Authorization: `Bearer ${jwt}` };
    if (apiKey && apiSecret) return { pinata_api_key: apiKey, pinata_secret_api_key: apiSecret };
    if (this.options.pinata.uploadUrl === 'https://api.pinata.cloud/pinning/pinFileToIPFS') throw new Error('Enter your Pinata JWT or API key + secret. No shared key is bundled.');
    return {};
  }
  async request(url, options) {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`IPFS request failed (HTTP ${response.status})`);
    return response;
  }
  async upload(data) {
    const body = new FormData();
    body.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }), 'backup.json');
    let cid;
    if (this.provider === 'local') {
      const response = await this.request(`${this.options.local.apiUrl.replace(/\/$/, '')}/api/v0/add?pin=true`, { method: 'POST', body });
      const result = JSON.parse((await response.text()).trim().split('\n').at(-1));
      cid = result.Hash;
    } else {
      const result = await (await this.request(this.options.pinata.uploadUrl, { method: 'POST', headers: this.headers(), body })).json();
      cid = result.IpfsHash;
    }
    if (!validCID(cid)) throw new Error('Provider returned an invalid CID');
    window.dispatchEvent(new CustomEvent('decenthead:ipfs', { detail: { ...this.snapshot(), action: 'backup', cid } }));
    return cid;
  }
  async restore(cid) {
    if (!validCID(cid)) throw new Error('Enter a valid CID (not a URL)');
    const response = this.provider === 'local'
      ? await this.request(`${this.options.local.apiUrl.replace(/\/$/, '')}/api/v0/cat?arg=${encodeURIComponent(cid)}`, { method: 'POST' })
      : await this.request(`${this.options.gateway.replace(/\/?$/, '/')}${encodeURIComponent(cid)}`, {});
    return response.json();
  }
  async pin(cid, { consent = false } = {}) {
    if (!consent) throw new Error('Community pinning requires explicit opt-in');
    if (!validCID(cid)) throw new Error('Enter a valid CID');
    if (this.provider === 'local') {
      await this.request(`${this.options.local.apiUrl.replace(/\/$/, '')}/api/v0/pin/add?arg=${encodeURIComponent(cid)}`, { method: 'POST' });
    } else {
      const url = this.options.pinata.pinUrl || 'https://api.pinata.cloud/pinning/pinByHash';
      await this.request(url, { method: 'POST', headers: { ...this.headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ hashToPin: cid }) });
    }
    return { cid, detail: 'Pin request accepted; not proof of retention or reward eligibility.' };
  }
}
export const ipfs = new IPFSSession();
