import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { X, Plus, Trash2, LogOut, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({
    meta: [
      { title: "Admin Galerie | Trinquat & Compagnie" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminGallery,
});

type AdminSession = { id: string; email: string; role: string };
type GalleryImage = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  image_key: string;
  order_index: number;
  created_at: string;
  updated_at: string;
};

function AdminGallery() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check auth
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
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const loadGallery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { gallery: GalleryImage[] };
        setImages(data.gallery || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (admin) {
      loadGallery();
    }
  }, [admin, loadGallery]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    navigate({ to: "/admin/login" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Veuillez sélectionner une image." });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = (await res.json()) as { url: string; key: string };
      setImageUrl(data.url);
      setImageKey(data.key);
      setMessage({ type: "success", text: "Image uploadée avec succès." });
    } catch (err) {
      setMessage({ type: "error", text: "Erreur lors de l'upload." });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !imageKey) {
      setMessage({ type: "error", text: "Veuillez uploader une image." });
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          description: description.trim() || null,
          image_url: imageUrl,
          image_key: imageKey,
        }),
      });

      if (!res.ok) throw new Error("Failed to add image");

      setTitle("");
      setDescription("");
      setFile(null);
      setPreviewUrl(null);
      setImageUrl(null);
      setImageKey(null);
      setEditorOpen(false);
      setMessage({ type: "success", text: "Image ajoutée à la galerie." });
      loadGallery();
    } catch (err) {
      setMessage({ type: "error", text: "Erreur lors de l'ajout de l'image." });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (img: GalleryImage) => {
    if (!confirm(`Supprimer "${img.title || "l'image"}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/gallery/${img.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Image supprimée." });
        loadGallery();
      } else {
        setMessage({ type: "error", text: "Erreur lors de la suppression." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erreur serveur." });
      console.error(err);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 -z-10 bg-gradient-leaf opacity-[0.04]" />

      {/* Header */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-semibold truncate">Galerie</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{images.length} image(s)</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setEditorOpen(true)}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-gradient-leaf px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow transition-all whitespace-nowrap"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Ajouter une image</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
            <Link to="/admin" className="rounded-full border border-border/70 px-2.5 sm:px-3 py-2 text-xs hover:bg-accent transition-colors" title="Dashboard">📊</Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/70 px-2 sm:px-3 py-2 text-xs hover:bg-accent transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      {message && (
        <div className={`mx-4 sm:mx-6 mt-3 sm:mt-4 rounded-lg p-3 text-sm flex items-center gap-2 ${
          message.type === "success"
            ? "bg-primary/10 border border-primary/30 text-primary-deep"
            : "bg-destructive/10 border border-destructive/30 text-destructive"
        }`}>
          {message.text}
        </div>
      )}

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Chargement des images...</div>
        ) : images.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-card/40 p-16 text-center">
            <p className="text-muted-foreground">Aucune image dans la galerie.</p>
            <button
              onClick={() => setEditorOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-leaf px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              <Plus className="h-4 w-4" />
              Ajouter la première image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {images.map((img) => (
              <div
                key={img.id}
                className="group rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm shadow-soft overflow-hidden hover:shadow-elegant transition-all"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={img.image_url}
                    alt={img.title || "Gallery image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <button
                    onClick={() => handleDelete(img)}
                    className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  {img.title && <h3 className="font-semibold text-sm truncate">{img.title}</h3>}
                  {img.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{img.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(img.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Editor Modal */}
      <AnimatePresence>
        {editorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditorOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-card border border-border/40 shadow-elegant overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
                <h2 className="text-xl font-semibold">Ajouter une image</h2>
                <button
                  onClick={() => {
                    setEditorOpen(false);
                    setFile(null);
                    setPreviewUrl(null);
                    setImageUrl(null);
                    setImageKey(null);
                    setTitle("");
                    setDescription("");
                  }}
                  className="rounded-lg hover:bg-accent p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddImage} className="p-6 space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Image</label>
                  {previewUrl ? (
                    <div className="relative rounded-xl overflow-hidden bg-muted aspect-video">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      {!imageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setPreviewUrl(null);
                          }}
                          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30 p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Sélectionnez une image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Upload Button */}
                {file && !imageUrl && (
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full rounded-full border border-border/70 px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {uploading ? "Upload..." : "Uploader"}
                  </button>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (optionnel)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre de la photo"
                    className="w-full rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description (optionnelle)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description de la photo"
                    rows={3}
                    className="w-full rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditorOpen(false);
                      setFile(null);
                      setPreviewUrl(null);
                      setImageUrl(null);
                      setImageKey(null);
                      setTitle("");
                      setDescription("");
                    }}
                    className="flex-1 rounded-full border border-border/70 px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !imageUrl}
                    className="flex-1 rounded-full bg-gradient-leaf px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow transition-all disabled:opacity-50"
                  >
                    {uploading ? "Ajout..." : "Ajouter"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
