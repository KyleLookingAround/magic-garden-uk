// Application entry point: load persisted state, render, wire up events.
import './styles.css';
import { load, flushSave } from './store.js';
import { render } from './render.js';
import { bindEvents } from './events.js';
import { maybeLoadSharedPlan } from './io.js';

// Flush any pending debounced save before the tab is closed.
window.addEventListener('beforeunload', flushSave);

load();
maybeLoadSharedPlan();
render();
bindEvents();

// Offline support: register the service worker in production builds only
// (skipped in dev so it never caches hot-reloaded modules).
const env = /** @type {any} */ (import.meta).env;
if (env && env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
