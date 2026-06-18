# Guide de Lancement - Cloudflare Workers + D1 + JWT

## 📋 Préalables

```bash
# Installer wrangler CLI (si non installé)
npm install -g wrangler@latest

# Vérifier installation
wrangler --version
```

## 🚀 Démarrage Rapide (Développement Local)

### 1️⃣ Première étape : Lancer le serveur de développement

```bash
npm run dev
```

Cela va:
- Lancer Wrangler dev (serveur Nitro/Cloudflare Workers) sur **http://localhost:8787**
- Lancer Vite dev server sur **http://localhost:5173**
- Les deux vont communiquer automatiquement

### 2️⃣ Vérifier que ça fonctionne

Visitez: **http://localhost:8787**

Vous devriez voir le site avec:
- ✅ Page d'accueil fonctionnelle
- ✅ Newsletter s'affiche (publique, pas de login requis)
- ✅ Lien "/admin/login" accessible

## 🔐 Configuration Admin & JWT

### 3️⃣ Bootstrap: Créer le premier admin

Dans un nouvel onglet terminal:

```bash
# Créer le premier admin via l'endpoint de bootstrap
# Le token est dans .env.local (ADMIN_BOOTSTRAP_TOKEN)

curl -X POST http://localhost:8787/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c" \
  -d '{
    "email": "conatct@trinquatetcompagnie.fr",
    "password": "poiuytreza4U!"
  }'
```

**Réponse attendue:**
```json
{
  "ok": true,
  "message": "Admin created successfully"
}
```

### 4️⃣ Test: Se connecter

```bash
# Tester le login
curl -X POST http://localhost:8787/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trinquat.local",
    "password": "MotDePasseSecurise123!"
  }' \
  -v  # -v pour voir les headers Set-Cookie
```

Vous devriez voir le cookie `tc_admin` dans la réponse.

### 5️⃣ Tester les endpoints admin

```bash
# Récupérer la session courante
curl -X GET http://localhost:8787/api/admin/me \
  -H "Cookie: tc_admin=<TOKEN_DU_LOGIN>" 

# Lister les abonnés newsletter
curl -X GET http://localhost:8787/api/admin/subscribers \
  -H "Cookie: tc_admin=<TOKEN_DU_LOGIN>"

# Exporter CSV
curl -X GET http://localhost:8787/api/admin/subscribers/export \
  -H "Cookie: tc_admin=<TOKEN_DU_LOGIN>" \
  > newsletter.csv
```

## 🌐 Interface Graphique

### 6️⃣ Admin Login dans le navigateur

1. Allez à **http://localhost:8787/admin/login**
2. Entrez:
   - Email: `admin@trinquat.local`
   - Mot de passe: `MotDePasseSecurise123!`
3. Vous devriez être redirigé vers **/admin/newsletter**

### 7️⃣ Tester les fonctionnalités

✅ Page admin:
- Liste des abonnés
- Recherche par email
- Toggle actif/inactif
- Supprimer abonné
- Exporter en CSV
- Se déconnecter

✅ Page publique:
- S'abonner à la newsletter (teste POST `/api/newsletter/subscribe`)

## 🗄️ Base de données locale

### Info: Comment fonctionne D1 en local

Par défaut, Wrangler crée une base de données SQLite local:
- Stockée dans `.wrangler/state/v3/d1`
- Utilise le schéma de `migrations/0001_init.sql`
- Appliqué automatiquement au premier démarrage

### Réinitialiser la base de données

```bash
# Supprimer le fichier local D1
rm -rf .wrangler/state/v3/d1

# Relancer le serveur (il va recréer et appliquer les migrations)
npm run dev
```

## 📦 Variables d'environnement

Les secrets sont dans `.env.local`:

```env
JWT_SECRET=71778026d38678c7f8bb082d7e82b36b2571572dc22944798a52410aa1542826
ADMIN_BOOTSTRAP_TOKEN=ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c
```

Pour changer, modifiez et relancez `npm run dev`.

## 🚢 Déployer en Production

### Pré-requis Cloudflare:

1. **Compte Cloudflare** (gratuit ok)
2. **CLI Wrangler authentifié**:
   ```bash
   wrangler login
   ```

### 8️⃣ Créer D1 en production

```bash
# Créer la base de données D1 sur Cloudflare
wrangler d1 create trinquat_newsletter

# Copier le DATABASE_ID affiché
# Ajouter à wrangler.toml sous [env.production]:
# database_id = "copiez-l'ID-ici"
```

### 9️⃣ Configurer les secrets

```bash
# Générer des secrets forts (production)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ajouter les secrets
wrangler secret put JWT_SECRET --env production
# Collez le secret généré

wrangler secret put ADMIN_BOOTSTRAP_TOKEN --env production
# Collez le secret généré
```

### 🔟 Builder et déployer

```bash
# Build production
npm run build

# Déployer
wrangler deploy --env production

# Vérifier le déploiement
wrangler deployments list
```

### 1️⃣1️⃣ Bootstrap admin en production

```bash
curl -X POST https://votre-domaine.workers.dev/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: votre_ADMIN_BOOTSTRAP_TOKEN" \
  -d '{
    "email": "admin@trinquat.local",
    "password": "MotDePasseFort!"
  }'
```

## 🐛 Dépannage

### Erreur: "D1_ID not found"

→ Vérifiez que `wrangler.toml` a `database_id` (pour dev: "local")

### Erreur: "JWT_SECRET not configured"

→ Vérifiez `.env.local` contient JWT_SECRET

### Admin login boucle infinie

→ Vérifiez que `/api/admin/me` retourne 200 avec session

### CSV export ne charge pas

→ Vérifiez que vous avez le cookie `tc_admin` valide

## 📝 Notes

- **Cookies**: Les sessions sont stockées dans un httpOnly cookie `tc_admin` 
- **D1**: Base de données SQLite gérée par Cloudflare
- **Migrations**: Appliquées automatiquement au premier démarrage
- **JWT**: Token HS256 signé avec JWT_SECRET (8h expiration par défaut)

---

**Questions?** Vérifiez les logs en console (terminal avec `npm run dev`)
