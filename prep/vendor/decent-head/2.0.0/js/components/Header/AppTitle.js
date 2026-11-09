import { config } from '../../config.js';
import { safeURL } from '../../ui.js';
export class AppTitle extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>
      :host { display:block; text-align:center; min-width:0; position:relative; z-index:1; container-type:inline-size; }
      button { cursor:pointer; border:0; background:none; padding:4px 8px; display:inline-flex; align-items:center; justify-content:center; gap:.3em; max-width:100%;
        font:800 clamp(18px,10cqi,56px)/1.1 var(--dh-title-font,'Avenir Next','Trebuchet MS',system-ui,sans-serif); letter-spacing:.01em;
        color:var(--dh-title,#e9fff7); animation:dh-breathe 6s ease-in-out infinite;
        text-shadow:0 0 4px #fff8,0 0 12px var(--dh-accent,#7af0c6),0 0 28px var(--dh-accent,#7af0c6),0 0 54px color-mix(in srgb,var(--dh-accent-2,#8d7cf7) 70%,transparent); }
      button:focus-visible { outline:2px solid var(--dh-accent,#7af0c6); outline-offset:4px; border-radius:10px; }
      .name { overflow-wrap:break-word; min-width:0; }
      .end { font:700 .42em ui-monospace,Menlo,monospace; color:var(--dh-accent,#7af0c6); opacity:.9; letter-spacing:.08em; white-space:nowrap; }
      img { width:.8em; height:.8em; object-fit:contain; filter:drop-shadow(0 0 8px var(--dh-accent,#7af0c6)); }
      p { margin:4px 0 0; font:600 12px/1.4 system-ui,sans-serif; letter-spacing:.12em; color:var(--dh-muted,#b9cfe0); }
      @keyframes dh-breathe { 50% { filter:brightness(1.18) drop-shadow(0 0 6px color-mix(in srgb,var(--dh-accent,#7af0c6) 45%,transparent)); } }
      @media(prefers-reduced-motion:reduce) { button { animation:none; } }
      @media(max-width:600px) { .end { display:none; } button { font-size:clamp(16px,13cqi,30px); } p { font-size:10px; letter-spacing:.06em; } }
      </style><button type="button" aria-haspopup="dialog"><span class="end" aria-hidden="true"></span><span class="name"></span><span class="end" aria-hidden="true"></span></button><p></p>`;
    const button = this.shadowRoot.querySelector('button');
    const [left, right] = Array.isArray(config.art.titleEnds) ? config.art.titleEnds : ['::-', '-::'];
    const ends = button.querySelectorAll('.end');
    ends[0].textContent = left ?? ''; ends[1].textContent = right ?? '';
    button.querySelector('.name').textContent = config.appName;
    const icon = safeURL(config.art.titleIcon);
    if (icon) {
      const image = document.createElement('img');
      image.src = icon; image.alt = ''; button.querySelector('.name').before(image);
    }
    this.shadowRoot.querySelector('p').textContent = config.subtitle;
    button.onclick = () => this.dispatchEvent(new CustomEvent('decenthead:about', { bubbles:true, composed:true }));
  }
  endRects() { return [...this.shadowRoot.querySelectorAll('.end')].filter(end => end.offsetParent).map(end => end.getBoundingClientRect()); }
}
if (!customElements.get('app-title')) customElements.define('app-title', AppTitle);
