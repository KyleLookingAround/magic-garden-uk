import { test } from '@playwright/test';

// The service worker shows a one-off "Ready to work offline" toast on first
// load. Wait for it to appear and auto-dismiss (2.8s) so it doesn't sit over
// the canvas in the reference shots.
async function settleStartupToast(page) {
  await page.waitForSelector('.gp-toast', { state: 'visible', timeout: 3500 }).catch(() => {});
  await page.waitForSelector('.gp-toast', { state: 'detached', timeout: 4000 }).catch(() => {});
}

// Captures reference screenshots into tmp-shots/ for CI to upload as artifacts,
// so the UI can be eyeballed from a run without anyone running a browser locally.
test('capture key screens', async ({ page }, testInfo) => {
  const tag = testInfo.project.name;

  // Stub clipboard so share-related actions don't throw in headless mode.
  await page.addInitScript(() => {
    navigator.clipboard.writeText = async () => {};
  });

  await page.goto('/');
  await page.waitForSelector('#root .gp-wrap');
  await settleStartupToast(page);
  await page.waitForTimeout(400);

  // 01 – design view (empty canvas on first load)
  await page.screenshot({ path: `tmp-shots/${tag}-01-home.png`, fullPage: true });

  // 02 – backup & share panel open
  await page.click('[data-action="toggle-tools"]');
  await page.waitForTimeout(250);
  await page.screenshot({ path: `tmp-shots/${tag}-02-tools-open.png`, fullPage: true });

  // 03 – export backup with success toast visible
  await page.click('[data-action="export-plan"]');
  await page.waitForSelector('.gp-toast');
  await page.screenshot({ path: `tmp-shots/${tag}-03-export-toast.png`, fullPage: true });

  // Close tools panel before switching views
  await page.click('[data-action="toggle-tools"]');
  await page.waitForTimeout(200);

  // 04 – plant library
  await page.click('[data-action="set-view"][data-view="library"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tmp-shots/${tag}-04-library.png`, fullPage: true });

  // 05 – companion planting / pollinators
  await page.click('[data-action="set-view"][data-view="pollinators"]');
  await page.waitForTimeout(250);
  await page.screenshot({ path: `tmp-shots/${tag}-05-pollinators.png`, fullPage: true });

  // 06 – notes
  await page.click('[data-action="set-view"][data-view="notes"]');
  await page.waitForTimeout(250);
  await page.screenshot({ path: `tmp-shots/${tag}-06-notes.png`, fullPage: true });

  // 07 – shopping list
  await page.click('[data-action="set-view"][data-view="shopping"]');
  await page.waitForTimeout(250);
  await page.screenshot({ path: `tmp-shots/${tag}-07-shopping.png`, fullPage: true });

  // 08 – print layout (design view with interactive chrome hidden by CSS)
  await page.click('[data-action="set-view"][data-view="design"]');
  await page.waitForSelector('#gp-canvas');
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `tmp-shots/${tag}-08-print-design.png`, fullPage: true });
  await page.emulateMedia({ media: 'screen' });
});

// A worked-example garden seeded straight into localStorage, so the canvas,
// shopping list and print view are shown with real content rather than empty.
// Shape mirrors the canonical v4 document (see lib/migrate.js): beds/objects
// carry top-left x,y in metres; plantings sit at world points inside a bed;
// path points are 0–100 percentages of the garden dimensions.
const DEMO_GARDEN = {
  gardenName: 'Rosewood Allotment',
  gardenLengthM: 8,
  gardenWidthM: 6,
  beds: [
    { id: 'bed-veg', name: 'Veg Patch', x: 0.6, y: 0.6, lengthM: 3.2, widthM: 1.6, rotation: 0, notes: 'Main vegetable bed — rotate brassicas yearly.', tasks: [{ id: 't1', text: 'Net the brassicas', done: false }, { id: 't2', text: 'Sow successional lettuce', done: true }] },
    { id: 'bed-herb', name: 'Herbs & Flowers', x: 4.4, y: 0.6, lengthM: 2.8, widthM: 1.6, rotation: 0, notes: 'Pollinator-friendly border.', tasks: [] },
  ],
  objects: [
    { id: 'obj-tree', typeId: 'apple-tree', x: 4.6, y: 2.6, lengthM: 3.3, widthM: 3.3, rotation: 0, label: 'Bramley' },
    { id: 'obj-shed', typeId: 'shed', x: 0.6, y: 2.6, lengthM: 2.2, widthM: 1.4, rotation: 0, label: 'Tool shed' },
    { id: 'obj-pond', typeId: 'pond', x: 0.6, y: 4.3, lengthM: 1.8, widthM: 1.2, rotation: 0, label: '' },
    { id: 'obj-compost', typeId: 'compost', x: 3.0, y: 2.7, lengthM: 0.9, widthM: 0.9, rotation: 0, label: '' },
    { id: 'obj-bench', typeId: 'bench', x: 3.1, y: 5.0, lengthM: 1.4, widthM: 0.5, rotation: 0, label: '' },
  ],
  plantings: [
    { id: 'p-01', plantId: 'tomato', x: 1.5, y: 1.0 },
    { id: 'p-02', plantId: 'lettuce', x: 2.2, y: 1.0 },
    { id: 'p-03', plantId: 'beans', x: 2.9, y: 1.0 },
    { id: 'p-04', plantId: 'courgette', x: 3.5, y: 1.0 },
    { id: 'p-05', plantId: 'carrot', x: 1.5, y: 1.7 },
    { id: 'p-06', plantId: 'beetroot', x: 2.2, y: 1.7 },
    { id: 'p-07', plantId: 'kale', x: 2.9, y: 1.7 },
    { id: 'p-08', plantId: 'pea', x: 3.5, y: 1.7 },
    { id: 'p-09', plantId: 'basil', x: 4.9, y: 1.0 },
    { id: 'p-10', plantId: 'thyme', x: 5.6, y: 1.0 },
    { id: 'p-11', plantId: 'lavender', x: 6.3, y: 1.0 },
    { id: 'p-12', plantId: 'chives', x: 6.9, y: 1.0 },
    { id: 'p-13', plantId: 'rosemary', x: 4.9, y: 1.7 },
    { id: 'p-14', plantId: 'marigold', x: 5.6, y: 1.7 },
    { id: 'p-15', plantId: 'nasturtium', x: 6.3, y: 1.7 },
    { id: 'p-16', plantId: 'cosmos', x: 6.9, y: 1.7 },
    { id: 'p-17', plantId: 'rhubarb', x: 2.4, y: 4.7 },
    { id: 'p-18', plantId: 'strawberry', x: 3.4, y: 4.9 },
    { id: 'p-19', plantId: 'sunflower', x: 3.8, y: 3.0 },
    { id: 'p-20', plantId: 'raspberry', x: 7.4, y: 3.3 },
  ],
  paths: [
    { id: 'path-main', style: 'gravel', widthM: 0.6, points: [{ x: 4, y: 60 }, { x: 24, y: 56 }, { x: 44, y: 62 }, { x: 64, y: 58 }, { x: 84, y: 64 }, { x: 97, y: 60 }] },
    { id: 'path-step', style: 'stepping', widthM: 0.5, points: [{ x: 46, y: 38 }, { x: 44, y: 55 }, { x: 47, y: 72 }, { x: 45, y: 90 }] },
  ],
  shopping: {},
};

test('capture populated garden', async ({ page }, testInfo) => {
  const tag = testInfo.project.name;

  // Seed the worked-example garden before the app boots so load() reads it.
  await page.addInitScript((stateJson) => {
    localStorage.setItem('garden-planner:v4', stateJson);
  }, JSON.stringify(DEMO_GARDEN));

  await page.goto('/');
  await page.waitForSelector('#gp-canvas');
  await settleStartupToast(page);
  await page.waitForTimeout(300);

  // 09 – design canvas with beds, plants, objects and paths placed
  await page.screenshot({ path: `tmp-shots/${tag}-09-garden-populated.png`, fullPage: true });

  // 10 – bed detail (in-bed planting layout). Select the bed by its top-left
  // corner — kept clear of plantings — then open its detail view.
  try {
    await page.click('[data-action="drag-start"][data-type="bed"][data-id="bed-veg"]', { position: { x: 6, y: 6 } });
    await page.click('[data-action="open-bed-detail"][data-id="bed-veg"]');
    await page.waitForSelector('#gp-detail-canvas');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `tmp-shots/${tag}-10-bed-detail.png`, fullPage: true });
    await page.click('[data-action="close-bed-detail"]');
    await page.waitForSelector('#gp-canvas');
  } catch (err) {
    testInfo.annotations.push({ type: 'warning', description: `bed-detail capture skipped: ${err}` });
  }

  // 11 – shopping list generated from the planted beds
  await page.click('[data-action="set-view"][data-view="shopping"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tmp-shots/${tag}-11-shopping-populated.png`, fullPage: true });

  // 12 – print layout of the populated design (chrome hidden by CSS)
  await page.click('[data-action="set-view"][data-view="design"]');
  await page.waitForSelector('#gp-canvas');
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `tmp-shots/${tag}-12-print-populated.png`, fullPage: true });
  await page.emulateMedia({ media: 'screen' });
});
