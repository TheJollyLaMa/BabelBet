// Shared Decent orbit dock: sparks, constellation lines, and ring text that circles a core button.
const SPARKS = [[-58, .68], [-18, 1.06], [22, .66], [64, 1.08], [128, .7], [182, 1.05], [236, .67], [292, 1.07]]; // alternate inside/outside the ring text
const RING = 80; // ring-text radius inside the 200×200 orbit viewBox
let uid = 0;

const point = ([angle, distance]) => {
  const radians = (angle - 90) * Math.PI / 180, radius = distance * 92;
  return { x: 100 + radius * Math.cos(radians), y: 100 + radius * Math.sin(radians) };
};

function constellation() {
  const points = SPARKS.map(point), lines = [];
  points.forEach((from, i) => {
    const to = points[(i + 2) % points.length];
    const length = Math.hypot(to.x - from.x, to.y - from.y).toFixed(1);
    const attrs = `x1="${from.x.toFixed(1)}" y1="${from.y.toFixed(1)}" x2="${to.x.toFixed(1)}" y2="${to.y.toFixed(1)}"`;
    lines.push(`<line class="link-base" ${attrs}/><line class="link-pulse" ${attrs} style="--len:${length};--dur:${(3 + i * .7).toFixed(1)}s;--delay:${(-i * .9).toFixed(1)}s;stroke-dasharray:6 ${length}"/>`);
  });
  return lines.join('');
}

export function orbitMarkup(core) {
  const id = `dh-ring-${++uid}`;
  return `<div class="orb" part="orbit" data-state="idle">
    <svg class="orb-links" viewBox="0 0 200 200" aria-hidden="true">${constellation()}</svg>
    ${SPARKS.map(([a, d], i) => `<span class="spark" aria-hidden="true" style="--a:${a}deg;--d:${d};--i:${i}"></span>`).join('')}
    <span class="rail" aria-hidden="true"></span>
    <svg class="ring" viewBox="0 0 200 200" aria-hidden="true">
      <path id="${id}" fill="none" d="M100,100 m-${RING},0 a${RING},${RING} 0 1,1 ${RING * 2},0 a${RING},${RING} 0 1,1 -${RING * 2},0"/>
      <text><textPath href="#${id}" textLength="${(2 * Math.PI * RING - 8).toFixed(1)}" lengthAdjust="spacing"></textPath></text>
    </svg>
    <div class="core">${core}</div>
  </div>`;
}

export function setRing(root, text, state) {
  const orb = root.querySelector('.orb');
  if (!orb) return;
  orb.dataset.state = state;
  orb.querySelector('textPath').textContent = text;
}

export const orbitCSS = `
  .orb { --orb-size:var(--dh-orbit-size,132px); position:relative; width:var(--orb-size); height:var(--orb-size); flex:none; display:grid; place-items:center; }
  .orb > svg { position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none; }
  .rail { position:absolute; inset:14%; border-radius:50%; border:1px solid color-mix(in srgb,var(--dh-accent-2,#8d7cf7) 45%,transparent);
    box-shadow:0 0 26px color-mix(in srgb,var(--dh-accent-2,#8d7cf7) 28%,transparent), inset 0 0 22px color-mix(in srgb,var(--dh-accent,#7af0c6) 12%,transparent); }
  .spark { position:absolute; top:50%; left:50%; width:5%; height:5%; border-radius:30%;
    background:linear-gradient(135deg,var(--dh-accent-2,#8d7cf7),var(--dh-accent,#7af0c6)); border:1px solid #ffffff33;
    box-shadow:0 0 10px color-mix(in srgb,var(--dh-accent-2,#8d7cf7) 45%,transparent);
    transform:translate(-50%,-50%) rotate(var(--a)) translateY(calc(var(--orb-size) * -.46 * var(--d))) rotate(45deg);
    animation:dh-twinkle calc(2.4s + var(--i) * .35s) ease-in-out infinite; animation-delay:calc(var(--i) * -.7s); }
  .spark:nth-of-type(2n) { background:linear-gradient(135deg,var(--dh-accent,#7af0c6),var(--dh-accent-2,#8d7cf7)); }
  .link-base { stroke:color-mix(in srgb,var(--dh-accent,#7af0c6) 12%,transparent); stroke-width:1; }
  .link-pulse { stroke:var(--dh-accent,#7af0c6); stroke-width:1.3; stroke-linecap:round; stroke-dashoffset:var(--len);
    filter:drop-shadow(0 0 3px var(--dh-accent,#7af0c6)); animation:dh-shoot var(--dur) linear infinite; animation-delay:var(--delay); }
  .ring { animation:dh-spin 18s linear infinite; transition:opacity .4s ease; opacity:.55; }
  .ring text { fill:var(--dh-accent,#7af0c6); font:700 12.5px ui-monospace,SFMono-Regular,Menlo,monospace; filter:drop-shadow(0 0 4px var(--dh-accent,#7af0c6)); }
  .orb[data-state="connected"] .ring, .orb[data-state="ready"] .ring { opacity:1; }
  .orb[data-state="error"] .ring text { fill:#ff8a8a; filter:drop-shadow(0 0 4px #ff6b6b); }
  .core { position:relative; z-index:1; width:52%; height:52%; display:grid; place-items:center; }
  @keyframes dh-spin { to { transform:rotate(360deg); } }
  @keyframes dh-twinkle { 0%,100% { opacity:.35; filter:brightness(.8); } 50% { opacity:1; filter:brightness(1.8) drop-shadow(0 0 6px #eef8ff); } }
  @keyframes dh-shoot { from { stroke-dashoffset:var(--len); } to { stroke-dashoffset:0; } }
  @media (prefers-reduced-motion:reduce) { .ring, .spark, .link-pulse { animation:none; } .link-pulse { display:none; } }
  @media (max-width:600px) { .orb { --orb-size:var(--dh-orbit-size-mobile,92px); } .ring text { font-size:14px; } }
`;
