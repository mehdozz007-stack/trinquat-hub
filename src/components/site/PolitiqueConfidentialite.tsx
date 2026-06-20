export function PolitiqueConfidentialite() {
  return (
    <div className="prose prose-sm max-w-4xl mx-auto px-6 py-12 md:py-20">
      <h1 className="text-4xl font-bold mb-8">Politique de <span className="text-gradient">confidentialité</span></h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Préambule</h2>
        <p>
          Trinquat & Compagnie accorde une grande importance à la protection de vos données personnelles.
          Cette politique de confidentialité vous explique comment nous collectons, utilisons et protégeons vos informations
          conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi française « Informatique et Libertés ».
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Responsable du traitement</h2>
        <p>
          <strong>Responsable de traitement :</strong> Trinquat & Compagnie
          <br />
          410 Avenue du Pont Trinquat, 34070 Montpellier
          <br />
          contact@trinquatetcompagnie.fr
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Données collectées</h2>
        <p>Nous collectons les données personnelles suivantes :</p>
        
        <h3 className="text-lg font-semibold mt-4 mb-2">3.1 Newsletter</h3>
        <p>
          Lors de votre inscription à la newsletter, nous collectons :
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Votre adresse e-mail</li>
          <li>La date d'inscription</li>
          <li>Votre consentement explicite</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2">3.2 Formulaire de contact</h3>
        <p>
          Lorsque vous nous contactez via le formulaire, nous collectons :
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Votre nom</li>
          <li>Votre adresse e-mail</li>
          <li>Votre message</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2">3.3 Données de navigation</h3>
        <p>
          Comme la plupart des sites, nous collectons automatiquement :
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Votre adresse IP</li>
          <li>Le type de navigateur et de système d'exploitation</li>
          <li>Les pages visitées</li>
          <li>La durée de visite</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Base juridique du traitement</h2>
        <p>
          Nous traitons vos données sur les bases juridiques suivantes :
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li><strong>Consentement :</strong> Pour l'inscription à la newsletter et les formulaires de contact</li>
          <li><strong>Intérêt légitime :</strong> Pour les données de navigation et l'amélioration du site</li>
          <li><strong>Obligation légale :</strong> Pour la conformité aux exigences légales</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Utilisation de vos données</h2>
        <p>
          Vos données sont utilisées pour :
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li>Vous envoyer les messages d'information que vous avez demandés</li>
          <li>Répondre à vos questions et demandes de contact</li>
          <li>Améliorer et optimiser notre site</li>
          <li>Respecter nos obligations légales</li>
          <li>Prévenir les abus et assurer la sécurité du site</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Conservation des données</h2>
        <p>
          Nous conservons vos données personnelles pendant la durée suivante :
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li><strong>Adresse e-mail newsletter :</strong> Jusqu'à votre désinscription</li>
          <li><strong>Données de contact :</strong> 3 années après la dernière correspondance</li>
          <li><strong>Données de navigation :</strong> Moins de 13 mois</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Partage de vos données</h2>
        <p>
          Vos données personnelles ne sont pas vendues, louées ou échangées avec des tiers à des fins commerciales.
          Elles peuvent être partagées avec :
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li><strong>Cloudflare :</strong> Hébergeur du site (voir leurs conditions : www.cloudflare.com/privacy)</li>
          <li><strong>FormSubmit.co :</strong> Gestionnaire du formulaire de contact</li>
          <li>Les services de sécurité si obligation légale</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
        <p>
          Ce site n'utilise pas de cookies pour le suivi ou la publicité. Seuls des cookies techniques essentiels
          au fonctionnement du site peuvent être utilisés, sans nécessiter votre consentement préalable.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Sécurité</h2>
        <p>
          Nous mettons en place des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé,
          la modification ou la destruction. Cependant, aucun système n'est à 100 % sécurisé.
        </p>
        <p className="mt-4">
          Les données sont transmises en HTTPS et hébergées chez Cloudflare, qui applique les standards de sécurité internationaux.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez des droits suivants :
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li><strong>Droit d'accès :</strong> Accéder à vos données personnelles</li>
          <li><strong>Droit de rectification :</strong> Corriger les données inexactes</li>
          <li><strong>Droit d'effacement :</strong> Supprimer vos données (« droit à l'oubli »)</li>
          <li><strong>Droit à la limitation du traitement :</strong> Limiter l'utilisation de vos données</li>
          <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
          <li><strong>Droit d'opposition :</strong> Vous opposer à certains traitements</li>
          <li><strong>Droit de retirer son consentement :</strong> À tout moment, sans justification</li>
        </ul>
        <p className="mt-4">
          Pour exercer ces droits, contactez-nous à : <strong>contact@trinquatetcompagnie.fr</strong>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Désinscription newsletter</h2>
        <p>
          Vous pouvez vous désinscrire de la newsletter à tout moment en cliquant sur le lien de désinscription
          présent dans chaque e-mail reçu. Votre demande sera traitée dans les 48 heures.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. Données des enfants</h2>
        <p>
          Ce site ne s'adresse pas intentionnellement aux enfants de moins de 16 ans. Nous ne collectons pas sciemment
          des données auprès d'enfants. Si nous découvrons que nous avons collecté des données d'un enfant,
          nous les supprimerons immédiatement.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">13. Contact et réclamation</h2>
        <p>
          Pour toute question concernant cette politique ou pour exercer vos droits :
        </p>
        <p className="mt-4">
          <strong>E-mail :</strong> contact@trinquatetcompagnie.fr
          <br />
          <strong>Adresse :</strong> 410 Avenue du Pont Trinquat, 34070 Montpellier
        </p>
        <p className="mt-4">
          Vous avez également le droit de déposer une plainte auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
          <br />
          <strong>www.cnil.fr</strong>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">14. Modifications de cette politique</h2>
        <p>
          Trinquat & Compagnie se réserve le droit de modifier cette politique de confidentialité à tout moment.
          Les modifications prennent effet dès leur publication. Nous vous encourageons à consulter régulièrement cette page.
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
