import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			author: z.string().default('KSA Academy'),
			readingTime: z.string().optional(),
			tags: z.array(z.string()).optional(),
		}),
});

const settings = defineCollection({
	loader: glob({ base: './src/content/settings', pattern: '**/*.json' }),
	schema: z.object({
		siteTitle: z.string(),
		siteDescription: z.string(),
		whatsappNumber: z.string(),
	}),
});

const courses = defineCollection({
	loader: glob({ base: './src/content/courses', pattern: '**/*.json' }),
	schema: z.object({
		title: z.string(),
		instructor: z.string(),
		rating: z.number(),
		price: z.string(),
		image: z.string(),
		tag: z.string(),
		order: z.number().default(0),
	}),
});

export const collections = { blog, settings, courses };
