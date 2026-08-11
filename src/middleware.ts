import { defineMiddleware } from "astro:middleware";
import { env } from 'cloudflare:workers';
import { WHATSAPP_NUMBER as DEFAULT_WHATSAPP } from './consts';

export const onRequest = defineMiddleware(async (context, next) => {
  let siteSettings: any = {
    whatsapp: DEFAULT_WHATSAPP
  };
  
  try {
    const db = context.locals.runtime?.env?.DB || env.DB;
    if (db) {
      const dbSettings = await db.prepare("SELECT * FROM site_settings WHERE id = 1").first();
      if (dbSettings) {
        siteSettings = {
          ...siteSettings,
          ...dbSettings,
          whatsapp: dbSettings.whatsapp_number || DEFAULT_WHATSAPP
        };
      }
    }
  } catch (e) {
    // silently fail and fallback to default
  }

  context.locals.siteSettings = siteSettings;
  context.locals.whatsapp = siteSettings.whatsapp;
  
  return next();
});
