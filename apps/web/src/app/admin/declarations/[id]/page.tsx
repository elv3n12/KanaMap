import { notFound } from "next/navigation";
import { DeclarationActions } from "@/components/moderation/declaration-actions";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";

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
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">Déclaration d&apos;effet indésirable</h1>
          <p className="mt-2 text-sm text-slate-600">{REPORT_STATUS_LABELS[declaration.moderationStatus]}</p>
          {declaration.createdBy ? (
            <p className="mt-2 text-sm text-slate-600">
              Auteur :{" "}
              <a className="text-blue-700 underline" href={`/admin/utilisateurs/${declaration.createdBy.id}`}>
                {declaration.createdBy.email}
              </a>
            </p>
          ) : null}
          <dl className="mt-6 grid gap-3 text-sm">
            <div>
              <dt className="font-medium text-slate-500">Produit</dt>
              <dd>{declaration.productNameRaw ?? "Non précisé"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Molécules</dt>
              <dd>{declaration.molecules.map((item) => item.molecule.name).join(", ") || "Non précisées"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Effets</dt>
              <dd>{declaration.effects.map((item) => item.effect.label).join(", ") || "Non précisés"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Période approximative</dt>
              <dd>{declaration.approximatePeriod ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Durée</dt>
              <dd>{declaration.effectDuration ?? "—"}</dd>
            </div>
          </dl>
          {declaration.narrative ? (
            <p className="mt-6 whitespace-pre-line leading-7 text-slate-700">{declaration.narrative}</p>
          ) : null}
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Historique</h2>
          <div className="mt-4 space-y-2 text-sm">
            {declaration.moderationActions.map((action) => (
              <p key={action.id} className="rounded-lg bg-slate-50 p-2">
                {action.action} · {action.moderator?.email ?? "système"} · {action.createdAt.toLocaleString("fr-FR")}
              </p>
            ))}
          </div>
        </section>
      </main>
      <aside>
        <DeclarationActions declarationId={declaration.id} />
      </aside>
    </div>
  );
}
