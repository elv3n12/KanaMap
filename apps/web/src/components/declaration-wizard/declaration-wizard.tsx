"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LookupProps, WizardStepId } from "./wizard-types";
import {
  WIZARD_DRAFT_KEY,
  STEP_TITLES,
  defaultDeclarationData,
  getStepSequence,
  type DeclarationData,
} from "./wizard-types";
import { WizardShell } from "./wizard-shell";
import {
  ConfirmationActions,
  StepClaimMatch,
  StepConfirmation,
  StepConsumption,
  StepContact,
  StepEvidence,
  StepFormOfUse,
  StepLocation,
  StepNegativeEffects,
  StepPositiveEffects,
  StepProduct,
  StepPurchase,
  StepReview,
  StepSubstance,
} from "./wizard-steps";

type Props = LookupProps;

function formatReason(value?: string, other?: string) {
  if (!value) return undefined;
  return value === "Autre" ? other?.trim() || "Autre" : value;
}

function validateStep(step: WizardStepId, data: DeclarationData): string | null {
  switch (step) {
    case "location":
      if (!data.city.trim()) return "Indiquez une ville.";
      if (data.centroidLat == null) return "Sélectionnez une ville dans la liste proposée.";
      return null;
    case "product":
      if (!data.productCommercialName.trim()) return "Indiquez le nom du produit.";
      if (!data.observationDate) return "Indiquez la date d'observation.";
      return null;
    case "substance":
      if (!data.primaryMoleculeId && !data.primaryMoleculeCustom?.trim()) return "Choisissez la substance active.";
      if (!data.informationSource) return "Indiquez qui vous a communiqué ce nom.";
      return null;
    case "purchase":
      if (data.bought === null) return "Indiquez si vous avez acheté le produit.";
      if (data.bought === false && !formatReason(data.reasonNotBought, data.reasonNotBoughtOther)) {
        return "Précisez pourquoi vous n'avez pas acheté.";
      }
      return null;
    case "consumption":
      if (data.consumed === null) return "Indiquez si vous avez consommé le produit.";
      if (data.consumed === false && !formatReason(data.reasonNotConsumed, data.reasonNotConsumedOther)) {
        return "Précisez pourquoi vous n'avez pas consommé.";
      }
      return null;
    case "formOfUse":
      if (!data.formOfUse) return "Indiquez la forme de consommation.";
      return null;
    case "claimMatch":
      if (!data.effectsMatchClaim) return "Indiquez si les effets correspondaient aux promesses.";
      return null;
    case "contact":
      if (data.wantsContact === null) return "Indiquez si vous souhaitez être recontacté.";
      if (data.wantsContact && !data.contactEmail?.trim()) return "Indiquez votre email.";
      return null;
    default:
      return null;
  }
}

function toPayload(data: DeclarationData) {
  const announced = data.primaryMoleculeId ? [data.primaryMoleculeId] : [];
  const announcedNames =
    !data.primaryMoleculeId && data.primaryMoleculeCustom?.trim() ? [data.primaryMoleculeCustom.trim()] : [];
  const suspected = data.suspectedMoleculeIds.filter((id) => id !== data.primaryMoleculeId);
  const suspectedNames = (data.suspectedMoleculeCustomNames ?? []).map((x) => x.trim()).filter(Boolean);

  return {
    countryCode: data.countryCode,
    countryName: data.countryName,
    city: data.city,
    displayZone: data.displayZone,
    centroidLat: data.centroidLat,
    centroidLng: data.centroidLng,
    placeType: data.placeType,
    placeOtherLabel: data.placeOtherLabel,
    brandRawName: data.brandRawName,
    productCommercialName: data.productCommercialName,
    productType: data.productType,
    observationDate: data.observationDate,
    announcedMoleculeIds: announced,
    suspectedMoleculeIds: suspected,
    announcedMoleculeNames: announcedNames,
    suspectedMoleculeNames: suspectedNames,
    marketingClaimIds: data.marketingClaimIds,
    informationSource: data.informationSource,
    bought: data.bought === true,
    consumed: data.consumed === true,
    reasonNotBought: formatReason(data.reasonNotBought, data.reasonNotBoughtOther),
    reasonNotConsumed: formatReason(data.reasonNotConsumed, data.reasonNotConsumedOther),
    formOfUse: data.consumed ? data.formOfUse : undefined,
    approximatePeriod: data.approximatePeriod,
    effectDuration: data.effectDuration,
    positiveEffectIds: data.positiveEffectIds,
    positiveEffectsCustom: data.positiveEffectsCustom,
    adverseEffectIds: data.adverseEffectIds,
    adverseEffectsCustom: data.adverseEffectsCustom,
    withdrawalSymptoms: data.withdrawalSymptoms,
    medicalCare: data.medicalCare,
    effectsMatchClaim: data.consumed ? data.effectsMatchClaim : undefined,
    narrative: data.narrative,
    proofLevel: data.proofLevel,
    wantsContact: data.wantsContact === true,
    contactEmail: data.wantsContact ? data.contactEmail : undefined,
  };
}

export function DeclarationWizard(props: Props) {
  const [data, setData] = useState<DeclarationData>(() => {
    if (typeof window === "undefined") return defaultDeclarationData();
    try {
      const raw = sessionStorage.getItem(WIZARD_DRAFT_KEY);
      if (raw) return { ...defaultDeclarationData(), ...JSON.parse(raw) };
    } catch {
      // ignore
    }
    return defaultDeclarationData();
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedConsumed, setSubmittedConsumed] = useState(false);
  const [done, setDone] = useState(false);

  const steps = useMemo(() => getStepSequence(data), [data]);
  const activeIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const currentStep = done ? "confirmation" : steps[activeIndex] ?? "location";
  const meta = STEP_TITLES[currentStep as WizardStepId];

  const patch = useCallback((partial: Partial<DeclarationData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setError("");
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/signalements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(data)),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Erreur lors de l'envoi.");
        setSubmitting(false);
        return;
      }
      sessionStorage.removeItem(WIZARD_DRAFT_KEY);
      setSubmittedConsumed(Boolean(body.consumed));
      setDone(true);
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (currentStep === "review") {
      void submit();
      return;
    }
    const err = validateStep(currentStep as WizardStepId, data);
    if (err) {
      setError(err);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function goBack() {
    setError("");
    setStepIndex((i) => Math.max(0, i - 1));
  }

  const stepProps = { data, onChange: patch, lookups: props };

  let body = null;
  switch (currentStep) {
    case "location":
      body = <StepLocation {...stepProps} />;
      break;
    case "product":
      body = <StepProduct {...stepProps} />;
      break;
    case "substance":
      body = <StepSubstance {...stepProps} />;
      break;
    case "purchase":
      body = <StepPurchase {...stepProps} />;
      break;
    case "consumption":
      body = <StepConsumption {...stepProps} />;
      break;
    case "formOfUse":
      body = <StepFormOfUse {...stepProps} />;
      break;
    case "positiveEffects":
      body = <StepPositiveEffects {...stepProps} />;
      break;
    case "negativeEffects":
      body = <StepNegativeEffects {...stepProps} />;
      break;
    case "claimMatch":
      body = <StepClaimMatch {...stepProps} />;
      break;
    case "evidence":
      body = <StepEvidence {...stepProps} />;
      break;
    case "contact":
      body = <StepContact {...stepProps} />;
      break;
    case "review":
      body = <StepReview data={data} lookups={props} />;
      break;
    case "confirmation":
      body = (
        <>
          <StepConfirmation consumed={submittedConsumed} />
          <ConfirmationActions />
        </>
      );
      break;
    default:
      body = null;
  }

  const totalForProgress = done ? 0 : steps.length;
  const progressIndex = done ? 0 : activeIndex;

  return (
    <WizardShell
      title={meta.title}
      subtitle={meta.subtitle}
      stepIndex={progressIndex}
      totalSteps={totalForProgress}
      onBack={!done && activeIndex > 0 ? goBack : undefined}
      onNext={!done ? goNext : undefined}
      nextLabel={currentStep === "review" ? (submitting ? "Envoi…" : "Envoyer la déclaration") : "Suivant"}
      nextDisabled={submitting}
      hideNav={done}
    >
      {body}
      {error ? (
        <p className="mt-4 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
    </WizardShell>
  );
}
