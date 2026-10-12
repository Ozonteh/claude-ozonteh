// Interacțiunile paginii de produs: galerie (lightbox), count-up la cifre, desenul tehnic animat,
// fișa tehnică (acordeoane pe mobil, tabel deschis pe desktop) și facade-ul YouTube.
import { initYouTube } from './youtube';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = matchMedia('(min-width: 64rem)');
const locale = document.documentElement.lang === 'ru' ? 'ru-RU' : 'ro-RO';

initYouTube();

/* ---------- Count-up: valoarea finală e deja în HTML; animăm doar dacă e permis ---------- */
function countUp(els: HTMLElement[], dur = 1600) {
  if (reduce || !els.length) return;
  const items = els.map((el) => {
    const digits = Number(el.dataset.digits ?? 0);
    const nf = new Intl.NumberFormat(locale, el.hasAttribute('data-fixed') ? { minimumFractionDigits: digits, maximumFractionDigits: digits } : { maximumFractionDigits: digits });
    return { el, to: Number(el.dataset.count), nf, final: el.textContent };
  });
  const t0 = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / dur);
    const k = 1 - Math.pow(1 - p, 4);
    for (const it of items) it.el.textContent = p < 1 ? it.nf.format(it.to * k).replace(/\s/g, ' ') : it.final;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function onceVisible(el: Element, cb: () => void, threshold = 0.2) {
  if (!('IntersectionObserver' in window)) return cb();
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      cb();
    },
    { threshold, rootMargin: '0px 0px -10% 0px' }
  );
  io.observe(el);
}

const kf = document.querySelector<HTMLElement>('[data-kf]');
if (kf) onceVisible(kf, () => countUp([...kf.querySelectorAll<HTMLElement>('[data-count]')]), 0.3);

/* ---------- Desen tehnic: trasare + cote una câte una ---------- */
document.querySelectorAll<HTMLElement>('[data-draw]').forEach((el) => {
  onceVisible(el, () => {
    el.classList.add('is-drawn');
    const vals = [...el.querySelectorAll<HTMLElement>('[data-count]')];
    // Valorile pornesc odată cu rândurile lor (0,5 s + 0,14 s × index, ca în CSS).
    vals.forEach((v, i) => setTimeout(() => countUp([v], 900), reduce ? 0 : 500 + i * 140));
  }, 0.25);
});

/* ---------- Fișa tehnică ---------- */
const groups = [...document.querySelectorAll<HTMLDetailsElement>('[data-spec-group]')];
function syncSpecs() {
  if (desktop.matches) groups.forEach((g) => (g.open = true));
  else groups.forEach((g) => (g.open = g.hasAttribute('data-first')));
}
if (groups.length) {
  syncSpecs();
  desktop.addEventListener('change', syncSpecs);
  // Pe desktop grupele sunt un tabel: nu se pliază.
  groups.forEach((g) =>
    g.addEventListener('toggle', () => {
      if (desktop.matches && !g.open) g.open = true;
    })
  );
}

/* ---------- Galerie: lightbox cu <dialog>, glisare nativă (scroll-snap), săgeți și tastatură ---------- */
const lb = document.querySelector<HTMLDialogElement>('[data-lightbox]');
if (lb) {
  const track = lb.querySelector<HTMLElement>('[data-lb-track]')!;
  const slides = [...track.children] as HTMLElement[];
  const counter = lb.querySelector<HTMLElement>('[data-lb-index]')!;
  let index = 0;
  const go = (i: number, smooth = true) => {
    index = (i + slides.length) % slides.length;
    track.scrollTo({ left: slides[index].offsetLeft, behavior: smooth && !reduce ? 'smooth' : 'auto' });
    counter.textContent = String(index + 1);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          index = slides.indexOf(e.target as HTMLElement);
          counter.textContent = String(index + 1);
        }
      }
    },
    { root: track, threshold: 0.6 }
  );
  slides.forEach((s) => io.observe(s));

  let opener: HTMLElement | null = null;
  document.addEventListener('click', (e) => {
    const t = (e.target as Element).closest<HTMLElement>('[data-lb-open]');
    if (!t) return;
    opener = t;
    lb.showModal();
    // Deblocarea scroll-ului la închidere o face main.ts (ascultă „close" pe toate dialogurile).
    document.documentElement.style.overflow = 'hidden';
    window.__lenis?.stop();
    requestAnimationFrame(() => go(Number(t.dataset.lbOpen), false));
  });
  const close = () => lb.close();
  lb.querySelector('[data-lb-close]')?.addEventListener('click', close);
  lb.querySelector('[data-lb-prev]')?.addEventListener('click', () => go(index - 1));
  lb.querySelector('[data-lb-next]')?.addEventListener('click', () => go(index + 1));
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  });
  lb.addEventListener('close', () => opener?.focus());
}
