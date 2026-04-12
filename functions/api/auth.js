export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  if (request.method === "POST") {
    const formData = await request.formData();
    const password = formData.get("password");

    if (password === "Omar") {
      const client_id = env.GITHUB_CLIENT_ID || "Ov23liL4Scd5Iih07ZYk";
      const redirect_uri = `${url.origin}/api/callback`;
      const githubUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&redirect_uri=${encodeURIComponent(redirect_uri)}`;
      return Response.redirect(githubUrl, 302);
    } else {
      return new Response("خطأ: كلمة المرور غير صحيحة!", { status: 403 });
    }
  }

  // Simple login form
  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>تسجيل دخول الإدارة - أكاديمية KSA</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Cairo', sans-serif; background: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .login-card { background: white; padding: 3rem; border-radius: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); width: 100%; max-width: 450px; text-align: center; border: 1px solid #e2e8f0; }
        h1 { color: #1e293b; margin-bottom: 0.5rem; font-weight: 900; }
        p { color: #64748b; margin-bottom: 2rem; font-weight: 700; }
        input { width: 100%; padding: 1.2rem; margin-bottom: 1.5rem; border: 2px solid #e2e8f0; border-radius: 1rem; font-size: 1.1rem; text-align: center; font-family: inherit; font-weight: 700; }
        button { width: 100%; padding: 1.2rem; background: #3b82f6; color: white; border: none; border-radius: 1rem; font-weight: 900; font-size: 1.2rem; cursor: pointer; transition: all 0.3s; }
        button:hover { background: #2563eb; transform: translateY(-2px); }
      </style>
    </head>
    <body>
      <div class="login-card">
        <h1>أكاديمية KSA</h1>
        <p>يرجى إدخال كلمة المرور للوصول للإدارة</p>
        <form method="POST">
          <input type="password" name="password" placeholder="كلمة المرور" required autofocus>
          <button type="submit">دخول لوحة التحكم</button>
        </form>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { "content-type": "text/html;charset=UTF-8" },
  });
}
