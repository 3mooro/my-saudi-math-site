export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const teacherId = cookies.get('teacher_auth')?.value;
  if (!teacherId) return redirect('/teacher-login');

  try {
    const data = await request.formData();
    const subscriptionId = data.get('subscription_id');
    const studentId = data.get('student_id');
    const datetimeLocal = data.get('scheduled_at'); // format: YYYY-MM-DDTHH:MM

    if (subscriptionId && studentId && datetimeLocal) {
      // Convert local datetime to UTC string before saving
      const dateObj = new Date(datetimeLocal as string);
      const scheduledAtUtc = dateObj.toISOString();

      const db = env.DB;
      await db.prepare('INSERT INTO class_schedules (subscription_id, teacher_id, student_id, scheduled_at) VALUES (?, ?, ?, ?)')
        .bind(subscriptionId, teacherId, studentId, scheduledAtUtc).run();
      
      return redirect('/teacher?success=scheduled');
    }
  } catch (e) {
    console.error("Schedule error:", e);
  }
  return redirect('/teacher?error=schedule_failed');
};
