// Undo history: deep snapshots of the garden document, capped at 50 entries.
import { S, saveSoon } from './store.js';
import { scheduleRender } from './render.js';

export function pushHistory(snapshot) {
  S.history.push(JSON.parse(JSON.stringify(snapshot)));
  if (S.history.length > 50) S.history.shift();
}

/** Snapshot the current document onto the undo stack. */
export function snap() { pushHistory(S.state); }

export function undo() {
  if (!S.history.length) return;
  S.state = S.history.pop();
  S.selectedItem = null;
  saveSoon();
  scheduleRender();
}
