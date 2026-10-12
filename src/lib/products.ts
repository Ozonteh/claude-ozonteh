import data from '../data/products.json';
import type { Lang, CategoryId } from '../i18n/routes';

type L = Record<Lang, string>;
export type SpecRow = { k: L; v: string | L };
export type SpecGroupId = 'engine' | 'transmission' | 'hydraulics' | 'performance' | 'dimensions' | 'capacities';

export type Product = {
  id: string;
  order: number;
  category: CategoryId;
  name: string;
  model: string;
  series: string;
  isNew: boolean;
  type: L;
  tagline: L;
  summary: L;
  image: string;
  alt: L;
  scenes: string[];
  blueprint: string | null;
  gallery: string[];
  key: {
    powerHp: number;
    powerKw: number | null;
    weightKg: number | null;
    digDepthM?: number | null;
    digDepthExtM?: number | null;
    payloadKg?: number;
    bucketM3?: number;
    ratedLoadKg?: number;
    tippingLoadKg?: number;
    speedKmh: number | null;
    drive: string[];
    flowLpm: number | null;
    flowHighLpm?: number;
    pressureBar: number | null;
  };
  brands: string[];
  advantages: L[];
  specs: { group: SpecGroupId; rows: SpecRow[] }[];
  brochure: string;
  videos: { id: string; title: L; uploadDate: string | null }[];
  verify: string[];
};

export const products = (data as Product[]).slice().sort((a, b) => a.order - b.order);
export const getProduct = (id: string) => products.find((p) => p.id === id);
export const byCategory = (cat: CategoryId) => products.filter((p) => p.category === cat);
export const val = (v: string | L, lang: Lang) => (typeof v === 'string' ? v : v[lang]);

/** Formatare numerică locală: RO 8.010 / 4,6 · RU 8 010 / 4,6 */
export function fmt(n: number, lang: Lang, digits?: number) {
  const s = new Intl.NumberFormat(lang === 'ro' ? 'ro-RO' : 'ru-RU', {
    maximumFractionDigits: digits ?? (Number.isInteger(n) ? 0 : 1),
  }).format(n);
  return s.replace(/\u202f/g, '\u00a0');
}

type Stat = { k: string; v: string; u?: string };

/** 4 cifre cheie pentru carduri, alese după tipul utilajului (fără valori inventate). */
export function cardStats(p: Product, lang: Lang, ui: { specs: Record<string, any>; units: Record<string, string> }): Stat[] {
  const k = p.key;
  const s = ui.specs;
  const u = ui.units;
  const all: Record<string, Stat | null> = {
    power: { k: s.power, v: fmt(k.powerHp, lang), u: u.hp },
    weight: k.weightKg ? { k: s.weight, v: fmt(k.weightKg, lang), u: u.kg } : null,
    dig: k.digDepthM ? { k: s.digDepth, v: fmt(k.digDepthM, lang), u: u.m } : null,
    speed: k.speedKmh ? { k: s.speed, v: fmt(k.speedKmh, lang), u: u.kmh } : null,
    payload: k.payloadKg ? { k: s.payload, v: fmt(k.payloadKg, lang), u: u.kg } : null,
    rated: k.ratedLoadKg ? { k: s.ratedLoad, v: fmt(k.ratedLoadKg, lang), u: u.kg } : null,
    flow: k.flowLpm ? { k: s.flow, v: fmt(k.flowLpm, lang), u: u.lpm } : null,
    drive: { k: s.drive, v: k.drive.join('/') },
  };
  const order =
    p.category === 'buldoexcavatoare'
      ? ['power', 'weight', 'dig', 'speed', 'flow', 'drive']
      : p.category === 'incarcatoare-frontale'
        ? ['power', 'weight', 'payload', 'speed', 'flow', 'drive']
        : ['power', 'rated', 'weight', 'flow', 'speed', 'drive'];
  const out = order.map((x) => all[x]).filter((x): x is Stat => !!x).slice(0, 4);
  // Modele cu fișă incompletă (ex. Grandia DLX): completăm cu mărcile componentelor, nu cu cifre estimate.
  const extra = [
    { k: s.groups.engine, v: p.brands[0] },
    { k: s.groups.transmission, v: p.brands[1] },
  ].filter((x) => x.v);
  while (out.length < 4 && extra.length) out.push(extra.shift()!);
  return out;
}
