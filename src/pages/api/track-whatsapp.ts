import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

// يسجّل نقرة واتساب قادمة من صفحة مقال (slug) لعرض عدد النقرات لكل مقال في لوحة التحكم
export const POST: APIRoute = async ({ request }) => {
  try {
    const db = env.DB;
    if (db) {
      let slug = '';
      try {
        const data: any = await request.json();
        slug = String(data?.slug || '').toLowerCase();
      } catch {}
      if (/^[a-z0-9\-_]+$/.test(slug) && slug.length <= 150) {
        await db.prepare(`CREATE TABLE IF NOT EXISTS whatsapp_clicks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`).run();
        await db.prepare('INSERT INTO whatsapp_clicks (slug) VALUES (?)').bind(slug).run();
      }
    }
  } catch (e) {
    console.error('track-whatsapp error:', e);
  }
  return new Response(null, { status: 204 });
};
