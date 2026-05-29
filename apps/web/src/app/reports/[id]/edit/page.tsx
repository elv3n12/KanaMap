import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { QuickReportForm } from "@/components/declaration-wizard/quick-report-form";
import type { DeclarationData } from "@/components/declaration-wizard/wizard-types";
import { db } from "@/lib/db";
import { MoleculeKind } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

type LoadedReport = NonNullable<Awaited<ReturnType<typeof loadReport>>>;

function reportToFormData(report: LoadedReport): DeclarationData {
  const announced = report.molecules.find((m) => m.kind === MoleculeKind.ANNOUNCED);

  return {
    countryCode: report.location.countryCode,
    countryName: report.location.countryName,
    city: report.location.city,
    centroidLat: report.location.centroidLat,
    centroidLng: report.location.centroidLng,
    displayZone: report.location.displayZone,
    placeType: report.placeType,
    placeOtherLabel: report.placeOtherLabel ?? undefined,
    productCommercialName: report.productCommercialName ?? "",
    productType: report.productType ?? "OTHER",
    observationDate: report.observationDate.toISOString().slice(0, 10),
    primaryMoleculeId: announced?.moleculeId,
    primaryMoleculeCustom: undefined,
    consumed: report.consumed,
    formOfUse: report.formOfUse ?? undefined,
    positiveEffectIds: report.positiveEffects.map((e) => e.effectId),
    adverseEffectIds: report.adverseEffects.map((e) => e.effectId),
    goodFaithConfirmed: true,
    proofLevel: report.proofLevel,
  };
}

async function loadReport(id: string, userId: string) {
  return db.report.findFirst({
    where: { id, createdById: userId },
    include: {
      location: true,
      molecules: { include: { molecule: true } },
      positiveEffects: true,
      adverseEffects: true,
    },
  });
}

export default async function EditReportPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const report = await loadReport(id, session.user.id);
  if (!report) notFound();

  const [molecules, claims, adverseEffects, positiveEffects] = await Promise.all([
    db.molecule.findMany({ orderBy: { name: "asc" } }),
    db.marketingClaim.findMany({ orderBy: { label: "asc" } }),
    db.adverseEffect.findMany({ orderBy: { label: "asc" } }),
    db.positiveEffect.findMany({ orderBy: { label: "asc" } }),
  ]);

  const initialData = reportToFormData(report);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <QuickReportForm
        molecules={molecules}
        claims={claims}
        adverseEffects={adverseEffects}
        positiveEffects={positiveEffects}
        reportId={id}
        initialData={initialData}
        mode="edit"
      />
    </div>
  );
}
