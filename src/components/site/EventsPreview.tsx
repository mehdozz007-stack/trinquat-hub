import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, ArrowUpRight, X } from "lucide-react";
import imgFete from "@/assets/gallery-8.jpg";
import imgRepas from "@/assets/gallery-9.jpg";
import g7 from "@/assets/gallery-7.jpg";
const events = [
  {
    img: imgFete, badge: "À venir",
    date: "9 Juillet 2026", title: "Rencontre", place: "Square des Aiguerelles",
    desc: "Une rencontre magique avec la communauté locale.",
  },
  {
    img: g7, badge: "À venir",
    date: "31 Juillet 2026", title: "Apero compost & jardinage", place: "City Stade des Aiguerelles",
    desc: "Un moment convivial pour apprendre à composter et entretenir vos jardins. Apportez vos déchets organiques et votre bonne humeur !",
  },  
   {
    img: imgRepas, badge: "Mensuel",
    date: "Chaque 1er dimanche", title: "Repas partagé", place: "Square des Aiguerelles",
    desc: "Chacun apporte un plat à partager. Un rituel devenu incontournable.",
  },
];

export function EventsPreview() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="events-preview" className="relative bg-secondary/40 py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">Agenda</span>
            <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
              Les <span className="text-gradient">rendez-vous</span> du quartier.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              to="/evenements"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-deep hover:text-primary"
            >
              Voir tous les événements
              <ArrowUpRight className="h-4 w-4" />
            </Link>
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
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl max-h-[60vh] flex items-center justify-center p-6"
            >
              <img
                src={selectedImage}
                alt="Image agrandie"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
