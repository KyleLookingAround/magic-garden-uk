# Magic Garden — UK Garden Planner

An offline-first garden planner. Drag beds, plants, objects and curvy paths onto a top-down map of your garden; track companion planting, pollinator value, a shopping list, and per-bed notes. Designed for UK gardens.

Everything runs in the browser — no server, no account. State lives in `localStorage`.

## Quick start

```bash
npm install
npm run dev      # local dev server with hot reload
```

Then open the printed URL.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot-module reload |
| `npm run build` | Production build to `dist/` (what Netlify publishes) |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest unit + integration suite |
| `npm run typecheck` | Type-check the JS with `tsc --checkJs` |

## Features

**Design tab**
- Top-down canvas at real scale, in metres
- Resizable, rotatable beds with snap-to-edge
- 17 illustrated objects: trees, shrubs, hedges, lawn, patio, decking, pond, shed, greenhouse, compost, bench, water butt, fence, arch, and more
- Draw curvy paths between waypoints — gravel, paving, mown grass, stepping stones, bark/mulch
- Pick a plant, then tap the garden to place it; companion neighbours show a green ring, ones to keep apart show amber
- Drill into any bed for a focused view with absolute placement of each plant
- Month slider to see what's actually visible through the year
- 50-step undo

**Plant library** — 30 UK-climate plants, each with sowing/planting/harvest months, sun & water needs, spacing, companion lists, pollinator value, and a journal tip.

**Pollinators tab** — counts of plants feeding bees, butterflies and hoverflies, a seasonal forage chart, a "quieter months" callout, and suggestions for top-value plants you haven't planted. Links out to [Pollinator Pathmaker](https://pollinator.art/).

**Shopping list** — auto-built from your plan, with persistent check-off.

**Notes & tasks** — notes and a task list per bed.

**Backup, share & offline** — from the *Backup & share* panel above the tabs you can:
- **Export** your whole plan to a `.json` backup file, and **Import** it back on any device — the proper way to move a garden between browsers.
- Copy a **share link** that encodes the entire plan in the URL, to send to someone else (no server involved).
- Download a **calendar** (`.ics`) of yearly *sow* and *plant-out* reminders for everything you've planted — import it into any calendar app.
- **Print** the current view (the garden map, or the shopping list) to paper or PDF.
- The app is also a **PWA**: a service worker caches it so it keeps working with no connection, and it can be installed to a phone home screen.

## Architecture

The app is plain ES modules (no UI framework) bundled by [Vite](https://vitejs.dev/). The build output in `dist/` is a static site Netlify serves directly. Rendering is a full `#root.innerHTML` rewrite on each state change, with focus/scroll restoration so text inputs keep their cursor; drags suppress re-renders and mutate the dragged node's style directly, committing on pointer-up.

```
index.html              # shell: loads src/main.js
src/
  main.js               # entry: load state, render, bind events
  store.js              # the single mutable state object `S` + localStorage persistence
  history.js            # undo stack
  render.js             # render loop with focus/scroll restoration
  selectors.js          # derived, read-only computations (stats, shopping, capacity)
  actions.js            # all state mutations
  drag.js               # pointer-driven drag/resize/rotate system
  events.js             # delegated data-action event handling
  styles.css            # all styles
  data/
    plants.js           # PLANTS, COMPANIONS, POLLINATORS + lookups
    objects.js          # OBJECTS and PATH_STYLES
    icons.js            # inline SVG icon set
  lib/
    util.js             # esc, clamp, newId, month helpers
    geometry.js         # bed local/world transforms, rotation, hit-testing
    splines.js          # Catmull-Rom curvy-path maths
    factory.js          # state constructors + the default starter garden
    migrate.js          # normalise/migrate persisted state across versions
  views/                # one module per screen + canvas item renderers
tests/                  # Vitest: geometry, splines, data/migration, integration
```

### Why no framework?

The drag, spline and snap maths are the app's real complexity and work well as plain functions, so the rewrite kept them framework-free. The `views/` modules are pure functions of state that return HTML strings, which makes them easy to read and test without a render runtime.

## Customising

- **Plants** live in `src/data/plants.js` as `PLANTS`, with parallel `COMPANIONS` and `POLLINATORS` maps. Add or change a plant by editing those.
- **Objects** (trees, structures, ground cover) live in `src/data/objects.js` as `OBJECTS`; path styles are `PATH_STYLES` in the same file.
- **Object visuals** are inline SVGs in `src/views/objectVisual.js`.

## Storage

Everything saves to `localStorage` under `garden-planner:v4`, per-browser and per-device (no sync). Legacy keys `:v1`–`:v3` are migrated automatically on first load. To move a plan between devices, use **Export backup** / **Import backup** (or a **share link**) from the *Backup & share* panel — all client-side, no account. Opening a share link asks before replacing the plan in the current browser.

## Deployment (Netlify)

`netlify.toml` sets the build command to `npm run build` and publishes `dist/`. It also sets a strict Content-Security-Policy, long-lived caching for hashed assets, and security headers.

## Browser support

Modern Chrome, Safari, Firefox, Edge. Uses `localStorage`, CSS grid, `ResizeObserver`, and pointer events. Google Fonts load from the web; if offline, it falls back to Georgia and a system sans cleanly.

## License

MIT — see `LICENSE`.
