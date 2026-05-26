"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdverseEffect, MarketingClaim, Molecule } from "@prisma/client";
import {
  FORM_OF_USE_LABELS,
  PLACE_TYPE_LABELS,
  PRODUCT_TYPE_LABELS,
  PROOF_LEVEL_LABELS,
} from "@/lib/constants";

type Props = {
  molecules: Molecule[];
  claims: MarketingClaim[];
  effects: AdverseEffect[];
};

export function ReportForm({ molecules, claims, effects }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/signalements", { method: "POST", body: formData });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Impossible de soumettre le signalement.");
      return;
    }
    router.push("/compte?submitted=1");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 rounded-2xl bg-white p-6 shadow-sm">
      {error ? <p className="rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p> : null}
      <section>
        <h2 className="text-xl font-semibold">1. Zone d’observation</h2>
        <p className="mt-1 text-sm text-slate-600">
          L’adresse exacte est facultative et réservée à la modération. Elle n’est jamais publiée.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input required name="countryCode" maxLength={2} className="rounded-lg border p-3" placeholder="Pays (FR)" />
          <input required name="countryName" className="rounded-lg border p-3" placeholder="Nom du pays" />
          <input required name="city" className="rounded-lg border p-3" placeholder="Ville" />
          <input name="district" className="rounded-lg border p-3" placeholder="Quartier / arrondissement" />
          <input required name="displayZone" className="rounded-lg border p-3 md:col-span-2" placeholder="Zone affichée publiquement (ex: Paris 11e)" />
          <input required name="centroidLat" inputMode="decimal" className="rounded-lg border p-3" placeholder="Latitude approximative" />
          <input required name="centroidLng" inputMode="decimal" className="rounded-lg border p-3" placeholder="Longitude approximative" />
          <input name="exactAddress" className="rounded-lg border p-3 md:col-span-2" placeholder="Adresse exacte (modération uniquement, facultative)" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">2. Produit observé</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <select required name="placeType" className="rounded-lg border p-3">
            {Object.entries(PLACE_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input name="placeOtherLabel" className="rounded-lg border p-3" placeholder="Si autre, préciser" />
          <input name="brandRawName" className="rounded-lg border p-3" placeholder="Marque observée" />
          <input required name="productCommercialName" className="rounded-lg border p-3" placeholder="Nom commercial du produit" />
          <select required name="productType" className="rounded-lg border p-3">
            {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select name="formOfUse" className="rounded-lg border p-3">
            <option value="">Forme d’administration (facultatif)</option>
            {Object.entries(FORM_OF_USE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input name="quantityObserved" inputMode="decimal" className="rounded-lg border p-3" placeholder="Quantité observée (statistique)" />
          <input name="priceObserved" inputMode="decimal" className="rounded-lg border p-3" placeholder="Prix observé (statistique, non public)" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">3. Molécules, allégations et effets</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <CheckboxGroup title="Molécules annoncées" name="announcedMoleculeIds" items={molecules.map((item) => [item.id, item.name])} />
          <CheckboxGroup title="Molécules suspectées" name="suspectedMoleculeIds" items={molecules.map((item) => [item.id, item.name])} />
          <CheckboxGroup title="Allégations commerciales" name="marketingClaimIds" items={claims.map((item) => [item.id, item.label])} />
        </div>
        <div className="mt-6">
          <CheckboxGroup title="Effets indésirables rapportés" name="adverseEffectIds" items={effects.map((item) => [item.id, item.label])} columns />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">4. Niveau de preuve</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <select name="proofLevel" className="rounded-lg border p-3">
            {Object.entries(PROOF_LEVEL_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input required name="observationDate" type="date" defaultValue={today} className="rounded-lg border p-3" />
        </div>
        <textarea name="narrative" className="mt-4 w-full rounded-lg border p-3" rows={5} placeholder="Décrire prudemment ce qui a été observé, sans données personnelles ni information facilitant l’accès au produit." />
      </section>

      <button className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white" type="submit">
        Soumettre à la modération
      </button>
    </form>
  );
}

function CheckboxGroup({ title, name, items, columns = false }: { title: string; name: string; items: [string, string][]; columns?: boolean }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{title}</legend>
      <div className={`mt-2 grid gap-2 ${columns ? "md:grid-cols-3" : ""}`}>
        {items.map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
            <input type="checkbox" name={name} value={value} />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
