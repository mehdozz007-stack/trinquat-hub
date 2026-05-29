import { Reveal } from "./Reveal";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import g3 from "@/assets/gallery-3.jpg";
import g2 from "@/assets/gallery-2.jpg";

const news = [
  { img: g3, tag: "Vie de quartier", date: "12 Mars 2026", title: "La fête des voisins prépare sa 12e édition",
    excerpt: "Une journée entière pour célébrer ensemble : programme, bénévoles, et nouveautés." },
  { img: g2, tag: "Jardin", date: "28 Février 2026", title: "Un nouveau carré potager pour les enfants",
    excerpt: "Les écoliers ont planté tomates, fraises et aromatiques. La récolte arrive bientôt." },
];

export function ActualitesPreview() {
  return (
    <section id="news-preview" className="py-12 md:py-20 bg-secondary/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">Actualités</span>
            <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
              Les <span className="italic text-gradient">dernières nouvelles</span>.
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
        <div className="grid gap-6 md:grid-cols-2">
          {news.map((n, i) => (
            <Reveal key={n.title} delay={i * 0.08}>
              <article className="group h-full flex flex-col overflow-hidden rounded-3xl bg-card border border-border/70 transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant">
                <div className="aspect-16/10 overflow-hidden">
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
                  <a href="#" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep">
                    Lire l'article <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
