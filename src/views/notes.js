// Notes & tasks tab: a per-bed task list and lined-paper notes area.
import { S } from '../store.js';
import { ICON } from '../data/icons.js';
import { esc } from '../lib/util.js';

export function notesHTML() {
  if (S.state.beds.length === 0) {
    return `
      <div class="gp-rise">
        <div class="mb-6">
          <h2 class="gp-display text-3xl mb-2">Notes &amp; Tasks</h2>
        </div>
        <div class="p-6 rounded-xl text-center gp-italic" style="background:#fbf6ea;border:1px dashed rgba(107,93,79,.3);color:#6b5d4f">
          Add a bed in the Design view to start keeping notes.
        </div>
      </div>
    `;
  }
  if (!S.notesBedId || !S.state.beds.find(b => b.id === S.notesBedId)) S.notesBedId = S.state.beds[0].id;
  const bed = S.state.beds.find(b => b.id === S.notesBedId);
  return `
    <div class="gp-rise">
      <div class="mb-6">
        <h2 class="gp-display text-3xl mb-2">Notes &amp; Tasks</h2>
        <p class="gp-italic" style="color:#6b5d4f">
          Seed orders, what worked last year, and a running to-do list for each bed.
        </p>
      </div>
      <div class="row items-center gap-2 mb-6 overflow-x-auto gp-scroll pb-2" data-scroll-key="bed-tabs">
        ${S.state.beds.map(b => {
          const active = b.id === S.notesBedId;
          return `<button class="px-4 py-2 rounded-full text-sm nowrap" data-action="set-notes-bed" data-id="${b.id}"
                   style="background:${active ? '#2d4a2e' : 'transparent'};color:${active ? '#f4ecd8' : '#2a2419'};border:1px solid ${active ? '#2d4a2e' : 'rgba(45,74,46,.25)'}">${esc(b.name)}</button>`;
        }).join('')}
      </div>
      <div class="space-y-5">
        <div class="rounded-2xl p-6" style="background:#fbf6ea;border:1px solid rgba(107,93,79,.18)">
          <div class="gp-display text-xl mb-4">${esc(bed.name)} — tasks</div>
          ${bed.tasks.length > 0 ? `
            <div class="space-y-1.5 mb-4">
              ${bed.tasks.map(t => `
                <div class="row items-center gap-3">
                  <div class="gp-check ${t.done ? 'done' : ''}" data-action="toggle-task" data-bed-id="${bed.id}" data-task-id="${t.id}">
                    ${t.done ? ICON.check('gp-icon w3-5', '') : ''}
                  </div>
                  <span class="flex-1 text-sm" style="${t.done ? 'text-decoration:line-through;opacity:.5' : ''}">${esc(t.text)}</span>
                  <button class="p-1 rounded-full gp-soft-hover-red" data-action="delete-task" data-bed-id="${bed.id}" data-task-id="${t.id}" style="color:#c87454">${ICON.x('gp-icon w3-5', '')}</button>
                </div>
              `).join('')}
            </div>` : ''}
          <div class="row items-center gap-2">
            <input class="gp-text" placeholder="Add a task — e.g. put up bean canes" value="${esc(S.newTaskText)}"
              data-action="task-input" data-bed-id="${bed.id}" data-focus-key="new-task-${bed.id}">
            <button class="gp-btn flex-shrink-0" data-action="add-task" data-bed-id="${bed.id}">Add</button>
          </div>
        </div>
        <div class="rounded-2xl p-6 sm:p-7" style="background:#fbf6ea;border:1px solid rgba(107,93,79,.18)">
          <div class="gp-display text-xl mb-4">${esc(bed.name)} — notes</div>
          <textarea class="gp-notes" rows="12" placeholder="Saturday morning — picked up tomato plants from the garden centre. Trying 'Sungold' and 'Tigerella' this year…"
            data-action="update-notes" data-bed-id="${bed.id}" data-focus-key="notes-${bed.id}">${esc(bed.notes)}</textarea>
        </div>
      </div>
    </div>
  `;
}
