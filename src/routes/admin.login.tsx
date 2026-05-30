import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin — Connexion | Trinquat & Compagnie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/newsletter" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fn =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin/newsletter` },
          });
    const { error } = await fn;
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (mode === "signup") {
      setError("Compte créé. Vérifiez vos emails pour confirmer puis connectez-vous. Un administrateur doit ensuite vous attribuer le rôle admin.");
      setMode("login");
      return;
    }
    navigate({ to: "/admin/newsletter" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-leaf opacity-[0.06]" />
      <div className="absolute inset-0 -z-10 grain" />
      <div className="w-full max-w-md rounded-3xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-elegant p-10">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Retour au site</Link>
        <div className="mt-6 mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-leaf text-primary-foreground shadow-soft">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-medium">Espace admin</h1>
            <p className="text-xs text-muted-foreground">Trinquat & Compagnie</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-border/70 bg-background pl-11 pr-5 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-border/70 bg-background pl-11 pr-5 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-leaf px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow hover:-translate-y-0.5 disabled:opacity-70"
          >
            {loading ? "..." : mode === "login" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
          className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "login" ? "Pas de compte ? Créer un compte" : "Déjà inscrit ? Se connecter"}
        </button>
      </div>
    </div>
  );
}