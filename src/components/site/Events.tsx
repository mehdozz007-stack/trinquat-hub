import { Reveal } from "./Reveal";
import { Calendar, MapPin, ArrowUpRight } from "lucide-react";
import imgFete from "@/assets/event-fete.jpg";
import imgRepas from "@/assets/event-repas.jpg";
import imgJardin from "@/assets/event-jardin.jpg";

const events = [
  {
    img: imgFete, badge: "À venir",
    date: "14 Juin 2026", title: "Fête du quartier", place: "Place Trinquai",
    desc: "Une soirée magique sous les guirlandes : concert, jeux pour enfants et grande tablée.",
  },
  {
    img: imgRepas, badge: "Mensuel",
    date: "Chaque 1er dimanche", title: "Repas partagé", place: "Maison de quartier",
    desc: "Chacun apporte un plat à partager. Un rituel devenu incontournable.",
  },
  {
    img: imgJardin, badge: "Hebdomadaire",
    date: "Samedis matin", title: "Jardinage collectif", place: "Jardin partagé",
    desc: "Plantation, désherbage, récolte. Une bouffée d'air et de nouvelles recettes.",
  },
];

const more = [
  { date: "5 Mai", label: "Vide-grenier de printemps" },
  { date: "12 Mai", label: "Atelier compost & jardinage" },
  { date: "26 Mai", label: "Cinéma en plein air" },
  { date: "2 Juin", label: "Atelier créatif enfants" },
];

export function Events() {
  return (
    <section id="events" className="relative bg-secondary/40 py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">Agenda</span>
            <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
              Les rendez-vous<br/> du <span className="italic text-gradient">quartier</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-muted-foreground">
              Toute l'année, des moments à vivre ensemble — petits déjeuners, ateliers,
              jardinage, fêtes. Choisissez le vôtre.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {events.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.08}>
              <article className="group relative h-full overflow-hidden rounded-3xl bg-card border border-border/70 transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={e.img} alt={e.title} loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
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
                  <a href="#contact" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-deep group/link">
                    Je participe
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-12 rounded-3xl border border-border/70 bg-card p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-xl font-semibold">Et aussi ce printemps...</h3>
                <p className="text-sm text-muted-foreground mt-1">Le calendrier complet de l'association.</p>
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
    </section>
  );
}