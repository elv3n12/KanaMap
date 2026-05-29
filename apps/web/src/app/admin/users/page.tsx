import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma, UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { USER_ROLE_LABELS } from "@/lib/admin";
import { db } from "@/lib/db";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  role?: string;
  verified?: string;
  suspended?: string;
}>;

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const q = params.q?.trim();
  const role = params.role as UserRole | undefined;
  const verified = params.verified;
  const suspended = params.suspended;

  const where: Prisma.UserWhereInput = {};
  if (q) where.email = { contains: q };
  if (role) where.role = role;
  if (verified === "yes") where.emailVerifiedAt = { not: null };
  if (verified === "no") where.emailVerifiedAt = null;
  if (suspended === "yes") where.bannedAt = { not: null };
  if (suspended === "no") where.bannedAt = null;

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      _count: { select: { reports: true, declarations: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="obs-label text-obs-signal">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Users</h1>
        <p className="mt-1 text-sm text-zinc-400">{users.length} account(s) displayed.</p>
      </div>

      <ObsPanel className="p-4">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" method="get">
          <label className="text-sm">
            <span className="obs-label mb-1 block text-zinc-300">Email</span>
            <input
              name="q"
              defaultValue={q}
              className="w-full rounded-md border border-obs-border bg-obs-surface p-2 text-zinc-100 placeholder:text-zinc-400"
              placeholder="search…"
            />
          </label>
          <label className="text-sm">
            <span className="obs-label mb-1 block text-zinc-300">Role</span>
            <select name="role" defaultValue={role ?? ""} className="w-full rounded-md border border-obs-border bg-obs-surface p-2 text-zinc-100">
              <option value="">All</option>
              {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="obs-label mb-1 block text-zinc-300">Verified</span>
            <select name="verified" defaultValue={verified ?? ""} className="w-full rounded-md border border-obs-border bg-obs-surface p-2 text-zinc-100">
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="obs-label mb-1 block text-zinc-300">Suspended</span>
            <select name="suspended" defaultValue={suspended ?? ""} className="w-full rounded-md border border-obs-border bg-obs-surface p-2 text-zinc-100">
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <div className="flex items-end">
            <ObsButton type="submit" variant="outline">
              Filter
            </ObsButton>
          </div>
        </form>
      </ObsPanel>

      <div className="overflow-x-auto rounded-lg border border-obs-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-obs-border bg-obs-elevated text-zinc-400">
            <tr>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Verified</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Reports</th>
              <th className="p-3 font-medium">Declarations</th>
              <th className="p-3 font-medium">Joined</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-obs-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-obs-elevated/50">
                <td className="p-3 font-medium text-zinc-200">{user.email}</td>
                <td className="p-3 text-zinc-300">{USER_ROLE_LABELS[user.role]}</td>
                <td className="p-3">
                  <span className={user.emailVerifiedAt ? "text-emerald-400" : "text-zinc-400"}>
                    {user.emailVerifiedAt ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-3">
                  <span className={user.bannedAt ? "text-red-400" : "text-obs-signal"}>
                    {user.bannedAt ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="p-3 font-mono text-zinc-300">{user._count.reports}</td>
                <td className="p-3 font-mono text-zinc-300">{user._count.declarations}</td>
                <td className="p-3 text-zinc-400">{user.createdAt.toLocaleDateString("en-GB")}</td>
                <td className="p-3">
                  <Link href={`/admin/users/${user.id}`}>
                    <ObsButton variant="ghost">View</ObsButton>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
