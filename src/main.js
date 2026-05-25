// Application entry point: load persisted state, render, wire up events.
import './styles.css';
import { load, flushSave } from './store.js';
import { render } from './render.js';
import { bindEvents } from './events.js';

// Flush any pending debounced save before the tab is closed.
window.addEventListener('beforeunload', flushSave);

load();
render();
bindEvents();
