PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0001_init.sql','2026-06-20 18:13:28');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(2,'0001_init_schema.sql','2026-07-08 12:25:51');
CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
INSERT INTO "admins" ("id","email","password_hash","role","created_at","updated_at") VALUES('1969b936-9283-49ee-9c38-a199dd5866b8','contact@trinquatetcompagnie.fr','aiguerelles34070','admin','2026-07-07T20:10:14.752Z','2026-07-07T20:10:14.752Z');
INSERT INTO "admins" ("id","email","password_hash","role","created_at","updated_at") VALUES('dad81932-1637-4a4f-b02e-8eb96f57b6b1','admin@trinquat.fr','test123','admin','2026-08-01T10:43:03.570Z','2026-08-01T10:43:03.570Z');
CREATE TABLE newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE newsletter_drafts (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);
CREATE TABLE newsletter_sent (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  recipient_count INTEGER NOT NULL,
  sent_at TEXT NOT NULL,
  status TEXT DEFAULT 'sent', 
  error_message TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE admin_sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);
CREATE TABLE subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
INSERT INTO "subscribers" ("id","email","is_active","created_at","updated_at") VALUES('de905e76-d793-45ed-9a1a-9818bf799ee1','mehdi-z1@outlook.fr',1,'2026-07-08T13:10:26.954Z','2026-07-08T13:10:26.954Z');
CREATE TABLE drafts (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);
INSERT INTO "drafts" ("id","admin_id","subject","content","created_at","updated_at") VALUES('50f2b7de-0997-466b-8778-8257e3a77cb3','1969b936-9283-49ee-9c38-a199dd5866b8','Les nouvelles de Juillet','Plein d''acticités et d''ateliers','2026-08-07T11:04:49.726Z','2026-08-07T11:04:49.726Z');
CREATE TABLE sent_newsletters (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipient_count INTEGER DEFAULT 0,
  sent_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TEXT NOT NULL,
  place TEXT,
  badge TEXT,
  image_url TEXT,
  image_key TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
, category TEXT DEFAULT 'Événement');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('past-extra-3','Conférence : Écologie Urbaine','Discussion sur les initiatives écologiques du quartier avec experts locaux.','2025-08-12','Salle des Fêtes','Écologie',NULL,NULL,'draft','2025-08-12T00:00:00Z','2025-07-01T00:00:00Z','2026-08-06T08:12:05.878Z','Écologie');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('past-extra-4','Randonnée Guidée du Quartier','Découvrez les secrets et histoires cachées du quartier lors d''une randonnée guidée.','2025-07-28','Départ Square des Aiguerelles','Vie de quartier',NULL,NULL,'draft','2025-07-28T00:00:00Z','2025-06-01T00:00:00Z','2026-08-06T08:12:08.361Z','Vie de quartier');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('past-extra-5','Soirée Culturelle : Musique et Danse','Soirée festive avec performances musicales et danse locale.','2025-06-14','Parc Central','Fête',NULL,NULL,'draft','2025-06-14T00:00:00Z','2025-05-01T00:00:00Z','2026-08-06T08:12:10.928Z','Fête');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('past-extra-6','Atelier : Jardin Partagé','Apprentissez à cultiver vos propres légumes dans le jardin communautaire.','2025-05-30','Jardin Partagé des Aiguerelles','Écologie',NULL,NULL,'draft','2025-05-30T00:00:00Z','2025-04-01T00:00:00Z','2026-08-06T08:12:13.990Z','Écologie');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('past-extra-7','Forum Citoyen Trimestriel','Débat ouvert sur l''avenir du quartier avec les habitants et élus.','2025-04-25','Mairie Annexe','Vie de quartier',NULL,NULL,'draft','2025-04-25T00:00:00Z','2025-03-01T00:00:00Z','2026-08-06T08:12:17.911Z','Vie de quartier');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('past-extra-8','Nettoyage Collectif du Quartier','Mobilisation citoyenne pour nettoyer et embellir nos espaces publics.','2025-03-22','Tout le quartier','Initiatives',NULL,NULL,'draft','2025-03-22T00:00:00Z','2025-02-01T00:00:00Z','2026-08-06T08:12:20.993Z','Initiatives');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('past-extra-9','Projections Cinéma en Plein Air','Soirée cinéma communautaire sous les étoiles avec popcorn gratuit.','2024-09-15','Square des Aiguerelles','Événement',NULL,NULL,'draft','2024-09-15T00:00:00Z','2024-08-01T00:00:00Z','2026-08-06T08:12:00.861Z','Événement');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('past-extra-10','Tournoi de Football Amical','Compétition amicale entre équipes du quartier avec barbecue d''après-match.','2024-07-10','City Stade des Aiguerelles','Fête',NULL,NULL,'draft','2024-07-10T00:00:00Z','2024-06-01T00:00:00Z','2026-08-06T08:11:57.167Z','Fête');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('static-1','Rencontre','Une rencontre magique avec la communauté locale.','2026-07-09','Square des Aiguerelles','Événement','/api/admin/image/events%2Fevents-1786009205281-gallery-8.jpg','events/events-1786009205281-gallery-8.jpg','published','2026-07-09T00:00:00Z','2026-01-01T00:00:00Z','2026-08-06T09:40:09.699Z','Événement');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('static-3','Affiche Vide Grenier','Un vide-grenier à ne pas manquer pour dénicher des trésors et rencontrer vos voisins.','2026-04-12','École Charles Dickens les Aiguerelles','Vie de quartier','/api/admin/image/events%2Fevents-1786009221622-vide-grenier.jpg','events/events-1786009221622-vide-grenier.jpg','published','2026-04-12T00:00:00Z','2026-01-01T00:00:00Z','2026-08-06T09:40:23.743Z','Vie de quartier');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('static-4','Affiche Marathon Photo : capturez l''essence du quartier !','Rassemblez vos appareils photo et explorez le quartier à travers votre objectif.','2026-03-15','Tout le quartier','Passé','/api/admin/image/events%2Fevents-1786009234367-gallery-10.jpg','events/events-1786009234367-gallery-10.jpg','published','2026-03-15T00:00:00Z','2026-01-01T00:00:00Z','2026-08-06T16:54:47.605Z','Initiatives');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('static-5','Un nouveau composteur pour le quartier, à côté du city stade !','Un composteur a été installé pour encourager le compostage et réduire les déchets organiques.','2026-01-01','City Stade des Aiguerelles','Écologie','/api/admin/image/events%2Fevents-1786009246015-2025-01-25_029.jpg','events/events-1786009246015-2025-01-25_029.jpg','published','2026-01-01T00:00:00Z','2026-01-01T00:00:00Z','2026-08-06T09:44:19.115Z','Écologie');
INSERT INTO "events" ("id","title","description","event_date","place","badge","image_url","image_key","status","published_at","created_at","updated_at","category") VALUES('static-6','Fête/faites de la soupe : un succès intergénérationnel !','Les habitants se sont réunis pour partager des moments conviviaux autour de la soupe à cuisiner.','2025-11-16','Square des Aiguerelles','Fête','/api/admin/image/events%2Fevents-1786009265101-2024-11-17_011.jpg','events/events-1786009265101-2024-11-17_011.jpg','published','2025-11-16T00:00:00Z','2025-11-01T00:00:00Z','2026-08-06T09:44:31.090Z','Fête');
CREATE TABLE news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  tag TEXT,
  news_date TEXT NOT NULL,
  image_url TEXT,
  image_key TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
, category TEXT DEFAULT 'Actualité');
CREATE TABLE gallery (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  image_key TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',2);
CREATE INDEX idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_subscribers_active ON newsletter_subscribers(is_active);
CREATE INDEX idx_drafts_admin ON newsletter_drafts(admin_id);
CREATE INDEX idx_drafts_updated ON newsletter_drafts(updated_at DESC);
CREATE INDEX idx_sent_admin ON newsletter_sent(admin_id);
CREATE INDEX idx_sent_date ON newsletter_sent(sent_at DESC);
CREATE INDEX idx_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX idx_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX idx_drafts_admin_id ON drafts(admin_id);
CREATE INDEX idx_sent_newsletters_admin_id ON sent_newsletters(admin_id);
CREATE INDEX idx_events_status_date ON events(status, event_date);
CREATE INDEX idx_news_status_date ON news(status, news_date);
CREATE INDEX idx_gallery_order ON gallery(order_index);
