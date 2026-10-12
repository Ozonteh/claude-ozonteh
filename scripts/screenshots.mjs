#!/usr/bin/env node
// Capturi de ecran pentru review (mobil 390×844 @3x și desktop 1440×900), RO și RU.
// Rulare: npm run build && npm run screenshots  → fișierele ajung în reports/screenshots/
import { createServer } from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const PORT = 4329;
const BASE = `http://localhost:${PORT}`;
const OUT = new URL('../reports/screenshots/', import.meta.url).pathname;
const pages = (process.argv[2] ?? '/,/ru/').split(',');
const only = process.argv[3]; // „mobile" | „desktop"

// Server static minimal pentru dist/ (fără dependențe).
const DIST = new URL('../dist/', import.meta.url).pathname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, BASE).pathname);
  let file = join(DIST, p);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(await readFile(join(DIST, '404.html')).catch(() => 'Not found'));
  }
});
const wait = () => new Promise((r) => server.listen(PORT, r));

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = innerHeight * 0.6;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

try {
  await wait();
  await mkdir(OUT, { recursive: true });
  // CHROMIUM_PATH: binar Chromium existent (ex. /opt/pw-browsers/chromium) dacă versiunea Playwright nu are browserul descărcat.
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const variants = [
    { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  ].filter((v) => !only || v.name === only);
  for (const v of variants) {
    for (const reduced of [false, true]) {
      // Captura full-page la 1x: Chromium nu randează peste ~16.384 px dispozitiv.
      const ctx = await browser.newContext({ ...v, deviceScaleFactor: reduced ? 1 : v.deviceScaleFactor, reducedMotion: reduced ? 'reduce' : 'no-preference', locale: 'ro-MD' });
      await ctx.addInitScript(() => localStorage.setItem('bull-consent-v1', JSON.stringify({ analytics: false, marketing: false, ts: 1 })));
      const page = await ctx.newPage();
      for (const path of pages) {
        const slug = path === '/' ? 'ro' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
        await page.goto(BASE + path, { waitUntil: 'load' });
        await page.waitForTimeout(1600);
        if (!reduced) {
          await page.screenshot({ path: `${OUT}${slug}-${v.name}-fold.jpg`, type: 'jpeg', quality: 75 });
        } else {
          // content-visibility: auto nu se randează în captura full-page → forțăm randarea pentru review
          await page.addStyleTag({ content: '.cv-auto{content-visibility:visible!important}' });
          await scrollThrough(page);
          await page.screenshot({ path: `${OUT}${slug}-${v.name}-full.jpg`, type: 'jpeg', quality: 72, fullPage: true });
        }
      }
      await ctx.close();
    }
  }
  await browser.close();
  console.log('Capturi salvate în', OUT);
} finally {
  server.close();
}
