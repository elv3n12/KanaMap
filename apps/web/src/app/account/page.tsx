import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { deleteAccountAction } from "./actions";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

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
    <div className="obs-grid-bg min-h-screen">
      {/* Hero */}
      <section className="border-b border-obs-border bg-gradient-to-b from-obs-elevated/80 to-obs-void px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="obs-label text-obs-signal">Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
            My account
          </h1>
          <p className="mt-2 font-mono text-sm text-zinc-400">{session.user.email}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/reports/new"
              className="inline-flex min-h-9 items-center rounded border border-violet-600/50 bg-obs-violet px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              Submit a report
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <ObsButton type="submit" variant="outline">
                Log out
              </ObsButton>
            </form>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Reports */}
          <ObsPanel className="p-5">
            <h2 className="text-lg font-semibold text-zinc-100">My reports</h2>
            <div className="mt-4 divide-y divide-obs-border">
              {reports.map((report) => (
                <div key={report.id} className="py-3">
                  <p className="font-medium text-zinc-200">{report.productCommercialName ?? "Observed product"}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {report.location.displayZone} · <span className="text-obs-signal">{REPORT_STATUS_LABELS[report.moderationStatus]}</span>
                  </p>
                  <Link
                    href={`/reports/${report.id}/edit`}
                    className="mt-2 inline-block text-sm text-obs-signal underline hover:text-obs-violet"
                  >
                    Complete report
                  </Link>
                </div>
              ))}
              {reports.length === 0 ? <p className="py-4 text-sm text-zinc-400">No reports yet.</p> : null}
            </div>
          </ObsPanel>

          {/* Declarations */}
          <ObsPanel className="p-5">
            <h2 className="text-lg font-semibold text-zinc-100">Adverse effect declarations</h2>
            <p className="mt-3 text-sm text-zinc-400">
              <span className="font-mono text-lg text-obs-signal">{declarations.length}</span> declaration(s) submitted.
            </p>
          </ObsPanel>
        </div>

        {/* Danger zone */}
        <div className="mt-8 rounded-lg border border-red-500/30 bg-red-950/30 p-5">
          <h2 className="font-semibold text-red-300">Right to be forgotten</h2>
          <p className="mt-2 text-sm text-red-200/80">
            Deletion anonymizes your contributions to preserve the public interest of aggregated data.
          </p>
          <form action={deleteAccountAction} className="mt-4">
            <ObsButton type="submit" variant="danger">
              Delete my account
            </ObsButton>
          </form>
        </div>
      </div>
    </div>
  );
}
