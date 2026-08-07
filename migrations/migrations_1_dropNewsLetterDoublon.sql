-- =====================================================
-- TRINQUAT & COMPAGNIE
-- Suppression des anciennes tables newsletter redondantes
-- =====================================================

PRAGMA foreign_keys = ON;

-- Tables supprimées :
-- newsletter_subscribers
-- newsletter_drafts
-- newsletter_sent

DROP TABLE IF EXISTS newsletter_subscribers;
DROP TABLE IF EXISTS newsletter_drafts;
DROP TABLE IF EXISTS newsletter_sent;