export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const data = await request.formData();
  const name = data.get('name');
  const phone = data.get('phone');
  const password = data.get('password');
  const stage = data.get('stage');
  const grade = data.get('grade');

  if (name && phone && password && stage && grade) {
    try {
      const db = env.DB;
      const res = await db.prepare('INSERT INTO student_accounts (name, phone, password, stage, grade) VALUES (?, ?, ?, ?, ?) RETURNING id')
        .bind(name, phone, password, stage, grade).first();
      
      if (res && res.id) {
        cookies.set('student_auth', res.id.toString(), { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
        return redirect('/student?success=registered');
      }
    } catch (e) {
      console.error("Student register error:", e);
      return redirect('/register?error=true');
    }
  }
  
  return redirect('/register?error=true');
};
