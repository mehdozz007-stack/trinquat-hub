import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Calendar, FileText, Image as ImageIcon, LogOut, Plus, ShieldCheck, ShieldAlert,
  Save, Send, Trash2, Pencil, Eye, EyeOff, X, MapPin, Tag, Upload, RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/admin/content")({
  head: () => ({
    meta: [
      { title: "Admin Contenu | Trinquat & Compagnie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminContent,
});

type AdminSession = { id: string; email: string; role: string };
type EventRow = {
  id: string; title: string; description: string; event_date: string; place: string | null;
  badge: string | null; image_url: string | null; image_key: string | null;
  status: "draft" | "published"; published_at: string | null; created_at: string; updated_at: string;
};
type NewsRow = {
  id: string; title: string; excerpt: string; tag: string | null; news_date: string;
  image_url: string | null; image_key: string | null;
  status: "draft" | "published"; published_at: string | null; created_at: string; updated_at: string;
};
type Tab = "events" | "news";

function AdminContent() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("events");

  const [events, setEvents] = useState<EventRow[]>([]);
  const [news, setNews] = useState<NewsRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);

  const [editorOpen, setEditorOpen] = useState<null | { kind: Tab; row: EventRow | NewsRow | null }>(null);

  // Session
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/me", { credentials: "include" });
        if (res.ok) {
          const data = (await res.json()) as AdminSession;
          if (mounted) setAdmin(data);
        } else if (mounted) navigate({ to: "/admin/login" });
      } catch {
        if (mounted) navigate({ to: "/admin/login" });
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("/api/admin/events", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { events: EventRow[] };
        setEvents(data.events || []);
      }
    } finally { setLoadingEvents(false); }
  }, []);

  const loadNews = useCallback(async () => {
    setLoadingNews(true);
    try {
      const res = await fetch("/api/admin/news", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { news: NewsRow[] };
        setNews(data.news || []);
      }
    } finally { setLoadingNews(false); }
  }, []);

  useEffect(() => { if (admin) { loadEvents(); loadNews(); } }, [admin, loadEvents, loadNews]);

  const handleLogout = async () => {
    try { await fetch("/api/admin/logout", { method: "POST", credentials: "include" }); } catch {}
    navigate({ to: "/admin/login" });
  };

  const togglePublish = async (kind: Tab, row: EventRow | NewsRow) => {
    const next = row.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/admin/${kind}/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) { kind === "events" ? loadEvents() : loadNews(); }
    else alert("Échec de la mise à jour");
  };

  const remove = async (kind: Tab, row: EventRow | NewsRow) => {
    if (!confirm(`Supprimer "${row.title}" ?`)) return;
    const res = await fetch(`/api/admin/${kind}/${row.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { kind === "events" ? loadEvents() : loadNews(); }
    else alert("Échec de la suppression");
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Chargement...</div>;
  }
  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center rounded-3xl border border-border/40 bg-card/80 p-10 shadow-elegant">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-2xl font-medium">Accès refusé</h1>
          <Link to="/admin/login" className="mt-6 inline-block rounded-full bg-gradient-leaf px-5 py-2 text-xs font-semibold text-primary-foreground shadow-soft">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const eventsDraft = events.filter((e) => e.status === "draft").length;
  const eventsPub = events.filter((e) => e.status === "published").length;
  const today = new Date().toISOString().slice(0, 10);
  const eventsUpcoming = events.filter((e) => e.status === "published" && e.event_date >= today).length;
  const newsDraft = news.filter((n) => n.status === "draft").length;
  const newsPub = news.filter((n) => n.status === "published").length;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 -z-10 bg-gradient-leaf opacity-[0.04]" />

      <header className="border-b border-border/40 bg-card/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-leaf text-primary-foreground shadow-soft">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-medium leading-tight">Admin Contenu</h1>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link to="/admin/newsletter" className="rounded-full border border-border/70 px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-accent transition-colors">Newsletter</Link>
            <Link to="/" className="rounded-full border border-border/70 px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-accent transition-colors">Site</Link>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-accent transition-colors">
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Tabs */}
        <div className="overflow-x-auto mb-6 sm:mb-8">
          <div className="inline-flex rounded-full border border-border/60 bg-card/70 backdrop-blur-sm p-1 shadow-soft">
            <TabBtn active={tab === "events"} onClick={() => setTab("events")} icon={<Calendar className="h-4 w-4" />} label="Événements" />
            <TabBtn active={tab === "news"} onClick={() => setTab("news")} icon={<FileText className="h-4 w-4" />} label="Actualités" />
          </div>
        </div>

        {tab === "events" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <StatCard icon={<Calendar className="h-4 w-4" />} label="À venir (publiés)" value={eventsUpcoming} />
              <StatCard icon={<Eye className="h-4 w-4" />} label="Publiés" value={eventsPub} />
              <StatCard icon={<EyeOff className="h-4 w-4" />} label="Brouillons" value={eventsDraft} />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Tous les événements</h2>
              <div className="flex gap-2">
                <button onClick={loadEvents} className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-2 text-xs hover:bg-accent">
                  <RefreshCw className="h-3.5 w-3.5" /> Actualiser
                </button>
                <button onClick={() => setEditorOpen({ kind: "events", row: null })} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-leaf px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
                  <Plus className="h-3.5 w-3.5" /> Nouvel événement
                </button>
              </div>
            </div>

            {loadingEvents ? (
              <div className="rounded-3xl border border-border/40 bg-card/70 p-16 text-center text-sm text-muted-foreground">Chargement...</div>
            ) : events.length === 0 ? (
              <EmptyState label="Aucun événement pour le moment." onCreate={() => setEditorOpen({ kind: "events", row: null })} />
            ) : (
              <ContentTable
                rows={events.map((e) => ({
                  id: e.id, title: e.title, date: e.event_date, meta: e.place || "", status: e.status, image_url: e.image_url,
                }))}
                onEdit={(id) => { const row = events.find((x) => x.id === id); if (row) setEditorOpen({ kind: "events", row }); }}
                onToggle={(id) => { const row = events.find((x) => x.id === id); if (row) togglePublish("events", row); }}
                onDelete={(id) => { const row = events.find((x) => x.id === id); if (row) remove("events", row); }}
              />
            )}
          </>
        )}

        {tab === "news" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <StatCard icon={<Eye className="h-4 w-4" />} label="Publiées" value={newsPub} />
              <StatCard icon={<EyeOff className="h-4 w-4" />} label="Brouillons" value={newsDraft} />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Toutes les actualités</h2>
              <div className="flex gap-2">
                <button onClick={loadNews} className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-2 text-xs hover:bg-accent">
                  <RefreshCw className="h-3.5 w-3.5" /> Actualiser
                </button>
                <button onClick={() => setEditorOpen({ kind: "news", row: null })} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-leaf px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
                  <Plus className="h-3.5 w-3.5" /> Nouvelle actualité
                </button>
              </div>
            </div>

            {loadingNews ? (
              <div className="rounded-3xl border border-border/40 bg-card/70 p-16 text-center text-sm text-muted-foreground">Chargement...</div>
            ) : news.length === 0 ? (
              <EmptyState label="Aucune actualité pour le moment." onCreate={() => setEditorOpen({ kind: "news", row: null })} />
            ) : (
              <ContentTable
                rows={news.map((n) => ({
                  id: n.id, title: n.title, date: n.news_date, meta: n.tag || "", status: n.status, image_url: n.image_url,
                }))}
                onEdit={(id) => { const row = news.find((x) => x.id === id); if (row) setEditorOpen({ kind: "news", row }); }}
                onToggle={(id) => { const row = news.find((x) => x.id === id); if (row) togglePublish("news", row); }}
                onDelete={(id) => { const row = news.find((x) => x.id === id); if (row) remove("news", row); }}
              />
            )}
          </>
        )}
      </main>

      {editorOpen && (
        <Editor
          kind={editorOpen.kind}
          row={editorOpen.row}
          onClose={() => setEditorOpen(null)}
          onSaved={() => { setEditorOpen(null); editorOpen.kind === "events" ? loadEvents() : loadNews(); }}
        />
      )}
    </div>
  );
}

/* ============ subcomponents ============ */

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-gradient-leaf text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}>
      {icon}{label}
    </button>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">{icon} {label}</div>
      <div className="mt-2 text-3xl font-medium">{value}</div>
    </div>
  );
}

function EmptyState({ label, onCreate }: { label: string; onCreate: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/60 bg-card/40 p-16 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <button onClick={onCreate} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-leaf px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft">
        <Plus className="h-3.5 w-3.5" /> Créer
      </button>
    </div>
  );
}

type Row = { id: string; title: string; date: string; meta: string; status: "draft" | "published"; image_url: string | null };

function ContentTable({ rows, onEdit, onToggle, onDelete }: {
  rows: Row[]; onEdit: (id: string) => void; onToggle: (id: string) => void; onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Titre</th>
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Info</th>
              <th className="text-left px-5 py-3 font-medium">Statut</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {r.image_url ? (
                      <img src={r.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                    <span className="font-medium">{r.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{r.date}</td>
                <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{r.meta}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${r.status === "published" ? "bg-primary/10 text-primary-deep" : "bg-muted text-muted-foreground"}`}>
                    {r.status === "published" ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button onClick={() => onToggle(r.id)} title={r.status === "published" ? "Dépublier" : "Publier"}
                      className="inline-flex items-center gap-1 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition">
                      {r.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => onEdit(r.id)} title="Éditer"
                      className="inline-flex items-center gap-1 rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(r.id)} title="Supprimer"
                      className="inline-flex items-center gap-1 rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ editor ============ */

function Editor({ kind, row, onClose, onSaved }: {
  kind: Tab; row: EventRow | NewsRow | null; onClose: () => void; onSaved: () => void;
}) {
  const isEvent = kind === "events";
  const initial = row as any;
  const [title, setTitle] = useState<string>(initial?.title ?? "");
  const [description, setDescription] = useState<string>(isEvent ? (initial?.description ?? "") : (initial?.excerpt ?? ""));
  const [date, setDate] = useState<string>(isEvent ? (initial?.event_date ?? "") : (initial?.news_date ?? ""));
  const [place, setPlace] = useState<string>(initial?.place ?? "");
  const [badge, setBadge] = useState<string>(initial?.badge ?? "");
  const [tag, setTag] = useState<string>(initial?.tag ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [imageKey, setImageKey] = useState<string | null>(initial?.image_key ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/uploads", { method: "POST", credentials: "include", body: fd });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Échec de l'upload");
      // Delete previous image if any
      if (imageKey) { fetch(`/api/admin/uploads/${encodeURIComponent(imageKey)}`, { method: "DELETE", credentials: "include" }).catch(() => {}); }
      setImageUrl(data.url); setImageKey(data.key);
    } catch (e: any) {
      setError(e.message || "Erreur d'upload");
    } finally { setUploading(false); }
  };

  const handleRemoveImage = async () => {
    if (imageKey) { fetch(`/api/admin/uploads/${encodeURIComponent(imageKey)}`, { method: "DELETE", credentials: "include" }).catch(() => {}); }
    setImageUrl(null); setImageKey(null);
  };

  const submit = async (status: "draft" | "published") => {
    setError(null);
    if (!title.trim() || !description.trim() || !date) {
      setError("Titre, description et date sont requis.");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        image_url: imageUrl, image_key: imageKey, status,
      };
      if (isEvent) {
        payload.description = description.trim();
        payload.event_date = date;
        payload.place = place.trim() || null;
        payload.badge = badge.trim() || null;
      } else {
        payload.excerpt = description.trim();
        payload.news_date = date;
        payload.tag = tag.trim() || null;
      }
      const url = row ? `/api/admin/${kind}/${row.id}` : `/api/admin/${kind}`;
      const method = row ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any).error || "Échec de l'enregistrement");
      onSaved();
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border/40 shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b border-border/40 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-lg font-medium">
            {row ? "Modifier" : "Créer"} {isEvent ? "un événement" : "une actualité"}
          </h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          <Field label="Titre">
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200}
              className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" />
          </Field>

          <Field label={isEvent ? "Description" : "Extrait"}>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={5000}
              className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date" icon={<Calendar className="h-3.5 w-3.5" />}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm" />
            </Field>
            {isEvent ? (
              <Field label="Lieu" icon={<MapPin className="h-3.5 w-3.5" />}>
                <input value={place} onChange={(e) => setPlace(e.target.value)} maxLength={200}
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm" />
              </Field>
            ) : (
              <Field label="Catégorie / tag" icon={<Tag className="h-3.5 w-3.5" />}>
                <input value={tag} onChange={(e) => setTag(e.target.value)} maxLength={60}
                  placeholder="ex: Vie de quartier"
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm" />
              </Field>
            )}
          </div>

          {isEvent && (
            <Field label="Badge (optionnel)">
              <input value={badge} onChange={(e) => setBadge(e.target.value)} maxLength={60}
                placeholder="ex: À venir, Fête, Vie de quartier"
                className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm" />
            </Field>
          )}

          <Field label="Image">
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="" className="w-full h-48 object-cover rounded-xl border border-border/60" />
                <button onClick={handleRemoveImage} className="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-background/50 p-6 cursor-pointer hover:bg-accent/50 transition">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {uploading ? "Envoi..." : "Cliquer pour ajouter une image (JPG, PNG, WEBP, max 5 Mo)"}
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} disabled={uploading} />
              </label>
            )}
          </Field>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border/40 px-6 py-4 flex flex-col sm:flex-row items-center justify-end gap-2 rounded-b-3xl">
          <button onClick={onClose} className="w-full sm:w-auto rounded-full border border-border/70 px-5 py-2 text-xs hover:bg-accent">
            Annuler
          </button>
          <button onClick={() => submit("draft")} disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-border/70 px-5 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-50">
            <Save className="h-3.5 w-3.5" /> Enregistrer en brouillon
          </button>
          <button onClick={() => submit("published")} disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-leaf px-5 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:shadow-glow disabled:opacity-50">
            <Send className="h-3.5 w-3.5" /> {row?.status === "published" ? "Enregistrer" : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}{label}
      </label>
      {children}
    </div>
  );
}