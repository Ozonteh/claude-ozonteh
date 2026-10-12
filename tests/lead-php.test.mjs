// Test pentru public/api/lead.php (varianta cPanel): pornește `php -S` și un server amoCRM simulat.
// Rulare: npm run test:php   (necesită PHP 7.4+ cu curl în PATH; se sare automat dacă lipsește)
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

if (spawnSync('php', ['-v']).status !== 0) {
  console.log('PHP nu e instalat — test sărit.');
  process.exit(0);
}

const calls = [];
let failCrm = false;
const mock = createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    calls.push({ url: req.url, body, auth: req.headers.authorization });
    if (failCrm) return res.writeHead(500).end('err');
    if (req.url.endsWith('/leads/complex')) return res.writeHead(200, { 'content-type': 'application/json' }).end('[{"id":42}]');
    res.writeHead(200).end('{}');
  });
});
await new Promise((r) => mock.listen(4391, r));

const dir = mkdtempSync(join(tmpdir(), 'bull-lead-'));
const cfg = join(dir, 'bull-config.php');
const writeCfg = (o) => writeFileSync(cfg, `<?php return ${JSON.stringify(o).replace(/\{/g, '[').replace(/\}/g, ']').replace(/":/g, '" =>')};`);
writeCfg({ amocrm_base_url: 'http://127.0.0.1:4391', amocrm_access_token: 'tok', email_to: '' });

const php = spawn('php', ['-S', '127.0.0.1:4392', '-t', 'public'], { env: { ...process.env, BULL_CONFIG: cfg }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));

const post = (body, ct = 'application/json') =>
  fetch('http://127.0.0.1:4392/api/lead.php', { method: 'POST', redirect: 'manual', headers: { 'content-type': ct, referer: 'https://bull.ozonteh.md/ru/' }, body: ct.includes('json') ? JSON.stringify(body) : body });
const ok = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) process.exitCode = 1; };
const base = { name: 'Ion Popescu', phone: '069 898 307', model: 'BULL HD 100', message: 'Test', demo: true, lang: 'ro', page: 'https://bull.ozonteh.md/', source: { utm_source: 'facebook' }, website: '' };

try {
  let r = await post(base);
  let j = await r.json();
  ok(r.status === 200 && j.via === 'crm', 'amoCRM → 200 via crm');
  ok(calls[0]?.url === '/api/v4/leads/complex' && calls[0].auth === 'Bearer tok', 'leads/complex cu token');
  ok(calls[0]?.body.includes('+37369898307') && calls[0].body.includes('demonstratie') && calls[0].body.includes('utm-facebook'), 'payload: telefon normalizat, tag-uri');
  ok(calls[1]?.url === '/api/v4/leads/notes' && calls[1].body.includes('utm_source=facebook'), 'notă cu sursa UTM');

  calls.length = 0;
  r = await post({ ...base, demo: false, request: 'service' });
  ok(r.status === 200 && calls[0]?.body.includes('service-service') && calls[1]?.body.includes('Solicitare service'), 'solicitare service: tag și titlu');
  calls.length = 0;
  r = await post({ ...base, demo: false, request: 'hack' });
  ok(r.status === 200 && calls[0]?.body.includes('"oferta"'), 'tip de solicitare necunoscut → ofertă');

  r = await post({ ...base, phone: '123' });
  ok(r.status === 422, 'telefon invalid → 422');

  calls.length = 0;
  r = await post({ ...base, website: 'spam' });
  ok(r.status === 200 && calls.length === 0, 'honeypot: nimic trimis');

  failCrm = true;
  r = await post(base);
  ok(r.status === 502, 'amoCRM eșuat + fără e-mail configurat → 502');

  r = await post('name=Ion&phone=069898307&lang=ru', 'application/x-www-form-urlencoded');
  ok(r.status === 303 && (r.headers.get('location') ?? '').startsWith('/ru/?cerere=eroare'), 'fără JS: redirect 303 înapoi pe pagina din care a venit');

  r = await fetch('http://127.0.0.1:4392/api/lead.php');
  ok(r.status === 405, 'GET → 405');
} finally {
  php.kill();
  mock.close();
}
