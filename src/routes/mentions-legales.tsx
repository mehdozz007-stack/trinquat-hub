import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { MentionsLegales } from "@/components/site/MentionsLegales";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Trinquat & Compagnie" },
      { name: "description", content: "Mentions légales du site de Trinquat & Compagnie, association d'habitants à Montpellier." },
      { property: "og:title", content: "Mentions légales — Trinquat & Compagnie" },
      { property: "og:description", content: "Mentions légales et informations légales de notre site." },
    ],
    links: [{ rel: "canonical", href: "/mentions-legales" }],
  }),
  component: MentionsLegalesPage,
});

function MentionsLegalesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader eyebrow="Légal" title={<span>Mentions <span className="text-gradient">légales</span></span>} lead="Informations légales et responsables du site" />
      <main className="flex-1">
        <MentionsLegales />
      </main>
      <Footer />
    </div>
  );
}
