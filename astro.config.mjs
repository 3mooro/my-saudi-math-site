import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // رابط موقعك الرسمي
  site: 'https://ksaacademy.online',

  // تفعيل إضافات المقالات وخريطة الموقع
  integrations: [mdx(), sitemap()],

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
  },

  adapter: cloudflare()
});