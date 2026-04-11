import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // رابط الدومين الخاص بك
  site: 'https://ksaacademy.online',
  
  // تفعيل إضافات القالب الأساسية
  integrations: [mdx(), sitemap()],
});