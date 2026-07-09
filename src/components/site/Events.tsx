import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, ArrowUpRight, X, Badge } from "lucide-react";
import imgFete from "@/assets/gallery-8.jpg";
import imgRepas from "@/assets/gallery-9.jpg";
import VideGrenier from "@/assets/vide-grenier1.jpg";
import g7 from "@/assets/gallery-7.jpg";
import g9 from "@/assets/gallery-9.jpg";

type EventItem = { img: string; badge?: string; date: string; title: string; place?: string; desc: string };

const staticEvents: EventItem[] = [
  {
    img: imgFete, badge: "À venir",
    date: "9 Juillet 2026", title: "Rencontre", place: "Square des Aiguerelles",
    desc: "Une rencontre magique avec la communauté locale.",
  },
  {
    img: g7, badge: "À venir", date: "31 Juillet 2026", title: "Apéro compost & jardinage", place: "City Stade des Aiguerelles",
    desc: "Un moment convivial pour apprendre à composter et entretenir vos jardins. Apportez vos déchets organiques et votre bonne humeur !",
  },
  { img: VideGrenier, badge: "Vie de quartier", date: "12 Avril 2026", place: "École Anne-Frank Charles Dickes", title: "Le vide-grenier de printemps",
      desc: "Un vide-grenier à l'école du quartier, pour dénicher des trésors et rencontrer vos voisins." },
    
  {
    img: g9, badge: "Fête", date: "16 Novembre 2025", place: "Square des Aiguerelles", title: "Fête/faites de la soupe : un succès intergénérationnel !",
    desc: "Les habitants se sont réunis pour partager des moments conviviaux autour de la soupe à cuisiner.",
  },
];

const more = [
  { date: "26 Mai", label: "Cinéma en plein air" },
  { date: "15 Mars", label: "Marathon Photo" },
];

function formatFrDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch { return iso; }
}

export function Events() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>(staticEvents);

  useEffect(() => {
    let mounted = true;
    fetch("/api/events")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: any) => {
        const list = Array.isArray(data?.events) ? data.events : [];
        if (mounted && list.length > 0) {
          setEvents(list.map((e: any) => ({
            img: e.image_url || imgFete,
            badge: e.badge || undefined,
            date: formatFrDate(e.event_date),
            title: e.title,
            place: e.place || undefined,
            desc: e.description || "",
          })));
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <section id="events" className="relative bg-secondary/40 py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">Agenda</span>
            <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
              Nos <span className="text-gradient">événements</span>  au quartier
            </h2>
            <p className="mt-4 text-base md:text-lg leading-relaxed text-muted-foreground max-w-md">
               Toute l'année, des moments à vivre ensemble : fêtes, ateliers, jardinage et repas partagés.        
            </p>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {events.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.08}>
              <article className="group relative h-full overflow-hidden rounded-3xl bg-card border border-border/70 transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant">
                <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => setSelectedImage(e.img)}>
                  <img
                    src={e.img} alt={e.title} loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-foreground/40 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                    {e.badge}
                  </span>
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{e.date}</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{e.place}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold leading-tight">{e.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
                  <Link to="/contact" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep group/link">
                    Je participe
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-12 rounded-3xl border border-border/70 bg-card p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-xl font-semibold">Et aussi cette année...</h3>
                <p className="text-sm text-muted-foreground mt-1">Le calendrier de l'association.</p>
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-2 text-sm">
                {more.map((m) => (
                  <li key={m.label} className="flex items-baseline gap-3 border-b border-dashed border-border/70 py-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-primary-deep w-16">{m.date}</span>
                    <span className="text-foreground">{m.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

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