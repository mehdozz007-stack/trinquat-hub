-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Drafts table
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- Sent newsletters table
CREATE TABLE IF NOT EXISTS sent_newsletters (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipient_count INTEGER DEFAULT 0,
  sent_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_drafts_admin_id ON drafts(admin_id);
CREATE INDEX IF NOT EXISTS idx_sent_newsletters_admin_id ON sent_newsletters(admin_id);
