import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma, UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { USER_ROLE_LABELS } from "@/lib/admin";
import { db } from "@/lib/db";
import { btnSecondary } from "@/lib/ui/button-classes";

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
        <h1 className="text-3xl font-semibold text-slate-900">Utilisateurs</h1>
        <p className="mt-2 text-slate-700">{users.length} compte(s) affiché(s).</p>
      </div>

      <form className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5" method="get">
        <label className="text-sm">
          <span className="font-medium text-slate-700">Email</span>
          <input name="q" defaultValue={q} className="mt-1 w-full rounded-lg border p-2" placeholder="recherche…" />
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-700">Rôle</span>
          <select name="role" defaultValue={role ?? ""} className="mt-1 w-full rounded-lg border p-2">
            <option value="">Tous</option>
            {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-700">Email vérifié</span>
          <select name="verified" defaultValue={verified ?? ""} className="mt-1 w-full rounded-lg border p-2">
            <option value="">Tous</option>
            <option value="yes">Oui</option>
            <option value="no">Non</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-700">Suspendu</span>
          <select name="suspended" defaultValue={suspended ?? ""} className="mt-1 w-full rounded-lg border p-2">
            <option value="">Tous</option>
            <option value="yes">Oui</option>
            <option value="no">Non</option>
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className={btnSecondary}>
            Filtrer
          </button>
        </div>
      </form>

      <section className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Rôle</th>
              <th className="p-3">Vérifié</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Signalements</th>
              <th className="p-3">Déclarations</th>
              <th className="p-3">Inscription</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-3 font-medium">{user.email}</td>
                <td className="p-3">{USER_ROLE_LABELS[user.role]}</td>
                <td className="p-3">{user.emailVerifiedAt ? "Oui" : "Non"}</td>
                <td className="p-3">{user.bannedAt ? "Suspendu" : "Actif"}</td>
                <td className="p-3">{user._count.reports}</td>
                <td className="p-3">{user._count.declarations}</td>
                <td className="p-3">{user.createdAt.toLocaleDateString("fr-FR")}</td>
                <td className="p-3">
                  <Link className={btnSecondary} href={`/admin/utilisateurs/${user.id}`}>
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
