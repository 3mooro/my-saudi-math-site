import { defineMiddleware } from "astro:middleware";
import { WHATSAPP_NUMBER as DEFAULT_WHATSAPP } from './consts';

export const onRequest = defineMiddleware(async (context, next) => {
  let siteSettings: any = {
    whatsapp: DEFAULT_WHATSAPP
  };
  
  try {
    // Fetch settings from the dashboard API since D1 binding might not be configured
    const response = await fetch('https://ksa-dashboard.pages.dev/api/settings');
    if (response.ok) {
      const dbSettings = await response.json();
      if (dbSettings && dbSettings.whatsapp_number) {
        siteSettings = {
          ...siteSettings,
          ...dbSettings,
          whatsapp: dbSettings.whatsapp_number || DEFAULT_WHATSAPP
        };
      }
    }
  } catch (e) {
    console.error("Middleware API Fetch Error:", e);
  }

  context.locals.siteSettings = siteSettings;
  context.locals.whatsapp = siteSettings.whatsapp;
  
  return next();
});
