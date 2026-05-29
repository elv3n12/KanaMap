import { notFound } from "next/navigation";
import { DeclarationActions } from "@/components/moderation/declaration-actions";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { ObsPanel } from "@/components/ui/obs";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminDeclarationDetailPage({ params }: Props) {
  const { id } = await params;
  const declaration = await db.adverseEffectDeclaration.findUnique({
    where: { id },
    include: {
      molecules: { include: { molecule: true } },
      effects: { include: { effect: true } },
      moderationActions: { orderBy: { createdAt: "desc" }, include: { moderator: true } },
      createdBy: { select: { id: true, email: true } },
    },
  });
  if (!declaration) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <main className="space-y-6">
        <ObsPanel className="p-6">
          <p className="obs-label text-obs-signal">{REPORT_STATUS_LABELS[declaration.moderationStatus]}</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Adverse effect declaration</h1>
          {declaration.createdBy ? (
            <p className="mt-2 text-sm text-zinc-400">
              Author:{" "}
              <a className="text-obs-signal hover:underline" href={`/admin/users/${declaration.createdBy.id}`}>
                {declaration.createdBy.email}
              </a>
            </p>
          ) : null}
          <dl className="mt-6 grid gap-3 text-sm">
            <div>
              <dt className="obs-label text-zinc-500">Product</dt>
              <dd className="text-zinc-300">{declaration.productNameRaw ?? "Not specified"}</dd>
            </div>
            <div>
              <dt className="obs-label text-zinc-500">Molecules</dt>
              <dd className="text-zinc-300">{declaration.molecules.map((item) => item.molecule.name).join(", ") || "Not specified"}</dd>
            </div>
            <div>
              <dt className="obs-label text-zinc-500">Effects</dt>
              <dd className="text-red-400">{declaration.effects.map((item) => item.effect.label).join(", ") || "Not specified"}</dd>
            </div>
            <div>
              <dt className="obs-label text-zinc-500">Approximate period</dt>
              <dd className="text-zinc-300">{declaration.approximatePeriod ?? "—"}</dd>
            </div>
            <div>
              <dt className="obs-label text-zinc-500">Duration</dt>
              <dd className="text-zinc-300">{declaration.effectDuration ?? "—"}</dd>
            </div>
          </dl>
          {declaration.narrative ? (
            <p className="mt-6 whitespace-pre-line leading-7 text-zinc-300">{declaration.narrative}</p>
          ) : null}
        </ObsPanel>
        <ObsPanel className="p-6">
          <h2 className="text-lg font-semibold text-zinc-100">History</h2>
          <div className="mt-4 space-y-2 text-sm">
            {declaration.moderationActions.map((action) => (
              <p key={action.id} className="rounded-md bg-obs-elevated p-2 text-zinc-300">
                <span className="text-obs-signal">{action.action}</span> · {action.moderator?.email ?? "system"} ·{" "}
                <span className="text-zinc-500">{action.createdAt.toLocaleString("en-GB")}</span>
              </p>
            ))}
          </div>
        </ObsPanel>
      </main>
      <aside>
        <DeclarationActions declarationId={declaration.id} />
      </aside>
    </div>
  );
}
