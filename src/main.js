// Application entry point: load persisted state, render, wire up events.
import './styles.css';
import { registerSW } from 'virtual:pwa-register';
import { S, load, flushSave } from './store.js';
import { render, scheduleRender } from './render.js';
import { bindEvents } from './events.js';
import { flash, maybeLoadSharedPlan } from './io.js';

// Flush any pending debounced save before the tab is closed.
window.addEventListener('beforeunload', flushSave);

load();
maybeLoadSharedPlan();
render();
bindEvents();

// Offline support: vite-plugin-pwa precaches the app for full offline use.
// With registerType 'prompt' the new worker waits; we surface a refresh toast
// (rendered by the shell) and activate it when the user accepts.
const updateSW = registerSW({
  onNeedRefresh() {
    S.applyUpdate = () => updateSW(true);
    S.swUpdateReady = true;
    scheduleRender();
  },
  onOfflineReady() {
    flash('Ready to work offline');
  },
});
