import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ReportActions } from "@/components/moderation/report-actions";
import { PLACE_TYPE_LABELS, PRODUCT_TYPE_LABELS, PROOF_LEVEL_LABELS, REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { canModerate } from "@/lib/moderation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ModerationReportPage({ params }: Props) {
  const session = await auth();
  if (!canModerate(session?.user.role)) redirect("/");

  const { id } = await params;
  const report = await db.report.findUnique({
    where: { id },
    include: {
      location: true,
      molecules: { include: { molecule: true } },
      marketingClaims: { include: { claim: true } },
      adverseEffects: { include: { effect: true } },
      evidence: true,
      moderationActions: { orderBy: { createdAt: "desc" }, include: { moderator: true } },
    },
  });
  if (!report) notFound();

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_360px]">
      <main className="space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">{report.productCommercialName ?? "Produit observé"}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {report.location.displayZone} · {PLACE_TYPE_LABELS[report.placeType]} · {REPORT_STATUS_LABELS[report.moderationStatus]}
          </p>
          <dl className="mt-6 grid gap-4 md:grid-cols-2">
            <Info label="Produit" value={report.productType ? PRODUCT_TYPE_LABELS[report.productType] : "Non précisé"} />
            <Info label="Niveau de preuve" value={PROOF_LEVEL_LABELS[report.proofLevel]} />
            <Info label="Molécules" value={report.molecules.map((item) => `${item.molecule.name} (${item.kind})`).join(", ") || "Non précisées"} />
            <Info label="Allégations" value={report.marketingClaims.map((item) => item.claim.label).join(", ") || "Non précisées"} />
            <Info label="Effets" value={report.adverseEffects.map((item) => item.effect.label).join(", ") || "Non rapportés"} />
            <Info label="Adresse modération" value={report.exactAddressEncrypted ? Buffer.from(report.exactAddressEncrypted, "base64").toString("utf8") : "Non fournie ou masquée"} />
          </dl>
          {report.narrative ? <p className="mt-6 whitespace-pre-line leading-7 text-slate-700">{report.narrative}</p> : null}
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Historique</h2>
          <div className="mt-4 space-y-2 text-sm">
            {report.moderationActions.map((action) => (
              <p key={action.id} className="rounded-lg bg-slate-50 p-2">
                {action.action} · {action.moderator?.email ?? "système"} · {action.createdAt.toLocaleString("fr-FR")} · {action.notes ?? ""}
              </p>
            ))}
          </div>
        </section>
      </main>
      <aside>
        <ReportActions reportId={report.id} />
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
