import { defineMiddleware } from "astro:middleware";
import { WHATSAPP_NUMBER as DEFAULT_WHATSAPP } from './consts';

const APEX_HOST = 'ksaacademy.online';
const WWW_HOST = 'www.ksaacademy.online';

const LEGACY_REDIRECTS: Record<string, string> = {
  '/blog/best-teachers-qatari-curriculum': '/',
  '/blog/best-specialized-teachers-qatari-curriculum': '/',
  '/blog/how-to-choose-the-best-private-tutor-saudi-curriculum': '/blog/how-to-choose-the-right-private-tutor-curriculum-in-person-vs-online',
  '/blog/online-private-tutoring-saudi-curriculum-ksa-academy': '/blog/back-to-school-private-tutoring-saudi-curriculum',
  '/blog/english-language-foundation-and-teaching-guide': '/blog/teaching-english-saudi-curriculum-guide',
  '/blog/english-from-zero': '/blog/english-basics',
  '/blog/best-english-teachers-math': '/blog/best-math-teachers-saudi-curriculum',
  '/blog/algebra-basicss': '/blog/algebra-basics',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;

  // --- SEO: canonical domain enforcement (added 2026-11-02) ---
  // 1) www -> apex, http -> https, single 301 to the canonical URL.
  if (url.hostname === WWW_HOST || url.hostname === APEX_HOST) {
    let scheme = url.protocol.replace(':', '');
    const cfVisitor = context.request.headers.get('cf-visitor');
    if (cfVisitor) {
      try { scheme = JSON.parse(cfVisitor).scheme || scheme; } catch {}
    }
    if (url.hostname === WWW_HOST || scheme === 'http') {
      const target = new URL(url.pathname + url.search, `https://${APEX_HOST}`);
      return context.redirect(target.toString(), 301);
    }
    // 1b) Legacy/consolidated posts -> permanent 301 to their canonical home (SEO consolidation 2026-11-02).
    const cleanPath = url.pathname.replace(/\/$/, '').toLowerCase();
    if (LEGACY_REDIRECTS[cleanPath]) {
      const target = new URL(LEGACY_REDIRECTS[cleanPath], `https://${APEX_HOST}`);
      return context.redirect(target.toString(), 301);
    }
    // 2) Uppercase blog/course slugs -> lowercase canonical slug.
    if (/^\/(blog|courses)\//.test(url.pathname) && /[A-Z]/.test(url.pathname)) {
      const target = new URL(url.pathname.toLowerCase() + url.search, `https://${APEX_HOST}`);
      return context.redirect(target.toString(), 301);
    }
  }

  let siteSettings: any = {
    whatsapp: DEFAULT_WHATSAPP
  };
  
  context.locals.siteSettings = siteSettings;
  context.locals.whatsapp = siteSettings.whatsapp;
  
  return next();
});
