import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { deleteAccountAction } from "./actions";
import { btnDestructive, btnNavPill, btnSecondary } from "@/lib/ui/button-classes";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const [reports, declarations] = await Promise.all([
    db.report.findMany({
      where: { createdById: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { location: true },
    }),
    db.adverseEffectDeclaration.findMany({
      where: { createdById: session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Mon compte</h1>
      <p className="mt-2 text-sm text-slate-700">{session.user.email}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/signalements/nouveau" className={btnNavPill}>
          Soumettre un signalement
        </Link>
        <Link href="/declarer-effet-indesirable" className={btnSecondary}>
          Déclarer un effet indésirable
        </Link>
      </div>
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Mes signalements</h2>
        <div className="mt-4 divide-y">
          {reports.map((report) => (
            <div key={report.id} className="py-4">
              <p className="font-medium">{report.productCommercialName ?? "Produit observé"}</p>
              <p className="text-sm text-slate-600">
                {report.location.displayZone} · {REPORT_STATUS_LABELS[report.moderationStatus]}
              </p>
            </div>
          ))}
          {reports.length === 0 ? <p className="py-4 text-sm text-slate-600">Aucun signalement.</p> : null}
        </div>
      </section>
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Mes déclarations d’effets indésirables</h2>
        <p className="mt-3 text-sm text-slate-600">{declarations.length} déclaration(s) transmise(s).</p>
      </section>
      <form action={deleteAccountAction} className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-semibold text-red-900">Droit à l’oubli</h2>
        <p className="mt-2 text-sm text-red-800">
          La suppression anonymise vos contributions pour préserver l’intérêt public des données
          agrégées.
        </p>
        <button className={`mt-4 ${btnDestructive}`} type="submit">
          Supprimer mon compte
        </button>
      </form>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-8"
      >
        <button className={btnSecondary} type="submit">
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
