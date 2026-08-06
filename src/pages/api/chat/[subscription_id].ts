export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async ({ params, cookies }) => {
  const { subscription_id } = params;
  if (!subscription_id) return new Response('Bad Request', { status: 400 });

  const studentCookie = cookies.get('student_auth')?.value;
  const teacherCookie = cookies.get('teacher_auth')?.value;

  if (!studentCookie && !teacherCookie) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = env.DB;
  if (!db) {
    return new Response(JSON.stringify([{ id: 1, sender_type: 'teacher', message: 'مرحبا بك! كيف يمكنني مساعدتك؟', created_at: new Date().toISOString() }]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Validate access
    const sub = await db.prepare('SELECT student_id, teacher_id FROM course_subscriptions WHERE id = ?').bind(subscription_id).first();
    if (!sub) return new Response('Not found', { status: 404 });

    if (studentCookie && sub.student_id.toString() !== studentCookie) return new Response('Forbidden', { status: 403 });
    if (teacherCookie && sub.teacher_id.toString() !== teacherCookie) return new Response('Forbidden', { status: 403 });

    // Fetch messages
    const messages = await db.prepare('SELECT * FROM chat_messages WHERE receiver_id = ? ORDER BY created_at ASC').bind(subscription_id).all();

    // Mark messages as read based on who is reading
    if (studentCookie) {
      await db.prepare("UPDATE chat_messages SET is_read = 1 WHERE receiver_id = ? AND sender_type = 'teacher'").bind(subscription_id).run();
    } else if (teacherCookie) {
      await db.prepare("UPDATE chat_messages SET is_read = 1 WHERE receiver_id = ? AND sender_type = 'student'").bind(subscription_id).run();
    }
    
    return new Response(JSON.stringify(messages.results || []), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error(e);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const { subscription_id } = params;
  if (!subscription_id) return new Response('Bad Request', { status: 400 });

  const studentCookie = cookies.get('student_auth')?.value;
  const teacherCookie = cookies.get('teacher_auth')?.value;

  if (!studentCookie && !teacherCookie) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = env.DB;
  if (!db) return new Response('No DB', { status: 500 });

  try {
    // Validate access
    const sub = await db.prepare('SELECT student_id, teacher_id FROM course_subscriptions WHERE id = ?').bind(subscription_id).first();
    if (!sub) return new Response('Not found', { status: 404 });

    let sender_type = '';
    let sender_id = '';
    
    if (studentCookie) {
      if (sub.student_id.toString() !== studentCookie) return new Response('Forbidden', { status: 403 });
      sender_type = 'student';
      sender_id = studentCookie;
    } else if (teacherCookie) {
      if (sub.teacher_id.toString() !== teacherCookie) return new Response('Forbidden', { status: 403 });
      sender_type = 'teacher';
      sender_id = teacherCookie;
    }

    const data = await request.json();
    const { message, image_url } = data; // image_url will contain base64

    // Phone number blocking logic
    if (message) {
      // Remove URLs from the message before checking for phone numbers
      // This allows Zoom/Meet links with long numeric IDs to pass through
      const messageWithoutUrls = message.replace(/https?:\/\/[^\s]+/g, '');
      
      const englishDigits = messageWithoutUrls.replace(/[٠-٩]/g, (d: string) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
      const stripped = englishDigits.replace(/[\s\-\._]/g, '');
      if (/\d{8,15}/.test(stripped)) {
        return new Response(JSON.stringify({ error: "عذراً، يمنع مشاركة أرقام الهواتف أو التواصل خارج المنصة." }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    await db.prepare('INSERT INTO chat_messages (sender_type, sender_id, receiver_type, receiver_id, message, image_url) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(sender_type, sender_id, 'subscription', subscription_id, message || null, image_url || null).run();

    // Send Push Notification via OneSignal
    try {
      const ONE_SIGNAL_APP_ID = env.ONESIGNAL_APP_ID || "d6d3c46f-3d7f-4f60-a826-2184d73cc8d3";
      const ONE_SIGNAL_REST_API_KEY = env.ONESIGNAL_API_KEY || "dummy_key";
      
      const targetExternalId = sender_type === 'student' ? `teacher_${sub.teacher_id}` : `student_${sub.student_id}`;
      const senderName = sender_type === 'student' ? 'الطالب' : 'المعلم';
      const notificationText = message ? message.substring(0, 50) + (message.length > 50 ? '...' : '') : 'أرسل صورة';
      
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": `Basic ${ONE_SIGNAL_REST_API_KEY}`
        },
        body: JSON.stringify({
          app_id: ONE_SIGNAL_APP_ID,
          include_aliases: {
            external_id: [targetExternalId]
          },
          target_channel: "push",
          headings: { "en": `رسالة جديدة من ${senderName}`, "ar": `رسالة جديدة من ${senderName}` },
          contents: { "en": notificationText, "ar": notificationText },
          url: `https://my-math-site.omarashraf88998.workers.dev/chat/${subscription_id}`
        })
      });
    } catch(e) {
      console.error("Push Notification Error", e);
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response('Internal Server Error', { status: 500 });
  }
};
