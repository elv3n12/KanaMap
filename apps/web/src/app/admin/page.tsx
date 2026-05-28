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
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-700">Overview of moderation and activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="To review"
          value={counts.toReview}
          href="/admin/reports"
          highlight={counts.toReview > 0}
        />
        <StatCard label="Contested" value={counts.contestedReports} href="/admin/reports" />
        <StatCard label="Adverse effects" value={counts.reportsWithEffects} href="/admin/declarations" />
        <StatCard label="Published (7d)" value={counts.recentPublished} href="/admin/reports" />
        <StatCard label="Users" value={counts.totalUsers} href="/admin/users" adminOnly />
      </div>

      <p className="text-sm text-slate-600">{roleSummary || "No users."}</p>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Latest published reports</h2>
        <div className="mt-4 divide-y divide-slate-200">
          {recentPublished.length === 0 ? (
            <p className="py-3 text-sm text-slate-600">No published reports.</p>
          ) : (
            recentPublished.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">{report.productCommercialName ?? "Observed product"}</p>
                  <p className="text-sm text-slate-600">
                    {report.location.displayZone} · {REPORT_STATUS_LABELS[report.moderationStatus]}
                  </p>
                </div>
                <Link className={btnSecondary} href={`/admin/reports/${report.id}`}>
                  Review
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent moderation actions</h2>
          <div className="mt-4 space-y-2 text-sm">
            {recentActions.length === 0 ? (
              <p className="text-slate-600">No recent actions.</p>
            ) : (
              recentActions.map((action) => (
                <p key={action.id} className="rounded-lg bg-slate-50 p-2">
                  {action.action}
                  {action.report?.productCommercialName ? ` · ${action.report.productCommercialName}` : ""}
                  {" · "}
                  {action.moderator?.email ?? "system"}
                  {" · "}
                  {action.createdAt.toLocaleString("en-GB")}
                </p>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent signups</h2>
          <div className="mt-4 space-y-2 text-sm">
            {recentUsers.map((user) => (
              <p key={user.id} className="rounded-lg bg-slate-50 p-2">
                {user.email} · {USER_ROLE_LABELS[user.role]} ·{" "}
                {user.createdAt.toLocaleDateString("en-GB")}
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
      {adminOnly ? <p className="mt-1 text-xs text-slate-500">Admin only</p> : null}
    </Link>
  );
}
