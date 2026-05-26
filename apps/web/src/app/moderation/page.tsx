import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { canModerate } from "@/lib/moderation";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const session = await auth();
  if (!canModerate(session?.user.role)) redirect("/");

  const [reports, declarations] = await Promise.all([
    db.report.findMany({
      where: { moderationStatus: { in: ["PENDING_REVIEW", "CONTESTED"] } },
      include: { location: true, molecules: { include: { molecule: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    db.adverseEffectDeclaration.findMany({
      where: { moderationStatus: { in: ["PENDING_REVIEW", "CONTESTED"] } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">File de modération</h1>
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Signalements</h2>
        <div className="mt-4 divide-y">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">{report.productCommercialName ?? "Produit observé"}</p>
                <p className="text-sm text-slate-600">
                  {report.location.displayZone} · {REPORT_STATUS_LABELS[report.moderationStatus]} · {report.molecules.map((item) => item.molecule.name).join(", ")}
                </p>
              </div>
              <Link className="rounded-lg border px-3 py-2 text-sm" href={`/moderation/signalements/${report.id}`}>
                Examiner
              </Link>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Déclarations d’effets indésirables</h2>
        <p className="mt-3 text-sm text-slate-600">{declarations.length} déclaration(s) en attente.</p>
      </section>
    </div>
  );
}
