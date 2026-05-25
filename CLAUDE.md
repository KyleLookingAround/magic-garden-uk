# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server with HMR (service worker is disabled in dev)
npm run build        # Production build to dist/ — also generates the PWA service worker
npm run preview      # Serve the built dist/ on :4173 (use this to exercise the real service worker)
npm test             # Vitest unit/integration suite (run once)
npm run test:watch   # Vitest in watch mode
npm run typecheck    # tsc --checkJs over src/ (no emit)
npm run test:e2e     # Playwright E2E — builds + serves + drives a real browser
```

Run a single unit test: `npx vitest run tests/calendar.test.js` or filter by name with `npx vitest run -t "monthStartFromText"`.
Run a single E2E test: `npx playwright test e2e/app.spec.js -g "works offline"` (requires `npx playwright install chromium` once).

## Architecture

A framework-free, offline-first single-page app bundled by Vite. There is no backend and no account — the entire garden document lives in `localStorage`. The real complexity is the drag/spline/snap geometry, which is why it's kept as plain functions rather than wrapped in a UI framework.

**State + render loop (the core pattern):**
- `src/store.js` exports a single mutable object `S`. `S.state` is the persisted garden document; all other fields are transient UI state. Modules import `S` and mutate it directly (this is why it's one exported object, not separate `let`s — an importer can't reassign a `let`).
- Rendering is a **full `#root.innerHTML` rewrite** on every change. `src/render.js` captures the focused element's `data-focus-key`, caret, and scroll positions before the rewrite and restores them after, so text inputs survive re-renders. Always give inputs a stable `data-focus-key`.
- Views in `src/views/` are **pure functions returning HTML strings**. `buildAppHTML()` in `views/shell.js` is the entry; it dispatches on `S.view`. Interpolate any user/data string through `esc()` from `lib/util.js`.
- `scheduleRender()` coalesces renders via `requestAnimationFrame`. During a drag, `S.renderSuppressed` blocks renders entirely and `drag.js` mutates the dragged node's style directly, committing to state on pointer-up.

**Events:** fully delegated. Every interactive element carries a `data-action` attribute; `src/events.js` binds a handful of listeners on `#root` (pointerdown for drags/canvas taps, click for most actions, input/focusin/keydown for fields) and dispatches in big switch statements. Add behaviour by adding a `data-action` in a view and a case in `events.js`, not by attaching listeners.

**Mutations + history:** all state changes go through `src/actions.js`, which call `saveSoon()` (debounced localStorage write) and, for structural changes, `snap()` (push a deep-clone onto the 50-entry undo stack in `history.js`) and `scheduleRender()`. `selectors.js` holds derived read-only computations (stats, shopping list, bed capacity) — never mutate there.

**Persistence + migration:** saved under `localStorage` key `garden-planner:v4`. `lib/migrate.js` `migrateState()`/`ensureShape()` normalises any prior or partial shape (legacy grid-based v1–v3, or hand-edited imports) into the canonical v4 document. **Any externally-sourced state (file import, share link) must pass through `migrateState` before becoming `S.state`.**

**Data:** `data/plants.js` (PLANTS + parallel COMPANIONS/POLLINATORS maps + lookups), `data/objects.js` (OBJECTS, PATH_STYLES), `data/icons.js` (inline SVG icon functions). `lib/geometry.js` and `lib/splines.js` hold the bed transform / hit-testing and Catmull-Rom path maths.

## Offline / backup / share features

- `lib/transfer.js` (pure, tested): `serializePlan`/`parsePlan` for JSON backup files, `encodePlanToHash`/`decodePlanFromHash` for share links (UTF-8-safe base64url). All run input through `migrateState`.
- `lib/calendar.js` (pure, tested): `buildICS` produces an `.ics` of yearly sow/plant-out reminders parsed from the plant timing strings.
- `src/io.js` (DOM glue, **not** in the unit-test graph by design — but it *is* imported by `events.js`, so keep it free of build-only imports): file download/upload, clipboard share, print, the `flash()` toast, and `maybeLoadSharedPlan()` (called once in `main.js`).
- PWA via `vite-plugin-pwa` (configured in `vite.config.js`, `registerType: 'prompt'`, `clientsClaim: true`). Registration lives only in `main.js` via `import { registerSW } from 'virtual:pwa-register'` (type-stubbed in `src/pwa.d.ts`). **Keep the `virtual:pwa-register` import out of any module reachable from tests** — `io.js`/`events.js` are in the test graph, `main.js` is not.

## Conventions and gotchas

- **CSP is strict** (`netlify.toml`): `script-src 'self'`, no inline scripts, `connect-src 'self'` (relaxed from `'none'` only so the service worker can fetch same-origin assets — do not add third-party origins). File downloads use blob URLs + `<a download>`, which CSP permits.
- **Print** is CSS-driven: `window.print()` plus an `@media print` block in `styles.css` that hides everything tagged `gp-no-print`. New interactive chrome that shouldn't print needs that class.
- **Type-checking is `tsc --checkJs`** with `types: []`. When a value's type isn't expressible in JS, cast with `/** @type {any} */ (...)` as existing code does; declare virtual/ambient modules in a `src/*.d.ts` (included via `jsconfig.json`).
- Comments: explain *why*, not *what*; the codebase keeps them sparse and purposeful.

## CI/CD

`.github/workflows/ci.yml` runs on every push and PR: typecheck → unit tests → Playwright E2E (desktop + mobile Chromium) → uploads the report/screenshots as artifacts. On PRs it also publishes the captured UI screenshots to a dedicated `ci-screenshots` branch (per-PR folder, kept out of `main`) and upserts a sticky PR comment embedding them — that branch is excluded from the push trigger to avoid a CI loop. Netlify builds `dist/` and posts a deploy preview; `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` keeps Netlify installs from fetching browsers.

## Deployment

Netlify serves the static `dist/` (`netlify.toml`): build command `npm run build`, strict security/CSP headers, long-lived caching for hashed `assets/*`, and `no-cache` for `sw.js`.
