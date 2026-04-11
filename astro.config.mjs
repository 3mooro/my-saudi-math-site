import { defineConfig } from 'astro/config';
import githubPages from '@astrojs/github-pages';

export default defineConfig({
  // ضع رابط موقعك النهائي هنا (مع اسم المستخدم واسم المستودع)
  site: 'https://3mooro.github.io',
  // ضع اسم المستودع هنا مع شرطة مائلة في البداية والنهاية
  base: '/my-saudi-math-site/',
  integrations: [githubPages()],
});