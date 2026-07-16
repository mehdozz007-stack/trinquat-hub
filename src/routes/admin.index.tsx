import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Image, Mail, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Trinquat & Compagnie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type AdminSession = { id: string; email: string; role: string };

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/me", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as AdminSession;
        setAdmin(data);
      } else {
        navigate({ to: "/admin/login" });
      }
    } catch {
      navigate({ to: "/admin/login" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    navigate({ to: "/admin/login" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const dashboard = [
    {
      icon: <Mail className="h-6 w-6" />,
      label: "Newsletter",
      description: "Gérer les abonnés et envoyer des newsletters",
      href: "/admin/newsletter",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      label: "Événements & Actualités",
      description: "Créer, modifier et gérer les événements et actualités",
      href: "/admin/content",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Image className="h-6 w-6" />,
      label: "Galerie",
      description: "Gérer les photos de la galerie",
      href: "/admin/gallery",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-leaf opacity-[0.04]" />

      {/* Header */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Tableau de bord</h1>
            <p className="text-sm text-muted-foreground mt-1">Bienvenue, {admin.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboard.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="group rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-soft overflow-hidden hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <div className={`h-24 bg-llinear-to-br ${item.color} opacity-10 group-hover:opacity-15 transition-opacity`} />
              <div className="p-6 sm:p-8">
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${item.color} text-white shadow-soft mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{item.label}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                  Accéder
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
