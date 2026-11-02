export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

// Serves a blog post's hero image as a real, cacheable file.
// Blog images uploaded through the dashboard are stored in D1 as base64
// data: URIs; rendering them inline made /blog a ~4.4MB HTML page.
// Pages now reference /api/blog-image/<slug> instead of the data URI.
// (Added 2026-11-02 as part of the SEO/performance fixes.)
export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) return new Response('Not found', { status: 404 });

  try {
    const db = env.DB;
    if (!db) return new Response('Not found', { status: 404 });

    const row: any = await db
      .prepare('SELECT heroImage FROM blog WHERE slug = ? COLLATE NOCASE')
      .bind(slug)
      .first();

    const hero: string | undefined = row?.heroImage;
    if (!hero) return new Response('Not found', { status: 404 });

    if (hero.startsWith('data:')) {
      const match = hero.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);
      if (!match) return new Response('Bad image data', { status: 400 });
      const mime = match[1] || 'image/jpeg';
      let bytes: Uint8Array;
      if (match[2]) {
        const bin = atob(match[3].replace(/\s/g, ''));
        bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      } else {
        bytes = new TextEncoder().encode(decodeURIComponent(match[3]));
      }
      return new Response(bytes.buffer as ArrayBuffer, {
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        },
      });
    }

    // Already a file path or external URL: send the browser there.
    const target = new URL(hero, 'https://ksaacademy.online');
    return Response.redirect(target.toString(), 302);
  } catch (e) {
    console.error('blog-image error:', e);
    return new Response('Error', { status: 500 });
  }
};
