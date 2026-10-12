// Conținutul editorial al site-ului, în RO și RU (traducere manuală).
// Fiecare colecție are câte un folder pe limbă: <colecție>/ro/… și <colecție>/ru/…; id-ul intrării e „ro/<slug>".
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faq = z.array(z.object({ q: z.string(), a: z.string() }));

/** Textele lungi ale paginilor de produs (≥ 400 de cuvinte în RO). Fișier: produse/<lang>/<id>.md */
const produse = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/produse' }),
  schema: z.object({
    title: z.string().max(90),
    description: z.string().min(110).max(180),
    faq: faq.min(3),
  }),
});

/** Articolele de blog. `translation` leagă articolul RO de traducerea lui RU (hreflang). */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().max(80),
    description: z.string().min(100).max(180),
    date: z.coerce.date(),
    cover: z.string(),
    coverAlt: z.string(),
    translation: z.string(),
    models: z.array(z.string()).default([]),
  }),
});

/** Politica de confidențialitate și politica cookies. Fișier: legal/<lang>/{confidentialitate,cookies}.md */
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().max(80),
    description: z.string().min(80).max(180),
    updated: z.coerce.date(),
  }),
});

/** Textele paginilor din meniu (catalog, categorii, service, despre noi, contacte…). Fișier: pagini/<lang>/<cheie>.yaml */
const pagini = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/pagini' }),
  schema: z.object({
    seoTitle: z.string().max(80),
    seoDescription: z.string().min(100).max(180),
    h1: z.string(),
    lead: z.string(),
    blocks: z
      .record(
        z.string(),
        z.object({
          title: z.string().optional(),
          text: z.string().optional(),
          items: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
        })
      )
      .default({}),
    faq: faq.optional(),
  }),
});

export const collections = { produse, blog, legal, pagini };
