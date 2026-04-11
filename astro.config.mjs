import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

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
    }
  ]
});