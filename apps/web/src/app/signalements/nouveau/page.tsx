import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ReportForm } from "@/components/report-form/report-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const [molecules, claims, effects] = await Promise.all([
    db.molecule.findMany({ orderBy: { name: "asc" } }),
    db.marketingClaim.findMany({ orderBy: { label: "asc" } }),
    db.adverseEffect.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Soumettre un signalement</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
        Ce formulaire sert à documenter une observation. Les données facilitant l’accès au produit
        sont masquées ou réservées à la modération. La publication n’est jamais automatique.
      </p>
      <div className="mt-6">
        <ReportForm molecules={molecules} claims={claims} effects={effects} />
      </div>
    </div>
  );
}
