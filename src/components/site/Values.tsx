import { Reveal } from "./Reveal";
import { useState } from "react";
import { Leaf, Users, HandHeart, Sparkles, TreePine, Heart, X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import communityImg from "@/assets/Triquat_CompagnieVoisins.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

const values = [
  { icon: Users, title: "Voisinage", text: "Faire connaissance, tisser des liens durables entre habitants de tous âges." },
  { icon: HandHeart, title: "Entraide", text: "Coup de main, prêt d'outils, garde d'enfants : une chaîne de solidarité." },
  { icon: Sparkles, title: "Convivialité", text: "Des moments simples et chaleureux qui font la richesse du quartier." },
  { icon: TreePine, title: "Nature", text: "Des plantations, et le respect du vivant qui nous entoure." },
  { icon: Heart, title: "Famille", text: "Des activités pensées pour les enfants, les parents et les aînés." },
  { icon: Leaf, title: "Écologie", text: "Composteur collectif, troc, et initiatives pour un quartier plus durable." },
];

const communityPhotos = [
  { src: communityImg, alt: "Trinquat & Compagnie - Notre communauté" },
  { src: gallery6, alt: "Trinquat & Compagnie - Moments en commun" },
];

export function Values() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section id="values" className="relative py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">
                Nos valeurs
              </span>
              <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
                Ce qui nous <span className="text-gradient">rassemble</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 text-base md:text-lg leading-relaxed text-muted-foreground">
                Notre association s'appuie sur des valeurs simples mais essentielles : la solidarité, 
                le respect de la nature et la convivialité. Nous croyons que chaque geste, 
                même modeste, peut renforcer les liens entre voisins et embellir notre cadre de vie.
                <br />
                Ensemble, nous cultivons un esprit d'entraide, nous prenons soin de notre environnement, 
                et nous créons des moments de partage où chacun trouve sa place.
              </p>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4">
              {communityPhotos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className="group relative overflow-hidden rounded-3xl shadow-2xl shadow-primary-deep/30"
                >
                  <img 
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-foreground/85 p-6 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            {/* Navigation gauche */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((selectedImage - 1 + communityPhotos.length) % communityPhotos.length);
              }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background p-3 text-foreground transition-all hover:scale-110 z-10"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <motion.img
              key={selectedImage}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              src={communityPhotos[selectedImage].src}
              alt={communityPhotos[selectedImage].alt}
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-elegant"
            />

            {/* Navigation droite */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((selectedImage + 1) % communityPhotos.length);
              }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background p-3 text-foreground transition-all hover:scale-110 z-10"
              aria-label="Photo suivante"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Bouton fermer */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-6 top-6 rounded-full bg-background/90 p-3 text-foreground hover:bg-background"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Compteur photos */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/80 text-sm text-foreground">
              {selectedImage + 1} / {communityPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
