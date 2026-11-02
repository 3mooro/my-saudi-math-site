export const prerender = false;
import type { APIRoute } from 'astro';

const KEY = 'ksa-seo-7f3q9x-2026';

function getDB(locals: any) {
  return locals?.runtime?.env?.DB;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const GET: APIRoute = async ({ url, locals }) => {
  if (url.searchParams.get('key') !== KEY) return json({ error: 'forbidden' }, 403);
  const db: any = getDB(locals);
  if (!db) return json({ error: 'DB binding not found' }, 500);
  const action = url.searchParams.get('action') || 'list';
  try {
    if (action === 'list') {
      const { results } = await db
        .prepare(
          `SELECT slug, title, description, pubDate, readingTime, tags, length(body) AS bodyLen,
                  (heroImage LIKE 'data:%') AS heroIsData, substr(heroImage,1,60) AS heroHead
           FROM blog ORDER BY pubDate DESC`
        )
        .all();
      return json({ count: results.length, results });
    }
    if (action === 'dump') {
      const slug = url.searchParams.get('slug') || '';
      const row = await db
        .prepare(
          `SELECT slug, title, description, pubDate, readingTime, tags, body,
                  (heroImage LIKE 'data:%') AS heroIsData, length(heroImage) AS heroLen, author
           FROM blog WHERE slug = ?`
        )
        .bind(slug)
        .first();
      if (!row) return json({ error: 'not found', slug }, 404);
      return json(row);
    }
    return json({ error: 'unknown action' }, 400);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};

export const POST: APIRoute = async ({ url, request, locals }) => {
  if (url.searchParams.get('key') !== KEY) return json({ error: 'forbidden' }, 403);
  const db: any = getDB(locals);
  if (!db) return json({ error: 'DB binding not found' }, 500);
  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }
  const action = payload.action;
  try {
    if (action === 'update') {
      const { slug } = payload;
      if (!slug) return json({ error: 'slug required' }, 400);
      const fields: string[] = [];
      const binds: any[] = [];
      for (const col of ['title', 'description', 'body', 'tags', 'readingTime', 'heroImage', 'author']) {
        if (payload[col] !== undefined) {
          fields.push(`${col} = ?`);
          binds.push(payload[col]);
        }
      }
      if (!fields.length) return json({ error: 'nothing to update' }, 400);
      fields.push(`updated_at = datetime('now')`);
      binds.push(slug);
      const res = await db
        .prepare(`UPDATE blog SET ${fields.join(', ')} WHERE slug = ?`)
        .bind(...binds)
        .run();
      return json({ success: true, changes: res.meta?.changes ?? null });
    }
    if (action === 'insert') {
      const a = payload.post;
      if (!a?.slug || !a?.title || !a?.body) return json({ error: 'post.slug/title/body required' }, 400);
      await db
        .prepare(
          `INSERT OR REPLACE INTO blog (slug, title, description, pubDate, heroImage, author, readingTime, tags, body)
           VALUES (?, ?, ?, datetime('now'), ?, ?, ?, ?, ?)`
        )
        .bind(
          a.slug,
          a.title,
          a.description || '',
          a.heroImage || '/og-image.jpg',
          a.author || 'أكاديمية KSA',
          a.readingTime || '7 دقائق',
          a.tags || '[]',
          a.body
        )
        .run();
      return json({ success: true, slug: a.slug });
    }
    if (action === 'delete') {
      const { slug } = payload;
      if (!slug) return json({ error: 'slug required' }, 400);
      const res = await db.prepare(`DELETE FROM blog WHERE slug = ?`).bind(slug).run();
      return json({ success: true, changes: res.meta?.changes ?? null });
    }
    return json({ error: 'unknown action' }, 400);
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
};
