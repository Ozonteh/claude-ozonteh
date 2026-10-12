// Utilitare pentru paginile din meniu: textele din src/content/pagini, breadcrumbs, URL-uri absolute.
import { getEntry } from 'astro:content';
import { route, type Lang, type RouteKey } from '../i18n/routes';
import { t } from '../i18n/ui';

export type PageKey =
  | 'catalog'
  | 'buldoexcavatoare'
  | 'incarcatoare-frontale'
  | 'miniincarcatoare-skid-steer'
  | 'compara'
  | 'cupe-si-atasamente'
  | 'service-si-piese'
  | 'despre-noi'
  | 'contacte'
  | 'blog';

export async function getPage(key: PageKey, lang: Lang) {
  const entry = await getEntry('pagini', `${lang}/${key}`);
  if (!entry) throw new Error(`Lipsește textul paginii: src/content/pagini/${lang}/${key}.yaml`);
  return entry.data;
}

/** Breadcrumbs „Acasă / … / pagina curentă", cu URL-uri absolute (pentru schema BreadcrumbList). */
export function crumbs(site: URL, lang: Lang, items: { name: string; path: string }[]) {
  return [{ name: t(lang).product.home, path: route('home', lang) }, ...items].map((c) => ({ name: c.name, url: new URL(c.path, site).href }));
}

export const routeAlternates = (key: RouteKey) => ({ ro: route(key, 'ro'), ru: route(key, 'ru') });
