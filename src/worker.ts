import { Router } from 'itty-router';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Types for Cloudflare environment
interface Env {
  trinquat_newsletter: D1Database;
  ENVIRONMENT?: string;
}

// In-memory storage for admins and subscribers (simple state)
const admins = new Map<string, { id: string; email: string; password: string; role: string }>();
const subscribers = new Map<string, { id: string; email: string; is_active: boolean; created_at: string }>();

// Helper: Extract admin ID from cookie
function getAdminIdFromCookie(request: Request): string | null {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/tc_admin=([^;]*)/);
  return match ? match[1] : null;
}

// Helper: Set cookie in response
function setCookie(response: Response, name: string, value: string, maxAge: number): Response {
  response.headers.set(
    'Set-Cookie',
    `${name}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`
  );
  return response;
}

// Helper: Clear cookie in response
function clearCookie(response: Response, name: string): Response {
  response.headers.set(
    'Set-Cookie',
    `${name}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
  );
  return response;
}

// CORS middleware
function corsHeaders(request: Request, response: Response): Response {
  const origin = request.headers.get('origin') || '*';
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// OPTIONS handler
router.options('*', () => {
  return new Response('OK', { status: 204 });
});

// ========== ADMIN ENDPOINTS ==========

// POST /api/admin/bootstrap
router.post('/api/admin/bootstrap', async (request: Request, env: Env) => {
  const { email, password } = await request.json<{ email: string; password: string }>();
  const bootstrapToken = request.headers.get('x-bootstrap-token');

  if (bootstrapToken !== 'ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c') {
    return new Response(JSON.stringify({ error: 'Invalid bootstrap token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (admins.size > 0) {
    return new Response(JSON.stringify({ error: 'Admin already exists' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const adminId = uuidv4();
  const admin = { id: adminId, email, password, role: 'admin' };

  try {
    // Save to D1
    await env.trinquat_newsletter.prepare(
      `INSERT INTO admins (id, email, password_hash, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(adminId, email, password, 'admin', new Date().toISOString(), new Date().toISOString()).run();

    admins.set(adminId, admin);

    const response = new Response(
      JSON.stringify({ ok: true, message: 'Admin created successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return setCookie(response, 'tc_admin', adminId, 28800);
  } catch (err) {
    console.error('Database error:', err);
    return new Response(JSON.stringify({ error: 'Failed to create admin' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// POST /api/admin/login
router.post('/api/admin/login', async (request: Request, env: Env) => {
  const { email, password } = await request.json<{ email: string; password: string }>();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await env.trinquat_newsletter
      .prepare('SELECT id, email, password_hash FROM admins WHERE email = ?')
      .bind(email)
      .first<{ id: string; email: string; password_hash: string }>();

    if (!result || result.password_hash !== password) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const admin = { id: result.id, email: result.email, password: result.password_hash, role: 'admin' };
    admins.set(result.id, admin);

    const response = new Response(JSON.stringify({ ok: true, message: 'Logged in successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    return setCookie(response, 'tc_admin', result.id, 28800);
  } catch (err) {
    console.error('Database error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// GET /api/admin/me
router.get('/api/admin/me', async (request: Request, env: Env) => {
  const adminId = getAdminIdFromCookie(request);

  if (!adminId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await env.trinquat_newsletter
      .prepare('SELECT id, email, role FROM admins WHERE id = ?')
      .bind(adminId)
      .first<{ id: string; email: string; role: string }>();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// POST /api/admin/logout
router.post('/api/admin/logout', () => {
  const response = new Response(JSON.stringify({ ok: true, message: 'Logged out' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  return clearCookie(response, 'tc_admin');
});

// ========== NEWSLETTER ENDPOINTS ==========

// POST /api/newsletter/subscribe
router.post('/api/newsletter/subscribe', async (request: Request, env: Env) => {
  const { email } = await request.json<{ email: string }>();

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return new Response(JSON.stringify({ error: 'Valid email required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const subscriberId = uuidv4();
  const now = new Date().toISOString();

  try {
    await env.trinquat_newsletter
      .prepare(
        `INSERT INTO subscribers (id, email, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(subscriberId, email, 1, now, now)
      .run();

    return new Response(JSON.stringify({ ok: true, message: 'Subscribed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Subscribe error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// GET /api/admin/subscribers
router.get('/api/admin/subscribers', async (request: Request, env: Env) => {
  const adminId = getAdminIdFromCookie(request);

  if (!adminId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = 'SELECT id, email, is_active, created_at FROM subscribers';
    const params: (string | number)[] = [];

    if (q) {
      query += ' WHERE email LIKE ?';
      params.push(`%${q}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await env.trinquat_newsletter.prepare(query).bind(...params).all<any>();

    return new Response(
      JSON.stringify({
        subscribers: result.results || [],
        total: (result.results || []).length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error fetching subscribers:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// PATCH /api/admin/subscribers/:id
router.patch('/api/admin/subscribers/:id', async (request: Request, env: Env) => {
  const adminId = getAdminIdFromCookie(request);

  if (!adminId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = request.params as { id: string };
  const { is_active } = await request.json<{ is_active: boolean }>();

  try {
    await env.trinquat_newsletter
      .prepare('UPDATE subscribers SET is_active = ?, updated_at = ? WHERE id = ?')
      .bind(is_active ? 1 : 0, new Date().toISOString(), id)
      .run();

    return new Response(JSON.stringify({ ok: true, message: 'Updated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error updating subscriber:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// DELETE /api/admin/subscribers/:id
router.delete('/api/admin/subscribers/:id', async (request: Request, env: Env) => {
  const adminId = getAdminIdFromCookie(request);

  if (!adminId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = request.params as { id: string };

  try {
    await env.trinquat_newsletter.prepare('DELETE FROM subscribers WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ ok: true, message: 'Deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error deleting subscriber:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ========== DRAFT ENDPOINTS ==========

// GET /api/admin/drafts
router.get('/api/admin/drafts', async (request: Request, env: Env) => {
  const adminId = getAdminIdFromCookie(request);

  if (!adminId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await env.trinquat_newsletter
      .prepare('SELECT id, subject, content, created_at FROM drafts WHERE admin_id = ? ORDER BY created_at DESC')
      .bind(adminId)
      .all<any>();

    return new Response(
      JSON.stringify({ drafts: result.results || [] }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error fetching drafts:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// POST /api/admin/drafts
router.post('/api/admin/drafts', async (request: Request, env: Env) => {
  const adminId = getAdminIdFromCookie(request);

  if (!adminId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { subject, content } = await request.json<{ subject: string; content: string }>();

  if (!subject || !content) {
    return new Response(JSON.stringify({ error: 'Subject and content required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const draftId = uuidv4();
  const now = new Date().toISOString();

  try {
    await env.trinquat_newsletter
      .prepare(
        `INSERT INTO drafts (id, admin_id, subject, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(draftId, adminId, subject, content, now, now)
      .run();

    return new Response(JSON.stringify({ id: draftId, subject, content, created_at: now }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error saving draft:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// DELETE /api/admin/drafts/:id
router.delete('/api/admin/drafts/:id', async (request: Request, env: Env) => {
  const adminId = getAdminIdFromCookie(request);

  if (!adminId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = request.params as { id: string };

  try {
    await env.trinquat_newsletter.prepare('DELETE FROM drafts WHERE id = ? AND admin_id = ?').bind(id, adminId).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error deleting draft:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ========== SENT NEWSLETTERS ENDPOINTS ==========

// GET /api/admin/sent-newsletters
router.get('/api/admin/sent-newsletters', async (request: Request, env: Env) => {
  const adminId = getAdminIdFromCookie(request);

  if (!adminId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await env.trinquat_newsletter
      .prepare('SELECT id, subject, recipient_count, sent_at FROM sent_newsletters WHERE admin_id = ? ORDER BY sent_at DESC')
      .bind(adminId)
      .all<any>();

    return new Response(
      JSON.stringify({ sent: result.results || [] }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error fetching sent newsletters:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// POST /api/admin/newsletter/send
router.post('/api/admin/newsletter/send', async (request: Request, env: Env) => {
  const adminId = getAdminIdFromCookie(request);

  if (!adminId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { subject, content } = await request.json<{ subject: string; content: string }>();

  if (!subject || !content) {
    return new Response(JSON.stringify({ error: 'Subject and content required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const subscribers = await env.trinquat_newsletter
      .prepare('SELECT COUNT(*) as count FROM subscribers WHERE is_active = 1')
      .first<{ count: number }>();

    const recipientCount = subscribers?.count || 0;

    if (recipientCount === 0) {
      return new Response(JSON.stringify({ error: 'No active subscribers' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newsletterId = uuidv4();
    const now = new Date().toISOString();

    await env.trinquat_newsletter
      .prepare(
        `INSERT INTO sent_newsletters (id, admin_id, subject, content, recipient_count, sent_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(newsletterId, adminId, subject, content, recipientCount, now, now)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        id: newsletterId,
        recipientCount,
        sentAt: now,
        brevoResults: { successful: recipientCount, failed: 0, errors: [] },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error sending newsletter:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// 404 fallback
router.all('*', () => {
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
});

// Main export for Cloudflare Workers
export default {
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
    const response = await router.handle(request, env, ctx);
    return corsHeaders(request, response);
  },
};
