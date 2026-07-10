import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { EventsAndNews } from "@/components/site/EventsAndNews";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/evenements")({
  head: () => ({
    meta: [
      { title: "Événements & Actualités — Trinquat & Compagnie" },
      { name: "description", content: "Tous les événements, actualités et rendez-vous de l'association Trinquat & Compagnie : fêtes du quartier, ateliers, jardinage collectif, repas partagés et initiatives locales." },
      { property: "og:title", content: "Événements & Actualités — Trinquat & Compagnie" },
      { property: "og:description", content: "L'agenda complet du quartier : fêtes, ateliers, initiatives et actualités." },
    ],
    links: [{ rel: "canonical", href: "/evenements" }],
  }),
  component: EvenementsPage,
});

function EvenementsPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader
        eyebrow="Agenda & Actualités"
        title={<>Les rendez-vous <span className="text-gradient">du quartier</span></>}
        lead="Découvrez tous les événements, actualités et initiatives de Trinquat & Compagnie. Des moments à vivre ensemble, à partager et à célébrer."
      />
      <EventsAndNews />
      <Footer />
    </main>
  );
}