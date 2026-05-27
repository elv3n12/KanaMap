import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { canModerate } from "@/lib/moderation";
import { btnSecondary } from "@/lib/ui/button-classes";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const session = await auth();
  if (!canModerate(session?.user.role)) redirect("/");

  const [recentPublished, pendingReports, declarations] = await Promise.all([
    db.report.findMany({
      where: { moderationStatus: "PUBLISHED" },
      include: { location: true, molecules: { include: { molecule: true } } },
      orderBy: { publishedAt: "desc" },
      take: 50,
    }),
    db.report.findMany({
      where: { moderationStatus: { in: ["PENDING_REVIEW", "CONTESTED"] } },
      include: { location: true, molecules: { include: { molecule: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    db.adverseEffectDeclaration.findMany({
      where: { moderationStatus: { in: ["PENDING_REVIEW", "CONTESTED"] } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  ]);

  function ReportRow({
    report,
  }: {
    report: (typeof recentPublished)[number];
  }) {
    return (
      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="font-medium text-slate-900">
            {report.productCommercialName ?? "Produit observé"}
          </p>
          <p className="text-sm text-slate-700">
            {report.location.displayZone} · {REPORT_STATUS_LABELS[report.moderationStatus]} ·{" "}
            {report.molecules.map((item) => item.molecule.name).join(", ")}
          </p>
        </div>
        <Link className={btnSecondary} href={`/moderation/signalements/${report.id}`}>
          Examiner
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-slate-900">File de modération</h1>
      <p className="mt-2 text-slate-700">
        Les signalements sont publiés à la soumission. Validez, limitez ou retirez-les a posteriori.
      </p>

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Publiés récemment (à valider)</h2>
        <div className="mt-4 divide-y divide-slate-200">
          {recentPublished.length === 0 ? (
            <p className="py-4 text-sm text-slate-700">Aucun signalement publié pour le moment.</p>
          ) : (
            recentPublished.map((report) => <ReportRow key={report.id} report={report} />)
          )}
        </div>
      </section>

      {pendingReports.length > 0 ? (
        <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">En attente ou contestés</h2>
          <div className="mt-4 divide-y divide-slate-200">
            {pendingReports.map((report) => (
              <ReportRow key={report.id} report={report} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Déclarations d&apos;effets indésirables</h2>
        <p className="mt-3 text-sm text-slate-700">{declarations.length} déclaration(s) en attente.</p>
      </section>
    </div>
  );
}
