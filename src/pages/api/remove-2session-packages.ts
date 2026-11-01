import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async () => {
  try {
    const db = env.DB;

    // جلب كل الكورسات من قاعدة البيانات
    const { results } = await db.prepare("SELECT slug, packages FROM courses").all();

    if (!results || results.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'No courses found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updated: string[] = [];
    const skipped: string[] = [];

    for (const row of results) {
      const slug = row.slug as string;
      let packages: any[] = [];

      try {
        packages = row.packages ? JSON.parse(row.packages as string) : [];
      } catch {
        skipped.push(slug + ' (JSON parse error)');
        continue;
      }

      // فلتر: شيل أي باقة عدد حصصها أقل من 4 ما عدا الحصص الطارئة (isUrgent)
      const filtered = packages.filter((pkg: any) => {
        if (pkg.isUrgent) return true;          // حصة طارئة تفضل
        return pkg.sessions >= 4;               // شيل أي حاجة أقل من 4 حصص
      });

      const hadTwoSession = packages.some((pkg: any) => !pkg.isUrgent && pkg.sessions < 4);

      if (!hadTwoSession) {
        skipped.push(slug);
        continue;
      }

      // تحديث قاعدة البيانات
      await db
        .prepare("UPDATE courses SET packages = ? WHERE slug = ?")
        .bind(JSON.stringify(filtered), slug)
        .run();

      updated.push(slug);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `✅ تم تحديث ${updated.length} كورس بنجاح`,
        updated,
        skipped,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message ?? String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
