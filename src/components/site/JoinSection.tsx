import { Reveal } from "./Reveal";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { HeartHandshake, CalendarDays, TreePine, ArrowRight, Flower, Leaf, Heart, Sparkles, Clover } from "lucide-react";

const perks = [
  {
    icon: HeartHandshake,
    title: "Cotisation symbolique",
    text: "5€ par an seulement, un petit geste pour un grand impact dans le quartier.",
  },
  {
    icon: CalendarDays,
    title: "Événements prioritaires",
    text: "Accès réservé aux repas de quartier, ateliers et animations pour toute la famille.",
  },
  {
    icon: TreePine,
    title: "Jardin partagé",
    text: "Participez à l'entretien du jardin collectif et profitez de ses récoltes.",
  },
];

const floatingIcons = [
  { Icon: Flower, top: "10%", left: "15%", delay: 0, duration: 6 },
  { Icon: Leaf, top: "75%", left: "25%", delay: 0.5, duration: 8 },
  { Icon: Heart, top: "35%", right: "12%", delay: 1, duration: 7 },
  { Icon: Sparkles, top: "60%", right: "8%", delay: 1.5, duration: 6.5 },
  { Icon: Clover, top: "25%", left: "50%", delay: 0.8, duration: 7.5 },
];

export function JoinSection() {
  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-60" />
      <div className="absolute inset-0 -z-10 grain" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="rounded-[2rem] border border-border/60 bg-card/80 backdrop-blur-sm shadow-elegant overflow-hidden">
          <div className="grid lg:grid-cols-5">
            <div className="lg:col-span-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-leaf opacity-90" />
              <div className="absolute inset-0 grain" />

              {/* Floating Icons */}
              {floatingIcons.map((item, i) => (
                <motion.div
                  key={i}
                  className="absolute opacity-30 hover:opacity-50 transition-opacity"
                  style={{
                    top: item.top,
                    ...(item.left ? { left: item.left } : { right: item.right }),
                  }}
                  animate={{ y: [0, -20, 0] }}
                  transition={{
                    duration: item.duration,
                    delay: item.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <item.Icon className="h-8 w-8 text-primary-foreground" strokeWidth={1.5} />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex flex-col justify-center h-full px-8 py-12 md:px-12 md:py-16 text-primary-foreground"
              >
                <span className="text-xs font-medium uppercase tracking-[0.25em] opacity-80">
                  Rejoignez-nous
                </span>
                <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1]">
                  Adhérez à{" "}
                  <span className="italic font-(var(--font-display))">l'association</span>
                </h2>
                <p className="mt-6 text-base leading-relaxed opacity-90 max-w-xs">
                  Rejoignez les 45+ habitants qui font vivre le quartier. Chaque voisin apporte sa pierre à l'édifice.
                </p>

                <a href="https://www.helloasso.com/associations/trinquat-et-compagnie/adhesions/adhesion-trinquat-et-compagnie-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex w-fit self-center items-center gap-2 rounded-full bg-primary-foreground/15 border border-primary-foreground/25 px-6 py-3.5 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-primary-foreground/25 hover:-translate-y-0.5"
                >
                  Devenir membre
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </motion.div>
            </div>

            <div className="lg:col-span-3 px-8 py-12 md:px-12 md:py-16 flex flex-col justify-center">
              <Reveal>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-deep mb-10">
                  Les avantages de l'adhésion
                </p>
              </Reveal>
              <div className="space-y-8">
                {perks.map((perk, i) => (
                  <Reveal key={perk.title} delay={i * 0.08}>
                    <div className="flex items-start gap-5 group">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-deep transition-all duration-500 group-hover:bg-gradient-leaf group-hover:text-primary-foreground group-hover:shadow-soft">
                        <perk.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {perk.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {perk.text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
