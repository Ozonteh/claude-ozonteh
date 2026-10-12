# BULL Moldova: site oficial (Ozonteh Impex SRL)

Site-ul de prezentare și generare de lead-uri pentru utilajele **BULL Machines** în Republica Moldova. Distribuitor oficial: **Ozonteh Impex SRL**, Strășeni.

- **Stack:** [Astro 7](https://astro.build) (SSG), Tailwind CSS 4, GSAP 3 + ScrollTrigger, Lenis. Fonturile sunt auto-găzduite prin Astro Fonts API.
- **Limbi:** română (implicit, `/`) și rusă (`/ru/`), cu `hreflang` `ro-MD`, `ru-MD` și `x-default`.
- **Date:** toate modelele sunt în `src/data/products.json`. Un model nou se adaugă fără cod.
- **Lead-uri:** formularul trimite cererea la `/api/lead` (Netlify Function). De acolo ajunge în amoCRM, iar dacă amoCRM nu răspunde, pleacă un e-mail de rezervă către office@ozonteh.md.

> **Stadiu: Etapa 1 din 3.** Sunt gata design system-ul (`/design-system/`), pagina Acasă în RO și RU, layout-ul global, SEO-ul tehnic, pagina 404 și funcția de lead. Urmează pagina de produs șablon (etapa 2) și restul paginilor (etapa 3). Linkurile către aceste pagini dau deocamdată 404.

## Cerințe

- Node.js **≥ 22.12** (Astro 7)
- npm 10+

## Instalare și rulare locală

```bash
npm install
cp .env.example .env      # completați ce aveți nevoie (vezi mai jos)
npm run dev               # http://localhost:4321
```

| Comandă | Ce face |
|---|---|
| `npm run dev` | server de dezvoltare cu hot reload |
| `npm run build` | build static de producție în `dist/` |
| `npm run preview` | servește build-ul local |
| `npm run check` | verificare TypeScript / Astro |
| `npm test` | teste pentru funcția de lead (fără rețea) |
| `npm run images` | descarcă din nou și optimizează imaginile BULL (Anexa C), cu `--force` pentru suprascriere |
| `npm run icons` | regenerează favicon-ul și iconițele PWA din `public/favicon.svg` |
| `npm run screenshots` | capturi mobil și desktop în `reports/screenshots/` (după `build`; setați `CHROMIUM_PATH` dacă e nevoie) |

## Deploy (Netlify, recomandat)

1. Conectați repository-ul în Netlify. `netlify.toml` setează deja build-ul (`npm run build`), folderul `dist/`, funcțiile, cache-ul pentru `/_astro/*`, header-ele de securitate și pagina 404 rusă.
2. În **Site settings → Environment variables**, setați variabilele din `.env.example`:
   - `PUBLIC_SITE_URL`: domeniul final (implicit `https://bull.ozonteh.md`, **de confirmat**). Se folosește pentru canonical, hreflang, sitemap și Open Graph.
   - `PUBLIC_GA4_ID`, `PUBLIC_META_PIXEL_ID`, `PUBLIC_TIKTOK_PIXEL_ID`. Se încarcă **doar după acord** în bannerul de cookie-uri.
   - `AMOCRM_BASE_URL` + `AMOCRM_ACCESS_TOKEN`, de la o integrare privată amoCRM cu token de lungă durată. Opțional: `AMOCRM_PIPELINE_ID`, `AMOCRM_STATUS_ID`, `AMOCRM_RESPONSIBLE_USER_ID`. Ca alternativă, `LEAD_WEBHOOK_URL`.
   - `RESEND_API_KEY` (+ `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM`) pentru e-mailul de rezervă. Domeniul expeditorului trebuie verificat în Resend.
3. HTTPS e activ automat pe Netlify.

Vercel sau Cloudflare Pages funcționează și ele pentru partea statică. Funcția `netlify/functions/lead.mts` e scrisă cu API-ul standard `Request`/`Response` și se poate muta ușor; în acest caz setați `PUBLIC_LEAD_ENDPOINT`.

### Cum ajunge un lead în amoCRM

`POST /api/lead` primește `{ name, phone, model, message, demo, lang, page, source }`. Funcția:

1. validează numele și telefonul (`+373` urmat de 8 cifre) și ignoră boții prin câmpul-capcană `website`;
2. creează în amoCRM lead + contact (`/api/v4/leads/complex`), cu tag-urile `site-bull`, `oferta`/`demonstratie`, `lang-ro`/`lang-ru` și `utm-…`, plus o notă cu toate detaliile (pagina, UTM, referrer);
3. dacă amoCRM nu e configurat sau dă eroare, trimite e-mail la office@ozonteh.md;
4. dacă nu merge niciun canal, răspunde 502 și formularul îi arată vizitatorului telefonul și WhatsApp-ul. Lead-ul apare atunci în log-ul funcției, ca să nu se piardă.

## Structura proiectului

```
src/
  data/products.json        ← modelele BULL (Anexa B), sursa unică
  data/attachments.ts       ← cele 19 cupe și atașamente
  data/site.ts              ← NAP, telefoane, program, rețele, contoare, video hero, analytics
  data/faq.ts               ← FAQ general (întrebările `draft` nu se publică)
  i18n/routes.ts            ← URL-uri RO ↔ RU (slug-uri ruse transliterate), hreflang
  i18n/ui.ts                ← toate textele interfeței, RO + RU (traduse manual)
  styles/global.css         ← design system: tokens, tipografie, componente, motion
  components/layout/        ← header, meniu full-screen, bara mobilă, formular, cookie-uri, footer
  components/home/          ← secțiunile paginii Acasă
  components/seo/Seo.astro  ← title, description, canonical, hreflang, OG, Twitter, JSON-LD
  lib/schema.ts             ← JSON-LD: Organization, LocalBusiness, Product, FAQPage, BreadcrumbList, VideoObject
  scripts/                  ← JS client: header, dialoguri, consimțământ, tracking, formular
  pages/                    ← index (RO), ru/index (RU), 404, design-system, robots.txt, sitemap-images.xml
  assets/bull/              ← imagini BULL optimizate, cu nume SEO (generate de `npm run images`)
netlify/functions/lead.mts  ← endpoint-ul /api/lead
scripts/                    ← fetch-images, make-icons, screenshots
reports/                    ← raport Lighthouse + capturi de ecran
```

## Cum adaugi sau modifici un model

Editați `src/data/products.json` și adăugați un obiect nou după modelul celor existente:

- `id` devine slug-ul URL (`/buldoexcavatoare/<id>/`);
- `category` are una dintre valorile `buldoexcavatoare`, `incarcatoare-frontale`, `miniincarcatoare-skid-steer`;
- `key` conține cifrele folosite pe carduri, în filtre și în schema Product. Câmpurile necunoscute se lasă `null` și **nu se estimează**;
- `specs` conține fișa tehnică pe grupe (`engine`, `transmission`, `hydraulics`, `performance`, `dimensions`, `capacities`), fiecare valoare în RO și RU;
- `image` este calea în `src/assets/bull/`. O imagine nouă se adaugă în `scripts/image-manifest.mjs` (cu `cutout: true` pentru fundal transparent), apoi se rulează `npm run images`.

Build-ul eșuează dacă o imagine referită lipsește.

## Imagini

Imaginile vin din Anexa C (bullindia.com). `npm run images` le **descarcă o singură dată** (fără hotlink), le optimizează și le salvează cu nume SEO, de exemplu `buldoexcavator-bull-sd76-super-smart.webp`. Pozele de produs primesc fundal transparent (decupaj automat), ca să arate bine pe fundalul grafit. La build, Astro generează variante AVIF/WebP responsive.

## Accesibilitate și motion

- `prefers-reduced-motion`: toate animațiile devin fade-uri scurte. Pin-ul orizontal și Lenis se dezactivează, iar video-ul hero nu pornește.
- Dialogurile (meniu, „Cere ofertă") folosesc `<dialog>` nativ: focus trap, Esc și fundal inert.
- Țintele de atingere au minimum 48 px, iar contrastul este AA (pe fundalurile deschise, textul secundar folosește `--steel-ink`).

## De verificat cu Ozonteh / BULL înainte de lansare

Vezi lista completă în descrierea etapei. Pe scurt: domeniul final, vectorul logo-ului BULL, clipul pentru hero, partenerii de leasing (FAQ), datele de încărcare ale clipurilor YouTube (pentru VideoObject), codul poștal (MD-3701 vs MD-3729), linkurile YouTube și Telegram și cifrele marcate `verify` în `products.json`.
