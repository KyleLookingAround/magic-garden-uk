import { test } from '@playwright/test';

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
