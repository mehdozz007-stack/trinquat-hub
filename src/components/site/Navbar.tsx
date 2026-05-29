import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import logo from "@/assets/logo.png";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#about", label: "L'association" },
  { href: "#events", label: "Événements" },
  { href: "#gallery", label: "Galerie" },
  { href: "#news", label: "Actualités" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-background/75 border-b border-border/60"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
        <a href="#home" className="flex items-center gap-3 group">
          <img src={logo} alt="Trinquai & Compagnie" className="h-10 w-auto md:h-12 transition-transform group-hover:scale-[1.02]" />
          <span className="sr-only">Trinquai & Compagnie</span>
        </a>
        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="relative px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {l.label}
                <span className="absolute inset-x-4 -bottom-0.5 h-px scale-x-0 origin-left bg-primary transition-transform duration-300 hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="hidden md:inline-flex items-center rounded-full bg-gradient-leaf px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
        >
          Rejoindre
        </a>
        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden rounded-full p-2 text-foreground hover:bg-accent"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl"
        >
          <ul className="flex flex-col px-6 py-6 gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  onClick={() => setOpen(false)}
                  href={l.href}
                  className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-accent"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-gradient-leaf px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Rejoindre l'association
            </a>
          </ul>
        </motion.div>
      )}
    </motion.header>
  );
}