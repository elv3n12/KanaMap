import { notFound } from "next/navigation";
import { ReportActions } from "@/components/moderation/report-actions";
import { PLACE_TYPE_LABELS, PRODUCT_TYPE_LABELS, REPORT_STATUS_LABELS } from "@/lib/constants";
import { decryptPII } from "@/lib/crypto";
import { db } from "@/lib/db";
import { ObsPanel } from "@/components/ui/obs";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminReportDetailPage({ params }: Props) {
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
      createdBy: { select: { id: true, email: true } },
    },
  });
  if (!report) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <main className="space-y-6">
        <ObsPanel className="p-6">
          <p className="obs-label text-obs-signal">{REPORT_STATUS_LABELS[report.moderationStatus]}</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-100">{report.productCommercialName ?? "Observed product"}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {report.location.displayZone} · {PLACE_TYPE_LABELS[report.placeType]}
          </p>
          {report.createdBy ? (
            <p className="mt-2 text-sm text-zinc-400">
              Author:{" "}
              <a className="text-obs-signal hover:underline" href={`/admin/users/${report.createdBy.id}`}>
                {report.createdBy.email}
              </a>
            </p>
          ) : null}
          <dl className="mt-6 grid gap-4 md:grid-cols-2">
            <Info label="Product" value={report.productType ? PRODUCT_TYPE_LABELS[report.productType] : "Not specified"} />
            <Info
              label="Molecules"
              value={report.molecules.map((item) => `${item.molecule.name} (${item.kind})`).join(", ") || "Not specified"}
            />
            <Info
              label="Claims"
              value={report.marketingClaims.map((item) => item.claim.label).join(", ") || "Not specified"}
            />
            <Info
              label="Effects"
              value={report.adverseEffects.map((item) => item.effect.label).join(", ") || "None reported"}
              highlight={report.adverseEffects.length > 0}
            />
            <Info
              label="Moderation address"
              value={decryptPII(report.exactAddressEncrypted) ?? "Not provided or masked"}
            />
          </dl>
          {report.narrative ? <p className="mt-6 whitespace-pre-line leading-7 text-zinc-300">{report.narrative}</p> : null}
        </ObsPanel>
        <ObsPanel className="p-6">
          <h2 className="text-lg font-semibold text-zinc-100">History</h2>
          <div className="mt-4 space-y-2 text-sm">
            {report.moderationActions.map((action) => (
              <p key={action.id} className="rounded-md bg-obs-elevated p-2 text-zinc-300">
                <span className="text-obs-signal">{action.action}</span> · {action.moderator?.email ?? "system"} ·{" "}
                <span className="text-zinc-400">{action.createdAt.toLocaleString("en-GB")}</span>
                {action.notes ? <span className="text-zinc-400"> · {action.notes}</span> : null}
              </p>
            ))}
          </div>
        </ObsPanel>
      </main>
      <aside>
        <ReportActions reportId={report.id} />
      </aside>
    </div>
  );
}

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="obs-label text-zinc-400">{label}</dt>
      <dd className={`mt-1 text-sm ${highlight ? "text-red-400" : "text-zinc-300"}`}>{value}</dd>
    </div>
  );
}
