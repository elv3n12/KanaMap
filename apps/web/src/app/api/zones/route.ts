import { NextResponse } from "next/server";
import { PlaceType, ProductType, ProofLevel, ReportStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { publicStatuses } from "@/lib/moderation";
import { serializeZoneAggregate, type PublicReport } from "@/lib/report-serializers";

const includeReport = {
  location: true,
  product: true,
  brand: true,
  molecules: { include: { molecule: true } },
  marketingClaims: { include: { claim: true } },
  adverseEffects: { include: { effect: true } },
} as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const countryCode = url.searchParams.get("countryCode") || undefined;
  const city = url.searchParams.get("city") || undefined;
  const moleculeId = url.searchParams.get("moleculeId") || undefined; // legacy single-select
  const moleculeIds = (url.searchParams.get("moleculeIds") || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const moleculeNames = (url.searchParams.get("moleculeNames") || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const placeType = (url.searchParams.get("placeType") as PlaceType | null) || undefined;
  const productType = (url.searchParams.get("productType") as ProductType | null) || undefined;
  const proofLevel = (url.searchParams.get("proofLevel") as ProofLevel | null) || undefined;
  const status = (url.searchParams.get("status") as ReportStatus | null) || undefined;
  const effectId = url.searchParams.get("effectId") || undefined;
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const moleculeOr: object[] = [];
  if (moleculeIds.length > 0) {
    moleculeOr.push({ molecules: { some: { moleculeId: { in: moleculeIds } } } });
  } else if (moleculeId) {
    moleculeOr.push({ molecules: { some: { moleculeId } } });
  }
  if (moleculeNames.length > 0) {
    moleculeOr.push({ molecules: { some: { molecule: { name: { in: moleculeNames } } } } });
  }

  const reports = await db.report.findMany({
    where: {
      moderationStatus: status && publicStatuses().includes(status) ? status : { in: publicStatuses() },
      ...(countryCode ? { location: { countryCode } } : {}),
      ...(city ? { location: { city: { contains: city } } } : {}),
      ...(moleculeOr.length > 0 ? { OR: moleculeOr } : {}),
      ...(placeType ? { placeType } : {}),
      ...(productType ? { productType } : {}),
      ...(proofLevel ? { proofLevel } : {}),
      ...(effectId ? { adverseEffects: { some: { effectId } } } : {}),
      ...(from || to
        ? {
            observationDate: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: includeReport,
    orderBy: { observationDate: "desc" },
    take: 1000,
  });

  const byLocation = new Map<string, PublicReport[]>();
  for (const report of reports) {
    const group = byLocation.get(report.locationId) ?? [];
    group.push(report);
    byLocation.set(report.locationId, group);
  }

  const zones = Array.from(byLocation.values()).map((group) =>
    serializeZoneAggregate({ location: group[0].location, reports: group }),
  );

  return NextResponse.json({ zones });
}
