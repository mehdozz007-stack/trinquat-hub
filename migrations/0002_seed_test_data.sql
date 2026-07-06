-- Seed test admin user
INSERT INTO admins (id, email, password_hash, role, created_at, updated_at)
VALUES (
  'admin-test-001',
  'contact@trinquatetcompagnie.fr',
  'poiuytreza4U!',
  'admin',
  datetime('now'),
  datetime('now')
);

-- Seed test subscribers
INSERT INTO subscribers (id, email, is_active, created_at, updated_at)
VALUES 
  ('sub-001', 'user1@example.com', 1, datetime('now'), datetime('now')),
  ('sub-002', 'user2@example.com', 1, datetime('now'), datetime('now')),
  ('sub-003', 'user3@example.com', 0, datetime('now'), datetime('now'));
