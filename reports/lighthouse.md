# Raport Lighthouse: Etapa 1 (design system + Acasă)

Data: 12.10.2026 (actualizat după logo-urile vectoriale și video-urile Ozonteh) · Lighthouse 13.5.0 · Chromium headless · build de producție (`npm run build`) servit static cu gzip și cache (ca pe hostingul de producție).
Mobil = emulare Moto G Power, 4G lent simulat, CPU ×4. Desktop = preset `desktop`.

| Pagina | Dispozitiv | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | FCP |
|---|---|---|---|---|---|---|---|---|---|
| `/` (RO) | Mobil | **95–96** | **100** | **100** | **100** | 2,5 s | 0 | 0–60 ms | 2,1 s |
| `/` (RO) | Desktop | **100** | **100** | **100** | **100** | 0,6 s | 0 | 0 ms | 0,4 s |
| `/ru/` (RU) | Mobil | **96–97** | **100** | **100** | **100** | 2,3 s | 0 | 50 ms | 2,0 s |
| `/ru/` (RU) | Desktop | **100** | **100** | **100** | **100** | 0,6 s | 0 | 0 ms | 0,5 s |

Ținte din brief: Lighthouse Mobile ≥ 90 la toate categoriile ✅ · LCP < 2,5 s ✅ (pe RO la limită: 2,49 s în simulare) · CLS < 0,05 ✅ · INP < 200 ms: INP nu se poate măsura în laborator; TBT ≤ 60 ms indică un INP mic. Se confirmă în teren, cu Search Console / CrUX după lansare.

Greutate totală la prima încărcare: 224 KiB pe mobil și 347 KiB pe desktop.

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
