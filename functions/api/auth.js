export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // إذا كان المستخدم يحاول تسجيل الدخول
  if (request.method === "POST") {
    const formData = await request.formData();
    const password = formData.get("password");

    if (password === "Omar") {
      // إذا كان الباسورد صحيح، نرسله لـ GitHub لإتمام العملية
      const client_id = env.GITHUB_CLIENT_ID || "Ov23liL4Scd5Iih07ZYk";
      const redirect_uri = `${url.origin}/api/callback`;
      return Response.redirect(
        `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&redirect_uri=${redirect_uri}`,
        302
      );
    } else {
      return new Response("كلمة المرور غير صحيحة!", { status: 403 });
    }
  }

  // عرض صفحة الدخول البسيطة
  return new Response(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>تسجيل الدخول - أكاديمية KSA</title>
      <style>
        body { font-family: sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: white; padding: 2rem; border-radius: 1rem; shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
        input { width: 100%; padding: 12px; margin: 1rem 0; border: 2px solid #e2e8f0; border-radius: 0.5rem; box-sizing: border-box; font-size: 1rem; }
        button { width: 100%; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; font-weight: bold; cursor: pointer; font-size: 1rem; }
        button:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>أكاديمية KSA</h2>
        <p>يرجى إدخال كلمة المرور للدخول للوحة التحكم</p>
        <form method="POST">
          <input type="password" name="password" placeholder="كلمة المرور" required autofocus>
          <button type="submit">دخول عبر GitHub</button>
        </form>
      </div>
    </body>
    </html>
  `, { headers: { "Content-Type": "text/html" } });
}
