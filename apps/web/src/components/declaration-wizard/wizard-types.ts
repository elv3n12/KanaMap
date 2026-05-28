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
    title: "Where did you observe this point of sale?",
    subtitle: "Indicate the country, city, and type of business. No exact address is required.",
  },
  product: {
    title: "What product did you observe?",
    subtitle: "Brand, commercial name, and product type as displayed or advertised.",
  },
  substance: {
    title: "Active substance and source of information",
    subtitle: "What the seller or commercial materials indicated.",
  },
  purchase: {
    title: "Did you purchase this product?",
    subtitle: "This information helps understand the exposure pathway.",
  },
  consumption: {
    title: "Did you consume this product?",
    subtitle: "If yes, we will ask you a few questions about the effects experienced.",
  },
  formOfUse: {
    title: "How did you consume?",
    subtitle: "Form of use and approximate period.",
  },
  positiveEffects: {
    title: "Effects perceived as positive",
    subtitle: "Select all that apply, or specify something else.",
  },
  negativeEffects: {
    title: "Adverse or negative effects",
    subtitle: "Check the symptoms experienced. Emergency numbers are provided at the end if you are currently unwell.",
  },
  claimMatch: {
    title: "Did the effects match the claims?",
    subtitle: "Compared to what the seller or packaging advertised.",
  },
  evidence: {
    title: "Additional details and proof level",
    subtitle: "Free narrative, observation date already entered, and evidence you have.",
  },
  contact: {
    title: "Would you like to be contacted?",
    subtitle: "Optional. Your email is only shared with moderation.",
  },
  review: {
    title: "Review your report",
    subtitle: "Read through the information before submitting.",
  },
  confirmation: {
    title: "Report submitted",
    subtitle: "",
  },
};
