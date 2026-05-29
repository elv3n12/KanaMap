import Link from "next/link";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

export const dynamic = "force-dynamic";

const reportInclude = {
  location: true,
  molecules: { include: { molecule: true } },
} as const;

export default async function AdminReportsPage() {
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
        <p className="obs-label text-obs-signal">Moderation</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Reports</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Reports are published on submission. Validate, limit, or remove them a posteriori.
        </p>
      </div>

      <ObsPanel className="p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Recently published (to validate)</h2>
        <ReportList reports={recentPublished} empty="No published reports yet." />
      </ObsPanel>

      {pendingReports.length > 0 ? (
        <ObsPanel className="p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Pending or contested</h2>
          <ReportList reports={pendingReports} />
        </ObsPanel>
      ) : null}
    </div>
  );
}

type ReportRow = Awaited<
  ReturnType<typeof db.report.findMany<{ include: typeof reportInclude }>>
>[number];

function ReportList({ reports, empty }: { reports: ReportRow[]; empty?: string }) {
  if (reports.length === 0) {
    return <p className="mt-4 py-4 text-sm text-zinc-400">{empty ?? "No items."}</p>;
  }

  return (
    <div className="mt-4 divide-y divide-obs-border">
      {reports.map((report) => (
        <div key={report.id} className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="font-medium text-zinc-200">{report.productCommercialName ?? "Observed product"}</p>
            <p className="text-sm text-zinc-400">
              {report.location.displayZone} · <span className="text-obs-signal">{REPORT_STATUS_LABELS[report.moderationStatus]}</span> ·{" "}
              {report.molecules.map((item) => item.molecule.name).join(", ")}
            </p>
          </div>
          <Link href={`/admin/reports/${report.id}`}>
            <ObsButton variant="outline">Review</ObsButton>
          </Link>
        </div>
      ))}
    </div>
  );
}
