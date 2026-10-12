// Evenimente de conversie: click_call, click_whatsapp, submit_quote, view_product, download_brochure.
// Evenimentele se țin în coadă până la decizia de consimțământ; fără acord nu pleacă nicăieri.
type Params = Record<string, string | number | boolean | undefined>;
type W = Window & {
  gtag?: (...a: unknown[]) => void;
  fbq?: (...a: unknown[]) => void;
  ttq?: { track: (e: string, p?: Params) => void };
};

const queue: [string, Params][] = [];
let ready = false;

function send(event: string, params: Params) {
  const w = window as W;
  w.gtag?.('event', event, params);
  if (w.fbq) {
    if (event === 'submit_quote') w.fbq('track', 'Lead', { content_name: params.model });
    else if (event === 'click_call' || event === 'click_whatsapp') w.fbq('track', 'Contact', { method: event });
    else if (event === 'view_product') w.fbq('track', 'ViewContent', { content_name: params.model });
    else w.fbq('trackCustom', event, params);
  }
  if (w.ttq) {
    if (event === 'submit_quote') w.ttq.track('SubmitForm', { content_name: params.model as string });
    else if (event === 'click_call' || event === 'click_whatsapp') w.ttq.track('Contact');
    else if (event === 'view_product') w.ttq.track('ViewContent', { content_name: params.model as string });
    else w.ttq.track(event, params);
  }
}

export function track(event: string, params: Params = {}) {
  const p = { page_path: location.pathname, page_lang: document.documentElement.lang, ...params };
  if (ready) send(event, p);
  else queue.push([event, p]);
}

/** Apelat de consent.ts după ce s-a decis ce trackere sunt permise. */
export function flushTracking(allowed: boolean) {
  ready = true;
  const items = queue.splice(0);
  if (allowed) items.forEach(([e, p]) => send(e, p));
}

export function initTracking() {
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('a, [data-track]');
      if (!el) return;
      const loc = el.closest<HTMLElement>('[data-track-loc]')?.dataset.trackLoc ?? 'page';
      const href = el.getAttribute('href') ?? '';
      if (href.startsWith('tel:')) track('click_call', { location: loc });
      else if (href.includes('wa.me/')) track('click_whatsapp', { location: loc });
      else if (el.dataset.brochure) track('download_brochure', { model: el.dataset.brochure });
      else if (el.dataset.track) track(el.dataset.track, { location: loc, label: el.dataset.trackLabel });
    },
    { capture: true }
  );
  const viewed = document.body.dataset.viewProduct;
  if (viewed) track('view_product', { model: viewed });
}
