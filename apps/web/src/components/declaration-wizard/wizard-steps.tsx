"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CLAIM_MATCH_LABELS,
  DRUGS_INFO_SERVICE_PHONE,
  EMERGENCY_PHONE_EU,
  EMERGENCY_PHONE_FR,
  EUROPEAN_COUNTRIES,
  FORM_OF_USE_LABELS,
  INFORMATION_SOURCE_LABELS,
  PLACE_TYPE_LABELS,
  PRODUCT_TYPE_LABELS,
  PROOF_LEVEL_LABELS,
  REASON_NOT_BOUGHT_OPTIONS,
  REASON_NOT_CONSUMED_OPTIONS,
} from "@/lib/constants";
import { btnPrimary } from "@/lib/ui/button-classes";
import type { CitySuggestion, DeclarationData, LookupProps } from "./wizard-types";
import {
  CheckboxGrid,
  FieldLabel,
  ReasonSelect,
  SelectInput,
  TextArea,
  TextInput,
  YesNoChoice,
} from "./wizard-ui";

type StepProps = {
  data: DeclarationData;
  onChange: (patch: Partial<DeclarationData>) => void;
  lookups: LookupProps;
};

export function StepLocation({ data, onChange }: StepProps) {
  const [cityQuery, setCityQuery] = useState(data.city);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchCities = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      const res = await fetch(`/api/geocode/cities?q=${encodeURIComponent(query)}&country=${data.countryCode}`);
      if (res.ok) {
        setSuggestions(await res.json());
        setShowSuggestions(true);
      }
    },
    [data.countryCode],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!cityQuery || (data.city === cityQuery && data.centroidLat)) return;
    debounceRef.current = setTimeout(() => void fetchCities(cityQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [cityQuery, data.city, data.centroidLat, fetchCities]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pickCity(city: CitySuggestion) {
    setCityQuery(city.name);
    onChange({
      city: city.name,
      centroidLat: city.lat,
      centroidLng: city.lng,
      displayZone: city.displayName,
    });
    setShowSuggestions(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel htmlFor="country">Pays</FieldLabel>
        <SelectInput
          id="country"
          value={data.countryCode}
          onChange={(e) => {
            const country = EUROPEAN_COUNTRIES.find((c) => c.code === e.target.value);
            onChange({
              countryCode: e.target.value,
              countryName: country?.name ?? "",
              city: "",
              centroidLat: undefined,
              centroidLng: undefined,
            });
            setCityQuery("");
          }}
        >
          {EUROPEAN_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </SelectInput>
      </div>
      <div ref={containerRef} className="relative">
        <FieldLabel htmlFor="city">Ville</FieldLabel>
        <TextInput
          id="city"
          value={cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value);
            onChange({ city: e.target.value, centroidLat: undefined, centroidLng: undefined });
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Commencez à taper le nom de la ville…"
          autoComplete="off"
          required
        />
        {showSuggestions && suggestions.length > 0 ? (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {suggestions.map((s) => (
              <li key={`${s.name}-${s.lat}`}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                  onClick={() => pickCity(s)}
                >
                  {s.name}
                  {s.postcode ? ` (${s.postcode})` : ""}
                  {s.state ? ` — ${s.state}` : ""}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div>
        <FieldLabel htmlFor="placeType">Type de commerce</FieldLabel>
        <SelectInput
          id="placeType"
          value={data.placeType}
          onChange={(e) => onChange({ placeType: e.target.value as DeclarationData["placeType"] })}
        >
          {Object.entries(PLACE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
      </div>
      {data.placeType === "OTHER" ? (
        <div>
          <FieldLabel htmlFor="placeOther">Précision</FieldLabel>
          <TextInput
            id="placeOther"
            value={data.placeOtherLabel ?? ""}
            onChange={(e) => onChange({ placeOtherLabel: e.target.value })}
          />
        </div>
      ) : null}
    </div>
  );
}

export function StepProduct({ data, onChange }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel htmlFor="brand">Marque observée (facultatif)</FieldLabel>
        <TextInput
          id="brand"
          value={data.brandRawName ?? ""}
          onChange={(e) => onChange({ brandRawName: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel htmlFor="productName">Nom commercial du produit</FieldLabel>
        <TextInput
          id="productName"
          value={data.productCommercialName}
          onChange={(e) => onChange({ productCommercialName: e.target.value })}
          required
        />
      </div>
      <div>
        <FieldLabel htmlFor="productType">Type de produit</FieldLabel>
        <SelectInput
          id="productType"
          value={data.productType}
          onChange={(e) => onChange({ productType: e.target.value as DeclarationData["productType"] })}
        >
          {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
      </div>
      <div>
        <FieldLabel htmlFor="observationDate">Date d&apos;observation</FieldLabel>
        <TextInput
          id="observationDate"
          type="date"
          value={data.observationDate}
          onChange={(e) => onChange({ observationDate: e.target.value })}
          required
        />
      </div>
    </div>
  );
}

export function StepSubstance({ data, onChange, lookups }: StepProps) {
  const toggleSuspected = (id: string) => {
    const next = data.suspectedMoleculeIds.includes(id)
      ? data.suspectedMoleculeIds.filter((x) => x !== id)
      : [...data.suspectedMoleculeIds, id];
    onChange({ suspectedMoleculeIds: next });
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel htmlFor="primaryMolecule">Substance active principale</FieldLabel>
        <SelectInput
          id="primaryMolecule"
          value={data.primaryMoleculeId ?? ""}
          onChange={(e) => onChange({ primaryMoleculeId: e.target.value || undefined })}
          required
        >
          <option value="">Choisir une molécule</option>
          {lookups.molecules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </SelectInput>
      </div>
      <div>
        <FieldLabel htmlFor="infoSource">Qui vous a indiqué ce nom ?</FieldLabel>
        <SelectInput
          id="infoSource"
          value={data.informationSource ?? ""}
          onChange={(e) =>
            onChange({ informationSource: e.target.value as DeclarationData["informationSource"] })
          }
          required
        >
          <option value="">Choisir</option>
          {Object.entries(INFORMATION_SOURCE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">Autres molécules suspectées (facultatif)</p>
        <CheckboxGrid
          idPrefix="mol"
          options={lookups.molecules.map((m) => ({ id: m.id, label: m.name }))}
          selected={data.suspectedMoleculeIds}
          onToggle={toggleSuspected}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">Allégations marketing entendues (facultatif)</p>
        <CheckboxGrid
          idPrefix="claim"
          options={lookups.claims.map((c) => ({ id: c.id, label: c.label }))}
          selected={data.marketingClaimIds}
          onToggle={(id) => {
            const next = data.marketingClaimIds.includes(id)
              ? data.marketingClaimIds.filter((x) => x !== id)
              : [...data.marketingClaimIds, id];
            onChange({ marketingClaimIds: next });
          }}
        />
      </div>
    </div>
  );
}

export function StepPurchase({ data, onChange }: StepProps) {
  return (
    <div>
      <YesNoChoice value={data.bought} onChange={(bought) => onChange({ bought, consumed: bought ? data.consumed : null })} />
      {data.bought === false ? (
        <ReasonSelect
          options={REASON_NOT_BOUGHT_OPTIONS}
          value={data.reasonNotBought}
          otherValue={data.reasonNotBoughtOther}
          onChange={(v) => onChange({ reasonNotBought: v })}
          onOtherChange={(v) => onChange({ reasonNotBoughtOther: v })}
        />
      ) : null}
    </div>
  );
}

export function StepConsumption({ data, onChange }: StepProps) {
  return (
    <div>
      <YesNoChoice value={data.consumed} onChange={(consumed) => onChange({ consumed })} />
      {data.consumed === false ? (
        <ReasonSelect
          options={REASON_NOT_CONSUMED_OPTIONS}
          value={data.reasonNotConsumed}
          otherValue={data.reasonNotConsumedOther}
          onChange={(v) => onChange({ reasonNotConsumed: v })}
          onOtherChange={(v) => onChange({ reasonNotConsumedOther: v })}
        />
      ) : null}
    </div>
  );
}

export function StepFormOfUse({ data, onChange }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel htmlFor="formOfUse">Forme de consommation</FieldLabel>
        <SelectInput
          id="formOfUse"
          value={data.formOfUse ?? ""}
          onChange={(e) => onChange({ formOfUse: e.target.value as DeclarationData["formOfUse"] })}
          required
        >
          <option value="">Choisir</option>
          {Object.entries(FORM_OF_USE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
      </div>
      <div>
        <FieldLabel htmlFor="period">Période approximative</FieldLabel>
        <TextInput
          id="period"
          value={data.approximatePeriod ?? ""}
          onChange={(e) => onChange({ approximatePeriod: e.target.value })}
          placeholder="ex. printemps 2026"
        />
      </div>
      <div>
        <FieldLabel htmlFor="duration">Durée des effets</FieldLabel>
        <TextInput
          id="duration"
          value={data.effectDuration ?? ""}
          onChange={(e) => onChange({ effectDuration: e.target.value })}
          placeholder="ex. plusieurs heures"
        />
      </div>
    </div>
  );
}

export function StepPositiveEffects({ data, onChange, lookups }: StepProps) {
  return (
    <div className="space-y-4">
      <CheckboxGrid
        idPrefix="pos"
        options={lookups.positiveEffects.map((e) => ({ id: e.id, label: e.label }))}
        selected={data.positiveEffectIds}
        onToggle={(id) => {
          const next = data.positiveEffectIds.includes(id)
            ? data.positiveEffectIds.filter((x) => x !== id)
            : [...data.positiveEffectIds, id];
          onChange({ positiveEffectIds: next });
        }}
      />
      <div>
        <FieldLabel htmlFor="posOther">Autre effet positif</FieldLabel>
        <TextInput
          id="posOther"
          value={data.positiveEffectsCustom ?? ""}
          onChange={(e) => onChange({ positiveEffectsCustom: e.target.value })}
        />
      </div>
    </div>
  );
}

export function StepNegativeEffects({ data, onChange, lookups }: StepProps) {
  return (
    <div className="space-y-4">
      <CheckboxGrid
        idPrefix="neg"
        options={lookups.adverseEffects.map((e) => ({ id: e.id, label: e.label }))}
        selected={data.adverseEffectIds}
        onToggle={(id) => {
          const next = data.adverseEffectIds.includes(id)
            ? data.adverseEffectIds.filter((x) => x !== id)
            : [...data.adverseEffectIds, id];
          onChange({ adverseEffectIds: next });
        }}
      />
      <div>
        <FieldLabel htmlFor="negOther">Autre effet négatif</FieldLabel>
        <TextInput
          id="negOther"
          value={data.adverseEffectsCustom ?? ""}
          onChange={(e) => onChange({ adverseEffectsCustom: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel htmlFor="withdrawal">Symptômes de sevrage éventuels</FieldLabel>
        <TextArea
          id="withdrawal"
          rows={3}
          value={data.withdrawalSymptoms ?? ""}
          onChange={(e) => onChange({ withdrawalSymptoms: e.target.value })}
        />
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={data.medicalCare}
          onChange={(e) => onChange({ medicalCare: e.target.checked })}
          className="h-4 w-4"
        />
        <span className="text-sm text-slate-800">J&apos;ai eu recours à des soins ou aux urgences</span>
      </label>
    </div>
  );
}

export function StepClaimMatch({ data, onChange }: StepProps) {
  return (
    <div className="space-y-3">
      {Object.entries(CLAIM_MATCH_LABELS).map(([value, label]) => (
        <label
          key={value}
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50"
        >
          <input
            type="radio"
            name="claimMatch"
            checked={data.effectsMatchClaim === value}
            onChange={() => onChange({ effectsMatchClaim: value as DeclarationData["effectsMatchClaim"] })}
          />
          <span className="text-sm text-slate-800">{label}</span>
        </label>
      ))}
    </div>
  );
}

export function StepEvidence({ data, onChange }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel htmlFor="narrative">Description libre (facultatif)</FieldLabel>
        <TextArea
          id="narrative"
          rows={5}
          value={data.narrative ?? ""}
          onChange={(e) => onChange({ narrative: e.target.value })}
          placeholder="Contexte, ambiance du lieu, échanges avec le vendeur…"
        />
      </div>
      <div>
        <FieldLabel htmlFor="proof">Niveau de preuve dont vous disposez</FieldLabel>
        <SelectInput
          id="proof"
          value={data.proofLevel}
          onChange={(e) => onChange({ proofLevel: e.target.value as DeclarationData["proofLevel"] })}
        >
          {Object.entries(PROOF_LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
      </div>
    </div>
  );
}

export function StepContact({ data, onChange }: StepProps) {
  return (
    <div className="space-y-4">
      <YesNoChoice
        value={data.wantsContact}
        onChange={(wantsContact) => onChange({ wantsContact })}
        yesLabel="Oui, me recontacter"
        noLabel="Non"
      />
      {data.wantsContact ? (
        <div>
          <FieldLabel htmlFor="email">Email de contact</FieldLabel>
          <TextInput
            id="email"
            type="email"
            value={data.contactEmail ?? ""}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            required
          />
        </div>
      ) : null}
    </div>
  );
}

export function StepReview({ data, lookups }: { data: DeclarationData; lookups: LookupProps }) {
  const molecule = lookups.molecules.find((m) => m.id === data.primaryMoleculeId);
  const reasonBought =
    data.reasonNotBought === "Autre" ? data.reasonNotBoughtOther : data.reasonNotBought;
  const reasonConsumed =
    data.reasonNotConsumed === "Autre" ? data.reasonNotConsumedOther : data.reasonNotConsumed;

  return (
    <dl className="space-y-3 text-sm">
      <div>
        <dt className="font-medium text-slate-500">Lieu</dt>
        <dd>
          {data.city}, {data.countryName} — {PLACE_TYPE_LABELS[data.placeType]}
        </dd>
      </div>
      <div>
        <dt className="font-medium text-slate-500">Produit</dt>
        <dd>{data.productCommercialName}</dd>
      </div>
      <div>
        <dt className="font-medium text-slate-500">Substance</dt>
        <dd>{molecule?.name ?? "—"}</dd>
      </div>
      <div>
        <dt className="font-medium text-slate-500">Achat / consommation</dt>
        <dd>
          Acheté : {data.bought ? "oui" : "non"}
          {data.bought === false && reasonBought ? ` (${reasonBought})` : ""}
          <br />
          {data.bought ? `Consommé : ${data.consumed ? "oui" : "non"}${data.consumed === false && reasonConsumed ? ` (${reasonConsumed})` : ""}` : null}
        </dd>
      </div>
    </dl>
  );
}

export function StepConfirmation({ consumed }: { consumed: boolean }) {
  if (consumed) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4 text-rose-950">
          <p className="font-semibold">Votre sécurité passe avant tout</p>
          <p className="mt-2 text-sm leading-6">
            Si vous ressentez actuellement des symptômes graves — palpitations, douleur thoracique, difficulté à
            respirer, hallucinations persistantes, perte de connaissance, idées suicidaires ou agitation extrême —
            appelez <strong>immédiatement</strong> :
          </p>
          <ul className="mt-3 space-y-2 text-sm font-medium">
            <li>
              <a href={`tel:${EMERGENCY_PHONE_FR}`} className="underline">
                15
              </a>{" "}
              (SAMU — France)
            </li>
            <li>
              <a href={`tel:${EMERGENCY_PHONE_EU}`} className="underline">
                112
              </a>{" "}
              (urgences européennes)
            </li>
            <li>
              <a href={`tel:${DRUGS_INFO_SERVICE_PHONE.replace(/\s/g, "")}`} className="underline">
                {DRUGS_INFO_SERVICE_PHONE}
              </a>{" "}
              (Drogues Info Service)
            </li>
          </ul>
        </div>
        <p className="text-sm text-slate-700">
          Votre déclaration a été enregistrée. Elle sera examinée dans le cadre de la modération de
          l&apos;observatoire.
        </p>
      </div>
    );
  }

  return (
    <p className="text-sm leading-6 text-slate-700">
      Votre observation a été enregistrée. Elle entrera dans le processus de modération de
      l&apos;observatoire. Merci pour votre contribution citoyenne.
    </p>
  );
}

export function ConfirmationActions() {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Link href="/carte" className={btnPrimary}>
        Retour à la carte
      </Link>
      <Link href="/compte" className="text-center text-sm text-blue-700 underline">
        Mes signalements
      </Link>
    </div>
  );
}
