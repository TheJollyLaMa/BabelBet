import './components/Header.js';
import { config } from './config.js';
import { ipfs } from './ipfs.js';
import { wallet } from './wallet.js';
export const DecentHead = Object.freeze({
  version: config.version,
  getIpfs: () => ipfs,
  getWallet: () => wallet,
  on(event, callback) {
    const name = event.startsWith('decenthead:') ? event : `decenthead:${event}`;
    const handler = event => callback(event.detail);
    window.addEventListener(name, handler);
    return () => window.removeEventListener(name, handler);
  },
});
window.DecentHead = DecentHead;
window.dispatchEvent(new CustomEvent('decenthead:ready', { detail: DecentHead }));
