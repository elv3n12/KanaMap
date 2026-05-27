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
import { btnDestructive, btnPrimary, btnSecondary } from "@/lib/ui/button-classes";

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
        <Link href="/admin/utilisateurs" className="text-sm text-blue-700 underline">
          ← Retour aux utilisateurs
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{user.email}</h1>
        <p className="mt-1 text-slate-600">
          {USER_ROLE_LABELS[user.role]} · {user.bannedAt ? "Suspendu" : "Actif"} ·{" "}
          {user.emailVerifiedAt ? "Email vérifié" : "Email non vérifié"}
        </p>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Informations</h2>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Inscription</dt>
            <dd>{user.createdAt.toLocaleString("fr-FR")}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Charte acceptée</dt>
            <dd>{user.charterAcceptedAt?.toLocaleDateString("fr-FR") ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Suspension</dt>
            <dd>{user.bannedAt?.toLocaleString("fr-FR") ?? "—"}</dd>
          </div>
        </dl>
      </section>

      {!isSelf ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Actions</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <form action={updateRoleAction} className="flex items-end gap-2">
              <input type="hidden" name="userId" value={user.id} />
              <label className="text-sm">
                <span className="font-medium">Rôle</span>
                <select name="role" defaultValue={user.role} className="mt-1 block rounded-lg border p-2">
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {USER_ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className={btnPrimary}>
                Mettre à jour
              </button>
            </form>

            {!user.emailVerifiedAt ? (
              <form action={forceVerifyEmailAction}>
                <input type="hidden" name="userId" value={user.id} />
                <button type="submit" className={btnSecondary}>
                  Forcer vérification email
                </button>
              </form>
            ) : null}

            {user.bannedAt ? (
              <form action={unsuspendUserAction}>
                <input type="hidden" name="userId" value={user.id} />
                <button type="submit" className={btnSecondary}>
                  Réactiver le compte
                </button>
              </form>
            ) : (
              <form action={suspendUserAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <input type="hidden" name="userId" value={user.id} />
                <label className="text-sm">
                  <span className="font-medium">Motif suspension</span>
                  <input name="reason" className="mt-1 block rounded-lg border p-2" placeholder="Optionnel" />
                </label>
                <button type="submit" className={btnDestructive}>
                  Suspendre
                </button>
              </form>
            )}

            <form action={deleteUserAction}>
              <input type="hidden" name="userId" value={user.id} />
              <button type="submit" className={btnDestructive}>
                Supprimer définitivement
              </button>
            </form>
          </div>
        </section>
      ) : (
        <p className="text-sm text-slate-600">Vous ne pouvez pas modifier votre propre compte depuis cette page.</p>
      )}

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Signalements ({user.reports.length})</h2>
        <div className="mt-4 divide-y">
          {user.reports.length === 0 ? (
            <p className="py-3 text-sm text-slate-600">Aucun signalement.</p>
          ) : (
            user.reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">{report.productCommercialName ?? "Produit observé"}</p>
                  <p className="text-sm text-slate-600">
                    {report.location.displayZone} · {REPORT_STATUS_LABELS[report.moderationStatus]}
                  </p>
                </div>
                <Link className={btnSecondary} href={`/admin/signalements/${report.id}`}>
                  Voir
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Déclarations ({user.declarations.length})</h2>
        <div className="mt-4 divide-y">
          {user.declarations.length === 0 ? (
            <p className="py-3 text-sm text-slate-600">Aucune déclaration.</p>
          ) : (
            user.declarations.map((declaration) => (
              <div key={declaration.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">{declaration.productNameRaw ?? "Produit non précisé"}</p>
                  <p className="text-sm text-slate-600">{REPORT_STATUS_LABELS[declaration.moderationStatus]}</p>
                </div>
                <Link className={btnSecondary} href={`/admin/declarations/${declaration.id}`}>
                  Voir
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
