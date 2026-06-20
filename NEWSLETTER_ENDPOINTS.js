// ============================================
// NEWSLETTER DRAFT ENDPOINTS (Ajouter dans server.cjs)
// ============================================

// GET /api/admin/drafts - Récupérer les brouillons de l'admin
app.get("/api/admin/drafts", (req, res) => {
  // Vérifier la session
  const email = req.cookies.tc_admin;
  if (!email) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const admin = admins.find((a) => a.email === email);
  if (!admin) {
    return res.status(401).json({ error: "Admin introuvable" });
  }

  try {
    // TODO: Quand D1 est prêt:
    const drafts = await db
       .prepare("SELECT * FROM newsletter_drafts WHERE admin_id = ? ORDER BY updated_at DESC")
       .bind(admin.id)
       .all();
     return res.json({ drafts: drafts.results });

    // Pour maintenant (utiliser localStorage côté frontend)
    res.json({ drafts: [] });
  } catch (err) {
    console.error("Error fetching drafts:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/admin/drafts - Sauvegarder un brouillon
app.post("/api/admin/drafts", (req, res) => {
  const { subject, content } = req.body;
  const email = req.cookies.tc_admin;

  if (!email) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  if (!subject || !content) {
    return res.status(400).json({ error: "Subject et content requis" });
  }

  const admin = admins.find((a) => a.email === email);
  if (!admin) {
    return res.status(401).json({ error: "Admin introuvable" });
  }

  try {
    const draftId = `draft_${Date.now()}`;
    const now = new Date().toISOString();

    // TODO: Quand D1 est prêt:
     await db.prepare(
       `INSERT INTO newsletter_drafts 
        (id, admin_id, subject, content, saved_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?)`
     ).bind(draftId, admin.id, subject, content, now, now).run();

    res.json({
      id: draftId,
      subject,
      content,
      savedAt: now,
      message: "Brouillon enregistré",
    });
  } catch (err) {
    console.error("Error saving draft:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /api/admin/drafts/:id - Supprimer un brouillon
app.delete("/api/admin/drafts/:id", (req, res) => {
  const { id } = req.params;
  const email = req.cookies.tc_admin;

  if (!email) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const admin = admins.find((a) => a.email === email);
  if (!admin) {
    return res.status(401).json({ error: "Admin introuvable" });
  }

  try {
    // TODO: Quand D1 est prêt:
     await db
       .prepare("DELETE FROM newsletter_drafts WHERE id = ? AND admin_id = ?")
       .bind(id, admin.id)
       .run();

    res.json({ success: true, message: "Brouillon supprimé" });
  } catch (err) {
    console.error("Error deleting draft:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/admin/sent-newsletters - Récupérer l'historique
app.get("/api/admin/sent-newsletters", (req, res) => {
  const email = req.cookies.tc_admin;

  if (!email) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const admin = admins.find((a) => a.email === email);
  if (!admin) {
    return res.status(401).json({ error: "Admin introuvable" });
  }

  try {
    // TODO: Quand D1 est prêt:
     const sent = await db
       .prepare("SELECT * FROM newsletter_sent WHERE admin_id = ? ORDER BY sent_at DESC")
       .bind(admin.id)
       .all();
     return res.json({ sent: sent.results });

    res.json({ sent: [] });
  } catch (err) {
    console.error("Error fetching sent newsletters:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// MODIFIER: POST /api/admin/newsletter/send
// Remplacer l'endpoint existant par:
app.post("/api/admin/newsletter/send", (req, res) => {
  const { subject, content } = req.body;
  const email = req.cookies.tc_admin;

  if (!email) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  if (!subject || !content) {
    return res.status(400).json({ error: "Subject et content requis" });
  }

  const admin = admins.find((a) => a.email === email);
  if (!admin) {
    return res.status(401).json({ error: "Admin introuvable" });
  }

  const activeSubscribers = subscribers.filter((s) => s.is_active);
  if (activeSubscribers.length === 0) {
    return res.status(400).json({ error: "Aucun abonné actif" });
  }

  try {
    const nlId = `nl_${Date.now()}`;
    const now = new Date().toISOString();

    // TODO: Quand D1 est prêt:
    // await db.prepare(
    //   `INSERT INTO newsletter_sent 
    //    (id, admin_id, subject, content, recipient_count, sent_at, status, created_at)
    //    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    // ).bind(nlId, admin.id, subject, content, activeSubscribers.length, now, "sent", now).run();

    // TODO: Implémenter l'envoi d'emails réels
    // await sendEmailsToActiveSubscribers(subject, content, activeSubscribers);

    res.json({
      success: true,
      id: nlId,
      recipientCount: activeSubscribers.length,
      sentAt: now,
      message: "Newsletter envoyée avec succès",
    });
  } catch (err) {
    console.error("Error sending newsletter:", err);
    res.status(500).json({ error: "Erreur lors de l'envoi" });
  }
});
