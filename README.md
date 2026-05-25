# Garden Planner

A single-file, offline-first garden planner. Drag beds, plants, objects and curvy paths onto a top-down map of your garden; track companion planting, pollinator value, a shopping list, and per-bed notes. Designed for UK gardens.

Open `index.html` in any modern browser and it just works. No build step, no server, no account.

## Live demo

If you've published this to GitHub Pages, point folks at:

```
https://<your-username>.github.io/<repo-name>/
```

## Features

**Design tab**
- Top-down canvas at real scale, in metres
- Resizable, rotatable beds with snap-to-edge
- 17 illustrated objects: trees, shrubs, hedges, lawn, patio, decking, pond, shed, greenhouse, compost, bench, water butt, fence, arch, and more
- Draw curvy paths between waypoints — gravel, paving, mown grass, stepping stones, bark/mulch
- Pick a plant from the picker, then tap the garden to place it; companion neighbours show a green ring, ones to keep apart show amber
- Drill into any bed for a focused view with absolute placement of each plant
- Month slider to see what's actually visible through the year
- 50-step undo

**Plant library**
- 30 vegetables, herbs, flowers and fruit chosen for UK climate
- Each plant has sowing/planting/harvest months, sun & water needs, spacing, companion lists, pollinator value, and a one-line journal tip

**Pollinators tab**
- Counts of how many plants feed bees, butterflies and hoverflies
- Seasonal forage chart: a bar per month showing when your garden is actually in bloom
- "Quieter months" callout suggesting where you have gaps
- Suggestions for top-value plants you haven't yet planted
- Link out to [Pollinator Pathmaker](https://pollinator.art/) by Alexandra Daisy Ginsberg for fully algorithm-designed pollinator gardens

**Shopping list**
- Auto-built from your plan
- Persistent check-off across visits

**Notes & tasks**
- Notes per bed (lined paper styling)
- Task list per bed with check-off

## Storage

Everything saves to `localStorage` under the key `garden-planner:v4`. It's per-browser, per-device — there's no sync. To move a plan between devices, open DevTools, copy the value of `garden-planner:v4`, and paste it into the same key on the other device.

Legacy keys `garden-planner:v1`, `:v2`, `:v3` are automatically migrated on first load.

## Mobile

Optimised for mobile from the start. Drags use direct DOM mutation instead of full re-renders, so it stays smooth on touch. To install it as a home-screen app on iOS, open in Safari → Share → Add to Home Screen.

## Architecture (one-paragraph version)

It's one HTML file with inline CSS and JS, no dependencies and no build. UI re-renders by rewriting `#root.innerHTML` on every state change, with focus restoration so text inputs don't lose their cursor. Drag operations suppress re-renders and mutate the dragged element's style directly, then trigger a full render on pointer-up. Path curves are smooth Catmull-Rom splines through user-placed waypoints, rendered as a single SVG overlay on the canvas. Object visuals are inline SVGs per object type. State is JSON, saved to `localStorage` on a 300ms debounce.

## Files

- `index.html` — the entire app (~156 KB)
- `README.md` — this file
- `LICENSE` — MIT

## Customising

The plant data lives near the top of `index.html` as a const `PLANTS` (with parallel `COMPANIONS` and `POLLINATORS` maps). Add or change a plant by editing those arrays — no build step needed.

The object visuals are in the `objectVisualSVG` function. Each object type gets its own inline SVG.

Path styles are in `PATH_STYLES`.

## Browser support

Modern Chrome, Safari, Firefox, Edge. Uses `localStorage`, CSS grid, `ResizeObserver`, and pointer events. Google Fonts loads from the web; if offline, falls back to Georgia and system sans cleanly.

## License

MIT — see `LICENSE`.
