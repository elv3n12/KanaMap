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
      <p className="text-sm font-medium text-slate-600">Published and anonymized report</p>
      <h1 className="mt-2 text-3xl font-semibold">{publicReport.productName}</h1>
      <p className="mt-2 text-slate-700">
        Zone: {publicReport.zone} · {PLACE_TYPE_LABELS[publicReport.placeType]}
      </p>
      <div className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
        <Info label="Product type" value={publicReport.productType ? PRODUCT_TYPE_LABELS[publicReport.productType] : "Not specified"} />
        <Info label="Proof level" value={PROOF_LEVEL_LABELS[publicReport.proofLevel]} />
        <Info label="Status" value={REPORT_STATUS_LABELS[publicReport.moderationStatus]} />
        <Info label="Observation date" value={new Date(publicReport.observationDate).toLocaleDateString("en-GB")} />
        <Info label="Declared molecules" value={publicReport.molecules.map((item) => `${item.name} (${item.kind.toLowerCase()})`).join(", ") || "Not specified"} />
        <Info label="Observed claims" value={publicReport.marketingClaims.join(", ") || "Not specified"} />
        <Info label="Reported effects" value={publicReport.adverseEffects.join(", ") || "None reported"} />
      </div>
      {publicReport.narrative ? (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Moderated description</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{publicReport.narrative}</p>
        </section>
      ) : null}
      <p className="mt-6 text-sm text-slate-500">
        The exact address and precise coordinates are not published. This record documents an
        observation, without constituting a recommendation or access indication.
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value}</dd>
    </div>
  );
}
