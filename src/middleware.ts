import { defineMiddleware } from "astro:middleware";
import { WHATSAPP_NUMBER as DEFAULT_WHATSAPP } from './consts';

export const onRequest = defineMiddleware(async (context, next) => {
  let siteSettings: any = {
    whatsapp: DEFAULT_WHATSAPP
  };
  
  context.locals.siteSettings = siteSettings;
  context.locals.whatsapp = siteSettings.whatsapp;
  
  return next();
});
