"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdverseEffect, Molecule } from "@prisma/client";

type Props = {
  molecules: Molecule[];
  effects: AdverseEffect[];
};

export function AdverseEffectForm({ molecules, effects }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/declarations-effets", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Impossible de transmettre la déclaration.");
      return;
    }
    router.push("/compte?declaration=1");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      {error ? <p className="rounded-lg bg-red-100 p-3 text-sm text-red-800">{error}</p> : null}
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
        Cette déclaration ne remplace pas un avis médical. En cas de malaise grave, de détresse
        psychologique, de palpitations importantes, de confusion, de douleur thoracique ou de danger
        immédiat, contactez les urgences ou un professionnel de santé.
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input required name="countryCode" maxLength={2} className="rounded-lg border p-3" placeholder="Pays (FR)" />
        <input name="approximatePeriod" className="rounded-lg border p-3" placeholder="Période approximative" />
        <input name="productNameRaw" className="rounded-lg border p-3" placeholder="Produit consommé (si connu)" />
        <input name="brandNameRaw" className="rounded-lg border p-3" placeholder="Marque (si connue)" />
        <input name="effectDuration" className="rounded-lg border p-3" placeholder="Durée des effets" />
      </div>
      <CheckboxGroup title="Molécules annoncées ou suspectées" name="moleculeIds" items={molecules.map((item) => [item.id, item.name])} />
      <CheckboxGroup title="Effets ressentis" name="effectIds" items={effects.map((item) => [item.id, item.label])} />
      <textarea name="withdrawalSymptoms" className="w-full rounded-lg border p-3" rows={3} placeholder="Symptômes de sevrage éventuels" />
      <textarea name="narrative" className="w-full rounded-lg border p-3" rows={5} placeholder="Description prudente, sans nom propre ni données personnelles d’autrui." />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="medicalCare" />
        Recours médical ou urgence
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="wantsContact" />
        J’accepte d’être recontacté par l’équipe de modération
      </label>
      <input name="contactEmail" type="email" className="w-full rounded-lg border p-3" placeholder="Email de contact (facultatif, non public)" />
      <button className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white" type="submit">
        Transmettre à la modération
      </button>
    </form>
  );
}

function CheckboxGroup({ title, name, items }: { title: string; name: string; items: [string, string][] }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{title}</legend>
      <div className="mt-2 grid gap-2 md:grid-cols-3">
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
