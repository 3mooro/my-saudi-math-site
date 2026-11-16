export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

const KEY = 'ksa-cleanup-testpay-2026';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const GET: APIRoute = async ({ url }) => {
  if (url.searchParams.get('key') !== KEY) return json({ error: 'forbidden' }, 403);
  const db: any = (env as any).DB;
  if (!db) return json({ error: 'DB binding not found' }, 500);
  if (url.searchParams.get('action') !== 'cleanup-test') return json({ error: 'unknown action' }, 400);

  try {
    const sub = await db
      .prepare('SELECT id, student_id FROM course_subscriptions WHERE id = 14')
      .first();
    if (!sub) return json({ ok: false, reason: 'subscription 14 not found (already cleaned?)' });

    const student = await db
      .prepare('SELECT id, name, phone FROM student_accounts WHERE id = ?')
      .bind(sub.student_id)
      .first();
    if (!student || student.name !== 'طالب اختبار تجريبي') {
      return json({ ok: false, reason: 'safety guard: student is not the test account', student });
    }

    const delReceipts = await db
      .prepare('DELETE FROM payment_receipts WHERE subscription_id = 14')
      .run();
    const delSub = await db
      .prepare('DELETE FROM course_subscriptions WHERE id = 14')
      .run();
    const delStudent = await db
      .prepare("DELETE FROM student_accounts WHERE id = ? AND name = 'طالب اختبار تجريبي'")
      .bind(sub.student_id)
      .run();

    const checkSub = await db.prepare('SELECT id FROM course_subscriptions WHERE id = 14').first();
    const checkStudent = await db.prepare('SELECT id FROM student_accounts WHERE id = ?').bind(sub.student_id).first();
    const checkReceipts = await db.prepare('SELECT COUNT(*) AS c FROM payment_receipts WHERE subscription_id = 14').first();

    return json({
      ok: true,
      deleted: {
        receipts: delReceipts.meta?.changes ?? null,
        subscription: delSub.meta?.changes ?? null,
        student: delStudent.meta?.changes ?? null,
      },
      verify: {
        subscriptionGone: !checkSub,
        studentGone: !checkStudent,
        receiptsGone: (checkReceipts?.c ?? -1) === 0,
      },
    });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
};
