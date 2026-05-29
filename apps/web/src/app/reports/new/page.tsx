import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DeclarationWizard } from "@/components/declaration-wizard/declaration-wizard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [molecules, claims, adverseEffects, positiveEffects] = await Promise.all([
    db.molecule.findMany({ orderBy: { name: "asc" } }),
    db.marketingClaim.findMany({ orderBy: { label: "asc" } }),
    db.adverseEffect.findMany({ orderBy: { label: "asc" } }),
    db.positiveEffect.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-6 text-sm text-zinc-400">
        I want to report a point of sale of synthetic or semi-synthetic cannabinoids. Data that
        would facilitate direct access to the product is not publicly exposed.
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
