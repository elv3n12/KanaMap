import type {
  AdverseEffect,
  ClaimMatch,
  FormOfUse,
  InformationSource,
  MarketingClaim,
  Molecule,
  PlaceType,
  PositiveEffect,
  ProductType,
  ProofLevel,
} from "@prisma/client";

export type CitySuggestion = {
  name: string;
  state?: string;
  postcode?: string;
  lat: number;
  lng: number;
  displayName: string;
};

export type DeclarationData = {
  countryCode: string;
  countryName: string;
  city: string;
  centroidLat?: number;
  centroidLng?: number;
  displayZone?: string;
  placeType: PlaceType;
  placeOtherLabel?: string;
  brandRawName?: string;
  productCommercialName: string;
  productType: ProductType;
  observationDate: string;
  primaryMoleculeId?: string;
  primaryMoleculeCustom?: string;
  suspectedMoleculeIds: string[];
  suspectedMoleculeCustomNames: string[];
  informationSource?: InformationSource;
  marketingClaimIds: string[];
  bought: boolean | null;
  reasonNotBought?: string;
  reasonNotBoughtOther?: string;
  consumed: boolean | null;
  reasonNotConsumed?: string;
  reasonNotConsumedOther?: string;
  formOfUse?: FormOfUse;
  approximatePeriod?: string;
  effectDuration?: string;
  positiveEffectIds: string[];
  positiveEffectsCustom?: string;
  adverseEffectIds: string[];
  adverseEffectsCustom?: string;
  withdrawalSymptoms?: string;
  medicalCare: boolean;
  effectsMatchClaim?: ClaimMatch;
  narrative?: string;
  proofLevel: ProofLevel;
  wantsContact: boolean | null;
  contactEmail?: string;
};

export const defaultDeclarationData = (): DeclarationData => ({
  countryCode: "FR",
  countryName: "France",
  city: "",
  placeType: "CBD_SHOP",
  productCommercialName: "",
  productType: "VAPE",
  observationDate: new Date().toISOString().slice(0, 10),
  suspectedMoleculeIds: [],
  suspectedMoleculeCustomNames: [],
  marketingClaimIds: [],
  bought: null,
  consumed: null,
  positiveEffectIds: [],
  adverseEffectIds: [],
  medicalCare: false,
  proofLevel: "L1_TESTIMONY",
  wantsContact: null,
});

export type WizardStepId =
  | "location"
  | "product"
  | "substance"
  | "purchase"
  | "consumption"
  | "formOfUse"
  | "positiveEffects"
  | "negativeEffects"
  | "claimMatch"
  | "evidence"
  | "contact"
  | "review"
  | "confirmation";

export type LookupProps = {
  molecules: Molecule[];
  claims: MarketingClaim[];
  adverseEffects: AdverseEffect[];
  positiveEffects: PositiveEffect[];
};

export const WIZARD_DRAFT_KEY = "kanamap-wizard-draft";

export function getStepSequence(data: DeclarationData): WizardStepId[] {
  const steps: WizardStepId[] = ["location", "product", "substance", "purchase"];
  if (data.bought === false) {
    steps.push("evidence", "review");
    return steps;
  }
  if (data.bought !== true) return steps;
  steps.push("consumption");
  if (data.consumed === false) {
    steps.push("evidence", "review");
    return steps;
  }
  if (data.consumed !== true) return steps;
  steps.push(
    "formOfUse",
    "positiveEffects",
    "negativeEffects",
    "claimMatch",
    "evidence",
    "contact",
    "review",
  );
  return steps;
}

export const STEP_TITLES: Record<WizardStepId, { title: string; subtitle: string }> = {
  location: {
    title: "Où avez-vous observé ce point de vente ?",
    subtitle: "Indiquez le pays, la ville et le type de commerce. Aucune adresse exacte n’est demandée.",
  },
  product: {
    title: "Quel produit avez-vous observé ?",
    subtitle: "Marque, nom commercial et type de produit tels qu’affichés ou annoncés.",
  },
  substance: {
    title: "Substance active et source d’information",
    subtitle: "Ce que le vendeur ou le support commercial a indiqué.",
  },
  purchase: {
    title: "Avez-vous acheté ce produit ?",
    subtitle: "Cette information aide à comprendre le parcours d’exposition.",
  },
  consumption: {
    title: "Avez-vous consommé ce produit ?",
    subtitle: "Si oui, nous vous poserons quelques questions sur les effets ressentis.",
  },
  formOfUse: {
    title: "Comment avez-vous consommé ?",
    subtitle: "Forme d’usage et période approximative.",
  },
  positiveEffects: {
    title: "Effets ressentis comme positifs",
    subtitle: "Sélectionnez tout ce qui s’applique, ou précisez autre chose.",
  },
  negativeEffects: {
    title: "Effets indésirables ou négatifs",
    subtitle: "Cochez les symptômes ressentis. En cas de malaise actuel, les numéros d’urgence figurent à la fin.",
  },
  claimMatch: {
    title: "Les effets correspondaient-ils aux promesses ?",
    subtitle: "Par rapport à ce que le vendeur ou l’emballage annonçait.",
  },
  evidence: {
    title: "Compléments et niveau de preuve",
    subtitle: "Récit libre, date d’observation déjà renseignée, et éléments dont vous disposez.",
  },
  contact: {
    title: "Souhaitez-vous être recontacté ?",
    subtitle: "Facultatif. Votre email reste réservé à la modération.",
  },
  review: {
    title: "Vérifiez votre déclaration",
    subtitle: "Relisez les informations avant envoi.",
  },
  confirmation: {
    title: "Déclaration enregistrée",
    subtitle: "",
  },
};
