import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdverseEffectForm } from "@/components/adverse-effect-form/adverse-effect-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DeclareAdverseEffectPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const [molecules, effects] = await Promise.all([
    db.molecule.findMany({ orderBy: { name: "asc" } }),
    db.adverseEffect.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Déclarer un effet indésirable</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
        Cette entrée spécifique permet de documenter les risques rapportés sans publier de donnée
        nominative. Les informations sont modérées avant toute exploitation.
      </p>
      <div className="mt-6">
        <AdverseEffectForm molecules={molecules} effects={effects} />
      </div>
    </div>
  );
}
