export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

const KEY = 'ksa-cleanup-bridge-2026';

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
  if (url.searchParams.get('action') !== 'cleanup-bridge') return json({ error: 'unknown action' }, 400);

  const subId = Number(url.searchParams.get('sub'));
  if (!subId) return json({ error: 'missing sub' }, 400);

  try {
    const sub = await db.prepare('SELECT id, student_id FROM course_subscriptions WHERE id = ?').bind(subId).first();
    if (!sub) return json({ ok: false, reason: 'subscription not found (already cleaned?)' });

    const account = await db.prepare('SELECT id, name FROM student_accounts WHERE id = ?').bind(sub.student_id).first();
    if (!account || account.name !== 'طالب اختبار الربط') {
      return json({ ok: false, reason: 'safety guard: not the bridge test account', account });
    }

    const dash = await db.prepare('SELECT id FROM students WHERE site_account_id = ?').bind(account.id).first();
    const deleted: Record<string, any> = {};

    if (dash) {
      deleted.weekly_schedule = (await db.prepare('DELETE FROM weekly_schedule WHERE student_id = ?').bind(dash.id).run()).meta?.changes ?? null;
      deleted.session_schedule = (await db.prepare('DELETE FROM session_schedule WHERE student_id = ?').bind(dash.id).run()).meta?.changes ?? null;
      try { deleted.weekly_exceptions = (await db.prepare('DELETE FROM weekly_schedule_exceptions WHERE student_id = ?').bind(dash.id).run()).meta?.changes ?? null; } catch {}
      deleted.student_teacher = (await db.prepare('DELETE FROM student_teacher WHERE student_id = ?').bind(dash.id).run()).meta?.changes ?? null;
      deleted.payments_log = (await db.prepare('DELETE FROM payments_log WHERE student_id = ?').bind(dash.id).run()).meta?.changes ?? null;
      deleted.students = (await db.prepare('DELETE FROM students WHERE id = ?').bind(dash.id).run()).meta?.changes ?? null;
    }

    deleted.payment_receipts = (await db.prepare('DELETE FROM payment_receipts WHERE subscription_id = ?').bind(subId).run()).meta?.changes ?? null;
    deleted.course_subscriptions = (await db.prepare('DELETE FROM course_subscriptions WHERE id = ?').bind(subId).run()).meta?.changes ?? null;
    deleted.student_accounts = (await db.prepare("DELETE FROM student_accounts WHERE id = ? AND name = 'طالب اختبار الربط'").bind(account.id).run()).meta?.changes ?? null;

    const checkSub = await db.prepare('SELECT id FROM course_subscriptions WHERE id = ?').bind(subId).first();
    const checkAccount = await db.prepare('SELECT id FROM student_accounts WHERE id = ?').bind(account.id).first();
    const checkDash = await db.prepare('SELECT id FROM students WHERE site_account_id = ?').bind(account.id).first();

    return json({
      ok: true,
      dashStudentId: dash?.id ?? null,
      deleted,
      verify: { subscriptionGone: !checkSub, accountGone: !checkAccount, dashStudentGone: !checkDash },
    });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
};
