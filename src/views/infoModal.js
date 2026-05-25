// Plant detail modal: growing info, companions, pollinator value and journal tip.
import { S } from '../store.js';
import { PLANTS_BY_ID, COMPANIONS, pollinatorInfo, POLLINATOR_TYPE_BY_ID } from '../data/plants.js';
import { ICON } from '../data/icons.js';
import { esc } from '../lib/util.js';

export function infoModalHTML() {
  if (!S.infoPlantId) return '';
  const p = PLANTS_BY_ID[S.infoPlantId];
  if (!p) return '';
  const c = COMPANIONS[p.id];
  const nameOf = (id) => PLANTS_BY_ID[id]?.name || id;
  const detail = (icon, label, value) => `
    <div>
      <div class="text-10 uppercase tracking-widest mb-0.5" style="color:#6b5d4f">${label}</div>
      <div class="row items-center gap-1.5 text-sm gp-display" style="color:#2a2419">
        ${icon ? `<span style="color:#87a878">${icon}</span>` : ''}${esc(value)}
      </div>
    </div>
  `;
  return `
    <div class="gp-modal-back" data-action="close-info">
      <div class="gp-modal gp-rise" data-stop>
        <button class="absolute p-1.5 rounded-full gp-soft-hover" style="top:16px;right:16px;color:#6b5d4f" data-action="close-info">${ICON.x('gp-icon w4', '')}</button>
        <div class="row items-center gap-4 mb-5">
          <div class="w16 h16 rounded-2xl row items-center justify-center" style="background:${p.color}25;font-size:36px">${p.icon}</div>
          <div>
            <h3 class="gp-display text-2xl leading-tight">${esc(p.name)}</h3>
            <p class="text-xs uppercase tracking-widest mt-1" style="color:${p.color}">${p.cat}</p>
          </div>
        </div>
        <div class="grid cols-2 gap-4 mb-5">
          ${detail(ICON.sun('gp-icon w3-5', ''), 'Sun', p.sun)}
          ${detail(ICON.droplet('gp-icon w3-5', ''), 'Water', p.water)}
          ${detail('', 'Spacing', p.space)}
          ${detail(ICON.calendar('gp-icon w3-5', ''), 'Sow', p.sow)}
          ${detail(ICON.sprout('gp-icon w3-5', ''), 'Plant', p.plant)}
          ${detail('', 'Harvest', p.harvest)}
        </div>
        ${c && (c.good.length || c.bad.length) ? `
          <div class="mb-5 space-y-3">
            ${c.good.length ? `
              <div>
                <p class="text-xs uppercase tracking-wider mb-1.5 row items-center gap-1.5" style="color:#3e6b36">
                  ${ICON.sparkles('gp-icon w3', '')}Plant alongside
                </p>
                <div class="row flex-wrap gap-1.5">
                  ${c.good.map(id => `<span class="gp-chip" style="background:rgba(90,143,78,.14);color:#3e6b36">${PLANTS_BY_ID[id]?.icon} ${esc(nameOf(id))}</span>`).join('')}
                </div>
              </div>` : ''}
            ${c.bad.length ? `
              <div>
                <p class="text-xs uppercase tracking-wider mb-1.5 row items-center gap-1.5" style="color:#9a5a1d">
                  ${ICON.alert('gp-icon w3', '')}Keep apart from
                </p>
                <div class="row flex-wrap gap-1.5">
                  ${c.bad.map(id => `<span class="gp-chip" style="background:rgba(217,138,61,.16);color:#9a5a1d">${PLANTS_BY_ID[id]?.icon} ${esc(nameOf(id))}</span>`).join('')}
                </div>
              </div>` : ''}
          </div>` : ''}

        ${(() => {
          const pol = pollinatorInfo(p.id);
          if (pol.value === 0) return '';
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const bloomLabel = pol.bloomMonths.length
            ? `${monthNames[pol.bloomMonths[0] - 1]}–${monthNames[pol.bloomMonths[pol.bloomMonths.length - 1] - 1]}`
            : '';
          const stars = '●'.repeat(pol.value) + '○'.repeat(3 - pol.value);
          return `
            <div class="mb-5">
              <p class="text-xs uppercase tracking-wider mb-1.5 row items-center gap-1.5" style="color:#7a4ea3">
                ${ICON.sparkles('gp-icon w3', '')}Loved by
                <span style="color:#3e6b36;letter-spacing:.1em;margin-left:6px">${stars}</span>
              </p>
              <div class="row flex-wrap gap-1.5">
                ${pol.pollinators.map(t => {
                  const T = POLLINATOR_TYPE_BY_ID[t];
                  return `<span class="gp-chip" style="background:${T.color}14;color:${T.color}">${T.icon} ${esc(T.label)}</span>`;
                }).join('')}
                ${bloomLabel ? `<span class="gp-chip" style="background:rgba(107,93,79,.1);color:#6b5d4f">Blooms ${bloomLabel}</span>` : ''}
              </div>
              ${pol.note ? `<p class="text-xs gp-italic mt-2" style="color:#6b5d4f">${esc(pol.note)}</p>` : ''}
            </div>
          `;
        })()}
        <div class="p-4 rounded-xl" style="background:rgba(45,74,46,.07)">
          <p class="text-xs uppercase tracking-wider mb-2" style="color:#87a878">From the journal</p>
          <p class="gp-italic text-base">&ldquo;${esc(p.tip)}&rdquo;</p>
        </div>
        <button class="gp-btn w-full mt-5 py-3 rounded-xl text-xs uppercase tracking-widest justify-center" data-action="plant-this" data-plant-id="${p.id}">Plant this</button>
      </div>
    </div>
  `;
}
