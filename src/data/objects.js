// Placeable object templates (trees, structures, ground cover) and path styles.
// Each object visual is drawn by objectVisualSVG() in src/views/objectVisual.js.

export const OBJECTS = [
  { id: 'apple-tree', name: 'Apple Tree', icon: '🍎', cat: 'green', L: 3.5, W: 3.5, color: '#7c9b5c', shape: 'circle', tip: 'Allow 3–4 m for a mature dwarf apple.' },
  { id: 'cherry-tree', name: 'Cherry Tree', icon: '🌳', cat: 'green', L: 4.0, W: 4.0, color: '#5c8b4c', shape: 'circle', tip: 'Lovely blossom in spring — needs sun.' },
  { id: 'ornamental-tree', name: 'Small Tree', icon: '🌲', cat: 'green', L: 2.5, W: 2.5, color: '#6b8e6b', shape: 'circle', tip: 'Acer, magnolia, or similar small ornamental.' },
  { id: 'shrub', name: 'Shrub', icon: '🌿', cat: 'green', L: 1.2, W: 1.2, color: '#87a878', shape: 'circle', tip: 'Buddleia, hydrangea, viburnum, etc.' },
  { id: 'hedge', name: 'Hedge', icon: '🌳', cat: 'green', L: 4.0, W: 0.5, color: '#4a6b4a', shape: 'rect', tip: 'Beech, yew, or privet — long and narrow.' },
  { id: 'lawn', name: 'Lawn', icon: '🌱', cat: 'ground', L: 4.0, W: 3.0, color: '#a8c878', shape: 'rect', tip: 'Soft green ground cover.' },
  { id: 'patio', name: 'Patio', icon: '⬜', cat: 'ground', L: 3.0, W: 2.5, color: '#b5a890', shape: 'rect', tip: 'Paved area for sitting out.' },
  { id: 'path', name: 'Straight path', icon: '🛤️', cat: 'ground', L: 3.0, W: 0.6, color: '#c4b89e', shape: 'rect', tip: 'Short straight stretch. For curved paths, use Draw path above the canvas.' },
  { id: 'decking', name: 'Decking', icon: '🟫', cat: 'ground', L: 3.0, W: 2.5, color: '#a08768', shape: 'rect', tip: 'Timber deck.' },
  { id: 'pond', name: 'Pond', icon: '💧', cat: 'feature', L: 1.8, W: 1.2, color: '#7eb6c4', shape: 'circle', tip: 'Wildlife magnet — frogs love it.' },
  { id: 'shed', name: 'Shed', icon: '🏚️', cat: 'feature', L: 2.4, W: 1.8, color: '#8b6f47', shape: 'rect', tip: 'Standard 8×6 garden shed.' },
  { id: 'greenhouse', name: 'Greenhouse', icon: '🏡', cat: 'feature', L: 2.5, W: 1.8, color: '#a8c8b5', shape: 'rect', tip: 'Glass or polycarbonate.' },
  { id: 'compost', name: 'Compost Bin', icon: '♻️', cat: 'feature', L: 0.9, W: 0.9, color: '#5d4e3a', shape: 'rect', tip: 'Tuck away in a corner.' },
  { id: 'bench', name: 'Bench', icon: '🪑', cat: 'feature', L: 1.5, W: 0.5, color: '#94785a', shape: 'rect', tip: 'A spot to sit and admire your work.' },
  { id: 'water-butt', name: 'Water Butt', icon: '🛢️', cat: 'feature', L: 0.6, W: 0.6, color: '#3a5a6b', shape: 'circle', tip: 'Collect rainwater off the shed roof.' },
  { id: 'fence', name: 'Fence', icon: '🟫', cat: 'feature', L: 3.0, W: 0.1, color: '#7a6448', shape: 'rect', tip: 'Standard timber panel fence.' },
  { id: 'arch', name: 'Arch', icon: '🌸', cat: 'feature', L: 1.2, W: 0.5, color: '#b8a47e', shape: 'rect', tip: 'Lovely with climbing roses or sweet peas.' },
];
export const OBJECT_BY_ID = Object.fromEntries(OBJECTS.map(o => [o.id, o]));
export const OBJECT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'green', label: 'Trees & Shrubs' },
  { id: 'ground', label: 'Lawn & Paths' },
  { id: 'feature', label: 'Features' },
];

// ── Path styles (for curvy paths drawn through waypoints) ──────────────
export const PATH_STYLES = [
  { id: 'gravel', name: 'Gravel', fill: '#c8bb9e', edge: '#8a7860', icon: '·∴·' },
  { id: 'paving', name: 'Paving', fill: '#bdab92', edge: '#8a7860', icon: '▥' },
  { id: 'grass', name: 'Grass / mown', fill: '#a8c878', edge: '#7ba858', icon: '≋' },
  { id: 'stepping', name: 'Stepping stones', fill: '#a8a39a', edge: '#6b6660', icon: '••' },
  { id: 'mulch', name: 'Bark / mulch', fill: '#9e7a52', edge: '#5d4a30', icon: '~' },
];
export const PATH_STYLES_BY_ID = Object.fromEntries(PATH_STYLES.map(s => [s.id, s]));
