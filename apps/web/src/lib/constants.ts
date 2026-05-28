import type {
  ClaimMatch,
  EvidenceType,
  FormOfUse,
  InformationSource,
  PlaceType,
  ProductType,
  ProofLevel,
  ReportStatus,
} from "@prisma/client";

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  CBD_SHOP: "CBD shop",
  TOBACCO: "Tobacco store",
  ESHOP: "E-shop",
  VENDING_MACHINE: "Vending machine",
  SOCIAL_NETWORK: "Social network",
  INFORMAL_MARKET: "Informal market",
  EVENT: "Event",
  OTHER: "Other",
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  FLOWER: "Flower",
  RESIN: "Resin",
  VAPE: "Vape",
  CARTRIDGE: "Cartridge",
  LIQUID: "Liquid",
  CANDY: "Candy",
  OIL: "Oil",
  CAPSULE: "Capsule",
  POWDER: "Powder",
  SPRAY: "Spray",
  OTHER: "Other",
};

export const FORM_OF_USE_LABELS: Record<FormOfUse, string> = {
  INHALATION: "Inhalation",
  DABBING: "Dabbing",
  PIPE: "Pipe",
  WATER_PIPE: "Water pipe",
  INFUSION: "Infusion",
  INGESTION: "Ingestion",
  OTHER: "Other",
};

export const PROOF_LEVEL_LABELS: Record<ProofLevel, string> = {
  L1_TESTIMONY: "To be verified",
  L2_VISUAL: "Partially documented",
  L3_COMMERCIAL_DOC: "Commercial documentation",
  L4_LAB_ANALYSIS: "Lab analysis available",
  L5_SANITARY_SIGNAL: "Associated health signal",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PENDING_REVIEW: "Pending review",
  PUBLISHED_LIMITED: "Published (limited)",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  CONTESTED: "Contested",
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  PHOTO_PACKAGING: "Packaging photo",
  SCREENSHOT: "Screenshot",
  RECEIPT_LABEL: "Receipt or label",
  COMMERCIAL_LISTING: "Commercial listing",
  LAB_RESULT: "Independent lab analysis",
  OTHER: "Other evidence",
};

export const PLACE_TYPES = Object.keys(PLACE_TYPE_LABELS) as PlaceType[];
export const PRODUCT_TYPES = Object.keys(PRODUCT_TYPE_LABELS) as ProductType[];
export const FORM_OF_USE_TYPES = Object.keys(FORM_OF_USE_LABELS) as FormOfUse[];
export const PROOF_LEVELS = Object.keys(PROOF_LEVEL_LABELS) as ProofLevel[];

export const DRUGS_INFO_SERVICE_PHONE = "0 800 23 13 13";
export const EMERGENCY_PHONE_FR = "15";
export const EMERGENCY_PHONE_EU = "112";

export const INFORMATION_SOURCE_LABELS: Record<InformationSource, string> = {
  VENDOR: "The vendor",
  POSTER: "An in-store poster",
  DISPLAY: "Display or storefront",
  PRODUCT_LABEL: "Label or packaging",
  WEBSITE: "Website or e-shop",
  WORD_OF_MOUTH: "Word of mouth",
  OTHER: "Other",
};

export const CLAIM_MATCH_LABELS: Record<ClaimMatch, string> = {
  EXACT: "Yes, exactly as advertised",
  PARTIAL: "Partially",
  NONE: "Not at all",
  NO_CLAIM_RECEIVED: "No claim received",
};

export const REASON_NOT_BOUGHT_OPTIONS = [
  "Too expensive",
  "Lack of trust in the product",
  "Lack of trust in the seller",
  "Suspicious smell or appearance",
  "Suspicious packaging or labeling",
  "Received information / prevention",
  "Availability or stock",
  "Other",
] as const;

export const REASON_NOT_CONSUMED_OPTIONS = [
  "Reserved for later",
  "Doubts after purchase",
  "Received advice or information after purchase",
  "Heard about negative effects",
  "Given to someone else",
  "Discarded",
  "Other",
] as const;

export const EUROPEAN_COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "LU", name: "Luxembourg" },
  { code: "NL", name: "Netherlands" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "IT", name: "Italy" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "AT", name: "Austria" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "FI", name: "Finland" },
  { code: "GR", name: "Greece" },
  { code: "RO", name: "Romania" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "HU", name: "Hungary" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "EE", name: "Estonia" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "MT", name: "Malta" },
  { code: "CY", name: "Cyprus" },
] as const;
