// Content routes: events, news, uploads
// Dispatched from src/worker.ts before the 404 handler.

interface Env {
  trinquat_newsletter: D1Database;
  MEDIA?: R2Bucket;
  MEDIA_PUBLIC_URL?: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getAdminId(request: Request): string | null {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/tc_admin=([^;]*)/);
  return match ? match[1] : null;
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    const text = await request.text();
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_UPLOAD = 5 * 1024 * 1024; // 5 Mo

export async function handleContentRoutes(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;
  const db = env.trinquat_newsletter;

  // ---------- PUBLIC ----------
  if (pathname === '/api/events' && method === 'GET') {
    const scope = url.searchParams.get('scope'); // upcoming | past | all
    let sql =
      "SELECT id, title, description, event_date, place, badge, image_url, status, published_at FROM events WHERE status = 'published'";
    const params: any[] = [];
    if (scope === 'upcoming') {
      sql += ' AND event_date >= ? ORDER BY event_date ASC';
      params.push(todayIso());
    } else if (scope === 'past') {
      sql += ' AND event_date < ? ORDER BY event_date DESC';
      params.push(todayIso());
    } else {
      sql += ' ORDER BY event_date DESC';
    }
    const r = await db.prepare(sql).bind(...params).all<any>();
    return json({ events: r.results || [] });
  }

  if (pathname === '/api/news' && method === 'GET') {
    const r = await db
      .prepare(
        "SELECT id, title, excerpt, tag, news_date, image_url, published_at FROM news WHERE status = 'published' ORDER BY news_date DESC"
      )
      .all<any>();
    return json({ news: r.results || [] });
  }

  // ---------- ADMIN GUARD ----------
  const isAdminRoute =
    pathname.startsWith('/api/admin/events') ||
    pathname.startsWith('/api/admin/news') ||
    pathname.startsWith('/api/admin/uploads');

  if (!isAdminRoute) return null;

  const adminId = getAdminId(request);
  if (!adminId) return json({ error: 'Unauthorized' }, 401);

  // ---------- UPLOADS ----------
  if (pathname === '/api/admin/uploads' && method === 'POST') {
    if (!env.MEDIA) {
      return json(
        { error: "Bucket R2 non configuré. Ajoutez le binding 'MEDIA' dans wrangler.toml." },
        500
      );
    }
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data')) {
      return json({ error: 'multipart/form-data attendu' }, 400);
    }
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return json({ error: 'Fichier manquant' }, 400);
    if (!ALLOWED_MIME.has(file.type)) return json({ error: 'Format non supporté' }, 400);
    if (file.size > MAX_UPLOAD) return json({ error: 'Fichier trop volumineux (max 5 Mo)' }, 400);

    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `content/${crypto.randomUUID()}.${ext}`;
    await env.MEDIA.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    const base = env.MEDIA_PUBLIC_URL?.replace(/\/$/, '') || '';
    const publicUrl = base ? `${base}/${key}` : `/${key}`;
    return json({ ok: true, key, url: publicUrl });
  }

  if (pathname.startsWith('/api/admin/uploads/') && method === 'DELETE') {
    const key = decodeURIComponent(pathname.slice('/api/admin/uploads/'.length));
    if (env.MEDIA && key) await env.MEDIA.delete(key);
    return json({ ok: true });
  }

  // ---------- EVENTS ADMIN ----------
  if (pathname === '/api/admin/events' && method === 'GET') {
    const status = url.searchParams.get('status');
    let sql =
      'SELECT id, title, description, event_date, place, badge, image_url, image_key, status, published_at, created_at, updated_at FROM events';
    const params: any[] = [];
    if (status === 'draft' || status === 'published') {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY event_date DESC';
    const r = await db.prepare(sql).bind(...params).all<any>();
    return json({ events: r.results || [] });
  }

  if (pathname === '/api/admin/events' && method === 'POST') {
    const body = await readJson<any>(request);
    if (!body || !body.title || !body.description || !body.event_date) {
      return json({ error: 'Champs requis: title, description, event_date' }, 400);
    }
    const id = crypto.randomUUID();
    const now = nowIso();
    const status = body.status === 'published' ? 'published' : 'draft';
    const publishedAt = status === 'published' ? now : null;
    await db
      .prepare(
        `INSERT INTO events (id, title, description, event_date, place, badge, image_url, image_key, status, published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        String(body.title).slice(0, 200),
        String(body.description).slice(0, 5000),
        String(body.event_date).slice(0, 10),
        body.place ? String(body.place).slice(0, 200) : null,
        body.badge ? String(body.badge).slice(0, 60) : null,
        body.image_url || null,
        body.image_key || null,
        status,
        publishedAt,
        now,
        now
      )
      .run();
    return json({ ok: true, id });
  }

  const eventIdMatch = pathname.match(/^\/api\/admin\/events\/([^/]+)$/);
  if (eventIdMatch) {
    const id = eventIdMatch[1];
    if (method === 'GET') {
      const r = await db
        .prepare('SELECT * FROM events WHERE id = ?')
        .bind(id)
        .first<any>();
      if (!r) return json({ error: 'Introuvable' }, 404);
      return json({ event: r });
    }
    if (method === 'PATCH') {
      const body = await readJson<any>(request);
      if (!body) return json({ error: 'Body manquant' }, 400);
      const existing = await db
        .prepare('SELECT * FROM events WHERE id = ?')
        .bind(id)
        .first<any>();
      if (!existing) return json({ error: 'Introuvable' }, 404);
      const now = nowIso();
      const nextStatus = body.status === 'published' || body.status === 'draft' ? body.status : existing.status;
      const publishedAt =
        nextStatus === 'published' && existing.status !== 'published' ? now : existing.published_at;
      await db
        .prepare(
          `UPDATE events SET title=?, description=?, event_date=?, place=?, badge=?, image_url=?, image_key=?, status=?, published_at=?, updated_at=? WHERE id=?`
        )
        .bind(
          body.title ?? existing.title,
          body.description ?? existing.description,
          body.event_date ?? existing.event_date,
          body.place ?? existing.place,
          body.badge ?? existing.badge,
          body.image_url ?? existing.image_url,
          body.image_key ?? existing.image_key,
          nextStatus,
          publishedAt,
          now,
          id
        )
        .run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const existing = await db
        .prepare('SELECT image_key FROM events WHERE id = ?')
        .bind(id)
        .first<any>();
      if (existing?.image_key && env.MEDIA) {
        try {
          await env.MEDIA.delete(existing.image_key);
        } catch {}
      }
      await db.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }
  }

  // ---------- NEWS ADMIN ----------
  if (pathname === '/api/admin/news' && method === 'GET') {
    const status = url.searchParams.get('status');
    let sql =
      'SELECT id, title, excerpt, tag, news_date, image_url, image_key, status, published_at, created_at, updated_at FROM news';
    const params: any[] = [];
    if (status === 'draft' || status === 'published') {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY news_date DESC';
    const r = await db.prepare(sql).bind(...params).all<any>();
    return json({ news: r.results || [] });
  }

  if (pathname === '/api/admin/news' && method === 'POST') {
    const body = await readJson<any>(request);
    if (!body || !body.title || !body.excerpt || !body.news_date) {
      return json({ error: 'Champs requis: title, excerpt, news_date' }, 400);
    }
    const id = crypto.randomUUID();
    const now = nowIso();
    const status = body.status === 'published' ? 'published' : 'draft';
    const publishedAt = status === 'published' ? now : null;
    await db
      .prepare(
        `INSERT INTO news (id, title, excerpt, tag, news_date, image_url, image_key, status, published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        String(body.title).slice(0, 200),
        String(body.excerpt).slice(0, 5000),
        body.tag ? String(body.tag).slice(0, 60) : null,
        String(body.news_date).slice(0, 10),
        body.image_url || null,
        body.image_key || null,
        status,
        publishedAt,
        now,
        now
      )
      .run();
    return json({ ok: true, id });
  }

  const newsIdMatch = pathname.match(/^\/api\/admin\/news\/([^/]+)$/);
  if (newsIdMatch) {
    const id = newsIdMatch[1];
    if (method === 'GET') {
      const r = await db.prepare('SELECT * FROM news WHERE id = ?').bind(id).first<any>();
      if (!r) return json({ error: 'Introuvable' }, 404);
      return json({ news: r });
    }
    if (method === 'PATCH') {
      const body = await readJson<any>(request);
      if (!body) return json({ error: 'Body manquant' }, 400);
      const existing = await db.prepare('SELECT * FROM news WHERE id = ?').bind(id).first<any>();
      if (!existing) return json({ error: 'Introuvable' }, 404);
      const now = nowIso();
      const nextStatus = body.status === 'published' || body.status === 'draft' ? body.status : existing.status;
      const publishedAt =
        nextStatus === 'published' && existing.status !== 'published' ? now : existing.published_at;
      await db
        .prepare(
          `UPDATE news SET title=?, excerpt=?, tag=?, news_date=?, image_url=?, image_key=?, status=?, published_at=?, updated_at=? WHERE id=?`
        )
        .bind(
          body.title ?? existing.title,
          body.excerpt ?? existing.excerpt,
          body.tag ?? existing.tag,
          body.news_date ?? existing.news_date,
          body.image_url ?? existing.image_url,
          body.image_key ?? existing.image_key,
          nextStatus,
          publishedAt,
          now,
          id
        )
        .run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const existing = await db.prepare('SELECT image_key FROM news WHERE id = ?').bind(id).first<any>();
      if (existing?.image_key && env.MEDIA) {
        try {
          await env.MEDIA.delete(existing.image_key);
        } catch {}
      }
      await db.prepare('DELETE FROM news WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }
  }

  return null;
}