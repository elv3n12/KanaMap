import type {
  AdverseEffect,
  Brand,
  Location,
  MarketingClaim,
  Molecule,
  Product,
  Report,
  ReportAdverseEffect,
  ReportMarketingClaim,
  ReportMolecule,
} from "@prisma/client";
import { maxProofLevel } from "@/lib/proof-level";

export type PublicReport = Report & {
  location: Location;
  product: Product | null;
  brand: Brand | null;
  molecules: (ReportMolecule & { molecule: Molecule })[];
  marketingClaims: (ReportMarketingClaim & { claim: MarketingClaim })[];
  adverseEffects: (ReportAdverseEffect & { effect: AdverseEffect })[];
};

export function serializePublicReport(report: PublicReport) {
  return {
    id: report.id,
    zone: report.location.displayZone,
    countryCode: report.location.countryCode,
    countryName: report.location.countryName,
    city: report.location.city,
    district: report.location.district,
    placeType: report.placeType,
    productName: report.product?.commercialName ?? report.productCommercialName ?? "Produit observé",
    brandName: report.brand?.name ?? report.brandRawName ?? null,
    productType: report.productType,
    observationDate: report.observationDate.toISOString(),
    narrative: report.narrative,
    moderationStatus: report.moderationStatus,
    proofLevel: report.proofLevel,
    publishedAt: report.publishedAt?.toISOString() ?? null,
    molecules: report.molecules.map((item) => ({
      id: item.molecule.id,
      name: item.molecule.name,
      kind: item.kind,
    })),
    marketingClaims: report.marketingClaims.map((item) => item.claim.label),
    adverseEffects: report.adverseEffects.map((item) => item.effect.label),
  };
}

export type ZoneAggregate = {
  location: Location;
  reports: PublicReport[];
};

export function serializeZoneAggregate(
  { location, reports }: ZoneAggregate,
  options?: { viewerUserId?: string },
) {
  const molecules = new Map<string, string>();
  const productTypes = new Set<string>();
  const effects = new Set<string>();
  const statuses = new Set<string>();
  const proofLevels = reports.map((report) => report.proofLevel);

  for (const report of reports) {
    report.molecules.forEach((item) => molecules.set(item.molecule.id, item.molecule.name));
    if (report.productType) productTypes.add(report.productType);
    report.adverseEffects.forEach((item) => effects.add(item.effect.label));
    statuses.add(report.moderationStatus);
  }

  const ownReportIds = options?.viewerUserId
    ? reports.filter((r) => r.createdById === options.viewerUserId).map((r) => r.id)
    : [];

  return {
    locationId: location.id,
    zone: location.displayZone,
    countryCode: location.countryCode,
    countryName: location.countryName,
    city: location.city,
    district: location.district,
    centroidLat: location.centroidLat,
    centroidLng: location.centroidLng,
    reportCount: reports.length,
    molecules: Array.from(molecules.values()),
    productTypes: Array.from(productTypes),
    adverseEffects: Array.from(effects),
    statuses: Array.from(statuses),
    maxProofLevel: maxProofLevel(proofLevels),
    ownReportIds,
  };
}

export type PublicReportPayload = ReturnType<typeof serializePublicReport>;
export type ZonePayload = ReturnType<typeof serializeZoneAggregate>;
