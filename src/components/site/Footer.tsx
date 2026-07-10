import logo from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin } from "lucide-react";
import logoBorisVian from "@/assets/partners/logo-boris-vian.jpg";
import logoptitsTrinquat from "@/assets/partners/logoAsso.png";
import logoMairie from "@/assets/partners/logo-mairie-montpellier.png";

const socialLinks = [
  { Icon: Facebook, href: "https://www.facebook.com/Trinquatetcompagnie/", label: "Facebook" },
  { Icon: Instagram, href: "https://www.instagram.com/p/DQE1LeOgvRs/", label: "Instagram" },
  { Icon: Mail, href: "mailto:contact@trinquatetcompagnie.fr", label: "Email" },
];

const officialPartners = [
  {
    id: 1,
    name: "Boris Vian",
    logo: logoBorisVian,
    alt: "Logo École Boris Vian",
    website: "https://www.montpellier.fr/territoire/lieux-equipements/maison-pour-tous-boris-vian#/search@43.5960982,3.8918619,15.00",
  },
  {
    id: 2,
    name: "Les P'tits Trinquat",
    logo: logoptitsTrinquat,
    alt: "Logo Les P'tits Trinquat",
    website: "https://www.lespetitstrinquat.fr/",
  },
  {
    id: 3,
    name: "Mairie de Montpellier",
    logo: logoMairie,
    alt: "Logo Mairie de Montpellier",
    website: "https://www.montpellier.fr/",
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/70 bg-secondary">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <img src={logo} alt="Trinquat & Compagnie" className="h-16 w-auto rounded-md" />
            <p className="mt-6 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Association d'habitants. Nous croyons qu'un quartier
              vivant naît de petits gestes partagés.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:-translate-y-0.5 hover:bg-foreground hover:text-background">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Naviguer</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[["/association","L'association"],["/evenements","Événements"],["/galerie","Galerie"],["/contact","Contact"]].map(([h,l]) => (
                <li key={h}><Link to={h} className="text-muted-foreground hover:text-foreground transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Nous trouver</h3>
            <ul className="mt-10 space-y-5">
              <li className="flex items-start gap-4">
                <span className="shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Par email</p>
                  <a href="mailto:contact@trinquatetcompagnie.fr" className="text-muted-foreground hover:text-foreground">contact@trinquatetcompagnie.fr</a>
                </div>
              </li>
              {/*<li className="flex items-start gap-4">
                <span className="shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                  <MapPin className="h-5 w-5 -mt-0.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Par adresse</p>
                  <p className="text-muted-foreground hover:text-foreground">Maison pour tous Boris Vian, 34070 Montpellier</p>
                </div>
              </li>*/}
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-center gap-8  border-t border-border pt-8">
          {/* Official Partners Section */}
          <div className="flex flex-col items-center justify-center gap-4 w-full ">
            <h4 className="mb-4 text-base uppercase tracking-wider text-black/80 font-semibold">
              Nos partenaires officiels
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              {officialPartners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center transition-all hover:scale-105"
                  aria-label={`Visiter ${partner.name}`}
                >
                  <img
                    src={partner.logo}
                    alt={partner.alt}
                    className="h-24 w-auto object-contain md:h-32 rounded-lg"
                  />
                </a>
              ))}
            </div>
          </div>

        
        <div className="mt-12 flex flex-col items-center md:flex-row md:items-center md:justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <p className="text-center">© {new Date().getFullYear()} Trinquat & Compagnie — Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link to="/mentions-legales" className="hover:text-foreground">Mentions légales</Link>
              <Link to="/politique-confidentialite" className="hover:text-foreground">Politique de confidentialité</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}