// State mutations. Each commits to the store and (where the layout changes
// structurally) snapshots history and schedules a re-render.
import { S, saveSoon } from './store.js';
import { snap } from './history.js';
import { scheduleRender } from './render.js';
import { clamp, newId } from './lib/util.js';
import { newBed, newPlanting, newObjectInst, newTask } from './lib/factory.js';
import { OBJECT_BY_ID } from './data/objects.js';
import { bedLocalToWorld } from './lib/geometry.js';
import { curveSegmentMid } from './lib/splines.js';

export function setView(v) { S.bedDetailId = null; S.view = v; scheduleRender(); }

export function placePlantAt(clientX, clientY) {
  if (!S.selectedPlant) return;
  const canvas = document.getElementById('gp-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width * S.state.gardenLengthM;
  const y = (clientY - rect.top) / rect.height * S.state.gardenWidthM;
  if (x < 0 || x > S.state.gardenLengthM || y < 0 || y > S.state.gardenWidthM) return;
  snap();
  S.state.plantings.push(newPlanting(S.selectedPlant, x, y));
  saveSoon();
  scheduleRender();
}

export function placePlantInBedAt(clientX, clientY) {
  if (!S.selectedPlant || !S.bedDetailId) return;
  const bed = S.state.beds.find(b => b.id === S.bedDetailId);
  const canvas = document.getElementById('gp-detail-canvas');
  if (!bed || !canvas) return;
  const rect = canvas.getBoundingClientRect();
  const lx = clamp((clientX - rect.left) / rect.width * bed.lengthM, 0, bed.lengthM);
  const ly = clamp((clientY - rect.top) / rect.height * bed.widthM, 0, bed.widthM);
  const [wx, wy] = bedLocalToWorld(bed, lx, ly);
  snap();
  S.state.plantings.push(newPlanting(S.selectedPlant, wx, wy));
  saveSoon();
  scheduleRender();
}

export function addBed() {
  snap();
  const bed = newBed(
    `Bed ${S.state.beds.length + 1}`,
    Math.max(0.3, S.state.gardenLengthM / 2 - 1.2),
    Math.max(0.3, S.state.gardenWidthM / 2 - 0.6),
    Math.min(2.4, S.state.gardenLengthM - 1),
    Math.min(1.2, S.state.gardenWidthM - 1),
  );
  S.state.beds.push(bed);
  S.selectedItem = { type: 'bed', id: bed.id };
  saveSoon();
  scheduleRender();
}

export function addObject(typeId) {
  snap();
  const tpl = OBJECT_BY_ID[typeId];
  const obj = newObjectInst(
    typeId,
    Math.max(tpl.L / 2, S.state.gardenLengthM / 2 - tpl.L / 2),
    Math.max(tpl.W / 2, S.state.gardenWidthM / 2 - tpl.W / 2),
  );
  S.state.objects.push(obj);
  S.selectedItem = { type: 'object', id: obj.id };
  saveSoon();
  scheduleRender();
}

export function deleteSelected() {
  if (!S.selectedItem) return;
  snap();
  if (S.selectedItem.type === 'bed') S.state.beds = S.state.beds.filter(b => b.id !== S.selectedItem.id);
  else if (S.selectedItem.type === 'object') S.state.objects = S.state.objects.filter(o => o.id !== S.selectedItem.id);
  else if (S.selectedItem.type === 'planting') S.state.plantings = S.state.plantings.filter(p => p.id !== S.selectedItem.id);
  else if (S.selectedItem.type === 'path') S.state.paths = S.state.paths.filter(p => p.id !== S.selectedItem.id);
  S.selectedItem = null;
  saveSoon();
  scheduleRender();
}

export function duplicateSelected() {
  if (!S.selectedItem) return;
  snap();
  if (S.selectedItem.type === 'bed') {
    const b = S.state.beds.find(x => x.id === S.selectedItem.id);
    if (!b) return;
    const copy = { ...b, id: newId('bed'), name: `${b.name} copy`, x: b.x + 0.3, y: b.y + 0.3, tasks: b.tasks.map(t => ({ ...t, id: newId('task') })) };
    S.state.beds.push(copy);
    S.selectedItem = { type: 'bed', id: copy.id };
  } else if (S.selectedItem.type === 'object') {
    const o = S.state.objects.find(x => x.id === S.selectedItem.id);
    if (!o) return;
    const copy = { ...o, id: newId('obj'), x: o.x + 0.3, y: o.y + 0.3 };
    S.state.objects.push(copy);
    S.selectedItem = { type: 'object', id: copy.id };
  } else if (S.selectedItem.type === 'planting') {
    const p = S.state.plantings.find(x => x.id === S.selectedItem.id);
    if (!p) return;
    const copy = { ...p, id: newId('plant'), x: p.x + 0.25, y: p.y + 0.25 };
    S.state.plantings.push(copy);
    S.selectedItem = { type: 'planting', id: copy.id };
  }
  saveSoon();
  scheduleRender();
}

export function updateBed(id, patch) {
  const b = S.state.beds.find(b => b.id === id);
  if (!b) return;
  Object.assign(b, patch);
  saveSoon();
}

export function updateObject(id, patch) {
  const o = S.state.objects.find(o => o.id === id);
  if (!o) return;
  Object.assign(o, patch);
  saveSoon();
}

export function updatePlanting(id, patch) {
  const p = S.state.plantings.find(p => p.id === id);
  if (!p) return;
  Object.assign(p, patch);
  saveSoon();
}

export function updatePath(id, patch) {
  const p = S.state.paths.find(p => p.id === id);
  if (!p) return;
  Object.assign(p, patch);
  saveSoon();
}

export function updatePathPoint(id, idx, pctX, pctY) {
  const p = S.state.paths.find(p => p.id === id);
  if (!p || !p.points[idx]) return;
  p.points[idx].x = clamp(pctX, 0, 100);
  p.points[idx].y = clamp(pctY, 0, 100);
  saveSoon();
}

// Start a new path-draw session — every subsequent canvas tap adds a waypoint.
export function startPathDraft(style = 'gravel') {
  snap();
  S.pathDraftStyle = style;
  const id = newId('path');
  S.state.paths.push({ id, style, widthM: 0.6, points: [] });
  S.pathDraftId = id;
  S.selectedItem = null;
  saveSoon();
  scheduleRender();
}

// Add a waypoint to the in-progress path (called from canvas tap when pathDraftId set).
export function appendPathPoint(pctX, pctY) {
  if (!S.pathDraftId) return;
  const p = S.state.paths.find(p => p.id === S.pathDraftId);
  if (!p) return;
  p.points.push({ x: clamp(pctX, 0, 100), y: clamp(pctY, 0, 100) });
  saveSoon();
  scheduleRender();
}

// Finish drawing — keep the path if it has at least 2 points, otherwise discard.
export function finishPathDraft() {
  if (!S.pathDraftId) return;
  const p = S.state.paths.find(p => p.id === S.pathDraftId);
  const id = S.pathDraftId;
  S.pathDraftId = null;
  if (!p || p.points.length < 2) {
    S.state.paths = S.state.paths.filter(x => x.id !== id);
  } else {
    S.selectedItem = { type: 'path', id };
  }
  saveSoon();
  scheduleRender();
}

export function cancelPathDraft() {
  if (!S.pathDraftId) return;
  S.state.paths = S.state.paths.filter(p => p.id !== S.pathDraftId);
  S.pathDraftId = null;
  saveSoon();
  scheduleRender();
}

export function insertPathPoint(pathId, afterIndex) {
  const p = S.state.paths.find(p => p.id === pathId);
  if (!p) return;
  const a = p.points[afterIndex];
  const b = p.points[afterIndex + 1];
  if (!a || !b) return;
  snap();
  // Insert at the curve midpoint between the two waypoints (Bezier mid, not Euclidean)
  const mid = curveSegmentMid(p.points[afterIndex - 1], a, b, p.points[afterIndex + 2]);
  p.points.splice(afterIndex + 1, 0, { x: mid.x, y: mid.y });
  saveSoon();
  scheduleRender();
}

export function deletePathPoint(pathId, idx) {
  const p = S.state.paths.find(p => p.id === pathId);
  if (p && p.points.length > 2) {
    snap();
    p.points.splice(idx, 1);
    saveSoon();
    scheduleRender();
  }
}

export function setGardenName(v) { S.state.gardenName = v; saveSoon(); }

export function setGardenSize(field, v) {
  S.state[field] = clamp(+v || 1, 1, 30);
  saveSoon();
  scheduleRender();
}

export function addBedTask(bedId, text) {
  const t = text.trim();
  if (!t) return;
  snap();
  const b = S.state.beds.find(b => b.id === bedId);
  if (b) b.tasks.push(newTask(t));
  S.newTaskText = '';
  saveSoon();
  scheduleRender();
}

export function toggleBedTask(bedId, taskId) {
  const b = S.state.beds.find(b => b.id === bedId);
  const t = b && b.tasks.find(t => t.id === taskId);
  if (t) { t.done = !t.done; saveSoon(); scheduleRender(); }
}

export function deleteBedTask(bedId, taskId) {
  snap();
  const b = S.state.beds.find(b => b.id === bedId);
  if (b) b.tasks = b.tasks.filter(t => t.id !== taskId);
  saveSoon();
  scheduleRender();
}

export function toggleShopping(key) {
  S.state.shopping = { ...S.state.shopping, [key]: !S.state.shopping[key] };
  saveSoon();
  scheduleRender();
}

export function setBedNotes(bedId, notes) {
  const b = S.state.beds.find(b => b.id === bedId);
  if (b) { b.notes = notes; saveSoon(); }
}
