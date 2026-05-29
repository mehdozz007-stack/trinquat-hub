import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { About } from "@/components/site/About";
import { Stats } from "@/components/site/Stats";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/association")({
  head: () => ({
    meta: [
      { title: "L'association — Trinquat & Compagnie" },
      { name: "description", content: "Découvrez Trinquat & Compagnie : nos valeurs, notre histoire et l'esprit de voisinage qui anime l'association." },
      { property: "og:title", content: "L'association — Trinquat & Compagnie" },
      { property: "og:description", content: "Notre histoire, nos valeurs et notre engagement pour un quartier vivant." },
    ],
    links: [{ rel: "canonical", href: "/association" }],
  }),
  component: AssociationPage,
});

function AssociationPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <PageHeader
        eyebrow="Qui sommes-nous"
        title={<>Une <span className="italic text-gradient">grande famille</span> de voisins.</>}
        lead="Trinquat & Compagnie rassemble les habitants du quartier autour de moments simples, d'entraide et de partage."
      />
      <About />
      <Stats />
      <Footer />
    </main>
  );
}