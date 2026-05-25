// Curvy paths rendered as a single SVG overlay on the canvas.
// Paths are stored in % units (0-100 of garden length/width) so the SVG sizes
// to the canvas naturally.
import { S } from '../store.js';
import { PATH_STYLES_BY_ID } from '../data/objects.js';
import { smoothPathD, curveSegmentMid } from '../lib/splines.js';

export function pathsSVG() {
  if (!S.state.paths || S.state.paths.length === 0 && !S.pathDraftId) return '';
  const items = S.state.paths || [];
  return `
    <svg class="gp-paths-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="false">
      ${items.map(path => {
        const style = PATH_STYLES_BY_ID[path.style] || PATH_STYLES_BY_ID.gravel;
        const isSelected = S.selectedItem && S.selectedItem.type === 'path' && S.selectedItem.id === path.id;
        // Scale path width from metres to % (relative to garden length axis only —
        // we use the longer dimension to keep it visually consistent)
        const pctW = (path.widthM / S.state.gardenLengthM) * 100;
        const d = smoothPathD(path.points);
        if (!d) return '';
        const strokeWidth = Math.max(0.4, pctW);

        const isStepping = path.style === 'stepping';
        const isPaving = path.style === 'paving';

        // Visible layers (style-dependent)
        let visibleLayers;
        if (isStepping) {
          // Spaced stones - no continuous line
          let stones = path.points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="${strokeWidth * 0.42}" fill="${style.fill}" stroke="${style.edge}" stroke-width=".3" vector-effect="non-scaling-stroke"/>`).join('');
          for (let i = 0; i < path.points.length - 1; i++) {
            const mid = curveSegmentMid(path.points[i - 1], path.points[i], path.points[i + 1], path.points[i + 2]);
            stones += `<circle cx="${mid.x}" cy="${mid.y}" r="${strokeWidth * 0.42}" fill="${style.fill}" stroke="${style.edge}" stroke-width=".3" vector-effect="non-scaling-stroke"/>`;
          }
          visibleLayers = stones;
        } else {
          visibleLayers = `
            <path d="${d}" fill="none" stroke="${style.edge}" stroke-width="${strokeWidth + 0.3}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" opacity=".75" pointer-events="none"/>
            <path d="${d}" fill="none" stroke="${style.fill}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" pointer-events="none"/>
            ${isPaving ? (() => {
              // tick marks across the path for paving slab look — every ~1/4 of the path
              let ticks = '';
              for (let i = 0; i < path.points.length - 1; i++) {
                const mid = curveSegmentMid(path.points[i - 1], path.points[i], path.points[i + 1], path.points[i + 2]);
                ticks += `<circle cx="${mid.x}" cy="${mid.y}" r="${strokeWidth * 0.08}" fill="${style.edge}" opacity=".6"/>`;
              }
              return ticks;
            })() : ''}
          `;
        }

        const selectionHalo = isSelected ? (isStepping
          ? path.points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="${strokeWidth * 0.55}" fill="none" stroke="rgba(45,74,46,.55)" stroke-width=".6" vector-effect="non-scaling-stroke" pointer-events="none"/>`).join('')
          : `<path d="${d}" fill="none" stroke="rgba(45,74,46,.55)" stroke-width="${strokeWidth + 1.2}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" pointer-events="none"/>`
        ) : '';

        return `
          ${selectionHalo}
          ${visibleLayers}
          <path class="gp-path-stroke" d="${d}" fill="none" stroke="transparent" stroke-width="${Math.max(strokeWidth, 2.5)}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" data-action="select-path" data-id="${path.id}"/>
          ${isSelected ? pathHandlesSVG(path) : ''}
        `;
      }).join('')}

      ${S.pathDraftId ? (() => {
        const draft = S.state.paths.find(p => p.id === S.pathDraftId);
        if (!draft) return '';
        const style = PATH_STYLES_BY_ID[draft.style] || PATH_STYLES_BY_ID.gravel;
        const pctW = (draft.widthM / S.state.gardenLengthM) * 100;
        return draft.points.map((p, i) => `
          <circle cx="${p.x}" cy="${p.y}" r="${Math.max(.8, pctW * 0.5)}" fill="#2d4a2e" stroke="#f4ecd8" stroke-width=".4" vector-effect="non-scaling-stroke"/>
        `).join('');
      })() : ''}
    </svg>
  `;
}

function pathHandlesSVG(path) {
  const pts = path.points;
  let html = '';
  // Insert "+" markers between each pair of waypoints
  for (let i = 0; i < pts.length - 1; i++) {
    const mid = curveSegmentMid(pts[i - 1], pts[i], pts[i + 1], pts[i + 2]);
    html += `
      <g class="gp-path-add" data-action="insert-path-point" data-path-id="${path.id}" data-after-index="${i}">
        <circle cx="${mid.x}" cy="${mid.y}" r="1.1" fill="#f4ecd8" stroke="#2d4a2e" stroke-width=".4" vector-effect="non-scaling-stroke"/>
        <line x1="${mid.x - .55}" y1="${mid.y}" x2="${mid.x + .55}" y2="${mid.y}" stroke="#2d4a2e" stroke-width=".3" vector-effect="non-scaling-stroke"/>
        <line x1="${mid.x}" y1="${mid.y - .55}" x2="${mid.x}" y2="${mid.y + .55}" stroke="#2d4a2e" stroke-width=".3" vector-effect="non-scaling-stroke"/>
      </g>
    `;
  }
  // Waypoint handles
  pts.forEach((p, i) => {
    html += `
      <g class="gp-path-handle" data-action="path-point-drag-start" data-path-id="${path.id}" data-point-index="${i}">
        <circle cx="${p.x}" cy="${p.y}" r="1.7" fill="#2d4a2e" stroke="#f4ecd8" stroke-width=".5" vector-effect="non-scaling-stroke"/>
      </g>
    `;
  });
  return html;
}
