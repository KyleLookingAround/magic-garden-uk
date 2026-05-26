// Focused single-bed view: a larger canvas with absolute plant placement.
import { S } from '../store.js';
import { worldToBedLocal, pointInBed } from '../lib/geometry.js';
import { bedCapacity, filteredPlants } from '../selectors.js';
import { PLANTS_BY_ID, PLANT_CATEGORIES } from '../data/plants.js';
import { ICON } from '../data/icons.js';
import { esc } from '../lib/util.js';
import { plantingHTML } from './items.js';
import { plantsGridHTML, searchBoxHTML, emptyPickerHTML } from './design.js';

export function bedDetailHTML() {
  const bed = S.state.beds.find(b => b.id === S.bedDetailId);
  if (!bed) return '';
  const inside = S.state.plantings.filter(p => pointInBed(p.x, p.y, bed));
  const cap = bedCapacity(bed);
  const detailMaxW = (520 * bed.lengthM) / bed.widthM;
  const detailScale = S.detailCanvasWidthPx / bed.lengthM;
  const selectedPlanting = S.selectedItem?.type === 'planting' ? S.state.plantings.find(p => p.id === S.selectedItem.id) : null;

  const banner = S.selectedPlant ? `
    <div class="gp-banner gp-rise">
      <span class="text-xl">${PLANTS_BY_ID[S.selectedPlant]?.icon}</span>
      <span class="flex-1 text-sm">
        Tap inside <strong class="gp-banner-strong">${esc(bed.name)}</strong> to plant <strong class="gp-banner-strong">${esc(PLANTS_BY_ID[S.selectedPlant]?.name)}</strong>.
      </span>
      <button class="text-xs uppercase tracking-wider opacity-80" data-action="clear-selected-plant" style="text-decoration:underline">Done</button>
    </div>
  ` : '';

  let editPlant = '';
  if (selectedPlanting && pointInBed(selectedPlanting.x, selectedPlanting.y, bed)) {
    const plant = PLANTS_BY_ID[selectedPlanting.plantId];
    if (plant) {
      editPlant = `
        <div class="mb-6 p-4 rounded-xl gp-rise row items-center gap-3" style="background:#fbf6ea;border:1px solid rgba(107,93,79,.25)">
          <div class="w12 h12 rounded-xl row items-center justify-center text-2xl flex-shrink-0" style="background:${plant.color}30">${plant.icon}</div>
          <div class="flex-1 min-w-0">
            <div class="gp-display text-lg leading-tight">${esc(plant.name)}</div>
            <div class="text-xs gp-italic" style="color:#5c4e3e">in ${esc(bed.name)} · canopy ~${Math.round(plant.sizeCm)} cm</div>
          </div>
          <button class="p-2 rounded-full gp-soft-hover" data-action="open-info" data-plant-id="${plant.id}" title="Plant info">${ICON.info('gp-icon w4', '')}</button>
          <button class="p-2 rounded-full gp-soft-hover-red" data-action="delete-selected" title="Remove" style="color:#c87454">${ICON.trash('gp-icon w4', '')}</button>
          <button class="p-2 rounded-full gp-soft-hover" data-action="clear-selected-item">${ICON.x('gp-icon w4', '')}</button>
        </div>
      `;
    }
  }

  return `
    <div class="gp-rise">
      <div class="row items-center gap-2 mb-4 flex-wrap">
        <button class="gp-btn-ghost" data-action="close-bed-detail">${ICON.arrowleft('gp-icon w3-5', '')}Back to garden</button>
        <div class="flex-1"></div>
        <button class="gp-btn-ghost" data-action="undo" ${S.history.length === 0 ? 'disabled' : ''} title="Undo last change">
          ${ICON.undo('gp-icon w3-5', '')}Undo ${S.history.length > 0 ? `<span class="gp-italic opacity-70">(${S.history.length})</span>` : ''}
        </button>
      </div>
      <div class="mb-4">
        <div class="row items-baseline gap-3 flex-wrap">
          <h2 class="gp-display text-2xl sm:text-3xl">${esc(bed.name)}</h2>
          <span class="gp-italic text-sm" style="color:#5c4e3e">
            ${bed.lengthM.toFixed(1)}m × ${bed.widthM.toFixed(1)}m · ${inside.length} planted
            ${cap.planted > cap.cap ? `<span style="color:#9a5a1d"> · looks crowded (~${cap.cap} fits comfortably)</span>` : ''}
          </span>
        </div>
        <p class="gp-italic text-sm mt-1" style="color:#5c4e3e">
          Pick a plant below, then tap inside the bed to place it. Everything you add here also shows on the full garden plan.
        </p>
      </div>
      ${banner}
      <div class="mx-auto" style="max-width:${detailMaxW}px">
        <div id="gp-detail-canvas" class="gp-detail-canvas ${S.selectedPlant ? 'planting-mode' : ''}" data-action="detail-canvas-tap"
             style="width:100%;aspect-ratio:${bed.lengthM} / ${bed.widthM}">
          ${inside.map(p => {
            const [lx, ly] = worldToBedLocal(bed, p.x, p.y);
            return plantingHTML(p, {
              scale: detailScale,
              leftPct: (lx / bed.lengthM) * 100,
              topPct: (ly / bed.widthM) * 100,
              dim: false,
              dragAction: `data-action="detail-drag-start"`,
              dragData: `data-id="${p.id}"`,
            });
          }).join('')}
          <div class="gp-scale-bar" style="width:${Math.max(20, detailScale)}px"></div>
          <span class="gp-scale-label" style="left:10px">1m</span>
        </div>
      </div>
      <div class="text-center mt-3 mb-5 text-sm gp-italic" style="color:#5c4e3e">
        ${S.selectedPlant ? 'Tap inside the bed to plant — keep tapping to add more.' : 'Drag plants to rearrange · tap a plant to select and remove it'}
      </div>
      ${editPlant}
      <div class="gp-divider"></div>
      <div class="mb-6">
        <div class="row items-center justify-between mb-3 flex-wrap gap-2">
          <h3 class="gp-display text-xl">Plant into this bed</h3>
          <div class="row gap-1 overflow-x-auto gp-scroll" data-scroll-key="detail-cats">
            ${PLANT_CATEGORIES.map(c => `<button class="gp-tab ${S.plantCategory === c.id ? 'active' : ''}" data-action="set-category" data-cat="${c.id}">${esc(c.label)}</button>`).join('')}
          </div>
        </div>
        ${searchBoxHTML('Search plants by name…')}
        ${(() => { const list = filteredPlants({ search: S.plantSearch }); return list.length ? plantsGridHTML(list) : emptyPickerHTML({ search: !!S.plantSearch.trim() }); })()}
      </div>
    </div>
  `;
}
