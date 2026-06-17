import { Reveal } from "./Reveal";
import { Leaf, Users, HandHeart, Sparkles, TreePine, Heart } from "lucide-react";

const values = [
  { icon: Users, title: "Voisinage", text: "Faire connaissance, tisser des liens durables entre habitants de tous âges." },
  { icon: HandHeart, title: "Entraide", text: "Coup de main, prêt d'outils, garde d'enfants : une chaîne de solidarité." },
  { icon: Sparkles, title: "Convivialité", text: "Des moments simples et chaleureux qui font la richesse du quartier." },
  { icon: TreePine, title: "Nature", text: "Un jardin partagé, des plantations, et le respect du vivant qui nous entoure." },
  { icon: Heart, title: "Famille", text: "Des activités pensées pour les enfants, les parents et les aînés." },
  { icon: Leaf, title: "Écologie", text: "Composteur collectif, troc, et initiatives pour un quartier plus durable." },
];

export function About() {
  return (
    <section id="about" className="relative py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">
                Qui sommes-nous
              </span>
              <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
                Une <span className="text-gradient">grande famille</span><br />
                à l'ombre des arbres.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
                Trinquat & Compagnie est née de l'envie partagée de quelques voisins :
                redonner au quartier son âme. Depuis, nous organisons fêtes, ateliers,
                repas et chantiers participatifs — toujours avec simplicité et bonne humeur.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                L'association est ouverte à toutes et tous. Une cotisation symbolique,
                une envie de partager, et le quartier devient un peu plus le vôtre.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.05}>
                <div className="group relative h-full rounded-2xl border border-border/70 bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant hover:border-primary/40">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 min-w-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep transition-colors group-hover:bg-gradient-leaf group-hover:text-primary-foreground">
                      <v.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{v.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}