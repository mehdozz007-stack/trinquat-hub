import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Comment rejoindre Trinquat & Compagnie ?",
    answer: "Très simple ! Cliquez sur le bouton d'inscription et suivez les instructions sur HelloAsso. Une cotisation symbolique et le tour est joué.",
  },
  {
    question: "Quel est le coût de la cotisation ?",
    answer: "5€ pour l'année. C'est avant tout un symbole d'engagement envers l'association. Les plus généreux peuvent contribuer davantage bien sûr !",
  },
  {
    question: "Je travaille le samedi, comment faire ?",
    answer: "Pas de souci ! Vous pouvez nous contacter par email ou venir à l'un de nos événements. On s'adapte à vos horaires.",
  },
  {
    question: "Faut-il être disponible pour tous les événements ?",
    answer: "Non, vous venez comme vous pouvez ! Chacun participe à son rythme. C'est la flexibilité qui fait notre force.",
  },
  {
    question: "Est-ce que je peux proposer une activité ?",
    answer: "Bien sûr ! C'est même encouragé. Vous avez une idée d'atelier, de sortie ou d'événement ? Parlons-en, on construira le projet ensemble.",
  },
  {
    question: "Y a-t-il des activités pour les enfants ?",
    answer: "Oui, beaucoup ! Ateliers créatifs, jardinage, sorties en famille... On essaie de proposer quelque chose pour tous les âges, du petit au grand.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 md:py-20 bg-secondary/50">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <Reveal>
          <div className="text-center mb-12">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary-deep">FAQ</span>
            <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1]">
              Questions <span className="text-gradient">fréquentes</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Les réponses aux questions que vous vous posez sur Trinquat & Compagnie.
            </p>
          </div>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left group"
              >
                <div className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-elegant">
                  <ChevronDown
                    className="h-5 w-5 text-primary-deep mt-0.5 shrink-0 transition-transform duration-300"
                    style={{
                      transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                  </div>
                </div>

                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-10 py-5 text-muted-foreground leading-relaxed border-t border-border/70 -mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
