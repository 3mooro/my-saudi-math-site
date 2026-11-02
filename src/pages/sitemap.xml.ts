export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ? site.toString().replace(/\/$/, '') : 'https://ksaacademy.online';

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/courses`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/blog`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/about`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${baseUrl}/contact`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/register`, priority: '0.8', changefreq: 'monthly' },
  ];

  let blogUrls: { loc: string; lastmod?: string; priority: string; changefreq: string }[] = [];
  let courseUrls: { loc: string; lastmod?: string; priority: string; changefreq: string }[] = [];

  try {
    const db = env.DB;
    if (db) {
      // Fetch articles
      const { results: blogRows } = await db.prepare("SELECT slug, pubDate, updated_at FROM blog ORDER BY pubDate DESC").all();
      if (blogRows && blogRows.length > 0) {
        blogUrls = blogRows.map((b: any) => {
          let dateStr: string | undefined;
          try {
            const d = new Date(b.updated_at || b.pubDate);
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0];
            }
          } catch (e) {}

          return {
            loc: `${baseUrl}/blog/${b.slug}`,
            lastmod: dateStr,
            priority: '0.85',
            changefreq: 'weekly'
          };
        });
      }

      // Fetch courses
      const { results: courseRows } = await db.prepare("SELECT slug, updated_at, created_at FROM courses ORDER BY id DESC").all();
      if (courseRows && courseRows.length > 0) {
        courseUrls = courseRows.map((c: any) => {
          let dateStr: string | undefined;
          try {
            const d = new Date(c.updated_at || c.created_at);
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0];
            }
          } catch (e) {}

          return {
            loc: `${baseUrl}/courses/${c.slug}`,
            lastmod: dateStr,
            priority: '0.85',
            changefreq: 'weekly'
          };
        });
      }
    }
  } catch (err) {
    console.error("Error generating dynamic sitemap from D1:", err);
  }

  const allUrls = [...staticUrls, ...courseUrls, ...blogUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};
