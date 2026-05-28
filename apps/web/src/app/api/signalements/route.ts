import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { geocodeAddress } from "@/lib/geocode";
import { scrubPublicText, sanitizeReportInput } from "@/lib/anonymize";
import { getIpFromRequest, hashIp } from "@/lib/security";
import { encryptPII } from "@/lib/crypto";
import { rateLimit, RateLimitPolicies } from "@/lib/rate-limit";
import { serializePublicReport } from "@/lib/report-serializers";
import {
  buildReportNarrative,
  moleculeConnections,
  parseReportFormData,
  parseReportJson,
} from "@/server/schemas/report";

export const runtime = "nodejs";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function validateCatalogIds(input: {
  moleculeIds: string[];
  marketingClaimIds: string[];
  adverseEffectIds: string[];
  positiveEffectIds: string[];
}): Promise<string[]> {
  const unique = {
    molecule: Array.from(new Set(input.moleculeIds.filter(Boolean))),
    marketingClaim: Array.from(new Set(input.marketingClaimIds.filter(Boolean))),
    adverseEffect: Array.from(new Set(input.adverseEffectIds.filter(Boolean))),
    positiveEffect: Array.from(new Set(input.positiveEffectIds.filter(Boolean))),
  };

  const [moleculeCount, claimCount, adverseCount, positiveCount] = await Promise.all([
    unique.molecule.length
      ? db.molecule.count({ where: { id: { in: unique.molecule } } })
      : Promise.resolve(0),
    unique.marketingClaim.length
      ? db.marketingClaim.count({ where: { id: { in: unique.marketingClaim } } })
      : Promise.resolve(0),
    unique.adverseEffect.length
      ? db.adverseEffect.count({ where: { id: { in: unique.adverseEffect } } })
      : Promise.resolve(0),
    unique.positiveEffect.length
      ? db.positiveEffect.count({ where: { id: { in: unique.positiveEffect } } })
      : Promise.resolve(0),
  ]);

  const invalid: string[] = [];
  if (moleculeCount !== unique.molecule.length) invalid.push("moleculeIds");
  if (claimCount !== unique.marketingClaim.length) invalid.push("marketingClaimIds");
  if (adverseCount !== unique.adverseEffect.length) invalid.push("adverseEffectIds");
  if (positiveCount !== unique.positiveEffect.length) invalid.push("positiveEffectIds");
  return invalid;
}

async function ensureMoleculesByName(names: string[]) {
  const clean = Array.from(
    new Map(
      names
        .map((n) => n.trim())
        .filter(Boolean)
        .map((n) => [n.toLowerCase(), n] as const),
    ).values(),
  );
  if (clean.length === 0) return [];

  const existing = await db.molecule.findMany({
    where: { name: { in: clean } },
    select: { id: true, name: true },
  });
  const existingByLower = new Map(existing.map((m) => [m.name.toLowerCase(), m.id] as const));

  const ids: string[] = [];
  const toCreate: string[] = [];
  for (const name of clean) {
    const id = existingByLower.get(name.toLowerCase());
    if (id) ids.push(id);
    else toCreate.push(name);
  }
  if (toCreate.length === 0) return ids;

  // Batch upserts in a single transaction: bounded by reportSchema max(10) per list,
  // so this is at most 20 round-trips per request (down from N sequential awaits).
  const created = await db.$transaction(
    toCreate.map((name) =>
      db.molecule.upsert({
        where: { slug: slugify(name) },
        update: { name },
        create: { name, slug: slugify(name) },
        select: { id: true },
      }),
    ),
  );
  for (const row of created) ids.push(row.id);

  return ids;
}

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

  const limit = rateLimit(`report:${session.user.id}`, RateLimitPolicies.reportSubmit);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Trop de signalements envoyés récemment. Réessayez plus tard." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSec),
          "X-RateLimit-Reset": String(Math.floor(limit.resetAt / 1000)),
        },
      },
    );
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    const parsed = contentType.includes("application/json")
      ? parseReportJson(await request.json())
      : parseReportFormData(await request.formData());

    const sanitized = sanitizeReportInput(parsed);

    const [announcedFromNames, suspectedFromNames] = await Promise.all([
      ensureMoleculesByName(parsed.announcedMoleculeNames ?? []),
      ensureMoleculesByName(parsed.suspectedMoleculeNames ?? []),
    ]);
    const announcedIds = Array.from(
      new Set([...(parsed.announcedMoleculeIds ?? []), ...announcedFromNames]),
    );
    const suspectedIds = Array.from(
      new Set([...(parsed.suspectedMoleculeIds ?? []), ...suspectedFromNames]),
    );

    const invalidCatalogFields = await validateCatalogIds({
      moleculeIds: [...announcedIds, ...suspectedIds],
      marketingClaimIds: parsed.marketingClaimIds,
      adverseEffectIds: parsed.adverseEffectIds,
      positiveEffectIds: parsed.positiveEffectIds,
    });
    if (invalidCatalogFields.length > 0) {
      return NextResponse.json(
        {
          error: "Identifiants inconnus dans le catalogue.",
          invalid: invalidCatalogFields,
        },
        { status: 422 },
      );
    }

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
        exactAddressEncrypted: sanitized.exactAddress ? encryptPII(sanitized.exactAddress) : null,
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
          parsed.wantsContact && parsed.contactEmail ? encryptPII(parsed.contactEmail) : null,
        molecules: { create: moleculeConnections(announcedIds, suspectedIds) },
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

    return NextResponse.json(
      { report: serializePublicReport(report), consumed: parsed.consumed },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation invalide.", issues: err.flatten() },
        { status: 422 },
      );
    }

    const errorId = randomUUID();
    console.error(`[report.submit ${errorId}]`, err);
    try {
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          ipHash: hashIp(getIpFromRequest(request)),
          action: "report.submit.error",
          targetType: "report",
          targetId: errorId,
        },
      });
    } catch (auditErr) {
      console.error(`[report.submit ${errorId}] failed to write audit log`, auditErr);
    }
    return NextResponse.json(
      { error: "Erreur interne. Réessayez plus tard.", errorId },
      { status: 500 },
    );
  }
}
