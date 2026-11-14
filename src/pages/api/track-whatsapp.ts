import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

// يسجّل نقرة واتساب من أي صفحة في الموقع:
// 1) يزيد دائماً العدّاد العام في site_stats (هو الرقم الظاهر في بطاقة «نقرات الواتساب» بالصفحة الرئيسية للوحة التحكم)
// 2) إذا وصل slug مقال صالح في جسم الطلب (من صفحات المقالات) يسجّل النقرة أيضاً في whatsapp_clicks
//    لعرض عدد النقرات لكل مقال في لوحة التحكم
export const POST: APIRoute = async ({ request }) => {
  try {
    const db = env.DB;
    if (db) {
      let slug = '';
      try {
        const data: any = await request.json();
        slug = String(data?.slug || '').toLowerCase();
      } catch {}

      // العدّاد العام — كل نقرة واتساب من أي صفحة
      try {
        await db.prepare("UPDATE site_stats SET whatsapp_clicks = COALESCE(whatsapp_clicks, 0) + 1 WHERE id = 'global'").run();
      } catch (e) {
        console.error('track-whatsapp stats error:', e);
      }

      // إسناد النقرة لمقال معيّن (اختياري — من صفحات المقالات فقط)
      if (/^[a-z0-9_-]+$/.test(slug) && slug.length <= 150) {
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
