// ============================================
// INTÉGRATION FRONTEND AVEC D1
// ============================================
// Modifications à faire dans admin.newsletter.tsx

// CHANGEMENT 1: Charger les brouillons du backend au montage
// Ajouter ce hook après le hook de chargement des subscribers:

useEffect(() => {
  if (!admin) return;
  let mounted = true;

  (async () => {
    try {
      const res = await fetch("/api/admin/drafts", {
        method: "GET",
        credentials: "include",
      });
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

// ============================================
// CHANGEMENT 2: Charger l'historique au montage
// Ajouter après le hook précédent:

useEffect(() => {
  if (!admin) return;
  let mounted = true;

  (async () => {
    try {
      const res = await fetch("/api/admin/sent-newsletters", {
        method: "GET",
        credentials: "include",
      });
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

// ============================================
// CHANGEMENT 3: Modifier saveDraft() dans Composer
// Remplacer la fonction existante par:

const saveDraft = async () => {
  if (!subject.trim() || !content.trim()) {
    setMessage({ type: "error", text: "Veuillez remplir le sujet et le contenu pour enregistrer." });
    return;
  }

  try {
    const res = await fetch("/api/admin/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        subject: subject.trim(),
        content: content.trim(),
      }),
    });

    if (res.ok) {
      const data = await res.json() as Draft;
      setDrafts((prev) => {
        const index = prev.findIndex((d) => d.subject === subject.trim());
        if (index >= 0) {
          // Update existing draft
          return prev.map((d, i) => (i === index ? data : d));
        } else {
          // Add new draft
          return [data, ...prev];
        }
      });
      setMessage({ type: "success", text: "Brouillon enregistré !" });
      setTimeout(() => setMessage(null), 3000);
    } else {
      const error = await res.json() as { error?: string };
      setMessage({ type: "error", text: error.error || "Erreur lors de la sauvegarde" });
    }
  } catch (err) {
    console.error("Error saving draft:", err);
    setMessage({ type: "error", text: "Erreur serveur" });
  }
};

// ============================================
// CHANGEMENT 4: Modifier handleSend() dans Composer
// Remplacer la partie POST par:

const handleSend = async () => {
  if (!subject.trim() || !content.trim()) {
    setMessage({ type: "error", text: "Veuillez remplir le sujet et le contenu." });
    return;
  }

  setSending(true);
  try {
    const res = await fetch("/api/admin/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        subject: subject.trim(),
        content: content.trim(),
      }),
    });

    if (res.ok) {
      const data = await res.json() as any;
      
      // Ajouter à la liste des envoyées
      const newNewsletter: SentNewsletter = {
        id: data.id,
        subject: subject.trim(),
        content: content.trim(),
        sentAt: data.sentAt,
        recipientCount: data.recipientCount,
      };
      setSentNewsletters((prev) => [newNewsletter, ...prev]);

      // Retirer le brouillon s'il existe
      setDrafts((prev) => prev.filter((d) => d.subject !== subject.trim()));

      setMessage({ type: "success", text: "Newsletter envoyée avec succès !" });
      setSubject("");
      setContent("");
      setPreview(false);
      setTimeout(() => setMessage(null), 4000);
    } else {
      const data = await res.json() as { error?: string };
      setMessage({ type: "error", text: data.error || "Erreur lors de l'envoi." });
    }
  } catch (err) {
    console.error("Error sending newsletter:", err);
    setMessage({ type: "error", text: "Erreur serveur. Veuillez réessayer." });
  } finally {
    setSending(false);
  }
};

// ============================================
// CHANGEMENT 5: Modifier deleteDraft() dans History
// Remplacer par:

const deleteDraft = async (id: string) => {
  try {
    const res = await fetch(`/api/admin/drafts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } else {
      console.error("Erreur lors de la suppression du brouillon");
    }
  } catch (err) {
    console.error("Error deleting draft:", err);
  }
};

// ============================================
// NOTES IMPORTANTES:

/*
1. Les endpoints /api/admin/* retournent actuellement les données du state local
   jusqu'à ce que la base de données D1 soit complètement configurée.

2. Une fois D1 configurée, les endpoints backend interrogeront la base de données:
   ```javascript
   const drafts = await db.prepare(
     "SELECT * FROM newsletter_drafts WHERE admin_id = ?"
   ).bind(adminId).all();
   ```

3. Le frontend continuera à fonctionner de la même manière, les seuls changements 
   étant les appels API au lieu du state local.

4. Les données seront désormais persistées même après:
   - Refresh de la page
   - Logout/login
   - Redémarrage du serveur

5. Les différences principales:
   AVANT (state local):
   - Les brouillons et historique disparaissent au refresh
   - Nettoyage au logout avec setDrafts([])
   
   APRÈS (D1):
   - Les brouillons et historique sont persistés
   - Accessibles après logout/login (par admin)
   - Disponibles sur plusieurs onglets/appareils

6. Pour tracer les requêtes API, ouvrez les DevTools (F12)
   et regardez l'onglet Network pour vérifier:
   - GET /api/admin/drafts → 200
   - POST /api/admin/drafts → 200
   - POST /api/admin/newsletter/send → 200
   - GET /api/admin/sent-newsletters → 200
*/
