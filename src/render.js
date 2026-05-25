// Render orchestration: rewrite #root, then restore focus, scroll and observers.
//
// The app re-renders by rewriting #root.innerHTML on every state change. To keep
// text inputs usable across renders we capture the focused element's focus key,
// caret and scroll before the rewrite and restore them after. Drags suppress
// re-renders entirely (see drag.js) and mutate the dragged node's style directly.
import { S } from './store.js';
import { buildAppHTML } from './views/shell.js';

export function scheduleRender() {
  if (S.renderSuppressed) return;
  if (S.renderQueued) return;
  S.renderQueued = true;
  requestAnimationFrame(() => { S.renderQueued = false; render(); });
}

export function render() {
  const root = document.getElementById('root');
  if (!root) return;
  const active = /** @type {any} */ (document.activeElement);
  let focusInfo = null;
  if (active && active.dataset && active.dataset.focusKey && root.contains(active)) {
    focusInfo = {
      key: active.dataset.focusKey,
      start: active.selectionStart ?? null,
      end: active.selectionEnd ?? null,
      scrollTop: active.scrollTop || 0,
    };
  }
  // Preserve scroll positions of scrollable horizontal lists
  const scrollers = {};
  root.querySelectorAll('[data-scroll-key]').forEach((/** @type {any} */ el) => { scrollers[el.dataset.scrollKey] = el.scrollLeft; });

  root.innerHTML = buildAppHTML();

  // Restore scroll
  root.querySelectorAll('[data-scroll-key]').forEach((/** @type {any} */ el) => {
    const v = scrollers[el.dataset.scrollKey];
    if (typeof v === 'number') el.scrollLeft = v;
  });
  // Restore focus
  if (focusInfo) {
    const el = /** @type {any} */ (root.querySelector(`[data-focus-key="${CSS.escape(focusInfo.key)}"]`));
    if (el) {
      el.focus({ preventScroll: true });
      if (focusInfo.start !== null) {
        try { el.setSelectionRange(focusInfo.start, focusInfo.end); } catch {}
      }
      if (focusInfo.scrollTop) el.scrollTop = focusInfo.scrollTop;
    }
  }

  // Hook up canvas resize observers (they get torn down with innerHTML).
  // Don't sync-update canvasWidthPx here — that would suppress the observer's
  // initial-fire re-render. Let the observer detect the mismatch and recover.
  if (S.resizeObs) { S.resizeObs.disconnect(); S.resizeObs = null; }
  if (S.detailResizeObs) { S.detailResizeObs.disconnect(); S.detailResizeObs = null; }
  const canvas = root.querySelector('#gp-canvas');
  if (canvas) {
    S.resizeObs = new ResizeObserver(() => {
      const w = canvas.getBoundingClientRect().width;
      if (w > 0 && Math.abs(w - S.canvasWidthPx) > 2) { S.canvasWidthPx = w; scheduleRender(); }
    });
    S.resizeObs.observe(canvas);
  }
  const detail = root.querySelector('#gp-detail-canvas');
  if (detail) {
    S.detailResizeObs = new ResizeObserver(() => {
      const w = detail.getBoundingClientRect().width;
      if (w > 0 && Math.abs(w - S.detailCanvasWidthPx) > 2) { S.detailCanvasWidthPx = w; scheduleRender(); }
    });
    S.detailResizeObs.observe(detail);
  }
}
