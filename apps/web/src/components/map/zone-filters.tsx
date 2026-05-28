"use client";

import type { ReactNode } from "react";
import type { Molecule } from "@prisma/client";
import { PLACE_TYPE_LABELS } from "@/lib/constants";
import { MoleculeAutocomplete } from "@/components/ui/molecule-autocomplete";

type Props = {
  molecules: Molecule[];
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
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <select
        id={id}
        className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

export function ZoneFilters({ molecules, filters, onChange }: Props) {
  function set(name: string, value: string) {
    onChange({ ...filters, [name]: value });
  }

  const selectedIds = (filters.moleculeIds ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const selectedNames = (filters.moleculeNames ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  return (
    <div className="grid gap-3">
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
      <MoleculeAutocomplete
        id="filter-molecule"
        label="Molécule"
        options={molecules.map((m) => ({ id: m.id, name: m.name }))}
        selectedIds={selectedIds}
        selectedCustomNames={selectedNames}
        onChange={({ ids, customNames }) => {
          set("moleculeIds", ids.join(","));
          set("moleculeNames", customNames.join(","));
        }}
        placeholder="Rechercher une molécule…"
      />
    </div>
  );
}
