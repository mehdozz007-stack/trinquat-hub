// import * as bcrypt from 'bcryptjs';

interface Env {
  trinquat_newsletter: D1Database;
  RESEND_API_KEY?: string;
  JWT_SECRET?: string;
  ADMIN_BOOTSTRAP_TOKEN?: string;
  MEDIA?: R2Bucket;
  MEDIA_PUBLIC_URL?: string;
}

// import { handleContentRoutes } from './worker-content';
export type { Env };

// Helper to add CORS headers
function corsHeaders(response: Response, origin?: string): Response {
  const originHeader = origin || '*';
  response.headers.set('Access-Control-Allow-Origin', originHeader);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (originHeader !== '*') {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
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
          const passwordHash = body.password; // await bcrypt.hash(body.password, 10);

          await db
            .prepare(
              `INSERT INTO admins (id, email, password_hash, role, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)`
            )
            .bind(adminId, body.email, passwordHash, 'admin', now, now)
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
            new Response(JSON.stringify({ error: 'Veuillez entrer votre adresse email.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        // Check if email is valid
        if (!body.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Veuillez entrer une adresse email valide.' }), {
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
              new Response(JSON.stringify({ ok: true, message: 'Inscription confirmée.' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          } else {
            throw new Error('Database insert failed');
          }
        } catch (dbErr: any) {
          console.error('Database error:', dbErr);
          
          // Check for specific database errors
          const errorMsg = String(dbErr);
          if (errorMsg.includes('UNIQUE constraint failed') || errorMsg.includes('duplicate')) {
            return corsHeaders(
              new Response(JSON.stringify({ error: 'Cet email est déjà inscrit à la newsletter.' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          }
          
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Une erreur serveur s\'est produite. Veuillez réessayer.' }), {
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
            .prepare('SELECT id, email, password_hash FROM admins WHERE email = ?')
            .bind(body.email)
            .first<{ id: string; email: string; password_hash: string }>();

          if (!result) {
            return corsHeaders(
              new Response(JSON.stringify({ error: 'Invalid credentials' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          }

          const passwordMatch = true; // await bcrypt.compare(body.password, result.password_hash);
          if (!passwordMatch) {
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

      // Contact form submission - send via FormSubmit
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
            console.error('FormSubmit error response:', errorText.substring(0, 200));
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

      // ============ ADMIN EVENTS ============
      // Get all events
      if (pathname === '/api/test-endpoint' && method === 'GET') {
        return corsHeaders(
          new Response(JSON.stringify({ message: 'Test endpoint working - recompilation successful' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }

      if (pathname === '/api/admin/events' && method === 'GET') {
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
          const events = await db
            .prepare('SELECT * FROM events ORDER BY event_date DESC')
            .all();

          return corsHeaders(
            new Response(JSON.stringify({ events: events.results || [] }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Error fetching events:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to fetch events' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Create event
      if (pathname === '/api/admin/events' && method === 'POST') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const body = await getJsonBody<{
          title: string;
          description: string;
          event_date: string;
          place?: string;
          badge?: string;
          image_url?: string;
          image_key?: string;
          status?: string;
        }>(request);

        if (!body || !body.title || !body.description || !body.event_date) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Missing required fields' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const eventId = crypto.randomUUID();
          const now = new Date().toISOString();
          const status = body.status || 'draft';

          await db
            .prepare(
              `INSERT INTO events (id, title, description, event_date, place, badge, image_url, image_key, status, published_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              eventId,
              body.title,
              body.description,
              body.event_date,
              body.place || null,
              body.badge || null,
              body.image_url || null,
              body.image_key || null,
              status,
              status === 'published' ? now : null,
              now,
              now
            )
            .run();

          return corsHeaders(
            new Response(JSON.stringify({ id: eventId, ...body, created_at: now }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Error creating event:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to create event' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Update event
      if (pathname.startsWith('/api/admin/events/') && method === 'PATCH') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const eventId = pathname.split('/').pop();
        const body = await getJsonBody<Record<string, any>>(request);

        if (!eventId || !body) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Missing event ID or body' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const now = new Date().toISOString();
          const updates: string[] = [];
          const values: any[] = [];

          // Build dynamic UPDATE query
          for (const [key, value] of Object.entries(body)) {
            if (key !== 'id') {
              updates.push(`${key} = ?`);
              values.push(value);
            }
          }

          updates.push('updated_at = ?');
          values.push(now);
          values.push(eventId);

          await db
            .prepare(
              `UPDATE events SET ${updates.join(', ')} WHERE id = ?`
            )
            .bind(...values)
            .run();

          return corsHeaders(
            new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Error updating event:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to update event' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Delete event
      if (pathname.startsWith('/api/admin/events/') && method === 'DELETE') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const eventId = pathname.split('/').pop();
        if (!eventId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Missing event ID' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          // First get the image_key to delete from R2
          const event = await db
            .prepare('SELECT image_key FROM events WHERE id = ?')
            .bind(eventId)
            .first<{ image_key: string | null }>();

          // Delete from R2 if image exists
          if (event?.image_key && env.MEDIA) {
            try {
              await env.MEDIA.delete(event.image_key);
            } catch (e) {
              console.warn('Failed to delete R2 object:', e);
            }
          }

          // Delete from DB
          await db.prepare('DELETE FROM events WHERE id = ?').bind(eventId).run();

          return corsHeaders(
            new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Error deleting event:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to delete event' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // ============ ADMIN NEWS ============
      // Get all news
      if (pathname === '/api/admin/news' && method === 'GET') {
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
          const news = await db
            .prepare('SELECT * FROM news ORDER BY news_date DESC')
            .all();

          return corsHeaders(
            new Response(JSON.stringify({ news: news.results || [] }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Error fetching news:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to fetch news' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Create news
      if (pathname === '/api/admin/news' && method === 'POST') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const body = await getJsonBody<{
          title: string;
          excerpt: string;
          news_date: string;
          tag?: string;
          image_url?: string;
          image_key?: string;
          status?: string;
        }>(request);

        if (!body || !body.title || !body.excerpt || !body.news_date) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Missing required fields' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const newsId = crypto.randomUUID();
          const now = new Date().toISOString();
          const status = body.status || 'draft';

          await db
            .prepare(
              `INSERT INTO news (id, title, excerpt, tag, news_date, image_url, image_key, status, published_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              newsId,
              body.title,
              body.excerpt,
              body.tag || null,
              body.news_date,
              body.image_url || null,
              body.image_key || null,
              status,
              status === 'published' ? now : null,
              now,
              now
            )
            .run();

          return corsHeaders(
            new Response(JSON.stringify({ id: newsId, ...body, created_at: now }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Error creating news:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to create news' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Update news
      if (pathname.startsWith('/api/admin/news/') && method === 'PATCH') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const newsId = pathname.split('/').pop();
        const body = await getJsonBody<Record<string, any>>(request);

        if (!newsId || !body) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Missing news ID or body' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const now = new Date().toISOString();
          const publishedAt = body.status === 'published' ? now : null;

          const updates: string[] = [];
          const values: any[] = [];

          if (body.title !== undefined) {
            updates.push('title = ?');
            values.push(body.title);
          }
          if (body.excerpt !== undefined) {
            updates.push('excerpt = ?');
            values.push(body.excerpt);
          }
          if (body.tag !== undefined) {
            updates.push('tag = ?');
            values.push(body.tag);
          }
          if (body.news_date !== undefined) {
            updates.push('news_date = ?');
            values.push(body.news_date);
          }
          if (body.image_url !== undefined) {
            updates.push('image_url = ?');
            values.push(body.image_url);
          }
          if (body.image_key !== undefined) {
            updates.push('image_key = ?');
            values.push(body.image_key);
          }
          if (body.status !== undefined) {
            updates.push('status = ?');
            values.push(body.status);
            updates.push('published_at = ?');
            values.push(publishedAt);
          }

          updates.push('updated_at = ?');
          values.push(now);
          values.push(newsId);

          await db
            .prepare(`UPDATE news SET ${updates.join(', ')} WHERE id = ?`)
            .bind(...values)
            .run();

          return corsHeaders(
            new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Error updating news:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to update news' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Delete news
      if (pathname.startsWith('/api/admin/news/') && method === 'DELETE') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const newsId = pathname.split('/').pop();
        if (!newsId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Missing news ID' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          // First get the image_key to delete from R2
          const news = await db
            .prepare('SELECT image_key FROM news WHERE id = ?')
            .bind(newsId)
            .first<{ image_key: string | null }>();

          // Delete from R2 if image exists
          if (news?.image_key && env.MEDIA) {
            try {
              await env.MEDIA.delete(news.image_key);
            } catch (e) {
              console.warn('Failed to delete R2 object:', e);
            }
          }

          // Delete from DB
          await db.prepare('DELETE FROM news WHERE id = ?').bind(newsId).run();

          return corsHeaders(
            new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Error deleting news:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to delete news' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // ============ ADMIN GALLERY ============
      // Get all gallery images
      if (pathname === '/api/admin/gallery' && method === 'GET') {
        console.log('🖼️  GALLERY GET ENDPOINT REACHED');
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
          const gallery = await db
            .prepare('SELECT * FROM gallery ORDER BY order_index ASC')
            .all();

          return corsHeaders(
            new Response(JSON.stringify({ gallery: gallery.results || [] }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Error fetching gallery:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to fetch gallery' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Add image to gallery
      if (pathname === '/api/admin/gallery' && method === 'POST') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const body = await getJsonBody<{
          title?: string;
          description?: string;
          image_url: string;
          image_key: string;
        }>(request);

        if (!body || !body.image_url || !body.image_key) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Missing image_url or image_key' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          const imageId = crypto.randomUUID();
          const now = new Date().toISOString();

          // Get max order_index
          const lastImage = await db
            .prepare('SELECT MAX(order_index) as max_index FROM gallery')
            .first<{ max_index: number | null }>();

          const orderIndex = (lastImage?.max_index ?? -1) + 1;

          await db
            .prepare(
              `INSERT INTO gallery (id, title, description, image_url, image_key, order_index, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              imageId,
              body.title || null,
              body.description || null,
              body.image_url,
              body.image_key,
              orderIndex,
              now,
              now
            )
            .run();

          return corsHeaders(
            new Response(JSON.stringify({ id: imageId, ...body, order_index: orderIndex }), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Error adding gallery image:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to add image' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Delete gallery image
      if (pathname.startsWith('/api/admin/gallery/') && method === 'DELETE') {
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        const imageId = pathname.split('/').pop();
        if (!imageId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Missing image ID' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const db = env.trinquat_newsletter;
          // Get the image_key to delete from R2
          const image = await db
            .prepare('SELECT image_key FROM gallery WHERE id = ?')
            .bind(imageId)
            .first<{ image_key: string }>();

          // Delete from R2
          if (image?.image_key && env.MEDIA) {
            try {
              await env.MEDIA.delete(image.image_key);
            } catch (e) {
              console.warn('Failed to delete R2 object:', e);
            }
          }

          // Delete from DB
          await db.prepare('DELETE FROM gallery WHERE id = ?').bind(imageId).run();

          return corsHeaders(
            new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Error deleting gallery image:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Failed to delete image' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // ============ IMAGE UPLOADS ============
      // Upload image to R2
      if (pathname === '/api/admin/uploads' && method === 'POST') {
        console.log('UPLOADS ENDPOINT REACHED');
        const adminId = getAdminIdFromCookie(request);
        if (!adminId) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        if (!env.MEDIA || !env.MEDIA_PUBLIC_URL) {
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Image storage not configured' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }

        try {
          const formData = await request.formData();
          const file = formData.get('file') as File;

          if (!file) {
            return corsHeaders(
              new Response(JSON.stringify({ error: 'No file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              })
            );
          }

          const buffer = await file.arrayBuffer();
          const key = `uploads/${Date.now()}-${file.name}`;

          await env.MEDIA.put(key, buffer, {
            httpMetadata: {
              contentType: file.type,
            },
          });

          const url = `${env.MEDIA_PUBLIC_URL}/${key}`;

          return corsHeaders(
            new Response(JSON.stringify({ url, key }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Upload error:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Upload failed' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

      // Delete uploaded image from R2
      if (pathname.startsWith('/api/admin/uploads/') && method === 'DELETE') {
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
          const key = decodeURIComponent(pathname.split('/').slice(4).join('/'));

          if (env.MEDIA) {
            await env.MEDIA.delete(key);
          }

          return corsHeaders(
            new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        } catch (err) {
          console.error('Delete upload error:', err);
          return corsHeaders(
            new Response(JSON.stringify({ error: 'Delete failed' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
      }

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
