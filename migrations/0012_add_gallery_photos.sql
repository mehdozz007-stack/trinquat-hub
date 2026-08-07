-- Add gallery photos
DELETE FROM gallery;

INSERT INTO gallery (id, title, image_url, image_key, order_index, created_at, updated_at) VALUES
('g-1', 'Trinquat & Compagnie - Moments en commun', '/assets/gallery-6.jpg', 'gallery-6.jpg', 1, datetime('now'), datetime('now')),
('g-2', 'Événement du quartier - 17 Novembre 2024', '/assets/2024-11-17_011.jpg', '2024-11-17_011.jpg', 2, datetime('now'), datetime('now')),
('g-3', 'Voisins réunis sous un arbre', '/assets/gallery-8.jpg', 'gallery-8.jpg', 3, datetime('now'), datetime('now')),
('g-4', 'Fête de la soupe - 16 Novembre 2025', '/assets/2025-11-16_024.jpg', '2025-11-16_024.jpg', 4, datetime('now'), datetime('now')),
('g-5', 'Moments du quartier - 17 Novembre 2024', '/assets/2024-11-17_051.jpg', '2024-11-17_051.jpg', 5, datetime('now'), datetime('now')),
('g-6', 'La fête intergénérationnelle de la soupe', '/assets/gallery-9.jpg', 'gallery-9.jpg', 6, datetime('now'), datetime('now')),
('g-7', 'Vide-grenier de printemps', '/assets/vide-grenier1.jpg', 'vide-grenier1.jpg', 7, datetime('now'), datetime('now')),
('g-8', 'Vide-grenier de printemps', '/assets/Vide-grenier2.jpg', 'Vide-grenier2.jpg', 8, datetime('now'), datetime('now')),
('g-9', 'Moments partagés - 25 Janvier 2025', '/assets/2025-01-25_029.jpg', '2025-01-25_029.jpg', 9, datetime('now'), datetime('now')),
('g-10', 'Composteur installé dans le quartier', '/assets/gallery-1.jpg', 'gallery-1.jpg', 10, datetime('now'), datetime('now')),
('g-11', 'Moments partagés - 25 Janvier 2025', '/assets/2025-01-25_031.jpg', '2025-01-25_031.jpg', 11, datetime('now'), datetime('now')),
('g-12', 'Moments du quartier - 25 Janvier 2025', '/assets/2025-01-25_062.jpg', '2025-01-25_062.jpg', 12, datetime('now'), datetime('now')),
('g-13', 'Moments du quartier - 25 Janvier 2025', '/assets/2025-01-25_039.jpg', '2025-01-25_039.jpg', 13, datetime('now'), datetime('now')),
('g-14', 'Moments du quartier - 23 Novembre 2025', '/assets/2025-11-23_016.jpg', '2025-11-23_016.jpg', 14, datetime('now'), datetime('now')),
('g-15', 'Événement du quartier - 8 Octobre 2024', '/assets/2024-10-08_053.jpg', '2024-10-08_053.jpg', 15, datetime('now'), datetime('now')),
('g-16', 'Événement du quartier - 9 Octobre 2024', '/assets/2024-10-09_001.jpg', '2024-10-09_001.jpg', 16, datetime('now'), datetime('now')),
('g-17', 'Moments du quartier - 8 Mars 2026', '/assets/2026-03-08_006.jpg', '2026-03-08_006.jpg', 17, datetime('now'), datetime('now')),
('g-18', 'Moments du quartier - 8 Mars 2026', '/assets/2026-03-08_017.jpg', '2026-03-08_017.jpg', 18, datetime('now'), datetime('now')),
('g-19', 'Moments du quartier - 8 Mars 2026', '/assets/2026-03-08_015.jpg', '2026-03-08_015.jpg', 19, datetime('now'), datetime('now')),
('g-20', 'Trinquat & Compagnie - Notre communauté', '/assets/Triquat_CompagnieVoisins.jpg', 'Triquat_CompagnieVoisins.jpg', 20, datetime('now'), datetime('now'));
