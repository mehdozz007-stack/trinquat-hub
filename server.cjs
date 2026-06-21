const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { v4: uuid } = require('uuid');
const axios = require('axios');
require('dotenv').config();
const { initializeDatabase, getDatabase, createAdmin, getDrafts, saveDraft, deleteDraft, getSentNewsletters, saveSentNewsletter } = require('./db.cjs');

const app = express();

// Initialize database
initializeDatabase();

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
app.use(cookieParser());

// GLOBAL LOGGING MIDDLEWARE
app.use((req, res, next) => {
  process.stderr.write(`[${new Date().toISOString()}] ${req.method} ${req.path} - Cookie: ${req.headers.cookie || 'none'}\n`);
  next();
});

// In-memory storage (for admins and subscribers)
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
  console.log('📨 Bootstrap endpoint called');
  const { email, password } = req.body;
  console.log('   Email:', email);
  const bootstrapToken = req.headers['x-bootstrap-token'];
  console.log('   Bootstrap token provided:', !!bootstrapToken);

  if (bootstrapToken !== 'ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c') {
    return res.status(403).json({ error: 'Invalid bootstrap token' });
  }

  // Check both in-memory and database for existing admin
  if (admins.length > 0) {
    return res.status(400).json({ error: 'Admin already exists' });
  }

  let db;
  try {
    db = getDatabase();
    console.log('✓ Database connection obtained');
  } catch (err) {
    console.error('❌ Failed to get database:', err.message);
    return res.status(500).json({ error: 'Database unavailable: ' + err.message });
  }

  try {
    console.log('🔍 Looking for existing admin with email:', email);
    const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);
    if (existing) {
      console.log('✓ Found existing admin in DB:', existing.id);
      // Add to in-memory array so subsequent logins work
      const admin = { id: existing.id, email, password, role: 'admin' };
      admins.push(admin);
      setCookie(res, 'tc_admin', admin.id, 28800);
      return res.json({ ok: true, message: 'Admin already exists, logged in' });
    }
    console.log('✗ No existing admin found in DB');
  } catch (err) {
    console.error('❌ Error checking existing admin:', err.message);
    return res.status(500).json({ error: 'Error checking admin: ' + err.message });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const adminId = uuid();
  console.log('📝 Creating new admin with ID:', adminId);
  
  try {
    // Create in database
    createAdmin(adminId, email, password);
    console.log('✓ Admin created successfully in DB');
  } catch (err) {
    console.error('❌ Database error during bootstrap:', err.code, err.message);
    return res.status(500).json({ error: 'Failed to create admin: ' + err.message });
  }
  
  // Also add to memory for compatibility
  const admin = { id: adminId, email, password, role: 'admin' };
  admins.push(admin);

  // Set cookie
  setCookie(res, 'tc_admin', admin.id, 28800);

  res.json({ ok: true, message: 'Admin created successfully' });
});

// Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  console.log('📨 POST /admin/login - Email:', email);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  let admin = admins.find(a => a.email === email && a.password === password);

  // If not in memory, try to load from database
  if (!admin) {
    console.log('   Admin not in memory, checking database...');
    try {
      const db = getDatabase();
      const dbAdmin = db.prepare('SELECT id, email, password_hash FROM admins WHERE email = ?').get(email);
      if (dbAdmin && dbAdmin.password_hash === password) {
        console.log('   ✓ Found in DB, adding to memory. ID:', dbAdmin.id);
        admin = { id: dbAdmin.id, email: dbAdmin.email, password: dbAdmin.password_hash, role: 'admin' };
        admins.push(admin); // Add to memory for subsequent requests
      }
    } catch (err) {
      console.warn('Could not load admin from database:', err.message);
    }
  }

  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Ensure admin exists in database
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM admins WHERE id = ?').get(admin.id);
    if (!existing) {
      db.prepare(`
        INSERT INTO admins (id, email, password_hash, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(admin.id, email, password, 'admin', new Date().toISOString(), new Date().toISOString());
    }
  } catch (err) {
    console.warn('Could not sync admin to database:', err.message);
  }

  setCookie(res, 'tc_admin', admin.id, 28800);

  res.json({ ok: true, message: 'Logged in successfully' });
});

// Get session
app.get('/api/admin/me', (req, res) => {
  const cookie = req.headers.cookie;
  if (!cookie) return res.status(401).json({ error: 'Unauthorized' });

  const adminId = cookie.split('tc_admin=')[1]?.split(';')[0];
  
  try {
    const db = getDatabase();
    const admin = db.prepare('SELECT id, email, role FROM admins WHERE id = ?').get(adminId);
    if (!admin) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ id: admin.id, email: admin.email, role: admin.role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
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
  try {
    const cookie = req.headers.cookie;
    if (!cookie) return res.status(401).json({ error: 'Unauthorized' });

    const adminId = cookie.split('tc_admin=')[1]?.split(';')[0];
    
    const db = getDatabase();
    const admin = db.prepare('SELECT id FROM admins WHERE id = ?').get(adminId);
    if (!admin) {
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
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
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

// ========== NEWSLETTER DRAFT ENDPOINTS ==========

// TEST ENDPOINT - NO AUTH
app.get("/api/test/drafts", (req, res) => {
  try {
    require('fs').writeFileSync('C:\\workspaceMZ\\trinquat-hub\\test-endpoint-reached.txt', `Test endpoint called at ${new Date().toISOString()}`);
    res.json({ message: "Test endpoint works!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/drafts - Récupérer les brouillons
app.get("/api/admin/drafts", (req, res) => {
  try {
    // Try to write to a simple file right away
    require('fs').appendFileSync('C:\\workspaceMZ\\trinquat-hub\\test-write.txt', `Request received: ${new Date().toISOString()}\n`);
    
    const cookie = req.headers.cookie;
    const adminId = cookie?.split('tc_admin=')[1]?.split(';')[0];

    if (!adminId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    // Always use database for GET requests - more reliable than in-memory
    const db = getDatabase();
    const admin = db.prepare('SELECT id, email FROM admins WHERE id = ?').get(adminId);

    if (!admin) {
      return res.status(401).json({ error: "Admin introuvable" });
    }

    const adminDrafts = getDrafts(admin.id);
    res.json({ drafts: adminDrafts });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: err.message });
  }
});

// POST /api/admin/drafts - Sauvegarder un brouillon
app.post("/api/admin/drafts", (req, res) => {
  const { subject, content } = req.body;
  
  // Parse cookie from header (like other endpoints)
  const cookie = req.headers.cookie;
  const adminId = cookie?.split('tc_admin=')[1]?.split(';')[0];

  if (!adminId) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  if (!subject || !content) {
    return res.status(400).json({ error: "Subject et content requis" });
  }

  const admin = admins.find((a) => a.id === adminId);
  if (!admin) {
    return res.status(401).json({ error: "Admin introuvable" });
  }

  try {
    const draft = saveDraft(admin.id, subject, content);
    res.json(draft);
  } catch (err) {
    console.error("Error saving draft:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /api/admin/drafts/:id - Supprimer un brouillon
app.delete("/api/admin/drafts/:id", (req, res) => {
  const { id } = req.params;
  const cookie = req.headers.cookie;
  const adminId = cookie?.split('tc_admin=')[1]?.split(';')[0];

  if (!adminId) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const admin = admins.find((a) => a.id === adminId);
  if (!admin) {
    return res.status(401).json({ error: "Admin introuvable" });
  }

  try {
    deleteDraft(id, admin.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting draft:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/admin/sent-newsletters - Récupérer l'historique
app.get("/api/admin/sent-newsletters", (req, res) => {
  try {
    const cookie = req.headers.cookie;
    const adminId = cookie?.split('tc_admin=')[1]?.split(';')[0];

    if (!adminId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const db = getDatabase();
    const admin = db.prepare('SELECT id FROM admins WHERE id = ?').get(adminId);
    if (!admin) {
      return res.status(401).json({ error: "Admin introuvable" });
    }

    const adminSent = getSentNewsletters(admin.id);
    res.json({ sent: adminSent });
  } catch (err) {
    console.error("Error fetching sent newsletters:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ========== BREVO EMAIL FUNCTION ==========
async function sendViaBrevo(emails, subject, content) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  console.log(`🔍 Brevo Debug: API Key exists: ${!!brevoApiKey}`);
  console.log(`🔍 Brevo Debug: Sender Email: ${senderEmail}`);
  console.log(`🔍 Brevo Debug: Emails to send: ${emails.length}`);

  if (!brevoApiKey) {
    console.error("❌ BREVO_API_KEY not configured in .env.local");
    throw new Error("Email service not configured");
  }

  if (emails.length === 0) {
    console.error("❌ No emails to send");
    throw new Error("No recipient emails provided");
  }

  const results = {
    successful: 0,
    failed: 0,
    errors: [],
  };

  // Send email to each subscriber
  for (const email of emails) {
    try {
      console.log(`📧 Sending email to ${email}...`);
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          to: [{ email }],
          sender: { name: senderName, email: senderEmail },
          subject,
          textContent: content,
          htmlContent: `<p>${content.replace(/\n/g, "<br>")}</p>`,
        },
        {
          headers: {
            "api-key": brevoApiKey,
            "Content-Type": "application/json",
          },
        }
      );
      results.successful++;
      console.log(`✅ Email sent to ${email} - Message ID: ${response.data.messageId}`);
    } catch (err) {
      results.failed++;
      const errorMsg = err.response?.data?.message || err.message;
      results.errors.push(`${email}: ${errorMsg}`);
      console.error(`❌ Failed to send to ${email}:`, {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
    }
  }

  console.log(`📊 Brevo send results: ${results.successful} successful, ${results.failed} failed`);
  if (results.errors.length > 0) {
    console.log(`📋 Errors:`, results.errors);
  }
  return results;
}

// ========== NEWSLETTER SEND ENDPOINT ==========
app.post("/api/admin/newsletter/send", async (req, res) => {
  const { subject, content } = req.body;
  const cookie = req.headers.cookie;
  const adminId = cookie?.split('tc_admin=')[1]?.split(';')[0];

  if (!adminId) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  if (!subject || !content) {
    return res.status(400).json({ error: "Subject et content requis" });
  }

  const admin = admins.find((a) => a.id === adminId);
  if (!admin) {
    return res.status(401).json({ error: "Admin introuvable" });
  }

  const activeSubscribers = subscribers.filter((s) => s.is_active);
  if (activeSubscribers.length === 0) {
    return res.status(400).json({ error: "Aucun abonné actif" });
  }

  try {
    // Get subscriber emails from database
    const db = getDatabase();
    const dbSubscribers = db.prepare('SELECT email FROM subscribers WHERE is_active = 1').all();
    const subscriberEmails = dbSubscribers.map(s => s.email);

    console.log(`📧 Sending newsletter to ${subscriberEmails.length} subscribers via Brevo...`);

    // Send via Brevo
    const sendResults = await sendViaBrevo(subscriberEmails, subject, content);

    // Save newsletter to database
    const newsletter = saveSentNewsletter(admin.id, subject, content, subscriberEmails.length);

    res.json({
      success: true,
      id: newsletter.id,
      recipientCount: newsletter.recipientCount,
      sentAt: newsletter.sentAt,
      brevoResults: sendResults,
    });
  } catch (err) {
    console.error("Error sending newsletter:", err);
    res.status(500).json({ error: "Erreur lors de l'envoi" });
  }
});

// ========== DEBUG ENDPOINTS ==========

// GET /api/admin/test-brevo - Test Brevo configuration
app.get("/api/admin/test-brevo", (req, res) => {
  const brevoKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  console.log("🔍 Testing Brevo configuration...");

  res.json({
    brevoApiKeyConfigured: !!brevoKey,
    brevoApiKeyLength: brevoKey ? brevoKey.length : 0,
    senderEmail,
    senderName: process.env.BREVO_SENDER_NAME,
  });
});

// GET /api/admin/check-subscribers - Check if subscribers exist in database
app.get("/api/admin/check-subscribers", (req, res) => {
  try {
    const db = getDatabase();
    const allSubs = db.prepare("SELECT * FROM subscribers").all();
    const activeSubs = db.prepare("SELECT * FROM subscribers WHERE is_active = 1").all();

    console.log(`📊 Subscribers in DB: ${allSubs.length} total, ${activeSubs.length} active`);

    res.json({
      totalSubscribers: allSubs.length,
      activeSubscribers: activeSubs.length,
      subscribers: allSubs.map(s => ({ email: s.email, is_active: s.is_active })),
    });
  } catch (err) {
    console.error("Error checking subscribers:", err);
    res.status(500).json({ error: "Erreur lors de la vérification" });
  }
});

// POST /api/admin/test-send-email - Test send single email
app.post("/api/admin/test-send-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email requis" });
  }

  try {
    console.log(`📧 Testing email send to: ${email}`);

    const results = await sendViaBrevo(
      [email],
      "🧪 Test Newsletter - Trinquat & Compagnie",
      "Ceci est un email de test pour vérifier que Brevo est correctement configuré."
    );

    res.json({
      success: results.successful > 0,
      results,
    });
  } catch (err) {
    console.error("Error sending test email:", err);
    res.status(500).json({ error: err.message || "Erreur lors de l'envoi du test" });
  }
});

// ========== END DEBUG ENDPOINTS ==========

const PORT = 3002;
app.listen(PORT, () => {
  const fs = require('fs');
  fs.writeFileSync('C:\\workspaceMZ\\trinquat-hub\\server-started.txt', `Server started at ${new Date().toISOString()}`);
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📝 Bootstrap token: ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c`);
});
