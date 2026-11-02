import { defineMiddleware } from "astro:middleware";
import { WHATSAPP_NUMBER as DEFAULT_WHATSAPP } from './consts';

const APEX_HOST = 'ksaacademy.online';
const WWW_HOST = 'www.ksaacademy.online';

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
