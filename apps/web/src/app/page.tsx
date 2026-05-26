import Link from "next/link";
import { branding } from "@/lib/branding";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          Observatoire civique et sanitaire
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
          Un observatoire citoyen pour documenter la circulation des cannabinoïdes psychoactifs
          émergents en Europe.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
          Cette carte ne facilite pas l’achat. Elle rend visible un marché opaque, rapide et
          insuffisamment contrôlé, afin d’aider les citoyens, journalistes, chercheurs et
          institutions à mieux comprendre les risques.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-full bg-slate-900 px-5 py-3 text-white" href="/carte">
            Consulter la carte
          </Link>
          <Link className="rounded-full border px-5 py-3" href="/signalements/nouveau">
            Signaler un produit
          </Link>
          <Link className="rounded-full border px-5 py-3" href="/declarer-effet-indesirable">
            Déclarer un effet indésirable
          </Link>
          <Link className="rounded-full border px-5 py-3" href="/carte">
            Voir les tendances
          </Link>
          <Link className="rounded-full border px-5 py-3" href="/comprendre">
            Comprendre le projet
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Documenter", "Les signalements décrivent des zones, des produits observés, des molécules déclarées et des preuves associées."],
          ["Vérifier", "Chaque contribution passe par une modération et un niveau de preuve avant publication complète."],
          ["Alerter", "Les données agrégées aident à rendre visibles les risques, les allégations marketing et les évolutions du marché."],
        ].map(([title, text]) => (
          <article key={title} className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{text}</p>
          </article>
        ))}
      </section>

      <p className="mt-8 text-sm text-slate-500">
        {branding.appName} publie des signalements modérés et approximés. Aucune adresse exacte
        permettant de se rendre sur un point d’observation n’est exposée publiquement.
      </p>
    </div>
  );
}
