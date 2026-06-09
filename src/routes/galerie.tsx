import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/galerie")({
  head: () => ({
    meta: [
      { title: "Galerie — Trinquat & Compagnie" },
      { name: "description", content: "Souvenirs et photos des événements de l'association Trinquat & Compagnie au fil des saisons." },
      { property: "og:title", content: "Galerie — Trinquat & Compagnie" },
      { property: "og:description", content: "Souvenirs partagés du quartier, en images." },
    ],
    links: [{ rel: "canonical", href: "/galerie" }],
  }),
  component: GaleriePage,
});

function GaleriePage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <PageHeader
        eyebrow="Galerie"
        title={<><span className="text-gradient">Souvenirs</span> partagés.</>}
        lead="Quelques instants capturés au fil des saisons, par les habitants eux-mêmes."
      />
      <Gallery />
      <Footer />
    </main>
  );
}