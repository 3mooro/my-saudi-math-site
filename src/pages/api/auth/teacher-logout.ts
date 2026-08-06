export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ cookies, redirect }) => {
  cookies.delete('teacher_auth', { path: '/' });
  return redirect('/teacher-login');
};
