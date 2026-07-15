-- Migration: Add contact@trinquatetcompagnie.fr admin
-- Created: 2026-07-15
-- Email: contact@trinquatetcompagnie.fr
-- Password: aiguerelles34070

INSERT OR IGNORE INTO admins (
  id, 
  email, 
  password_hash, 
  role, 
  created_at, 
  updated_at
) VALUES (
  'f1a55c26-7ca5-487c-8d40-3645b756174c',
  'contact@trinquatetcompagnie.fr',
  '$2b$10$m6bD3i/oS1/m9jGhr785WuJ2e4sh3B4k/ADB7uolqJ47SlC47zPgG',
  'admin',
  datetime('now'),
  datetime('now')
);
