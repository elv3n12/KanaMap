import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import {
  deleteUserAction,
  forceVerifyEmailAction,
  suspendUserAction,
  unsuspendUserAction,
  updateRoleAction,
} from "@/app/admin/actions";
import { USER_ROLE_LABELS } from "@/lib/admin";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserDetailPage({ params }: Props) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      reports: { include: { location: true }, orderBy: { createdAt: "desc" }, take: 50 },
      declarations: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!user) notFound();

  const isSelf = session.user.id === user.id;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/users" className="text-sm text-obs-signal hover:underline">
          ← Back to users
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">{user.email}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          <span className="text-obs-signal">{USER_ROLE_LABELS[user.role]}</span> ·{" "}
          <span className={user.bannedAt ? "text-red-400" : "text-emerald-400"}>{user.bannedAt ? "Suspended" : "Active"}</span> ·{" "}
          {user.emailVerifiedAt ? "Email verified" : "Email not verified"}
        </p>
      </div>

      <ObsPanel className="p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Information</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="obs-label text-zinc-400">Joined</dt>
            <dd className="text-zinc-300">{user.createdAt.toLocaleString("en-GB")}</dd>
          </div>
          <div>
            <dt className="obs-label text-zinc-400">Charter accepted</dt>
            <dd className="text-zinc-300">{user.charterAcceptedAt?.toLocaleDateString("en-GB") ?? "—"}</dd>
          </div>
          <div>
            <dt className="obs-label text-zinc-400">Suspended</dt>
            <dd className="text-zinc-300">{user.bannedAt?.toLocaleString("en-GB") ?? "—"}</dd>
          </div>
        </dl>
      </ObsPanel>

      {!isSelf ? (
        <ObsPanel className="p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Actions</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <form action={updateRoleAction} className="flex items-end gap-2">
              <input type="hidden" name="userId" value={user.id} />
              <label className="text-sm">
                <span className="obs-label mb-1 block text-zinc-300">Role</span>
                <select
                  name="role"
                  defaultValue={user.role}
                  className="block rounded-md border border-obs-border bg-obs-surface p-2 text-zinc-100"
                >
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {USER_ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </label>
              <ObsButton type="submit" variant="primary">
                Update
              </ObsButton>
            </form>

            {!user.emailVerifiedAt ? (
              <form action={forceVerifyEmailAction}>
                <input type="hidden" name="userId" value={user.id} />
                <ObsButton type="submit" variant="outline">
                  Force verify email
                </ObsButton>
              </form>
            ) : null}

            {user.bannedAt ? (
              <form action={unsuspendUserAction}>
                <input type="hidden" name="userId" value={user.id} />
                <ObsButton type="submit" variant="outline">
                  Reactivate account
                </ObsButton>
              </form>
            ) : (
              <form action={suspendUserAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <input type="hidden" name="userId" value={user.id} />
                <label className="text-sm">
                  <span className="obs-label mb-1 block text-zinc-300">Suspension reason</span>
                  <input
                    name="reason"
                    className="block rounded-md border border-obs-border bg-obs-surface p-2 text-zinc-100 placeholder:text-zinc-400"
                    placeholder="Optional"
                  />
                </label>
                <ObsButton type="submit" variant="danger">
                  Suspend
                </ObsButton>
              </form>
            )}

            <form action={deleteUserAction}>
              <input type="hidden" name="userId" value={user.id} />
              <ObsButton type="submit" variant="danger">
                Delete permanently
              </ObsButton>
            </form>
          </div>
        </ObsPanel>
      ) : (
        <p className="text-sm text-zinc-400">You cannot modify your own account from this page.</p>
      )}

      <ObsPanel className="p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Reports ({user.reports.length})</h2>
        <div className="mt-4 divide-y divide-obs-border">
          {user.reports.length === 0 ? (
            <p className="py-3 text-sm text-zinc-400">No reports.</p>
          ) : (
            user.reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-200">{report.productCommercialName ?? "Observed product"}</p>
                  <p className="text-sm text-zinc-400">
                    {report.location.displayZone} · <span className="text-obs-signal">{REPORT_STATUS_LABELS[report.moderationStatus]}</span>
                  </p>
                </div>
                <Link href={`/admin/reports/${report.id}`}>
                  <ObsButton variant="ghost">View</ObsButton>
                </Link>
              </div>
            ))
          )}
        </div>
      </ObsPanel>

      <ObsPanel className="p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Declarations ({user.declarations.length})</h2>
        <div className="mt-4 divide-y divide-obs-border">
          {user.declarations.length === 0 ? (
            <p className="py-3 text-sm text-zinc-400">No declarations.</p>
          ) : (
            user.declarations.map((declaration) => (
              <div key={declaration.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-zinc-200">{declaration.productNameRaw ?? "Unspecified product"}</p>
                  <p className="text-sm text-zinc-400">
                    <span className="text-obs-signal">{REPORT_STATUS_LABELS[declaration.moderationStatus]}</span>
                  </p>
                </div>
                <Link href={`/admin/declarations/${declaration.id}`}>
                  <ObsButton variant="ghost">View</ObsButton>
                </Link>
              </div>
            ))
          )}
        </div>
      </ObsPanel>
    </div>
  );
}
