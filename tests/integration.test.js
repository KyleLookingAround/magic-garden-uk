// Integration smoke test: drives the real modules against a jsdom DOM to verify
// the store wiring, every view renderer, and the action/drag code paths run
// without throwing. (jsdom can't do real pointer events, so handlers are called
// directly with synthetic events and a stubbed canvas rect.)
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { S, load } from '../src/store.js';
import { render } from '../src/render.js';
import { bindEvents } from '../src/events.js';
import {
  addBed, addObject, duplicateSelected, deleteSelected, toggleShopping,
  addBedTask, startPathDraft, appendPathPoint, finishPathDraft, setView,
} from '../src/actions.js';
import { undo, redo } from '../src/history.js';
import { filteredPlants } from '../src/selectors.js';
import { startDrag, onPointerMove, onPointerUp } from '../src/drag.js';

beforeAll(() => {
  globalThis.requestAnimationFrame = (cb) => { cb(); return 0; };
  globalThis.cancelAnimationFrame = () => {};
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  if (!globalThis.CSS) globalThis.CSS = {};
  if (!globalThis.CSS.escape) globalThis.CSS.escape = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
  // jsdom returns zeros for layout; give canvases a real size so drag math works.
  Element.prototype.getBoundingClientRect = function () {
    return { width: 800, height: 600, left: 0, top: 0, right: 800, bottom: 600, x: 0, y: 0, toJSON() {} };
  };
});

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<div id="root"></div>';
  // Reset transient UI state between tests.
  Object.assign(S, {
    view: 'design', selectedPlant: null, selectedItem: null, bedDetailId: null,
    pathDraftId: null, infoPlantId: null, notesBedId: null, viewMonth: 0,
    history: [], future: [], plantCategory: 'all', plantSearch: '', flash: null, flashAction: null,
    gardenSettingsOpen: false, editingName: false, drag: null, renderSuppressed: false, renderQueued: false,
    pickerOpen: true, canvasFocus: false, pickerMode: 'plants',
  });
  load();
});

describe('boot', () => {
  it('loads default state and renders the shell', () => {
    render();
    const root = document.getElementById('root');
    expect(root.innerHTML.length).toBeGreaterThan(100);
    expect(root.textContent).toContain('Our Garden');
    expect(root.querySelector('#gp-canvas')).toBeTruthy();
  });
});

describe('every view renders without throwing', () => {
  for (const v of ['design', 'library', 'pollinators', 'shopping', 'notes']) {
    it(`renders the ${v} view`, () => {
      setView(v);
      render();
      const root = document.getElementById('root');
      expect(root.innerHTML.length).toBeGreaterThan(50);
    });
  }

  it('renders the bed-detail view', () => {
    const id = S.state.beds[0].id;
    S.bedDetailId = id;
    render();
    expect(document.getElementById('gp-detail-canvas')).toBeTruthy();
  });

  it('renders the plant info modal', () => {
    S.infoPlantId = 'tomato';
    render();
    expect(document.querySelector('.gp-modal-back')).toBeTruthy();
  });

  it('shows an empty-state when the search matches nothing', () => {
    S.plantSearch = 'zzzzzz';
    for (const v of ['design', 'library']) {
      setView(v);
      render();
      expect(document.getElementById('root').textContent).toContain('Nothing matches');
    }
  });

  it('shows the month picker hint when a month is selected', () => {
    setView('design');
    S.viewMonth = 5;
    render();
    expect(document.getElementById('root').textContent).toContain('sow or plant out in May');
  });

  it('renders an action button inside the toast', () => {
    S.flash = 'Plant removed';
    S.flashAction = { label: 'Undo', action: 'undo' };
    render();
    const btn = document.querySelector('.gp-toast-btn[data-action="undo"]');
    expect(btn).toBeTruthy();
    expect(btn.textContent).toContain('Undo');
  });
});

describe('actions mutate state and re-render', () => {
  it('adds a bed', () => {
    const before = S.state.beds.length;
    addBed();
    expect(S.state.beds.length).toBe(before + 1);
    expect(S.selectedItem.type).toBe('bed');
  });

  it('adds and duplicates an object', () => {
    addObject('shed');
    expect(S.state.objects.length).toBe(1);
    duplicateSelected();
    expect(S.state.objects.length).toBe(2);
  });

  it('deletes the selected item', () => {
    addObject('pond');
    deleteSelected();
    expect(S.state.objects.length).toBe(0);
  });

  it('toggles a shopping item', () => {
    toggleShopping('plant:tomato');
    expect(S.state.shopping['plant:tomato']).toBe(true);
  });

  it('adds a bed task', () => {
    const bedId = S.state.beds[0].id;
    addBedTask(bedId, 'put up bean canes');
    expect(S.state.beds[0].tasks.at(-1).text).toBe('put up bean canes');
  });

  it('draws a path through waypoints', () => {
    startPathDraft('gravel');
    appendPathPoint(10, 10);
    appendPathPoint(40, 30);
    appendPathPoint(70, 20);
    finishPathDraft();
    expect(S.state.paths).toHaveLength(1);
    expect(S.state.paths[0].points).toHaveLength(3);
    expect(S.pathDraftId).toBeNull();
  });

  it('undoes the last structural change', () => {
    const before = S.state.beds.length;
    addBed();
    expect(S.state.beds.length).toBe(before + 1);
    undo();
    expect(S.state.beds.length).toBe(before);
  });

  it('redoes an undone change, and a fresh change clears the redo stack', () => {
    const before = S.state.beds.length;
    addBed();
    undo();
    expect(S.state.beds.length).toBe(before);
    redo();
    expect(S.state.beds.length).toBe(before + 1);
    // A new structural change should invalidate any further redo.
    undo();
    addObject('shed');
    expect(S.future.length).toBe(0);
  });
});

describe('plant picker filtering', () => {
  it('filters by free-text search across name', () => {
    const all = filteredPlants();
    const tom = filteredPlants({ search: 'tom' });
    expect(tom.length).toBeLessThan(all.length);
    expect(tom.every(p => p.name.toLowerCase().includes('tom') || p.cat.includes('tom'))).toBe(true);
    expect(tom.some(p => p.id === 'tomato')).toBe(true);
  });

  it('filters by sow/plant-out month, and only shows in-season plants', () => {
    // Tomato sows Mar–Apr / plants late May–Jun: present in May, absent in December.
    const may = filteredPlants({ month: 5 });
    const dec = filteredPlants({ month: 12 });
    expect(may.some(p => p.id === 'tomato')).toBe(true);
    expect(dec.some(p => p.id === 'tomato')).toBe(false);
    expect(may.length).toBeGreaterThan(dec.length);
  });
});

describe('drag cycle moves a bed', () => {
  it('runs startDrag -> move -> pointerUp and repositions the bed', () => {
    render();
    const bed = S.state.beds[0];
    const el = document.querySelector(`.gp-rect[data-type="bed"][data-id="${bed.id}"]`);
    expect(el).toBeTruthy();
    const startX = bed.x;
    const down = { clientX: 100, clientY: 100, stopPropagation() {}, preventDefault() {}, shiftKey: false };
    startDrag(down, 'bed', bed.id, 'move', el);
    expect(S.drag).toBeTruthy();
    const move = { clientX: 260, clientY: 100, stopPropagation() {}, preventDefault() {}, shiftKey: false };
    onPointerMove(move);
    expect(S.drag.moved).toBe(true);
    onPointerUp();
    expect(S.drag).toBeNull();
    // Moved ~160px / (800px/8m) = ~1.6m to the right.
    expect(S.state.beds[0].x).toBeGreaterThan(startX);
  });
});

describe('bindEvents wires listeners without throwing', () => {
  it('binds and dispatches a tab switch via click', () => {
    render();
    bindEvents();
    const tab = document.querySelector('[data-action="set-view"][data-view="library"]');
    tab.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(S.view).toBe('library');
  });
});

describe('UX: focus view, collapsible picker, placing indicator', () => {
  it('renders exactly one canvas, inside the focus overlay, when focus view is on', () => {
    setView('design');
    S.canvasFocus = true;
    render();
    expect(document.querySelectorAll('#gp-canvas')).toHaveLength(1);
    const overlay = document.querySelector('.gp-canvas-focus');
    expect(overlay).toBeTruthy();
    expect(overlay.querySelector('#gp-canvas')).toBeTruthy();
  });

  it('hides the plant grid when the picker is collapsed and restores it when open', () => {
    setView('design');
    S.pickerOpen = false;
    render();
    expect(document.querySelector('[data-action="toggle-picker"]')).toBeTruthy();
    expect(document.querySelector('.gp-plant-card')).toBeFalsy();
    S.pickerOpen = true;
    render();
    expect(document.querySelector('.gp-plant-card')).toBeTruthy();
  });

  it('shows a persistent placing pill naming the armed plant', () => {
    S.selectedPlant = 'tomato';
    render();
    const pill = document.querySelector('.gp-placing-pill');
    expect(pill).toBeTruthy();
    expect(pill.textContent).toContain('Tomato');
  });
});

describe('keyboard accessibility', () => {
  it('nudges the selected planting with arrow keys', () => {
    S.state.plantings.push({ id: 'kp1', plantId: 'tomato', x: 2, y: 2 });
    S.selectedItem = { type: 'planting', id: 'kp1' };
    render();
    bindEvents();
    const before = S.state.plantings.find(p => p.id === 'kp1').x;
    window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight' }));
    const after = S.state.plantings.find(p => p.id === 'kp1').x;
    expect(after).toBeGreaterThan(before);
  });

  it('selects a canvas item when Enter is pressed on it', () => {
    const bed = S.state.beds[0];
    S.selectedItem = null;
    render();
    bindEvents();
    const el = document.querySelector(`.gp-rect[data-type="bed"][data-id="${bed.id}"]`);
    expect(el.getAttribute('tabindex')).toBe('0');
    el.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(S.selectedItem).toEqual({ type: 'bed', id: bed.id });
  });
});
