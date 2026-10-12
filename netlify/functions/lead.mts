// Netlify Function: primește cererile „Cere ofertă" și le trimite în amoCRM (contul Ozonteh).
// Dacă amoCRM nu e configurat sau răspunde cu eroare → e-mail de rezervă către marketing@ozonteh.md (Resend).
// Variabile de mediu: vezi .env.example.

type Lead = {
  name: string;
  phone: string;
  model: string;
  message: string;
  demo: boolean;
  lang: 'ro' | 'ru';
  page: string;
  source: Record<string, string>;
};

const env = (k: string) => (globalThis as { Netlify?: { env: { get(k: string): string | undefined } } }).Netlify?.env.get(k) ?? process.env[k] ?? '';
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function normalize(data: Record<string, unknown>): Lead | null {
  const name = str(data.name, 80);
  let digits = String(data.phone ?? '').replace(/\D/g, '');
  if (digits.startsWith('373')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (name.length < 2 || !/^[2-9]\d{7}$/.test(digits)) return null;
  const src = typeof data.source === 'object' && data.source ? (data.source as Record<string, unknown>) : {};
  const source: Record<string, string> = {};
  for (const [k, v] of Object.entries(src).slice(0, 12)) if (typeof v === 'string') source[k.slice(0, 30)] = v.slice(0, 200);
  return {
    name,
    phone: `+373${digits}`,
    model: str(data.model, 80),
    message: str(data.message, 1500),
    demo: data.demo === true || data.demo === '1' || data.demo === 'on',
    lang: data.lang === 'ru' ? 'ru' : 'ro',
    page: str(data.page, 300),
    source,
  };
}

export function summary(l: Lead) {
  return [
    `Cerere ofertă BULL Moldova${l.demo ? ' + DEMONSTRAȚIE' : ''}`,
    `Nume: ${l.name}`,
    `Telefon: ${l.phone}`,
    `Model: ${l.model || 'nespecificat'}`,
    l.message && `Mesaj: ${l.message}`,
    `Limba: ${l.lang.toUpperCase()}`,
    `Pagina: ${l.page}`,
    Object.keys(l.source).length ? `Sursă: ${Object.entries(l.source).map(([k, v]) => `${k}=${v}`).join(', ')}` : 'Sursă: direct',
  ]
    .filter(Boolean)
    .join('\n');
}

async function toAmoCrm(l: Lead): Promise<boolean> {
  const base = env('AMOCRM_BASE_URL');
  const token = env('AMOCRM_ACCESS_TOKEN');
  const webhook = env('LEAD_WEBHOOK_URL');
  if (webhook) {
    // Alternativă: webhook (ex. integrare amoCRM / Make) care primește lead-ul ca JSON.
    const r = await fetch(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...l, text: summary(l) }) });
    if (!r.ok) throw new Error(`webhook ${r.status}`);
    return true;
  }
  if (!base || !token) return false;
  const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
  const tags = [{ name: 'site-bull' }, { name: l.demo ? 'demonstratie' : 'oferta' }, { name: `lang-${l.lang}` }];
  if (l.source.utm_source) tags.push({ name: `utm-${l.source.utm_source}`.slice(0, 50) });
  const lead: Record<string, unknown> = {
    name: `BULL ${l.model || 'cerere'}: ${l.name}`.slice(0, 250),
    _embedded: {
      tags,
      contacts: [
        {
          first_name: l.name,
          custom_fields_values: [{ field_code: 'PHONE', values: [{ value: l.phone, enum_code: 'WORK' }] }],
        },
      ],
    },
  };
  const pipeline = Number(env('AMOCRM_PIPELINE_ID'));
  const status = Number(env('AMOCRM_STATUS_ID'));
  const responsible = Number(env('AMOCRM_RESPONSIBLE_USER_ID'));
  if (pipeline) lead.pipeline_id = pipeline;
  if (status) lead.status_id = status;
  if (responsible) lead.responsible_user_id = responsible;

  const r = await fetch(`${base.replace(/\/$/, '')}/api/v4/leads/complex`, { method: 'POST', headers, body: JSON.stringify([lead]) });
  if (!r.ok) throw new Error(`amoCRM ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const [created] = (await r.json()) as { id: number }[];
  if (created?.id) {
    await fetch(`${base.replace(/\/$/, '')}/api/v4/leads/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify([{ entity_id: created.id, note_type: 'common', params: { text: summary(l) } }]),
    }).catch(() => undefined);
  }
  return true;
}

async function toEmail(l: Lead): Promise<boolean> {
  const key = env('RESEND_API_KEY');
  if (!key) return false;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env('LEAD_EMAIL_FROM') || 'BULL Moldova <site@bull.ozonteh.md>',
      to: [env('LEAD_EMAIL_TO') || 'marketing@ozonteh.md'],
      subject: `${l.demo ? '[DEMO] ' : ''}Cerere ofertă ${l.model || 'BULL'}: ${l.name} ${l.phone}`,
      text: summary(l),
    }),
  });
  if (!r.ok) throw new Error(`email ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return true;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  const isJson = (req.headers.get('content-type') ?? '').includes('application/json');
  let data: Record<string, unknown>;
  try {
    data = isJson ? await req.json() : Object.fromEntries(await req.formData());
  } catch {
    return json({ ok: false, error: 'body' }, 400);
  }
  const back = (state: string) => {
    const ref = req.headers.get('referer') ?? '/';
    const u = new URL(ref, req.url);
    u.searchParams.set('cerere', state);
    u.hash = 'oferta';
    return Response.redirect(u.href, 303);
  };

  // Honeypot: boții completează câmpul ascuns „website" → răspundem „ok" fără să trimitem nimic.
  if (str(data.website, 200)) return isJson ? json({ ok: true }) : back('trimisa');

  const lead = normalize(data);
  if (!lead) return isJson ? json({ ok: false, error: 'invalid' }, 422) : back('eroare');

  let crm = false;
  let email = false;
  try {
    crm = await toAmoCrm(lead);
  } catch (e) {
    console.error('[lead] amoCRM:', (e as Error).message);
  }
  if (!crm) {
    try {
      email = await toEmail(lead);
    } catch (e) {
      console.error('[lead] e-mail:', (e as Error).message);
    }
  }
  if (!crm && !email) {
    console.error('[lead] PIERDUT — niciun canal configurat/funcțional:', summary(lead));
    return isJson ? json({ ok: false, error: 'delivery' }, 502) : back('eroare');
  }
  return isJson ? json({ ok: true, via: crm ? 'crm' : 'email' }) : back('trimisa');
};

export const config = { path: '/api/lead' };
