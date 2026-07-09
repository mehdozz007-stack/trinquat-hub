
# Espace admin — Événements & Actualités (Cloudflare D1)

Backend Cloudflare D1 (comme la newsletter), auth réutilisée (compte `mehdozz007@gmail.com`, cookie JWT existant), upload d'images via **Cloudflare R2** (D1 ne stocke pas de fichiers), statut brouillon/publié, séparation auto passés/à venir pour les événements.

## 1. Base de données (D1)

Nouvelle migration `migrations/0003_content.sql` :

```sql
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TEXT NOT NULL,        -- ISO
  place TEXT,
  badge TEXT,                      -- ex "À venir", "Fête"
  image_url TEXT,                  -- URL publique R2
  image_key TEXT,                  -- clé R2 pour suppression
  status TEXT NOT NULL DEFAULT 'draft', -- draft | published
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS news (
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
);

CREATE INDEX idx_events_status_date ON events(status, event_date);
CREATE INDEX idx_news_status_date ON news(status, news_date);
```

Seed optionnel : reprise des entrées codées en dur dans `Events.tsx` / `News.tsx`.

## 2. Stockage images — Cloudflare R2

- Nouveau binding R2 dans `wrangler.toml` : `MEDIA` → bucket `trinquat-media` (public via custom domain ou `pub-...r2.dev`).
- Endpoint `POST /api/admin/uploads` : reçoit `multipart/form-data`, valide type (jpg/png/webp) et taille (≤ 5 Mo), génère clé `content/{uuid}.{ext}`, upload via `env.MEDIA.put(...)`, renvoie `{ url, key }`.
- Endpoint `DELETE /api/admin/uploads/:key` pour purger une image orpheline.

L'utilisateur devra créer le bucket R2 et fournir son URL publique (ajoutée comme variable `MEDIA_PUBLIC_URL` dans `wrangler.toml`).

## 3. Routes API TanStack Start

Toutes protégées par le middleware admin existant (JWT cookie de la newsletter).

```
src/routes/api/admin/events/
  index.ts        GET (liste tous, filtre status/upcoming), POST (créer)
  $id.ts          GET, PATCH (mise à jour partielle + publish/unpublish), DELETE
src/routes/api/admin/news/
  index.ts        GET, POST
  $id.ts          GET, PATCH, DELETE
src/routes/api/admin/uploads.ts   POST (image)
```

Routes publiques (pour le site) :
```
src/routes/api/events.ts          GET  ?scope=upcoming|past (status=published)
src/routes/api/news.ts            GET  (status=published, tri desc)
```

Validation Zod dans `src/server/validation.server.ts` (schémas `EventInput`, `NewsInput`).

## 4. Frontend public

- `src/components/site/Events.tsx` : `useQuery` sur `/api/events?scope=upcoming`, fallback vers le tableau statique si l'API est vide (pour ne rien casser en dev). Rendu inchangé, même design tokens et animations.
- `src/components/site/News.tsx` et `ActualitesPreview.tsx` : idem sur `/api/news`.
- Les images pointent vers l'URL R2 (avec `loading="lazy"`).

## 5. Interface admin

Nouvelle page `src/routes/admin.content.tsx` (accessible depuis un bouton ajouté dans `admin.newsletter.tsx` — même auth guard).

Structure :
- Onglets **Événements** / **Actualités** (composant `Tabs` shadcn).
- Chaque onglet : bandeau stats (à venir / publiés / brouillons), bouton **+ Nouveau**, table avec titre, date, statut (badge draft/published), actions (éditer, publier/dépublier, supprimer).
- Dialog `EventEditor` / `NewsEditor` :
  - champs : titre, description/extrait (textarea), date (DatePicker shadcn), lieu / tag, badge, statut.
  - zone d'upload image (drag & drop → `POST /api/admin/uploads`), aperçu, bouton "Retirer".
  - actions "Enregistrer brouillon" / "Publier".
- Toasts (sonner) sur succès/erreur, confirmation avant suppression.

## 6. Nettoyage / cohérence

- Ajouter un lien "Contenu du site" dans le header de `admin.newsletter.tsx` et vice-versa.
- Types partagés dans `src/types/content.ts`.
- Le middleware auth admin existant est réutilisé — pas de nouveau compte.

## Détails techniques

- IDs générés via `crypto.randomUUID()` côté worker.
- Dates stockées en ISO `YYYY-MM-DD` pour tri lexicographique.
- `scope=upcoming` : `WHERE event_date >= date('now') AND status='published' ORDER BY event_date ASC`. `scope=past` : `< date('now') ORDER BY event_date DESC`.
- Upload R2 : `env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType } })`.
- Suppression : purge de l'image R2 avant DELETE SQL.
- Client : React Query (`@tanstack/react-query` déjà utilisé) pour cache et invalidations.

## Ce dont j'ai besoin de vous après implémentation

1. Créer le bucket R2 `trinquat-media` dans le dashboard Cloudflare et activer l'accès public.
2. Me fournir l'URL publique R2 (ex : `https://pub-xxx.r2.dev` ou domaine perso) pour la coller dans `wrangler.toml` (`MEDIA_PUBLIC_URL`).
3. `wrangler d1 migrations apply trinquat_newsletter` pour appliquer la migration 0003.

Confirmez-vous ce plan ?
