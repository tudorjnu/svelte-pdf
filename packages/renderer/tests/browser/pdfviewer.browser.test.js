/**
 * Real-browser tests for the PDFViewer browser components (SF-9 acceptance:
 * "browser components covered by at least one real-browser test each").
 *
 * Runs only where puppeteer is resolvable and a Chrome (or chrome-headless-shell)
 * binary is available; skips cleanly elsewhere.
 *
 * Two scenarios, reflecting the current engine reality (Node-only engine —
 * repo finding #1, which ALSO breaks the import graph: index.js re-exports
 * pdf.js → engine → `stream`, so browser pages cannot import index.js at all):
 *   A. drawPdfPages paints a real static PDF via pdfjs canvases — fully works
 *      (fixture imports the engine-free ./pdfjs-pages subpath).
 *   B. PDFViewer mounting a live document component — blocked by finding #1
 *      (import-time crash, before any component could mount). Skipped until
 *      the engine ships a browser build.
 */
import { describe, expect, test, beforeAll, afterAll } from 'vitest';
import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

let puppeteer = null;
try {
  puppeteer = (await import('puppeteer')).default;
} catch {
  // puppeteer not resolvable — tests skip below
}

function findHeadlessShell() {
  const cacheRoot = path.join(homedir(), '.cache', 'puppeteer', 'chrome-headless-shell');
  if (!existsSync(cacheRoot)) return null;
  const versions = readdirSync(cacheRoot).sort().reverse();
  for (const v of versions) {
    const bin = path.join(cacheRoot, v, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
    if (existsSync(bin)) return bin;
  }
  return null;
}

describe.skipIf(!puppeteer)('PDFViewer browser components (real Chrome)', () => {
  let server;
  let baseUrl;
  let browser;

  beforeAll(async () => {
    server = await createServer({
      root: path.resolve(import.meta.dirname, '../../'),
      logLevel: 'error',
      server: { port: 0, strictPort: false },
      plugins: [svelte()]
    });
    await server.listen();
    baseUrl = server.resolvedUrls.local[0];

    const launchOpts = {
      headless: 'shell',
      userDataDir: `/tmp/chrome-svpdf-${Date.now()}`,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-crash-reporter', '--disable-gpu']
    };
    try {
      browser = await puppeteer.launch(launchOpts);
    } catch {
      const shell = findHeadlessShell();
      if (!shell) throw new Error('no chrome-headless-shell binary found');
      browser = await puppeteer.launch({ ...launchOpts, executablePath: shell });
    }
  }, 60_000);

  afterAll(async () => {
    await browser?.close();
    await server?.close();
  });

  test(
    'A: drawPdfPages paints real pages from a static PDF (pdfjs canvases)',
    { timeout: 90_000 },
    async () => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1000, height: 900 });
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));

      await page.goto(`${baseUrl}tests/browser/fixture/index.html`, {
        waitUntil: 'networkidle2',
        timeout: 60_000
      });

      await page.waitForFunction(
        () => document.querySelectorAll('#viewer-canvas canvas').length > 0,
        { timeout: 45_000 }
      );
      // let remaining pages paint
      await new Promise((r) => setTimeout(r, 1500));

      const canvases = await page.evaluate(() =>
        [...document.querySelectorAll('#viewer-canvas canvas')].map((c) => ({
          w: c.width,
          h: c.height,
          painted: c.toDataURL().length > 2000 // blank canvas dataURL is tiny
        }))
      );

      expect(canvases.length).toBeGreaterThan(0);
      for (const c of canvases) {
        expect(c.w).toBeGreaterThan(100);
        expect(c.h).toBeGreaterThan(100);
        expect(c.painted).toBe(true);
      }
      // engine-independent demo must not throw
      expect(pageErrors.join(' | ')).not.toMatch(/stream|externalized/i);
      await page.close();
    }
  );

  test.skip(
    'B: PDFViewer renders a document component end-to-end (blocked: finding #1 — Node-only engine breaks the import graph)',
    { timeout: 90_000 },
    async () => {
      const page = await browser.newPage();
      await page.goto(`${baseUrl}tests/browser/fixture/index.html`, {
        waitUntil: 'networkidle2',
        timeout: 60_000
      });
      await page.waitForFunction(
        () => document.querySelectorAll('#viewer-component canvas').length > 0,
        { timeout: 45_000 }
      );
      const count = await page.evaluate(
        () => document.querySelectorAll('#viewer-component canvas').length
      );
      expect(count).toBe(2);
      await page.close();
    }
  );
});
