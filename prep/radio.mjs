// Immutable standalone product pin used by DecentCanopy bcf2572.
export const WIDGET_URL = 'https://cdn.jsdelivr.net/gh/A-Decent-Agency/DBuskRadio@1fe9ed0c2afc61552328fdda10d0f199bc3eaee9/widget.js';
export function createRadio({ element, status, loadWidget = url => import(url) }) {
  let widget, generation = 0, loading = false;
  function destroy() {
    generation++;
    loading = false;
    widget?.destroy();
    widget = null;
    element.replaceChildren();
    status.textContent = 'Radio not loaded · no further radio requests';
  }
  async function load(consent) {
    if (!consent) { status.textContent = 'Choose external-radio consent first. No request made.'; return false; }
    if (loading || widget) return Boolean(widget);
    loading = true;
    const current = ++generation;
    status.textContent = 'Loading opted-in DBuskRadio…';
    try {
      const module = await loadWidget(WIDGET_URL);
      if (current !== generation) return false;
      if (typeof module.mount !== 'function') throw new Error('Widget mount API unavailable');
      widget = module.mount(element, { workerUrl: 'https://decentbusking.onrender.com', compact: true, theme: 'dark', volume: 0.08 });
      if (!widget || typeof widget.destroy !== 'function') throw new Error('Widget cleanup API unavailable');
      status.textContent = 'DBuskRadio loaded · press Play to listen. Radio service errors are shown by the widget.';
      return true;
    } catch {
      if (current === generation) {
        widget?.destroy?.(); widget = null; element.replaceChildren();
        status.textContent = 'DBuskRadio unavailable. No autoplay. Use Retry radio to try again, or unload.';
      }
      return false;
    } finally { if (current === generation) loading = false; }
  }
  return { load, destroy };
}
