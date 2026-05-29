import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { serializePublicReport } from "@/lib/report-serializers";
import { parseReportUpdateJson, validateCatalogIdsForUpdate } from "@/server/schemas/report";

type Params = { params: Promise<{ id: string }> };

const includeReport = {
  location: true,
  product: true,
  brand: true,
  molecules: { include: { molecule: true } },
  marketingClaims: { include: { claim: true } },
  adverseEffects: { include: { effect: true } },
  positiveEffects: { include: { effect: true } },
} as const;

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  const report = await db.report.findUnique({
    where: { id },
    include: includeReport,
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const isOwner = Boolean(session?.user?.id && report.createdById === session.user.id);
  if (report.moderationStatus !== "PUBLISHED" && !isOwner) {
    return NextResponse.json({ error: "Report not published" }, { status: 404 });
  }

  return NextResponse.json({
    report: serializePublicReport(report),
    isOwner: Boolean(isOwner),
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.report.findUnique({
    where: { id },
    include: {
      molecules: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const parsed = parseReportUpdateJson(await request.json());

    const invalid = await validateCatalogIdsForUpdate({
      adverseEffectIds: parsed.adverseEffectIds ?? [],
      positiveEffectIds: parsed.positiveEffectIds ?? [],
    });
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: "Unknown catalog identifiers.", invalid },
        { status: 422 },
      );
    }

    const consumed = parsed.consumed ?? existing.consumed;
    const bought = consumed ? true : existing.bought;

    await db.$transaction(async (tx) => {
      await tx.report.update({
        where: { id },
        data: {
          placeType: parsed.placeType ?? existing.placeType,
          placeOtherLabel: parsed.placeOtherLabel ?? null,
          productType: parsed.productType ?? existing.productType,
          consumed,
          bought,
          formOfUse: consumed ? (parsed.formOfUse ?? existing.formOfUse) : null,
        },
      });

      if (parsed.positiveEffectIds !== undefined || !consumed) {
        await tx.reportPositiveEffect.deleteMany({ where: { reportId: id } });
        const ids = consumed ? (parsed.positiveEffectIds ?? []) : [];
        if (ids.length > 0) {
          await tx.reportPositiveEffect.createMany({
            data: ids.map((effectId) => ({ reportId: id, effectId })),
          });
        }
      }

      if (parsed.adverseEffectIds !== undefined || !consumed) {
        await tx.reportAdverseEffect.deleteMany({ where: { reportId: id } });
        const ids = consumed ? (parsed.adverseEffectIds ?? []) : [];
        if (ids.length > 0) {
          await tx.reportAdverseEffect.createMany({
            data: ids.map((effectId) => ({ reportId: id, effectId })),
          });
        }
      }
    });

    const report = await db.report.findUnique({
      where: { id },
      include: includeReport,
    });

    return NextResponse.json({ report: report ? serializePublicReport(report) : null });
  } catch (err) {
    console.error("[report.patch]", err);
    return NextResponse.json({ error: "Invalid update payload" }, { status: 422 });
  }
}
