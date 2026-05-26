// Central mutable application state plus localStorage persistence.
//
// All reassignable state lives on the single `S` object so that other modules
// can both read and mutate it across ES-module boundaries (a plain exported
// `let` can be read but not reassigned by an importer). `S.state` is the
// persisted garden document; the remaining fields are transient UI state.
import { migrateState } from './lib/migrate.js';
import { DEFAULT_STATE } from './lib/factory.js';

export const STORAGE_KEY = 'garden-planner:v4';
const LEGACY_KEYS = ['garden-planner:v3', 'garden-planner:v2', 'garden-planner:v1'];

/** @type {Record<string, any>} */
export const S = {
  state: null,            // persisted garden document
  history: [],            // undo stack (deep snapshots)
  future: [],             // redo stack (states popped by undo)
  view: 'design',         // active top-level tab
  pickerMode: 'plants',   // 'plants' | 'objects'
  pickerOpen: true,       // plant/object catalogue expanded on the design tab
  canvasFocus: false,     // garden map opened in full-screen focus view
  selectedPlant: null,    // plant id armed for placing
  selectedItem: null,     // { type, id } currently selected on the canvas
  plantCategory: 'all',
  objectCategory: 'all',
  plantSearch: '',        // free-text filter for the plant/object pickers
  editingName: false,
  gardenSettingsOpen: false,
  infoPlantId: null,
  notesBedId: null,
  viewMonth: 0,
  newTaskText: '',
  bedDetailId: null,
  canvasWidthPx: 800,
  detailCanvasWidthPx: 800,
  drag: null,
  saveTimer: null,
  resizeObs: null,
  detailResizeObs: null,
  pathDraftId: null,      // id of the path currently being drawn
  pathDraftStyle: 'gravel',
  renderQueued: false,
  renderSuppressed: false, // true while a drag is in progress
  toolsOpen: false,        // backup & share panel expanded
  flash: null,             // transient toast message
  flashAction: null,       // optional { label, action } button shown in the toast
  flashTimer: null,
  swUpdateReady: false,    // a new app version is waiting to activate
  applyUpdate: null,       // () => void: activate the waiting service worker
};

export function load() {
  let raw = null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch {}
  if (!raw) {
    for (const k of LEGACY_KEYS) {
      try { const r = localStorage.getItem(k); if (r) { raw = r; break; } } catch {}
    }
  }
  try {
    S.state = raw ? migrateState(JSON.parse(raw)) : structuredClone(DEFAULT_STATE);
  } catch {
    S.state = structuredClone(DEFAULT_STATE);
  }
}

export function saveSoon() {
  if (S.saveTimer) clearTimeout(S.saveTimer);
  S.saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S.state)); } catch {}
  }, 300);
}

/** Flush any pending debounced save immediately (used on tab close). */
export function flushSave() {
  if (S.saveTimer) {
    clearTimeout(S.saveTimer);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S.state)); } catch {}
  }
}
