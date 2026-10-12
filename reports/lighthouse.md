# Raport Lighthouse: tot site-ul (etapele 1–3)

Data: 12.10.2026 · Lighthouse 13.5.0 · Chromium headless · build de producție (`npm run build`) servit static cu gzip și cache, ca pe hosting.
Mobil = emulare Moto G Power, 4G lent simulat, CPU ×4. Desktop = preset `desktop`.

## Pagini de produs (etapa 2)

| Pagina | Dispozitiv | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | FCP | Greutate |
|---|---|---|---|---|---|---|---|---|---|---|
| `/buldoexcavatoare/bull-hd-100/` | Mobil | **96** | **100** | **100** | **100** | 2,4 s | 0 | 0 ms | 2,1 s | 263 KiB |
| `/buldoexcavatoare/bull-hd-100/` | Desktop | **100** | **100** | **100** | **100** | 0,5 s | 0 | 0 ms | 0,5 s | 223 KiB |
| `/ru/ekskavatory-pogruzchiki/bull-hd-100/` | Mobil | **97** | **100** | **100** | **100** | 2,3 s | 0,002 | 0 ms | 2,0 s | 251 KiB |
| `/ru/ekskavatory-pogruzchiki/bull-hd-100/` | Desktop | **100** | **100** | **100** | **100** | 0,5 s | 0,003 | 0 ms | 0,5 s | 211 KiB |
| `/buldoexcavatoare/bull-ch76-challenger/` | Mobil | **97** | **100** | **100** | **100** | 2,2 s | 0 | 0 ms | 2,0 s | 216 KiB |
| `/miniincarcatoare-skid-steer/bull-av490/` | Mobil | **98** | **100** | **100** | **100** | 2,1 s | 0 | 0 ms | 2,0 s | 236 KiB |
| `/ru/ekskavatory-pogruzchiki/bull-grandia-dlx/` | Mobil | **97** | **100** | **100** | **100** | 2,3 s | 0 | 0 ms | 1,8 s | 208 KiB |

Accessibility a fost 97 înaintea a două corecturi globale: eticheta linkului-logo din header conține acum textul vizibil („Distribuitor oficial”), iar linkul spre politica de confidențialitate din formular e subliniat.

Elementul LCP pe pagina de produs e imaginea utilajului (`fetchpriority="high"`, AVIF). Watermark-ul cu numele modelului e text SVG, deci nu devine element LCP, iar animația de intrare a imaginii folosește doar `transform`, fără opacitate.

Ce se încarcă abia la nevoie: desenul tehnic (lazy, un singur fișier pentru toate vederile), fotografiile galeriei (doar când se deschide lightbox-ul), posterele video (lazy) și iframe-ul YouTube (doar la Play).

## Paginile din etapa 3

| Pagina | Dispozitiv | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/utilaje/` (catalog) | Mobil | **96** | **100** | **100** | **100** | 2,4 s | 0 | 0 ms |
| `/despre-noi/` | Mobil | **96** | **100** | **100** | **100** | 2,5 s | 0 | 0 ms |
| `/contacte/` | Mobil | **98** | **100** | **100** | **100** | 2,0 s | 0,016 | 0 ms |
| `/ru/kontakty/` | Mobil | **98** | **100** | **100** | **100** | 2,0 s | 0 | 0 ms |
| `/service-si-piese/` | Mobil | **98** | **100** | **100** | **100** | 2,0 s | 0,039 | 0 ms |
| `/ru/blog/mini-pogruzchik-ili-ekskavator-pogruzchik/` | Mobil | **97** | **100** | **100** | **100** | 2,4 s | 0,015 | 30 ms |
| `/compara/` | Desktop | **100** | **100** | **100** | **100** | 0,5 s | 0,016 | 0 ms |

Două corecturi făcute în urma măsurătorilor:
- Pe Contacte, butoanele din hero se rupeau altfel cu fontul de rezervă decât cu fontul final, iar CLS-ul era 0,125. Acum stau într-o grilă cu coloane fixe, iar CLS-ul a scăzut la 0,016.
- Pe comparator, etichetele formularului de pe fundal deschis aveau contrast 2,85:1. Acum folosesc culoarea `--steel-ink`.

Filtrele din catalog sunt închise implicit pe mobil (pe desktop stau deschise în coloana din stânga), ca primul model să apară în primul ecran.

## Acasă (după etapa 2)

| Pagina | Dispozitiv | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | FCP |
|---|---|---|---|---|---|---|---|---|---|
| `/` (RO) | Mobil | **95** | **100** | **100** | **100** | 2,6 s | 0 | 10 ms | 2,1 s |
| `/` (RO) | Desktop | **100** | **100** | **100** | **100** | 0,7 s | 0 | 0 ms | 0,5 s |
| `/ru/` (RU) | Mobil | **96** | **100** | **100** | **100** | 2,4 s | 0 | 0 ms | 2,0 s |

Ținte din brief: Lighthouse Mobile ≥ 90 la toate categoriile ✅ · CLS < 0,05 ✅ · LCP < 2,5 s ✅ pe toate paginile de produs. **Excepție: Acasă RO, unde LCP-ul simulat e 2,6 s**, puțin peste țintă. Creșterea a venit în etapa 1, după secțiunea „Garanție” și video-urile Ozonteh: HTML-ul a urcat de la 40 la 46 KB gzip. Pârghia rămasă sunt fonturile (vezi mai jos). INP nu se poate măsura în laborator; TBT ≤ 10 ms indică un INP mic, care se confirmă în teren (Search Console / CrUX) după lansare.

## Ce a contat pentru scor

- **Hero fără blocare de LCP:** posterul are `fetchpriority="high"` și e preîncărcat din `<head>` cu `imagesrcset` separat pentru mobil și desktop. Titlul apare cu reveal pe litere făcut doar în CSS, iar GSAP nu e implicat în primul ecran.
- **CSS inline** (`inlineStylesheets: 'always'`): nicio foaie de stil nu mai blochează randarea.
- **Fonturi auto-găzduite** (Astro Fonts API, `font-display: swap`, fallback cu metrici ajustate, deci CLS 0). Au rămas doar greutățile folosite: Big Shoulders 800, Plex Sans 400/600, Plex Mono 500 și Oswald 600 pentru RU. Pe RO se preîncarcă doar fontul titlului, pe RU fontul Oswald chirilic.
- **JS minim pe mobil:** GSAP și ScrollTrigger se încarcă dinamic doar pe desktop, când showroom-ul se apropie de ecran. Lenis se încarcă doar pe desktop cu mouse. Pe mobil, caruselul e CSS nativ (scroll-snap).
- **`content-visibility: auto`** pe secțiunile de sub fold. Hero-ul și showroom-ul sunt excluse, pentru că pin-ul are nevoie de măsurători exacte.
- **Imagini AVIF/WebP** cu `srcset`, `width`/`height` setate și `loading="lazy"` peste tot, cu excepția hero-ului.

## Rezervă de optimizare

Cea mai mare pârghie rămasă sunt fonturile: 8 fișiere, 134 KB pe RO. Se pot reduce cu subseturi proprii („latin + diacritice românești”), dar IBM Plex are „Reserved Font Name” în licența OFL, iar subsetarea proprie se face doar cu verificarea licenței sau cu redenumirea fontului.

## Regenerare

```bash
npm run build
npx lighthouse@13 http://localhost:4321/ --view                    # mobil
npx lighthouse@13 http://localhost:4321/ --preset=desktop --view   # desktop
```

(cu `npm run preview` pornit; în mediile fără Chrome instalat se setează `CHROME_PATH`).
