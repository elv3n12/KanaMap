import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { updateRoleAction, upsertLookupAction } from "./actions";
import { btnPrimary } from "@/lib/ui/button-classes";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const [users, molecules, claims, effects, auditLogs, brands, products] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.molecule.findMany({ orderBy: { name: "asc" } }),
    db.marketingClaim.findMany({ orderBy: { label: "asc" } }),
    db.adverseEffect.findMany({ orderBy: { label: "asc" } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
    db.brand.findMany({ orderBy: { name: "asc" }, take: 50 }),
    db.product.findMany({ orderBy: { commercialName: "asc" }, include: { brand: true }, take: 50 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <h1 className="text-3xl font-semibold">Administration</h1>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Utilisateurs et rôles</h2>
        <div className="mt-4 divide-y">
          {users.map((user) => (
            <form key={user.id} action={updateRoleAction} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div>
                <p>{user.email}</p>
                <p className="text-slate-500">{user.bannedAt ? "suspendu" : "actif"}</p>
              </div>
              <input type="hidden" name="userId" value={user.id} />
              <select name="role" defaultValue={user.role} className="rounded-lg border p-2">
                {Object.values(UserRole).map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <button className={btnPrimary} type="submit">
                Mettre à jour
              </button>
            </form>
          ))}
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        <Lookup title="Molécules" type="molecule" labels={molecules.map((item) => item.name)} />
        <Lookup title="Allégations marketing" type="claim" labels={claims.map((item) => item.label)} />
        <Lookup title="Effets indésirables" type="effect" labels={effects.map((item) => item.label)} />
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Marques observées</h2>
          <p className="mt-3 text-sm text-slate-600">{brands.map((brand) => brand.name).join(", ") || "Aucune marque."}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Produits observés</h2>
          <div className="mt-3 space-y-2 text-sm">
            {products.map((product) => <p key={product.id}>{product.commercialName} {product.brand ? `· ${product.brand.name}` : ""}</p>)}
          </div>
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Journal d’audit</h2>
        <div className="mt-4 grid gap-2 text-sm">
          {auditLogs.map((log) => (
            <p key={log.id} className="rounded-lg bg-slate-50 p-2">
              {log.action} · {log.targetType}:{log.targetId ?? "n/a"} · {log.createdAt.toLocaleString("fr-FR")}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

function Lookup({ title, type, labels }: { title: string; type: string; labels: string[] }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <form action={upsertLookupAction} className="mt-4 flex gap-2">
        <input type="hidden" name="type" value={type} />
        <input required name="label" className="min-w-0 flex-1 rounded-lg border p-2" placeholder="Ajouter" />
        <button className={btnPrimary} type="submit">
          OK
        </button>
      </form>
      <p className="mt-3 text-sm leading-6 text-slate-600">{labels.join(", ")}</p>
    </div>
  );
}
