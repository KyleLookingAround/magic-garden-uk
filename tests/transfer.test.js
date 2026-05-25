import { describe, it, expect } from 'vitest';
import { serializePlan, parsePlan, encodePlanToHash, decodePlanFromHash } from '../src/lib/transfer.js';

const sample = () => ({
  gardenName: 'Café Jardín 🌻',
  gardenLengthM: 9,
  gardenWidthM: 5,
  beds: [{ id: 'b1', name: 'Veg', x: 1, y: 1, lengthM: 2, widthM: 1, rotation: 0, notes: '', tasks: [] }],
  objects: [],
  plantings: [{ id: 'p1', plantId: 'tomato', x: 1.5, y: 1.5 }],
  paths: [],
  shopping: { 'plant:tomato': true },
});

describe('serializePlan / parsePlan', () => {
  it('round-trips a plan through the file envelope', () => {
    const out = parsePlan(serializePlan(sample()));
    expect(out.gardenName).toBe('Café Jardín 🌻');
    expect(out.gardenLengthM).toBe(9);
    expect(out.plantings).toHaveLength(1);
    expect(out.shopping['plant:tomato']).toBe(true);
  });
  it('accepts a bare state document (no envelope)', () => {
    const out = parsePlan(JSON.stringify(sample()));
    expect(out.beds).toHaveLength(1);
  });
  it('normalises a partial document via migration', () => {
    const out = parsePlan('{"gardenName":"Tiny"}');
    expect(out.gardenName).toBe('Tiny');
    expect(Array.isArray(out.beds)).toBe(true);
  });
  it('throws on invalid JSON', () => {
    expect(() => parsePlan('not json')).toThrow();
  });
  it('throws on a non-object payload', () => {
    expect(() => parsePlan('[1,2,3]')).toThrow();
  });
});

describe('encodePlanToHash / decodePlanFromHash', () => {
  it('round-trips, preserving unicode names', () => {
    const out = decodePlanFromHash(encodePlanToHash(sample()));
    expect(out.gardenName).toBe('Café Jardín 🌻');
    expect(out.plantings[0].plantId).toBe('tomato');
  });
  it('produces a URL-safe string (no +, /, or =)', () => {
    const hash = encodePlanToHash(sample());
    expect(hash).not.toMatch(/[+/=]/);
  });
  it('throws on a corrupt hash', () => {
    expect(() => decodePlanFromHash('@@@not-base64@@@')).toThrow();
  });
});
