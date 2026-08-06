export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect, cookies }) => {
  cookies.delete('student_auth', { path: '/' });
  return redirect('/');
};
