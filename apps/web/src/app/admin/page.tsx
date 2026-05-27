import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canAccessAdmin, getAdminCounts, USER_ROLE_LABELS } from "@/lib/admin";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { btnSecondary } from "@/lib/ui/button-classes";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!canAccessAdmin(session?.user.role)) redirect("/");

  const counts = await getAdminCounts();

  const [recentPublished, recentActions, recentUsers, usersByRole] = await Promise.all([
    db.report.findMany({
      where: { moderationStatus: "PUBLISHED" },
      include: { location: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    db.moderationAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { moderator: true, report: { select: { productCommercialName: true } } },
    }),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    db.user.groupBy({ by: ["role"], _count: { role: true } }),
  ]);

  const roleSummary = usersByRole
    .map((row) => `${USER_ROLE_LABELS[row.role]}: ${row._count.role}`)
    .join(" · ");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Tableau de bord</h1>
        <p className="mt-2 text-slate-700">Vue d&apos;ensemble de la modération et de l&apos;activité.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="À modérer"
          value={counts.toReview}
          href="/admin/signalements"
          highlight={counts.toReview > 0}
        />
        <StatCard label="Contestés" value={counts.contestedReports} href="/admin/signalements" />
        <StatCard label="Publiés (7 j)" value={counts.recentPublished} href="/admin/signalements" />
        <StatCard label="Utilisateurs" value={counts.totalUsers} href="/admin/utilisateurs" adminOnly />
      </div>

      <p className="text-sm text-slate-600">{roleSummary || "Aucun utilisateur."}</p>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Derniers signalements publiés</h2>
        <div className="mt-4 divide-y divide-slate-200">
          {recentPublished.length === 0 ? (
            <p className="py-3 text-sm text-slate-600">Aucun signalement publié.</p>
          ) : (
            recentPublished.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">{report.productCommercialName ?? "Produit observé"}</p>
                  <p className="text-sm text-slate-600">
                    {report.location.displayZone} · {REPORT_STATUS_LABELS[report.moderationStatus]}
                  </p>
                </div>
                <Link className={btnSecondary} href={`/admin/signalements/${report.id}`}>
                  Examiner
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Dernières actions de modération</h2>
          <div className="mt-4 space-y-2 text-sm">
            {recentActions.length === 0 ? (
              <p className="text-slate-600">Aucune action récente.</p>
            ) : (
              recentActions.map((action) => (
                <p key={action.id} className="rounded-lg bg-slate-50 p-2">
                  {action.action}
                  {action.report?.productCommercialName ? ` · ${action.report.productCommercialName}` : ""}
                  {" · "}
                  {action.moderator?.email ?? "système"}
                  {" · "}
                  {action.createdAt.toLocaleString("fr-FR")}
                </p>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Derniers inscrits</h2>
          <div className="mt-4 space-y-2 text-sm">
            {recentUsers.map((user) => (
              <p key={user.id} className="rounded-lg bg-slate-50 p-2">
                {user.email} · {USER_ROLE_LABELS[user.role]} ·{" "}
                {user.createdAt.toLocaleDateString("fr-FR")}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  highlight,
  adminOnly,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
  adminOnly?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border p-5 shadow-sm transition hover:border-slate-300 ${
        highlight ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      {adminOnly ? <p className="mt-1 text-xs text-slate-500">Admin uniquement</p> : null}
    </Link>
  );
}
