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
export const EMERGENCY_PHONE_FR = "15";
export const EMERGENCY_PHONE_EU = "112";

export const INFORMATION_SOURCE_LABELS: Record<InformationSource, string> = {
  VENDOR: "Le vendeur",
  POSTER: "Une affiche en magasin",
  DISPLAY: "Le présentoir ou la vitrine",
  PRODUCT_LABEL: "L'étiquette ou l'emballage",
  WEBSITE: "Le site web ou e-shop",
  WORD_OF_MOUTH: "Bouche à oreille",
  OTHER: "Autre",
};

export const CLAIM_MATCH_LABELS: Record<ClaimMatch, string> = {
  EXACT: "Oui, exactement comme annoncé",
  PARTIAL: "Partiellement",
  NONE: "Pas du tout",
  NO_CLAIM_RECEIVED: "Aucune allégation reçue",
};

export const REASON_NOT_BOUGHT_OPTIONS = [
  "Trop cher",
  "Manque de confiance dans le produit",
  "Manque de confiance dans le vendeur",
  "Odeur ou aspect suspect",
  "Présentation suspecte (étiquette, emballage)",
  "Information / prévention reçue",
  "Disponibilité ou stock",
  "Autre",
] as const;

export const REASON_NOT_CONSUMED_OPTIONS = [
  "Réservé pour plus tard",
  "Doute après achat",
  "Conseil ou information reçue après achat",
  "Effets négatifs entendus",
  "Donné à quelqu'un d'autre",
  "Jeté",
  "Autre",
] as const;

export const EUROPEAN_COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "DE", name: "Allemagne" },
  { code: "BE", name: "Belgique" },
  { code: "CH", name: "Suisse" },
  { code: "LU", name: "Luxembourg" },
  { code: "NL", name: "Pays-Bas" },
  { code: "ES", name: "Espagne" },
  { code: "PT", name: "Portugal" },
  { code: "IT", name: "Italie" },
  { code: "GB", name: "Royaume-Uni" },
  { code: "IE", name: "Irlande" },
  { code: "AT", name: "Autriche" },
  { code: "PL", name: "Pologne" },
  { code: "CZ", name: "Tchéquie" },
  { code: "DK", name: "Danemark" },
  { code: "SE", name: "Suède" },
  { code: "NO", name: "Norvège" },
  { code: "FI", name: "Finlande" },
  { code: "GR", name: "Grèce" },
  { code: "RO", name: "Roumanie" },
  { code: "BG", name: "Bulgarie" },
  { code: "HR", name: "Croatie" },
  { code: "HU", name: "Hongrie" },
  { code: "SK", name: "Slovaquie" },
  { code: "SI", name: "Slovénie" },
  { code: "EE", name: "Estonie" },
  { code: "LV", name: "Lettonie" },
  { code: "LT", name: "Lituanie" },
  { code: "MT", name: "Malte" },
  { code: "CY", name: "Chypre" },
] as const;
