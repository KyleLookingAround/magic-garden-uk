// Normalise and migrate persisted state across schema versions.
import { newId } from './util.js';
import { OBJECT_BY_ID, PATH_STYLES_BY_ID } from '../data/objects.js';
import { PLANTS_BY_ID } from '../data/plants.js';

/** Coerce a loosely-shaped object into the canonical v4 state shape. */
export const ensureShape = (s) => ({
  gardenName: s.gardenName || 'Our Garden',
  gardenLengthM: s.gardenLengthM || 8,
  gardenWidthM: s.gardenWidthM || 6,
  beds: (s.beds || []).map(b => ({
    id: b.id || newId('bed'),
    name: b.name || 'Bed',
    x: b.x ?? 0.5, y: b.y ?? 0.5,
    lengthM: b.lengthM ?? 2.4, widthM: b.widthM ?? 1.2,
    rotation: b.rotation || 0,
    notes: b.notes || '',
    tasks: Array.isArray(b.tasks) ? b.tasks : [],
  })),
  objects: (s.objects || []).map(o => ({
    id: o.id || newId('obj'),
    typeId: o.typeId,
    x: o.x ?? 0.5, y: o.y ?? 0.5,
    lengthM: o.lengthM ?? 1, widthM: o.widthM ?? 1,
    rotation: o.rotation || 0,
    label: o.label || '',
  })).filter(o => OBJECT_BY_ID[o.typeId]),
  plantings: (s.plantings || []).filter(p => PLANTS_BY_ID[p.plantId]),
  paths: (s.paths || []).map(p => ({
    id: p.id || newId('path'),
    style: PATH_STYLES_BY_ID[p.style] ? p.style : 'gravel',
    widthM: p.widthM ?? 0.6,
    points: (Array.isArray(p.points) ? p.points : []).filter(pt => typeof pt?.x === 'number' && typeof pt?.y === 'number'),
  })).filter(p => p.points.length >= 2),
  shopping: s.shopping && typeof s.shopping === 'object' ? s.shopping : {},
});

/** Migrate any prior persisted shape (grid-based v1–v3 or already-v4) to v4. */
export const migrateState = (parsed) => {
  if (parsed.gardenLengthM != null && parsed.plantings != null) return ensureShape(parsed);
  const out = { gardenName: parsed.gardenName || 'Our Garden', gardenLengthM: 8, gardenWidthM: 6, beds: [], objects: [], plantings: [], shopping: {} };
  if (parsed.beds && Array.isArray(parsed.beds)) {
    let cursorX = 0.5;
    parsed.beds.forEach((bed, idx) => {
      const cellCm = bed.cellCm || 30;
      const cellM = cellCm / 100;
      const lengthM = bed.lengthM || (bed.cols || 8) * cellM;
      const widthM = bed.widthM || (bed.rows || 4) * cellM;
      const x = bed.x ?? cursorX;
      const y = bed.y ?? 0.5;
      cursorX += lengthM + 0.5;
      out.beds.push({ id: bed.id || newId('bed'), name: bed.name || `Bed ${idx + 1}`, x, y, lengthM, widthM, rotation: 0, notes: bed.notes || '', tasks: [] });
      if (bed.plants && typeof bed.plants === 'object') {
        Object.entries(bed.plants).forEach(([key, plantId]) => {
          const [r, c] = key.split(',').map(Number);
          out.plantings.push({ id: newId('plant'), plantId, x: x + (c + 0.5) * cellM, y: y + (r + 0.5) * cellM });
        });
      }
    });
  }
  out.beds.forEach(b => {
    out.gardenLengthM = Math.max(out.gardenLengthM, Math.ceil(b.x + b.lengthM + 1));
    out.gardenWidthM = Math.max(out.gardenWidthM, Math.ceil(b.y + b.widthM + 1));
  });
  return ensureShape(out);
};
