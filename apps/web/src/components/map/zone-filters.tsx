"use client";

import type { AdverseEffect, Molecule } from "@prisma/client";
import { PLACE_TYPE_LABELS, PRODUCT_TYPE_LABELS, PROOF_LEVEL_LABELS, REPORT_STATUS_LABELS } from "@/lib/constants";

type Props = {
  molecules: Molecule[];
  effects: AdverseEffect[];
  filters: Record<string, string>;
  onChange: (filters: Record<string, string>) => void;
};

export function ZoneFilters({ molecules, effects, filters, onChange }: Props) {
  function set(name: string, value: string) {
    onChange({ ...filters, [name]: value });
  }

  return (
    <div className="grid gap-3">
      <input className="rounded-lg border p-2" placeholder="Pays (FR, BE, DE...)" value={filters.countryCode ?? ""} onChange={(event) => set("countryCode", event.target.value.toUpperCase())} />
      <input className="rounded-lg border p-2" placeholder="Ville" value={filters.city ?? ""} onChange={(event) => set("city", event.target.value)} />
      <select className="rounded-lg border p-2" value={filters.placeType ?? ""} onChange={(event) => set("placeType", event.target.value)}>
        <option value="">Tous les lieux</option>
        {Object.entries(PLACE_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select className="rounded-lg border p-2" value={filters.moleculeId ?? ""} onChange={(event) => set("moleculeId", event.target.value)}>
        <option value="">Toutes les molécules</option>
        {molecules.map((molecule) => <option key={molecule.id} value={molecule.id}>{molecule.name}</option>)}
      </select>
      <select className="rounded-lg border p-2" value={filters.productType ?? ""} onChange={(event) => set("productType", event.target.value)}>
        <option value="">Tous les produits</option>
        {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select className="rounded-lg border p-2" value={filters.proofLevel ?? ""} onChange={(event) => set("proofLevel", event.target.value)}>
        <option value="">Tous les niveaux de preuve</option>
        {Object.entries(PROOF_LEVEL_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select className="rounded-lg border p-2" value={filters.effectId ?? ""} onChange={(event) => set("effectId", event.target.value)}>
        <option value="">Tous les effets rapportés</option>
        {effects.map((effect) => <option key={effect.id} value={effect.id}>{effect.label}</option>)}
      </select>
      <select className="rounded-lg border p-2" value={filters.status ?? ""} onChange={(event) => set("status", event.target.value)}>
        <option value="">Statuts publics</option>
        {["PUBLISHED_LIMITED", "PUBLISHED", "CONTESTED"].map((status) => <option key={status} value={status}>{REPORT_STATUS_LABELS[status as keyof typeof REPORT_STATUS_LABELS]}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded-lg border p-2" type="date" value={filters.from ?? ""} onChange={(event) => set("from", event.target.value)} />
        <input className="rounded-lg border p-2" type="date" value={filters.to ?? ""} onChange={(event) => set("to", event.target.value)} />
      </div>
    </div>
  );
}
