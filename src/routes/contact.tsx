import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Contact } from "@/components/site/Contact";
import { FAQ } from "@/components/site/FAQ";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Trinquat & Compagnie" },
      { name: "description", content: "Une question, une idée, l'envie de rejoindre l'association ? Écrivez à Trinquat & Compagnie." },
      { property: "og:title", content: "Contact — Trinquat & Compagnie" },
      { property: "og:description", content: "Écrivez-nous pour rejoindre l'association ou poser une question." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <PageHeader
        eyebrow="Contact"
        title={<>Envie de nous <span className="text-gradient">rejoindre</span> ?</>}
        lead="Une question, une idée, l'envie d'aider sur un événement ? On répond toujours."
      />
      <Contact />
      <FAQ />
      <Footer />
    </main>
  );
}