import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { btnSecondary } from "@/lib/ui/button-classes";

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
        <h1 className="text-3xl font-semibold text-slate-900">Journal d&apos;audit</h1>
        <p className="mt-2 text-slate-700">{total} entrée(s) au total.</p>
      </div>

      <form className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm" method="get">
        <label className="text-sm">
          <span className="font-medium text-slate-700">Action</span>
          <input name="action" defaultValue={actionFilter} className="mt-1 block rounded-lg border p-2" />
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-700">Type cible</span>
          <input name="targetType" defaultValue={targetType} className="mt-1 block rounded-lg border p-2" />
        </label>
        <div className="flex items-end">
          <button type="submit" className={btnSecondary}>
            Filtrer
          </button>
        </div>
      </form>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="space-y-2 text-sm">
          {logs.map((log) => (
            <p key={log.id} className="rounded-lg bg-slate-50 p-3">
              <strong>{log.action}</strong> · {log.targetType}
              {log.targetId ? `:${log.targetId}` : ""} · {log.user?.email ?? "système"} ·{" "}
              {log.createdAt.toLocaleString("fr-FR")}
            </p>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between text-sm">
          <span>
            Page {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                className={btnSecondary}
                href={`/admin/audit?${new URLSearchParams({ ...(actionFilter ? { action: actionFilter } : {}), ...(targetType ? { targetType } : {}), page: String(page - 1) }).toString()}`}
              >
                Précédent
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                className={btnSecondary}
                href={`/admin/audit?${new URLSearchParams({ ...(actionFilter ? { action: actionFilter } : {}), ...(targetType ? { targetType } : {}), page: String(page + 1) }).toString()}`}
              >
                Suivant
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
