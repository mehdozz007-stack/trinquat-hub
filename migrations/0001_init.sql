-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ============================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON newsletter_subscribers(is_active);

-- ============================================
-- NEWSLETTER DRAFTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_drafts (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

CREATE INDEX IF NOT EXISTS idx_drafts_admin ON newsletter_drafts(admin_id);
CREATE INDEX IF NOT EXISTS idx_drafts_updated ON newsletter_drafts(updated_at DESC);

-- ============================================
-- NEWSLETTER SENT TABLE (HISTORY)
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_sent (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  recipient_count INTEGER NOT NULL,
  sent_at TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- sent, failed, pending
  error_message TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sent_admin ON newsletter_sent(admin_id);
CREATE INDEX IF NOT EXISTS idx_sent_date ON newsletter_sent(sent_at DESC);

-- ============================================
-- SESSIONS TABLE (Optional: for better session management)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);
