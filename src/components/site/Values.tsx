import { Reveal } from "./Reveal";
import { useState } from "react";
import { Leaf, Users, HandHeart, Sparkles, TreePine, Heart } from "lucide-react";

const values = [
  { icon: Users, title: "Voisinage", text: "Faire connaissance, tisser des liens durables entre habitants de tous âges." },
  { icon: HandHeart, title: "Entraide", text: "Coup de main, prêt d'outils, garde d'enfants : une chaîne de solidarité." },
  { icon: Sparkles, title: "Convivialité", text: "Des moments simples et chaleureux qui font la richesse du quartier." },
  { icon: TreePine, title: "Nature", text: "Des plantations, et le respect du vivant qui nous entoure." },
  { icon: Heart, title: "Famille", text: "Des activités pensées pour les enfants, les parents et les aînés." },
  { icon: Leaf, title: "Écologie", text: "Composteur collectif, troc, et initiatives pour un quartier plus durable." },
];

export function Values() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

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
            <img 
              src={new URL("../../assets/Triquat_CompagnieVoisins.jpg", import.meta.url).href}
              alt="Trinquat & Compagnie - Notre communauté" 
              className="w-full h-auto rounded-2xl shadow-2xl shadow-primary-deep/30 object-cover"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
