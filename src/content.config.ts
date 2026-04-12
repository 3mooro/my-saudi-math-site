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
	loader: glob({ base: './src/content/courses', pattern: '**/*.{json,md}' }),
	schema: z.object({
		title: z.string(),
		instructor: z.string(),
		rating: z.number(),
		image: z.string(),
		tag: z.string(),
		level: z.enum(['primary', 'middle', 'secondary', 'university', 'other']).default('secondary'),
		order: z.number().default(0),
		description: z.string().optional(),
		packages: z.array(z.object({
			name: z.string(),
			sessions: z.number(),
			pricePerSession: z.number(),
			totalPrice: z.number(),
			features: z.array(z.string()),
			isUrgent: z.boolean().default(false)
		})).optional(),
	}),
});

const faq = defineCollection({
	loader: glob({ base: './src/content/faq', pattern: '**/*.json' }),
	schema: z.object({
		question: z.string(),
		answer: z.string(),
		order: z.number().default(0),
	}),
});

const testimonials = defineCollection({
	loader: glob({ base: './src/content/testimonials', pattern: '**/*.json' }),
	schema: z.object({
		name: z.string(),
		role: z.string(),
		feedback: z.string(),
		avatar: z.string(),
		order: z.number().default(0),
	}),
});

const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '**/*.json' }),
	schema: z.object({
		title: z.string(),
		missionTitle: z.string(),
		missionDescription: z.string(),
		aboutTitle: z.string(),
		aboutDescription: z.string(),
		valuesTitle: z.string(),
		values: z.array(z.string()),
		teachersTitle: z.string().optional(),
		teachers: z.array(z.object({
			name: z.string(),
			role: z.string(),
			image: z.string()
		})).optional(),
		ctaTitle: z.string(),
		ctaDescription: z.string(),
	}),
});

const stats = defineCollection({
	loader: glob({ base: './src/content/stats', pattern: '**/*.json' }),
	schema: z.object({
		label: z.string(),
		value: z.string(),
		icon: z.string(),
		order: z.number().default(0),
	}),
});

export const collections = { blog, settings, courses, faq, testimonials, pages, stats };
