// Canvas item renderers: bed/object rectangles and plant markers.
import { S } from '../store.js';
import { OBJECT_BY_ID } from '../data/objects.js';
import { PLANTS_BY_ID, companionRel } from '../data/plants.js';
import { ICON } from '../data/icons.js';
import { esc, clamp } from '../lib/util.js';
import { objectVisualSVG } from './objectVisual.js';

export function rectHTML(item, kind) {
  const isSelected = S.selectedItem && S.selectedItem.type === kind && S.selectedItem.id === item.id;
  const obj = kind === 'object' ? OBJECT_BY_ID[item.typeId] : null;
  const isCircle = obj && obj.shape === 'circle';
  const scale = S.canvasWidthPx / S.state.gardenLengthM;
  const lengthPx = item.lengthM * scale;
  const widthPx = item.widthM * scale;
  const cxPctX = ((item.x + item.lengthM / 2) / S.state.gardenLengthM) * 100;
  const cxPctY = ((item.y + item.widthM / 2) / S.state.gardenWidthM) * 100;

  let bg, border;
  if (kind === 'bed') {
    bg = 'rgba(150,112,66,.32)'; border = '2px dashed rgba(90,72,50,.8)';
  } else if (obj.cat === 'ground') {
    bg = 'transparent'; border = 'none';
  } else {
    bg = 'transparent'; border = 'none';
  }
  const sel = isSelected ? 'box-shadow:0 0 0 3px rgba(45,74,46,.55),0 6px 24px rgba(45,74,46,.18);' : '';
  const z = isSelected ? 20 : (kind === 'object' && obj.cat === 'ground') ? 1 : kind === 'bed' ? 4 : 8;
  const handles = isSelected ? `
    <div class="gp-rotate-handle" data-action="drag-start" data-type="${kind}" data-id="${item.id}" data-mode="rotate" title="Drag to rotate">${ICON.rotate('gp-icon w3', '')}</div>
    <div class="gp-rotate-stem"></div>
    <div class="gp-resize-handle" data-action="drag-start" data-type="${kind}" data-id="${item.id}" data-mode="resize" title="Drag to resize">${ICON.movediag('gp-icon w2-5', '')}</div>
  ` : '';
  const labelTxt = kind === 'object'
    ? esc(item.label || obj.name)
    : esc(item.name);
  const showLabel = kind === 'bed' || isSelected || (item.label && item.label !== obj?.name);
  const svgVisual = kind === 'object' ? objectVisualSVG(item, obj) : '';

  return `
    <div class="gp-rect ${isSelected ? 'selected' : ''}"
         data-action="drag-start" data-type="${kind}" data-id="${item.id}" data-mode="move"
         title="${isSelected ? 'Drag to move' : 'Tap to select · drag to move'}"
         style="left:${cxPctX}%;top:${cxPctY}%;width:${lengthPx}px;height:${widthPx}px;transform:translate(-50%,-50%) rotate(${item.rotation || 0}deg);border-radius:${isCircle ? '50%' : '4px'};z-index:${z};background:${bg};border:${border};${sel}">
      ${svgVisual}
      ${showLabel ? `<span class="gp-rect-label">${labelTxt}</span>` : ''}
      ${handles}
    </div>
  `;
}

export function plantingHTML(p, opts) {
  const plant = PLANTS_BY_ID[p.plantId];
  if (!plant) return '';
  const { scale, leftPct, topPct, dim, dragAction, dragData } = opts;
  const isSelected = S.selectedItem && S.selectedItem.type === 'planting' && S.selectedItem.id === p.id;
  const sizePx = Math.max(28, plant.sizeCm * scale / 100);
  const emoji = clamp(sizePx * 0.55, 13, 26);

  const focusId = S.selectedPlant || (S.selectedItem?.type === 'planting' ? S.state.plantings.find(x => x.id === S.selectedItem.id)?.plantId : null);
  let ring = null;
  if (focusId && !isSelected) {
    const rel = companionRel(focusId, p.plantId);
    if (rel === 'good') ring = 'rgba(90,143,78,.9)';
    else if (rel === 'bad') ring = 'rgba(217,138,61,.95)';
  }
  const sel = isSelected
    ? '0 0 0 3px rgba(45,74,46,.55),0 6px 14px rgba(45,74,46,.28)'
    : ring ? `0 0 0 3px ${ring}` : 'none';
  const dimmed = dim ? ' dimmed' : '';

  return `
    <div class="gp-planting${isSelected ? ' selected' : ''}${dimmed}"
         ${dragAction} ${dragData}
         style="left:${leftPct}%;top:${topPct}%;width:${sizePx}px;height:${sizePx}px;background:${plant.color}66;border-color:${plant.color};font-size:${emoji}px;box-shadow:${sel}"
         title="${esc(plant.name)}">
      <span style="pointer-events:none">${plant.icon}</span>
    </div>
  `;
}
