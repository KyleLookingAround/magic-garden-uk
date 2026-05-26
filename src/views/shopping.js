// Shopping list tab: plants (ordered by sow month) and object materials,
// auto-built from the plan with persistent check-off.
import { S } from '../store.js';
import { computeShoppingList } from '../selectors.js';
import { ICON } from '../data/icons.js';
import { esc } from '../lib/util.js';

export function shoppingHTML() {
  const { plants, materials } = computeShoppingList();
  if (plants.length === 0 && materials.length === 0) {
    return `
      <div class="gp-rise">
        <div class="mb-6">
          <h2 class="gp-display text-3xl mb-2">Shopping List</h2>
          <p class="gp-italic" style="color:#5c4e3e">Everything in your plan, ready for the garden centre.</p>
        </div>
        <div class="p-6 rounded-xl text-center gp-italic" style="background:#fbf6ea;border:1px dashed rgba(107,93,79,.3);color:#5c4e3e">
          Nothing planted or placed yet — add some plants and objects in the Design view.
        </div>
      </div>
    `;
  }
  const row = (key, leftIcon, title, sub, rightLabel, color, checked, i, last) => `
    <div class="gp-shop-row" style="background:${i % 2 ? '#fbf6ea' : '#f6efdd'};${!last ? 'border-bottom:1px solid rgba(107,93,79,.12)' : ''}">
      <div class="gp-check ${checked ? 'done' : ''}" data-action="toggle-shopping" data-key="${esc(key)}">
        ${checked ? ICON.check('gp-icon w3-5', '') : ''}
      </div>
      <span class="text-xl">${leftIcon}</span>
      <div class="flex-1 min-w-0">
        <div class="gp-display text-base leading-tight" style="${checked ? 'text-decoration:line-through;opacity:.5' : ''}">${title}</div>
        <div class="text-10" style="color:#5c4e3e">${sub}</div>
      </div>
      ${rightLabel ? `<span class="text-10 uppercase tracking-wider px-2 py-1 rounded-full" style="background:${color}1f;color:#5c4e3e">${rightLabel}</span>` : ''}
    </div>
  `;
  return `
    <div class="gp-rise">
      <div class="mb-6">
        <h2 class="gp-display text-3xl mb-2">Shopping List</h2>
        <p class="gp-italic" style="color:#5c4e3e">
          Everything in your plan, ready for the garden centre. Plants are ordered by when to sow. Ticks are saved.
        </p>
      </div>
      <div class="space-y-6">
        ${plants.length > 0 ? `
          <div>
            <h3 class="gp-display text-xl mb-3 row items-center gap-2"><span style="color:#557049">${ICON.leaf('gp-icon w4', '')}</span>Plants &amp; seeds</h3>
            <div class="rounded-xl overflow-hidden" style="border:1px solid rgba(107,93,79,.2)">
              ${plants.map(({ plant, n, key }, i) => {
                const checked = !!S.state.shopping[key];
                return row(
                  key,
                  plant.icon,
                  `${esc(plant.name)} <span class="gp-italic" style="color:#5c4e3e">×${n}</span>`,
                  `Sow ${esc(plant.sow !== '—' ? plant.sow : '—')} · Plant ${esc(plant.plant !== '—' ? plant.plant : '—')}`,
                  esc(plant.cat),
                  plant.color,
                  checked, i, i === plants.length - 1
                );
              }).join('')}
            </div>
          </div>` : ''}
        ${materials.length > 0 ? `
          <div>
            <h3 class="gp-display text-xl mb-3 row items-center gap-2"><span style="color:#557049">${ICON.trees('gp-icon w4', '')}</span>Objects &amp; materials</h3>
            <div class="rounded-xl overflow-hidden" style="border:1px solid rgba(107,93,79,.2)">
              ${materials.map(({ obj, n, key }, i) => {
                const checked = !!S.state.shopping[key];
                return row(
                  key,
                  obj.icon,
                  `${esc(obj.name)} <span class="gp-italic" style="color:#5c4e3e">×${n}</span>`,
                  esc(obj.tip),
                  '',
                  obj.color,
                  checked, i, i === materials.length - 1
                );
              }).join('')}
            </div>
          </div>` : ''}
      </div>
    </div>
  `;
}
