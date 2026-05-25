// Catmull-Rom-derived smooth curves for the curvy-path feature.

// Convert a list of waypoints (in % units) to a smooth SVG path "d" attribute.
// Uses Catmull-Rom-to-cubic-Bezier conversion with closed-loop=false.
export function smoothPathD(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  const tension = 0.5; // 0 = linear, 1 = very smooth
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * tension / 3;
    const c1y = p1.y + (p2.y - p0.y) * tension / 3;
    const c2x = p2.x - (p3.x - p1.x) * tension / 3;
    const c2y = p2.y - (p3.y - p1.y) * tension / 3;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// Estimate the midpoint of a smooth curve between two waypoints, given neighbours,
// by evaluating the Bezier at t=0.5. Used to position "+ insert here" handles.
export function curveSegmentMid(prev, p1, p2, next) {
  const p0 = prev || p1;
  const p3 = next || p2;
  const t = 0.5, tension = 0.5;
  const c1x = p1.x + (p2.x - p0.x) * tension / 3;
  const c1y = p1.y + (p2.y - p0.y) * tension / 3;
  const c2x = p2.x - (p3.x - p1.x) * tension / 3;
  const c2y = p2.y - (p3.y - p1.y) * tension / 3;
  const omt = 1 - t;
  const x = omt * omt * omt * p1.x + 3 * omt * omt * t * c1x + 3 * omt * t * t * c2x + t * t * t * p2.x;
  const y = omt * omt * omt * p1.y + 3 * omt * omt * t * c1y + 3 * omt * t * t * c2y + t * t * t * p2.y;
  return { x, y };
}
