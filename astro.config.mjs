import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // رابط موقعك الرسمي
  site: 'https://ksaacademy.online',

  // SEO (2026-11-02): the ONLY sitemap is the dynamic /sitemap.xml route
  // (src/pages/sitemap.xml.ts). The @astrojs/sitemap integration was removed
  // because it generated a conflicting /sitemap-index.xml with trailing-slash
  // URLs and non-indexable pages (login, student, teacher...).
  integrations: [mdx()],

  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: 'wrangler.dev.json'
    }
  }),

  // استعادة إعدادات الخطوط التي يبحث عنها القالب
  fonts: [
    {
      name: 'Cairo',
      provider: fontProviders.google(),
      cssVariable: '--font-cairo',
    },
    {
      name: 'Tajawal',
      provider: fontProviders.google(),
      cssVariable: '--font-tajawal',
    }
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});