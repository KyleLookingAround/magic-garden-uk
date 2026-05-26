// Delegated event handling. All interactive elements carry data-action
// attributes; a handful of listeners on #root dispatch to the right action.
import { S } from './store.js';
import { scheduleRender } from './render.js';
import { snap, undo, redo } from './history.js';
import { clamp } from './lib/util.js';
import {
  setView, addBed, addObject, duplicateSelected, deleteSelected,
  updateBed, updateObject, updatePath, insertPathPoint, deletePathPoint,
  toggleBedTask, deleteBedTask, addBedTask, toggleShopping,
  startPathDraft, finishPathDraft, cancelPathDraft, appendPathPoint,
  setGardenName, setGardenSize, setBedNotes,
  placePlantAt, placePlantInBedAt,
} from './actions.js';
import { startDrag, startDetailDrag, startPathPointDrag, onPointerMove, onPointerUp } from './drag.js';
import { exportPlan, importPlan, exportCalendar, sharePlan, printPlan } from './io.js';

export function bindEvents() {
  const root = document.getElementById('root');

  // Pointer-down (drag start, canvas tap, modal close)
  root.addEventListener('pointerdown', (e) => {
    const tgt = /** @type {any} */ (e.target);
    // Modal: close on backdrop tap; ignore on inner content
    if (tgt.closest('[data-stop]')) {
      e.stopPropagation();
    }

    // PATH DRAFT MODE: any pointerdown inside the canvas adds a waypoint,
    // regardless of what element it hits (beds, objects, existing paths, etc).
    if (S.pathDraftId) {
      const canvas = document.getElementById('gp-canvas');
      if (canvas && canvas.contains(tgt)) {
        const rect = canvas.getBoundingClientRect();
        const pctX = ((e.clientX - rect.left) / rect.width) * 100;
        const pctY = ((e.clientY - rect.top) / rect.height) * 100;
        appendPathPoint(pctX, pctY);
        e.stopPropagation();
        e.preventDefault();
        return;
      }
    }

    const t = tgt.closest('[data-action]');
    if (!t) return;
    const action = t.dataset.action;

    if (action === 'drag-start') {
      const type = t.dataset.type;
      const id = t.dataset.id;
      const mode = t.dataset.mode || 'move';
      startDrag(e, type, id, mode, t);
    } else if (action === 'detail-drag-start') {
      startDetailDrag(e, t.dataset.id, t);
    } else if (action === 'path-point-drag-start') {
      startPathPointDrag(e, t.dataset.pathId, parseInt(t.dataset.pointIndex, 10), t);
    } else if (action === 'canvas-tap') {
      // Tap directly on canvas background only
      if (tgt.id !== 'gp-canvas') return;
      if (S.pathDraftId) {
        const rect = document.getElementById('gp-canvas').getBoundingClientRect();
        const pctX = ((e.clientX - rect.left) / rect.width) * 100;
        const pctY = ((e.clientY - rect.top) / rect.height) * 100;
        appendPathPoint(pctX, pctY);
        return;
      }
      if (S.selectedPlant) placePlantAt(e.clientX, e.clientY);
      else { S.selectedItem = null; scheduleRender(); }
    } else if (action === 'detail-canvas-tap') {
      if (tgt.id !== 'gp-detail-canvas') return;
      if (S.selectedPlant) placePlantInBedAt(e.clientX, e.clientY);
      else { S.selectedItem = null; scheduleRender(); }
    }
  });

  // Window-level pointer move/up so drags don't drop on fast moves
  window.addEventListener('pointermove', (e) => { if (S.drag) { onPointerMove(e); e.preventDefault(); } }, { passive: false });
  window.addEventListener('pointerup', () => { if (S.drag) onPointerUp(); });
  window.addEventListener('pointercancel', () => { if (S.drag) onPointerUp(); });

  // Click (most non-drag actions). Fires after pointerup, won't fire mid-drag thanks to moved-check.
  root.addEventListener('click', (e) => {
    if (S.drag && S.drag.moved) return;
    const tgt = /** @type {any} */ (e.target);
    const t = tgt.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    // Skip drag and canvas tap (handled by pointerdown)
    if (a === 'drag-start' || a === 'detail-drag-start' || a === 'path-point-drag-start' || a === 'canvas-tap' || a === 'detail-canvas-tap') return;

    switch (a) {
      case 'set-view': setView(t.dataset.view); break;
      case 'edit-garden-name': S.editingName = true; scheduleRender(); break;
      case 'toggle-garden-settings': S.gardenSettingsOpen = !S.gardenSettingsOpen; scheduleRender(); break;
      case 'add-bed': addBed(); break;
      case 'undo': undo(); dismissFlash(); break;
      case 'redo': redo(); break;
      case 'clear-search': S.plantSearch = ''; scheduleRender(); break;
      case 'clear-selected-plant': S.selectedPlant = null; scheduleRender(); break;
      case 'clear-selected-item': S.selectedItem = null; scheduleRender(); break;
      case 'set-month-zero': S.viewMonth = 0; scheduleRender(); break;
      case 'set-picker': S.pickerMode = t.dataset.picker; scheduleRender(); break;
      case 'set-category':
        if (S.pickerMode === 'plants' || S.view !== 'design' || S.bedDetailId) S.plantCategory = t.dataset.cat;
        else S.objectCategory = t.dataset.cat;
        scheduleRender();
        break;
      case 'pick-plant':
        S.selectedPlant = (S.selectedPlant === t.dataset.plantId) ? null : t.dataset.plantId;
        scheduleRender();
        break;
      case 'add-object': addObject(t.dataset.objectId); break;
      case 'open-info': e.stopPropagation(); S.infoPlantId = t.dataset.plantId; scheduleRender(); break;
      case 'close-info':
        // If the matched action is the backdrop AND the click started inside modal content,
        // ignore (the user clicked non-action modal content that bubbled up).
        if (!t.closest('[data-stop]') && tgt.closest('[data-stop]')) return;
        S.infoPlantId = null; scheduleRender();
        break;
      case 'plant-this':
        S.selectedPlant = t.dataset.plantId; S.infoPlantId = null;
        if (S.view !== 'design') S.view = 'design';
        scheduleRender();
        break;
      case 'duplicate-selected': duplicateSelected(); break;
      case 'delete-selected': deleteSelected(); break;
      case 'open-bed-detail': S.bedDetailId = t.dataset.id; S.selectedItem = null; S.selectedPlant = null; scheduleRender(); break;
      case 'close-bed-detail': S.bedDetailId = null; S.selectedItem = null; scheduleRender(); break;
      case 'reset-rotation': {
        snap();
        const tgt = t.dataset.target, id = t.dataset.id;
        if (tgt === 'bed') updateBed(id, { rotation: 0 }); else updateObject(id, { rotation: 0 });
        scheduleRender();
        break;
      }
      case 'toggle-task': toggleBedTask(t.dataset.bedId, t.dataset.taskId); break;
      case 'delete-task': deleteBedTask(t.dataset.bedId, t.dataset.taskId); break;
      case 'add-task': addBedTask(t.dataset.bedId, S.newTaskText); break;
      case 'toggle-shopping': toggleShopping(t.dataset.key); break;
      case 'set-notes-bed': S.notesBedId = t.dataset.id; scheduleRender(); break;
      case 'start-path-draft': startPathDraft(t.dataset.style || 'gravel'); break;
      case 'finish-path-draft': finishPathDraft(); break;
      case 'cancel-path-draft': cancelPathDraft(); break;
      case 'select-path': S.selectedItem = { type: 'path', id: t.dataset.id }; scheduleRender(); break;
      case 'set-path-style': updatePath(t.dataset.id, { style: t.dataset.style }); scheduleRender(); break;
      case 'insert-path-point': insertPathPoint(t.dataset.pathId, parseInt(t.dataset.afterIndex, 10)); break;
      case 'delete-path-point': deletePathPoint(t.dataset.pathId, parseInt(t.dataset.pointIndex, 10)); break;
      case 'toggle-tools': S.toolsOpen = !S.toolsOpen; scheduleRender(); break;
      case 'share-plan': sharePlan(); break;
      case 'export-plan': exportPlan(); break;
      case 'import-plan': importPlan(); break;
      case 'export-calendar': exportCalendar(); break;
      case 'print-plan': printPlan(); break;
      case 'apply-update': if (S.applyUpdate) S.applyUpdate(); break;
    }
  });

  // Inputs (oninput-style, won't lose focus thanks to render restoration)
  root.addEventListener('input', (e) => {
    const t = /** @type {any} */ (e.target).closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    const v = t.value;
    switch (a) {
      case 'garden-name-input': setGardenName(v); break;
      case 'update-garden': setGardenSize(t.dataset.field, v); break;
      case 'update-name': {
        const id = t.dataset.id;
        const target = t.dataset.target;
        if (target === 'bed') updateBed(id, { name: v });
        else if (target === 'object') updateObject(id, { label: v });
        // No full render — focus stays in input; values are read fresh from state
        break;
      }
      case 'update-size': {
        const id = t.dataset.id;
        const target = t.dataset.target;
        const field = t.dataset.field;
        const min = field === 'rotation' ? -180 : 0.2;
        const max = field === 'rotation' ? 180 : 30;
        const n = clamp(+v || (field === 'rotation' ? 0 : 0.2), min, max);
        if (target === 'bed') updateBed(id, { [field]: n });
        else updateObject(id, { [field]: n });
        scheduleRender();
        break;
      }
      case 'set-month':
        S.viewMonth = clamp(+v || 0, 0, 12); scheduleRender(); break;
      case 'plant-search':
        S.plantSearch = v; scheduleRender(); break;
      case 'set-path-width': {
        const w = clamp(+v || 0.6, 0.2, 5);
        updatePath(t.dataset.id, { widthM: w });
        scheduleRender();
        break;
      }
      case 'task-input':
        S.newTaskText = v; break;
      case 'update-notes':
        setBedNotes(t.dataset.bedId, v); break;
    }
  });

  // Push history on focus into editable fields (one snapshot per focus session)
  root.addEventListener('focusin', (e) => {
    const t = /** @type {any} */ (e.target).closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    if (a === 'garden-name-input' || a === 'update-garden' || a === 'update-name' || a === 'update-size' || a === 'update-notes') {
      if (!t._gpHistTaken) { snap(); t._gpHistTaken = true; }
    }
  });
  root.addEventListener('focusout', (e) => {
    const t = /** @type {any} */ (e.target).closest('[data-action]');
    if (!t) return;
    delete t._gpHistTaken;
    if (t.dataset.action === 'garden-name-input') { S.editingName = false; scheduleRender(); }
  });

  // Enter key to add task / finish editing name
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const t = /** @type {any} */ (e.target).closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    if (a === 'task-input') {
      e.preventDefault();
      addBedTask(t.dataset.bedId, S.newTaskText);
    } else if (a === 'garden-name-input') {
      t.blur();
    }
  });

  // App-wide keyboard shortcuts. We bind on window so they work regardless of
  // focus, but we bow out entirely while the user is typing in a field so the
  // browser's own text editing (incl. native undo) is never hijacked.
  window.addEventListener('keydown', (e) => {
    const tgt = /** @type {any} */ (e.target);
    if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) redo(); else { undo(); dismissFlash(); }
      return;
    }
    if (mod && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redo(); return; }
    if (mod) return; // leave other Ctrl/Cmd combos to the browser
    if (e.key === 'Escape') {
      if (S.infoPlantId) { S.infoPlantId = null; scheduleRender(); }
      else if (S.pathDraftId) cancelPathDraft();
      else if (S.selectedPlant) { S.selectedPlant = null; scheduleRender(); }
      else if (S.selectedItem) { S.selectedItem = null; scheduleRender(); }
      return;
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && S.selectedItem) {
      e.preventDefault();
      deleteSelected();
    }
  });
}

/** Clear any visible toast (e.g. after the user takes its undo action). */
function dismissFlash() {
  if (!S.flash && !S.flashAction) return;
  S.flash = null;
  S.flashAction = null;
  scheduleRender();
}
