// Plant Library tab: a reference grid of every plant with its notes.
import { S } from '../store.js';
import { PLANT_CATEGORIES } from '../data/plants.js';
import { filteredPlants } from '../selectors.js';
import { ICON } from '../data/icons.js';
import { esc } from '../lib/util.js';

export function libraryHTML() {
  return `
    <div class="gp-rise">
      <div class="mb-6">
        <h2 class="gp-display text-3xl mb-2">The Plant Library</h2>
        <p class="gp-italic" style="color:#6b5d4f">
          Tap any plant for its full notes — including which neighbours it likes and which to keep apart.
        </p>
      </div>
      <div class="row gap-1 mb-6 overflow-x-auto gp-scroll" data-scroll-key="lib-cats">
        ${PLANT_CATEGORIES.map(c => `<button class="gp-tab ${S.plantCategory === c.id ? 'active' : ''}" data-action="set-category" data-cat="${c.id}">${esc(c.label)}</button>`).join('')}
      </div>
      <div class="grid cols-1 sm:cols-2 lg:cols-3 gap-4">
        ${filteredPlants().map(p => `
          <div class="gp-plant-card" data-action="open-info" data-plant-id="${p.id}">
            <div class="row items-start gap-3 mb-3">
              <div class="w12 h12 rounded-md row items-center justify-center text-2xl flex-shrink-0" style="background:${p.color}1f">${p.icon}</div>
              <div class="flex-1 min-w-0">
                <div class="gp-display text-lg leading-tight">${esc(p.name)}</div>
                <div class="text-10 mt-0.5 uppercase tracking-wider" style="color:#6b5d4f">${p.cat}</div>
              </div>
            </div>
            <div class="space-y-1.5 text-xs" style="color:#6b5d4f">
              <div class="row items-center gap-1.5">${ICON.sun('gp-icon w3', '')}${esc(p.sun)}</div>
              <div class="row items-center gap-1.5">${ICON.droplet('gp-icon w3', '')}${esc(p.water)}</div>
              <div class="row items-center gap-1.5"><span class="inline-block w3 text-center">↔</span> Spacing ${esc(p.space)}</div>
              <div class="row items-center gap-1.5">${ICON.calendar('gp-icon w3', '')}Plant ${esc(p.plant !== '—' ? p.plant : p.sow)}</div>
              <div class="row items-center gap-1.5">${ICON.sprout('gp-icon w3', '')}${esc(p.harvest)}</div>
            </div>
            <p class="gp-italic mt-3 text-sm pt-3" style="color:#2d4a2e;border-top:1px dashed rgba(107,93,79,.25)">
              &ldquo;${esc(p.tip)}&rdquo;
            </p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
