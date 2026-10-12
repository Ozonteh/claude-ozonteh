import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/bull/**/*.{webp,png,jpg}', { eager: true });

/** Returnează metadatele imaginii din src/assets/bull/<path> (eroare la build dacă lipsește). */
export function asset(path: string): ImageMetadata {
  const m = files[`/src/assets/bull/${path}`];
  if (!m) throw new Error(`Imagine lipsă în src/assets/bull/: ${path}`);
  return m.default;
}
