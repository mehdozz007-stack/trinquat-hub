## 📊 Configuration Cloudflare D1 pour Newsletter

### État actuel
- ✅ Migration SQL complète créée (`migrations/0001_init.sql`)
- ✅ wrangler.toml déjà configuré
- ✅ Logout effectue le nettoyage des brouillons
- ⏳ Backend doit être migré vers D1

---

## 🚀 Étapes à effectuer

### ÉTAPE 1: Installation Wrangler CLI
```bash
npm install -g wrangler@latest
```

### ÉTAPE 2: Créer la base de données locale D1
```bash
cd c:\workspaceMZ\trinquat-hub
wrangler d1 create trinquat_newsletter
```
Acceptez la création de la base de données. La sortie affichera:
```
✅ Successfully created the database!

[[d1_databases]]
binding = "DB"
database_name = "trinquat_newsletter"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Mettez à jour le `database_id` local dans `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "trinquat_newsletter"
database_id = "VOTRE_ID_GÉNÉRÉ"  # ← Remplacer par l'ID
migrations_dir = "migrations"
```

### ÉTAPE 3: Appliquer les migrations
```bash
wrangler d1 migrations apply trinquat_newsletter --local
```
Réponse attendue:
```
✓ Migrated 0001_init.sql
```

### ÉTAPE 4: Vérifier la base de données
```bash
wrangler d1 execute trinquat_newsletter --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```
Vous devriez voir:
- admins
- newsletter_subscribers
- newsletter_drafts
- newsletter_sent
- admin_sessions

---

## 💾 API Endpoints à ajouter (server.cjs)

### 1️⃣ Récupérer les brouillons
```javascript
// GET /api/admin/drafts
app.get("/api/admin/drafts", withSession, async (req, res) => {
  try {
    // For now, return empty array until D1 integration complete
    res.json({ drafts: [] });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
```

### 2️⃣ Sauvegarder un brouillon
```javascript
// POST /api/admin/drafts
app.post("/api/admin/drafts", withSession, async (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ error: "Subject et content requis" });
    }
    
    const draftId = Date.now().toString();
    const now = new Date().toISOString();
    
    // TODO: Insert into DB when D1 is ready
    // await db.prepare(
    //   "INSERT INTO newsletter_drafts (id, admin_id, subject, content, saved_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    // ).bind(draftId, req.adminId, subject, content, now, now).run();
    
    res.json({ 
      id: draftId, 
      subject, 
      content, 
      savedAt: now 
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
```

### 3️⃣ Supprimer un brouillon
```javascript
// DELETE /api/admin/drafts/:id
app.delete("/api/admin/drafts/:id", withSession, async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Delete from DB when D1 is ready
    // await db.prepare("DELETE FROM newsletter_drafts WHERE id = ? AND admin_id = ?")
    //   .bind(id, req.adminId)
    //   .run();
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
```

### 4️⃣ Récupérer l'historique des newsletters envoyées
```javascript
// GET /api/admin/sent-newsletters
app.get("/api/admin/sent-newsletters", withSession, async (req, res) => {
  try {
    // TODO: Query from DB when D1 is ready
    res.json({ sent: [] });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
```

### 5️⃣ Sauvegarder une newsletter envoyée
```javascript
// POST /api/admin/newsletter/send (modifier l'endpoint existant)
app.post("/api/admin/newsletter/send", withSession, async (req, res) => {
  try {
    const { subject, content } = req.body;
    
    const activeSubscribers = subscribers.filter((s) => s.is_active);
    if (activeSubscribers.length === 0) {
      return res.status(400).json({ error: "Aucun destinataire actif" });
    }

    const nlId = Date.now().toString();
    const now = new Date().toISOString();

    // TODO: Insert into sent table when D1 is ready
    // await db.prepare(
    //   "INSERT INTO newsletter_sent (id, admin_id, subject, content, recipient_count, sent_at, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    // ).bind(nlId, req.adminId, subject, content, activeSubscribers.length, now, "sent", now).run();

    // TODO: Send actual emails
    // await sendEmailsToSubscribers(subject, content, activeSubscribers);

    res.json({ 
      success: true, 
      id: nlId,
      recipientCount: activeSubscribers.length,
      message: "Newsletter envoyée avec succès" 
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'envoi" });
  }
});
```

---

## 🔗 Intégration Frontend avec D1

### Charger les brouillons au montage
```typescript
// Dans AdminNewsletter component, après check session:
useEffect(() => {
  if (!admin) return;
  let mounted = true;
  
  (async () => {
    try {
      const res = await fetch("/api/admin/drafts", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { drafts: Draft[] };
        if (mounted) setDrafts(data.drafts);
      }
    } catch (err) {
      console.error("Erreur chargement brouillons:", err);
    }
  })();
  
  return () => { mounted = false; };
}, [admin]);
```

### Charger l'historique
```typescript
useEffect(() => {
  if (!admin) return;
  let mounted = true;
  
  (async () => {
    try {
      const res = await fetch("/api/admin/sent-newsletters", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { sent: SentNewsletter[] };
        if (mounted) setSentNewsletters(data.sent);
      }
    } catch (err) {
      console.error("Erreur chargement historique:", err);
    }
  })();
  
  return () => { mounted = false; };
}, [admin]);
```

---

## 📱 Déploiement sur Cloudflare

### 1. Créer la base de données en production
```bash
wrangler d1 create trinquat_newsletter --remote
```

### 2. Appliquer les migrations en production
```bash
wrangler d1 migrations apply trinquat_newsletter
```

### 3. Mettre à jour wrangler.toml
```toml
[env.production]
vars = { ENVIRONMENT = "production" }
[[env.production.d1_databases]]
binding = "DB"
database_name = "trinquat_newsletter"
database_id = "VOTRE_ID_PRODUCTION"  # ← ID fourni par create --remote
```

### 4. Déployer
```bash
wrangler deploy --env production
```

---

## 🔍 Requêtes de test D1

### Vérifier les tables
```bash
wrangler d1 execute trinquat_newsletter --local \
  --command "SELECT name, type FROM sqlite_master WHERE type='table' ORDER BY name;"
```

### Insérer un admin de test
```bash
wrangler d1 execute trinquat_newsletter --local \
  --command "INSERT INTO admins (id, email, password_hash, role, created_at, updated_at) VALUES ('admin-1', 'test@trinquat.fr', 'hash', 'admin', datetime('now'), datetime('now'));"
```

### Vérifier les admins
```bash
wrangler d1 execute trinquat_newsletter --local \
  --command "SELECT * FROM admins;"
```

---

## 📋 Checklist de déploiement

- [ ] Migrations SQL appliquées localement
- [ ] `database_id` local configuré dans wrangler.toml
- [ ] Les 5 endpoints backend créés dans server.cjs
- [ ] Frontend met à jour saveDraft() pour appeler POST /api/admin/drafts
- [ ] Frontend met à jour handleSend() pour appeler POST /api/admin/newsletter/send
- [ ] Endpoints fetch les données de D1 au lieu de state local
- [ ] Tests locaux avec Wrangler
- [ ] Déploiement production avec wrangler deploy

---

## 🆘 Dépannage

### "Cannot find database_id"
→ Relancer `wrangler d1 create` et copier l'ID dans wrangler.toml

### "Migration not found"
→ Vérifier que `migrations/0001_init.sql` existe et contient les tables

### "403 Unauthorized accessing D1"
→ Vérifier que vous êtes connecté: `wrangler login`

### Les données ne se sauvegardent pas
→ Vérifier que les endpoints retournent 200 et les logs du serveur
