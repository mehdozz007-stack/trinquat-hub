const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'trinquat_newsletter.sqlite3');
let db = null;

function initializeDatabase() {
  if (!db) {
    try {
      db = new Database(dbPath);
      db.pragma('foreign_keys = ON');
      console.log('✅ Database connection established');
    } catch (err) {
      console.error('❌ Database initialization failed:', err.message);
      throw err;
    }
  }
  return db;
}

function getDatabase() {
  if (!db) {
    initializeDatabase();
  }
  return db;
}

// ADMIN FUNCTIONS
function createAdmin(id, email, passwordHash) {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO admins (id, email, password_hash, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, email, passwordHash, 'admin', now, now);
  
  return { id, email, role: 'admin', created_at: now, updated_at: now };
}

function getAdminByEmail(email) {
  const db = getDatabase();
  return db.prepare(`
    SELECT id, email, password_hash, role, created_at, updated_at
    FROM admins
    WHERE email = ?
  `).get(email);
}

// NEWSLETTER DRAFTS
function getDrafts(adminId) {
  const db = getDatabase();
  return db.prepare(`
    SELECT id, admin_id, subject, content, saved_at as savedAt, updated_at
    FROM newsletter_drafts
    WHERE admin_id = ?
    ORDER BY updated_at DESC
  `).all(adminId);
}

function saveDraft(adminId, subject, content) {
  const db = getDatabase();
  const id = `draft_${Date.now()}`;
  const now = new Date().toISOString();
  
  // Check if exists
  const existing = db.prepare(`
    SELECT id FROM newsletter_drafts
    WHERE admin_id = ? AND subject = ?
  `).get(adminId, subject);
  
  if (existing) {
    // Update
    db.prepare(`
      UPDATE newsletter_drafts
      SET content = ?, updated_at = ?
      WHERE id = ?
    `).run(content, now, existing.id);
    
    return {
      id: existing.id,
      admin_id: adminId,
      subject,
      content,
      savedAt: now,
      updated_at: now
    };
  } else {
    // Insert
    db.prepare(`
      INSERT INTO newsletter_drafts (id, admin_id, subject, content, saved_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, adminId, subject, content, now, now);
    
    return {
      id,
      admin_id: adminId,
      subject,
      content,
      savedAt: now,
      updated_at: now
    };
  }
}

function deleteDraft(draftId, adminId) {
  const db = getDatabase();
  db.prepare(`
    DELETE FROM newsletter_drafts
    WHERE id = ? AND admin_id = ?
  `).run(draftId, adminId);
  
  return true;
}

// SENT NEWSLETTERS
function getSentNewsletters(adminId) {
  const db = getDatabase();
  return db.prepare(`
    SELECT id, admin_id, subject, content, sent_at as sentAt, recipient_count as recipientCount
    FROM newsletter_sent
    WHERE admin_id = ?
    ORDER BY sent_at DESC
  `).all(adminId);
}

function saveSentNewsletter(adminId, subject, content, recipientCount) {
  const db = getDatabase();
  const id = `nl_${Date.now()}`;
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO newsletter_sent (id, admin_id, subject, content, recipient_count, sent_at, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, adminId, subject, content, recipientCount, now, 'sent', now);
  
  // Remove draft
  db.prepare(`
    DELETE FROM newsletter_drafts
    WHERE admin_id = ? AND subject = ?
  `).run(adminId, subject);
  
  return {
    id,
    admin_id: adminId,
    subject,
    content,
    sentAt: now,
    recipientCount
  };
}

module.exports = {
  initializeDatabase,
  getDatabase,
  createAdmin,
  getAdminByEmail,
  getDrafts,
  saveDraft,
  deleteDraft,
  getSentNewsletters,
  saveSentNewsletter
};
