import { config } from '../config.js';
import './Header/IPFSStatus.js';
import './Header/AppTitle.js';
import './Header/WalletConnect.js';
import './Header/AboutModal.js';
import './Header/AnkhMenu.js';
const css = new URL('../../css/decent-head.css', import.meta.url).href;
const SVG = 'http://www.w3.org/2000/svg';
const center = rect => rect && rect.width ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
export class DecentHeader extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() {
    for (const [key, value] of Object.entries(config.theme)) {
      const property = key.startsWith('--dh-') ? key : `--dh-${key}`;
      if (/^--dh-[a-z0-9-]+$/.test(property)) this.style.setProperty(property, value);
    }
    this.shadowRoot.innerHTML = `<link rel="stylesheet" href="${css}" />
      <header><div class="dh-background" aria-hidden="true"></div><svg class="dh-wires" aria-hidden="true"></svg>
      <ipfs-status></ipfs-status><div class="dh-title-tools"><ankh-menu side="left"></ankh-menu><app-title></app-title><ankh-menu side="right"></ankh-menu></div><wallet-connect></wallet-connect></header><about-modal></about-modal>`;
    this.shadowRoot.querySelector('app-title').addEventListener('decenthead:about', () => this.shadowRoot.querySelector('about-modal').open());
    this.drawWires = () => cancelAnimationFrame(this.frame) || (this.frame = requestAnimationFrame(() => this.wire()));
    this.observer = new ResizeObserver(this.drawWires);
    this.observer.observe(this.shadowRoot.querySelector('header'));
    document.fonts?.ready.then(this.drawWires);
  }
  disconnectedCallback() { this.observer?.disconnect(); cancelAnimationFrame(this.frame); }
  // Pulsing curves that tie the IPFS dock, the title endpoints, and the wallet dock together.
  wire() {
    const root = this.shadowRoot, svg = root.querySelector('.dh-wires'), header = root.querySelector('header');
    if (!svg || !header) return;
    const box = header.getBoundingClientRect();
    const local = point => point && { x: point.x - box.left, y: point.y - box.top };
    const ipfs = local(center(root.querySelector('ipfs-status').orbRect?.()));
    const wallet = local(center(root.querySelector('wallet-connect').orbRect?.()));
    const [leftEnd, rightEnd] = (root.querySelector('app-title').endRects?.() || []).map(rect => local(center(rect)));
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.replaceChildren();
    if (!ipfs || !wallet) return;
    const lanes = [];
    if (leftEnd && rightEnd) lanes.push([ipfs, leftEnd, -18], [rightEnd, wallet, -18], [ipfs, leftEnd, 22], [rightEnd, wallet, 22]);
    lanes.push([ipfs, wallet, box.height * .42], [ipfs, wallet, box.height * .62], [ipfs, wallet, -box.height * .2]);
    lanes.forEach(([from, to, bend], index) => {
      const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + bend };
      const d = `M${from.x.toFixed(1)},${from.y.toFixed(1)} Q${mid.x.toFixed(1)},${mid.y.toFixed(1)} ${to.x.toFixed(1)},${to.y.toFixed(1)}`;
      for (const kind of ['wire', 'wire pulse']) {
        const path = document.createElementNS(SVG, 'path');
        path.setAttribute('d', d); path.setAttribute('class', kind);
        if (kind !== 'wire') path.style.cssText = `--dur:${(5 + index * 1.3).toFixed(1)}s;--delay:${(-index * 1.7).toFixed(1)}s`;
        svg.append(path);
      }
      for (const t of [.22, .5, .78]) {
        const x = (1 - t) ** 2 * from.x + 2 * (1 - t) * t * mid.x + t ** 2 * to.x;
        const y = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * mid.y + t ** 2 * to.y;
        const node = document.createElementNS(SVG, 'circle');
        node.setAttribute('cx', x.toFixed(1)); node.setAttribute('cy', y.toFixed(1)); node.setAttribute('r', '1.8');
        node.setAttribute('class', 'node'); node.style.animationDelay = `${(-(index * 3 + t * 10) * .4).toFixed(1)}s`;
        svg.append(node);
      }
    });
  }
}
if (!customElements.get('decent-header')) customElements.define('decent-header', DecentHeader);
