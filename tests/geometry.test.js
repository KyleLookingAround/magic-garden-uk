import { describe, it, expect } from 'vitest';
import { rotateVec, angleBetween, bedLocalToWorld, worldToBedLocal, pointInBed } from '../src/lib/geometry.js';

describe('rotateVec', () => {
  it('returns the same vector at 0 degrees', () => {
    const [x, y] = rotateVec(3, 4, 0);
    expect(x).toBeCloseTo(3);
    expect(y).toBeCloseTo(4);
  });
  it('rotates 90 degrees (screen coords, y down)', () => {
    const [x, y] = rotateVec(1, 0, 90);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(-1);
  });
});

describe('angleBetween', () => {
  it('is 0 along +x', () => expect(angleBetween(0, 0, 5, 0)).toBeCloseTo(0));
  it('is 90 along +y', () => expect(angleBetween(0, 0, 0, 5)).toBeCloseTo(90));
});

describe('bed local/world round-trip', () => {
  const bed = { x: 2, y: 1, lengthM: 3, widthM: 2, rotation: 37 };
  it('round-trips an interior point through rotation', () => {
    const [wx, wy] = bedLocalToWorld(bed, 1.2, 0.8);
    const [lx, ly] = worldToBedLocal(bed, wx, wy);
    expect(lx).toBeCloseTo(1.2);
    expect(ly).toBeCloseTo(0.8);
  });
  it('maps local centre to the bed centre in world space', () => {
    const [wx, wy] = bedLocalToWorld(bed, bed.lengthM / 2, bed.widthM / 2);
    expect(wx).toBeCloseTo(bed.x + bed.lengthM / 2);
    expect(wy).toBeCloseTo(bed.y + bed.widthM / 2);
  });
});

describe('pointInBed', () => {
  const bed = { x: 0, y: 0, lengthM: 4, widthM: 2, rotation: 0 };
  it('detects an interior point', () => expect(pointInBed(2, 1, bed)).toBe(true));
  it('rejects an exterior point', () => expect(pointInBed(5, 1, bed)).toBe(false));
  it('rejects a point just outside a rotated bed', () => {
    const rotated = { x: 0, y: 0, lengthM: 4, widthM: 1, rotation: 90 };
    // A point far along the unrotated long axis falls outside once rotated.
    expect(pointInBed(3.9, 0.5, rotated)).toBe(false);
  });
});
