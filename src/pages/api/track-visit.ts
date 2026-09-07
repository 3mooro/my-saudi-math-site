import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { env } = await import('cloudflare:workers');
    const db = env?.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'DB not found' }), { status: 500 });
    }

    await db.prepare("UPDATE site_stats SET total_visits = COALESCE(total_visits, 0) + 1 WHERE id = 'global'").run();
    await db.prepare("INSERT INTO visits_log (visited_at) VALUES (CURRENT_TIMESTAMP)").run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
