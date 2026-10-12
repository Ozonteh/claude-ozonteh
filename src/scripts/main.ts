// Script global: header, meniu, dialog „Cere ofertă", reveal la scroll, butoane magnetice,
// smooth scroll (Lenis, doar desktop), tranziții între pagini (fallback), consimțământ și tracking.
import { initConsent } from './consent';
import { initTracking } from './track';
import { initForms } from './form';

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
type LenisLike = { stop(): void; start(): void; on(e: string, cb: () => void): void; scrollTo(t: unknown, o?: unknown): void };
declare global {
  interface Window {
    __lenis?: LenisLike;
  }
}

/* ---------- Header: fundal la scroll + ascundere la derulare în jos ---------- */
const header = document.querySelector<HTMLElement>('[data-header]');
let lastY = scrollY;
let ticking = false;
function onScroll() {
  const y = scrollY;
  if (header) {
    header.toggleAttribute('data-scrolled', y > 24);
    const down = y > lastY + 4;
    const up = y < lastY - 4;
    if (down && y > 640) header.setAttribute('data-hidden', '');
    else if (up || y < 640) header.removeAttribute('data-hidden');
  }
  lastY = y;
  ticking = false;
}
addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });
onScroll();

/* ---------- Dialoguri (meniu + cerere ofertă) ---------- */
function lock(on: boolean) {
  html.style.overflow = on ? 'hidden' : '';
  if (on) window.__lenis?.stop();
  else window.__lenis?.start();
}
function openDialog(d: HTMLDialogElement | null) {
  if (!d || d.open) return;
  d.showModal();
  lock(true);
}
function closeDialog(d: HTMLDialogElement | null) {
  if (d?.open) d.close();
}
document.querySelectorAll('dialog').forEach((d) => {
  d.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) lock(false);
  });
  d.addEventListener('click', (e) => {
    if (e.target === d) closeDialog(d);
  });
});

const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
const quote = document.querySelector<HTMLDialogElement>('[data-quote-dialog]');

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-menu-open]')) openDialog(menu);
  if (t.closest('[data-menu-close]')) closeDialog(menu);
  if (t.closest('[data-quote-close]')) closeDialog(quote);
  const q = t.closest<HTMLElement>('[data-quote]');
  if (q && quote) {
    e.preventDefault();
    const form = quote.querySelector<HTMLFormElement>('form')!;
    const select = form.querySelector<HTMLSelectElement>('[data-model-select]');
    const modelId = q.dataset.model;
    const opt = modelId ? select?.querySelector<HTMLOptionElement>(`option[data-id="${CSS.escape(modelId)}"]`) : null;
    if (select && opt) select.value = opt.value;
    const demo = form.querySelector<HTMLInputElement>('[data-demo-check]');
    if (demo && q.hasAttribute('data-demo')) demo.checked = true;
    closeDialog(menu);
    openDialog(quote);
  }
  // linkurile din meniu închid meniul (navigarea în aceeași pagină, ex. ancore)
  if (menu?.open && t.closest('a[href]') && menu.contains(t)) closeDialog(menu);
});

/* ---------- Reveal la scroll ---------- */
const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

/* ---------- Butoane magnetice (desktop) ---------- */
if (finePointer && !reduce) {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.setProperty('--mx', `${(x * 0.22).toFixed(1)}px`);
      el.style.setProperty('--my', `${(y * 0.32).toFixed(1)}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    });
  });
}

/* ---------- Smooth scroll (doar desktop, nu pe touch) ---------- */
if (finePointer && !reduce && innerWidth >= 1024) {
  import('lenis').then(({ default: Lenis }) => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: { offset: -90 } });
    window.__lenis = lenis as unknown as LenisLike;
    if (document.querySelector('dialog[open]')) lenis.stop();
    document.dispatchEvent(new CustomEvent('lenis:ready'));
  });
}

/* ---------- Tranziții între pagini: fallback pentru browsere fără View Transitions ---------- */
const supportsVT = 'onpagereveal' in window;
if (!supportsVT && !reduce) {
  const ENTER = 'bull-vt';
  try {
    if (sessionStorage.getItem(ENTER)) {
      sessionStorage.removeItem(ENTER);
      const band = document.createElement('div');
      band.className = 'vt-fallback is-entering';
      document.body.appendChild(band);
      band.addEventListener('animationend', () => band.remove());
    }
  } catch {
    /* fără sessionStorage: fără bandă la intrare */
  }
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-no-vt')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    const band = document.createElement('div');
    band.className = 'vt-fallback is-leaving';
    document.body.appendChild(band);
    try {
      sessionStorage.setItem(ENTER, '1');
    } catch {
      /* ignorat */
    }
    setTimeout(() => (location.href = url.href), 360);
  });
  addEventListener('pageshow', (e) => {
    if (e.persisted) document.querySelectorAll('.vt-fallback').forEach((b) => b.remove());
  });
}

initTracking();
initConsent();
initForms();
