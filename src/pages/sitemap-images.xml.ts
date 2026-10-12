// Sitemap pentru imagini (Google Images): Acasă și paginile de produs, cu imaginile lor.
import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import { products } from '../lib/products';
import { asset } from '../lib/images';
import { ROUTES, LOCALES, productPath } from '../i18n/routes';
import { t } from '../i18n/ui';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://bull.ozonteh.md');
  const abs = async (path: string) => new URL((await getImage({ src: asset(path), width: 1200, format: 'webp' })).src, base).href;
  const urls: string[] = [];
  for (const lang of LOCALES) {
    const ui = t(lang);
    const imgs = [
      { loc: await abs('santier/buldoexcavator-bull-ch76-santier-moldova.webp'), title: ui.home.hero.imageAlt },
      { loc: await abs('santier/buldoexcavator-bull-ch76-santier-moldova-mobil.webp'), title: ui.home.hero.imageAlt },
      ...(await Promise.all(products.map(async (p) => ({ loc: await abs(p.image), title: p.alt[lang] })))),
    ];
    urls.push(
      `<url><loc>${new URL(ROUTES.home[lang], base).href}</loc>${imgs
        .map((i) => `<image:image><image:loc>${esc(i.loc)}</image:loc><image:title>${esc(i.title)}</image:title></image:image>`)
        .join('')}</url>`
    );
  }
  // Paginile de produs: imaginea decupată, scenele de șantier și galeria (aceleași fișiere în RO și RU).
  for (const lang of LOCALES) {
    for (const p of products) {
      const files = [p.image, ...p.scenes, ...p.gallery];
      const locs = await Promise.all(files.map(abs));
      urls.push(
        `<url><loc>${new URL(productPath(p, lang), base).href}</loc>${locs
          .map((loc) => `<image:image><image:loc>${esc(loc)}</image:loc><image:title>${esc(p.alt[lang])}</image:title></image:image>`)
          .join('')}</url>`
      );
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls.join('')}</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};
