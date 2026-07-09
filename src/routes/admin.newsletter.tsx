import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Download, Trash2, LogOut, Mail, Search, Users, ShieldCheck, ShieldAlert,
  PenSquare, Send, Save, FileText, AlertCircle, Eye, Calendar, CheckCircle2, Clock, X,
} from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/admin/newsletter")({
  head: () => ({
    meta: [
      { title: "Admin Newsletter | Trinquat & Compagnie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminNewsletter,
});

type Subscriber = { id: string; email: string; is_active: boolean; created_at: string };
type AdminSession = { id: string; email: string; role: string };
type Tab = "compose" | "history" | "subscribers";
type Draft = { id: string; subject: string; content: string; savedAt: string };
type SentNewsletter = { id: string; subject: string; content: string; sentAt: string; recipientCount: number };

// Mock data
const MOCK_ADMIN: AdminSession = { id: "admin-1", email: "admin@trinquat.local", role: "admin" };
const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: "1", email: "marie.dupont@example.com", is_active: true, created_at: "2024-01-15T10:30:00Z" },
  { id: "2", email: "jean.martin@example.com", is_active: true, created_at: "2024-02-20T14:45:00Z" },
  { id: "3", email: "sophie.bernard@example.com", is_active: true, created_at: "2024-03-05T09:15:00Z" },
  { id: "4", email: "pierre.richard@example.com", is_active: false, created_at: "2024-01-10T11:20:00Z" },
  { id: "5", email: "anne.thomas@example.com", is_active: true, created_at: "2024-04-12T16:30:00Z" },
  { id: "6", email: "luc.fournier@example.com", is_active: true, created_at: "2024-03-22T13:45:00Z" },
];

function AdminNewsletter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [tab, setTab] = useState<Tab>("subscribers");
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [sentNewsletters, setSentNewsletters] = useState<SentNewsletter[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

  // Check session on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json() as { id: string; email: string; role: string };
          if (mounted) setAdmin(data);
        } else {
          if (mounted) navigate({ to: "/admin/login" });
        }
      } catch {
        if (mounted) navigate({ to: "/admin/login" });
      } finally {
        if (mounted) setCheckingSession(false);
      }
    })();
  }, [navigate]);

  // Load subscribers from backend
  useEffect(() => {
    if (!admin) return;
    let mounted = true;
    (async () => {
      setSubsLoading(true);
      try {
        const res = await fetch("/api/admin/subscribers?limit=100", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json() as { subscribers?: Subscriber[] };
          if (mounted) setSubs(data.subscribers || []);
        }
      } catch {
        if (mounted) setSubs(MOCK_SUBSCRIBERS);
      } finally {
        if (mounted) setSubsLoading(false);
      }
    })();
  }, [admin]);

  // Load drafts from backend
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

  // Load sent newsletters from backend
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

  useEffect(() => {
    if (checkingSession) return;
    setLoading(false);
  }, [checkingSession]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setAdmin(null);
    setDrafts([]);
    setSentNewsletters([]);
    navigate({ to: "/admin/login" });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Chargement...</div>;
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center rounded-3xl border border-border/40 bg-card/80 p-10 shadow-elegant">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-2xl font-medium">Accès refusé</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Vous ne pouvez pas accéder à cette page. Veuillez vous connecter.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={handleLogout} className="rounded-full border border-border/70 px-5 py-2 text-xs hover:bg-accent">
              Se déconnecter
            </button>
            <Link to="/" className="rounded-full bg-gradient-leaf px-5 py-2 text-xs font-semibold text-primary-foreground shadow-soft">
              Retour au site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeSubs = subs.filter((s) => s.is_active);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 -z-10 bg-gradient-leaf opacity-[0.04]" />
      <div className="absolute inset-0 -z-10 grain" />

      <header className="border-b border-border/40 bg-card/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-leaf text-primary-foreground shadow-soft">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-medium leading-tight">Admin Newsletter</h1>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link to="/admin/content" className="rounded-full border border-border/70 px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-accent transition-colors">Contenu</Link>
            <Link to="/" className="rounded-full border border-border/70 px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-accent transition-colors">Site</Link>
            <button onClick={handleLogout} className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-border/70 px-2 sm:px-4 py-2 text-xs sm:text-sm hover:bg-accent transition-colors">
              <LogOut className="h-3 sm:h-3.5 w-3 sm:w-3.5 shrink-0" /> <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard icon={<Users className="h-4 w-4" />} label="Abonnés actifs" value={activeSubs.length} />
          <StatCard icon={<Mail className="h-4 w-4" />} label="Total abonnés" value={subs.length} />
          <StatCard icon={<Mail className="h-4 w-4" />} label="Désactivés" value={subs.filter(s => !s.is_active).length} />
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto mb-6 sm:mb-8">
        <div className="inline-flex rounded-full border border-border/60 bg-card/70 backdrop-blur-sm p-1 shadow-soft">
          <TabBtn active={tab === "subscribers"} onClick={() => setTab("subscribers")} icon={<Users className="h-4 w-4" />} label="Abonnés" />
          <TabBtn active={tab === "compose"} onClick={() => setTab("compose")} icon={<PenSquare className="h-4 w-4" />} label="Composer" />
          <TabBtn active={tab === "history"} onClick={() => setTab("history")} icon={<FileText className="h-4 w-4" />} label="Historique" />
        </div>
        </div>

        {tab === "subscribers" && (
          <Subscribers subs={subs} setSubs={setSubs} loading={subsLoading} />
        )}
        {tab === "compose" && (
          <Composer 
            recipientsCount={activeSubs.length} 
            drafts={drafts}
            setDrafts={setDrafts}
            sentNewsletters={sentNewsletters}
            setSentNewsletters={setSentNewsletters}
            selectedDraft={selectedDraft}
            setSelectedDraft={setSelectedDraft}
          />
        )}
        {tab === "history" && (
          <History 
            drafts={drafts} 
            setDrafts={setDrafts}
            sentNewsletters={sentNewsletters}
            onLoadDraft={(draft) => {
              setSelectedDraft(draft);
              setTab("compose");
            }}
          />
        )}
      </main>
    </div>
  );
}

/* =============== Subscribers =============== */
function Subscribers({ subs, setSubs, loading }: { subs: Subscriber[]; setSubs: React.Dispatch<React.SetStateAction<Subscriber[]>>; loading: boolean }) {
  const [query, setQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const filtered = useMemo(() => subs.filter((s) => s.email.toLowerCase().includes(query.toLowerCase())), [subs, query]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Supprimer ${email} ?`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSubs((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (s: Subscriber) => {
    setActionLoading(s.id);
    try {
      const res = await fetch(`/api/admin/subscribers/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: !s.is_active }),
      });
      if (res.ok) {
        setSubs((prev) => prev.map((p) => (p.id === s.id ? { ...p, is_active: !s.is_active } : p)));
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch {
      alert("Erreur lors de la mise à jour");
    } finally {
      setActionLoading(null);
    }
  };

  const exportCSV = async () => {
    try {
      window.location.href = "/api/admin/subscribers/export";
    } catch (err) {
      console.error("Export error:", err);
      alert("Erreur lors de l'export");
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant p-16 text-center text-sm text-muted-foreground">
        Chargement des abonnés...
      </div>
    );
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center p-3 sm:p-5 border-b border-border/40">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full rounded-full border border-border/70 bg-background pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>
        <button onClick={exportCSV} disabled={filtered.length === 0}
          className="inline-flex items-center justify-center gap-1 sm:gap-2 rounded-full bg-gradient-leaf px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow hover:-translate-y-0.5 disabled:opacity-50 whitespace-nowrap">
          <Download className="h-3.5 sm:h-4 w-3.5 sm:w-4" /> <span className="hidden sm:inline">Exporter</span><span className="sm:hidden">CSV</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 sm:p-16 text-center text-xs sm:text-sm text-muted-foreground">
          {subs.length === 0 ? "Aucun abonné pour le moment." : "Aucun abonné correspondant à votre recherche."}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Statut</th>
                <th className="text-left px-5 py-3 font-medium">Inscrit·e le</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-medium">{s.email}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(s)} disabled={actionLoading === s.id}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                        s.is_active ? "bg-primary/10 text-primary-deep hover:bg-primary/20" : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}>
                      {actionLoading === s.id ? "..." : (s.is_active ? "Actif" : "Désactivé")}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(s.id, s.email)} disabled={actionLoading === s.id}
                      className="inline-flex items-center gap-1 rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition disabled:opacity-50" aria-label="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* =============== Composer =============== */
function Composer({ 
  recipientsCount, 
  drafts, 
  setDrafts,
  sentNewsletters,
  setSentNewsletters,
  selectedDraft,
  setSelectedDraft
}: { 
  recipientsCount: number;
  drafts: Draft[];
  setDrafts: React.Dispatch<React.SetStateAction<Draft[]>>;
  sentNewsletters: SentNewsletter[];
  setSentNewsletters: React.Dispatch<React.SetStateAction<SentNewsletter[]>>;
  selectedDraft: Draft | null;
  setSelectedDraft: React.Dispatch<React.SetStateAction<Draft | null>>;
}) {
  const [subject, setSubject] = useState(selectedDraft?.subject ?? "");
  const [content, setContent] = useState(selectedDraft?.content ?? "");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load draft on selection
  useEffect(() => {
    if (selectedDraft) {
      setSubject(selectedDraft.subject);
      setContent(selectedDraft.content);
      setSelectedDraft(null);
    }
  }, [selectedDraft, setSelectedDraft]);

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
        const apiData = await res.json() as { id: string; recipientCount: number; sentAt: string };
        const newNewsletter: SentNewsletter = {
          id: apiData.id,
          subject: subject.trim(),
          content: content.trim(),
          sentAt: apiData.sentAt,
          recipientCount: apiData.recipientCount,
        };
        setSentNewsletters((prev) => [newNewsletter, ...prev]);
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
    } catch {
      setMessage({ type: "error", text: "Erreur serveur. Veuillez réessayer." });
    } finally {
      setSending(false);
    }
  };

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
          const index = prev.findIndex((d) => d.id === data.id);
          if (index >= 0) {
            return prev.map((d, i) => (i === index ? data : d));
          } else {
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

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 grid-cols-1">
      {/* Editor */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        {/* Subject */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant p-4 sm:p-8">
          <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Sujet</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Sujet de la newsletter..."
            className="w-full rounded-lg sm:rounded-xl border border-border/70 bg-background/80 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all"
          />
        </div>

        {/* Content */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant p-4 sm:p-8">
          <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Contenu</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrivez votre newsletter..."
            rows={8}
            className="w-full rounded-lg sm:rounded-xl border border-border/70 bg-background/80 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all resize-none"
          />
          <p className="mt-2 sm:mt-3 text-xs text-muted-foreground">
            {content.length} caractères
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-lg sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm flex items-center gap-2 sm:gap-3 ${
            message.type === "success"
              ? "bg-primary/10 border border-primary/30 text-primary-deep"
              : "bg-destructive/10 border border-destructive/30 text-destructive"
          }`}>
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => setPreview(!preview)}
            className="inline-flex items-center justify-center gap-1 sm:gap-2 rounded-full border border-border/70 px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium hover:bg-accent transition-all active:scale-95"
          >
            <Eye className="h-4 sm:h-4 w-4 sm:w-4 shrink-0" />
            <span>{preview ? "Modifier" : "Aperçu"}</span>
          </button>
          <button
            onClick={saveDraft}
            className="inline-flex items-center justify-center gap-1 sm:gap-2 rounded-full border border-border/70 px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium hover:bg-accent transition-all active:scale-95"
          >
            <Save className="h-4 sm:h-4 w-4 sm:w-4 shrink-0" />
            <span>Brouillon</span>
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !content.trim()}
            className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 rounded-full bg-gradient-leaf px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Send className="h-4 sm:h-4 w-4 sm:w-4 shrink-0" />
            <span>{sending ? "Envoi en cours..." : "Envoyer"}</span>
          </button>
        </div>
      </div>

      {/* Preview / Stats */}
      <div className="space-y-4 sm:space-y-6">
        {/* Recipients Stats */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-primary-soft text-primary-deep">
              <Users className="h-4 sm:h-5 w-4 sm:w-5" />
            </div>
            <span className="text-xs sm:text-sm font-semibold">Destinataires</span>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Abonnés actifs</p>
              <p className="text-2xl sm:text-3xl font-bold text-gradient">{recipientsCount}</p>
            </div>
            {recipientsCount === 0 && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-2">
                Aucun destinataire. Activez des abonnés d'abord.
              </p>
            )}
          </div>
        </div>

        {/* Preview Card */}
        {preview && (
          <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant overflow-hidden">
            <div className="bg-gradient-leaf p-6 text-primary-foreground">
              <img src={logo} alt="Trinquat & Compagnie" className="h-12 mb-4 object-contain rounded" />
              <h3 className="text-lg font-semibold">{subject || "Sujet..."}</h3>
              <p className="text-xs opacity-90 mt-1">Newsletter du quartier</p>
            </div>
            <div className="p-6">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {content || "Votre contenu s'affichera ici..."}
              </p>
            </div>
            <div className="border-t border-border/40 p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Aperçu du rendu dans la boîte mail
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant p-4 sm:p-6">
          <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Conseils</h4>
          <ul className="space-y-1 sm:space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary-deep">•</span>
              <span>Utilisez un sujet accrocheur et court</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary-deep">•</span>
              <span>Gardez le message clair et concis</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary-deep">•</span>
              <span>Testez l'aperçu avant d'envoyer</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary-deep">•</span>
              <span>Vérifiez le nombre de destinataires</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* =============== History =============== */
function History({ 
  drafts, 
  setDrafts,
  sentNewsletters,
  onLoadDraft 
}: { 
  drafts: Draft[];
  setDrafts: React.Dispatch<React.SetStateAction<Draft[]>>;
  sentNewsletters: SentNewsletter[];
  onLoadDraft: (draft: Draft) => void;
}) {
  const [tab, setTab] = useState<"drafts" | "sent">("drafts");

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

  const isEmpty = (tab === "drafts" ? drafts.length === 0 : sentNewsletters.length === 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tabs */}
      <div className="overflow-x-auto">
      <div className="inline-flex rounded-full border border-border/60 bg-card/70 backdrop-blur-sm p-1 shadow-soft">
        <button
          onClick={() => setTab("drafts")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
            tab === "drafts" ? "bg-gradient-leaf text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" /> Brouillons ({drafts.length})
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
            tab === "sent" ? "bg-gradient-leaf text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Send className="h-4 w-4" /> Envoyées ({sentNewsletters.length})
        </button>
      </div>
      </div>

      {/* Content */}
      {isEmpty ? (
        <div className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant p-6 sm:p-10 text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <Clock className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground/40" />
          </div>
          <h2 className="text-base sm:text-lg font-medium mb-2">
            {tab === "drafts" ? "Aucun brouillon" : "Aucune newsletter envoyée"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            {tab === "drafts"
              ? "Commencez à rédiger une newsletter et enregistrez-la en brouillon."
              : "Vos newsletters envoyées apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tab === "drafts"
            ? drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-soft p-4 flex items-start justify-between gap-4 hover:bg-card/80 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{draft.subject}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{draft.content}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      Enregistré le {new Date(draft.savedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => onLoadDraft(draft)}
                      className="rounded-full bg-primary-soft px-4 py-2 text-xs font-medium text-primary-deep hover:bg-primary-soft/80 transition"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteDraft(draft.id)}
                      className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            : sentNewsletters.map((nl) => (
                <div
                  key={nl.id}
                  className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-soft p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{nl.subject}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{nl.content}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Envoyée à {nl.recipientCount} destinataire{nl.recipientCount > 1 ? "s" : ""}
                    </span>
                    <span>
                      {new Date(nl.sentAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}

/* =============== UI Components =============== */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm p-4 sm:p-5 shadow-soft">
      <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs">{icon}<span className="truncate">{label}</span></div>
      <div className="mt-2 text-2xl sm:text-3xl font-medium">{value}</div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 sm:gap-2 rounded-full px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition whitespace-nowrap active:scale-95 ${
        active ? "bg-gradient-leaf text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}
