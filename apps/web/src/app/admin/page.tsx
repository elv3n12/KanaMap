import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canAccessAdmin, getAdminCounts, USER_ROLE_LABELS } from "@/lib/admin";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

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
        <p className="obs-label text-obs-signal">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Overview of moderation and activity.</p>
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

      <p className="text-sm text-zinc-400">{roleSummary || "No users."}</p>

      <ObsPanel className="p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Latest published reports</h2>
        <div className="mt-4 divide-y divide-obs-border">
          {recentPublished.length === 0 ? (
            <p className="py-3 text-sm text-zinc-400">No published reports.</p>
          ) : (
            recentPublished.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-200">{report.productCommercialName ?? "Observed product"}</p>
                  <p className="text-sm text-zinc-400">
                    {report.location.displayZone} · <span className="text-obs-signal">{REPORT_STATUS_LABELS[report.moderationStatus]}</span>
                  </p>
                </div>
                <Link href={`/admin/reports/${report.id}`}>
                  <ObsButton variant="outline">Review</ObsButton>
                </Link>
              </div>
            ))
          )}
        </div>
      </ObsPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <ObsPanel className="p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Recent moderation actions</h2>
          <div className="mt-4 space-y-2 text-sm">
            {recentActions.length === 0 ? (
              <p className="text-zinc-400">No recent actions.</p>
            ) : (
              recentActions.map((action) => (
                <p key={action.id} className="rounded-md bg-obs-elevated p-2 text-zinc-300">
                  <span className="text-obs-signal">{action.action}</span>
                  {action.report?.productCommercialName ? ` · ${action.report.productCommercialName}` : ""}
                  {" · "}
                  <span className="text-zinc-400">{action.moderator?.email ?? "system"}</span>
                  {" · "}
                  <span className="text-zinc-400">{action.createdAt.toLocaleString("en-GB")}</span>
                </p>
              ))
            )}
          </div>
        </ObsPanel>

        <ObsPanel className="p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Recent signups</h2>
          <div className="mt-4 space-y-2 text-sm">
            {recentUsers.map((user) => (
              <p key={user.id} className="rounded-md bg-obs-elevated p-2 text-zinc-300">
                {user.email} · <span className="text-obs-signal">{USER_ROLE_LABELS[user.role]}</span> ·{" "}
                <span className="text-zinc-400">{user.createdAt.toLocaleDateString("en-GB")}</span>
              </p>
            ))}
          </div>
        </ObsPanel>
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
      className={`rounded-lg border p-4 transition hover:border-obs-violet ${
        highlight ? "border-amber-500/50 bg-amber-950/30" : "border-obs-border bg-obs-surface"
      }`}
    >
      <p className="obs-label text-zinc-400">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-zinc-100">{value}</p>
      {adminOnly ? <p className="mt-1 text-xs text-zinc-400">Admin only</p> : null}
    </Link>
  );
}
