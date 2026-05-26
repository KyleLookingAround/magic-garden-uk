# Test improvement plan

Guidance for a future session on strengthening the test suite. Current coverage:
**unit (Vitest)** — `data` (companions, sizes, pollinator info, migration), `geometry`,
`splines`, `transfer`, `calendar`, and `integration` (a smoke test that renders every
view and fires actions without throwing); **E2E (Playwright)** — `app.spec.js`
(header/tabs, backup panel, export-download round-trip, share round-trip, calendar
guidance, print CSS, shopping nav, offline reload) and `screenshots.spec.js`.

The gaps below are ordered by value. Each item names the file to add/extend and the
concrete behaviours to assert. Prefer extending the existing pure-function unit tests
(fast, deterministic) and reserve E2E for things that genuinely need a real browser
(drag, service worker, focus/caret).

## P0 — core behaviour that is currently untested

1. **`selectors.js` (new `tests/selectors.test.js`)** — none of the derived computations
   are covered.
   - `computeStats`: counts per plant, richest-first ordering, ignores unknown plant ids.
   - `computeShoppingList`: plants ordered by earliest sow month; materials grouped by
     object type and alphabetised; keys are `plant:<id>` / `obj:<typeId>`.
   - `bedCapacity`: capacity scales with bed area and average plant size; `planted`
     counts only plantings whose point falls inside the bed (uses `pointInBed`).

2. **`actions.js` + `history.js` (new `tests/actions.test.js`)** — `integration.test.js`
   only checks "doesn't throw". Assert real outcomes against a freshly `load()`ed `S`:
   - `addBed`/`addObject` push an item and select it; positions clamp inside the garden.
   - `deleteSelected` removes the right item by type; `duplicateSelected` offsets the
     copy and gives it a fresh id (and fresh task ids for beds).
   - `snap()` then `undo()` restores the previous document and clears selection; the
     stack caps at 50 (`history.js`).
   - Path editing: `appendPathPoint` clamps to 0–100; `finishPathDraft` discards a draft
     with < 2 points; `insertPathPoint` adds at the spline midpoint; `deletePathPoint`
     refuses below 2 points.
   - `toggleShopping`/`setGardenSize` clamp and persist.

3. **Render focus/scroll restoration (`tests/render.test.js`)** — the trickiest UX
   invariant. In jsdom: render with a focused `[data-focus-key]` input carrying a caret
   selection, mutate state, `render()` again, and assert the same element is re-focused
   with caret and `scrollTop` preserved, and `[data-scroll-key]` lists keep `scrollLeft`.

## P1 — broaden the modules that already have tests

4. **`migrate.js`** — extend `data.test.js`: legacy v1–v3 grid beds with `cellCm`/rows/cols
   convert to metres and lay out without overlap; garden auto-grows to contain beds;
   corrupt/partial imports (missing arrays, non-object `shopping`, paths with bad points)
   normalise without throwing.

5. **`calendar.js`** — RFC-5545 details: `DESCRIPTION`/`SUMMARY` escape commas, semicolons
   and backslashes; one `VEVENT` per distinct planted variety (deduped, not per planting);
   plants with no parseable sow *or* plant month emit nothing; `DTSTART` matches the parsed
   month; lines are CRLF-joined.

6. **`transfer.js`** — a large plan still produces a decodable hash; a tampered/truncated
   hash throws cleanly; the file envelope (`app`/`version`/`exportedAt`) is tolerated *and*
   a bare state document is accepted; round-trip preserves paths and shopping ticks.

## P2 — real-browser coverage that jsdom can't reach

7. **Drag / resize / rotate / snap (`e2e/drag.spec.js`)** — the app's real complexity.
   Use Playwright `mouse.move/down/up` (or `dragTo`) on `#gp-canvas` to: place a plant by
   tapping with a selected plant, drag a bed and assert its `x/y` changed and snapped to a
   neighbour edge, resize via the brown handle, rotate via the green handle, and confirm a
   drag does *not* fire the click handler (the `drag.moved` guard).

8. **Import flow + PWA update prompt (extend `e2e/app.spec.js`)** —
   - Import: `page.setInputFiles` is awkward here because the file input is created
     ad-hoc in `io.js`; drive it via the `filechooser` event, feed a known backup, assert
     the garden name/plantings update and a "Plan imported" toast appears.
   - Update prompt: build, load, then simulate `onNeedRefresh` (or push a new SW) and
     assert the "new version ready — Refresh" toast renders and the button reloads.
   - `onOfflineReady`: assert the "Ready to work offline" toast on first install.

9. **Visual regression** — promote `screenshots.spec.js` from "capture only" to
   `await expect(page).toHaveScreenshot()` with committed baselines (mask the canvas if the
   default garden is nondeterministic). Manage baselines per project (desktop/mobile) and
   document `--update-snapshots`.

## Tooling / CI

10. **Coverage**: add `@vitest/coverage-v8`, a `test:cov` script, and a soft threshold
    (start ~70% lines on `src/lib` + `src/selectors.js` + `src/actions.js`); upload the
    report artifact in CI.
11. **Flake control**: keep `trace: 'on-first-retry'`; consider sharding E2E if it grows;
    add `paths-ignore` for docs-only changes so markdown edits don't run the full suite.
12. **Accessibility smoke**: optional `@axe-core/playwright` pass on the main views and a
    keyboard-only nav check (tabs, plant picker, modal close).

## Notes / gotchas for whoever picks this up

- Keep new pure-logic tests in Vitest (jsdom) — they run in ~ms. Only reach for Playwright
  when a behaviour needs layout, real pointer events, the service worker, or caret state.
- `io.js` is in the unit-test import graph via `events.js`; don't import build-only modules
  (e.g. `virtual:pwa-register`) from anything tests load. That import stays in `main.js`.
- Any test that constructs state from raw JSON must mirror production and pass it through
  `migrateState` (see `transfer.parsePlan`) — don't assert on un-normalised shapes.
- E2E gets a fresh browser context per test, so `localStorage` resets to the default
  garden each time; tests that need plantings must create them in-test.
