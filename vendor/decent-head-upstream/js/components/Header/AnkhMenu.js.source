export class AnkhMenu extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() {
    const profile = this.getAttribute('side') === 'right';
    const label = profile ? 'My Profile' : 'Admin';
    this.shadowRoot.innerHTML = `<style>
      :host { display:block; position:relative; z-index:3; }
      summary { list-style:none; display:grid; place-items:center; box-sizing:border-box; width:44px; height:44px;
        border:1px solid var(--dh-accent,#7af0c6); border-radius:50%; cursor:pointer;
        background:radial-gradient(circle at 40% 30%,#16333f,var(--dh-bg-1,#0a1220) 75%);
        color:var(--dh-accent,#7af0c6); font:30px/1 system-ui;
        text-shadow:0 0 7px currentColor; box-shadow:0 0 14px var(--dh-accent-2,#8d7cf7); }
      summary::-webkit-details-marker { display:none; }
      summary:hover, details[open] summary { box-shadow:0 0 20px var(--dh-accent,#7af0c6); }
      summary:focus-visible, button:focus-visible { outline:2px solid var(--dh-accent,#7af0c6); outline-offset:4px; }
      .options { position:absolute; top:calc(100% + 10px); ${profile ? 'right' : 'left'}:0; min-width:136px; padding:6px;
        border:1px solid var(--dh-accent,#7af0c6); border-radius:12px; background:var(--dh-bg-1,#0a1220);
        box-shadow:0 8px 24px #0009,0 0 16px color-mix(in srgb,var(--dh-accent-2,#8d7cf7) 35%,transparent); }
      button { width:100%; border:0; border-radius:7px; padding:12px; background:transparent;
        color:var(--dh-text,#eef8ff); font:600 14px system-ui; text-align:left; cursor:default; }
      button:hover { background:color-mix(in srgb,var(--dh-accent,#7af0c6) 12%,transparent); }
      @media(max-width:600px) { summary { width:30px; height:30px; font-size:23px; } }
      </style><details><summary role="button" aria-label="${profile ? 'Profile' : 'Admin'} menu" aria-expanded="false" aria-controls="options">☥</summary>
      <div class="options" id="options"><button type="button">${label}</button></div></details>`;
    const details = this.shadowRoot.querySelector('details');
    const summary = this.shadowRoot.querySelector('summary');
    details.addEventListener('toggle', () => summary.setAttribute('aria-expanded', String(details.open)));
    this.closeOutside = event => { if (!event.composedPath().includes(this)) details.open = false; };
    this.shadowRoot.addEventListener('keydown', event => {
      if (event.key === 'Escape' && details.open) { details.open = false; summary.focus(); event.stopPropagation(); }
    });
    document.addEventListener('pointerdown', this.closeOutside);
  }
  disconnectedCallback() { document.removeEventListener('pointerdown', this.closeOutside); }
}
if (!customElements.get('ankh-menu')) customElements.define('ankh-menu', AnkhMenu);
