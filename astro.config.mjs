// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { sitemapAlternates } from './src/i18n/sitemap.ts';

// Domeniul final se setează din variabila de mediu PUBLIC_SITE_URL (vezi README).
const SITE = process.env.PUBLIC_SITE_URL || 'https://bull.ozonteh.md';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  compressHTML: true,
  build: { format: 'directory', inlineStylesheets: 'always' },
  i18n: {
    defaultLocale: 'ro',
    locales: ['ro', 'ru'],
    routing: { prefixDefaultLocale: false },
  },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(design-system|404)\/?$/.test(page),
      serialize: sitemapAlternates,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Big Shoulders Display',
      cssVariable: '--ff-display',
      // O singură greutate pentru toate titlurile → mai puține fișiere la încărcare (LCP pe mobil).
      weights: [800],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Impact', 'Arial Narrow', 'sans-serif'],
    },
    {
      // Titluri pe paginile RU (Big Shoulders Display nu are chirilică).
      provider: fontProviders.fontsource(),
      name: 'Oswald',
      cssVariable: '--ff-display-cyr',
      weights: [600],
      styles: ['normal'],
      subsets: ['latin', 'cyrillic'],
      fallbacks: ['Arial Narrow', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Sans',
      cssVariable: '--ff-sans',
      weights: [400, 600],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext', 'cyrillic'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Mono',
      cssVariable: '--ff-mono',
      weights: [500],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext', 'cyrillic'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
});
