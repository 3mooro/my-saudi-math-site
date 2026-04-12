export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) return new Response("No code provided", { status: 400 });

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID || "Ov23liL4Scd5Iih07ZYk",
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const result = await response.json();

  if (result.error) {
    return new Response(JSON.stringify(result), { status: 400 });
  }

  // كود لإرسال التوكين للنافذة الرئيسية وإغلاق النافذة المنبثقة
  const script = `
    const token = "${result.access_token}";
    const provider = "github";
    const message = "authorization:github:success:" + JSON.stringify({token, provider});
    
    if (window.opener) {
      window.opener.postMessage(message, window.location.origin);
      window.close();
    }
  `;

  return new Response(`<html><body><script>${script}</script></body></html>`, {
    headers: { "content-type": "text/html" },
  });
}
