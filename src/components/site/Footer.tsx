import logo from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border/70 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <img src={logo} alt="Trinquai & Compagnie" className="h-16 w-auto" />
            <p className="mt-6 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Association d'habitants du quartier Trinquai. Nous croyons qu'un quartier
              vivant naît de petits gestes partagés.
            </p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Mail].map((Icon, i) => (
                <a key={i} href="#" aria-label="Réseau social"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:-translate-y-0.5 hover:bg-foreground hover:text-background">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Naviguer</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[["/association","L'association"],["/evenements","Événements"],["/galerie","Galerie"],["/actualites","Actualités"],["/contact","Contact"]].map(([h,l]) => (
                <li key={h}><Link to={h} className="text-muted-foreground hover:text-foreground transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Nous trouver</h3>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              Maison de quartier — Place Trinquai<br/>
              Permanence le samedi 10h-12h<br/>
              <a href="mailto:bonjour@trinquai.fr" className="text-foreground underline-offset-4 hover:underline">bonjour@trinquai.fr</a>
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-border/70 pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Trinquai & Compagnie — Tous droits réservés.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Mentions légales</a>
            <a href="#" className="hover:text-foreground">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}