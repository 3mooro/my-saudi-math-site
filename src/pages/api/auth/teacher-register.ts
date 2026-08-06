export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const name = data.get('name');
  const phone = data.get('phone');
  const subject = data.get('subject');
  const password = data.get('password');

  if (name && phone && subject && password) {
    try {
      const db = env.DB;
      
      // Check if phone already exists
      const existing = await db.prepare('SELECT id FROM teachers WHERE phone = ?').bind(phone).first();
      if (existing) {
        return redirect('/teacher-register?error=exists');
      }

      await db.prepare('INSERT INTO teachers (name, phone, subject, password, session_price, sessions_completed, status) VALUES (?, ?, ?, ?, 0, 0, ?)')
        .bind(name, phone, subject, password, 'pending').run();
      
      return redirect('/teacher-register?success=true');
    } catch (e) {
      console.error("Teacher register error:", e);
    }
  }
  
  return redirect('/teacher-register?error=true');
};
