// Pollinators tab: forage chart, per-type counts, planted list and suggestions.
import { S } from '../store.js';
import { PLANTS_BY_ID, ENRICHED_PLANTS, pollinatorInfo, POLLINATOR_TYPES, POLLINATOR_TYPE_BY_ID } from '../data/plants.js';
import { esc } from '../lib/util.js';

export function pollinatorsHTML() {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Aggregate by planting
  const monthly = Array(12).fill(0);          // total forage value per month
  const monthlyTypes = Array.from({ length: 12 }, () => new Set());
  const typesServed = { bees: 0, butterflies: 0, hoverflies: 0 };
  const plantedBuckets = new Map();           // plantId -> {count, info, plant}

  S.state.plantings.forEach(pl => {
    const plant = PLANTS_BY_ID[pl.plantId];
    if (!plant) return;
    const info = pollinatorInfo(pl.plantId);
    if (!plantedBuckets.has(pl.plantId)) plantedBuckets.set(pl.plantId, { plant, info, count: 0 });
    plantedBuckets.get(pl.plantId).count++;
    info.bloomMonths.forEach(m => {
      monthly[m - 1] += info.value;
      info.pollinators.forEach(t => monthlyTypes[m - 1].add(t));
    });
    info.pollinators.forEach(t => { if (t in typesServed) typesServed[t]++; });
  });

  const totalScore = Object.values(monthly).reduce((a, b) => a + b, 0);
  const maxMonth = Math.max(1, ...monthly);
  const plantedList = Array.from(plantedBuckets.values())
    .filter(b => b.info.value > 0)
    .sort((a, b) => (b.info.value * b.count) - (a.info.value * a.count));

  // Suggestions: plants NOT planted yet, sorted by value, top 6
  const plantedIds = new Set(S.state.plantings.map(p => p.plantId));
  const suggestions = ENRICHED_PLANTS
    .filter(p => !plantedIds.has(p.id) && pollinatorInfo(p.id).value === 3)
    .sort((a, b) => {
      // Prefer suggestions that cover the lowest-coverage months in the garden
      const ai = pollinatorInfo(a.id), bi = pollinatorInfo(b.id);
      const gapScore = (info) => info.bloomMonths.reduce((s, m) => s + (1 / Math.max(1, monthly[m - 1] + 1)), 0);
      return gapScore(bi) - gapScore(ai);
    })
    .slice(0, 6);

  // Build the seasonal forage chart
  const chartCols = monthly.map((v, i) => {
    const pct = v === 0 ? 0 : Math.max(8, (v / maxMonth) * 100);
    const types = Array.from(monthlyTypes[i]);
    const fill = v === 0
      ? 'background:rgba(107,93,79,.12)'
      : `background:linear-gradient(to top, #2d4a2e ${100 - pct}%, #87a878 100%)`;
    return `
      <div class="gp-pol-col" title="${monthNames[i]}: ${v} pollinator-value · ${types.join(', ') || 'no forage'}">
        <div class="gp-pol-bar-wrap">
          <div class="gp-pol-bar" style="height:${pct}%;${fill}"></div>
        </div>
        <div class="gp-pol-month ${i === new Date().getMonth() ? 'current' : ''}">${monthNames[i]}</div>
      </div>
    `;
  }).join('');

  // Find quietest months with at least one planting
  const lowMonths = totalScore > 0
    ? monthly.map((v, i) => ({ v, i })).filter(x => x.v <= maxMonth * 0.35).map(x => monthNames[x.i])
    : [];

  const empty = S.state.plantings.length === 0;

  return `
    <div>
      <div class="mb-6">
        <h2 class="gp-display text-3xl mb-2">For the Pollinators</h2>
        <p class="gp-italic" style="color:#6b5d4f">
          A view of your garden through the eyes of bees, butterflies and hoverflies — what's in bloom, and when.
        </p>
      </div>

      ${empty ? `
        <div class="p-5 rounded-xl mb-6" style="background:rgba(45,74,46,.05);border:1px dashed rgba(45,74,46,.25)">
          <p class="text-sm" style="color:#3e6b36">
            Plant something pollinator-friendly to see your garden's value to bees, butterflies and hoverflies.
            Lavender, rosemary, foxglove, sunflower and marigold are all excellent choices.
          </p>
        </div>
      ` : `

        <!-- Score summary -->
        <div class="grid cols-3 gap-3 mb-6">
          ${POLLINATOR_TYPES.map(t => {
            const n = typesServed[t.id];
            return `
              <div class="p-4 rounded-xl" style="background:${t.color}14;border:1px solid ${t.color}33">
                <div class="text-2xl mb-1">${t.icon}</div>
                <div class="text-10 uppercase tracking-widest" style="color:#6b5d4f">${t.label}</div>
                <div class="gp-display text-2xl mt-1" style="color:${t.color}">${n}</div>
                <div class="text-10" style="color:#6b5d4f">plant${n === 1 ? '' : 's'} feeding them</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Seasonal forage chart -->
        <div class="mb-6 p-4 rounded-xl" style="background:#fbf6ea;border:1px solid rgba(107,93,79,.25)">
          <div class="row items-baseline justify-between mb-1">
            <h3 class="gp-display text-lg">Seasonal forage</h3>
            <span class="text-xs gp-italic" style="color:#6b5d4f">when your garden's in bloom</span>
          </div>
          <div class="gp-pol-chart mt-3">${chartCols}</div>
          ${lowMonths.length ? `
            <p class="text-xs mt-3 gp-italic" style="color:#9a5a1d">
              Quieter months for pollinators: ${lowMonths.join(', ')}. Adding plants that bloom then would help.
            </p>` : ''}
        </div>

        <!-- Planted plants -->
        ${plantedList.length ? `
          <div class="mb-6">
            <h3 class="gp-display text-lg mb-3">In your garden</h3>
            <div class="grid cols-1 sm:cols-2 gap-2">
              ${plantedList.map(b => {
                const stars = '●'.repeat(b.info.value) + '○'.repeat(3 - b.info.value);
                return `
                  <div class="p-3 rounded-lg row items-start gap-3" style="background:#fbf6ea;border:1px solid rgba(107,93,79,.18)">
                    <div class="w10 h10 rounded-md row items-center justify-center text-xl flex-shrink-0" style="background:${b.plant.color}1f">${b.plant.icon}</div>
                    <div class="flex-1 min-w-0">
                      <div class="row items-baseline gap-2">
                        <div class="gp-display text-base">${esc(b.plant.name)}</div>
                        <span class="text-10" style="color:#6b5d4f">×${b.count}</span>
                      </div>
                      <div class="text-10 mt-0.5" style="color:#6b5d4f">
                        <span style="color:#3e6b36;letter-spacing:.05em">${stars}</span>
                        · ${b.info.pollinators.map(t => POLLINATOR_TYPE_BY_ID[t]?.icon || '').join(' ') || '—'}
                      </div>
                      ${b.info.note ? `<div class="text-10 gp-italic mt-1" style="color:#6b5d4f">${esc(b.info.note)}</div>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      `}

      <!-- Suggestions -->
      ${suggestions.length ? `
        <div class="mb-6">
          <h3 class="gp-display text-lg mb-1">Add more for pollinators</h3>
          <p class="text-xs gp-italic mb-3" style="color:#6b5d4f">
            ${empty ? 'Top-value plants for UK pollinators.' : `Three-star plants you haven't planted yet${lowMonths.length ? ', favouring the quiet months' : ''}.`}
          </p>
          <div class="grid cols-2 sm:cols-3 gap-2">
            ${suggestions.map(p => {
              const info = pollinatorInfo(p.id);
              const months = info.bloomMonths.length
                ? `${monthNames[info.bloomMonths[0] - 1]}–${monthNames[info.bloomMonths[info.bloomMonths.length - 1] - 1]}`
                : '';
              return `
                <div class="p-3 rounded-lg" style="background:#fbf6ea;border:1px solid rgba(107,93,79,.18);cursor:pointer" role="button" tabindex="0" data-action="open-info" data-plant-id="${p.id}">
                  <div class="row items-center gap-2 mb-1">
                    <div class="w8 h8 rounded-md row items-center justify-center text-base" style="background:${p.color}1f">${p.icon}</div>
                    <div class="gp-display text-sm flex-1 min-w-0 truncate">${esc(p.name)}</div>
                  </div>
                  <div class="text-10" style="color:#6b5d4f">
                    Blooms ${months} · ${info.pollinators.map(t => POLLINATOR_TYPE_BY_ID[t]?.icon || '').join(' ')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Pollinator Pathmaker link -->
      <div class="mt-8 p-5 rounded-xl" style="background:rgba(122,78,163,.06);border:1px solid rgba(122,78,163,.25)">
        <div class="row items-center gap-2 mb-2">
          <span class="text-xl">🌸</span>
          <span class="text-xs uppercase tracking-widest" style="color:#7a4ea3">A garden designed for pollinators</span>
        </div>
        <p class="text-sm mb-3" style="color:#3a2e44">
          For a planting plan designed by an algorithm to support the maximum number of pollinator species,
          try <span class="gp-italic">Pollinator Pathmaker</span> — a living artwork by Alexandra Daisy Ginsberg,
          originally commissioned by the Eden Project. The tool is free to use and produces a downloadable
          plan with plant list and certificate of authenticity.
        </p>
        <a href="https://pollinator.art/" target="_blank" rel="noopener" class="gp-btn" style="text-decoration:none">
          Open pollinator.art →
        </a>
      </div>
    </div>
  `;
}
