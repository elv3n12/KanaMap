import Link from "next/link";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { btnSecondary } from "@/lib/ui/button-classes";

export const dynamic = "force-dynamic";

const reportInclude = {
  location: true,
  molecules: { include: { molecule: true } },
} as const;

export default async function AdminSignalementsPage() {
  const [recentPublished, pendingReports] = await Promise.all([
    db.report.findMany({
      where: { moderationStatus: "PUBLISHED" },
      include: reportInclude,
      orderBy: { publishedAt: "desc" },
      take: 50,
    }),
    db.report.findMany({
      where: { moderationStatus: { in: ["PENDING_REVIEW", "CONTESTED"] } },
      include: reportInclude,
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Signalements</h1>
        <p className="mt-2 text-slate-700">
          Les signalements sont publiés à la soumission. Validez, limitez ou retirez-les a posteriori.
        </p>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Publiés récemment (à valider)</h2>
        <ReportList reports={recentPublished} empty="Aucun signalement publié pour le moment." />
      </section>

      {pendingReports.length > 0 ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">En attente ou contestés</h2>
          <ReportList reports={pendingReports} />
        </section>
      ) : null}
    </div>
  );
}

type ReportRow = Awaited<
  ReturnType<typeof db.report.findMany<{ include: typeof reportInclude }>>
>[number];

function ReportList({ reports, empty }: { reports: ReportRow[]; empty?: string }) {
  if (reports.length === 0) {
    return <p className="mt-4 py-4 text-sm text-slate-700">{empty ?? "Aucun élément."}</p>;
  }

  return (
    <div className="mt-4 divide-y divide-slate-200">
      {reports.map((report) => (
        <div key={report.id} className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="font-medium text-slate-900">{report.productCommercialName ?? "Produit observé"}</p>
            <p className="text-sm text-slate-700">
              {report.location.displayZone} · {REPORT_STATUS_LABELS[report.moderationStatus]} ·{" "}
              {report.molecules.map((item) => item.molecule.name).join(", ")}
            </p>
          </div>
          <Link className={btnSecondary} href={`/admin/signalements/${report.id}`}>
            Examiner
          </Link>
        </div>
      ))}
    </div>
  );
}
