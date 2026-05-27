import Link from "next/link";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { btnSecondary } from "@/lib/ui/button-classes";

export const dynamic = "force-dynamic";

export default async function AdminDeclarationsPage() {
  const declarations = await db.adverseEffectDeclaration.findMany({
    where: { moderationStatus: { in: ["PENDING_REVIEW", "CONTESTED", "PUBLISHED", "PUBLISHED_LIMITED"] } },
    include: { effects: { include: { effect: true } } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Déclarations d&apos;effets indésirables</h1>
        <p className="mt-2 text-slate-700">{declarations.length} déclaration(s) à traiter ou suivre.</p>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="divide-y divide-slate-200">
          {declarations.length === 0 ? (
            <p className="py-4 text-sm text-slate-700">Aucune déclaration pour le moment.</p>
          ) : (
            declarations.map((declaration) => (
              <div key={declaration.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-slate-900">{declaration.productNameRaw ?? "Produit non précisé"}</p>
                  <p className="text-sm text-slate-700">
                    {REPORT_STATUS_LABELS[declaration.moderationStatus]} ·{" "}
                    {declaration.effects.map((item) => item.effect.label).join(", ") || "Effets non précisés"}
                  </p>
                </div>
                <Link className={btnSecondary} href={`/admin/declarations/${declaration.id}`}>
                  Examiner
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
