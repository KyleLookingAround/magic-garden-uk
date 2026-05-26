// Pointer-driven drag system for beds, objects, plantings and path waypoints.
//
// While a drag is in progress we suppress full re-renders and mutate the dragged
// DOM node's style directly (updateDragVisual) so touch tracking stays smooth and
// the browser's implicit pointer capture keeps working. A single history snapshot
// is taken at drag start and committed on pointer-up only if the item actually moved.
import { S, saveSoon } from './store.js';
import { pushHistory } from './history.js';
import { rotateVec, angleBetween, bedLocalToWorld, worldToBedLocal } from './lib/geometry.js';
import { clamp } from './lib/util.js';
import { updateBed, updateObject, updatePlanting, updatePathPoint, placePlantAt } from './actions.js';
import { render, scheduleRender } from './render.js';

// Find the DOM element being dragged so we can mutate its style directly
// instead of re-rendering the entire app on every pointer move.
function findDragEl() {
  if (!S.drag) return null;
  const root = document.getElementById('root');
  if (!root) return null;
  if (S.drag.type === 'bed' || S.drag.type === 'object') {
    return root.querySelector('.gp-rect[data-type="' + S.drag.type + '"][data-id="' + S.drag.id + '"]');
  } else if (S.drag.type === 'planting') {
    return root.querySelector('#gp-canvas .gp-planting[data-id="' + S.drag.id + '"]');
  } else if (S.drag.type === 'detail-planting') {
    return root.querySelector('#gp-detail-canvas .gp-planting[data-id="' + S.drag.id + '"]');
  }
  return null;
}

// Apply the current state of the dragged item directly to its DOM node.
// Cheap, no full re-render, no animations, no focus-restoration overhead.
function updateDragVisual() {
  const el = /** @type {any} */ (findDragEl());
  if (!el) return;
  if (S.drag.type === 'bed' || S.drag.type === 'object') {
    const item = (S.drag.type === 'bed' ? S.state.beds : S.state.objects).find(x => x.id === S.drag.id);
    if (!item) return;
    const scale = S.canvasWidthPx / S.state.gardenLengthM;
    el.style.left = ((item.x + item.lengthM / 2) / S.state.gardenLengthM) * 100 + '%';
    el.style.top = ((item.y + item.widthM / 2) / S.state.gardenWidthM) * 100 + '%';
    el.style.width = (item.lengthM * scale) + 'px';
    el.style.height = (item.widthM * scale) + 'px';
    el.style.transform = 'translate(-50%,-50%) rotate(' + (item.rotation || 0) + 'deg)';
  } else if (S.drag.type === 'planting') {
    const p = S.state.plantings.find(x => x.id === S.drag.id);
    if (!p) return;
    el.style.left = (p.x / S.state.gardenLengthM) * 100 + '%';
    el.style.top = (p.y / S.state.gardenWidthM) * 100 + '%';
  } else if (S.drag.type === 'detail-planting') {
    const bed = S.state.beds.find(b => b.id === S.drag.bedId);
    const p = S.state.plantings.find(x => x.id === S.drag.id);
    if (!bed || !p) return;
    const [lx, ly] = worldToBedLocal(bed, p.x, p.y);
    el.style.left = (lx / bed.lengthM) * 100 + '%';
    el.style.top = (ly / bed.widthM) * 100 + '%';
  }
}

export function startDrag(e, type, id, mode, targetEl) {
  mode = mode || 'move';
  e.stopPropagation();
  if ((type === 'bed' || type === 'object') && mode === 'move' && S.selectedPlant) {
    placePlantAt(e.clientX, e.clientY);
    return;
  }
  const canvas = document.getElementById('gp-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const scalePx = rect.width / S.state.gardenLengthM;
  /** @type {any} */
  let initial;
  if (type === 'bed' || type === 'object') {
    const item = (type === 'bed' ? S.state.beds : S.state.objects).find(x => x.id === id);
    if (!item) return;
    initial = { x: item.x, y: item.y, lengthM: item.lengthM, widthM: item.widthM, rotation: item.rotation || 0 };
    if (mode === 'rotate') {
      const cxM = item.x + item.lengthM / 2;
      const cyM = item.y + item.widthM / 2;
      const cxPx = rect.left + (cxM / S.state.gardenLengthM) * rect.width;
      const cyPx = rect.top + (cyM / S.state.gardenWidthM) * rect.height;
      initial.startAngle = angleBetween(cxPx, cyPx, e.clientX, e.clientY);
    }
  } else if (type === 'planting') {
    const p = S.state.plantings.find(p => p.id === id);
    if (!p) return;
    initial = { x: p.x, y: p.y };
  }
  S.drag = { type, id, mode, startX: e.clientX, startY: e.clientY, scalePx, initial, preDragState: JSON.parse(JSON.stringify(S.state)), moved: false };
  S.selectedItem = { type, id };
  // Suppress re-renders for the duration of the drag — the dragged element gets
  // updated in place by updateDragVisual instead of being destroyed and recreated.
  S.renderSuppressed = true;
  e.preventDefault();
}

export function startPathPointDrag(e, pathId, pointIndex, targetEl) {
  e.stopPropagation();
  const canvas = document.getElementById('gp-canvas');
  if (!canvas) return;
  const path = S.state.paths.find(p => p.id === pathId);
  if (!path || !path.points[pointIndex]) return;
  S.drag = {
    type: 'path-point',
    pathId,
    pointIndex,
    startX: e.clientX,
    startY: e.clientY,
    initial: { ...path.points[pointIndex] },
    preDragState: JSON.parse(JSON.stringify(S.state)),
    moved: false,
  };
  S.selectedItem = { type: 'path', id: pathId };
  S.renderSuppressed = true;
  e.preventDefault();
}

export function startDetailDrag(e, plantingId, targetEl) {
  e.stopPropagation();
  if (!S.bedDetailId) return;
  const bed = S.state.beds.find(b => b.id === S.bedDetailId);
  const p = S.state.plantings.find(p => p.id === plantingId);
  const canvas = document.getElementById('gp-detail-canvas');
  if (!bed || !p || !canvas) return;
  const rect = canvas.getBoundingClientRect();
  const scalePx = rect.width / bed.lengthM;
  const [lx, ly] = worldToBedLocal(bed, p.x, p.y);
  S.drag = { type: 'detail-planting', id: plantingId, bedId: bed.id, startX: e.clientX, startY: e.clientY, scalePx, initialLocal: [lx, ly], preDragState: JSON.parse(JSON.stringify(S.state)), moved: false };
  S.selectedItem = { type: 'planting', id: plantingId };
  S.renderSuppressed = true;
  e.preventDefault();
}

function snapPosition(nx, ny, L, W, selfId) {
  const SNAP = 0.12;
  const vCands = [0, S.state.gardenLengthM];
  const hCands = [0, S.state.gardenWidthM];
  [...S.state.beds, ...S.state.objects].forEach(it => {
    if (it.id === selfId) return;
    vCands.push(it.x, it.x + it.lengthM);
    hCands.push(it.y, it.y + it.widthM);
  });
  let sx = nx, sy = ny;
  for (const c of vCands) {
    if (Math.abs(nx - c) < SNAP) { sx = c; break; }
    if (Math.abs((nx + L) - c) < SNAP) { sx = c - L; break; }
  }
  for (const c of hCands) {
    if (Math.abs(ny - c) < SNAP) { sy = c; break; }
    if (Math.abs((ny + W) - c) < SNAP) { sy = c - W; break; }
  }
  return [sx, sy];
}

export function onPointerMove(e) {
  if (!S.drag) return;
  if (Math.abs(e.clientX - S.drag.startX) > 2 || Math.abs(e.clientY - S.drag.startY) > 2) S.drag.moved = true;
  if (!S.drag.moved) return;

  // Path-point drag uses % units. SVG re-renders are cheap, so we bypass
  // renderSuppressed temporarily for these.
  if (S.drag.type === 'path-point') {
    const canvas = document.getElementById('gp-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dxPct = ((e.clientX - S.drag.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - S.drag.startY) / rect.height) * 100;
    updatePathPoint(S.drag.pathId, S.drag.pointIndex, S.drag.initial.x + dxPct, S.drag.initial.y + dyPct);
    S.renderSuppressed = false;
    render();
    S.renderSuppressed = true;
    return;
  }

  const dxScreen = (e.clientX - S.drag.startX) / S.drag.scalePx;
  const dyScreen = (e.clientY - S.drag.startY) / S.drag.scalePx;

  if ((S.drag.type === 'bed' || S.drag.type === 'object') && S.drag.mode === 'move') {
    const L = S.drag.initial.lengthM, W = S.drag.initial.widthM;
    let nx = clamp(S.drag.initial.x + dxScreen, -L * 0.3, S.state.gardenLengthM - L * 0.7);
    let ny = clamp(S.drag.initial.y + dyScreen, -W * 0.3, S.state.gardenWidthM - W * 0.7);
    [nx, ny] = snapPosition(nx, ny, L, W, S.drag.id);
    const patch = { x: nx, y: ny };
    if (S.drag.type === 'bed') updateBed(S.drag.id, patch); else updateObject(S.drag.id, patch);
  } else if ((S.drag.type === 'bed' || S.drag.type === 'object') && S.drag.mode === 'resize') {
    const [dxLocal, dyLocal] = rotateVec(dxScreen, dyScreen, S.drag.initial.rotation || 0);
    const patch = {
      lengthM: clamp(S.drag.initial.lengthM + dxLocal, 0.2, 30),
      widthM: clamp(S.drag.initial.widthM + dyLocal, 0.2, 30),
    };
    if (S.drag.type === 'bed') updateBed(S.drag.id, patch); else updateObject(S.drag.id, patch);
  } else if ((S.drag.type === 'bed' || S.drag.type === 'object') && S.drag.mode === 'rotate') {
    const item = (S.drag.type === 'bed' ? S.state.beds : S.state.objects).find(x => x.id === S.drag.id);
    if (!item) return;
    const cxM = item.x + item.lengthM / 2;
    const cyM = item.y + item.widthM / 2;
    const canvas = document.getElementById('gp-canvas');
    const rect = canvas.getBoundingClientRect();
    const cxPx = rect.left + (cxM / S.state.gardenLengthM) * rect.width;
    const cyPx = rect.top + (cyM / S.state.gardenWidthM) * rect.height;
    const cur = angleBetween(cxPx, cyPx, e.clientX, e.clientY);
    let r = S.drag.initial.rotation + (cur - S.drag.initial.startAngle);
    if (e.shiftKey) r = Math.round(r / 15) * 15;
    else {
      for (const s of [0, 90, 180, 270, -90, -180, -270, 360, -360]) {
        if (Math.abs(r - s) < 4) { r = s; break; }
      }
    }
    r = ((r + 180) % 360 + 360) % 360 - 180;
    if (S.drag.type === 'bed') updateBed(S.drag.id, { rotation: r }); else updateObject(S.drag.id, { rotation: r });
  } else if (S.drag.type === 'planting') {
    updatePlanting(S.drag.id, {
      x: clamp(S.drag.initial.x + dxScreen, 0, S.state.gardenLengthM),
      y: clamp(S.drag.initial.y + dyScreen, 0, S.state.gardenWidthM),
    });
  } else if (S.drag.type === 'detail-planting') {
    const bed = S.state.beds.find(b => b.id === S.drag.bedId);
    if (!bed) return;
    const lx = clamp(S.drag.initialLocal[0] + dxScreen, 0, bed.lengthM);
    const ly = clamp(S.drag.initialLocal[1] + dyScreen, 0, bed.widthM);
    const [wx, wy] = bedLocalToWorld(bed, lx, ly);
    updatePlanting(S.drag.id, { x: wx, y: wy });
  }
  updateDragVisual();
}

export function onPointerUp() {
  if (!S.drag) return;
  if (S.drag.moved) {
    // commit the history snapshot taken at drag start (clears any redo stack)
    pushHistory(S.drag.preDragState);
  }
  S.drag = null;
  S.renderSuppressed = false;
  saveSoon();
  scheduleRender();
}
