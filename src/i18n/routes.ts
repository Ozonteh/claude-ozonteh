// Harta URL-urilor RO ↔ RU. Slug-urile ruse sunt transliterate pentru SEO în rusă.
export const LOCALES = ['ro', 'ru'] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = 'ro';
export const HREFLANG: Record<Lang, string> = { ro: 'ro-MD', ru: 'ru-MD' };
export const OG_LOCALE: Record<Lang, string> = { ro: 'ro_MD', ru: 'ru_MD' };

export const ROUTES = {
  home: { ro: '/', ru: '/ru/' },
  catalog: { ro: '/utilaje/', ru: '/ru/tehnika/' },
  compare: { ro: '/compara/', ru: '/ru/sravnenie/' },
  attachments: { ro: '/cupe-si-atasamente/', ru: '/ru/kovshi-i-navesnoe-oborudovanie/' },
  service: { ro: '/service-si-piese/', ru: '/ru/servis-i-zapchasti/' },
  about: { ro: '/despre-noi/', ru: '/ru/o-nas/' },
  contact: { ro: '/contacte/', ru: '/ru/kontakty/' },
  blog: { ro: '/blog/', ru: '/ru/blog/' },
  privacy: { ro: '/politica-de-confidentialitate/', ru: '/ru/politika-konfidencialnosti/' },
  cookies: { ro: '/politica-cookies/', ru: '/ru/politika-cookies/' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof ROUTES;

export const CATEGORY_SLUGS = {
  buldoexcavatoare: { ro: 'buldoexcavatoare', ru: 'ekskavatory-pogruzchiki' },
  'incarcatoare-frontale': { ro: 'incarcatoare-frontale', ru: 'frontalnye-pogruzchiki' },
  'miniincarcatoare-skid-steer': { ro: 'miniincarcatoare-skid-steer', ru: 'mini-pogruzchiki' },
} as const satisfies Record<string, Record<Lang, string>>;

export type CategoryId = keyof typeof CATEGORY_SLUGS;

export const route = (key: RouteKey, lang: Lang) => ROUTES[key][lang];

export const categoryPath = (cat: CategoryId, lang: Lang) =>
  lang === 'ro' ? `/${CATEGORY_SLUGS[cat].ro}/` : `/ru/${CATEGORY_SLUGS[cat].ru}/`;

export const productPath = (p: { id: string; category: CategoryId }, lang: Lang) =>
  `${categoryPath(p.category, lang)}${p.id}/`;

/** Toate perechile de URL-uri echivalente (pentru hreflang și sitemap). */
export function alternatePairs(productList: { id: string; category: CategoryId }[]) {
  const pairs: Record<Lang, string>[] = Object.values(ROUTES).map((r) => ({ ...r }));
  for (const cat of Object.keys(CATEGORY_SLUGS) as CategoryId[]) {
    pairs.push({ ro: categoryPath(cat, 'ro'), ru: categoryPath(cat, 'ru') });
  }
  for (const p of productList) pairs.push({ ro: productPath(p, 'ro'), ru: productPath(p, 'ru') });
  return pairs;
}

export const langFromPath = (pathname: string): Lang => (pathname === '/ru' || pathname.startsWith('/ru/') ? 'ru' : 'ro');
