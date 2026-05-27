import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { geocodeAddress } from "@/lib/geocode";
import { scrubPublicText, sanitizeReportInput } from "@/lib/anonymize";
import { getIpFromRequest, hashIp } from "@/lib/security";
import { serializePublicReport } from "@/lib/report-serializers";
import {
  buildReportNarrative,
  moleculeConnections,
  parseReportFormData,
  parseReportJson,
} from "@/server/schemas/report";

export const runtime = "nodejs";

const includeReport = {
  location: true,
  product: true,
  brand: true,
  molecules: { include: { molecule: true } },
  marketingClaims: { include: { claim: true } },
  adverseEffects: { include: { effect: true } },
  positiveEffects: { include: { effect: true } },
} as const;

export async function GET() {
  const reports = await db.report.findMany({
    where: { moderationStatus: "PUBLISHED" },
    include: includeReport,
    orderBy: { observationDate: "desc" },
    take: 100,
  });

  return NextResponse.json({ reports: reports.map(serializePublicReport) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const parsed =
    contentType.includes("application/json")
      ? parseReportJson(await request.json())
      : parseReportFormData(await request.formData());

  const sanitized = sanitizeReportInput(parsed);

  let centroidLat = parsed.centroidLat;
  let centroidLng = parsed.centroidLng;

  if (centroidLat == null || centroidLng == null) {
    try {
      const geo = await geocodeAddress(`${parsed.city}, ${parsed.countryName}`);
      centroidLat = geo.lat;
      centroidLng = geo.lng;
    } catch {
      return NextResponse.json(
        { error: "Impossible de géolocaliser la ville. Veuillez réessayer." },
        { status: 422 },
      );
    }
  }

  const displayZone = parsed.displayZone ?? `${parsed.city}, ${parsed.countryName}`;
  const narrative = buildReportNarrative(parsed);

  const location = await db.location.upsert({
    where: {
      countryCode_city_district: {
        countryCode: parsed.countryCode,
        city: parsed.city,
        district: parsed.district ?? "",
      },
    },
    update: {
      countryName: parsed.countryName,
      displayZone,
      centroidLat,
      centroidLng,
    },
    create: {
      countryCode: parsed.countryCode,
      countryName: parsed.countryName,
      city: parsed.city,
      district: parsed.district ?? "",
      displayZone,
      centroidLat,
      centroidLng,
    },
  });

  const report = await db.report.create({
    data: {
      createdById: session.user.id,
      locationId: location.id,
      placeType: parsed.placeType,
      placeOtherLabel: scrubPublicText(parsed.placeOtherLabel),
      brandRawName: scrubPublicText(parsed.brandRawName),
      productCommercialName: scrubPublicText(parsed.productCommercialName),
      productType: parsed.productType,
      productOtherLabel: scrubPublicText(parsed.productOtherLabel),
      formOfUse: parsed.consumed ? parsed.formOfUse : undefined,
      quantityObserved: parsed.quantityObserved,
      priceObserved: parsed.priceObserved,
      priceMode: parsed.priceMode,
      observationDate: parsed.observationDate,
      narrative: scrubPublicText(narrative),
      moderationStatus: "PUBLISHED",
      publishedAt: new Date(),
      proofLevel: parsed.proofLevel,
      exactAddressEncrypted: sanitized.exactAddress ? Buffer.from(sanitized.exactAddress).toString("base64") : null,
      exactLat: sanitized.exactLat,
      exactLng: sanitized.exactLng,
      bought: parsed.bought,
      consumed: parsed.consumed,
      informationSource: parsed.informationSource,
      reasonNotBought: scrubPublicText(parsed.reasonNotBought),
      reasonNotConsumed: scrubPublicText(parsed.reasonNotConsumed),
      effectsMatchClaim: parsed.consumed ? parsed.effectsMatchClaim : undefined,
      approximatePeriod: scrubPublicText(parsed.approximatePeriod),
      effectDuration: scrubPublicText(parsed.effectDuration),
      withdrawalSymptoms: scrubPublicText(parsed.withdrawalSymptoms),
      medicalCare: parsed.medicalCare,
      wantsContact: parsed.wantsContact,
      contactEmailEncrypted:
        parsed.wantsContact && parsed.contactEmail
          ? Buffer.from(parsed.contactEmail).toString("base64")
          : null,
      molecules: { create: moleculeConnections(parsed.announcedMoleculeIds, parsed.suspectedMoleculeIds) },
      marketingClaims: { create: parsed.marketingClaimIds.map((claimId) => ({ claimId })) },
      adverseEffects: { create: parsed.adverseEffectIds.map((effectId) => ({ effectId })) },
      positiveEffects: { create: parsed.positiveEffectIds.map((effectId) => ({ effectId })) },
      moderationActions: {
        create: {
          moderatorId: session.user.id,
          action: "SUBMIT",
          afterStatus: "PUBLISHED",
          notes: "Signalement publié à la soumission (modération a posteriori).",
        },
      },
    },
    include: includeReport,
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      ipHash: hashIp(getIpFromRequest(request)),
      action: "report.submit",
      targetType: "report",
      targetId: report.id,
    },
  });

  return NextResponse.json({ report: serializePublicReport(report), consumed: parsed.consumed }, { status: 201 });
}
