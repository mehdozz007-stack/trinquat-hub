import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Download, Trash2, LogOut, Mail, Search, Users, ShieldCheck, ShieldAlert,
  PenSquare, Send, Save, FileText, Eye, Calendar, CheckCircle2, Clock, X,
} from "lucide-react";

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
type Newsletter = {
  id: string;
  subject: string;
  content: string;
  status: "draft" | "sent";
  recipients_count: number;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};
type Tab = "compose" | "history" | "subscribers";

function AdminNewsletter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("compose");

  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);

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
      setUserId(user.id);

      const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const admin = !!roleRows?.some((r) => r.role === "admin");
      if (!mounted) return;
      setIsAdmin(admin);

      if (admin) {
        const [{ data: s }, { data: n }] = await Promise.all([
          supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }),
          supabase.from("newsletters").select("*").order("created_at", { ascending: false }),
        ]);
        if (!mounted) return;
        setSubs((s as Subscriber[]) ?? []);
        setNewsletters((n as Newsletter[]) ?? []);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const activeSubs = subs.filter((s) => s.is_active);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Chargement...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center rounded-3xl border border-border/40 bg-card/80 p-10 shadow-elegant">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-2xl font-medium">Accès refusé</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Votre compte ({userEmail}) n'a pas le rôle administrateur.
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
              <p className="text-xs text-muted-foreground">{userEmail}</p>
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
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <StatCard icon={<Users className="h-4 w-4" />} label="Abonnés actifs" value={activeSubs.length} />
          <StatCard icon={<Mail className="h-4 w-4" />} label="Total abonnés" value={subs.length} />
          <StatCard icon={<Send className="h-4 w-4" />} label="Newsletters envoyées" value={newsletters.filter(n => n.status === "sent").length} />
          <StatCard icon={<FileText className="h-4 w-4" />} label="Brouillons" value={newsletters.filter(n => n.status === "draft").length} />
        </div>

        {/* Tabs */}
        <div className="inline-flex rounded-full border border-border/60 bg-card/70 backdrop-blur-sm p-1 mb-6 shadow-soft">
          <TabBtn active={tab === "compose"} onClick={() => setTab("compose")} icon={<PenSquare className="h-4 w-4" />} label="Composer" />
          <TabBtn active={tab === "history"} onClick={() => setTab("history")} icon={<FileText className="h-4 w-4" />} label="Historique" />
          <TabBtn active={tab === "subscribers"} onClick={() => setTab("subscribers")} icon={<Users className="h-4 w-4" />} label="Abonnés" />
        </div>

        {tab === "compose" && (
          <Composer
            userId={userId}
            recipientsCount={activeSubs.length}
            onSaved={(n) => setNewsletters((prev) => [n, ...prev.filter((p) => p.id !== n.id)])}
          />
        )}
        {tab === "history" && (
          <History
            newsletters={newsletters}
            recipientsCount={activeSubs.length}
            onUpdate={(n) => setNewsletters((prev) => prev.map((p) => (p.id === n.id ? n : p)))}
            onDelete={(id) => setNewsletters((prev) => prev.filter((p) => p.id !== id))}
          />
        )}
        {tab === "subscribers" && (
          <Subscribers subs={subs} setSubs={setSubs} />
        )}
      </main>
    </div>
  );
}

/* ---------------- Composer ---------------- */

function Composer({
  userId, recipientsCount, onSaved,
}: { userId: string | null; recipientsCount: number; onSaved: (n: Newsletter) => void }) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const reset = () => { setSubject(""); setContent(""); setPreview(false); };

  const saveDraft = async () => {
    if (!subject.trim() || !content.trim()) {
      setFeedback({ type: "err", msg: "Sujet et contenu requis." });
      return;
    }
    setSaving(true); setFeedback(null);
    const { data, error } = await supabase
      .from("newsletters")
      .insert({ subject: subject.trim(), content: content.trim(), status: "draft", created_by: userId })
      .select()
      .single();
    setSaving(false);
    if (error) { setFeedback({ type: "err", msg: error.message }); return; }
    onSaved(data as Newsletter);
    setFeedback({ type: "ok", msg: "Brouillon enregistré." });
    reset();
  };

  const sendNow = async () => {
    if (!subject.trim() || !content.trim()) {
      setFeedback({ type: "err", msg: "Sujet et contenu requis." });
      return;
    }
    if (recipientsCount === 0) {
      setFeedback({ type: "err", msg: "Aucun abonné actif." });
      return;
    }
    if (!confirm(`Envoyer cette newsletter à ${recipientsCount} abonné(s) ?`)) return;
    setSending(true); setFeedback(null);
    const { data, error } = await supabase
      .from("newsletters")
      .insert({
        subject: subject.trim(), content: content.trim(),
        status: "sent", recipients_count: recipientsCount,
        sent_at: new Date().toISOString(), created_by: userId,
      })
      .select()
      .single();
    setSending(false);
    if (error) { setFeedback({ type: "err", msg: error.message }); return; }
    onSaved(data as Newsletter);
    setFeedback({ type: "ok", msg: `Newsletter marquée comme envoyée à ${recipientsCount} abonné(s).` });
    reset();
  };

  return (
    <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary-deep">
            <PenSquare className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-medium">Nouvelle newsletter</h2>
            <p className="text-xs text-muted-foreground">{recipientsCount} destinataire(s) actif(s)</p>
          </div>
        </div>
        <button
          onClick={() => setPreview((p) => !p)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-4 py-2 text-xs hover:bg-accent"
        >
          <Eye className="h-3.5 w-3.5" />
          {preview ? "Éditer" : "Aperçu"}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {!preview ? (
          <>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Sujet</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                placeholder="Ex. Nouvelle saison de Trinquat & Compagnie"
                className="w-full rounded-2xl border border-border/70 bg-background px-5 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <p className="mt-1 text-[10px] text-muted-foreground text-right">{subject.length}/200</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Contenu</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                maxLength={10000}
                placeholder="Rédigez votre newsletter ici. Les sauts de ligne sont conservés."
                className="w-full rounded-2xl border border-border/70 bg-background px-5 py-4 text-sm leading-relaxed font-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 resize-y"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{wordCount} mot(s)</span>
                <span>{content.length}/10000</span>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
            <div className="px-6 py-4 border-b border-border/40 bg-muted/30">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Aperçu email</p>
              <h3 className="mt-1 text-xl font-medium">{subject || "(sans sujet)"}</h3>
            </div>
            <div className="px-6 py-6 whitespace-pre-wrap text-sm leading-relaxed">
              {content || <span className="text-muted-foreground italic">(vide)</span>}
            </div>
            <div className="px-6 py-4 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground">
              Trinquat & Compagnie · Vous recevez cet email car vous êtes abonné à notre newsletter.
            </div>
          </div>
        )}

        {feedback && (
          <div className={`rounded-2xl px-4 py-3 text-sm ${
            feedback.type === "ok" ? "bg-primary/10 text-primary-deep" : "bg-destructive/10 text-destructive"
          }`}>
            {feedback.msg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={saveDraft}
            disabled={saving || sending}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border/70 px-6 py-3 text-sm hover:bg-accent disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? "Enregistrement..." : "Enregistrer le brouillon"}
          </button>
          <button
            onClick={sendNow}
            disabled={saving || sending || recipientsCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-leaf px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Send className="h-4 w-4" /> {sending ? "Envoi..." : `Envoyer à ${recipientsCount} abonné(s)`}
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground border-t border-border/30 pt-4">
          Note : la newsletter est enregistrée et marquée comme envoyée. La distribution email réelle nécessite la configuration d'un service d'envoi (Resend, SendGrid…) — demandez-le pour l'activer.
        </p>
      </div>
    </div>
  );
}

/* ---------------- History ---------------- */

function History({
  newsletters, recipientsCount, onUpdate, onDelete,
}: {
  newsletters: Newsletter[]; recipientsCount: number;
  onUpdate: (n: Newsletter) => void; onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState<Newsletter | null>(null);

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette newsletter ?")) return;
    const { error } = await supabase.from("newsletters").delete().eq("id", id);
    if (!error) onDelete(id);
  };

  const sendDraft = async (n: Newsletter) => {
    if (recipientsCount === 0) { alert("Aucun abonné actif."); return; }
    if (!confirm(`Envoyer ce brouillon à ${recipientsCount} abonné(s) ?`)) return;
    const { data, error } = await supabase
      .from("newsletters")
      .update({ status: "sent", recipients_count: recipientsCount, sent_at: new Date().toISOString() })
      .eq("id", n.id).select().single();
    if (!error && data) onUpdate(data as Newsletter);
  };

  if (newsletters.length === 0) {
    return (
      <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-elegant p-16 text-center text-sm text-muted-foreground">
        Aucune newsletter pour le moment. Créez-en une depuis l'onglet « Composer ».
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3">
        {newsletters.map((n) => (
          <div key={n.id} className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm p-5 shadow-soft hover:shadow-elegant transition">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {n.status === "sent" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary-deep px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                      <CheckCircle2 className="h-3 w-3" /> Envoyée
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                      <Clock className="h-3 w-3" /> Brouillon
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(n.sent_at ?? n.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  {n.status === "sent" && (
                    <span className="text-[11px] text-muted-foreground">· {n.recipients_count} destinataires</span>
                  )}
                </div>
                <h3 className="text-base font-medium truncate">{n.subject}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{n.content}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setOpen(n)} className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs hover:bg-accent">
                  <Eye className="h-3.5 w-3.5" /> Voir
                </button>
                {n.status === "draft" && (
                  <button onClick={() => sendDraft(n)} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-leaf px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
                    <Send className="h-3.5 w-3.5" /> Envoyer
                  </button>
                )}
                <button onClick={() => remove(n.id)} className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setOpen(null)}>
          <div className="w-full max-w-2xl max-h-[85vh] overflow-auto rounded-3xl border border-border/60 bg-card shadow-elegant" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30 sticky top-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Aperçu newsletter</p>
              <button onClick={() => setOpen(null)} className="rounded-full p-1.5 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-6 py-5 border-b border-border/40">
              <h3 className="text-2xl font-medium">{open.subject}</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                {open.status === "sent" ? `Envoyée le ${new Date(open.sent_at!).toLocaleString("fr-FR")} à ${open.recipients_count} abonné(s)` : "Brouillon"}
              </p>
            </div>
            <div className="px-6 py-6 whitespace-pre-wrap text-sm leading-relaxed">{open.content}</div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- Subscribers ---------------- */

function Subscribers({ subs, setSubs }: { subs: Subscriber[]; setSubs: React.Dispatch<React.SetStateAction<Subscriber[]>> }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => subs.filter((s) => s.email.toLowerCase().includes(query.toLowerCase())), [subs, query]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet abonné ?")) return;
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (!error) setSubs((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleActive = async (s: Subscriber) => {
    const { error } = await supabase.from("newsletter_subscribers").update({ is_active: !s.is_active }).eq("id", s.id);
    if (!error) setSubs((prev) => prev.map((p) => (p.id === s.id ? { ...p, is_active: !s.is_active } : p)));
  };

  const exportCSV = () => {
    const header = "email,is_active,created_at\n";
    const rows = filtered.map((s) => `${s.email},${s.is_active},${s.created_at}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

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
                    <button onClick={() => toggleActive(s)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        s.is_active ? "bg-primary/10 text-primary-deep hover:bg-primary/20" : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}>
                      {s.is_active ? "Actif" : "Désactivé"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(s.id)} className="inline-flex items-center gap-1 rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition" aria-label="Supprimer">
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

/* ---------------- Bits ---------------- */

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