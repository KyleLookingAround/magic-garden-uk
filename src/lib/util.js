// Tiny, dependency-free helpers shared across the app.

/** HTML-escape a value for safe interpolation into template strings. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Constrain a number to the inclusive [min, max] range. */
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/** Generate a reasonably-unique id with a human-readable prefix. */
export const newId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Inclusive list of 1-indexed months from `a` to `b`, wrapping past December. */
export const mrange = (a, b) => {
  const out = [];
  let m = a;
  for (let i = 0; i < 12; i++) {
    out.push(m);
    if (m === b) break;
    m = m === 12 ? 1 : m + 1;
  }
  return out;
};
