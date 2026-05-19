import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const name = data.get('name');
  const phone = data.get('phone');
  const course = data.get('course');

  if (name && phone) {
    try {
      const db = env.DB;
      await db.prepare('INSERT INTO leads (customer_name, phone, course_requested) VALUES (?, ?, ?)')
        .bind(name, phone, course || 'عام').run();
      
      return redirect('/?success=true#courses');
    } catch (e) {
      console.error("Lead insert error:", e);
    }
  }
  
  return redirect('/?error=true#courses');
};