// Adaugă legături hreflang (ro-MD, ru-MD, x-default) în sitemap.xml pentru fiecare pagină cu pereche.
// Articolele de blog se împerechează după câmpul `translation` din frontmatter.
import { readdirSync, readFileSync } from 'node:fs';
import products from '../data/products.json';
import { alternatePairs, HREFLANG, ROUTES, type CategoryId, type Lang } from './routes';

const pairs = alternatePairs(products as { id: string; category: CategoryId }[]);

function blogPairs() {
  const byKey = new Map<string, Partial<Record<Lang, string>>>();
  for (const lang of ['ro', 'ru'] as const) {
    const dir = new URL(`../content/blog/${lang}/`, import.meta.url);
    let files: string[] = [];
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    for (const f of files) {
      const key = readFileSync(new URL(f, dir), 'utf8').match(/^translation:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1];
      if (!key) continue;
      byKey.set(key, { ...byKey.get(key), [lang]: `${ROUTES.blog[lang]}${f.replace(/\.md$/, '')}/` });
    }
  }
  return [...byKey.values()].filter((x): x is Record<Lang, string> => !!x.ro && !!x.ru);
}
pairs.push(...blogPairs());
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
