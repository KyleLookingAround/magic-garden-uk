import { test } from '@playwright/test';

// Captures reference screenshots into tmp-shots/ for CI to upload as artifacts,
// so the UI can be eyeballed from a run without anyone running a browser locally.
test('capture key screens', async ({ page }, testInfo) => {
  const tag = testInfo.project.name;
  await page.goto('/');
  await page.waitForSelector('#root .gp-wrap');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `tmp-shots/${tag}-01-home.png`, fullPage: true });

  await page.click('[data-action="toggle-tools"]');
  await page.waitForTimeout(250);
  await page.screenshot({ path: `tmp-shots/${tag}-02-tools-open.png`, fullPage: true });

  await page.click('[data-action="set-view"][data-view="shopping"]');
  await page.waitForTimeout(250);
  await page.screenshot({ path: `tmp-shots/${tag}-03-shopping.png`, fullPage: true });

  // Back to the Design view, then show how it prints (chrome hidden by CSS).
  await page.click('[data-action="set-view"][data-view="design"]');
  await page.waitForSelector('#gp-canvas');
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `tmp-shots/${tag}-04-print-design.png`, fullPage: true });
  await page.emulateMedia({ media: 'screen' });
});
