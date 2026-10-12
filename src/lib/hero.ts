// Surse responsive pentru imaginea hero (art direction: decupaj mobil + cadru lat desktop).
// Folosite de componenta Hero și de <link rel="preload"> din <head> (descoperire timpurie → LCP mai mic).
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { asset } from './images';

export const HERO_MOBILE_MAX = '(max-width: 47.99rem)';
export const HERO_DESKTOP_MIN = '(min-width: 48rem)';

async function srcset(src: ImageMetadata, widths: number[], format: 'avif' | 'webp') {
  const imgs = await Promise.all(widths.map((w) => getImage({ src, width: w, format, quality: format === 'avif' ? 55 : 72 })));
  return imgs.map((i, k) => `${i.src} ${widths[k]}w`).join(', ');
}

export async function heroSources() {
  const desk = asset('santier/buldoexcavator-bull-ch76-santier-moldova.webp');
  const mob = asset('santier/buldoexcavator-bull-ch76-santier-moldova-mobil.webp');
  const [mobAvif, mobWebp, deskAvif, deskWebp, fallback] = await Promise.all([
    srcset(mob, [480, 640, 800, 1000, 1240], 'avif'),
    srcset(mob, [480, 640, 800, 1000, 1240], 'webp'),
    srcset(desk, [1024, 1440, 1920, 2000], 'avif'),
    srcset(desk, [1024, 1440, 1920, 2000], 'webp'),
    getImage({ src: mob, width: 800, format: 'webp', quality: 72 }),
  ]);
  return { mob, desk, mobAvif, mobWebp, deskAvif, deskWebp, fallback };
}
