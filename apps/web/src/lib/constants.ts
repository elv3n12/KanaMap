import type {
  EvidenceType,
  FormOfUse,
  PlaceType,
  ProductType,
  ProofLevel,
  ReportStatus,
} from "@prisma/client";

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  CBD_SHOP: "Boutique CBD",
  TOBACCO: "Tabac",
  ESHOP: "E-shop",
  VENDING_MACHINE: "Automate",
  SOCIAL_NETWORK: "Réseau social",
  INFORMAL_MARKET: "Marché informel",
  EVENT: "Événement",
  OTHER: "Autre",
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  FLOWER: "Fleur",
  RESIN: "Résine",
  VAPE: "Vape",
  CARTRIDGE: "Cartouche",
  LIQUID: "Liquide",
  CANDY: "Bonbon",
  OIL: "Huile",
  CAPSULE: "Gélule",
  POWDER: "Poudre",
  SPRAY: "Spray",
  OTHER: "Autre",
};

export const FORM_OF_USE_LABELS: Record<FormOfUse, string> = {
  INHALATION: "Inhalation",
  DABBING: "Dabbing",
  PIPE: "Pipe",
  WATER_PIPE: "Pipe à eau",
  INFUSION: "Infusion",
  INGESTION: "Ingestion",
  OTHER: "Autre",
};

export const PROOF_LEVEL_LABELS: Record<ProofLevel, string> = {
  L1_TESTIMONY: "À vérifier",
  L2_VISUAL: "Documenté partiellement",
  L3_COMMERCIAL_DOC: "Documentation commerciale",
  L4_LAB_ANALYSIS: "Analyse disponible",
  L5_SANITARY_SIGNAL: "Signal sanitaire associé",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumis",
  PENDING_REVIEW: "En attente de vérification",
  PUBLISHED_LIMITED: "Publié en version limitée",
  PUBLISHED: "Publié",
  REJECTED: "Rejeté",
  ARCHIVED: "Archivé",
  CONTESTED: "Contesté",
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  PHOTO_PACKAGING: "Photo d’emballage",
  SCREENSHOT: "Capture d’écran",
  RECEIPT_LABEL: "Ticket ou étiquette",
  COMMERCIAL_LISTING: "Documentation commerciale",
  LAB_RESULT: "Analyse indépendante",
  OTHER: "Autre preuve",
};

export const PLACE_TYPES = Object.keys(PLACE_TYPE_LABELS) as PlaceType[];
export const PRODUCT_TYPES = Object.keys(PRODUCT_TYPE_LABELS) as ProductType[];
export const FORM_OF_USE_TYPES = Object.keys(FORM_OF_USE_LABELS) as FormOfUse[];
export const PROOF_LEVELS = Object.keys(PROOF_LEVEL_LABELS) as ProofLevel[];

export const DRUGS_INFO_SERVICE_PHONE = "0 800 23 13 13";
