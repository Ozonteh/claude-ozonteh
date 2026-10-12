// Textele lungi ale paginilor de produs (≥ 400 de cuvinte în RO, traducere manuală în RU).
// Fișier: src/content/produse/<lang>/<id>.md → id-ul intrării „ro/bull-hd-100".
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const produse = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/produse' }),
  schema: z.object({
    title: z.string().max(90),
    description: z.string().min(110).max(180),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3),
  }),
});

export const collections = { produse };
