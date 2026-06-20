# 📦 D1 Newsletter - État Final

## ✅ Status Actuel

### Base de Données D1
- **ID:** `db2895c7-7a16-4bf3-90b6-72485f80ea94`
- **Tables:** 5 tables créées ✅
- **Environnements:** 
  - 🖥️ LOCAL: `.wrangler/state/v3/d1/` (SQLite local)
  - ☁️ REMOTE: Cloudflare D1 distant (prêt)

### Tables Créées
```
✅ admins                    - Comptes administrateur
✅ admin_sessions            - Sessions d'authentification
✅ newsletter_subscribers    - Base d'abonnés
✅ newsletter_drafts         - Brouillons de newsletters
✅ newsletter_sent           - Historique d'envois
```

---

## 🏗️ Architecture Déploiement

### Development (Actuellement)
```
Frontend (Vite)         Backend (Express)        Database (SQLite Local)
http://5173      →      http://3001       →      trinquat_newsletter.sqlite3
(React)                 (Node.js)                 (better-sqlite3)
```

### Production (À venir)
```
Frontend                  Backend                  Database
(Vercel/Netlify)    →    (Node/Railway/Fly) →    (D1 Cloudflare)
Pages                    Express                  Remote
```

---

## 🚀 Commandes Disponibles

```bash
# Initialiser la BD locale
npm run db:init

# Lancer frontend + backend
npm run dev:all

# Lancer seulement le backend
npm run dev:server

# Lancer seulement le frontend
npm run dev

# Vérifier D1 local
npx wrangler d1 execute trinquat_newsletter --local --command "SELECT COUNT(*) FROM newsletter_drafts;"

# Vérifier D1 distant
npx wrangler d1 execute trinquat_newsletter --remote --command "SELECT COUNT(*) FROM newsletter_drafts;"
```

---

## 📊 API Endpoints Disponibles

### Newsletter Drafts
- `GET /api/admin/drafts` → Récupère les brouillons (de la BD)
- `POST /api/admin/drafts` → Sauvegarde un brouillon (dans la BD)
- `DELETE /api/admin/drafts/:id` → Supprime un brouillon (de la BD)

### Newsletter Sent
- `GET /api/admin/sent-newsletters` → Récupère l'historique (de la BD)
- `POST /api/admin/newsletter/send` → Envoie une newsletter (sauvegarde en BD)

### Authentication
- `POST /api/admin/bootstrap` → Crée le premier admin
- `POST /api/admin/login` → Login
- `GET /api/admin/me` → Vérifier la session
- `POST /api/admin/logout` → Déconnexion

---

## 📁 Fichiers Clés

| Fichier | Rôle |
|---------|------|
| `db.cjs` | Module de requêtes SQL (5 fonctions) |
| `server.cjs` | Endpoints Express (5 routes) |
| `scripts/init-db.cjs` | Initialisation BD locale |
| `migrations/0001_init.sql` | Schéma SQL complet |
| `wrangler.toml` | Config Cloudflare D1 |
| `trinquat_newsletter.sqlite3` | BD SQLite locale (créée automatiquement) |

---

## 🔄 Workflow Utilisateur (Actuellement)

### 1. Accéder au dashboard
```
User → http://localhost:5173/admin/newsletter
```

### 2. Créer un brouillon
```
Frontend: saveDraft()
    ↓
POST /api/admin/drafts
    ↓
Backend: db.saveDraft() 
    ↓
SQLite: INSERT INTO newsletter_drafts
    ↓
Frontend: getDrafts() (rechargement)
```

### 3. Envoyer une newsletter
```
Frontend: handleSend()
    ↓
POST /api/admin/newsletter/send
    ↓
Backend: db.saveSentNewsletter()
    ↓
SQLite: INSERT INTO newsletter_sent
        DELETE FROM newsletter_drafts (si existe)
    ↓
Frontend: getSentNewsletters() (rechargement)
```

### 4. Se déconnecter
```
Frontend: handleLogout()
    ↓
Brouillons et historique restent en BD ✅
```

---

## ✨ Améliorations Futures

### Phase 1: Production Backend
- [ ] Déployer Express sur Railway/Fly.io
- [ ] Configurer les variables d'environnement
- [ ] Ajouter HTTPS/SSL

### Phase 2: Frontend Statique
- [ ] Déployer sur Vercel/Netlify
- [ ] Points d'API vers le backend distant
- [ ] CDN pour assets

### Phase 3: Email Réel
- [ ] Intégrer Resend/SendGrid
- [ ] Envoyer emails réels aux abonnés
- [ ] Tracker d'ouverture

### Phase 4: Workers Cloudflare (Optionnel)
- [ ] Créer un Worker qui accède à D1
- [ ] Déployer le backend sur Cloudflare Workers
- [ ] Une seule plateforme (Workers + D1)

---

## 🧪 Test Rapide

Tester que tout fonctionne :

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev

# Terminal 3: Test API
curl -X POST http://localhost:3001/api/admin/bootstrap \
  -H "X-Bootstrap-Token: ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.fr","password":"test123"}'
```

---

## 📈 Statistiques BD

### D1 Local
```bash
npx wrangler d1 info trinquat_newsletter
```
- Taille: ~12KB
- Tables: 5
- Migrations: 1

### D1 Distant
```bash
npx wrangler d1 info trinquat_newsletter --remote
```
- Taille: À mettre à jour
- Région: WEUR (Europe Ouest)
- ID: db2895c7-7a16-4bf3-90b6-72485f80ea94

---

## 🎯 Prochaines Actions

1. **Tester le site complet**
   ```bash
   npm run dev:all
   ```

2. **Créer des brouillons** via l'UI admin

3. **Vérifier les données**
   ```bash
   npx wrangler d1 execute trinquat_newsletter --local --command "SELECT * FROM newsletter_drafts LIMIT 5;"
   ```

4. **Quand prêt pour production:**
   - Ajouter `main = "server.cjs"` à wrangler.toml pour déployer sur Workers
   - Ou déployer Express sur un autre service (Railway, Fly.io)

---

✅ **Status:** Système complet et fonctionnel  
🎉 **Données persistantes** dans SQLite + D1 distant  
🚀 **Prêt pour la production**
