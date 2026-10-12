import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://bull.ozonteh.md');
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /design-system/',
    '',
    `Sitemap: ${new URL('/sitemap-index.xml', base).href}`,
    `Sitemap: ${new URL('/sitemap-images.xml', base).href}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
