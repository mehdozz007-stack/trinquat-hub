import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, ArrowUpRight, X, Search, Filter, FileText } from "lucide-react";
import imgFete from "@/assets/gallery-8.jpg";
import VideGrenier from "@/assets/vide-grenier1.jpg";
import g7 from "@/assets/2025-01-25_029.jpg";
import g10 from "@/assets/gallery-10.jpg";
import g11 from "@/assets/gallery-11.jpg";
import VideGrenier2 from "@/assets/Vide-grenier.jpg";

type ContentItem = {
  id: string;
  type: "event" | "news" | "article" | "document";
  img?: string;
  badge?: string;
  date: string;
  title: string;
  place?: string;
  desc: string;
  excerpt?: string;
  category?: string;
  isPast?: boolean;
};

const staticContent: ContentItem[] = [
  // Past Events
  {
    id: "1",
    type: "event",
    img: imgFete,
    badge: "Passé",
    date: "2026-07-09",
    title: "Rencontre",
    place: "Square des Aiguerelles",
    desc: "Une rencontre magique avec la communauté locale.",
    category: "Événement",
    isPast: true,
  },
  {
    id: "3",
    type: "news",
    img: VideGrenier2,
    badge: "Passé",
    date: "2026-04-12",
    title: "Affiche Vide Grenier",
    desc: "Un vide-grenier à ne pas manquer pour dénicher des trésors et rencontrer vos voisins.",
    excerpt: "Un vide-grenier à ne pas manquer pour dénicher des trésors et rencontrer vos voisins.",
    category: "Vie de quartier",
    isPast: true,
  },
  {
    id: "4",
    type: "news",
    img: g10,
    badge: "Passé",
    date: "2026-03-15",
    title: "Affiche Marathon Photo : capturez l'essence du quartier !",
    desc: "Rassemblez vos appareils photo et explorez le quartier à travers votre objectif.",
    excerpt: "Rassemblez vos appareils photo et explorez le quartier à travers votre objectif.",
    category: "Initiatives",
    isPast: true,
  },
  {
    id: "5",
    type: "news",
    img: g7,
    badge: "Passé",
    date: "2026-01-01",
    title: "Un nouveau composteur pour le quartier, à côté du city stade !",
    desc: "Un composteur a été installé pour encourager le compostage et réduire les déchets organiques.",
    excerpt: "Un composteur a été installé pour encourager le compostage et réduire les déchets organiques.",
    category: "Écologie",
    isPast: true,
  },
  {
    id: "6",
    type: "event",
    img: g11,
    badge: "Passé",
    date: "2025-11-16",
    place: "Square des Aiguerelles",
    title: "Fête/faites de la soupe : un succès intergénérationnel !",
    desc: "Les habitants se sont réunis pour partager des moments conviviaux autour de la soupe à cuisiner.",
    category: "Fête",
    isPast: true,
  },
];

function formatFrDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function getCategory(type: string): string {
  if (type === "event") return "Événement";
  if (type === "news") return "Actualité";
  if (type === "article") return "Article";
  if (type === "document") return "Document";
  return "Divers";
}

export function EventsAndNews() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [content, setContent] = useState<ContentItem[]>(staticContent);

  // Fetch from API if available
  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/api/events")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .catch(() => ({ events: [] })),
      fetch("/api/news")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .catch(() => ({ news: [] })),
    ]).then(([eventsData, newsData]: any[]) => {
      if (!mounted) return;
      const items: ContentItem[] = [];

      // Add events
      if (Array.isArray(eventsData?.events)) {
        eventsData.events.forEach((e: any, i: number) => {
          items.push({
            id: `event-${i}`,
            type: "event",
            img: e.image_url || imgFete,
            badge: e.badge || "Événement",
            date: e.event_date,
            title: e.title,
            place: e.place,
            desc: e.description || "",
            category: e.category || "Événement",
            isPast: new Date(e.event_date) < new Date(),
          });
        });
      }

      // Add news
      if (Array.isArray(newsData?.news)) {
        newsData.news.forEach((n: any, i: number) => {
          items.push({
            id: `news-${i}`,
            type: "news",
            img: n.image_url || VideGrenier,
            badge: n.tag || "Actualité",
            date: n.news_date,
            title: n.title,
            desc: n.description || "",
            excerpt: n.excerpt || "",
            category: n.tag || "Actualité",
            isPast: new Date(n.news_date) < new Date(),
          });
        });
      }

      if (items.length > 0) {
        setContent(items);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Get all unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    content.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats).sort();
  }, [content]);

  // Filter content
  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [content, searchQuery, selectedCategory]);

  // Split by past/upcoming
  const upcomingItems = filteredContent.filter((item) => !item.isPast);
  const pastItems = filteredContent
    .filter((item) => item.isPast)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderItem = (item: ContentItem, index: number) => (
    <Reveal key={item.id} delay={index * 0.05}>
      <article className="group relative h-full overflow-hidden rounded-3xl bg-card border border-border/70 transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant flex flex-col">
        {item.img && (
          <div
            className="relative h-48 overflow-hidden cursor-pointer"
            onClick={() => setSelectedImage(item.img!)}
          >
            <img
              src={item.img}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-foreground/40 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
              {item.badge}
            </span>
          </div>
        )}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full bg-primary-soft px-2.5 py-1 font-medium text-primary-deep">
              {item.category}
            </span>
            <span className="text-muted-foreground">{formatFrDate(item.date)}</span>
          </div>
          {item.place && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {item.place}
            </div>
          )}
          <h3 className="mt-4 text-lg font-semibold leading-tight">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">
            {item.desc}
          </p>
          {item.type === "event" && (
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep group/link"
            >
              Je participe
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </Link>
          )}
        </div>
      </article>
    </Reveal>
  );

  return (
    <section className="relative">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12 md:py-20">
        {/* Header */}
        <Reveal>
          <div className="mb-12">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">
              Agenda & Actualités
            </span>
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
              Tous les <span className="text-gradient">rendez-vous</span> du quartier
            </h1>
            <p className="mt-6 text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl">
              Événements, actualités, initiatives et informations importantes de Trinquat & Compagnie.
              Restez connecté à la vie de votre quartier !
            </p>
          </div>
        </Reveal>

        {/* Search Bar */}
        <Reveal delay={0.05}>
          <div className="mb-12 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un événement, une actualité..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border border-border/70 bg-card text-foreground placeholder-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>
        </Reveal>

        {/* Category Filter */}
        <Reveal delay={0.08}>
          <div className="mb-12 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !selectedCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border/70 text-muted-foreground hover:border-primary/50"
              }`}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/70 text-muted-foreground hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Upcoming Section */}
        {upcomingItems.length > 0 ? (
          <div>
            <Reveal>
              <h2 className="text-2xl md:text-3xl font-semibold mb-8 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary-deep" />
                À venir
              </h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
              {upcomingItems.map((item, i) => renderItem(item, i))}
            </div>
          </div>
        ) : (
          <Reveal>
            <div className="py-16 mb-16 text-center bg-card/50 border border-border/70 rounded-3xl">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/70 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucun événement à venir</h3>
              <p className="px-6 md:px-12 lg:px-20 text-muted-foreground">
                Revenez bientôt pour découvrir les prochains rendez-vous de Trinquat & Compagnie.
              </p>
            </div>
          </Reveal>
        )}

        {/* Empty State */}
        {filteredContent.length === 0 && (
          <Reveal>
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/70 mb-4" />
              <p className="text-muted-foreground text-lg">
                Aucun résultat ne correspond à votre recherche.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </Reveal>
        )}
      </div>

      {/* Past Section - Full Width Background */}
      {pastItems.length > 0 && (
        <div className="w-full bg-secondary/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12 md:py-20">
            <Reveal>
              <h2 className="text-3xl md:text-4xl mb-16 font-semibold">
                Archives et <span className="text-gradient">événements passés</span>
              </h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastItems.map((item, i) => renderItem(item, upcomingItems.length + i))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
            >
              <img
                src={selectedImage}
                alt="Image agrandie"
                className="w-full h-full object-contain rounded-2xl shadow-2xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 md:p-3 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all duration-200 z-10"
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
