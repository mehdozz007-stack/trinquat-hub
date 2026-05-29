import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Events } from "@/components/site/Events";
import { Stats } from "@/components/site/Stats";
import { News } from "@/components/site/News";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trinquai & Compagnie — Le quartier se vit ensemble" },
      { name: "description", content: "Association d'habitants du quartier Trinquai : événements, entraide, jardin partagé et moments conviviaux entre voisins." },
      { property: "og:title", content: "Trinquai & Compagnie" },
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
      <About />
      <Events />
      <Stats />
      <News />
      <Footer />
    </main>
  );
}
