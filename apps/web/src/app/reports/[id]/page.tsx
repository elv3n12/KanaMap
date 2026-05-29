import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PLACE_TYPE_LABELS, PRODUCT_TYPE_LABELS, PROOF_LEVEL_LABELS, REPORT_STATUS_LABELS } from "@/lib/constants";
import { serializePublicReport } from "@/lib/report-serializers";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function PublicReportPage({ params }: Props) {
  const { id } = await params;
  const report = await db.report.findUnique({
    where: { id },
    include: {
      location: true,
      product: true,
      brand: true,
      molecules: { include: { molecule: true } },
      marketingClaims: { include: { claim: true } },
      adverseEffects: { include: { effect: true } },
    },
  });

  if (!report || report.moderationStatus !== "PUBLISHED") notFound();
  const publicReport = serializePublicReport(report);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="obs-label text-obs-signal">Published and anonymized report</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-100">{publicReport.productName}</h1>
      <p className="mt-2 text-zinc-400">
        Zone: {publicReport.zone} · {PLACE_TYPE_LABELS[publicReport.placeType]}
      </p>
      <div className="mt-6 grid gap-4 rounded-lg border border-obs-border bg-obs-surface p-6 md:grid-cols-2">
        <Info label="Product type" value={publicReport.productType ? PRODUCT_TYPE_LABELS[publicReport.productType] : "Not specified"} />
        <Info label="Proof level" value={PROOF_LEVEL_LABELS[publicReport.proofLevel]} />
        <Info label="Status" value={REPORT_STATUS_LABELS[publicReport.moderationStatus]} />
        <Info label="Observation date" value={new Date(publicReport.observationDate).toLocaleDateString("en-GB")} />
        <Info label="Declared molecules" value={publicReport.molecules.map((item) => `${item.name} (${item.kind.toLowerCase()})`).join(", ") || "Not specified"} />
        <Info label="Observed claims" value={publicReport.marketingClaims.join(", ") || "Not specified"} />
        <Info label="Reported effects" value={publicReport.adverseEffects.join(", ") || "None reported"} />
      </div>
      {publicReport.narrative ? (
        <section className="mt-6 rounded-lg border border-obs-border bg-obs-surface p-6">
          <h2 className="text-lg font-semibold text-zinc-100">Moderated description</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-zinc-300">{publicReport.narrative}</p>
        </section>
      ) : null}
      <p className="mt-6 text-sm text-zinc-400">
        The exact address and precise coordinates are not published. This record documents an
        observation, without constituting a recommendation or access indication.
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="obs-label text-zinc-400">{label}</dt>
      <dd className="mt-1 text-sm text-zinc-300">{value}</dd>
    </div>
  );
}
