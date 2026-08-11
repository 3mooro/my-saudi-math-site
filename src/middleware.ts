import { defineMiddleware } from "astro:middleware";
import { WHATSAPP_NUMBER as DEFAULT_WHATSAPP } from './consts';

export const onRequest = defineMiddleware(async (context, next) => {
  let siteSettings: any = {
    whatsapp: DEFAULT_WHATSAPP
  };
  
  try {
    // Rely strictly on Astro's runtime locals for Cloudflare
    const db = context.locals.runtime?.env?.DB;
    
    if (db) {
      const dbSettings = await db.prepare("SELECT * FROM site_settings WHERE id = 1").first();
      if (dbSettings) {
        siteSettings = {
          ...siteSettings,
          ...dbSettings,
          whatsapp: dbSettings.whatsapp_number || DEFAULT_WHATSAPP
        };
      }
    } else {
      console.warn("DB binding not found in context.locals.runtime.env");
    }
  } catch (e) {
    console.error("Middleware DB Error:", e);
  }

  context.locals.siteSettings = siteSettings;
  context.locals.whatsapp = siteSettings.whatsapp;
  
  return next();
});
