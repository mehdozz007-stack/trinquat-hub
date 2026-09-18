import { Reveal } from "./Reveal";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  initials: string;
};

const teamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "Prénom à ajouter",
    role: "Président(e)",
    bio: "Habitant(e) du quartier engagé(e) dans la vision collective de Trinquat & Compagnie.",
    initials: "T1",
  },
  {
    id: "member-2",
    name: "Prénom à ajouter",
    role: "Trésorier(e)",
    bio: "Responsable de la gestion financière et de la transparence de l'association.",
    initials: "T2",
  },
  {
    id: "member-3",
    name: "Prénom à ajouter",
    role: "Secrétaire",
    bio: "Coordonne la communication et l'organisation interne de l'association.",
    initials: "T3",
  },
  {
    id: "member-4",
    name: "Prénom à ajouter",
    role: "Membre actif",
    bio: "Contributeur clé aux événements et initiatives du quartier.",
    initials: "T4",
  },
];

export function TeamSection() {
  return (
    <section id="team" className="relative py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">
            Le bureau
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
            Les <span className="text-gradient">visages</span> de l'association
          </h2>
          <p className="mt-6 text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl">
            Des habitants passionnés qui animent Trinquat & Compagnie et mettent en œuvre chaque jour nos valeurs de solidarité et de convivialité.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, i) => (
            <Reveal key={member.id} delay={i * 0.08}>
              <div className="group h-full flex flex-col rounded-2xl border border-border/70 bg-card shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-elegant overflow-hidden">
                {/* Image / Avatar Container */}
                <div className="relative h-56 overflow-hidden bg-linear-to-br from-primary-soft to-accent">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-leaf text-primary-foreground shadow-soft">
                          <span className="text-2xl font-semibold">{member.initials}</span>
                        </div>
                        <Users className="absolute bottom-4 right-4 h-6 w-6 text-primary-deep opacity-30" />
                      </div>
                    </div>
                  )}

                  {/* Overlay Gradient on Hover */}
                  <div className="absolute inset-0 bg-linear-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Role Badge */}
                  <div className="absolute right-4 top-4">
                    <motion.span
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="inline-block rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-primary-deep shadow-soft backdrop-blur-sm"
                    >
                      {member.role}
                    </motion.span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="text-lg font-semibold leading-tight text-foreground">
                      {member.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {member.bio}
                    </p>
                  </div>

                  {/* Decorative Bottom */}
                  <div className="mt-6 flex items-center gap-2 pt-4 border-t border-border/40">
                    <div className="h-1 w-1 rounded-full bg-primary-deep" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Bureau
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Call to action */}
        <Reveal delay={0.4} className="mt-16">
          <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-8 md:p-12 text-center">
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              Vous aussi pouvez rejoindre le bureau et contribuer à la vie de l'association. 
              <br />
              <a href="mailto:contact@trinquatetcompagnie.fr" className="font-semibold text-primary-deep hover:text-primary transition-colors">
                Contactez-nous pour en savoir plus.
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
