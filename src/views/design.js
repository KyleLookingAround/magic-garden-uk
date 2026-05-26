// The main Design tab: toolbar, settings, banners, the garden canvas,
// the selected-item edit panels, the plant/object picker and the planted summary.
import { S } from '../store.js';
import { PLANTS_BY_ID, companionRel, PLANT_CATEGORIES } from '../data/plants.js';
import { OBJECT_BY_ID, OBJECT_CATEGORIES, PATH_STYLES, PATH_STYLES_BY_ID } from '../data/objects.js';
import { ICON } from '../data/icons.js';
import { esc, MONTHS } from '../lib/util.js';
import { computeStats, bedCapacity, filteredPlants, filteredObjects } from '../selectors.js';
import { rectHTML, plantingHTML } from './items.js';
import { pathsSVG } from './paths.js';

export function designViewHTML() {
  const maxCanvasHeight = 540;
  const maxCanvasWidth = (maxCanvasHeight * S.state.gardenLengthM) / S.state.gardenWidthM;
  const scale = S.canvasWidthPx / S.state.gardenLengthM;
  const isGround = (typeId) => OBJECT_BY_ID[typeId]?.cat === 'ground';
  const groundObjects = S.state.objects.filter(o => isGround(o.typeId));
  const featureObjects = S.state.objects.filter(o => !isGround(o.typeId));
  const selectedBed = S.selectedItem?.type === 'bed' ? S.state.beds.find(b => b.id === S.selectedItem.id) : null;
  const selectedObject = S.selectedItem?.type === 'object' ? S.state.objects.find(o => o.id === S.selectedItem.id) : null;
  const selectedPlanting = S.selectedItem?.type === 'planting' ? S.state.plantings.find(p => p.id === S.selectedItem.id) : null;
  const stats = computeStats();

  // Companion summary for selected planting
  let compSummary = null;
  if (selectedPlanting) {
    let good = 0, bad = 0;
    S.state.plantings.forEach(other => {
      if (other.id === selectedPlanting.id) return;
      const dist = Math.hypot(other.x - selectedPlanting.x, other.y - selectedPlanting.y);
      if (dist > 1.5) return;
      const rel = companionRel(selectedPlanting.plantId, other.plantId);
      if (rel === 'good') good++; else if (rel === 'bad') bad++;
    });
    compSummary = { good, bad };
  }

  const settingsPanel = S.gardenSettingsOpen ? `
    <div class="gp-no-print gp-rise mb-4 p-4 rounded-lg" style="background:rgba(45,74,46,.05);border:1px dashed rgba(45,74,46,.2)">
      <div class="row items-center gap-4 flex-wrap text-sm">
        <label class="row items-center gap-2">
          <span style="color:#5c4e3e">Garden length</span>
          <input type="number" min="1" max="30" step="0.1" value="${S.state.gardenLengthM}"
            class="gp-number" data-action="update-garden" data-field="gardenLengthM" data-focus-key="g-len">
          <span class="text-xs" style="color:#5c4e3e">m</span>
        </label>
        <label class="row items-center gap-2">
          <span style="color:#5c4e3e">Garden width</span>
          <input type="number" min="1" max="30" step="0.1" value="${S.state.gardenWidthM}"
            class="gp-number" data-action="update-garden" data-field="gardenWidthM" data-focus-key="g-wid">
          <span class="text-xs" style="color:#5c4e3e">m</span>
        </label>
        <span class="gp-italic text-xs" style="color:#5c4e3e">${(S.state.gardenLengthM * S.state.gardenWidthM).toFixed(2)} m² total</span>
      </div>
    </div>
  ` : '';

  const pathDraft = S.pathDraftId ? S.state.paths.find(p => p.id === S.pathDraftId) : null;
  const banner = pathDraft ? `
    <div class="gp-banner">
      <span class="text-xl">🛤</span>
      <span class="flex-1 text-sm">
        Tap to add waypoints — the path curves smoothly through them.
        <span style="opacity:.75"> ${pathDraft.points.length} ${pathDraft.points.length === 1 ? 'point' : 'points'} so far${pathDraft.points.length < 2 ? ' (need at least 2)' : ''}.</span>
      </span>
      ${pathDraft.points.length >= 2 ? `<button class="text-xs uppercase tracking-wider opacity-90" data-action="finish-path-draft" style="text-decoration:underline">Done</button>` : ''}
      <button class="text-xs uppercase tracking-wider opacity-70" data-action="cancel-path-draft" style="text-decoration:underline">Cancel</button>
    </div>
  ` : (S.selectedPlant ? `
    <div class="gp-banner gp-rise">
      <span class="text-xl">${PLANTS_BY_ID[S.selectedPlant]?.icon}</span>
      <span class="flex-1 text-sm">
        Tap anywhere in the garden to plant <strong class="gp-banner-strong">${esc(PLANTS_BY_ID[S.selectedPlant]?.name)}</strong>.
        <span style="opacity:.75"> Good neighbours show a green ring, ones to keep apart show amber.</span>
      </span>
      <button class="text-xs uppercase tracking-wider opacity-80" data-action="clear-selected-plant" style="text-decoration:underline">Done</button>
    </div>
  ` : '');

  const monthCaption = S.viewMonth === 0
    ? 'Pick a month to dim out-of-season plants on the plan and filter the picker to what you can sow or plant out then.'
    : `Out-of-season plants are dimmed below; the picker shows what to sow or plant out in ${MONTHS[S.viewMonth - 1]}.`;
  const monthBar = `
    <div class="gp-no-print gp-month-bar gp-rise">
      ${ICON.caldays('gp-icon w4', 'flex-shrink-0')}
      <span class="text-sm font-semibold" style="color:#2d4a2e;min-width:64px">${S.viewMonth === 0 ? 'All year' : MONTHS[S.viewMonth - 1]}</span>
      <input type="range" min="0" max="12" step="1" value="${S.viewMonth}" class="gp-range" data-action="set-month" aria-label="Month filter">
      ${S.viewMonth !== 0 ? `
        <span class="gp-italic text-xs" style="color:#5c4e3e">
          ${S.state.plantings.filter(p => PLANTS_BY_ID[p.plantId]?.months.includes(S.viewMonth)).length} of ${S.state.plantings.length} in season
        </span>
        <button class="text-xs" style="color:#2d4a2e;text-decoration:underline" data-action="set-month-zero">show all</button>` : ''}
      <span class="gp-italic text-xs" style="color:#5c4e3e;flex-basis:100%;margin:0">${monthCaption}</span>
    </div>
  `;

  // A gentle prompt drawn over an otherwise-empty plot, so the canvas never
  // reads as broken/blank. pointer-events:none keeps canvas taps working.
  const showEmptyHint = !S.selectedPlant && !S.pathDraftId && S.state.plantings.length === 0;
  const emptyHint = showEmptyHint ? (() => {
    const blank = S.state.beds.length === 0 && S.state.objects.length === 0;
    const title = blank ? 'Your garden is a blank plot' : 'Nothing planted yet';
    const sub = blank
      ? 'Add a bed above, then pick a plant below to start planting.'
      : 'Pick a plant below, then tap a bed to plant it.';
    return `
      <div class="pointer-none text-center" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:6;max-width:80%">
        <div class="gp-display text-lg" style="color:#5c4e3e">${title}</div>
        <div class="gp-italic text-sm mt-1" style="color:#5c4e3e">${sub}</div>
      </div>
    `;
  })() : '';

  // Canvas contents
  const canvasInner = `
    ${groundObjects.map(o => rectHTML(o, 'object')).join('')}
    ${emptyHint}
    ${pathsSVG()}
    ${S.state.beds.map(b => rectHTML(b, 'bed')).join('')}
    ${featureObjects.map(o => rectHTML(o, 'object')).join('')}
    ${S.state.plantings.map(p => {
      const plant = PLANTS_BY_ID[p.plantId];
      if (!plant) return '';
      const dim = S.viewMonth !== 0 && !plant.months.includes(S.viewMonth);
      return plantingHTML(p, {
        scale,
        leftPct: (p.x / S.state.gardenLengthM) * 100,
        topPct: (p.y / S.state.gardenWidthM) * 100,
        dim,
        dragAction: `data-action="drag-start"`,
        dragData: `data-type="planting" data-id="${p.id}" data-mode="move"`,
      });
    }).join('')}
    <div class="gp-scale-bar" style="width:${Math.max(20, scale)}px"></div>
    <span class="gp-scale-label" style="left:10px">1m</span>
  `;

  // Edit panels
  let editPanel = '';
  const selectedPath = S.selectedItem?.type === 'path' ? S.state.paths.find(p => p.id === S.selectedItem.id) : null;
  if (selectedBed) {
    const cap = bedCapacity(selectedBed);
    editPanel = editPanelHTML({
      kindLabel: 'Bed', name: selectedBed.name, namePlaceholder: '',
      lengthM: selectedBed.lengthM, widthM: selectedBed.widthM,
      rotation: selectedBed.rotation || 0, x: selectedBed.x, y: selectedBed.y,
      id: selectedBed.id, target: 'bed', open: true, capacity: cap,
    });
  } else if (selectedObject) {
    const tpl = OBJECT_BY_ID[selectedObject.typeId];
    editPanel = editPanelHTML({
      kindLabel: tpl?.name || 'Object', name: selectedObject.label,
      namePlaceholder: tpl?.name || '',
      lengthM: selectedObject.lengthM, widthM: selectedObject.widthM,
      rotation: selectedObject.rotation || 0, x: selectedObject.x, y: selectedObject.y,
      id: selectedObject.id, target: 'object', icon: tpl?.icon, open: false,
    });
  } else if (selectedPlanting) {
    const plant = PLANTS_BY_ID[selectedPlanting.plantId];
    if (plant) {
      editPanel = `
        <div class="mb-6 p-4 rounded-xl gp-rise" style="background:#fbf6ea;border:1px solid rgba(107,93,79,.25)">
          <div class="row items-center gap-3 flex-wrap">
            <div class="w12 h12 rounded-xl row items-center justify-center text-2xl flex-shrink-0" style="background:${plant.color}30">${plant.icon}</div>
            <div class="flex-1 min-w-0">
              <div class="gp-display text-lg leading-tight">${esc(plant.name)}</div>
              <div class="text-xs gp-italic" style="color:#5c4e3e">
                at ${selectedPlanting.x.toFixed(1)}m, ${selectedPlanting.y.toFixed(1)}m · canopy ~${Math.round(plant.sizeCm)} cm
              </div>
            </div>
            <button class="p-2 rounded-full gp-soft-hover" data-action="duplicate-selected" title="Duplicate">${ICON.copy('gp-icon w4', '')}</button>
            <button class="p-2 rounded-full gp-soft-hover" data-action="open-info" data-plant-id="${plant.id}" title="Plant info">${ICON.info('gp-icon w4', '')}</button>
            <button class="p-2 rounded-full gp-soft-hover-red" data-action="delete-selected" title="Remove" style="color:#c87454">${ICON.trash('gp-icon w4', '')}</button>
            <button class="p-2 rounded-full gp-soft-hover" data-action="clear-selected-item">${ICON.x('gp-icon w4', '')}</button>
          </div>
          ${compSummary && (compSummary.good > 0 || compSummary.bad > 0) ? `
            <div class="row items-center gap-2 mt-3 flex-wrap">
              ${compSummary.good > 0 ? `<span class="gp-chip" style="background:rgba(90,143,78,.14);color:#3e6b36">${ICON.sparkles('gp-icon w3', '')}${compSummary.good} happy neighbour${compSummary.good > 1 ? 's' : ''} close by</span>` : ''}
              ${compSummary.bad > 0 ? `<span class="gp-chip" style="background:rgba(217,138,61,.16);color:#9a5a1d">${ICON.alert('gp-icon w3', '')}${compSummary.bad} to move further away</span>` : ''}
            </div>` : ''}
        </div>
      `;
    }
  } else if (selectedPath) {
    const style = PATH_STYLES_BY_ID[selectedPath.style] || PATH_STYLES_BY_ID.gravel;
    editPanel = `
      <div class="mb-6 p-4 rounded-xl gp-rise" style="background:#fbf6ea;border:1px solid rgba(107,93,79,.25)">
        <div class="row items-center gap-3 flex-wrap">
          <div class="w12 h12 rounded-xl row items-center justify-center flex-shrink-0" style="background:${style.fill}">
            <span style="font-size:18px;color:${style.edge}">🛤</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="gp-display text-lg leading-tight">${esc(style.name)} path</div>
            <div class="text-xs gp-italic" style="color:#5c4e3e">
              ${selectedPath.points.length} waypoint${selectedPath.points.length === 1 ? '' : 's'} · ${selectedPath.widthM.toFixed(1)}m wide · drag the dots to reshape
            </div>
          </div>
          <button class="p-2 rounded-full gp-soft-hover-red" data-action="delete-selected" title="Remove" style="color:#c87454">${ICON.trash('gp-icon w4', '')}</button>
          <button class="p-2 rounded-full gp-soft-hover" data-action="clear-selected-item">${ICON.x('gp-icon w4', '')}</button>
        </div>
        <div class="mt-4 row items-center gap-2 flex-wrap">
          <span class="text-10 uppercase tracking-widest" style="color:#5c4e3e">Style</span>
          ${PATH_STYLES.map(s => {
            const active = s.id === selectedPath.style;
            return `
            <button class="gp-chip"
                    data-action="set-path-style" data-id="${selectedPath.id}" data-style="${s.id}"
                    style="background:${active ? '#2d4a2e' : s.fill};color:${active ? '#f4ecd8' : '#2a2419'};border:1px solid ${active ? '#2d4a2e' : s.edge};cursor:pointer">
              ${esc(s.name)}
            </button>
          `;}).join('')}
        </div>
        <div class="mt-3 row items-center gap-3">
          <span class="text-10 uppercase tracking-widest" style="color:#5c4e3e;min-width:54px">Width</span>
          <input type="range" min="0.3" max="2" step="0.1" value="${selectedPath.widthM}"
                 class="gp-range flex-1" data-action="set-path-width" data-id="${selectedPath.id}">
          <span class="text-sm gp-italic" style="color:#5c4e3e;min-width:42px;text-align:right">${selectedPath.widthM.toFixed(1)}m</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="gp-rise">
      <div class="gp-no-print row items-center gap-2 mb-4 flex-wrap">
        <button class="gp-btn-ghost" data-action="add-bed">${ICON.plus('gp-icon w3-5', '')}Add bed</button>
        <button class="gp-btn-ghost ${S.pathDraftId ? 'active-draft' : ''}" data-action="start-path-draft" data-style="gravel" ${S.pathDraftId ? 'disabled' : ''}>${ICON.plus('gp-icon w3-5', '')}Draw path</button>
        <button class="gp-btn-ghost" data-action="toggle-garden-settings">${ICON.settings('gp-icon w3-5', '')}Garden size</button>
        <div class="flex-1"></div>
        <button class="gp-btn-ghost" data-action="undo" ${S.history.length === 0 ? 'disabled' : ''} title="Undo last change (Ctrl+Z)">
          ${ICON.undo('gp-icon w3-5', '')}Undo ${S.history.length > 0 ? `<span class="gp-italic opacity-70">(${S.history.length})</span>` : ''}
        </button>
        <button class="gp-btn-ghost" data-action="redo" ${S.future.length === 0 ? 'disabled' : ''} title="Redo (Ctrl+Shift+Z)">
          ${ICON.redo('gp-icon w3-5', '')}Redo
        </button>
      </div>
      ${settingsPanel}
      ${banner}
      ${monthBar}
      <div class="mx-auto" style="max-width:${maxCanvasWidth}px">
        <div id="gp-canvas" class="gp-canvas ${S.selectedPlant ? 'planting-mode' : ''}" data-action="canvas-tap"
             style="width:100%;aspect-ratio:${S.state.gardenLengthM} / ${S.state.gardenWidthM}">
          ${canvasInner}
        </div>
      </div>
      <div class="gp-no-print text-center mt-3 mb-5 text-sm gp-italic" style="color:#5c4e3e">
        ${S.selectedPlant
          ? 'Tap in the garden to plant — keep tapping to plant more. Press Esc when you’re done.'
          : S.selectedItem
            ? 'Drag to move · green dot rotates · brown dot resizes · Del removes · Esc deselects'
            : 'Drag beds, plants and objects to rearrange · they snap to edges as you go'}
      </div>
      ${editPanel}
      <div class="gp-no-print gp-divider"></div>
      ${pickerHTML()}
      ${stats.length > 0 ? whatsPlantedHTML(stats) : ''}
    </div>
  `;
}

function whatsPlantedHTML(stats) {
  return `
    <div class="mb-6">
      <div class="gp-divider"></div>
      <div class="row items-baseline justify-between mb-3">
        <h3 class="gp-display text-xl">What's planted</h3>
        <span class="gp-italic text-sm" style="color:#5c4e3e">${S.state.plantings.length} plants in total</span>
      </div>
      <div class="gp-tag-row">
        ${stats.map(({ plant, n }) => `
          <div class="row items-center gap-2 px-3 py-1.5 rounded-full text-sm"
               style="background:${plant.color}15;border:1px solid ${plant.color}50">
            <span>${plant.icon}</span><span>${esc(plant.name)}</span>
            <span class="gp-italic" style="color:#5c4e3e">×${n}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/** A rounded search field bound to S.plantSearch, with a clear button. */
export function searchBoxHTML(placeholder) {
  const v = S.plantSearch || '';
  return `
    <div class="gp-search mb-3">
      ${ICON.search('gp-icon w4', 'gp-search-icon')}
      <input type="text" class="gp-search-input" placeholder="${esc(placeholder)}"
             value="${esc(v)}" data-action="plant-search" data-focus-key="plant-search"
             autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="${esc(placeholder)}">
      ${v ? `<button class="gp-search-clear" data-action="clear-search" title="Clear search" aria-label="Clear search">${ICON.x('gp-icon w3-5', '')}</button>` : ''}
    </div>
  `;
}

/** Friendly placeholder when a filter combination matches nothing. */
export function emptyPickerHTML({ search = false, month = false } = {}) {
  const resets = [
    search ? `<button class="text-xs" style="color:#2d4a2e;text-decoration:underline" data-action="clear-search">clear the search</button>` : '',
    month ? `<button class="text-xs" style="color:#2d4a2e;text-decoration:underline" data-action="set-month-zero">show every month</button>` : '',
  ].filter(Boolean);
  return `
    <div class="text-center py-8 px-4 gp-italic text-sm" style="color:#5c4e3e;border:1px dashed rgba(107,93,79,.3);border-radius:12px">
      Nothing matches.${resets.length ? ` Try to ${resets.join(' or ')}.` : ''}
    </div>
  `;
}

export function pickerHTML() {
  const isPlants = S.pickerMode === 'plants';
  const cats = isPlants ? PLANT_CATEGORIES : OBJECT_CATEGORIES;
  const active = isPlants ? S.plantCategory : S.objectCategory;
  const monthActive = isPlants && S.viewMonth !== 0;
  const list = isPlants
    ? filteredPlants({ month: S.viewMonth, search: S.plantSearch })
    : filteredObjects({ search: S.plantSearch });
  const grid = list.length === 0
    ? emptyPickerHTML({ search: !!S.plantSearch.trim(), month: monthActive })
    : (isPlants ? plantsGridHTML(list) : objectsGridHTML(list));
  return `
    <div class="gp-no-print mb-6">
      <div class="row items-center justify-between mb-3 flex-wrap gap-2">
        <div class="row items-center gap-2">
          <button class="gp-tab ${isPlants ? 'active' : ''}" data-action="set-picker" data-picker="plants">${ICON.sprout('gp-icon w3', '')}Plants</button>
          <button class="gp-tab ${!isPlants ? 'active' : ''}" data-action="set-picker" data-picker="objects">${ICON.trees('gp-icon w3', '')}Objects</button>
        </div>
        <div class="row gap-1 overflow-x-auto gp-scroll" data-scroll-key="picker-cats">
          ${cats.map(c => `<button class="gp-tab ${active === c.id ? 'active' : ''}" data-action="set-category" data-cat="${c.id}">${esc(c.label)}</button>`).join('')}
        </div>
      </div>
      ${searchBoxHTML(isPlants ? 'Search plants by name…' : 'Search objects by name…')}
      ${monthActive ? `
        <p class="text-xs gp-italic mb-3 row items-center gap-1.5 flex-wrap" style="color:#557049">
          ${ICON.caldays('gp-icon w3-5', '')}Showing plants to sow or plant out in ${MONTHS[S.viewMonth - 1]} ·
          <button class="text-xs" style="color:#2d4a2e;text-decoration:underline" data-action="set-month-zero">show all plants</button>
        </p>` : ''}
      ${grid}
    </div>
  `;
}

export function plantsGridHTML(plants) {
  const focusId = S.selectedPlant || (S.selectedItem?.type === 'planting' ? S.state.plantings.find(p => p.id === S.selectedItem.id)?.plantId : null);
  return `
    <div class="grid cols-2 sm:cols-3 md:cols-4 gap-3">
      ${plants.map(p => {
        const rel = focusId ? companionRel(focusId, p.id) : null;
        const sel = S.selectedPlant === p.id ? ' selected' : '';
        return `
          <div class="gp-plant-card${sel}" data-action="pick-plant" data-plant-id="${p.id}" role="button" tabindex="0">
            <div class="row items-start gap-2">
              <div class="w10 h10 rounded-md row items-center justify-center text-xl flex-shrink-0" style="background:${p.color}1f">${p.icon}</div>
              <div class="flex-1 min-w-0">
                <div class="gp-display text-base leading-tight truncate">${esc(p.name)}</div>
                <div class="text-10 mt-0.5 uppercase tracking-wider" style="color:#5c4e3e">${p.cat} · ${Math.round(p.sizeCm)}cm</div>
                ${rel === 'good' ? `<div class="text-10 mt-1 row items-center gap-1" style="color:#3e6b36">${ICON.sparkles('gp-icon w2-5', '')}good companion</div>` : ''}
                ${rel === 'bad' ? `<div class="text-10 mt-1 row items-center gap-1" style="color:#9a5a1d">${ICON.alert('gp-icon w2-5', '')}keep apart</div>` : ''}
              </div>
              <span class="p-1 rounded-full gp-soft-hover" data-action="open-info" data-plant-id="${p.id}" role="button" tabindex="0" aria-label="More info">${ICON.info('gp-icon w3-5', '')}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function objectsGridHTML(objs) {
  return `
    <p class="text-xs gp-italic mb-3" style="color:#5c4e3e">
      Tap to drop into the centre of the garden — then drag, resize, and rotate from there.
    </p>
    <div class="grid cols-2 sm:cols-3 md:cols-4 gap-3">
      ${objs.map(o => `
        <button class="gp-plant-card" data-action="add-object" data-object-id="${o.id}">
          <div class="row items-start gap-2">
            <div class="w10 h10 rounded-md row items-center justify-center text-xl flex-shrink-0" style="background:${o.color}33">${o.icon}</div>
            <div class="flex-1 min-w-0">
              <div class="gp-display text-base leading-tight truncate">${esc(o.name)}</div>
              <div class="text-10 mt-0.5 uppercase tracking-wider" style="color:#5c4e3e">${o.cat} · ${o.L}×${o.W}m</div>
            </div>
          </div>
        </button>
      `).join('')}
    </div>
  `;
}

function editPanelHTML(p) {
  const crowded = p.capacity && p.capacity.planted > p.capacity.cap;
  return `
    <div class="gp-no-print mb-6 p-4 rounded-xl gp-rise" style="background:#fbf6ea;border:1px solid rgba(107,93,79,.25)">
      <div class="row items-center justify-between mb-3 flex-wrap gap-2">
        <div class="row items-center gap-2 flex-1 min-w-0">
          ${p.icon ? `<span class="text-xl">${p.icon}</span>` : ''}
          <span class="text-xs uppercase tracking-widest" style="color:#557049">${esc(p.kindLabel)}</span>
          <input type="text" class="gp-input gp-display text-xl flex-1 min-w-0"
            value="${esc(p.name)}" placeholder="${esc(p.namePlaceholder)}"
            data-action="update-name" data-target="${p.target}" data-id="${p.id}"
            data-focus-key="name-${p.target}-${p.id}">
        </div>
        <div class="row items-center gap-1">
          ${p.target === 'bed' ? `<button class="gp-btn mr-1" data-action="open-bed-detail" data-id="${p.id}" title="Open this bed to plant in it">${ICON.maximize('gp-icon w3-5', '')}Plant in this bed</button>` : ''}
          <button class="p-2 rounded-full gp-soft-hover" data-action="duplicate-selected" title="Duplicate">${ICON.copy('gp-icon w4', '')}</button>
          <button class="p-2 rounded-full gp-soft-hover-red" data-action="delete-selected" title="Delete" style="color:#c87454">${ICON.trash('gp-icon w4', '')}</button>
          <button class="p-2 rounded-full gp-soft-hover" data-action="clear-selected-item">${ICON.x('gp-icon w4', '')}</button>
        </div>
      </div>
      <div class="row items-center gap-4 flex-wrap text-sm">
        <label class="row items-center gap-2">
          <span style="color:#5c4e3e">Length</span>
          <input type="number" min="0.2" max="30" step="0.1" value="${Number(p.lengthM.toFixed(2))}"
            class="gp-number" data-action="update-size" data-target="${p.target}" data-id="${p.id}" data-field="lengthM"
            data-focus-key="len-${p.target}-${p.id}">
          <span class="text-xs" style="color:#5c4e3e">m</span>
        </label>
        <label class="row items-center gap-2">
          <span style="color:#5c4e3e">Width</span>
          <input type="number" min="0.2" max="30" step="0.1" value="${Number(p.widthM.toFixed(2))}"
            class="gp-number" data-action="update-size" data-target="${p.target}" data-id="${p.id}" data-field="widthM"
            data-focus-key="wid-${p.target}-${p.id}">
          <span class="text-xs" style="color:#5c4e3e">m</span>
        </label>
        <label class="row items-center gap-2">
          <span style="color:#5c4e3e">Rotation</span>
          <input type="number" min="-180" max="180" step="5" value="${Math.round(p.rotation)}"
            class="gp-number" data-action="update-size" data-target="${p.target}" data-id="${p.id}" data-field="rotation"
            data-focus-key="rot-${p.target}-${p.id}">
          <span class="text-xs" style="color:#5c4e3e">°</span>
          <button class="text-xs ml-1" style="color:#2d4a2e;text-decoration:underline" data-action="reset-rotation" data-target="${p.target}" data-id="${p.id}">reset</button>
        </label>
        <span class="gp-italic text-xs" style="color:#5c4e3e">
          ${(p.lengthM * p.widthM).toFixed(2)} m² · at ${p.x.toFixed(1)}m, ${p.y.toFixed(1)}m
        </span>
      </div>
      ${p.capacity ? `
        <div class="mt-3 text-xs row items-center gap-1.5" style="color:${crowded ? '#9a5a1d' : '#5c4e3e'}">
          ${crowded
            ? `${ICON.alert('gp-icon w3-5', '')}${p.capacity.planted} plants here — looks crowded, around ${p.capacity.cap} would sit comfortably at their spacing.`
            : `<span style="color:#557049">${ICON.sprout('gp-icon w3-5', '')}</span>${p.capacity.planted} planted · room for roughly ${p.capacity.cap} at their spacing.`}
        </div>` : ''}
    </div>
  `;
}
