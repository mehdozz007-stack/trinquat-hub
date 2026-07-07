import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
//import g1 from "@/assets/gallery-1.jpg";
import g1 from "@/assets/gallery-1.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g8 from "@/assets/gallery-8.jpg";
import g9 from "@/assets/gallery-9.jpg";
import g10 from "@/assets/vide-grenier1.jpg";
import g11 from "@/assets/Vide-grenier2.jpg";
const photos = [
  { src: g1, alt: "Composteur installé dans le quartier", h: "row-span-2" },
  { src: g8, alt: "Voisins réunis sous un arbre", h: "" },
  { src: g5, alt: "Atelier créatif enfants", h: "" },
  { src: g9, alt: "La fête intergénérationnelle de la soupe", h: "" },
  { src: g10, alt: "Vide-grenier de printemps", h: "" },
  { src: g11, alt: "Vide-grenier de printemps", h: "" },
];

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="gallery" className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">Galerie</span>
            <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
              Nos<span className="text-gradient"> photos</span> souvenirs.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 auto-rows-[180px] md:auto-rows-[220px] gap-4">
          {photos.map((p, i) => (
            <Reveal key={i} delay={i * 0.05} className={p.h}>
              <button
                onClick={() => setOpen(i)}
                className={`group relative h-full w-full overflow-hidden rounded-2xl ${p.h}`}
              >
                <img
                  src={p.src} alt={p.alt} loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-foreground/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-foreground/85 p-6 backdrop-blur-xl"
            onClick={() => setOpen(null)}
          >
            {/* Navigation gauche */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((open - 1 + photos.length) % photos.length);
              }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background p-3 text-foreground transition-all hover:scale-110 z-10"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <motion.img
              key={open}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              src={photos[open].src} alt={photos[open].alt}
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-elegant"
            />

            {/* Navigation droite */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((open + 1) % photos.length);
              }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background p-3 text-foreground transition-all hover:scale-110 z-10"
              aria-label="Photo suivante"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Bouton fermer */}
            <button
              onClick={() => setOpen(null)}
              className="absolute right-6 top-6 rounded-full bg-background/90 p-3 text-foreground hover:bg-background"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Compteur photos */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/80 text-sm text-foreground">
              {open + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}