export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
export function safeURL(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try { const url = new URL(value, globalThis.document?.baseURI); return ['https:', 'http:', 'ipfs:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
}
export function bindModalClose(dialog) {
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  let outside = false;
  const isOutside = event => {
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  };
  dialog.addEventListener('pointerdown', event => { outside = event.target === dialog && isOutside(event); });
  dialog.addEventListener('click', event => {
    if (outside && event.target === dialog && isOutside(event)) dialog.close();
    outside = false;
  });
}
export function modalHeading(title, id, icon) {
  return `<div class="modal-heading"><h2 id="${id}"><span aria-hidden="true">${icon}</span> ${escapeHTML(title)}</h2>
    <button class="modal-close" data-close type="button" aria-label="Close" title="Close (Esc)">&#215;</button></div>`;
}
export const modalStyles = `
  :host { font:14px/1.5 system-ui,sans-serif; color:var(--dh-text,#eef8ff); }
  dialog { box-sizing:border-box; width:min(560px,calc(100vw - 24px)); max-height:calc(100dvh - 32px); overflow:auto; padding:0 24px 24px; border:1px solid color-mix(in srgb,var(--dh-accent,#80edd2) 50%,transparent); border-radius:22px; background:var(--dh-bg-1,#0b1424); color:inherit; box-shadow:0 24px 100px #0009; }
  dialog::backdrop { background:#000b; backdrop-filter:blur(4px); }
  button,input,select { font:inherit; padding:9px; border-radius:7px; border:1px solid var(--dh-accent,#80edd2); color:inherit; background:var(--dh-bg-2,#192c40); box-sizing:border-box; max-width:100%; }
  button { cursor:pointer; } button:disabled { opacity:.5; cursor:default; } a { color:var(--dh-accent,#80edd2); }
  button:focus-visible,a:focus-visible,input:focus-visible { outline:3px solid var(--dh-accent,#80edd2); outline-offset:3px; }
  label { display:block; margin:16px 0; } p { overflow-wrap:anywhere; margin:12px 0; } h2 { margin:0; font-size:20px; } h3 { font-size:15px; margin:0; }
  .modal-heading { position:sticky; top:0; z-index:2; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 0; background:var(--dh-bg-1,#0b1424); }
  .modal-heading h2 span { color:var(--dh-accent,#80edd2); margin-right:6px; }
  .modal-close { display:grid; place-items:center; flex:none; width:40px; height:40px; padding:0; border:1px solid #ffffff22; border-radius:50%; font-size:26px; background:#ffffff08; }
  .modal-close:hover { background:#ffffff18; }
  details, section { border:1px solid #ffffff18; border-radius:14px; padding:14px 16px; margin:12px 0; background:#ffffff03; }
  details > summary { cursor:pointer; font-weight:600; padding:2px 0; }
  details[open] > summary { margin-bottom:16px; }
  details details { padding:10px 12px; }
  input:not([type=checkbox]),select { display:block; width:100%; margin-top:6px; }
  input[type=checkbox] { width:18px; height:18px; vertical-align:middle; margin-right:8px; }
  ul { list-style:none; padding:0; margin:8px 0; display:flex; flex-wrap:wrap; gap:12px; }
  .quiet { color:var(--dh-muted,#bdd0e4); font-size:12px; }
  .modal-footer { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-top:20px; }
  [hidden] { display:none !important; }
  @media(max-width:600px) { dialog { padding:0 16px 20px; } }
`;
