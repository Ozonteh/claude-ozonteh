// Consimțământ GDPR: GA4 = „analiză", Meta Pixel + TikTok Pixel = „marketing".
// Scripturile terților se injectează doar după acord. ID-urile vin din atributele <html data-*>.
import { flushTracking } from './track';

const KEY = 'bull-consent-v1';
type Consent = { analytics: boolean; marketing: boolean; ts: number };
type W = Window & Record<string, any>;

function read(): Consent | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

function inject(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadGA(id: string) {
  const w = window as W;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag('js', new Date());
  w.gtag('config', id, { anonymize_ip: true });
  inject(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
}

function loadMeta(id: string) {
  const w = window as W;
  if (w.fbq) return;
  const fbq: any = function (...args: unknown[]) {
    fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  w.fbq = w._fbq = fbq;
  inject('https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', id);
  fbq('track', 'PageView');
}

function loadTikTok(id: string) {
  const w = window as W;
  if (w.ttq) return;
  const ttq: any = (w.ttq = []);
  ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
  ttq.setAndDefer = (t: any, e: string) => {
    t[e] = (...args: unknown[]) => t.push([e, ...args]);
  };
  ttq.methods.forEach((m: string) => ttq.setAndDefer(ttq, m));
  inject(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=ttq`);
  ttq.page();
}

let applied: Consent | null = null;

function apply(c: Consent) {
  const ds = document.documentElement.dataset;
  if (c.analytics && ds.ga4 && !applied?.analytics) loadGA(ds.ga4);
  if (c.marketing && !applied?.marketing) {
    if (ds.metaPixel) loadMeta(ds.metaPixel);
    if (ds.tiktokPixel) loadTikTok(ds.tiktokPixel);
  }
  applied = c;
  flushTracking(c.analytics || c.marketing);
}

export function initConsent() {
  const banner = document.querySelector<HTMLElement>('[data-consent]');
  if (!banner) return;
  const prefs = banner.querySelector<HTMLElement>('[data-consent-prefs]')!;
  const boxA = banner.querySelector<HTMLInputElement>('[data-consent-analytics]')!;
  const boxM = banner.querySelector<HTMLInputElement>('[data-consent-marketing]')!;
  const btnSettings = banner.querySelector<HTMLButtonElement>('[data-consent-settings]')!;
  const btnSave = banner.querySelector<HTMLButtonElement>('[data-consent-save]')!;

  const save = (c: Omit<Consent, 'ts'>) => {
    const prev = read();
    const next = { ...c, ts: Date.now() };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* stocare indisponibilă: alegerea ține doar pentru pagina curentă */
    }
    banner.hidden = true;
    // Retragerea unui acord dat anterior: scripturile deja încărcate se descarcă doar prin reîncărcare.
    if (prev && ((prev.analytics && !c.analytics) || (prev.marketing && !c.marketing))) location.reload();
    else apply(next);
  };

  const open = (withPrefs: boolean) => {
    const c = read();
    boxA.checked = !!c?.analytics;
    boxM.checked = !!c?.marketing;
    prefs.hidden = !withPrefs;
    btnSave.hidden = !withPrefs;
    btnSettings.hidden = withPrefs;
    btnSettings.setAttribute('aria-expanded', String(withPrefs));
    banner.hidden = false;
  };

  banner.querySelector('[data-consent-accept]')!.addEventListener('click', () => save({ analytics: true, marketing: true }));
  banner.querySelector('[data-consent-necessary]')!.addEventListener('click', () => save({ analytics: false, marketing: false }));
  btnSettings.addEventListener('click', () => open(true));
  btnSave.addEventListener('click', () => save({ analytics: boxA.checked, marketing: boxM.checked }));
  document.querySelectorAll('[data-consent-open]').forEach((b) => b.addEventListener('click', () => open(true)));

  const existing = read();
  if (existing) apply(existing);
  else open(false);
}
