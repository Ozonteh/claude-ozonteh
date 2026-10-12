# BULL Moldova: site oficial (Ozonteh Impex SRL)

Site-ul de prezentare și generare de lead-uri pentru utilajele **BULL Machines** în Republica Moldova. Distribuitor oficial: **Ozonteh Impex SRL**, Strășeni.

- **Stack:** [Astro 7](https://astro.build) (SSG), Tailwind CSS 4, GSAP 3 + ScrollTrigger, Lenis. Fonturile sunt auto-găzduite prin Astro Fonts API.
- **Limbi:** română (implicit, `/`) și rusă (`/ru/`), cu `hreflang` `ro-MD`, `ru-MD` și `x-default`.
- **Date:** toate modelele sunt în `src/data/products.json`. Un model nou se adaugă fără cod.
- **Lead-uri:** formularul trimite cererea la `/api/lead` (`api/lead.php` pe cPanel). De acolo ajunge în amoCRM, iar dacă amoCRM nu răspunde, pleacă un e-mail de rezervă către marketing@ozonteh.md.

> **Stadiu: Etapa 2 din 3.** Sunt gata design system-ul (`/design-system/`), pagina Acasă, **paginile de produs pentru toate cele 9 modele** (RO și RU, 18 pagini), layout-ul global, SEO-ul tehnic, pagina 404 și funcția de lead. Urmează etapa 3: catalogul, paginile de categorie, comparatorul, cupe și atașamente, service, despre noi, contacte, blog, politici. Linkurile către aceste pagini (inclusiv breadcrumbs „Utilaje” și categoriile) dau deocamdată 404.

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
| `npm test` | teste pentru funcția de lead Netlify (fără rețea) |
| `npm run test:php` | teste pentru `api/lead.php` (varianta cPanel; necesită PHP) |
| `npm run images` | descarcă din nou și optimizează imaginile BULL (Anexa C), cu `--force` pentru suprascriere |
| `npm run icons` | regenerează favicon-ul și iconițele PWA din `public/favicon.svg` |
| `npm run screenshots` | capturi mobil și desktop în `reports/screenshots/` (după `build`; setați `CHROMIUM_PATH` dacă e nevoie) |

## Deploy pe hostingul cPanel (bull.ozonteh.md)

Domeniul `bull.ozonteh.md` are document root-ul `/public_html/bull.ozonteh.md`. Site-ul e static, iar formularul folosește un singur fișier PHP.

1. **Build** (local sau în CI), cu variabilele `PUBLIC_*` din `.env`:
   ```bash
   npm ci
   npm run build          # rezultatul e în dist/
   ```
   Pentru o versiune de test, care nu trebuie să apară în Google, setați `PUBLIC_NOINDEX=true` la build. Atunci `robots.txt` blochează tot site-ul și toate paginile primesc `noindex`. La lansare refaceți build-ul cu `PUBLIC_NOINDEX=false`.
2. **Upload:** urcați **conținutul** folderului `dist/` în `/public_html/bull.ozonteh.md`, inclusiv fișierele ascunse `.htaccess` și `_astro/.htaccess`. Cel mai simplu e din cPanel → File Manager: urcați o arhivă .zip și alegeți Extract. Merge și prin FTP.
3. **HTTPS:** în cPanel → SSL/TLS Status rulați AutoSSL pentru `bull.ozonteh.md`. După ce certificatul e emis, activați în cPanel → Domains opțiunea **Force HTTPS Redirect**.
4. **Formular → amoCRM:** copiați `bull-config.example.php` ca `bull-config.php` **în afara** `public_html`, de exemplu `/home/<utilizator>/bull-config.php`, și completați tokenul amoCRM. Endpoint-ul `/api/lead` (`api/lead.php`) îl găsește singur acolo. Pentru e-mailul de rezervă, creați în cPanel → Email Accounts adresa de expeditor, de exemplu `noreply@bull.ozonteh.md`.
5. **Analytics:** puneți `PUBLIC_GA4_ID`, `PUBLIC_META_PIXEL_ID` și `PUBLIC_TIKTOK_PIXEL_ID` în `.env` înainte de build. Trackerele se încarcă doar după acordul vizitatorului în bannerul de cookie-uri.

`.htaccess` se ocupă de: rescrierea `/api/lead` → `api/lead.php`, pagina 404 (pe `/ru/…` pagina 404 trimite singură la varianta rusă), tipurile MIME (AVIF, WOFF2, webmanifest), compresia, cache-ul de un an pentru `/_astro/*` (fișiere cu hash), header-ele de securitate și blocarea fișierelor de configurare.

### Cum ajunge un lead în amoCRM

`POST /api/lead` primește `{ name, phone, model, message, demo, lang, page, source }`. Endpoint-ul:

1. validează numele și telefonul (`+373` urmat de 8 cifre) și ignoră boții prin câmpul-capcană `website`;
2. creează în amoCRM lead + contact (`/api/v4/leads/complex`), cu tag-urile `site-bull`, `oferta`/`demonstratie`, `lang-ro`/`lang-ru` și `utm-…`, plus o notă cu toate detaliile (pagina, UTM, referrer);
3. dacă amoCRM nu e configurat sau dă eroare, trimite e-mail la marketing@ozonteh.md;
4. dacă nu merge niciun canal, răspunde 502 și formularul îi arată vizitatorului telefonul și WhatsApp-ul. Lead-ul apare atunci în `error_log`, ca să nu se piardă.

Testele rulează cu `npm run test:php` (PHP) și `npm test` (varianta Netlify).

### Alternativ: Netlify

`netlify.toml` și `netlify/functions/lead.mts` fac același lucru pe Netlify. Variabilele (`AMOCRM_*`, `RESEND_API_KEY`, `LEAD_EMAIL_TO`) se setează atunci în Site settings → Environment variables. Pe hostingul cPanel aceste fișiere nu se folosesc.

## Structura proiectului

```
src/
  data/products.json        ← modelele BULL (Anexa B), sursa unică
  data/attachments.ts       ← cele 19 cupe și atașamente
  data/site.ts              ← NAP, telefoane, program, rețele, contoare, video hero, analytics
  data/faq.ts               ← FAQ general (întrebările `draft` nu se publică)
  data/dimensions.ts        ← denumirile cotelor din desenele tehnice (A, B, C…), RO + RU
  data/videos.ts            ← clipurile de pe canalul YouTube Ozonteh
  content/produse/ro|ru/    ← textele lungi ale paginilor de produs (Markdown: SEO title/description, FAQ, 4 secțiuni)
  i18n/routes.ts            ← URL-uri RO ↔ RU (slug-uri ruse transliterate), hreflang
  i18n/ui.ts                ← toate textele interfeței, RO + RU (traduse manual)
  styles/global.css         ← design system: tokens, tipografie, componente, motion
  components/layout/        ← header, meniu full-screen, bara mobilă, formular, cookie-uri, footer
  components/home/          ← secțiunile paginii Acasă
  components/product/       ← secțiunile paginii de produs (hero + galerie, cifre, desen tehnic, fișă, video, broșură…)
  views/ProductPage.astro   ← șablonul paginii de produs (date, JSON-LD, ordinea secțiunilor)
  components/seo/Seo.astro  ← title, description, canonical, hreflang, OG, Twitter, JSON-LD
  lib/schema.ts             ← JSON-LD: Organization, LocalBusiness, Product, FAQPage, BreadcrumbList, VideoObject
  scripts/                  ← JS client: header, dialoguri, consimțământ, tracking, formular
  pages/                    ← index, [category]/[product] (RO), ru/… (RU), 404, design-system, robots.txt, sitemap-images.xml
  assets/bull/              ← imagini BULL optimizate, cu nume SEO (generate de `npm run images`)
public/api/lead.php         ← endpoint-ul /api/lead pe cPanel (amoCRM + e-mail de rezervă)
public/.htaccess            ← Apache/LiteSpeed: rescrieri, 404, cache, compresie, securitate
bull-config.example.php     ← model de configurare (se pune în afara public_html)
netlify/functions/lead.mts  ← alternativa Netlify
scripts/                    ← fetch-images, make-icons, screenshots
reports/                    ← raport Lighthouse + capturi de ecran
```

## Cum adaugi sau modifici un model

Editați `src/data/products.json` și adăugați un obiect nou după modelul celor existente:

- `id` devine slug-ul URL (`/buldoexcavatoare/<id>/`);
- `category` are una dintre valorile `buldoexcavatoare`, `incarcatoare-frontale`, `miniincarcatoare-skid-steer`;
- `key` conține cifrele folosite pe carduri, în filtre și în schema Product. Câmpurile necunoscute se lasă `null` și **nu se estimează**;
- `specs` conține fișa tehnică pe grupe (`engine`, `transmission`, `hydraulics`, `performance`, `dimensions`, `capacities`), fiecare valoare în RO și RU;
- `image` este calea în `src/assets/bull/`. O imagine nouă se adaugă în `scripts/image-manifest.mjs` (cu `cutout: true` pentru fundal transparent), apoi se rulează `npm run images`;
- `drawing` descrie desenul tehnic: fișierul `-negativ.webp`, dimensiunile, unitatea (`m` sau `mm`) și vederile (`x` = intervalul în pixeli al vederii pe planșă). Fiecare cotă e `[literă, tip, valoare, valoare cu braț extensibil]`; tipurile și denumirile RO/RU sunt în `src/data/dimensions.ts`. Fără desen: `"drawing": null`, iar secțiunea nu apare;
- `brochure` și `brochureMb`: linkul PDF oficial BULL și mărimea afișată pe buton;
- `videos`: clipurile oficiale BULL (id YouTube, `poster`, `uploadDate`). Pentru clipurile „unlisted” `uploadDate` rămâne `null`, așa că nu se generează VideoObject.

**Textul paginii** (minimum 400 de cuvinte în română) e în `src/content/produse/ro/<id>.md`, iar traducerea manuală e în `src/content/produse/ru/<id>.md`. Frontmatter-ul conține `title` (SEO), `description` și `faq` (afișat pe pagină și în schema FAQPage). Corpul are 4 secțiuni: pentru cine este, ce lucrări face, de ce acest model, service/piese/garanție. Un model nou fără aceste două fișiere oprește build-ul cu un mesaj clar.

Build-ul eșuează dacă o imagine referită lipsește.

## Pagina de produs

Ordinea secțiunilor: hero cu galerie (lightbox) → 4–6 cifre cheie → avantaje (și versiunile vândute în Moldova, la HD 100) → textul lung → desen tehnic animat → fișa tehnică → atașamente compatibile → video → broșura PDF → FAQ → alte utilaje. Pe desktop formularul „Cere ofertă” stă fix în dreapta, cu modelul preselectat. Pe mobil formularul apare după FAQ, iar bara de jos deschide același formular preselectat.

- **Desen tehnic („blueprint reveal”).** Desenul BULL e inversat (`-negativ.webp`, generat de `npm run images` din desenul original). Doar luminozitatea se inversează, deci galbenul BULL rămâne galben. La scroll, desenul se trasează cu un scanner galben, iar cotele apar una câte una, cu valorile reale. Planșele cu mai multe vederi se decupează din CSS, din același fișier. Desenul CH76 e extras din broșura oficială `ch76-new.pdf`, pagina 2. Grandia DLX nu are desen publicat.
- **Fișa tehnică.** Pe mobil e afișată ca acordeoane, cu primul grup deschis. Pe desktop e un tabel cu antet fix. Fără JS, toate grupele rămân deschise.
- **Video.** Întâi apar clipurile Ozonteh ale modelului (inclusiv Shorts, afișate vertical), apoi clipurile oficiale BULL. Iframe-ul YouTube se încarcă doar la Play.
- **Broșura** se deschide de pe bullindia.com (PDF în engleză, 3,6–41,5 MB). Click-ul trimite evenimentul `download_brochure`.
- **JSON-LD:** Product (garanție, preț „La cerere”), BreadcrumbList, FAQPage și VideoObject. Body-ul are `data-view-product`, din care pleacă evenimentul `view_product` după acordul pentru cookie-uri.

## Imagini

Imaginile vin din Anexa C (bullindia.com). `npm run images` le **descarcă o singură dată** (fără hotlink), le optimizează și le salvează cu nume SEO, de exemplu `buldoexcavator-bull-sd76-super-smart.webp`. Pozele de produs primesc fundal transparent (decupaj automat), ca să arate bine pe fundalul grafit. La build, Astro generează variante AVIF/WebP responsive.

## Garanție

Garanția e definită într-un singur loc, `company.warranty` din `src/data/site.ts`: utilaj 24 luni sau 2000 moto-ore, motor 3 ani sau 3000 moto-ore. Textele sunt în `src/i18n/ui.ts` (`badges.warranty`, `badges.warrantyEngine`, `home.warranty`) și în FAQ. Pe Acasă apare în hero, în banda ticker, pe fiecare card din showroom, în secțiunea dedicată „Garanție”, în „De ce Ozonteh”, în FAQ, în formular și în footer. În schema Product apare ca `Offer.warranty`.

## Accesibilitate și motion

- `prefers-reduced-motion`: toate animațiile devin fade-uri scurte. Pin-ul orizontal și Lenis se dezactivează, iar video-ul hero nu pornește.
- Dialogurile (meniu, „Cere ofertă") folosesc `<dialog>` nativ: focus trap, Esc și fundal inert.
- Țintele de atingere au minimum 48 px, iar contrastul este AA (pe fundalurile deschise, textul secundar folosește `--steel-ink`).

## Video-uri

Clipurile filmate de Ozonteh (canalul YouTube Ozonteh) stau în `src/data/videos.ts`, cu data publicării și durata, iar din ele se generează schema `VideoObject`. Clipurile oficiale BULL rămân în `products.json`. Pentru un clip nou de pe canal adăugați o intrare în `videos.ts` (id YouTube, data, durata, modelul). Posterul se descarcă de pe YouTube prin `scripts/image-manifest.mjs` (`videoPosters`) și `npm run images`. Pe pagina unui model fără clip Ozonteh se afișează linkul către canal și mesajul că clipul apare în curând.

## Confirmat de Ozonteh

- **HD 100:** în Moldova se vând două versiuni (ZF Power Shift și Carraro + Casappa). Versiunea Carraro vine cu cupă 6 în 1, braț telescopic, joystick și aer condiționat. Ciocanul hidraulic e opțional.
- **CH76 Challenger:** se publică 76 CP. Broșura BULL `ch76-new.pdf` indică 55 HP (40,5 kW) la 2000 rpm, așa că pe site nu apare valoarea în kW.

## De verificat cu Ozonteh / BULL înainte de lansare

- Clipul de 6–10 s pentru hero.
- **Gabaritul:** pe bullindia.com, lungimea totală e 6,04 m la SD76/HD96 și 7,46 m la HD 100 (și în broșura CH76). Gabaritul Grandia e identic cu al SD76, deci probabil copiat. Pentru Grandia afișăm doar cotele de lucru.
- Celelalte cifre marcate `verify` în `products.json` (SD76 75/76 CP, AV490 50/52 CP, fișa Grandia DLX).
