interface Env {
  trinquat_newsletter: D1Database;
  JWT_SECRET?: string;
  ADMIN_BOOTSTRAP_TOKEN?: string;
  MEDIA?: R2Bucket;
  MEDIA_PUBLIC_URL?: string;
}

// import { handleContentRoutes } from './worker-content';
export type { Env };

// Helper to add CORS headers
function corsHeaders(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Helper to extract admin ID from cookie
function getAdminIdFromCookie(request: Request): string | null {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/tc_admin=([^;]*)/);
  return match ? match[1] : null;
}

// Helper to get JSON body
async function getJsonBody<T>(request: Request): Promise<T | null> {
  try {
    const body = await request.text();
    if (!body) return null;
    return JSON.parse(body);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    console.log(`${method} ${pathname}`);

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return corsHeaders(new Response('OK', { status: 204 }));
    }

    try {
      // Bootstrap admin (create first admin)
      if (pathname === '/api/admin/bootstrap' && method === 'POST') {
        const body = await getJsonBody<{ email: string; password: string; token?: string }>(request);
        if (!body || !body.email || !body.password) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Email and password required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const adminId = crypto.randomUUID();
          const now = new Date().toISOString();

          await db
            .prepare(
              `INSERT INTO admins (id, email, password_hash, role, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)`
            )
            .bind(adminId, body.email, body.password, 'admin', now, now)
            .run();

          return corsHeaders(
            new Response(JSON.stringify({ ok: true, id: adminId, email: body.email }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (dbErr) {
          console.error('Bootstrap error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Bootstrap failed', detail: String(dbErr) }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Newsletter subscribe
      if (pathname === '/api/newsletter/subscribe' && method === 'POST') {
        const body = await getJsonBody<{ email: string }>(request);
        if (!body || !body.email) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Email required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        // Check if email is valid
        if (!body.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Invalid email' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          // Try to insert into D1
          const db = env.trinquat_newsletter;
          const { success } = await db
            .prepare(
              `INSERT INTO subscribers (id, email, is_active, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?)`
            )
            .bind(
              crypto.randomUUID(),
              body.email,
              1,
              new Date().toISOString(),
              new Date().toISOString()
            )
            .run();

          if (success) {
            return corsHeaders(
              new Response(JSON.stringify({ ok: true, message: 'Subscribed successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          } else {
            throw new Error('Database insert failed');
          }
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Database error', detail: String(dbErr) }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Admin login
      if (pathname === '/api/admin/login' && method === 'POST') {
        const body = await getJsonBody<{ email: string; password: string }>(request);
        if (!body || !body.email || !body.password) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Email and password required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const result = await db
            .prepare('SELECT id, email FROM admins WHERE email = ? AND password_hash = ?')
            .bind(body.email, body.password)
            .first<{ id: string; email: string }>();

          if (!result) {
            return corsHeaders(
              new Response(JSON.stringify({ error: 'Invalid credentials' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          }

          const response = new Response(
            JSON.stringify({ ok: true, message: 'Logged in successfully' }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
          response.headers.set(
            'Set-Cookie',
            `tc_admin=${result.id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`
          );
          return corsHeaders(response);
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Server error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Admin me
      if (pathname === '/api/admin/me' && method === 'GET') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const result = await db
            .prepare('SELECT id, email, role FROM admins WHERE id = ?')
            .bind(adminId)
            .first<{ id: string; email: string; role: string }>();

          if (!result) {
            return corsHeaders(
              new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          }

          return corsHeaders(
            new Response(JSON.stringify(result), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Server error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Admin logout
      if (pathname === '/api/admin/logout' && method === 'POST') {
        const response = new Response(JSON.stringify({ ok: true, message: 'Logged out' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
        response.headers.set('Set-Cookie', `tc_admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
        return corsHeaders(response);
      }

      // Subscribers list
      if (pathname === '/api/admin/subscribers' && method === 'GET') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const result = await db
            .prepare('SELECT id, email, is_active, created_at FROM subscribers LIMIT 100')
            .all<any>();

          return corsHeaders(
            new Response(
              JSON.stringify({
                subscribers: result.results || [],
                total: (result.results || []).length,
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          );
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Server error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Update subscriber (toggle active)
      const subscriberPatchMatch = pathname.match(/^\/api\/admin\/subscribers\/([^/]+)$/);
      if (subscriberPatchMatch && method === 'PATCH') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const subscriberId = subscriberPatchMatch[1];
        const body = await getJsonBody<{ is_active?: number }>(request);

        try {
          const db = env.trinquat_newsletter;
          const newStatus = body?.is_active !== undefined ? body.is_active : 1;

          await db
            .prepare('UPDATE subscribers SET is_active = ?, updated_at = ? WHERE id = ?')
            .bind(newStatus, new Date().toISOString(), subscriberId)
            .run();

          return corsHeaders(
            new Response(JSON.stringify({ ok: true, id: subscriberId, is_active: newStatus }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Server error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Delete subscriber
      const subscriberDeleteMatch = pathname.match(/^\/api\/admin\/subscribers\/([^/]+)$/);
      if (subscriberDeleteMatch && method === 'DELETE') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const subscriberId = subscriberDeleteMatch[1];

        try {
          const db = env.trinquat_newsletter;
          await db.prepare('DELETE FROM subscribers WHERE id = ?').bind(subscriberId).run();

          return corsHeaders(
            new Response(JSON.stringify({ ok: true, id: subscriberId }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Server error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Drafts list
      if (pathname === '/api/admin/drafts' && method === 'GET') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const result = await db
            .prepare(
              'SELECT id, subject, content, created_at as savedAt FROM drafts WHERE admin_id = ? ORDER BY created_at DESC'
            )
            .bind(adminId)
            .all<any>();

          return corsHeaders(
            new Response(JSON.stringify({ drafts: result.results || [] }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Server error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Save draft
      if (pathname === '/api/admin/drafts' && method === 'POST') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const body = await getJsonBody<{ subject: string; content: string }>(request);
        if (!body || !body.subject || !body.content) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Subject and content required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const draftId = crypto.randomUUID();
          const now = new Date().toISOString();

          await db
            .prepare(
              `INSERT INTO drafts (id, admin_id, subject, content, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)`
            )
            .bind(draftId, adminId, body.subject, body.content, now, now)
            .run();

          return corsHeaders(
            new Response(JSON.stringify({ id: draftId, subject: body.subject, content: body.content, savedAt: now }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Server error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Update draft
      const draftPatchMatch = pathname.match(/^\/api\/admin\/drafts\/([^/]+)$/);
      if (draftPatchMatch && method === 'PATCH') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const draftId = draftPatchMatch[1];
        const body = await getJsonBody<{ subject?: string; content?: string }>(request);

        try {
          const db = env.trinquat_newsletter;
          const now = new Date().toISOString();

          // Get current draft to verify ownership
          const draft = await db
            .prepare('SELECT id, admin_id FROM drafts WHERE id = ?')
            .bind(draftId)
            .first<any>();

          if (!draft || draft.admin_id !== adminId) {
            return corsHeaders(
              new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          }

          await db
            .prepare('UPDATE drafts SET subject = ?, content = ?, updated_at = ? WHERE id = ?')
            .bind(
              body?.subject || draft.subject,
              body?.content || draft.content,
              now,
              draftId
            )
            .run();

          return corsHeaders(
            new Response(JSON.stringify({ ok: true, id: draftId }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Server error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Delete draft
      const draftDeleteMatch = pathname.match(/^\/api\/admin\/drafts\/([^/]+)$/);
      if (draftDeleteMatch && method === 'DELETE') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const draftId = draftDeleteMatch[1];

        try {
          const db = env.trinquat_newsletter;

          // Verify draft ownership before deleting
          const draft = await db
            .prepare('SELECT admin_id FROM drafts WHERE id = ?')
            .bind(draftId)
            .first<any>();

          if (!draft || draft.admin_id !== adminId) {
            return corsHeaders(
              new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          }

          await db.prepare('DELETE FROM drafts WHERE id = ?').bind(draftId).run();

          return corsHeaders(
            new Response(JSON.stringify({ ok: true, id: draftId }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Server error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Sent newsletters
      if (pathname === '/api/admin/sent-newsletters' && method === 'GET') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const result = await db
            .prepare(
              'SELECT id, subject, recipient_count, sent_at FROM sent_newsletters WHERE admin_id = ? ORDER BY sent_at DESC'
            )
            .bind(adminId)
            .all<any>();

          return corsHeaders(
            new Response(JSON.stringify({ sent: result.results || [] }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (dbErr) {
          console.error('Database error:', dbErr);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Server error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Contact form submission - proxy to FormSubmit
      if (pathname === '/api/contact' && method === 'POST') {
        const body = await getJsonBody<{ name: string; email: string; message: string }>(request);
        if (!body || !body.name || !body.email || !body.message) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Name, email, and message required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          console.log('Sending contact form via FormSubmit:', {
            name: body.name,
            email: body.email,
          });

          // Send email via FormSubmit using URL-encoded format
          const formBody = new URLSearchParams();
          formBody.append('name', body.name);
          formBody.append('email', body.email);
          formBody.append('message', body.message);
          formBody.append('_subject', '📩 Nouveau message depuis le site trinquatetcompagnie.fr 🏡🌳');
          formBody.append('_reply_to', body.email);

          const formsubmitResponse = await fetch('https://formsubmit.co/contact@trinquatetcompagnie.fr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody.toString(),
          });

          console.log('FormSubmit response status:', formsubmitResponse.status);

          if (formsubmitResponse.ok) {
            console.log('Email sent successfully via FormSubmit');
            return corsHeaders(
              new Response(JSON.stringify({ ok: true, message: 'Email sent successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          } else {
            const errorText = await formsubmitResponse.text();
            console.error('FormSubmit error status:', formsubmitResponse.status);
            console.error('FormSubmit error response:', errorText);
            throw new Error(`FormSubmit error: ${formsubmitResponse.status}`);
          }
        } catch (err) {
          console.error('Contact form error:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to send email', detail: String(err) }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Content endpoints (events + news + uploads)
      // Commented out: R2 bucket not configured yet
      // const contentResp = await handleContentRoutes(request, env);
      // if (contentResp) return corsHeaders(contentResp);

      // 404
      return corsHeaders(
        new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    } catch (err) {
      console.error('Worker error:', err);
      return corsHeaders(
        new Response(JSON.stringify({ error: 'Internal server error', detail: String(err) }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
  },
};
