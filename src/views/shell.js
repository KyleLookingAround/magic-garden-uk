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
        ${toolsHTML()}
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
        <footer class="gp-no-print mt-12 sm:mt-16 pt-6 text-center" style="border-top:1px dashed rgba(107,93,79,.3)">
          <p class="gp-italic text-xs" style="color:#5c4e3e">Saved quietly in your browser · Works offline · Climate notes are for the UK</p>
        </footer>
      </div>
      ${S.flash ? `<div class="gp-toast gp-no-print" role="status">${esc(S.flash)}</div>` : ''}
      ${S.swUpdateReady ? `
        <div class="gp-toast gp-update-toast gp-no-print" role="status">
          <span>A new version is ready.</span>
          <button class="gp-update-btn" data-action="apply-update">Refresh</button>
        </div>` : ''}
    </div>
  `;
}

function toolsHTML() {
  const tool = (action, icon, label) =>
    `<button class="gp-btn-ghost" data-action="${action}">${icon}${label}</button>`;
  const panel = S.toolsOpen ? `
    <div class="gp-rise mb-4 p-4 rounded-lg" style="background:rgba(45,74,46,.05);border:1px dashed rgba(45,74,46,.2)">
      <div class="row items-center gap-2 flex-wrap">
        ${tool('share-plan', ICON.share('gp-icon w3-5', ''), 'Share link')}
        ${tool('export-plan', ICON.download('gp-icon w3-5', ''), 'Export backup')}
        ${tool('import-plan', ICON.upload('gp-icon w3-5', ''), 'Import backup')}
        ${tool('export-calendar', ICON.calendar('gp-icon w3-5', ''), 'Calendar (.ics)')}
        ${tool('print-plan', ICON.printer('gp-icon w3-5', ''), 'Print')}
      </div>
      <p class="gp-italic text-xs mt-3" style="color:#5c4e3e">
        Everything stays on your device. Export a <strong>backup</strong> to move your plan between devices, copy a <strong>share link</strong> to send it to someone, or download a <strong>calendar</strong> of sow &amp; plant-out reminders.
      </p>
    </div>` : '';
  return `
    <div class="gp-no-print">
      <div class="row items-center mb-3">
        <div class="flex-1"></div>
        <button class="gp-btn-ghost ${S.toolsOpen ? 'active-draft' : ''}" data-action="toggle-tools" aria-expanded="${S.toolsOpen}">
          ${ICON.share('gp-icon w3-5', '')}Backup &amp; share
        </button>
      </div>
      ${panel}
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
      <div class="row items-center gap-2 mb-3" style="color:#557049">
        <div style="height:1px;width:24px;background:#87a878"></div>
        <span class="text-xs uppercase" style="letter-spacing:.25em">A Garden Journal</span>
      </div>
      ${headerName}
      <p class="gp-italic mt-3 text-base" style="color:#5c4e3e">
        ${S.state.gardenLengthM}m × ${S.state.gardenWidthM}m · ${(S.state.gardenLengthM * S.state.gardenWidthM).toFixed(1)} m² of green
      </p>
    </header>
  `;
}

function tabsHTML() {
  const T = (id, label, icon) => `<button class="gp-tab ${S.view === id ? 'active' : ''}" data-action="set-view" data-view="${id}">${icon}${label}</button>`;
  return `
    <div class="gp-no-print gp-tabstrip">
      <div class="row items-center gap-1 overflow-x-auto gp-scroll" data-scroll-key="tabs">
        ${T('design', 'Design', ICON.layers('gp-icon w3'))}
        ${T('library', 'Plant library', ICON.book('gp-icon w3'))}
        ${T('pollinators', 'Pollinators', ICON.sparkles('gp-icon w3'))}
        ${T('shopping', 'Shopping list', ICON.basket('gp-icon w3'))}
        ${T('notes', 'Notes & tasks', ICON.edit('gp-icon w3'))}
      </div>
    </div>
  `;
}
