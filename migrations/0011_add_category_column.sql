-- Add category column to events and news tables to properly separate nature/classification from display badge

ALTER TABLE events ADD COLUMN category TEXT DEFAULT 'Événement';
ALTER TABLE news ADD COLUMN category TEXT DEFAULT 'Actualité';

-- Update existing events with their category based on badge
UPDATE events SET category = badge WHERE badge IS NOT NULL AND badge != '';
UPDATE events SET category = 'Événement' WHERE category IS NULL OR category = '';

-- Update existing news with their category
UPDATE news SET category = tag WHERE tag IS NOT NULL AND tag != '';
UPDATE news SET category = 'Actualité' WHERE category IS NULL OR category = '';
