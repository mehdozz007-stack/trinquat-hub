import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Events } from "@/components/site/Events";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/evenements")({
  head: () => ({
    meta: [
      { title: "Événements — Trinquat & Compagnie" },
      { name: "description", content: "Fête du quartier, repas partagés, jardinage collectif, ateliers enfants : tous les événements de l'association." },
      { property: "og:title", content: "Événements — Trinquat & Compagnie" },
      { property: "og:description", content: "L'agenda du quartier : fêtes, ateliers, repas et jardinage." },
    ],
    links: [{ rel: "canonical", href: "/evenements" }],
  }),
  component: EvenementsPage,
});

function EvenementsPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <PageHeader
        eyebrow="Agenda"
        title={<>Les rendez-vous <span className="text-gradient">du quartier</span>.</>}
        lead="Toute l'année, des moments à vivre ensemble : fêtes, ateliers, jardinage et repas partagés."
      />
      <Events />
      <Footer />
    </main>
  );
}