export const prerender = false;

export async function GET(context: any) {
  let output: any = {};
  
  output.hasRuntime = !!context.locals.runtime;
  output.hasEnv = !!context.locals.runtime?.env;
  output.hasDB = !!context.locals.runtime?.env?.DB;

  try {
    if (output.hasDB) {
      const db = context.locals.runtime.env.DB;
      const settings = await db.prepare("SELECT * FROM site_settings WHERE id = 1").first();
      output.settings = settings;
    }
  } catch (e: any) {
    output.error = e.message;
  }

  return new Response(JSON.stringify(output), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}
