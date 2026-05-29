import Link from "next/link";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

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
        <p className="obs-label text-obs-signal">Moderation</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Adverse Effects</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {reportsWithEffects.length} report(s) mentioning adverse effects.
        </p>
      </div>

      <ObsPanel className="p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Effects reported via reports</h2>
        <div className="mt-4 divide-y divide-obs-border">
          {reportsWithEffects.length === 0 ? (
            <p className="py-4 text-sm text-zinc-500">No adverse effects reported.</p>
          ) : (
            reportsWithEffects.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-zinc-200">
                    {report.productCommercialName ?? "Observed product"}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {report.location.displayZone} · <span className="text-obs-signal">{REPORT_STATUS_LABELS[report.moderationStatus]}</span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Substances: {report.molecules.map((m) => m.molecule.name).join(", ") || "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-red-400">
                    Effects: {report.adverseEffects.map((ae) => ae.effect.label).join(", ")}
                  </p>
                </div>
                <Link href={`/admin/reports/${report.id}`}>
                  <ObsButton variant="outline">Review</ObsButton>
                </Link>
              </div>
            ))
          )}
        </div>
      </ObsPanel>

      {legacyDeclarations.length > 0 && (
        <ObsPanel className="p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Declarations (legacy form)</h2>
          <div className="mt-4 divide-y divide-obs-border">
            {legacyDeclarations.map((declaration) => (
              <div key={declaration.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-zinc-200">{declaration.productNameRaw ?? "Unspecified product"}</p>
                  <p className="text-sm text-zinc-400">
                    <span className="text-obs-signal">{REPORT_STATUS_LABELS[declaration.moderationStatus]}</span> ·{" "}
                    {declaration.effects.map((item) => item.effect.label).join(", ") || "Effects not specified"}
                  </p>
                </div>
                <Link href={`/admin/declarations/${declaration.id}`}>
                  <ObsButton variant="outline">Review</ObsButton>
                </Link>
              </div>
            ))}
          </div>
        </ObsPanel>
      )}
    </div>
  );
}
