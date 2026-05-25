// Pure geometry transforms for placing and rotating beds/objects on the canvas.

/** Rotate a vector (dx, dy) by `deg` degrees (screen coords: y grows downward). */
export const rotateVec = (dx, dy, deg) => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r), s = Math.sin(r);
  return [dx * c + dy * s, -dx * s + dy * c];
};

/** Angle in degrees from centre (cx, cy) to point (x, y). */
export const angleBetween = (cx, cy, x, y) => (Math.atan2(y - cy, x - cx) * 180) / Math.PI;

/** Convert a point in a bed's local coordinates to world (garden) coordinates. */
export const bedLocalToWorld = (bed, lx, ly) => {
  const cx = bed.x + bed.lengthM / 2;
  const cy = bed.y + bed.widthM / 2;
  const [wx, wy] = rotateVec(lx - bed.lengthM / 2, ly - bed.widthM / 2, -(bed.rotation || 0));
  return [cx + wx, cy + wy];
};

/** Convert a world (garden) point into a bed's local coordinates. */
export const worldToBedLocal = (bed, wx, wy) => {
  const cx = bed.x + bed.lengthM / 2;
  const cy = bed.y + bed.widthM / 2;
  const [lx, ly] = rotateVec(wx - cx, wy - cy, bed.rotation || 0);
  return [lx + bed.lengthM / 2, ly + bed.widthM / 2];
};

/** True if world point (px, py) falls inside the (possibly rotated) bed. */
export const pointInBed = (px, py, bed) => {
  const [lx, ly] = worldToBedLocal(bed, px, py);
  return lx >= 0 && lx <= bed.lengthM && ly >= 0 && ly <= bed.widthM;
};
