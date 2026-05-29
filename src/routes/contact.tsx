import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Contact } from "@/components/site/Contact";
import { FAQ } from "@/components/site/FAQ";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Trinquai & Compagnie" },
      { name: "description", content: "Une question, une idée, l'envie de rejoindre l'association ? Écrivez à Trinquai & Compagnie." },
      { property: "og:title", content: "Contact — Trinquai & Compagnie" },
      { property: "og:description", content: "Écrivez-nous pour rejoindre l'association ou poser une question." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <PageHeader
        eyebrow="Contact"
        title={<>Envie de nous <span className="italic text-gradient">rejoindre</span> ?</>}
        lead="Une question, une idée, l'envie d'aider sur un événement ? On répond toujours."
      />
      <Contact />
      <FAQ />
      <Footer />
    </main>
  );
}