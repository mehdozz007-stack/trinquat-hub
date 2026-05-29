import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Values } from "@/components/site/Values";
import { EventsPreview } from "@/components/site/EventsPreview";
import { ActualitesPreview } from "@/components/site/ActualitesPreview";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trinquat & Compagnie — Le quartier se vit ensemble" },
      { name: "description", content: "Association d'habitants du quartier Trinquat : événements, entraide, jardin partagé et moments conviviaux entre voisins." },
      { property: "og:title", content: "Trinquat & Compagnie" },
      { property: "og:description", content: "Le quartier se vit ensemble — événements, entraide et convivialité." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <Hero />
      <Values />
      <EventsPreview />
      <ActualitesPreview />
      <Footer />
    </main>
  );
}
