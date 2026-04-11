import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // رابط موقعك الرسمي
  site: 'https://ksaacademy.online',

  // تفعيل إضافات المقالات وخريطة الموقع
  integrations: [mdx(), sitemap()],

  // استعادة إعدادات الخطوط التي يبحث عنها القالب
  fonts: [
    {
      name: 'Atkinson Hyperlegible',
      provider: fontProviders.google(),
      cssVariable: '--font-atkinson',
    },
    {
      name: 'Inter',
      provider: fontProviders.google(),
      cssVariable: '--font-inter',
    },
    {
      name: 'Poppins',
      provider: fontProviders.google(),
      cssVariable: '--font-poppins',
    }
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});