// Undo/redo history: deep snapshots of the garden document, each stack capped at 50.
import { S, saveSoon } from './store.js';
import { scheduleRender } from './render.js';

const clone = (s) => JSON.parse(JSON.stringify(s));

export function pushHistory(snapshot) {
  S.history.push(clone(snapshot));
  if (S.history.length > 50) S.history.shift();
  // Any fresh change invalidates anything that was undone.
  S.future = [];
}

/** Snapshot the current document onto the undo stack. */
export function snap() { pushHistory(S.state); }

export function undo() {
  if (!S.history.length) return;
  S.future.push(clone(S.state));
  if (S.future.length > 50) S.future.shift();
  S.state = S.history.pop();
  S.selectedItem = null;
  saveSoon();
  scheduleRender();
}

export function redo() {
  if (!S.future.length) return;
  S.history.push(clone(S.state));
  if (S.history.length > 50) S.history.shift();
  S.state = S.future.pop();
  S.selectedItem = null;
  saveSoon();
  scheduleRender();
}
