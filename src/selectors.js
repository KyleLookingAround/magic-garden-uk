// Derived, read-only computations over the current state. No mutations, no render.
import { S } from './store.js';
import { PLANTS_BY_ID, ENRICHED_PLANTS } from './data/plants.js';
import { OBJECT_BY_ID, OBJECTS } from './data/objects.js';
import { pointInBed } from './lib/geometry.js';

/** Plant counts across the garden, richest first. */
export function computeStats() {
  const counts = {};
  S.state.plantings.forEach(p => { counts[p.plantId] = (counts[p.plantId] || 0) + 1; });
  return Object.entries(counts)
    .map(([id, n]) => ({ plant: PLANTS_BY_ID[id], n }))
    .filter(x => x.plant)
    .sort((a, b) => b.n - a.n);
}

/** Shopping list grouped into plants (by sow month) and object materials. */
export function computeShoppingList() {
  const pCounts = {};
  S.state.plantings.forEach(p => { pCounts[p.plantId] = (pCounts[p.plantId] || 0) + 1; });
  const plants = Object.entries(pCounts)
    .map(([id, n]) => ({ plant: PLANTS_BY_ID[id], n, key: `plant:${id}` }))
    .filter(x => x.plant)
    .sort((a, b) => Math.min(...a.plant.months) - Math.min(...b.plant.months));
  const oCounts = {};
  S.state.objects.forEach(o => { oCounts[o.typeId] = (oCounts[o.typeId] || 0) + 1; });
  const materials = Object.entries(oCounts)
    .map(([typeId, n]) => ({ obj: OBJECT_BY_ID[typeId], n, key: `obj:${typeId}` }))
    .filter(x => x.obj)
    .sort((a, b) => a.obj.name.localeCompare(b.obj.name));
  return { plants, materials };
}

/** Estimated planting capacity of a bed and how many sit inside it. */
export function bedCapacity(bed) {
  const area = bed.lengthM * bed.widthM;
  const inside = S.state.plantings.filter(p => pointInBed(p.x, p.y, bed));
  let avgCell = 0.09;
  if (inside.length) {
    const avgCm = inside.reduce((sum, p) => sum + (PLANTS_BY_ID[p.plantId]?.sizeCm || 30), 0) / inside.length;
    avgCell = Math.max(0.01, Math.pow(avgCm / 100, 2));
  }
  return { cap: Math.max(1, Math.floor(area / avgCell)), planted: inside.length };
}

export function filteredPlants() {
  return S.plantCategory === 'all' ? ENRICHED_PLANTS : ENRICHED_PLANTS.filter(p => p.cat === S.plantCategory);
}

export function filteredObjects() {
  return S.objectCategory === 'all' ? OBJECTS : OBJECTS.filter(o => o.cat === S.objectCategory);
}
