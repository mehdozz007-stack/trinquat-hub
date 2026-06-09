# 🚀 Prompt GitHub Copilot — Migration Newsletter Supabase → Cloudflare D1

> **Objectif** : remplacer intégralement Supabase (DB + Auth) par **Cloudflare D1 (SQLite)** + une authentification admin **JWT maison** sur **Cloudflare Workers**, dans un projet **TanStack Start + Vite + React 19 + Tailwind v4** déployé sur Cloudflare Workers.

---

## 📋 Contexte du projet

- Stack : **TanStack Start v1**, **Vite 7**, **React 19**, **Tailwind v4**, déploiement **Cloudflare Workers** (nitro preset cloudflare).
- Site : association de quartier **« Trinquat & Compagnie »** (FR), design premium (gradients `bg-gradient-leaf`, classe `grain`, `shadow-elegant`, `shadow-glow`, tokens sémantiques `--primary`, `--primary-foreground`, etc. définis dans `src/styles.css`).
- Routing : fichiers dans `src/routes/` (générés par `@tanstack/react-router` Vite plugin → `src/routeTree.gen.ts`).
- Existant à migrer :
  - `src/components/site/Newsletter.tsx` — formulaire d'inscription public
  - `src/routes/admin.login.tsx` — page de connexion admin
  - `src/routes/admin.newsletter.tsx` — dashboard (liste, recherche, toggle actif, suppression, export CSV)
  - Migrations SQL Supabase : tables `newsletter_subscribers`, `user_roles`, fonction `has_role`, enum `app_role`
- À supprimer entièrement : tous les fichiers `src/integrations/supabase/*`, le dossier `supabase/`, les variables d'env `VITE_SUPABASE_*` / `SUPABASE_*` dans `.env`, et toute dépendance `@supabase/*` du `package.json`.

---

## 🎯 Cible technique

| Aspect | Avant (Supabase) | Après (Cloudflare) |
|---|---|---|
| Base de données | Postgres managé | **D1 (SQLite serverless)** binding `DB` |
| Auth admin | `supabase.auth` (email/password) | **JWT HS256** maison, cookie `httpOnly` + bcrypt côté Worker |
| Client front | `@supabase/supabase-js` | `fetch('/api/...')` natif |
| Endpoints serveur | RLS + PostgREST | **TanStack server routes** sous `src/routes/api/...` |
| Rôles | table `user_roles` + RLS | colonne `role TEXT` sur `admins` (ou table à part) |
| Secrets | `.env` Supabase | `wrangler secret put` (`JWT_SECRET`, `ADMIN_BOOTSTRAP_TOKEN`) |

---

## 🗂️ Livrables attendus

### 1. Schéma D1 — `migrations/0001_init.sql`

```sql
-- Abonnés newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,                          -- uuid v4 généré côté Worker (crypto.randomUUID)
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  is_active INTEGER NOT NULL DEFAULT 1,         -- 0 / 1
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_news_active ON newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_news_created ON newsletter_subscribers(created_at DESC);

-- Comptes admin
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,                  -- bcrypt
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','superadmin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Trigger updated_at
CREATE TRIGGER IF NOT EXISTS news_updated
AFTER UPDATE ON newsletter_subscribers
BEGIN
  UPDATE newsletter_subscribers SET updated_at = datetime('now') WHERE id = NEW.id;
END;
```

### 2. `wrangler.toml` (compléter / créer)

```toml
name = "trinquat-compagnie"
main = ".output/server/index.mjs"
compatibility_date = "2025-05-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "trinquat_newsletter"
database_id = "REPLACE_WITH_D1_ID"
migrations_dir = "migrations"

# Secrets (à définir via `wrangler secret put`) :
#   JWT_SECRET              → clé HS256 (>= 32 octets aléatoires)
#   ADMIN_BOOTSTRAP_TOKEN   → token éphémère pour créer le 1er admin
```

### 3. Helpers serveur (TOUS en `*.server.ts` — interdit côté client)

#### `src/server/db.server.ts`
```ts
import { getRequestEvent } from '@tanstack/react-start/server';

export function getDB(): D1Database {
  const event = getRequestEvent();
  // @ts-ignore - bindings Cloudflare exposés via event.context
  const db = event?.context?.cloudflare?.env?.DB ?? (globalThis as any).DB;
  if (!db) throw new Error('D1 binding "DB" introuvable');
  return db as D1Database;
}
```
> Adapter selon la façon dont le preset nitro-cloudflare-workers expose `env` (vérifier `nitro` runtime → généralement `event.context.cloudflare.env`).

#### `src/server/auth.server.ts`
- `hashPassword(pw)` / `verifyPassword(pw, hash)` → utiliser **`bcryptjs`** (compatible Worker, pas de natif).
- `signJWT(payload, secret, expSeconds = 60*60*8)` et `verifyJWT(token, secret)` en **HS256** via **`jose`** (compat edge).
- `getSessionCookie(request)` / `serializeSessionCookie(token, maxAge)` (cookie `tc_admin`, `HttpOnly; Secure; SameSite=Lax; Path=/`).
- `requireAdmin(request)` → décode le cookie, vérifie JWT, retourne `{ id, email, role }` ou jette `Response 401`.

#### `src/server/validation.server.ts`
- Schémas **Zod** : `EmailSchema = z.string().email().max(254).toLowerCase().trim()`, `PasswordSchema = z.string().min(8).max(128)`.

### 4. Server routes TanStack — `src/routes/api/...`

| Route | Méthode | Auth | Rôle |
|---|---|---|---|
| `api/newsletter/subscribe.ts` | POST | publique | insère email (gère duplicate UNIQUE → renvoie message FR) |
| `api/admin/login.ts` | POST | publique | vérifie bcrypt, pose cookie JWT |
| `api/admin/logout.ts` | POST | admin | efface cookie |
| `api/admin/me.ts` | GET | admin | renvoie `{ email, role }` |
| `api/admin/bootstrap.ts` | POST | header `x-bootstrap-token` == `ADMIN_BOOTSTRAP_TOKEN` | crée le 1er admin si table vide |
| `api/admin/subscribers/index.ts` | GET | admin | liste paginée + recherche (`?q=&limit=&offset=`) |
| `api/admin/subscribers/$id.ts` | PATCH (toggle is_active), DELETE | admin | |
| `api/admin/subscribers/export.ts` | GET | admin | renvoie `text/csv` (BOM UTF-8) |

**Patron à respecter** (exemple `subscribe.ts`) :

```ts
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { getDB } from '@/server/db.server';
import { EmailSchema } from '@/server/validation.server';

export const Route = createFileRoute('/api/newsletter/subscribe')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const parsed = z.object({ email: EmailSchema }).safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: 'Email invalide.' }, { status: 400 });
        }
        const db = getDB();
        const id = crypto.randomUUID();
        try {
          await db.prepare(
            'INSERT INTO newsletter_subscribers (id, email) VALUES (?1, ?2)'
          ).bind(id, parsed.data.email).run();
          return Response.json({ ok: true });
        } catch (e: any) {
          if (String(e?.message).includes('UNIQUE')) {
            return Response.json({ error: 'Cet email est déjà inscrit.' }, { status: 409 });
          }
          return Response.json({ error: 'Erreur serveur.' }, { status: 500 });
        }
      },
    },
  },
});
```

### 5. Adaptations front (conserver design + animations framer-motion)

- **`src/components/site/Newsletter.tsx`** : remplacer l'appel `supabase.from(...).insert(...)` par :
  ```ts
  const res = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  const data = await res.json();
  if (!res.ok) { setStatus('error'); setMessage(data.error ?? 'Erreur.'); }
  else { setStatus('success'); setMessage('Merci ! Vous êtes bien inscrit·e.'); setEmail(''); }
  ```
  ➜ **Ne pas toucher** au JSX/animations/classes Tailwind existants.

- **`src/routes/admin.login.tsx`** : remplacer `supabase.auth.signInWithPassword` par `POST /api/admin/login`. Au montage, `GET /api/admin/me` → si 200, redirect `/admin/newsletter`. Retirer le bouton « créer un compte » (le bootstrap se fait via curl + `ADMIN_BOOTSTRAP_TOKEN`).

- **`src/routes/admin.newsletter.tsx`** :
  - Au montage : `GET /api/admin/me` → si 401, redirect login.
  - Liste : `GET /api/admin/subscribers?q=...`.
  - Toggle : `PATCH /api/admin/subscribers/:id` body `{ is_active }`.
  - Delete : `DELETE /api/admin/subscribers/:id`.
  - Export CSV : `window.location.href = '/api/admin/subscribers/export'` (téléchargement direct serveur).
  - Logout : `POST /api/admin/logout` puis `navigate('/admin/login')`.
  - **Conserver intégralement** le design (StatCards, table, gradients, classes `bg-gradient-leaf`, `shadow-elegant`, etc.).

### 6. Suppressions strictes

```bash
rm -rf src/integrations/supabase
rm -rf supabase
# package.json : retirer @supabase/supabase-js
# .env : retirer toutes les clés VITE_SUPABASE_* / SUPABASE_*
# src/start.ts : retirer l'import et l'enregistrement de attachSupabaseAuth
```
Rechercher `rg -n "supabase" src/` doit retourner **0 résultat** après migration.

### 7. Bootstrap du 1er admin (à documenter dans README)

```bash
wrangler d1 execute trinquat_newsletter --remote --file=migrations/0001_init.sql
wrangler secret put JWT_SECRET             # coller 64 chars random
wrangler secret put ADMIN_BOOTSTRAP_TOKEN  # coller un token éphémère

curl -X POST https://<domaine>/api/admin/bootstrap \
  -H "x-bootstrap-token: <ADMIN_BOOTSTRAP_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trinquat.fr","password":"MotDePasseFort123!"}'

# Puis SUPPRIMER le secret de bootstrap :
wrangler secret delete ADMIN_BOOTSTRAP_TOKEN
```

### 8. Dépendances à installer

```bash
bun add jose bcryptjs zod
bun add -d @types/bcryptjs @cloudflare/workers-types
bun remove @supabase/supabase-js
```

Ajouter dans `tsconfig.json` → `compilerOptions.types`: `["@cloudflare/workers-types", "vite/client"]`.

---

## ✅ Critères d'acceptation

1. `rg supabase src/` ne retourne **rien**.
2. `bun run build` passe sans erreur.
3. Le formulaire newsletter de la page d'accueil insère bien dans D1 (vérifiable via `wrangler d1 execute trinquat_newsletter --remote --command "SELECT * FROM newsletter_subscribers"`).
4. `/admin/login` → connexion JWT cookie, redirige sur `/admin/newsletter`.
5. Dashboard admin : liste, recherche, toggle actif/inactif, suppression, **export CSV téléchargeable**.
6. Routes admin renvoient **401** si cookie absent / JWT invalide / expiré.
7. Aucun secret côté client (`VITE_*` ne contient que des valeurs publiques).
8. Validation Zod sur **tous** les endpoints (email max 254, password min 8).
9. Cookie session : `HttpOnly`, `Secure`, `SameSite=Lax`, expiration 8 h.
10. Design **strictement identique** à l'existant (tokens, gradients, animations Framer Motion conservés).

---

## 🔒 Sécurité — checklist obligatoire

- [ ] `bcryptjs` avec `saltRounds >= 10`.
- [ ] JWT HS256, secret ≥ 256 bits, `exp` ≤ 8 h.
- [ ] Cookie `HttpOnly + Secure + SameSite=Lax`.
- [ ] Aucune fuite de PII sur les routes publiques.
- [ ] Pas de SQL string concat → **uniquement `db.prepare(...).bind(...)`**.
- [ ] Rate limiting basique sur `/api/newsletter/subscribe` et `/api/admin/login` (ex. KV counter ou `cf.colo` + IP) — optionnel V2.
- [ ] CORS : routes `/api/*` même origine, donc pas de header CORS nécessaire.

---

## 📁 Arborescence finale attendue

```
migrations/
  0001_init.sql
src/
  server/
    auth.server.ts
    db.server.ts
    validation.server.ts
  routes/
    api/
      newsletter/
        subscribe.ts
      admin/
        login.ts
        logout.ts
        me.ts
        bootstrap.ts
        subscribers/
          index.ts
          $id.ts
          export.ts
    admin.login.tsx        ← refactor, design conservé
    admin.newsletter.tsx   ← refactor, design conservé
  components/site/
    Newsletter.tsx         ← refactor minimal (fetch au lieu de supabase)
wrangler.toml
```

---

**Copilot, exécute la migration ci-dessus intégralement, sans dévier du design existant ni introduire de dépendances Node-only incompatibles avec Cloudflare Workers (pas de `bcrypt` natif, pas de `jsonwebtoken` — utiliser `bcryptjs` + `jose`).**
