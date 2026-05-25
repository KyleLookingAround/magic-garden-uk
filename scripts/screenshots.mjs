// Dev-only visual smoke check: drive the built app in headless Chromium and
// capture screenshots of the new offline UI. Not part of the app or tests, and
// Playwright is intentionally NOT a project dependency (its browser download
// would break the dependency-free Netlify build). Run it ad hoc:
//
//   npm run build
//   npm run preview &                       # serves dist on :4173
//   npm i -D playwright && npx playwright install chromium
//   node scripts/screenshots.mjs            # PNGs land in tmp-shots/
//
// Then share the PNGs (or set URL=… for a different host).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.env.URL || 'http://localhost:4173/';
const OUT = 'tmp-shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 920 } });
page.on('download', (d) => d.cancel().catch(() => {})); // don't actually save backups

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('#root .gp-wrap');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/01-home.png`, fullPage: true });

// Open the Backup & share panel.
await page.click('[data-action="toggle-tools"]');
await page.waitForTimeout(250);
await page.screenshot({ path: `${OUT}/02-tools-open.png`, fullPage: true });

// Trigger a flash toast via Export backup.
await page.click('[data-action="export-plan"]');
await page.waitForTimeout(250);
await page.screenshot({ path: `${OUT}/03-flash-toast.png` });

// How the Design view looks when printed (chrome hidden by print CSS).
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(150);
await page.screenshot({ path: `${OUT}/04-print-design.png`, fullPage: true });
await page.emulateMedia({ media: 'screen' });

// Mobile width.
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/05-mobile.png`, fullPage: true });

await browser.close();
console.log('screenshots written to', OUT);
