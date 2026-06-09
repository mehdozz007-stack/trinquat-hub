-- Abonnés newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_news_active ON newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_news_created ON newsletter_subscribers(created_at DESC);

-- Comptes admin
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','superadmin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Trigger pour updated_at
CREATE TRIGGER IF NOT EXISTS news_updated
AFTER UPDATE ON newsletter_subscribers
BEGIN
  UPDATE newsletter_subscribers SET updated_at = datetime('now') WHERE id = NEW.id;
END;
