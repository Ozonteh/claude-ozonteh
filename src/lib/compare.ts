// Rândurile comparatorului: aceleași câmpuri pentru toate modelele, din products.json (fără valori estimate).
import { fmt, val, type Product } from './products';
import type { Lang } from '../i18n/routes';
import { t } from '../i18n/ui';

export type CompareRow = { key: string; label: string; values: Record<string, string> };

const specRow = (p: Product, group: string, test: (k: string) => boolean, lang: Lang) => {
  const g = p.specs.find((x) => x.group === group);
  const r = g?.rows.find((x) => test(val(x.k, 'ro')));
  return r ? val(r.v, lang) : null;
};

export function compareRows(list: Product[], lang: Lang): CompareRow[] {
  const ui = t(lang);
  const u = ui.units;
  const L = ui.pages.compare.rows;
  const dash = '—';
  const num = (n: number | null | undefined, unit: string, digits?: number) => (n ? `${fmt(n, lang, digits)} ${unit}` : dash);
  const cell: Record<string, (p: Product) => string> = {
    type: (p) => p.type[lang],
    power: (p) => `${fmt(p.key.powerHp, lang)} ${u.hp}${p.key.powerKw ? ` (${fmt(p.key.powerKw, lang)} ${u.kw})` : ''}`,
    engine: (p) => specRow(p, 'engine', (k) => k.startsWith('Motor'), lang) ?? dash,
    torque: (p) => specRow(p, 'engine', (k) => k.startsWith('Cuplu'), lang) ?? dash,
    transmission: (p) => specRow(p, 'transmission', (k) => k.startsWith('Transmisie'), lang) ?? dash,
    drive: (p) => p.key.drive.join(' / '),
    weight: (p) => num(p.key.weightKg, u.kg),
    dig: (p) =>
      p.key.digDepthM
        ? `${fmt(p.key.digDepthM, lang, 2)} ${u.m}${p.key.digDepthExtM ? ` (${fmt(p.key.digDepthExtM, lang, 2)} ${u.m})` : ''}`
        : dash,
    speed: (p) => num(p.key.speedKmh, u.kmh),
    flow: (p) => (p.key.flowLpm ? `${fmt(p.key.flowLpm, lang)} ${u.lpm}${p.key.flowHighLpm ? ` / ${fmt(p.key.flowHighLpm, lang)} ${u.lpm} high flow` : ''}` : dash),
    pressure: (p) => num(p.key.pressureBar, u.bar),
    load: (p) => num(p.key.payloadKg ?? p.key.ratedLoadKg, u.kg),
    warranty: () => `${ui.badges.warranty} · ${ui.badges.warrantyEngine}`,
    price: () => ui.specs.onRequest,
  };
  return Object.entries(cell).map(([key, f]) => ({
    key,
    label: (L as Record<string, string>)[key],
    values: Object.fromEntries(list.map((p) => [p.id, f(p)])),
  }));
}
