// Manifestul imaginilor din Anexa C. Fiecare intrare: sursa de pe bullindia.com → nume SEO local.
// Imaginile sunt descărcate o singură dată, optimizate (WebP master) și salvate în src/assets/bull/.
// Astro generează apoi variantele responsive AVIF/WebP la build. Nu se face hotlink.
//
// Opțiuni:
//   cutout: true   → elimină fundalul alb (flood fill + color-to-alpha pe margini), pentru fundaluri întunecate
//   maxWidth: n    → redimensionare maximă a masterului
//   extract: {left, top, width, height} → decupaj în pixeli din sursa originală (înainte de resize)
//   format: 'png'  → păstrează PNG (ex. desene tehnice cu linii fine)

const BULL = 'https://bullindia.com/';

const products = [
  ['images/products/bull-sd76-all-new.webp', 'produse/buldoexcavator-bull-sd76-super-smart.webp'],
  ['images/products/bull-ch76-new-super.webp', 'produse/buldoexcavator-bull-ch76-challenger.webp'],
  ['images/products/bull-grandia-dlx-new2825.webp', 'produse/buldoexcavator-bull-grandia-dlx.webp'],
  ['images/products/grandia-new4wd.webp', 'produse/buldoexcavator-bull-grandia-4x4.webp'],
  ['images/products/bullhd-96-4w-new.webp', 'produse/buldoexcavator-bull-hd96-4wd.webp'],
  ['images/products/bullhd-4wd-100new.webp', 'produse/buldoexcavator-bull-hd100.webp'],
  ['images/products/bull-loaderhd-76new.webp', 'produse/incarcator-frontal-bull-hd76.webp'],
  ['images/products/skid-stree-new.png', 'produse/miniincarcator-skid-steer-bull-av490.webp'],
  ['images/products/av740-pro.webp', 'produse/incarcator-compact-bull-av740.webp'],
].map(([src, out]) => ({ src, out, cutout: true }));

const scenes = [
  // Acasă
  ['images/banner/ch76-highspeed-banner03.webp', 'santier/buldoexcavator-bull-ch76-santier-moldova.webp'],
  ['images/banner/new-banner4.webp', 'santier/fabrica-bull-machines-coimbatore-india.webp'],
  // SD76
  ['images/banner/sd76-banner.webp', 'santier/buldoexcavator-bull-sd76-santier-constructii.webp'],
  ['images/banner/sd76-banner2.webp', 'santier/buldoexcavator-bull-sd76-incarcare-basculanta.webp'],
  ['images/banner/sd76-banner3.webp', 'santier/buldoexcavator-bull-sd76-sapare-sant.webp'],
  // Grandia
  ['images/banner/grandia-banner-new1.webp', 'santier/buldoexcavator-bull-grandia-4-roti-directoare.webp'],
  ['images/banner/grandia-banner-new2.webp', 'santier/buldoexcavator-bull-grandia-teren-accidentat.webp'],
  ['images/banner/grandia-banner01.webp', 'santier/buldoexcavator-bull-grandia-cariera.webp'],
  // HD96
  ['images/overview/96-4wd/hd96-slider1.webp', 'santier/buldoexcavator-bull-hd96-sapare-fundatie.webp'],
  ['images/overview/96-4wd/hd96-slider2.webp', 'santier/buldoexcavator-bull-hd96-santier.webp'],
  ['images/overview/96-4wd/hd96-slider3.webp', 'santier/buldoexcavator-bull-hd96-cariera.webp'],
  // HD100
  ['images/overview/hd100/hd100-slider1.webp', 'santier/buldoexcavator-bull-hd100-sapare-retele.webp'],
  ['images/overview/hd100/hd100-slider2.webp', 'santier/buldoexcavator-bull-hd100-cariera.webp'],
  ['images/overview/hd100/hd100-banner-new3.webp', 'santier/buldoexcavator-bull-hd100-terasamente.webp'],
  // HD76 Loader
  ['images/overview/76loader/hd76-loader-newbn.webp', 'santier/incarcator-frontal-bull-hd76-cariera-piatra.webp'],
  ['images/overview/76loader/hd76-loader-new.webp', 'santier/incarcator-frontal-bull-hd76-variante-cupa.webp'],
  ['images/overview/76loader/hd-loader-banner3.webp', 'santier/incarcator-frontal-bull-hd76-concasor.webp'],
  // AV490
  ['images/overview/skid_steer/skid-slider1.webp', 'santier/miniincarcator-skid-steer-bull-av490-santier.webp'],
  ['images/overview/skid_steer/skid-slider2.webp', 'santier/miniincarcator-skid-steer-bull-av490-depozit.webp'],
  ['images/overview/skid_steer/skid-slider3.webp', 'santier/miniincarcator-skid-steer-bull-av490-lucru.webp'],
  ['images/overview/skid_steer/slider-new4.png', 'santier/miniincarcator-skid-steer-bull-av490-hala.webp'],
  // AV740
  ['images/banner/all-new-av-740.webp', 'santier/incarcator-compact-bull-av740-santier.webp'],
].map(([src, out]) => ({ src, out, maxWidth: 2000 }));

// Decupaj portret pentru hero-ul de pe mobil (utilajul e în dreapta cadrului).
const heroMobile = {
  src: 'images/banner/ch76-highspeed-banner03.webp',
  out: 'santier/buldoexcavator-bull-ch76-santier-moldova-mobil.webp',
  extract: { left: 640, top: 0, width: 1240, height: 818 },
};

const blueprints = [
  ['images/blueprint/grandia-dimension.png', 'desene/desen-tehnic-buldoexcavator-bull-grandia.webp', 2400],
  ['images/blueprint/hd96-blueprint.jpg', 'desene/desen-tehnic-buldoexcavator-bull-hd96.webp'],
  ['images/blueprint/100-4wd.jpg', 'desene/desen-tehnic-buldoexcavator-bull-hd100.webp'],
  ['images/blueprint/76loader.jpg', 'desene/desen-tehnic-incarcator-frontal-bull-hd76.webp'],
  ['images/blueprint/skidsteer-new.webp', 'desene/desen-tehnic-skid-steer-bull-av490.webp'],
  ['images/blueprint/bull-av740-new.webp', 'desene/desen-tehnic-incarcator-compact-bull-av740.webp'],
  ['images/sd-76.jpg', 'desene/desen-tehnic-buldoexcavator-bull-sd76.webp'],
  ['images/turning-circle.jpg', 'desene/raza-de-intoarcere-buldoexcavator-bull.webp'],
].map(([src, out, maxWidth]) => ({ src, out, maxWidth, lossless: true }));

// Cupe și atașamente: [fișier sursă BULL, slug SEO]
const buckets = [
  ['standard-bucket', 'cupa-standard-gp'],
  ['6in1-open', 'cupa-6-in-1'],
  ['booster-bucket', 'cupa-booster-descarcare-inalta'],
  ['hdhv', 'cupa-hd-hv-volum-mare'],
  ['hvg', 'cupa-hvg-cu-gheara'],
  ['stone-bucket', 'cupa-pentru-piatra'],
  ['trench-bucket', 'cupa-trapezoidala-sant'],
  ['backhoe-bucket', 'cupa-excavator'],
  ['grabbing-fork', 'furca-cu-gheara'],
  ['log-fork', 'furca-pentru-bustean'],
  ['fork-lift', 'furca-stivuitor'],
  ['balegrabber-bucket', 'gheara-pentru-baloti'],
  ['compactroller-bucket', 'cupa-cu-tavalug-compactor'],
  ['bagasse-dozer', 'lama-dozer'],
  ['sugacane-loader-ce', 'incarcator-trestie'],
].flatMap(([src, slug]) => [
  { src: `images/bucket-options/ce/${src}-big.jpg`, out: `atasamente/${slug}.webp` },
]);

const galleries = [
  ...[1, 2, 3, 4, 5].map((i) => ({ src: `images/gallery/bull-grandia/bull-grandia-${i}.webp`, out: `galerie/buldoexcavator-bull-grandia-${i}.webp` })),
  ...[1, 2, 3, 4, 5].map((i) => ({ src: `images/gallery/96-4wd/0${i}.jpg`, out: `galerie/buldoexcavator-bull-hd96-${i}.webp` })),
  ...[1, 2, 3, 4, 5].map((i) => ({ src: `images/gallery/hd-100/0${i}.jpg`, out: `galerie/buldoexcavator-bull-hd100-${i}.webp` })),
  ...[1, 2, 3, 4, 5].map((i) => ({ src: `images/gallery/76-loader/0${i}.jpg`, out: `galerie/incarcator-frontal-bull-hd76-${i}.webp` })),
  ...[1, 2, 3, 4, 5].map((i) => ({ src: `images/gallery/skidsteer/0${i}.png`, out: `galerie/miniincarcator-skid-steer-bull-av490-${i}.webp` })),
];

export const manifest = [
  ...products,
  ...scenes,
  heroMobile,
  ...blueprints,
  ...buckets,
  ...galleries,
].map((e) => ({ ...e, url: e.url ?? BULL + e.src }));

// Logo-uri (Anexa A). Ozonteh: original albastru + variantă albă pentru fundal întunecat.
export const logos = [
  { url: 'https://ozonteh.net/wp-content/uploads/2022/06/logo-ozonteh.png', out: 'logo/ozonteh-logo.png', variants: ['white'] },
  { url: 'https://bullindia.com/images/bull-machine-logo.png', out: 'logo/bull-machines-logo.png' },
];
