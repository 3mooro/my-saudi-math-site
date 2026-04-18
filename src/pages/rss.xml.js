import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { env } from 'cloudflare:workers';

export async function GET(context) {
	let posts = [];
	try {
		const db = env.DB;
		const { results } = await db.prepare("SELECT * FROM blog ORDER BY pubDate DESC").all();
		if (results) posts = results;
	} catch (e) {
		console.error("D1 Fetch Error:", e);
	}

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.description,
			pubDate: new Date(post.pubDate),
			link: `/blog/${post.slug}/`,
		})),
	});
}
