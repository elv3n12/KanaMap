import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  action?: string;
  targetType?: string;
  page?: string;
}>;

const PAGE_SIZE = 50;

export default async function AdminAuditPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const actionFilter = params.action?.trim();
  const targetType = params.targetType?.trim();
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const where: Prisma.AuditLogWhereInput = {};
  if (actionFilter) where.action = { contains: actionFilter };
  if (targetType) where.targetType = targetType;

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { email: true } } },
    }),
    db.auditLog.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-8">
      <div>
        <p className="obs-label text-obs-signal">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Audit Log</h1>
        <p className="mt-1 text-sm text-zinc-400">{total} total entries.</p>
      </div>

      <ObsPanel className="p-4">
        <form className="flex flex-wrap gap-3" method="get">
          <label className="text-sm">
            <span className="obs-label mb-1 block text-zinc-300">Action</span>
            <input
              name="action"
              defaultValue={actionFilter}
              className="block rounded-md border border-obs-border bg-obs-surface p-2 text-zinc-100"
            />
          </label>
          <label className="text-sm">
            <span className="obs-label mb-1 block text-zinc-300">Target type</span>
            <input
              name="targetType"
              defaultValue={targetType}
              className="block rounded-md border border-obs-border bg-obs-surface p-2 text-zinc-100"
            />
          </label>
          <div className="flex items-end">
            <ObsButton type="submit" variant="outline">
              Filter
            </ObsButton>
          </div>
        </form>
      </ObsPanel>

      <ObsPanel className="p-5">
        <div className="space-y-2 text-sm">
          {logs.map((log) => (
            <p key={log.id} className="rounded-md bg-obs-elevated p-3 text-zinc-300">
              <span className="font-semibold text-obs-signal">{log.action}</span> · {log.targetType}
              {log.targetId ? `:${log.targetId}` : ""} · <span className="text-zinc-400">{log.user?.email ?? "system"}</span> ·{" "}
              <span className="text-zinc-400">{log.createdAt.toLocaleString("en-GB")}</span>
            </p>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between text-sm text-zinc-400">
          <span>
            Page {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/admin/audit?${new URLSearchParams({ ...(actionFilter ? { action: actionFilter } : {}), ...(targetType ? { targetType } : {}), page: String(page - 1) }).toString()}`}
              >
                <ObsButton variant="outline">Previous</ObsButton>
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/admin/audit?${new URLSearchParams({ ...(actionFilter ? { action: actionFilter } : {}), ...(targetType ? { targetType } : {}), page: String(page + 1) }).toString()}`}
              >
                <ObsButton variant="outline">Next</ObsButton>
              </Link>
            ) : null}
          </div>
        </div>
      </ObsPanel>
    </div>
  );
}
