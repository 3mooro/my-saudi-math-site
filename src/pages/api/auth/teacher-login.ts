export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const data = await request.formData();
  const phone = data.get('phone')?.toString() || '';
  const countryCode = data.get('countryCode')?.toString() || '966';
  const password = data.get('password');

  if (phone && password) {
    try {
      const db = env.DB;
      
      // Clean phone and handle leading zero
      let cleanPhone = phone.replace(/\D/g, '');
      let cleanPhoneWithoutZero = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
      
      // Combinations to check (to support old and new formats)
      let fullPhone = countryCode + cleanPhoneWithoutZero;
      let rawPhone = phone.trim();

      const teacher = await db.prepare(`
        SELECT id, password FROM teachers 
        WHERE phone = ? OR phone = ? OR phone = ? OR phone = ?
      `).bind(fullPhone, cleanPhone, cleanPhoneWithoutZero, rawPhone).first<{id: number, password: string}>();
      
      // Allow fallback login with '123456' if password is not set or matches
      if (teacher && (!teacher.password && password === '123456' || teacher.password === password)) {
        cookies.set('teacher_auth', teacher.id.toString(), { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
        return redirect('/teacher');
      }
    } catch (e) {
      console.error("Teacher login error:", e);
    }
  }
  
  return redirect('/teacher-login?error=true');
};
