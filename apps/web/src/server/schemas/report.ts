import {
  ClaimMatch,
  EvidenceType,
  FormOfUse,
  InformationSource,
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

const boolField = z.union([
  z.boolean(),
  z.literal("true").transform(() => true),
  z.literal("false").transform(() => false),
  z.literal("on").transform(() => true),
]);

export const reportSchema = z
  .object({
    countryCode: z.string().trim().min(2).max(2),
    countryName: z.string().trim().min(2),
    city: z.string().trim().min(2),
    district: z.string().trim().optional(),
    displayZone: z.string().trim().optional(),
    centroidLat: z.coerce
      .number()
      .min(-90)
      .max(90)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    centroidLng: z.coerce
      .number()
      .min(-180)
      .max(180)
      .optional()
      .or(z.literal("").transform(() => undefined)),
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
    positiveEffectIds: z.array(z.string()).default([]),
    positiveEffectsCustom: z.string().trim().max(500).optional(),
    adverseEffectsCustom: z.string().trim().max(500).optional(),
    bought: boolField.default(false),
    consumed: boolField.default(false),
    informationSource: z.nativeEnum(InformationSource).optional(),
    reasonNotBought: z.string().trim().max(2000).optional(),
    reasonNotConsumed: z.string().trim().max(2000).optional(),
    effectsMatchClaim: z.nativeEnum(ClaimMatch).optional(),
    approximatePeriod: z.string().trim().max(120).optional(),
    effectDuration: z.string().trim().max(120).optional(),
    withdrawalSymptoms: z.string().trim().max(2000).optional(),
    medicalCare: boolField.default(false),
    wantsContact: boolField.default(false),
    contactEmail: z.string().email().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.consumed && !data.bought) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation suppose un achat.",
        path: ["consumed"],
      });
    }
    if (data.reasonNotBought && data.bought) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Raison incompatible avec un achat.",
        path: ["reasonNotBought"],
      });
    }
    if (data.reasonNotConsumed && (!data.bought || data.consumed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Raison valable seulement si achat sans consommation.",
        path: ["reasonNotConsumed"],
      });
    }
    if (data.consumed) {
      if (!data.formOfUse) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indiquez la forme de consommation.",
          path: ["formOfUse"],
        });
      }
      if (!data.effectsMatchClaim) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indiquez si les effets correspondent aux promesses.",
          path: ["effectsMatchClaim"],
        });
      }
    }
    if (data.wantsContact && !data.contactEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email requis pour être recontacté.",
        path: ["contactEmail"],
      });
    }
  });

export type ReportInput = z.infer<typeof reportSchema>;

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
    "DELETE",
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

function readBool(formData: FormData, key: string) {
  const value = formData.get(key);
  if (value === "true" || value === "on") return true;
  if (value === "false") return false;
  return false;
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
    positiveEffectIds: formDataArray(formData, "positiveEffectIds"),
    positiveEffectsCustom: formData.get("positiveEffectsCustom") || undefined,
    adverseEffectsCustom: formData.get("adverseEffectsCustom") || undefined,
    bought: readBool(formData, "bought"),
    consumed: readBool(formData, "consumed"),
    informationSource: formData.get("informationSource") || undefined,
    reasonNotBought: formData.get("reasonNotBought") || undefined,
    reasonNotConsumed: formData.get("reasonNotConsumed") || undefined,
    effectsMatchClaim: formData.get("effectsMatchClaim") || undefined,
    approximatePeriod: formData.get("approximatePeriod") || undefined,
    effectDuration: formData.get("effectDuration") || undefined,
    withdrawalSymptoms: formData.get("withdrawalSymptoms") || undefined,
    medicalCare: readBool(formData, "medicalCare"),
    wantsContact: readBool(formData, "wantsContact"),
    contactEmail: formData.get("contactEmail") || undefined,
  });
}

export function parseReportJson(body: unknown) {
  return reportSchema.parse(body);
}

export function moleculeConnections(announced: string[], suspected: string[]) {
  return [
    ...announced.map((moleculeId) => ({ moleculeId, kind: MoleculeKind.ANNOUNCED })),
    ...suspected.map((moleculeId) => ({ moleculeId, kind: MoleculeKind.SUSPECTED })),
  ];
}

export function buildReportNarrative(parsed: ReportInput) {
  const sections: string[] = [];
  if (parsed.narrative?.trim()) sections.push(parsed.narrative.trim());
  if (parsed.positiveEffectsCustom?.trim()) {
    sections.push(`Effets positifs (autre) : ${parsed.positiveEffectsCustom.trim()}`);
  }
  if (parsed.adverseEffectsCustom?.trim()) {
    sections.push(`Effets négatifs (autre) : ${parsed.adverseEffectsCustom.trim()}`);
  }
  return sections.length ? sections.join("\n\n") : undefined;
}
