import { describe, it, expect } from 'vitest';
import { companionRel, parseSizeCm, pollinatorInfo, PLANTS, PLANTS_BY_ID } from '../src/data/plants.js';
import { ensureShape, migrateState } from '../src/lib/migrate.js';

describe('companionRel', () => {
  it('is symmetric for known good pairs', () => {
    expect(companionRel('tomato', 'basil')).toBe('good');
    expect(companionRel('basil', 'tomato')).toBe('good');
  });
  it('flags known bad pairs', () => {
    expect(companionRel('tomato', 'potato')).toBe('bad');
  });
  it('returns null for unrelated or identical ids', () => {
    expect(companionRel('tomato', 'tomato')).toBeNull();
    expect(companionRel('tomato', 'lavender')).toBeNull();
  });
});

describe('parseSizeCm', () => {
  it('averages a range', () => expect(parseSizeCm('45–60 cm')).toBeCloseTo(52.5));
  it('reads a single value', () => expect(parseSizeCm('90 cm')).toBe(90));
  it('falls back to 30 when no number present', () => expect(parseSizeCm('—')).toBe(30));
  it('enriches every plant with a numeric sizeCm', () => {
    PLANTS.forEach(p => expect(typeof PLANTS_BY_ID[p.id].sizeCm).toBe('number'));
  });
});

describe('pollinatorInfo', () => {
  it('returns a safe default for unknown ids', () => {
    expect(pollinatorInfo('does-not-exist')).toEqual({ value: 0, bloomMonths: [], pollinators: [], note: '' });
  });
});

describe('ensureShape', () => {
  it('fills defaults for an empty object', () => {
    const s = ensureShape({});
    expect(s.gardenName).toBe('Our Garden');
    expect(s.gardenLengthM).toBe(8);
    expect(Array.isArray(s.beds)).toBe(true);
    expect(s.shopping).toEqual({});
  });
  it('drops plantings referencing unknown plants', () => {
    const s = ensureShape({ plantings: [{ id: 'p1', plantId: 'tomato', x: 1, y: 1 }, { id: 'p2', plantId: 'nope', x: 1, y: 1 }] });
    expect(s.plantings).toHaveLength(1);
    expect(s.plantings[0].plantId).toBe('tomato');
  });
  it('drops paths with fewer than two points', () => {
    const s = ensureShape({ paths: [{ id: 'a', style: 'gravel', points: [{ x: 1, y: 1 }] }] });
    expect(s.paths).toHaveLength(0);
  });
});

describe('migrateState', () => {
  it('passes through an already-v4 document', () => {
    const v4 = { gardenName: 'G', gardenLengthM: 10, gardenWidthM: 5, beds: [], objects: [], plantings: [], paths: [], shopping: {} };
    const out = migrateState(v4);
    expect(out.gardenLengthM).toBe(10);
  });
  it('migrates a legacy grid-based bed into metres with plantings', () => {
    const legacy = { gardenName: 'Old', beds: [{ name: 'A', cols: 8, rows: 4, cellCm: 30, plants: { '0,0': 'tomato' } }] };
    const out = migrateState(legacy);
    expect(out.beds).toHaveLength(1);
    expect(out.beds[0].lengthM).toBeCloseTo(2.4);
    expect(out.plantings).toHaveLength(1);
    expect(out.plantings[0].plantId).toBe('tomato');
    // Garden auto-grows to contain the bed.
    expect(out.gardenLengthM).toBeGreaterThanOrEqual(out.beds[0].x + out.beds[0].lengthM);
  });
});
