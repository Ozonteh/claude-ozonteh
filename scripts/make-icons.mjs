#!/usr/bin/env node
// Generează favicon.ico, apple-touch-icon și iconițele PWA din public/favicon.svg.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const pub = new URL('../public/', import.meta.url);
const svg = await readFile(new URL('favicon.svg', pub));
const png = (size, pad = 0) =>
  sharp(svg, { density: 512 })
    .resize(size - pad * 2, size - pad * 2)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#121314' })
    .png({ compressionLevel: 9 })
    .toBuffer();

await writeFile(new URL('apple-touch-icon.png', pub), await png(180, 14));
await writeFile(new URL('icon-192.png', pub), await png(192));
await writeFile(new URL('icon-512.png', pub), await png(512));
await writeFile(new URL('icon-maskable-512.png', pub), await png(512, 64));

// ICO cu un singur PNG 32×32 încorporat (format acceptat de toate browserele moderne).
const p32 = await png(32);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt8(0, 8);
header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(p32.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(new URL('favicon.ico', pub), Buffer.concat([header, p32]));
console.log('Iconițe generate în public/');
