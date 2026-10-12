// Formular „Cere ofertă": mască +373, validare inline, trimitere fără reîncărcare.
import { track } from './track';

const SRC_KEY = 'bull-src';

/** Prima sursă a vizitei (UTM, click id, referrer) — trimisă cu lead-ul în CRM. */
export function captureSource() {
  try {
    if (sessionStorage.getItem(SRC_KEY)) return;
    const q = new URLSearchParams(location.search);
    const src: Record<string, string> = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid']) {
      const v = q.get(k);
      if (v) src[k] = v.slice(0, 120);
    }
    if (document.referrer && !document.referrer.startsWith(location.origin)) src.referrer = document.referrer.slice(0, 200);
    src.landing = location.pathname;
    sessionStorage.setItem(SRC_KEY, JSON.stringify(src));
  } catch {
    /* sessionStorage indisponibil */
  }
}

const digits = (s: string) => s.replace(/\D/g, '');

/** Normalizează la cele 8 cifre naționale (acceptă +373…, 373…, 0…). */
export function nationalDigits(raw: string) {
  let d = digits(raw);
  if (d.startsWith('373')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 8);
}

const formatPhone = (d: string) => [d.slice(0, 2), d.slice(2, 5), d.slice(5, 8)].filter(Boolean).join(' ');
const validPhone = (d: string) => /^[2-9]\d{7}$/.test(d);

function setError(form: HTMLFormElement, name: string, show: boolean) {
  const input = form.elements.namedItem(name) as HTMLInputElement | null;
  const out = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
  if (!input || !out) return;
  input.setAttribute('aria-invalid', String(show));
  out.textContent = show ? (out.dataset.msg ?? '') : '';
}

function validate(form: HTMLFormElement, field?: string) {
  const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
  const phone = nationalDigits((form.elements.namedItem('phone') as HTMLInputElement).value);
  const okName = name.length >= 2;
  const okPhone = validPhone(phone);
  if (!field || field === 'name') setError(form, 'name', !okName);
  if (!field || field === 'phone') setError(form, 'phone', !okPhone);
  return okName && okPhone;
}

function bind(form: HTMLFormElement) {
  const phone = form.querySelector<HTMLInputElement>('[data-phone]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const success = form.querySelector<HTMLElement>('[data-success]')!;
  const touched = new Set<string>();

  phone.addEventListener('input', () => {
    const d = nationalDigits(phone.value);
    phone.value = formatPhone(d);
    if (touched.has('phone')) validate(form, 'phone');
  });
  for (const n of ['name', 'phone']) {
    const el = form.elements.namedItem(n) as HTMLInputElement;
    el.addEventListener('blur', () => {
      if (!el.value) return;
      touched.add(n);
      validate(form, n);
    });
    el.addEventListener('input', () => touched.has(n) && validate(form, n));
  }

  form.querySelector('[data-reset]')?.addEventListener('click', () => {
    form.reset();
    form.removeAttribute('data-state');
    success.hidden = true;
    (form.elements.namedItem('name') as HTMLInputElement).focus();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    touched.add('name').add('phone');
    status.textContent = '';
    if (!validate(form)) {
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    const fd = new FormData(form);
    const model = String(fd.get('model') || '');
    const payload = {
      name: String(fd.get('name') || '').trim(),
      phone: `+373${nationalDigits(String(fd.get('phone') || ''))}`,
      model,
      message: String(fd.get('message') || '').trim(),
      demo: fd.get('demo') === '1',
      lang: String(fd.get('lang') || document.documentElement.lang),
      page: location.href,
      source: (() => {
        try {
          return JSON.parse(sessionStorage.getItem(SRC_KEY) || '{}');
        } catch {
          return {};
        }
      })(),
      website: String(fd.get('website') || ''),
    };

    submit.disabled = true;
    submit.querySelector<HTMLElement>('[data-label]')!.hidden = true;
    submit.querySelector<HTMLElement>('[data-label-sending]')!.hidden = false;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.dataset.state = 'success';
      success.hidden = false;
      success.focus();
      track('submit_quote', { model: model || 'nespecificat', demo: payload.demo });
    } catch {
      status.textContent = status.dataset.error ?? '';
    } finally {
      submit.disabled = false;
      submit.querySelector<HTMLElement>('[data-label]')!.hidden = false;
      submit.querySelector<HTMLElement>('[data-label-sending]')!.hidden = true;
    }
  });
}

export function initForms() {
  captureSource();
  const forms = [...document.querySelectorAll<HTMLFormElement>('[data-quote-form]')];
  forms.forEach(bind);
  // Revenire după trimitere fără JS (redirect 303 din /api/lead cu ?cerere=trimisa|eroare)
  const state = new URLSearchParams(location.search).get('cerere');
  const target = document.querySelector<HTMLFormElement>('#oferta [data-quote-form]') ?? forms[0];
  if (state && target) {
    if (state === 'trimisa') {
      target.dataset.state = 'success';
      target.querySelector<HTMLElement>('[data-success]')!.hidden = false;
    } else {
      const status = target.querySelector<HTMLElement>('[data-status]')!;
      status.textContent = status.dataset.error ?? '';
    }
    history.replaceState(null, '', location.pathname + location.hash);
  }
}
