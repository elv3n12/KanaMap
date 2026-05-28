"use client";

import type { ReactNode } from "react";
import type { Molecule } from "@prisma/client";
import { PLACE_TYPE_LABELS } from "@/lib/constants";
import { MoleculeAutocomplete } from "@/components/ui/molecule-autocomplete";
import { ObsSelect } from "@/components/ui/obs";

type Props = {
  molecules: Molecule[];
  filters: Record<string, string>;
  onChange: (filters: Record<string, string>) => void;
  compact?: boolean;
};

export function ZoneFilters({ molecules, filters, onChange, compact }: Props) {
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

  const placeSelect = (
    <ObsSelect
      id="filter-place"
      label={compact ? undefined : "Place type"}
      value={filters.placeType ?? ""}
      onChange={(e) => set("placeType", e.target.value)}
      className={compact ? "min-w-[120px]" : ""}
    >
      <option value="">All places</option>
      {Object.entries(PLACE_TYPE_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </ObsSelect>
  );

  const moleculeField = (
    <MoleculeAutocomplete
      id="filter-molecule"
      label={compact ? "" : "Molecule"}
      options={molecules.map((m) => ({ id: m.id, name: m.name }))}
      selectedIds={selectedIds}
      selectedCustomNames={selectedNames}
      onChange={({ ids, customNames }) => {
        set("moleculeIds", ids.join(","));
        set("moleculeNames", customNames.join(","));
      }}
      placeholder="Search molecule…"
    />
  );

  if (compact) {
    return (
      <div className="flex flex-wrap items-end gap-3">
        {placeSelect}
        <div className="min-w-[160px] flex-1">{moleculeField}</div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {placeSelect}
      {moleculeField}
    </div>
  );
}

export function FilterChips({
  filters,
  molecules,
  onChange,
  onClear,
}: {
  filters: Record<string, string>;
  molecules: Molecule[];
  onChange: (filters: Record<string, string>) => void;
  onClear: () => void;
}) {
  const chips: ReactNode[] = [];

  if (filters.placeType) {
    const label = PLACE_TYPE_LABELS[filters.placeType as keyof typeof PLACE_TYPE_LABELS] ?? filters.placeType;
    chips.push(
      <button
        key="place"
        type="button"
        className="obs-label inline-flex items-center gap-1 rounded border border-obs-border bg-obs-elevated px-2 py-1 text-obs-signal hover:border-obs-violet"
        onClick={() => onChange({ ...filters, placeType: "" })}
      >
        {label} <span aria-hidden>×</span>
      </button>,
    );
  }

  const ids = (filters.moleculeIds ?? "").split(",").filter(Boolean);
  const names = (filters.moleculeNames ?? "").split(",").filter(Boolean);
  for (const id of ids) {
    const mol = molecules.find((m) => m.id === id);
    chips.push(
      <button
        key={`id-${id}`}
        type="button"
        className="obs-label inline-flex items-center gap-1 rounded border border-obs-border bg-obs-elevated px-2 py-1 text-obs-signal hover:border-obs-violet"
        onClick={() =>
          onChange({
            ...filters,
            moleculeIds: ids.filter((x) => x !== id).join(","),
          })
        }
      >
        {mol?.name ?? id} <span aria-hidden>×</span>
      </button>,
    );
  }
  for (const name of names) {
    chips.push(
      <button
        key={`name-${name}`}
        type="button"
        className="obs-label inline-flex items-center gap-1 rounded border border-obs-border bg-obs-elevated px-2 py-1 text-obs-signal hover:border-obs-violet"
        onClick={() =>
          onChange({
            ...filters,
            moleculeNames: names.filter((x) => x !== name).join(","),
          })
        }
      >
        {name} <span aria-hidden>×</span>
      </button>,
    );
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips}
      <button type="button" className="obs-label text-obs-muted hover:text-zinc-300" onClick={onClear}>
        Clear all
      </button>
    </div>
  );
}
