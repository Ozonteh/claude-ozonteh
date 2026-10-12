// Date companie (Anexa A + A2). NAP identic pe tot site-ul: modificați DOAR aici.

export const company = {
  legalName: 'Ozonteh Impex SRL',
  brandName: 'BULL Moldova',
  shortName: 'Ozonteh',
  foundingYear: 2011,
  email: 'marketing@ozonteh.md',
  // Numărul principal BULL Moldova: header, bara mobilă, formulare, footer, JSON-LD.
  phone: { display: '069 898 307', intl: '+373 69 898 307', tel: '+37369898307' },
  whatsapp: 'https://wa.me/37369898307',
  address: {
    street: 'Șos. Chișinău 69 (E58)',
    city: 'Strășeni',
    locality: 'mun. Strășeni',
    postalCode: 'MD-3701',
    region: 'Strășeni',
    country: 'MD',
    countryName: { ro: 'Republica Moldova', ru: 'Республика Молдова' },
  },
  // Coordonate din OpenStreetMap (clădirea Ozonteh Impex, Șos. Chișinău 69).
  geo: { lat: 47.131755, lng: 28.655568 },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ozonteh+%E2%80%93+Motorul+evolu%C8%9Biei+agricole+Str%C4%83%C8%99eni',
  mapsEmbed: 'https://www.google.com/maps?q=Ozonteh+Impex,+%C8%98oseaua+Chi%C8%99in%C4%83u+69,+Str%C4%83%C8%99eni&z=15&output=embed',
  hours: [
    { days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '08:00', closes: '18:00' },
    { days: ['Sa'], opens: '08:00', closes: '14:00' },
  ],
  social: {
    facebook: 'https://www.facebook.com/ozonteh.md',
    instagram: 'https://www.instagram.com/ozonteh.md',
    tiktok: 'https://www.tiktok.com/@ozonteh.md',
    // YouTube și Telegram: linkurile folosite pe ozonteh.net
    youtube: 'https://www.youtube.com/channel/UCaTEdTbAbCPlkM54HTUjHfg',
    telegram: 'https://t.me/+37369898772',
  },
  // Canalul YouTube Ozonteh: aici apar video-urile cu fiecare utilaj BULL.
  youtubeChannel: 'https://www.youtube.com/channel/UCaTEdTbAbCPlkM54HTUjHfg',
  youtubeSubscribe: 'https://www.youtube.com/channel/UCaTEdTbAbCPlkM54HTUjHfg?sub_confirmation=1',
  // Parteneri de leasing (FAQ, CTA)
  leasingPartners: ['maib', 'Microinvest'],
  warrantyYears: 1,
  warrantyMaxYears: 3,
} as const;

// Afișate doar pe pagina Contacte.
export const departments = [
  { key: 'sales', phone: '+373 60 400 044', tel: '+37360400044' },
  { key: 'parts', phone: '+373 69 898 822', tel: '+37369898822' },
  { key: 'service', phone: '+373 69 898 842', tel: '+37369898842' },
  { key: 'accounting', phone: '+373 69 898 872', tel: '+37369898872' },
] as const;

export const branches = [
  { key: 'balti', address: 'Str. Dragomir 4, mun. Bălți', phone: '+373 69 898 310', tel: '+37369898310', country: 'MD' },
  { key: 'bucuresti', address: 'Șos. Odăii 6, București', phone: '+40 720 797 879', tel: '+40720797879', country: 'RO' },
  { key: 'cluj', address: 'Sat Răscruci 367 B, jud. Cluj', phone: '+40 773 797 877', tel: '+40773797877', country: 'RO' },
] as const;

export const manufacturer = {
  name: 'BULL Machines Pvt Ltd',
  address: 'Trichy Road, Coimbatore 641103, India',
  url: 'https://bullindia.com/',
  group: 'AV Group',
};

// Contoare animate (Anexa A2 + D).
export const counters = [
  { value: 60000, suffix: '+', key: 'machines' },
  { value: 600, suffix: '+', key: 'dealers' },
  { value: 24, suffix: '+', key: 'years' },
  { value: 40, suffix: '+', key: 'buckets' },
  { value: 12000, suffix: '', key: 'capacity' },
] as const;

// Video hero (doar desktop, pornește în idle după LCP). Cât timp e `null`, hero-ul folosește posterul
// cu efect Ken Burns. Pentru activare: puneți clipul (6–10 s, mut, ≤ 2,5 MB, WebM + MP4) în public/video/
// — ideal filmarea cu drona de la vizita BULL din Strășeni — și setați:
//   export const heroVideo = { webm: '/video/bull-hero.webm', mp4: '/video/bull-hero.mp4' };
export const heroVideo: { webm?: string; mp4?: string } | null = null;

// ID-uri analytics din variabile de mediu (se încarcă doar după consimțământ).
export const analytics = {
  ga4: import.meta.env.PUBLIC_GA4_ID ?? '',
  metaPixel: import.meta.env.PUBLIC_META_PIXEL_ID ?? '',
  tiktokPixel: import.meta.env.PUBLIC_TIKTOK_PIXEL_ID ?? '',
};

export const LEAD_ENDPOINT = import.meta.env.PUBLIC_LEAD_ENDPOINT || '/api/lead';
