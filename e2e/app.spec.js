import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  // Stub the clipboard write so the share test is robust in headless Chromium.
  // Also neutralise the Web Share API so we deterministically exercise the
  // clipboard fallback (navigator.share is platform-dependent in headless mode).
  await page.addInitScript(() => {
    window.__copied = null;
    navigator.clipboard.writeText = async (t) => { window.__copied = t; };
    try { Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); } catch {}
  });
  await page.goto('/');
  await expect(page.locator('#root .gp-wrap')).toBeVisible();
});

test('renders the header and primary tabs', async ({ page }) => {
  await expect(page.locator('.gp-display').first()).toContainText('Our Garden');
  for (const v of ['design', 'library', 'pollinators', 'shopping', 'notes']) {
    await expect(page.locator(`[data-action="set-view"][data-view="${v}"]`)).toBeVisible();
  }
});

test('Backup & share panel reveals all five tools', async ({ page }) => {
  await page.click('[data-action="toggle-tools"]');
  for (const a of ['share-plan', 'export-plan', 'import-plan', 'export-calendar', 'print-plan']) {
    await expect(page.locator(`[data-action="${a}"]`)).toBeVisible();
  }
});

test('Export backup downloads a valid plan file', async ({ page }) => {
  await page.click('[data-action="toggle-tools"]');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('[data-action="export-plan"]'),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.garden\.json$/);
  const doc = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(doc.app).toBe('magic-garden');
  expect(doc.version).toBe(4);
  expect(doc.state.gardenName).toBe('Our Garden');
  await expect(page.locator('.gp-toast')).toContainText('Backup downloaded');
});

test('Share copies a self-contained link that round-trips', async ({ page }) => {
  await page.click('[data-action="toggle-tools"]');
  await page.click('[data-action="share-plan"]');
  const url = await page.evaluate(() => window.__copied);
  expect(url).toContain('#plan=');

  // Opening the link offers to load it; accept and confirm the plan loads.
  page.on('dialog', (d) => d.accept());
  await page.goto(url);
  await expect(page.locator('.gp-display').first()).toContainText('Our Garden');
});

test('Calendar export with nothing planted shows guidance', async ({ page }) => {
  await page.click('[data-action="toggle-tools"]');
  await page.click('[data-action="export-calendar"]');
  await expect(page.locator('.gp-toast')).toContainText('plant something first');
});

test('Print layout hides interactive chrome but keeps the garden map', async ({ page }) => {
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-action="set-view"][data-view="design"]')).toBeHidden();
  await expect(page.locator('[data-action="toggle-tools"]')).toBeHidden();
  await expect(page.locator('#gp-canvas')).toBeVisible();
  await page.emulateMedia({ media: 'screen' });
});

test('navigates to the shopping list', async ({ page }) => {
  await page.click('[data-action="set-view"][data-view="shopping"]');
  await expect(page.getByRole('heading', { name: 'Shopping List' })).toBeVisible();
});

test('works offline after the service worker installs', async ({ page, context }) => {
  // Wait for the worker to activate and precache the app.
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#root .gp-wrap')).toBeVisible();
  await expect(page.locator('.gp-display').first()).toContainText('Our Garden');
  await context.setOffline(false);
});
