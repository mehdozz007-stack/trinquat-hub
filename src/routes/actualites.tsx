import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { News } from "@/components/site/News";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/actualites")({
  head: () => ({
    meta: [
      { title: "Actualités — Trinquai & Compagnie" },
      { name: "description", content: "Les dernières nouvelles de l'association Trinquai & Compagnie et de la vie du quartier." },
      { property: "og:title", content: "Actualités — Trinquai & Compagnie" },
      { property: "og:description", content: "Les dernières nouvelles du quartier." },
    ],
    links: [{ rel: "canonical", href: "/actualites" }],
  }),
  component: ActualitesPage,
});

function ActualitesPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <PageHeader
        eyebrow="Actualités"
        title={<>Les <span className="italic text-gradient">dernières nouvelles</span>.</>}
        lead="Restez au courant des projets, événements et bonnes nouvelles du quartier."
      />
      <News />
      <Footer />
    </main>
  );
}