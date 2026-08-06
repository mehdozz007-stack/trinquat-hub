-- Add static events from the component to the database

INSERT INTO events (id, title, description, event_date, place, badge, status, published_at, created_at, updated_at)
VALUES
  ('static-1', 'Rencontre', 'Une rencontre magique avec la communauté locale.', '2026-07-09', 'Square des Aiguerelles', 'Événement', 'published', '2026-07-09T00:00:00Z', '2026-01-01T00:00:00Z', '2026-07-09T00:00:00Z'),
  ('static-3', 'Affiche Vide Grenier', 'Un vide-grenier à ne pas manquer pour dénicher des trésors et rencontrer vos voisins.', '2026-04-12', 'École Charles Dickens les Aiguerelles', 'Vie de quartier', 'published', '2026-04-12T00:00:00Z', '2026-01-01T00:00:00Z', '2026-04-12T00:00:00Z'),
  ('static-4', 'Affiche Marathon Photo : capturez l''essence du quartier !', 'Rassemblez vos appareils photo et explorez le quartier à travers votre objectif.', '2026-03-15', 'Tout le quartier', 'Initiatives', 'published', '2026-03-15T00:00:00Z', '2026-01-01T00:00:00Z', '2026-03-15T00:00:00Z'),
  ('static-5', 'Un nouveau composteur pour le quartier, à côté du city stade !', 'Un composteur a été installé pour encourager le compostage et réduire les déchets organiques.', '2026-01-01', 'City Stade des Aiguerelles', 'Écologie', 'published', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
  ('static-6', 'Fête/faites de la soupe : un succès intergénérationnel !', 'Les habitants se sont réunis pour partager des moments conviviaux autour de la soupe à cuisiner.', '2025-11-16', 'Square des Aiguerelles', 'Fête', 'published', '2025-11-16T00:00:00Z', '2025-11-01T00:00:00Z', '2025-11-16T00:00:00Z');
