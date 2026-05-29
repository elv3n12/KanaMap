import type {
  AdverseEffect,
  FormOfUse,
  MarketingClaim,
  Molecule,
  PlaceType,
  PositiveEffect,
  ProductType,
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
  productCommercialName: string;
  productType: ProductType;
  observationDate: string;
  primaryMoleculeId?: string;
  primaryMoleculeCustom?: string;
  consumed: boolean | null;
  formOfUse?: FormOfUse;
  positiveEffectIds: string[];
  adverseEffectIds: string[];
  goodFaithConfirmed: boolean;
};

export const defaultDeclarationData = (): DeclarationData => ({
  countryCode: "FR",
  countryName: "France",
  city: "",
  placeType: "CBD_SHOP",
  productCommercialName: "",
  productType: "OTHER",
  observationDate: new Date().toISOString().slice(0, 10),
  consumed: null,
  positiveEffectIds: [],
  adverseEffectIds: [],
  goodFaithConfirmed: false,
});

export type LookupProps = {
  molecules: Molecule[];
  claims: MarketingClaim[];
  adverseEffects: AdverseEffect[];
  positiveEffects: PositiveEffect[];
};

export const WIZARD_DRAFT_KEY = "kanamap-wizard-draft";
