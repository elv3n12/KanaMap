export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Politique de confidentialité</h1>
      <div className="mt-6 space-y-4 rounded-2xl bg-white p-6 leading-7 shadow">
        <p>
          Cannabinoid Observatory Europe collecte les données nécessaires au fonctionnement du
          service : email de compte, signalements, déclarations d’effets indésirables, preuves
          transmises et traces d’audit liées aux actions sensibles.
        </p>
        <p>
          Les adresses IP ne sont pas stockées en clair. Elles sont transformées en empreintes
          cryptographiques avec un sel privé afin de limiter les abus tout en réduisant les données
          personnelles conservées.
        </p>
        <p>
          Les cookies utilisés servent à maintenir la session, protéger les formulaires et afficher
          l’age gate. Ils sont nécessaires au service et ne servent pas à la publicité.
        </p>
        <p>
          Un utilisateur peut demander la suppression de son compte depuis son espace personnel. Ses
          contributions sont alors anonymisées afin de préserver l’intérêt public de la carte.
        </p>
      </div>
    </div>
  );
}
