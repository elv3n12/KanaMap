"use client";

import type { ReactNode } from "react";
import type { AdverseEffect, Molecule } from "@prisma/client";
import {
  PLACE_TYPE_LABELS,
  PRODUCT_TYPE_LABELS,
  PROOF_LEVEL_LABELS,
  REPORT_STATUS_LABELS,
} from "@/lib/constants";

type Props = {
  molecules: Molecule[];
  effects: AdverseEffect[];
  filters: Record<string, string>;
  onChange: (filters: Record<string, string>) => void;
};

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-800">
        {label}
      </label>
      <select
        id={id}
        className="min-h-11 w-full rounded-lg border border-slate-300 p-2 text-slate-900"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

export function ZoneFilters({ molecules, effects, filters, onChange }: Props) {
  function set(name: string, value: string) {
    onChange({ ...filters, [name]: value });
  }

  return (
    <div className="grid gap-3">
      <div>
        <label htmlFor="filter-country" className="mb-1 block text-sm font-medium text-slate-800">
          Pays (code)
        </label>
        <input
          id="filter-country"
          className="min-h-11 w-full rounded-lg border border-slate-300 p-2 text-slate-900"
          placeholder="FR, BE, DE…"
          value={filters.countryCode ?? ""}
          onChange={(event) => set("countryCode", event.target.value.toUpperCase())}
        />
      </div>
      <div>
        <label htmlFor="filter-city" className="mb-1 block text-sm font-medium text-slate-800">
          Ville
        </label>
        <input
          id="filter-city"
          className="min-h-11 w-full rounded-lg border border-slate-300 p-2 text-slate-900"
          value={filters.city ?? ""}
          onChange={(event) => set("city", event.target.value)}
        />
      </div>
      <FilterSelect
        id="filter-place"
        label="Type de lieu"
        value={filters.placeType ?? ""}
        onChange={(v) => set("placeType", v)}
      >
        <option value="">Tous les lieux</option>
        {Object.entries(PLACE_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        id="filter-molecule"
        label="Molécule"
        value={filters.moleculeId ?? ""}
        onChange={(v) => set("moleculeId", v)}
      >
        <option value="">Toutes les molécules</option>
        {molecules.map((molecule) => (
          <option key={molecule.id} value={molecule.id}>
            {molecule.name}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        id="filter-product"
        label="Type de produit"
        value={filters.productType ?? ""}
        onChange={(v) => set("productType", v)}
      >
        <option value="">Tous les produits</option>
        {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        id="filter-proof"
        label="Niveau de preuve"
        value={filters.proofLevel ?? ""}
        onChange={(v) => set("proofLevel", v)}
      >
        <option value="">Tous les niveaux de preuve</option>
        {Object.entries(PROOF_LEVEL_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        id="filter-effect"
        label="Effet rapporté"
        value={filters.effectId ?? ""}
        onChange={(v) => set("effectId", v)}
      >
        <option value="">Tous les effets rapportés</option>
        {effects.map((effect) => (
          <option key={effect.id} value={effect.id}>
            {effect.label}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        id="filter-status"
        label="Statut"
        value={filters.status ?? ""}
        onChange={(v) => set("status", v)}
      >
        <option value="">Statuts publics</option>
        {(["PUBLISHED_LIMITED", "PUBLISHED", "CONTESTED"] as const).map((status) => (
          <option key={status} value={status}>
            {REPORT_STATUS_LABELS[status]}
          </option>
        ))}
      </FilterSelect>
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-slate-800">Période</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="filter-from" className="sr-only">
              Date de début
            </label>
            <input
              id="filter-from"
              className="min-h-11 w-full rounded-lg border border-slate-300 p-2 text-slate-900"
              type="date"
              value={filters.from ?? ""}
              onChange={(event) => set("from", event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="filter-to" className="sr-only">
              Date de fin
            </label>
            <input
              id="filter-to"
              className="min-h-11 w-full rounded-lg border border-slate-300 p-2 text-slate-900"
              type="date"
              value={filters.to ?? ""}
              onChange={(event) => set("to", event.target.value)}
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
}
