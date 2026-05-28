import Link from "next/link";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { btnSecondary } from "@/lib/ui/button-classes";

export const dynamic = "force-dynamic";

export default async function AdminDeclarationsPage() {
  const reportsWithEffects = await db.report.findMany({
    where: { adverseEffects: { some: {} } },
    include: {
      adverseEffects: { include: { effect: true } },
      location: true,
      molecules: { include: { molecule: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const legacyDeclarations = await db.adverseEffectDeclaration.findMany({
    where: { moderationStatus: { in: ["PENDING_REVIEW", "CONTESTED", "PUBLISHED", "PUBLISHED_LIMITED"] } },
    include: { effects: { include: { effect: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Effets indésirables</h1>
        <p className="mt-2 text-slate-700">
          {reportsWithEffects.length} signalement(s) mentionnant des effets indésirables.
        </p>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Effets rapportés via signalements</h2>
        <div className="mt-4 divide-y divide-slate-200">
          {reportsWithEffects.length === 0 ? (
            <p className="py-4 text-sm text-slate-700">Aucun effet indésirable signalé.</p>
          ) : (
            reportsWithEffects.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-slate-900">
                    {report.productCommercialName ?? "Produit observé"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {report.location.displayZone} · {REPORT_STATUS_LABELS[report.moderationStatus]}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Substances : {report.molecules.map((m) => m.molecule.name).join(", ") || "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-red-600">
                    Effets : {report.adverseEffects.map((ae) => ae.effect.label).join(", ")}
                  </p>
                </div>
                <Link className={btnSecondary} href={`/admin/signalements/${report.id}`}>
                  Examiner
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {legacyDeclarations.length > 0 && (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Déclarations (ancien formulaire)</h2>
          <div className="mt-4 divide-y divide-slate-200">
            {legacyDeclarations.map((declaration) => (
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
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
