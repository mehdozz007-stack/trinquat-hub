import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, X } from "lucide-react";
import VideGrenier from "@/assets/Vide-grenier.jpg";
import g1 from "@/assets/gallery-1.jpg";
import g10 from "@/assets/gallery-10.jpg";
const news = [
  { img: VideGrenier, tag: "Vie de quartier", date: "12 Avril 2026", title: "Le vide-grenier de printemps approche !",
    excerpt: "Un vide-grenier à ne pas manquer pour dénicher des trésors et rencontrer vos voisins." },
  { img: g10, tag: "Vie de quartier", date: "15 Mars 2026", title: "Marathon Photo : capturez l'essence du quartier !",
    excerpt: "Rassemblez vos appareils photo et explorez le quartier à travers votre objectif." },
    { img: g1, tag: "Jardin", date: "1 Janvier 2026", title: "Un nouveau composteur pour le quartier, juste à coté du city stade !",
    excerpt: "Un composteur a été installé pour encourager le compostage et réduire les déchets organiques." },
];

export function ActualitesPreview() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="news-preview" className="py-12 md:py-20 bg-secondary/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">Actualités</span>
            <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
              Les <span className="text-gradient">dernières nouvelles</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              to="/actualites"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-deep hover:text-primary"
            >
              Voir toutes les actualités
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {news.map((n, i) => (
            <Reveal key={n.title} delay={i * 0.08}>
              <article className="group h-full flex flex-col overflow-hidden rounded-3xl bg-card border border-border/70 transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant">
                <div className="aspect-16/10 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(n.img)}>
                  <img src={n.img} alt={n.title} loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded-full bg-primary-soft px-2.5 py-1 font-medium text-primary-deep">{n.tag}</span>
                    <span className="text-muted-foreground">{n.date}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold leading-snug">{n.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground flex-1">{n.excerpt}</p>
                  {/*<a href="#" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep">
                    Lire l'article <ArrowUpRight className="h-4 w-4" />
                  </a>*/}
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
