export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

function resolveAmount(courseName: string, packageName: string): number {
  const isQiyas = /قدرات|تحصيلي/.test(courseName);
  let rate = 35;
  if (isQiyas) rate = 45;
  else if (courseName.includes('ابتدائي')) rate = 25;
  else if (courseName.includes('متوسط')) rate = 30;
  else if (courseName.includes('ثانوي')) rate = 35;
  const m = packageName.match(/\d+/);
  let sessions = m ? parseInt(m[0], 10) : 1;
  if (packageName.includes('طارئة')) {
    sessions = 1;
    if (!isQiyas) {
      if (courseName.includes('ابتدائي')) rate = 35;
      else if (courseName.includes('متوسط')) rate = 40;
      else rate = 50;
    }
  }
  return sessions * rate;
}

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const authCookie = cookies.get('student_auth')?.value;
  if (!authCookie) return redirect('/login');

  const data = await request.formData();
  const subscriptionId = Number(data.get('subscription_id'));
  const receiptData = data.get('receipt_data')?.toString() || '';

  if (!subscriptionId || !receiptData) return redirect('/student?error=payment');
  if (!/^data:(image\/(jpeg|png|webp)|application\/pdf);base64,/.test(receiptData)) return redirect('/student?error=payment');
  if (receiptData.length > 4_000_000) return redirect('/student?error=payment');

  try {
    const db = env.DB;
    const sub = await db
      .prepare('SELECT * FROM course_subscriptions WHERE id = ? AND student_id = ?')
      .bind(subscriptionId, authCookie)
      .first();
    if (!sub) return redirect('/student?error=payment');

    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS payment_receipts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subscription_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          amount INTEGER NOT NULL,
          receipt_data TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TEXT DEFAULT (datetime('now'))
        )`
      )
      .run();

    const amount = resolveAmount(sub.course_name || '', sub.package_name || '');
    await db
      .prepare('INSERT INTO payment_receipts (subscription_id, student_id, amount, receipt_data, status) VALUES (?, ?, ?, ?, ?)')
      .bind(subscriptionId, authCookie, amount, receiptData, 'pending')
      .run();

    return redirect('/student?success=payment_sent');
  } catch (e) {
    console.error('Payment submit error:', e);
    return redirect('/student?error=payment');
  }
};
