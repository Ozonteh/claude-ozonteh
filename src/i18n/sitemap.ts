// Adaugă legături hreflang (ro-MD, ru-MD, x-default) în sitemap.xml pentru fiecare pagină cu pereche.
import products from '../data/products.json';
import { alternatePairs, HREFLANG, type CategoryId } from './routes';

const pairs = alternatePairs(products as { id: string; category: CategoryId }[]);
const byPath = new Map<string, (typeof pairs)[number]>();
for (const p of pairs) {
  byPath.set(p.ro, p);
  byPath.set(p.ru, p);
}

type SitemapItem = { url: string; links?: { lang: string; url: string }[]; [k: string]: unknown };

export function sitemapAlternates(item: SitemapItem) {
  const url = new URL(item.url);
  const pair = byPath.get(url.pathname);
  if (!pair) return item;
  const abs = (p: string) => new URL(p, url.origin).href;
  item.links = [
    { lang: HREFLANG.ro, url: abs(pair.ro) },
    { lang: HREFLANG.ru, url: abs(pair.ru) },
    { lang: 'x-default', url: abs(pair.ro) },
  ];
  return item;
}
