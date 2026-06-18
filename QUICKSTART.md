# 🚀 Quick Start - Trinquat Hub

## Démarrer en 30 secondes

```bash
npm run dev
```

Puis ouvrez: **http://localhost:8787**

## Admin Login

1. Allez à **http://localhost:8787/admin/login**
2. Créer le premier admin (dans un nouveau terminal):
```bash
curl -X POST http://localhost:8787/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c" \
  -d '{"email":"admin@local","password":"Pass123!"}'
```
3. Connectez-vous avec ces identifiants

## Architecture

```
src/
├── routes/              # Pages React
│   ├── index.tsx        # Page d'accueil
│   ├── admin.login.tsx  # Login admin
│   └── admin.newsletter.tsx  # Dashboard admin
├── components/
│   ├── site/            # Composants publics
│   └── ui/              # UI library (shadcn)
├── server/
│   ├── routes/api/      # 🔑 API endpoints (Nitro)
│   ├── auth.server.ts   # JWT + bcrypt
│   ├── db.server.ts     # D1 database
│   └── validation.server.ts  # Zod schemas
├── lib/
│   ├── utils.ts
│   └── config.server.ts
styles.css              # Tailwind
```

## Endpoints API

### Public
- `POST /api/newsletter/subscribe` - S'abonner

### Admin (require JWT cookie)
- `POST /api/admin/login` - Se connecter
- `POST /api/admin/bootstrap` - Créer le 1er admin
- `GET /api/admin/me` - Session courante  
- `POST /api/admin/logout` - Se déconnecter
- `GET /api/admin/subscribers` - Liste (search, pagination)
- `PATCH /api/admin/subscribers/:id` - Activer/Désactiver
- `DELETE /api/admin/subscribers/:id` - Supprimer
- `GET /api/admin/subscribers/export` - Exporter CSV

## Stack

- **Frontend**: React 19 + TanStack Router
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Server**: Nitro (TanStack Start)
- **Auth**: JWT (HS256) + bcryptjs + httpOnly cookies
- **DB**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Workers

## Setup Complet

Voir [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) pour:
- Configuration complète
- Déploiement en production
- Troubleshooting
