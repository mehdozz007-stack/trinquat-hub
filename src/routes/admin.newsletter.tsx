import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Download, Trash2, LogOut, Mail, Search, Users, ShieldCheck, ShieldAlert,
  PenSquare, Send, Save, FileText, Eye, Calendar, CheckCircle2, Clock, X,
} from "lucide-react";
import { getAdminSession, logoutAdmin } from "../lib/auth.client";

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

// Mock data for demo
const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: "1", email: "marie.dupont@example.com", is_active: true, created_at: "2024-01-15T10:30:00Z" },
  { id: "2", email: "jean.martin@example.com", is_active: true, created_at: "2024-02-20T14:45:00Z" },
  { id: "3", email: "sophie.bernard@example.com", is_active: true, created_at: "2024-03-05T09:15:00Z" },
  { id: "4", email: "pierre.richard@example.com", is_active: false, created_at: "2024-01-10T11:20:00Z" },
  { id: "5", email: "anne.thomas@example.com", is_active: true, created_at: "2024-04-12T16:30:00Z" },
  { id: "6", email: "luc.fournier@example.com", is_active: true, created_at: "2024-03-22T13:45:00Z" },
];

const MOCK_ADMIN: AdminSession = { id: "admin-1", email: "admin@trinquat.local", role: "admin" };

function AdminNewsletter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [tab, setTab] = useState<Tab>("subscribers");
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // Check session on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const session = getAdminSession();
        if (mounted) {
          if (session) {
            setAdmin({ id: session.id, email: session.email, role: session.role });
          } else {
            navigate({ to: "/admin/login" });
          }
        }
      } catch {
        if (mounted) navigate({ to: "/admin/login" });
      } finally {
        if (mounted) setCheckingSession(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  // Load subscribers - using mock data
  useEffect(() => {
    if (!admin) return;
    let mounted = true;
    (async () => {
      setSubsLoading(true);
      try {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 400));
        if (mounted) setSubs(MOCK_SUBSCRIBERS);
      } catch {
        if (mounted) setSubs(MOCK_SUBSCRIBERS);
      } finally {
        if (mounted) setSubsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [admin]);

  useEffect(() => {
    if (checkingSession) return;
    setLoading(false);
  }, [checkingSession]);

  const handleLogout = async () => {
    logoutAdmin();
    setAdmin(null);
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
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-full border border-border/70 px-4 py-2 text-xs hover:bg-accent">Site</Link>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-4 py-2 text-xs hover:bg-accent">
              <LogOut className="h-3.5 w-3.5" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <StatCard icon={<Users className="h-4 w-4" />} label="Abonnés actifs" value={activeSubs.length} />
          <StatCard icon={<Mail className="h-4 w-4" />} label="Total abonnés" value={subs.length} />
          <StatCard icon={<Mail className="h-4 w-4" />} label="Désactivés" value={subs.filter(s => !s.is_active).length} />
        </div>

        {/* Tabs */}
        <div className="inline-flex rounded-full border border-border/60 bg-card/70 backdrop-blur-sm p-1 mb-6 shadow-soft">
          <TabBtn active={tab === "subscribers"} onClick={() => setTab("subscribers")} icon={<Users className="h-4 w-4" />} label="Abonnés" />
          <TabBtn active={tab === "compose"} onClick={() => setTab("compose")} icon={<PenSquare className="h-4 w-4" />} label="Composer" />
          <TabBtn active={tab === "history"} onClick={() => setTab("history")} icon={<FileText className="h-4 w-4" />} label="Historique" />
        </div>

        {tab === "subscribers" && (
          <Subscribers subs={subs} setSubs={setSubs} loading={subsLoading} />
        )}
        {tab === "compose" && (
          <Composer recipientsCount={activeSubs.length} />
        )}
        {tab === "history" && (
          <History />
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
      // Simulate deletion
      await new Promise(resolve => setTimeout(resolve, 300));
      setSubs((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (s: Subscriber) => {
    setActionLoading(s.id);
    try {
      // Simulate update
      await new Promise(resolve => setTimeout(resolve, 300));
      setSubs((prev) => prev.map((p) => (p.id === s.id ? { ...p, is_active: !s.is_active } : p)));
    } catch {
      alert("Erreur lors de la mise à jour");
    } finally {
      setActionLoading(null);
    }
  };

  const exportCSV = async () => {
    try {
      // Generate CSV from current data
      const headers = ["Email", "Statut", "Inscrit le"];
      const rows = filtered.map(s => [
        s.email,
        s.is_active ? "Actif" : "Désactivé",
        new Date(s.created_at).toLocaleDateString("fr-FR")
      ]);
      
      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(","))
        .join("\n");
      
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newsletter_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
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
    <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant overflow-hidden">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-5 border-b border-border/40">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un email..."
            className="w-full rounded-full border border-border/70 bg-background pl-11 pr-5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>
        <button onClick={exportCSV} disabled={filtered.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-leaf px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow hover:-translate-y-0.5 disabled:opacity-50">
          <Download className="h-4 w-4" /> Exporter CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="p-16 text-center text-sm text-muted-foreground">
          {subs.length === 0 ? "Aucun abonné pour le moment." : "Aucun abonné correspondant à votre recherche."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
function Composer({ recipientsCount }: { recipientsCount: number }) {
  return (
    <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant p-10 text-center">
      <div className="flex justify-center mb-4">
        <Mail className="h-12 w-12 text-muted-foreground/40" />
      </div>
      <h2 className="text-lg font-medium mb-2">Composer une newsletter</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        La fonctionnalité de composition et d'envoi de newsletters nécessite une configuration d'un service d'envoi d'emails (Resend, SendGrid, etc.).
      </p>
      <p className="text-xs text-muted-foreground mt-4 border-t border-border/30 pt-4">
        Vous pouvez actuellement gérer les abonnés dans l'onglet « Abonnés ». Contactez l'administrateur technique pour activer l'envoi de newsletters.
      </p>
    </div>
  );
}

/* =============== History =============== */
function History() {
  return (
    <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant p-10 text-center">
      <div className="flex justify-center mb-4">
        <Clock className="h-12 w-12 text-muted-foreground/40" />
      </div>
      <h2 className="text-lg font-medium mb-2">Historique des newsletters</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        L'historique des newsletters envoyées s'affichera ici une fois que vous commencerez à envoyer des newsletters.
      </p>
      <p className="text-xs text-muted-foreground mt-4 border-t border-border/30 pt-4">
        Pour le moment, vous pouvez gérer vos abonnés dans l'onglet « Abonnés ».
      </p>
    </div>
  );
}

/* =============== UI Components =============== */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm p-5 shadow-soft">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">{icon}<span>{label}</span></div>
      <div className="mt-2 text-3xl font-medium">{value}</div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
        active ? "bg-gradient-leaf text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon} {label}
    </button>
  );
}
