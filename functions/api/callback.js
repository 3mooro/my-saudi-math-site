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
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const result = await response.json();

  if (result.error) {
    return new Response(JSON.stringify(result), { status: 400 });
  }

  // إرسال النتيجة للوحة التحكم وإغلاق النافذة
  return new Response(
    `<html><body><script>
    (function() {
      function receiveMessage(e) {
        window.opener.postMessage(
          'authorization:github:success:${JSON.stringify({
            token: result.access_token,
            provider: "github",
          })}',
          e.origin
        );
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    })()
    </script></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
