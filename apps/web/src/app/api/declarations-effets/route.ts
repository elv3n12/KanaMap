import { NextResponse } from "next/server";
import { MoleculeKind } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { scrubPublicText } from "@/lib/anonymize";
import { getIpFromRequest, hashIp } from "@/lib/security";
import { adverseEffectDeclarationSchema, formDataArray } from "@/server/schemas/report";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = adverseEffectDeclarationSchema.parse({
    countryCode: formData.get("countryCode"),
    productNameRaw: formData.get("productNameRaw") || undefined,
    brandNameRaw: formData.get("brandNameRaw") || undefined,
    approximatePeriod: formData.get("approximatePeriod") || undefined,
    effectDuration: formData.get("effectDuration") || undefined,
    withdrawalSymptoms: formData.get("withdrawalSymptoms") || undefined,
    medicalCare: formData.get("medicalCare") === "on",
    wantsContact: formData.get("wantsContact") === "on",
    contactEmail: formData.get("contactEmail") || undefined,
    narrative: formData.get("narrative") || undefined,
    moleculeIds: formDataArray(formData, "moleculeIds"),
    effectIds: formDataArray(formData, "effectIds"),
  });

  const declaration = await db.adverseEffectDeclaration.create({
    data: {
      createdById: session.user.id,
      countryCode: parsed.countryCode,
      productNameRaw: scrubPublicText(parsed.productNameRaw),
      brandNameRaw: scrubPublicText(parsed.brandNameRaw),
      approximatePeriod: scrubPublicText(parsed.approximatePeriod),
      effectDuration: scrubPublicText(parsed.effectDuration),
      withdrawalSymptoms: scrubPublicText(parsed.withdrawalSymptoms),
      medicalCare: parsed.medicalCare,
      wantsContact: parsed.wantsContact,
      contactEmailEncrypted:
        parsed.wantsContact && parsed.contactEmail ? Buffer.from(parsed.contactEmail).toString("base64") : null,
      narrative: scrubPublicText(parsed.narrative),
      moderationStatus: "PENDING_REVIEW",
      molecules: {
        create: parsed.moleculeIds.map((moleculeId) => ({
          moleculeId,
          kind: MoleculeKind.SUSPECTED,
        })),
      },
      effects: { create: parsed.effectIds.map((effectId) => ({ effectId })) },
      moderationActions: {
        create: {
          moderatorId: session.user.id,
          action: "SUBMIT",
          afterStatus: "PENDING_REVIEW",
          notes: "Déclaration d’effet indésirable soumise.",
        },
      },
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      ipHash: hashIp(getIpFromRequest(request)),
      action: "adverse_effect_declaration.submit",
      targetType: "adverse_effect_declaration",
      targetId: declaration.id,
    },
  });

  return NextResponse.json({ declarationId: declaration.id }, { status: 201 });
}
