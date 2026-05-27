import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DeclarationWizard } from "@/components/declaration-wizard/declaration-wizard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const [molecules, claims, adverseEffects, positiveEffects] = await Promise.all([
    db.molecule.findMany({ orderBy: { name: "asc" } }),
    db.marketingClaim.findMany({ orderBy: { label: "asc" } }),
    db.adverseEffect.findMany({ orderBy: { label: "asc" } }),
    db.positiveEffect.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-6 text-sm text-slate-700">
        Je souhaite signaler un point de vente de cannabinoïdes de synthèse ou semi-synthèse. Les données
        facilitant l&apos;accès direct au produit ne sont pas exposées publiquement.
      </p>
      <DeclarationWizard
        molecules={molecules}
        claims={claims}
        adverseEffects={adverseEffects}
        positiveEffects={positiveEffects}
      />
    </div>
  );
}
