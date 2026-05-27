import {
  EvidenceType,
  FormOfUse,
  MoleculeKind,
  PlaceType,
  PriceMode,
  ProductType,
  ProofLevel,
} from "@prisma/client";
import { z } from "zod";

const optionalDecimal = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? Number(value.replace(",", ".")) : undefined))
  .pipe(z.number().positive().optional());

export const reportSchema = z.object({
  countryCode: z.string().trim().min(2).max(2),
  countryName: z.string().trim().min(2),
  city: z.string().trim().min(2),
  district: z.string().trim().optional(),
  displayZone: z.string().trim().optional(),
  centroidLat: z.coerce.number().min(-90).max(90).optional().or(z.literal("").transform(() => undefined)),
  centroidLng: z.coerce.number().min(-180).max(180).optional().or(z.literal("").transform(() => undefined)),
  exactAddress: z.string().trim().optional(),
  exactLat: z.coerce.number().optional(),
  exactLng: z.coerce.number().optional(),
  placeType: z.nativeEnum(PlaceType),
  placeOtherLabel: z.string().trim().optional(),
  brandRawName: z.string().trim().optional(),
  productCommercialName: z.string().trim().min(1, "Nom commercial obligatoire"),
  productType: z.nativeEnum(ProductType),
  productOtherLabel: z.string().trim().optional(),
  formOfUse: z.nativeEnum(FormOfUse).optional(),
  quantityObserved: optionalDecimal,
  priceObserved: optionalDecimal,
  priceMode: z.nativeEnum(PriceMode).optional(),
  observationDate: z.coerce.date(),
  narrative: z.string().trim().max(5000).optional(),
  proofLevel: z.nativeEnum(ProofLevel).default("L1_TESTIMONY"),
  announcedMoleculeIds: z.array(z.string()).default([]),
  suspectedMoleculeIds: z.array(z.string()).default([]),
  marketingClaimIds: z.array(z.string()).default([]),
  adverseEffectIds: z.array(z.string()).default([]),
});

export const adverseEffectDeclarationSchema = z.object({
  countryCode: z.string().trim().min(2).max(2),
  productNameRaw: z.string().trim().optional(),
  brandNameRaw: z.string().trim().optional(),
  approximatePeriod: z.string().trim().optional(),
  effectDuration: z.string().trim().optional(),
  withdrawalSymptoms: z.string().trim().optional(),
  medicalCare: z.coerce.boolean().default(false),
  wantsContact: z.coerce.boolean().default(false),
  contactEmail: z.string().email().optional().or(z.literal("")),
  narrative: z.string().trim().max(5000).optional(),
  moleculeIds: z.array(z.string()).default([]),
  effectIds: z.array(z.string()).default([]),
});

export const moderationActionSchema = z.object({
  action: z.enum([
    "REQUEST_PROOF",
    "MASK_ADDRESS",
    "CHANGE_PROOF_LEVEL",
    "PUBLISH_LIMITED",
    "PUBLISH",
    "REJECT",
    "ARCHIVE",
    "CONTEST",
    "NOTE",
  ]),
  proofLevel: z.nativeEnum(ProofLevel).optional(),
  notes: z.string().trim().max(3000).optional(),
});

export const contestationSchema = z.object({
  message: z.string().trim().min(10).max(3000),
  turnstileToken: z.string().optional(),
});

export const uploadEvidenceSchema = z.object({
  type: z.nativeEnum(EvidenceType),
  reportId: z.string().optional(),
  declarationId: z.string().optional(),
});

export function formDataArray(formData: FormData, key: string) {
  return formData.getAll(key).map(String).filter(Boolean);
}

export function parseReportFormData(formData: FormData) {
  const city = formData.get("city") as string | null;
  const countryName = formData.get("countryName") as string | null;
  const displayZone = formData.get("displayZone") || (city && countryName ? `${city}, ${countryName}` : undefined);

  return reportSchema.parse({
    countryCode: formData.get("countryCode"),
    countryName,
    city,
    district: formData.get("district") || undefined,
    displayZone,
    centroidLat: formData.get("centroidLat"),
    centroidLng: formData.get("centroidLng"),
    exactAddress: formData.get("exactAddress") || undefined,
    exactLat: formData.get("exactLat") || undefined,
    exactLng: formData.get("exactLng") || undefined,
    placeType: formData.get("placeType"),
    placeOtherLabel: formData.get("placeOtherLabel") || undefined,
    brandRawName: formData.get("brandRawName") || undefined,
    productCommercialName: formData.get("productCommercialName"),
    productType: formData.get("productType"),
    productOtherLabel: formData.get("productOtherLabel") || undefined,
    formOfUse: formData.get("formOfUse") || undefined,
    quantityObserved: formData.get("quantityObserved") || undefined,
    priceObserved: formData.get("priceObserved") || undefined,
    priceMode: formData.get("priceMode") || undefined,
    observationDate: formData.get("observationDate"),
    narrative: formData.get("narrative") || undefined,
    proofLevel: formData.get("proofLevel") || "L1_TESTIMONY",
    announcedMoleculeIds: formDataArray(formData, "announcedMoleculeIds"),
    suspectedMoleculeIds: formDataArray(formData, "suspectedMoleculeIds"),
    marketingClaimIds: formDataArray(formData, "marketingClaimIds"),
    adverseEffectIds: formDataArray(formData, "adverseEffectIds"),
  });
}

export function moleculeConnections(announced: string[], suspected: string[]) {
  return [
    ...announced.map((moleculeId) => ({ moleculeId, kind: MoleculeKind.ANNOUNCED })),
    ...suspected.map((moleculeId) => ({ moleculeId, kind: MoleculeKind.SUSPECTED })),
  ];
}
