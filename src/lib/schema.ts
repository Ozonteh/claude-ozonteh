// Generatoare JSON-LD (schema.org). NAP-ul vine exclusiv din src/data/site.ts.
import { company, manufacturer } from '../data/site';
import type { Lang } from '../i18n/routes';
import { ROUTES, productPath } from '../i18n/routes';
import type { Product } from './products';
import { t } from '../i18n/ui';

const DAY: Record<string, string> = {
  Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday',
};

export const orgId = (site: URL) => new URL('/#organization', site).href;
export const businessId = (site: URL) => new URL('/#localbusiness', site).href;

export function organizationGraph(site: URL, lang: Lang, logoUrl: string) {
  const sameAs = Object.values(company.social).filter(Boolean);
  const address = {
    '@type': 'PostalAddress',
    streetAddress: company.address.street,
    addressLocality: company.address.city,
    addressRegion: company.address.region,
    postalCode: company.address.postalCode,
    addressCountry: company.address.country,
  };
  return [
    {
      '@type': 'Organization',
      '@id': orgId(site),
      name: company.legalName,
      alternateName: [company.brandName, 'Ozonteh'],
      url: new URL(ROUTES.home[lang], site).href,
      logo: logoUrl,
      email: company.email,
      telephone: company.phone.intl,
      foundingDate: String(company.foundingYear),
      address,
      sameAs,
    },
    {
      '@type': ['LocalBusiness', 'AutomotiveBusiness'],
      '@id': businessId(site),
      name: `${company.brandName} | ${company.legalName}`,
      description: t(lang).meta.homeDescription,
      url: new URL(ROUTES.home[lang], site).href,
      image: logoUrl,
      logo: logoUrl,
      telephone: company.phone.intl,
      email: company.email,
      priceRange: lang === 'ro' ? 'La cerere' : 'По запросу',
      address,
      geo: { '@type': 'GeoCoordinates', latitude: company.geo.lat, longitude: company.geo.lng },
      hasMap: company.mapsUrl,
      openingHoursSpecification: company.hours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days.map((d) => DAY[d]),
        opens: h.opens,
        closes: h.closes,
      })),
      areaServed: { '@type': 'Country', name: 'Moldova' },
      parentOrganization: { '@id': orgId(site) },
      brand: { '@type': 'Brand', name: 'BULL' },
      knowsLanguage: ['ro', 'ru'],
      sameAs,
    },
  ];
}

export function breadcrumbGraph(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

export function faqGraph(qa: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: qa.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
  };
}

/** VideoObject — emis doar când data încărcării e cunoscută (câmp obligatoriu Google). */
export function videoGraph(v: Product['videos'][number], lang: Lang, thumbnailUrl: string, description: string) {
  if (!v.uploadDate) return null;
  return {
    '@type': 'VideoObject',
    name: v.title[lang],
    description,
    thumbnailUrl,
    uploadDate: v.uploadDate,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
  };
}

/** Product — fără preț inventat: ofertă „La cerere" (priceSpecification fără valoare). */
export function productGraph(p: Product, site: URL, lang: Lang, imageUrl: string) {
  const ui = t(lang);
  const props: { name: string; value: string | number; unitText?: string }[] = [];
  const k = p.key;
  props.push({ name: ui.specs.power, value: k.powerHp, unitText: ui.units.hp });
  if (k.powerKw) props.push({ name: ui.specs.power, value: k.powerKw, unitText: ui.units.kw });
  if (k.weightKg) props.push({ name: ui.specs.weight, value: k.weightKg, unitText: ui.units.kg });
  if (k.digDepthM) props.push({ name: ui.specs.digDepth, value: k.digDepthM, unitText: ui.units.m });
  if (k.speedKmh) props.push({ name: ui.specs.speed, value: k.speedKmh, unitText: ui.units.kmh });
  if (k.flowLpm) props.push({ name: ui.specs.flow, value: k.flowLpm, unitText: ui.units.lpm });
  if (k.ratedLoadKg) props.push({ name: ui.specs.ratedLoad, value: k.ratedLoadKg, unitText: ui.units.kg });
  if (k.payloadKg) props.push({ name: ui.specs.payload, value: k.payloadKg, unitText: ui.units.kg });
  props.push({ name: ui.specs.drive, value: k.drive.join(' / ') });
  const url = new URL(productPath(p, lang), site).href;
  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: p.name,
    model: p.model,
    category: p.type[lang],
    description: p.summary[lang],
    image: imageUrl,
    url,
    brand: { '@type': 'Brand', name: 'BULL' },
    manufacturer: { '@type': 'Organization', name: manufacturer.name, url: manufacturer.url },
    additionalProperty: props.map((x) => ({ '@type': 'PropertyValue', ...x })),
    hasWarrantyPromise: {
      '@type': 'WarrantyPromise',
      durationOfWarranty: { '@type': 'QuantitativeValue', value: company.warrantyYears, unitCode: 'ANN' },
      warrantyScope: ui.badges.warranty,
    },
    offers: {
      '@type': 'Offer',
      url,
      availability: 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/NewCondition',
      priceCurrency: 'MDL',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'MDL',
        description: ui.specs.onRequest,
      },
      seller: { '@id': orgId(site) },
      warranty: {
        '@type': 'WarrantyPromise',
        durationOfWarranty: { '@type': 'QuantitativeValue', value: company.warrantyYears, unitCode: 'ANN' },
      },
    },
  };
}
