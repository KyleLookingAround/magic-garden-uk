// Top-level page shell: header, tabs, the active view, and the info modal.
import { S } from '../store.js';
import { ICON } from '../data/icons.js';
import { esc } from '../lib/util.js';
import { designViewHTML } from './design.js';
import { bedDetailHTML } from './bedDetail.js';
import { libraryHTML } from './library.js';
import { pollinatorsHTML } from './pollinators.js';
import { shoppingHTML } from './shopping.js';
import { notesHTML } from './notes.js';
import { infoModalHTML } from './infoModal.js';

export function buildAppHTML() {
  return `
    <div class="gp-paper gp-grain gp-body">
      <div class="gp-wrap relative">
        ${headerHTML()}
        ${tabsHTML()}
        ${
          S.view === 'design'
            ? (S.bedDetailId ? bedDetailHTML() : designViewHTML())
            : S.view === 'library' ? libraryHTML()
            : S.view === 'pollinators' ? pollinatorsHTML()
            : S.view === 'shopping' ? shoppingHTML()
            : S.view === 'notes' ? notesHTML()
            : ''
        }
        ${infoModalHTML()}
        <footer class="mt-12 sm:mt-16 pt-6 text-center" style="border-top:1px dashed rgba(107,93,79,.3)">
          <p class="gp-italic text-xs" style="color:#6b5d4f">Saved quietly in your browser · Climate notes are for the UK</p>
        </footer>
      </div>
    </div>
  `;
}

function headerHTML() {
  const headerName = S.editingName
    ? `<input class="gp-input gp-display text-4xl sm:text-5xl" data-action="garden-name-input" data-focus-key="garden-name" value="${esc(S.state.gardenName)}" autofocus>`
    : `<button class="row items-baseline gap-3" data-action="edit-garden-name" style="text-align:left">
         <span class="gp-display text-4xl sm:text-5xl md:text-6xl leading-none">${esc(S.state.gardenName)}</span>
         <span class="opacity-50">${ICON.edit('gp-icon w4')}</span>
       </button>`;
  return `
    <header class="gp-fade-in mb-7 sm:mb-10">
      <div class="row items-center gap-2 mb-3" style="color:#87a878">
        <div style="height:1px;width:24px;background:#87a878"></div>
        <span class="text-xs uppercase" style="letter-spacing:.25em">A Garden Journal</span>
      </div>
      ${headerName}
      <p class="gp-italic mt-3 text-base" style="color:#6b5d4f">
        ${S.state.gardenLengthM}m × ${S.state.gardenWidthM}m · ${(S.state.gardenLengthM * S.state.gardenWidthM).toFixed(1)} m² of green
      </p>
    </header>
  `;
}

function tabsHTML() {
  const T = (id, label, icon) => `<button class="gp-tab ${S.view === id ? 'active' : ''}" data-action="set-view" data-view="${id}">${icon}${label}</button>`;
  return `
    <div class="row items-center gap-1 mb-6 overflow-x-auto gp-scroll" data-scroll-key="tabs">
      ${T('design', 'Design', ICON.layers('gp-icon w3'))}
      ${T('library', 'Plant library', ICON.book('gp-icon w3'))}
      ${T('pollinators', 'Pollinators', ICON.sparkles('gp-icon w3'))}
      ${T('shopping', 'Shopping list', ICON.basket('gp-icon w3'))}
      ${T('notes', 'Notes & tasks', ICON.edit('gp-icon w3'))}
    </div>
  `;
}
