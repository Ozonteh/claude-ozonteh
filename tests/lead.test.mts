// Teste pentru funcția de lead (fără rețea: fetch e simulat). Rulare: npm test
import handler, { normalize } from '../netlify/functions/lead.mts';
const calls: { url: string; body: string }[] = [];
let failCrm = false;
globalThis.fetch = (async (url: string, init: RequestInit) => {
  calls.push({ url: String(url), body: String(init.body) });
  if (String(url).includes('amocrm') && failCrm) return new Response('err', { status: 500 });
  if (String(url).includes('leads/complex')) return new Response(JSON.stringify([{ id: 42 }]), { status: 200 });
  return new Response('{}', { status: 200 });
}) as typeof fetch;
const post = (body: unknown, ct = 'application/json') => handler(new Request('https://x.test/api/lead', { method: 'POST', headers: { 'content-type': ct, referer: 'https://x.test/' }, body: ct.includes('json') ? JSON.stringify(body) : (body as string) }));
const base = { name: 'Ion Popescu', phone: '+373 69 898 307', model: 'BULL HD 100', message: 'Test', demo: true, lang: 'ro', page: 'https://x.test/', source: { utm_source: 'facebook' }, website: '' };
const assert = (c: boolean, m: string) => { if (!c) { console.error('FAIL', m); process.exitCode = 1; } else console.log('ok  ', m); };

assert(normalize({ name: 'A', phone: '069898307' }) === null, 'nume prea scurt respins');
assert(normalize({ name: 'Ion', phone: '12345' }) === null, 'telefon invalid respins');
assert(normalize({ name: 'Ion', phone: '069 898 307' })?.phone === '+37369898307', 'telefon 0XX normalizat');
assert(normalize({ name: 'Ion', phone: '37369898307' })?.phone === '+37369898307', 'telefon 373 normalizat');

let r = await post(base);
assert(r.status === 502, 'fără configurare → 502 (lead nelivrat semnalat)');

process.env.AMOCRM_BASE_URL = 'https://ozonteh.amocrm.ru';
process.env.AMOCRM_ACCESS_TOKEN = 't';
calls.length = 0;
r = await post(base);
assert(r.status === 200 && (await r.json()).via === 'crm', 'amoCRM → 200 via crm');
assert(calls[0].url.endsWith('/api/v4/leads/complex') && calls[0].body.includes('+37369898307') && calls[0].body.includes('demonstratie'), 'payload amoCRM corect');
assert(calls[1]?.url.endsWith('/api/v4/leads/notes') && calls[1].body.includes('utm_source=facebook'), 'notă cu sursa UTM');

failCrm = true;
process.env.RESEND_API_KEY = 'k';
calls.length = 0;
r = await post(base);
assert(r.status === 200 && (await r.json()).via === 'email', 'amoCRM eșuat → e-mail de rezervă');
assert(calls.some((c) => c.url.includes('resend') && c.body.includes('marketing@ozonteh.md')), 'e-mail către marketing@ozonteh.md');

calls.length = 0;
r = await post({ ...base, website: 'spam' });
assert(r.status === 200 && calls.length === 0, 'honeypot: nimic trimis');

r = await post('name=Ion&phone=069898307&lang=ro', 'application/x-www-form-urlencoded');
assert(r.status === 303 && (r.headers.get('location') ?? '').includes('cerere=trimisa'), 'fără JS: redirect 303 înapoi');
r = await post({ ...base, phone: '123' });
assert(r.status === 422, 'telefon invalid → 422');
