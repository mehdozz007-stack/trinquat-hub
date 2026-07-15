import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PolitiqueConfidentialite } from "@/components/site/PolitiqueConfidentialite";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/politique-confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Trinquat & Compagnie" },
      { name: "description", content: "Politique de confidentialité et protection des données de Trinquat & Compagnie." },
      { property: "og:title", content: "Politique de confidentialité — Trinquat & Compagnie" },
      { property: "og:description", content: "Découvrez comment nous protégeons vos données personnelles." },
    ],
    links: [{ rel: "canonical", href: "/politique-confidentialite" }],
  }),
  component: PolitiqueConfidentialitePage,
});

function PolitiqueConfidentialitePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader eyebrow="Données" title={<span>Politique de <span className="text-gradient">confidentialité</span></span>} lead="Comment nous protégeons vos données personnelles" />
      <main className="flex-1">
        <PolitiqueConfidentialite />
      </main>
      <Footer />
    </div>
  );
}
