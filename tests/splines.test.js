import { describe, it, expect } from 'vitest';
import { smoothPathD, curveSegmentMid } from '../src/lib/splines.js';

describe('smoothPathD', () => {
  it('returns empty string for no points', () => {
    expect(smoothPathD([])).toBe('');
    expect(smoothPathD(undefined)).toBe('');
  });
  it('returns a move for a single point', () => {
    expect(smoothPathD([{ x: 1, y: 2 }])).toBe('M 1 2');
  });
  it('returns a straight line for two points', () => {
    expect(smoothPathD([{ x: 0, y: 0 }, { x: 10, y: 5 }])).toBe('M 0 0 L 10 5');
  });
  it('emits cubic Beziers for three or more points', () => {
    const d = smoothPathD([{ x: 0, y: 0 }, { x: 5, y: 10 }, { x: 10, y: 0 }]);
    expect(d.startsWith('M 0 0')).toBe(true);
    expect(d).toContain(' C ');
  });
});

describe('curveSegmentMid', () => {
  it('lies between the two anchor points on a straight run', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 10, y: 0 };
    const mid = curveSegmentMid(p1, p1, p2, p2);
    expect(mid.x).toBeGreaterThan(0);
    expect(mid.x).toBeLessThan(10);
    expect(mid.y).toBeCloseTo(0);
  });
});
