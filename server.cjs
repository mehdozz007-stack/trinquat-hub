const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');

const app = express();

// CORS configuration with credentials support
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

// In-memory storage (replace with database later)
let admins = [];
let subscribers = [];

// Helper function to set cookie (no Secure flag for HTTP development)
const setCookie = (res, name, value, maxAge) => {
  res.setHeader('Set-Cookie', `${name}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`);
};

// Helper function to clear cookie
const clearCookie = (res, name) => {
  res.setHeader('Set-Cookie', `${name}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
};

// ========== ADMIN ENDPOINTS ==========

// Bootstrap first admin
app.post('/api/admin/bootstrap', (req, res) => {
  const { email, password } = req.body;
  const bootstrapToken = req.headers['x-bootstrap-token'];

  if (bootstrapToken !== 'ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c') {
    return res.status(403).json({ error: 'Invalid bootstrap token' });
  }

  if (admins.length > 0) {
    return res.status(400).json({ error: 'Admin already exists' });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const admin = { id: uuid(), email, password, role: 'admin' };
  admins.push(admin);

  // Set cookie
  setCookie(res, 'tc_admin', admin.id, 28800);

  res.json({ ok: true, message: 'Admin created successfully' });
});

// Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const admin = admins.find(a => a.email === email && a.password === password);

  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  setCookie(res, 'tc_admin', admin.id, 28800);

  res.json({ ok: true, message: 'Logged in successfully' });
});

// Get session
app.get('/api/admin/me', (req, res) => {
  const cookie = req.headers.cookie;
  if (!cookie) return res.status(401).json({ error: 'Unauthorized' });

  const adminId = cookie.split('tc_admin=')[1]?.split(';')[0];
  const admin = admins.find(a => a.id === adminId);

  if (!admin) return res.status(401).json({ error: 'Unauthorized' });

  res.json({ id: admin.id, email: admin.email, role: admin.role });
});

// Logout
app.post('/api/admin/logout', (req, res) => {
  clearCookie(res, 'tc_admin');
  res.json({ ok: true, message: 'Logged out' });
});

// ========== NEWSLETTER ENDPOINTS ==========

// Subscribe
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email } = req.body;

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  if (subscribers.find(s => s.email === email)) {
    return res.status(400).json({ error: 'Already subscribed' });
  }

  const subscriber = {
    id: uuid(),
    email,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  subscribers.push(subscriber);

  res.json({ ok: true, message: 'Subscribed successfully' });
});

// List subscribers (admin only)
app.get('/api/admin/subscribers', (req, res) => {
  const cookie = req.headers.cookie;
  if (!cookie) return res.status(401).json({ error: 'Unauthorized' });

  const adminId = cookie.split('tc_admin=')[1]?.split(';')[0];
  if (!admins.find(a => a.id === adminId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const q = req.query.q;
  const limit = Math.min(parseInt(req.query.limit || '100'), 1000);
  const offset = parseInt(req.query.offset || '0');

  let filtered = subscribers;
  if (q) {
    filtered = subscribers.filter(s => s.email.toLowerCase().includes(q.toLowerCase()));
  }

  const paginated = filtered.slice(offset, offset + limit);

  res.json({
    subscribers: paginated,
    total: filtered.length,
  });
});

// Toggle subscriber
app.patch('/api/admin/subscribers/:id', (req, res) => {
  const cookie = req.headers.cookie;
  if (!cookie) return res.status(401).json({ error: 'Unauthorized' });

  const adminId = cookie.split('tc_admin=')[1]?.split(';')[0];
  if (!admins.find(a => a.id === adminId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const subscriber = subscribers.find(s => s.id === req.params.id);
  if (!subscriber) return res.status(404).json({ error: 'Not found' });

  subscriber.is_active = req.body.is_active;
  subscriber.updated_at = new Date().toISOString();

  res.json({ ok: true, message: 'Updated' });
});

// Delete subscriber
app.delete('/api/admin/subscribers/:id', (req, res) => {
  const cookie = req.headers.cookie;
  if (!cookie) return res.status(401).json({ error: 'Unauthorized' });

  const adminId = cookie.split('tc_admin=')[1]?.split(';')[0];
  if (!admins.find(a => a.id === adminId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  subscribers = subscribers.filter(s => s.id !== req.params.id);

  res.json({ ok: true, message: 'Deleted' });
});

// Export CSV
app.get('/api/admin/subscribers/export', (req, res) => {
  const cookie = req.headers.cookie;
  if (!cookie) return res.status(401).json({ error: 'Unauthorized' });

  const adminId = cookie.split('tc_admin=')[1]?.split(';')[0];
  if (!admins.find(a => a.id === adminId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const lines = ['"Email","Actif","Date d\'inscription"'];
  subscribers.forEach(s => {
    const date = new Date(s.created_at).toLocaleDateString('fr-FR');
    const status = s.is_active ? 'Oui' : 'Non';
    lines.push(`"${s.email}","${status}","${date}"`);
  });

  const csv = lines.join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="newsletter_${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Bootstrap token: ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c`);
});
