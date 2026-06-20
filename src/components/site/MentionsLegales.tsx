export function MentionsLegales() {
  return (
    <div className="prose prose-sm max-w-4xl mx-auto px-6 py-12 md:py-20">
      <h1 className="text-4xl font-bold mb-8">Mentions <span className="text-gradient">légales</span></h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Responsable du site</h2>
        <p>
          <strong>Trinquat & Compagnie</strong>
          <br />
          Association d'habitants loi 1901
          <br />
          410 Avenue du Pont Trinquat
          <br />
          34070 Montpellier
          <br />
          France
          <br />
          <br />
          <strong>Contact :</strong> contact@trinquatetcompagnie.fr
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Hébergement</h2>
        <p>
          Ce site est hébergé par :
          <br />
          <strong>Cloudflare, Inc.</strong>
          <br />
          101 Townsend St
          <br />
          San Francisco, CA 94107
          <br />
          États-Unis
          <br />
          <br />
          <a href="https://www.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            www.cloudflare.com
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Propriété intellectuelle</h2>
        <p>
          L'ensemble du contenu présent sur ce site (textes, images, logos, graphismes) est la propriété exclusive de Trinquat & Compagnie ou de ses contributeurs.
          Toute reproduction, représentation, modification ou exploitation non autorisée du contenu est interdite.
        </p>
        <p className="mt-4">
          Les contributeurs et photographes qui partagent leurs créations acceptent leur utilisation par Trinquat & Compagnie à titre gracieux.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Limitations de responsabilité</h2>
        <p>
          Trinquat & Compagnie s'efforce de maintenir ce site de manière fiable. Cependant, l'association n'est pas responsable :
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li>Des erreurs ou omissions dans le contenu</li>
          <li>Des interruptions ou dysfonctionnements techniques du site</li>
          <li>De l'indisponibilité temporaire du service</li>
          <li>Des dommages directs ou indirects résultant de l'accès au site</li>
          <li>Du contenu externes auquel renvoie ce site</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Liens externes</h2>
        <p>
          Ce site peut contenir des liens vers d'autres sites internet. Trinquat & Compagnie ne peut pas être tenue responsable du contenu
          de ces sites externes. La mention d'un site ne constitue pas un partenariat ou une approbation de ses contenus.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Conditions d'utilisation</h2>
        <p>
          L'accès et l'utilisation de ce site sont soumis aux conditions suivantes :
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li>Utilisation uniquement à titre personnel et non commercial</li>
          <li>Respect de la légalité et de l'ordre public</li>
          <li>Interdiction de copier ou reproduire le contenu à des fins commerciales</li>
          <li>Interdiction d'utiliser des techniques de scraping ou d'accès automatisé</li>
          <li>Respect de la vie privée d'autrui</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Gestion bénévole</h2>
        <p>
          Ce site est géré par des habitants du quartier à titre bénévole. Les demandes relatives à ce site doivent être adressées à
          <strong> contact@trinquatetcompagnie.fr</strong>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Données personnelles</h2>
        <p>
          Pour toute information concernant le traitement de vos données personnelles, veuillez consulter notre{' '}
          <a href="/politique-confidentialite" className="text-primary hover:underline">
            Politique de confidentialité
          </a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Droit applicable et juridiction</h2>
        <p>
          Les présentes mentions légales sont régies par le droit français. Tout litige sera soumis à la juridiction compétente du ressort de Montpellier.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Modifications</h2>
        <p>
          Trinquat & Compagnie se réserve le droit de modifier les présentes mentions légales à tout moment. Les modifications
          prennent effet dès leur publication sur le site.
        </p>
      </section>

      <section className="mt-12 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </section>
    </div>
  );
}
