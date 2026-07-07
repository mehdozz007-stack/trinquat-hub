# 🚀 Trinquat Hub - Newsletter Platform

## Quick Start (30 secondes)

```bash
npm install
npm run dev          # Terminal 1: Frontend Vite (:5173)
npx wrangler dev --local  # Terminal 2: Backend Worker (:8787)
```

- **Frontend**: http://localhost:5173
- **Backend**: http://127.0.0.1:8787
- **Admin**: http://localhost:5173/admin/login

## Architecture

```
Frontend (React 19 + Vite)      Backend (Cloudflare Worker)     Database (D1 Local)
    :5173                           :8787 (Wrangler)          trinquat_newsletter.db
    ↓                               ↓                         ↓
  Admin UI          ←→    API Endpoints (11)     ←→    Tables (4)
  Newsletter         Bootstrap Admin                  admins
  Subscribers        Login/Logout                     subscribers
  Composer           Newsletter Subscribe            drafts
  History            Admin Management                sent_newsletters
```

## 🔐 Admin Login

### Setup Local Development

```bash
# Terminal 1: Start Frontend
npm run dev

# Terminal 2: Start Backend Worker + D1 Database
npx wrangler dev --local

# Terminal 3 (optional): Apply migrations to local D1
npx wrangler d1 execute trinquat_newsletter --file ./migrations/0001_init_schema.sql --local
npx wrangler d1 execute trinquat_newsletter --file ./migrations/0002_seed_test_data.sql --local
```

### Test Admin Login

Go to **http://localhost:5173/admin/login**

```
Email: admin@trinquat.local
Password: password123
```

### Bootstrap New Admin (curl)

```bash
curl -X POST http://127.0.0.1:8787/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123"
  }'
```

## 📊 API Endpoints

### Authentication (Cloudflare Worker)
- `POST /api/admin/bootstrap` - Créer le premier admin
- `POST /api/admin/login` - Se connecter (retourne cookie `tc_admin`)
- `GET /api/admin/me` - Session courante (nécessite cookie `tc_admin`)
- `POST /api/admin/logout` - Se déconnecter

### Newsletter Public
- `POST /api/newsletter/subscribe` - S'abonner à la newsletter

### Newsletter Admin (cookie `tc_admin` requis)
- `GET /api/admin/subscribers` - Lister les abonnés
- `PATCH /api/admin/subscribers/:id` - Toggle actif/inactif
- `DELETE /api/admin/subscribers/:id` - Supprimer un abonné
- `GET /api/admin/drafts` - Récupérer les brouillons
- `POST /api/admin/drafts` - Sauvegarder un brouillon
- `PATCH /api/admin/drafts/:id` - Modifier un brouillon
- `DELETE /api/admin/drafts/:id` - Supprimer un brouillon
- `GET /api/admin/sent-newsletters` - Historique des envois

## 💾 Base de Données (Cloudflare D1)

### Schéma Tables
```
admins              - Comptes administrateur (id, email, password_hash, role)
subscribers         - Abonnés newsletter (id, email, is_active)
drafts              - Brouillons newsletters (id, admin_id, subject, content)
sent_newsletters    - Historique envois (id, admin_id, subject, recipient_count)
```

### Configuration D1
- **Database ID**: `db2895c7-7a16-4bf3-90b6-72485f80ea94`
- **Binding**: `trinquat_newsletter` (env.trinquat_newsletter)
- **Migrations**: `migrations/0001_init_schema.sql`, `0002_seed_test_data.sql`
- **Config**: `wrangler.toml`
- **Environnement**: WEUR (Europe Ouest)

### Local Development
```bash
# Créer/réinitialiser DB locale
rm -rf .wrangler/state/v3/d1
npx wrangler dev --local

# Exécuter migrations
npx wrangler d1 execute trinquat_newsletter --file ./migrations/0001_init_schema.sql --local
npx wrangler d1 execute trinquat_newsletter --file ./migrations/0002_seed_test_data.sql --local

# Query directement
npx wrangler d1 execute trinquat_newsletter --command "SELECT * FROM admins;" --local
```

## 🎯 Features

### Admin Dashboard (`/admin/newsletter`)

**Tab 1: Abonnés**
- ✅ Liste complète avec stats (actifs, total, désactivés)
- ✅ Recherche par email
- ✅ Toggle actif/désactivé
- ✅ Supprimer
- ✅ Export CSV

**Tab 2: Composer**
- ✅ Sujet + Contenu
- ✅ Aperçu avant/après
- ✅ Bouton "Brouillon" (sauvegarde en BD)
- ✅ Bouton "Envoyer" (envoie + sauvegarde historique)
- ✅ Stats destinataires actifs

**Tab 3: Historique**
- ✅ Onglet Brouillons (editer/supprimer)
- ✅ Onglet Envoyées (date + nombre destinataires)

### Public Newsletter
- ✅ Formulaire d'inscription
- ✅ Validation email
- ✅ Messages de succès/erreur avec animations
- ✅ Transitions fluides

## 🛠️ Tech Stack

**Frontend**
- React 19.2.0
- TanStack Router v1.167.28
- Vite 7.3.3
- Tailwind CSS 4
- Shadcn/ui
- Framer Motion (animations)
- Lucide Icons

**Backend**
- Cloudflare Workers (src/worker.ts)
- Vanilla fetch-based routing
- UUID
- CORS support
- HttpOnly cookies

**Database**
- Cloudflare D1 (SQLite)
- Local: `.wrangler/state/v3/d1/` (via Wrangler dev)
- Remote: Cloudflare D1 (production)

**DevTools**
- TypeScript
- Wrangler 4.103+
- ESLint
- Vite

## 📋 Scripts NPM

```bash
npm run dev          # Frontend Vite (:5173)
npm run build        # Build production (React app -> dist/)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

## 🌐 Wrangler Commands

```bash
# Local Development
npx wrangler dev --local              # Start Worker on :8787 with local D1

# Database Migrations
npx wrangler d1 execute trinquat_newsletter --file ./migrations/0001_init_schema.sql --local
npx wrangler d1 execute trinquat_newsletter --file ./migrations/0002_seed_test_data.sql --local

# Query Database
npx wrangler d1 execute trinquat_newsletter --command "SELECT * FROM admins;" --local

# Production Deployment
npx wrangler deploy                   # Deploy to trinquat-compagnie.mehdozz007.workers.dev
```

## 🚀 Déploiement

### Development Local

**Terminal 1: Frontend**
```bash
npm run dev
# Écoute sur http://localhost:5173
```

**Terminal 2: Backend + D1**
```bash
npx wrangler dev --local
# Écoute sur http://127.0.0.1:8787
# D1 local dans .wrangler/state/v3/d1/
```

**Setup Initial** (une seule fois):
```bash
# Créer les tables
npx wrangler d1 execute trinquat_newsletter --file ./migrations/0001_init_schema.sql --local

# Ajouter données de test
npx wrangler d1 execute trinquat_newsletter --file ./migrations/0002_seed_test_data.sql --local
```

### Production (Cloudflare Pages + Workers)

#### 1. Deploy Frontend (Pages)
```bash
npm run build
npx wrangler pages publish dist --project-name trinquat-hub-main
```

#### 2. Deploy Backend (Worker)
```bash
npx wrangler deploy
# Déploie à trinquat-compagnie.mehdozz007.workers.dev
```

#### 3. Vérifier D1 Production
```bash
# Appliquer migrations en production
npx wrangler d1 execute trinquat_newsletter --file ./migrations/0001_init_schema.sql --remote

# Query en production
npx wrangler d1 execute trinquat_newsletter --command "SELECT COUNT(*) FROM subscribers;" --remote
```

#### 4. Bootstrap Admin Production
```bash
curl -X POST https://trinquat-compagnie.mehdozz007.workers.dev/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trinquatetcompagnie.fr",
    "password": "SecurePassword"
  }'
```

## 📁 Structure du Projet

```
src/
├── worker.ts                   # 🔑 Cloudflare Worker - API backend
├── routes/
│   ├── index.tsx                # Page d'accueil
│   ├── admin.login.tsx          # Login admin
│   ├── admin.newsletter.tsx     # Dashboard admin
│   ├── actualites.tsx
│   ├── association.tsx
│   ├── contact.tsx
│   ├── evenements.tsx
│   ├── galerie.tsx
│   └── __root.tsx
├── components/
│   ├── site/                    # Composants publics
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Events.tsx
│   │   ├── Footer.tsx
│   │   ├── Gallery.tsx
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   ├── News.tsx
│   │   ├── Newsletter.tsx       # 📧 Form inscription
│   │   ├── PageHeader.tsx
│   │   ├── Reveal.tsx
│   │   ├── Stats.tsx
│   │   └── About.tsx
│   └── ui/                      # Shadcn/ui components
├── hooks/
│   └── use-mobile.tsx
├── lib/
│   ├── utils.ts
│   ├── config.server.ts
│   ├── error-page.ts
│   └── api/
│       └── example.functions.ts
├── styles.css                   # Tailwind
├── router.tsx
└── start.ts

migrations/
├── 0001_init_schema.sql         # Créer les 4 tables
└── 0002_seed_test_data.sql      # Données de test (admin + subscribers)

public/
├── robots.txt
├── og-image.jpg                 # OG Preview image
└── maintenance.html             # Maintenance page

Configuration:
├── vite.config.ts               # Proxy API -> 127.0.0.1:8787
├── tsconfig.json
├── eslint.config.js
├── wrangler.toml                # Cloudflare Worker config + D1 binding
├── components.json              # Shadcn config
└── package.json
```

## 🧪 Tests

### Test 1: Créer un brouillon
1. http://localhost:5173/admin/newsletter
2. Tab "Composer"
3. Remplir sujet + contenu
4. Cliquer "Brouillon"
5. Vérifier dans tab "Historique → Brouillons"
6. Rafraîchir → brouillon persiste ✅

### Test 2: Envoyer newsletter
1. Tab "Composer"
2. Charger brouillon depuis Historique
3. Cliquer "Envoyer"
4. Vérifier dans tab "Historique → Envoyées" ✅
5. Brouillon disparaît ✅

### Test 3: Gestion abonnés
1. Tab "Abonnés"
2. Ajouter abonné via page publique
3. Rechercher par email
4. Toggle actif/inactif
5. Export CSV
6. Supprimer ✅

### Test 4: Session persistante
1. Se connecter
2. Créer brouillon
3. Logout
4. Se reconnecter
5. Brouillon toujours présent ✅

## 🐛 Dépannage

### "Backend not responding"
```bash
# Vérifier que Wrangler tourne
curl http://127.0.0.1:8787/api/admin/me
# Redémarrer si nécessaire
npx wrangler dev --local
```

### "CORS errors"
→ Vérifier que frontend est sur :5173 et backend sur :8787

### "Login fails avec 401"
→ Exécuter les migrations (voir section Déploiement → Setup Initial)
→ Test login: `admin@trinquat.local` / `password123`

### "Données perdues après restart"
→ Normal en dev local. Pour persister, les données sont stockées dans `.wrangler/state/v3/d1/`

### "D1 local ne fonctionne pas"
```bash
# Réinitialiser la DB locale
rm -rf .wrangler/state/v3/d1

# Redémarrer Wrangler et réappliquer migrations
npx wrangler dev --local
npx wrangler d1 execute trinquat_newsletter --file ./migrations/0001_init_schema.sql --local
npx wrangler d1 execute trinquat_newsletter --file ./migrations/0002_seed_test_data.sql --local
```

### "Worker hung / 500 errors"
→ Probablement un problème de migration non appliquée
→ Vérifier que tables existent: `SELECT name FROM sqlite_master WHERE type='table';`

## 📊 État Final

| Élément | Status | Notes |
|---------|--------|-------|
| Frontend React | ✅ Complet | Pages + animations |
| Backend Cloudflare Worker | ✅ Fonctionnel | 11 endpoints |
| Authentication | ✅ Cookies HttpOnly | Sécurisé |
| Database D1 Local | ✅ Opérationnel | 4 tables |
| Database D1 Production | ✅ Prêt | Cloudflare |
| Newsletter Subscription | ✅ Marche | Validation |
| Admin Dashboard | ✅ Complet | Login + CRUD |
| Animations | ✅ Smooth | Framer Motion |
| Déploiement | ✅ Prêt | Pages + Workers |
| OG Images | ✅ Prêt | Social sharing |
| Maintenance Page | ✅ Déployée | Production |

## 🎯 Prochaines Étapes (Post-MVP)

- [ ] Email réel (Resend/SendGrid)
- [ ] Analytics & tracking
- [ ] Templates HTML/MJML
- [ ] Planification d'envoi
- [ ] Segmentation d'abonnés
- [ ] A/B Testing
- [ ] Dashboard stats

## 📞 Support

### Logs & Debugging
```bash
# Terminal 1: Frontend Vite logs
npm run dev

# Terminal 2: Worker Wrangler logs
npx wrangler dev --local

# Database query
npx wrangler d1 execute trinquat_newsletter --command "SELECT * FROM admins;" --local

# Browser DevTools: Application > Cookies (tc_admin)
```

### Endpoints Disponibles (Dev)
- **Frontend**: http://localhost:5173
- **API**: http://127.0.0.1:8787
- **Admin Panel**: http://localhost:5173/admin/login
- **Test Credentials**: `admin@trinquat.local` / `password123`

### Links Importants
- **GitHub**: https://github.com/
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/

---

**Version**: 2.0 - Cloudflare Workers Migration Complete  
**Date**: Juillet 2026  
**Status**: ✅ Production Deployed  
**Architecture**: Cloudflare Pages (Frontend) + Cloudflare Workers (Backend) + Cloudflare D1 (Database)
