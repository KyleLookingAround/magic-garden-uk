// Browser glue for the offline backup / share / print features: triggers file
// downloads and uploads, copies share links, and loads a plan from a share
// link's hash. The pure serialisation lives in lib/transfer.js and lib/calendar.js.
import { S, saveSoon } from './store.js';
import { scheduleRender } from './render.js';
import { snap } from './history.js';
import { serializePlan, parsePlan, encodePlanToHash, decodePlanFromHash } from './lib/transfer.js';
import { buildICS } from './lib/calendar.js';

/**
 * Show a brief, self-dismissing toast message (rendered by the shell).
 * Pass `action` as `{ label, action }` to add a button wired to a data-action
 * (e.g. an "Undo" button after a delete).
 */
export function flash(msg, action = null) {
  S.flash = msg;
  S.flashAction = action;
  scheduleRender();
  clearTimeout(S.flashTimer);
  S.flashTimer = setTimeout(() => { if (S.flash === msg) { S.flash = null; S.flashAction = null; scheduleRender(); } }, action ? 6000 : 2800);
}

/** Filesystem-safe slug from the garden name, for download filenames. */
function slug() {
  return (S.state.gardenName || 'garden').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'garden';
}

function download(filename, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportPlan() {
  download(`${slug()}.garden.json`, serializePlan(S.state), 'application/json');
  flash('Backup downloaded');
}

export function exportCalendar() {
  const ics = buildICS(S.state);
  if (!/BEGIN:VEVENT/.test(ics)) { flash('Nothing to add — plant something first'); return; }
  download(`${slug()}-calendar.ics`, ics, 'text/calendar');
  flash('Calendar downloaded');
}

export function importPlan() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const state = parsePlan(String(reader.result));
        snap();
        S.state = state;
        S.selectedItem = null;
        S.bedDetailId = null;
        S.toolsOpen = false;
        saveSoon();
        scheduleRender();
        flash('Plan imported');
      } catch {
        flash('Could not read that file');
      }
    };
    reader.onerror = () => flash('Could not read that file');
    reader.readAsText(file);
  });
  input.click();
}

export async function sharePlan() {
  const url = `${location.origin}${location.pathname}#plan=${encodePlanToHash(S.state)}`;
  const long = url.length > 8000;
  // Prefer the native share sheet where available (great on mobile) so the user
  // can send straight to Messages/Mail/etc. Fall back to clipboard, then prompt.
  if (navigator.share) {
    try {
      await navigator.share({ title: S.state.gardenName || 'My garden', text: 'My garden plan', url });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return; // user dismissed the sheet
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    flash(long ? 'Link copied (large plan — may be long)' : 'Share link copied');
  } catch {
    window.prompt('Copy this share link', url);
  }
}

export function printPlan() {
  window.print();
}

/**
 * If the page was opened with a `#plan=…` share link, offer to load it in place
 * of the current plan. Always strips the hash so a refresh won't reload it.
 * Call once, after store.load() and before the first render.
 */
export function maybeLoadSharedPlan() {
  const m = location.hash.match(/[#&]plan=([^&]+)/);
  if (!m) return;
  let shared = null;
  try { shared = decodePlanFromHash(m[1]); } catch { shared = null; }
  history.replaceState(null, '', location.pathname + location.search);
  if (!shared) return;
  if (!window.confirm('Open the shared garden? This replaces the plan saved in this browser.')) return;
  S.state = shared;
  S.selectedItem = null;
  S.bedDetailId = null;
  saveSoon();
}
