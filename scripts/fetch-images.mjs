#!/usr/bin/env node
// Descarcă imaginile din Anexa C (bullindia.com) și logo-urile, le optimizează și le salvează
// cu nume SEO în src/assets/bull/. Rulare: `npm run images` (adaugă --force pentru re-descărcare).
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { manifest, logos } from './image-manifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/assets/bull');
const force = process.argv.includes('--force');

const exists = (p) => access(p).then(() => true, () => false);

async function download(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (BULL Moldova asset sync)' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (attempt === 4) throw new Error(`${url}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
    }
  }
}

/**
 * Elimină fundalul alb al pozelor de produs.
 * 1. Flood fill de la margini prin pixelii aproape albi/gri deschis, nesaturați (fundal + umbra de sub utilaj).
 * 2. Fundalul devine negru cu alfa = întunecimea pixelului → umbra se păstrează natural pe orice fundal.
 * 3. Banda de 1 px de la marginea utilajului primește „color-to-alpha" față de alb (fără contur alb pe fundal închis).
 */
async function cutout(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]];

  // Dacă imaginea are deja transparență, o păstrăm.
  let transparent = 0;
  for (let i = 0; i < w * h; i++) if (data[i * 4 + 3] < 250) transparent++;
  if (transparent > w * h * 0.05) return sharp(data, { raw: info });

  const SHADOW = 90; // cât de „gri" poate fi umbra (255 - luminanță)
  const isBg = (i) => {
    const [r, g, b] = px(i);
    const dark = 255 - (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    return dark <= SHADOW && sat <= 22;
  };

  const bg = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const i = stack.pop();
    if (bg[i] || !isBg(i)) continue;
    bg[i] = 1;
    const x = i % w, y = (i / w) | 0;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - w);
    if (y < h - 1) stack.push(i + w);
  }

  const out = Buffer.from(data);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    if (bg[i]) {
      const [r, g, b] = px(i);
      const dark = 255 - (r + g + b) / 3;
      out[o] = out[o + 1] = out[o + 2] = 0;
      out[o + 3] = dark < 8 ? 0 : Math.min(255, Math.round(dark * 1.1));
      continue;
    }
    const x = i % w, y = (i / w) | 0;
    const edge = (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (y > 0 && bg[i - w]) || (y < h - 1 && bg[i + w]);
    if (!edge) continue;
    const [r, g, b] = px(i);
    const a = Math.max(255 - r, 255 - g, 255 - b) / 255;
    if (a <= 0.02) { out[o + 3] = 0; continue; }
    out[o] = Math.round(255 - (255 - r) / a);
    out[o + 1] = Math.round(255 - (255 - g) / a);
    out[o + 2] = Math.round(255 - (255 - b) / a);
    out[o + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: info });
}

async function processEntry(entry) {
  const target = join(OUT, entry.out);
  if (!force && (await exists(target))) return 'skip';
  const buf = await download(entry.url);
  let img = sharp(buf);
  if (entry.extract) img = img.extract(entry.extract);
  if (entry.cutout) img = await cutout(await img.png().toBuffer());
  if (entry.maxWidth) img = img.resize({ width: entry.maxWidth, withoutEnlargement: true });
  await mkdir(dirname(target), { recursive: true });
  const opts = entry.lossless ? { nearLossless: true, quality: 90 } : { quality: 88, alphaQuality: 95, effort: 6 };
  await writeFile(target, await img.webp(opts).toBuffer());
  return 'ok';
}

async function processLogo(logo) {
  const target = join(OUT, logo.out);
  if (!force && (await exists(target))) return 'skip';
  const buf = await download(logo.url);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, await sharp(buf).png({ compressionLevel: 9 }).toBuffer());
  if (logo.variants?.includes('white')) {
    // Variantă monocromă albă (păstrează canalul alfa) pentru header/footer pe fundal întunecat.
    const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) data[i] = data[i + 1] = data[i + 2] = 255;
    await writeFile(target.replace(/\.png$/, '-alb.png'), await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toBuffer());
  }
  return 'ok';
}

const queue = [...manifest.map((e) => () => processEntry(e).then((s) => [s, e.out])), ...logos.map((l) => () => processLogo(l).then((s) => [s, l.out]))];
const results = { ok: 0, skip: 0, fail: 0 };
async function worker() {
  while (queue.length) {
    const job = queue.shift();
    try {
      const [status, name] = await job();
      results[status]++;
      if (status === 'ok') console.log('✓', name);
    } catch (err) {
      results.fail++;
      console.error('✗', err.message);
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`\nGata: ${results.ok} noi, ${results.skip} existente, ${results.fail} erori.`);
if (results.fail) process.exit(1);
