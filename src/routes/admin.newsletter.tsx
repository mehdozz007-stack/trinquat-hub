import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, Trash2, LogOut, Mail, Search, Users, ShieldCheck, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/newsletter")({
  head: () => ({
    meta: [
      { title: "Admin Newsletter | Trinquat & Compagnie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminNewsletter,
});

type Subscriber = {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
};

function AdminNewsletter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [query, setQuery] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      const user = sessionData.session.user;
      setUserEmail(user.email ?? "");

      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const admin = !!roleRows?.some((r) => r.role === "admin");
      if (!mounted) return;
      setIsAdmin(admin);

      if (admin) {
        const { data } = await supabase
          .from("newsletter_subscribers")
          .select("*")
          .order("created_at", { ascending: false });
        if (mounted) setSubs((data as Subscriber[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const filtered = useMemo(
    () =>
      subs.filter((s) => s.email.toLowerCase().includes(query.toLowerCase())),
    [subs, query]
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet abonné ?")) return;
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (!error) setSubs((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleActive = async (s: Subscriber) => {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ is_active: !s.is_active })
      .eq("id", s.id);
    if (!error)
      setSubs((prev) => prev.map((p) => (p.id === s.id ? { ...p, is_active: !s.is_active } : p)));
  };

  const exportCSV = () => {
    const header = "email,is_active,created_at\n";
    const rows = filtered.map((s) => `${s.email},${s.is_active},${s.created_at}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center rounded-3xl border border-border/40 bg-card/80 p-10 shadow-elegant">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-2xl font-medium">Accès refusé</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Votre compte ({userEmail}) n'a pas le rôle administrateur.
            Contactez un administrateur existant pour qu'il vous attribue ce rôle.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleLogout}
              className="rounded-full border border-border/70 px-5 py-2 text-xs hover:bg-accent"
            >
              Se déconnecter
            </button>
            <Link
              to="/"
              className="rounded-full bg-gradient-leaf px-5 py-2 text-xs font-semibold text-primary-foreground shadow-soft"
            >
              Retour au site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const active = subs.filter((s) => s.is_active).length;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 -z-10 bg-gradient-leaf opacity-[0.04]" />
      <div className="absolute inset-0 -z-10 grain" />

      <header className="border-b border-border/40 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-leaf text-primary-foreground shadow-soft">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-medium leading-tight">Admin Newsletter</h1>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-full border border-border/70 px-4 py-2 text-xs hover:bg-accent">
              Site
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-4 py-2 text-xs hover:bg-accent"
            >
              <LogOut className="h-3.5 w-3.5" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <StatCard icon={<Users className="h-4 w-4" />} label="Abonnés totaux" value={subs.length} />
          <StatCard icon={<Mail className="h-4 w-4" />} label="Actifs" value={active} />
          <StatCard icon={<ShieldAlert className="h-4 w-4" />} label="Désactivés" value={subs.length - active} />
        </div>

        <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant overflow-hidden">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-5 border-b border-border/40">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un email..."
                className="w-full rounded-full border border-border/70 bg-background pl-11 pr-5 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
            <button
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-leaf px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Exporter CSV
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center text-sm text-muted-foreground">
              Aucun abonné{query ? " correspondant à votre recherche" : " pour le moment"}.
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
                        <button
                          onClick={() => toggleActive(s)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            s.is_active
                              ? "bg-primary/10 text-primary-deep hover:bg-primary/20"
                              : "bg-muted text-muted-foreground hover:bg-muted/70"
                          }`}
                        >
                          {s.is_active ? "Actif" : "Désactivé"}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="inline-flex items-center gap-1 rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                          aria-label="Supprimer"
                        >
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
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm p-5 shadow-soft">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-3xl font-medium">{value}</div>
    </div>
  );
}