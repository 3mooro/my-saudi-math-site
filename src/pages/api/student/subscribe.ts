export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const authCookie = cookies.get('student_auth')?.value;
  if (!authCookie) return redirect('/login');

  const data = await request.formData();
  const course_name = data.get('course_name');
  const package_name = data.get('package_name');

  if (course_name && package_name) {
    try {
      const db = env.DB;
      await db.prepare('INSERT INTO course_subscriptions (student_id, course_name, package_name, status) VALUES (?, ?, ?, ?)')
        .bind(authCookie, course_name, package_name, 'pending').run();
      
      return redirect('/student?success=subscribed');
    } catch (e) {
      console.error("Student subscribe error:", e);
    }
  }
  
  return redirect('/student?error=true');
};
