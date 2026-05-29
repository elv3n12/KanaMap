"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Molecule } from "@prisma/client";
import { PLACE_TYPE_LABELS } from "@/lib/constants";
import { MoleculeAutocomplete } from "@/components/ui/molecule-autocomplete";

type Props = {
  molecules: Molecule[];
  filters: Record<string, string>;
  onChange: (filters: Record<string, string>) => void;
  compact?: boolean;
};

const placeEntries = Object.entries(PLACE_TYPE_LABELS);

function PlaceTypeMultiSelect({
  selectedTypes,
  onChange,
  compact,
}: {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedSet = useMemo(() => new Set(selectedTypes), [selectedTypes]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function toggle(value: string) {
    if (selectedSet.has(value)) {
      onChange(selectedTypes.filter((t) => t !== value));
    } else {
      onChange([...selectedTypes, value]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      buttonRef.current?.focus();
      return;
    }

    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(0);
        return;
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < placeEntries.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : placeEntries.length - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < placeEntries.length) {
        toggle(placeEntries[activeIndex][0]);
      }
    }
  }

  const label =
    selectedTypes.length === 0
      ? "All places"
      : selectedTypes
          .map((t) => PLACE_TYPE_LABELS[t as keyof typeof PLACE_TYPE_LABELS] ?? t)
          .join(", ");

  const listboxId = "place-type-listbox";

  return (
    <div ref={rootRef} className="relative">
      {!compact ? <span className="obs-label mb-1 block" id="place-type-label">Place type</span> : null}
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-activedescendant={open && activeIndex >= 0 ? `place-opt-${activeIndex}` : undefined}
        aria-labelledby={!compact ? "place-type-label" : undefined}
        onClick={() => { setOpen((o) => !o); setActiveIndex(-1); }}
        onKeyDown={handleKeyDown}
        className={`flex min-h-9 w-full items-center justify-between rounded border border-obs-border bg-obs-elevated px-2 py-1.5 text-sm text-zinc-100 ${compact ? "min-w-[140px]" : ""}`}
      >
        <span className="truncate">{label}</span>
        <span className="ml-1 text-obs-muted" aria-hidden>▾</span>
      </button>
      {open ? (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-[1100] mt-1 max-h-64 w-full min-w-[180px] overflow-auto rounded-md border border-obs-border bg-obs-surface shadow-xl"
        >
          {placeEntries.map(([value, lbl], i) => (
            <li
              key={value}
              id={`place-opt-${i}`}
              role="option"
              aria-selected={selectedSet.has(value)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-zinc-200 ${i === activeIndex ? "bg-obs-violet/20 text-white" : "hover:bg-obs-violet/20"}`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => toggle(value)}
            >
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${selectedSet.has(value) ? "border-obs-violet bg-obs-violet text-white" : "border-obs-border bg-obs-elevated"}`}
                aria-hidden
              >
                {selectedSet.has(value) ? "✓" : ""}
              </span>
              {lbl}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ZoneFilters({ molecules, filters, onChange, compact }: Props) {
  const selectedPlaceTypes = (filters.placeTypes ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const selectedMoleculeIds = (filters.moleculeIds ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const selectedMoleculeNames = (filters.moleculeNames ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const placeSelect = (
    <PlaceTypeMultiSelect
      selectedTypes={selectedPlaceTypes}
      onChange={(types) => onChange({ ...filters, placeTypes: types.join(",") })}
      compact={compact}
    />
  );

  const moleculeField = (
    <MoleculeAutocomplete
      id="filter-molecule"
      label={compact ? "" : "Molecule"}
      options={molecules.map((m) => ({ id: m.id, name: m.name }))}
      selectedIds={selectedMoleculeIds}
      selectedCustomNames={selectedMoleculeNames}
      onChange={({ ids, customNames }) => {
        onChange({
          ...filters,
          moleculeIds: ids.join(","),
          moleculeNames: customNames.join(","),
        });
      }}
      placeholder="Search molecule…"
      hidePills
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

  const placeTypes = (filters.placeTypes ?? "").split(",").filter(Boolean);
  for (const pt of placeTypes) {
    const label = PLACE_TYPE_LABELS[pt as keyof typeof PLACE_TYPE_LABELS] ?? pt;
    chips.push(
      <button
        key={`place-${pt}`}
        type="button"
        className="obs-label inline-flex items-center gap-1 rounded border border-obs-border bg-obs-elevated px-2 py-1 text-obs-signal hover:border-obs-violet"
        onClick={() =>
          onChange({
            ...filters,
            placeTypes: placeTypes.filter((x) => x !== pt).join(","),
          })
        }
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
