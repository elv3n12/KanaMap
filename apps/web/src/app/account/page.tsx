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
  if (!session?.user) redirect("/login");

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
      <h1 className="text-3xl font-semibold">My account</h1>
      <p className="mt-2 text-sm text-slate-700">{session.user.email}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/reports/new" className={btnNavPill}>
          Submit a report
        </Link>
        <Link href="/reports/new" className={btnSecondary}>
          Report adverse effects
        </Link>
      </div>
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">My reports</h2>
        <div className="mt-4 divide-y">
          {reports.map((report) => (
            <div key={report.id} className="py-4">
              <p className="font-medium">{report.productCommercialName ?? "Observed product"}</p>
              <p className="text-sm text-slate-600">
                {report.location.displayZone} · {REPORT_STATUS_LABELS[report.moderationStatus]}
              </p>
            </div>
          ))}
          {reports.length === 0 ? <p className="py-4 text-sm text-slate-600">No reports yet.</p> : null}
        </div>
      </section>
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">My adverse effect declarations</h2>
        <p className="mt-3 text-sm text-slate-600">{declarations.length} declaration(s) submitted.</p>
      </section>
      <form action={deleteAccountAction} className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-semibold text-red-900">Right to be forgotten</h2>
        <p className="mt-2 text-sm text-red-800">
          Deletion anonymizes your contributions to preserve the public interest of
          aggregated data.
        </p>
        <button className={`mt-4 ${btnDestructive}`} type="submit">
          Delete my account
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
          Log out
        </button>
      </form>
    </div>
  );
}
