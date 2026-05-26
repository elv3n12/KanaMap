export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Mission de Cannabinoid Observatory Europe</h1>
      <div className="mt-6 space-y-4 rounded-2xl bg-white p-6 leading-7 shadow">
        <p>
          Cannabinoid Observatory Europe est un projet d’information et de réduction des risques
          porté par une ONG. Son objectif est d’alerter les populations européennes et les
          responsables publics sur la présence de cannabinoïdes synthétiques et semi-synthétiques.
        </p>
        <p>
          La carte permet de signaler la présence d’un produit ou d’un lieu afin de rendre les
          informations plus visibles. Elle ne constitue pas une invitation à acheter, vendre ou
          consommer des substances.
        </p>
        <p>
          Les contributeurs restent anonymes sur le site public. Leur identifiant est conservé en
          base pour limiter les abus et permettre la modération.
        </p>
      </div>
    </div>
  );
}
