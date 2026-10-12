// Articolele de blog: listare pe limbă, URL-uri, perechea RO ↔ RU (hreflang), timp de citire.
import { getCollection, type CollectionEntry } from 'astro:content';
import { route, type Lang } from '../i18n/routes';

export type Post = CollectionEntry<'blog'>;

export const postSlug = (p: Post) => p.id.split('/').slice(1).join('/');
export const postLang = (p: Post) => p.id.split('/')[0] as Lang;
export const postPath = (p: Post) => `${route('blog', postLang(p))}${postSlug(p)}/`;

export async function postsFor(lang: Lang) {
  const all = await getCollection('blog', (p) => p.id.startsWith(`${lang}/`));
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title));
}

/** URL-urile articolului în ambele limbi (pentru hreflang și comutatorul de limbă). */
export async function postAlternates(p: Post) {
  const all = await getCollection('blog', (x) => x.data.translation === p.data.translation);
  return Object.fromEntries(all.map((x) => [postLang(x), postPath(x)])) as Partial<Record<Lang, string>>;
}

export const readingMinutes = (body = '') => Math.max(1, Math.round((body.match(/\S+/g)?.length ?? 0) / 200));

export const formatDate = (d: Date, lang: Lang) =>
  new Intl.DateTimeFormat(lang === 'ro' ? 'ro-RO' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
