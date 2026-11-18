export const prerender = false;
import type { APIRoute } from 'astro';

// Returns the visitor's country as seen by Cloudflare (CF-IPCountry header),
// used by the layout script to show prices in AED for UAE visitors and SAR otherwise.
export const GET: APIRoute = async ({ request }) => {
  const country = request.headers.get('CF-IPCountry') || '';
  return new Response(JSON.stringify({ country }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
};
