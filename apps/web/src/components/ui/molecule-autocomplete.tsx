"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type MoleculeOption = { id: string; name: string };

type Props = {
  id: string;
  label: string;
  options: MoleculeOption[];
  selectedIds: string[];
  selectedCustomNames: string[];
  onChange: (next: { ids: string[]; customNames: string[] }) => void;
  placeholder?: string;
  singleSelect?: boolean;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function MoleculeAutocomplete({
  id,
  label,
  options,
  selectedIds,
  selectedCustomNames,
  onChange,
  placeholder,
  singleSelect = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedCustomSet = useMemo(
    () => new Set(selectedCustomNames.map((name) => normalize(name))),
    [selectedCustomNames],
  );

  const matches = useMemo(() => {
    const q = normalize(query);
    if (!q) return options.slice(0, 20);

    const starts: MoleculeOption[] = [];
    const includes: MoleculeOption[] = [];
    for (const opt of options) {
      const n = normalize(opt.name);
      if (n.startsWith(q)) starts.push(opt);
      else if (n.includes(q)) includes.push(opt);
    }
    return [...starts, ...includes].slice(0, 20);
  }, [options, query]);

  const canAddCustom = useMemo(() => {
    const raw = query.trim();
    if (!raw) return null;
    const qn = normalize(raw);
    const matchesExisting = options.some((o) => normalize(o.name) === qn);
    const alreadySelected = selectedCustomSet.has(qn);
    return matchesExisting || alreadySelected ? null : raw;
  }, [options, query, selectedCustomSet]);

  useEffect(() => {
    function onDocMouseDown(event: MouseEvent) {
      if (!rootRef.current) return;
      if (event.target instanceof Node && rootRef.current.contains(event.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const removeId = useCallback(
    (idValue: string) => {
      onChange({ ids: selectedIds.filter((x) => x !== idValue), customNames: selectedCustomNames });
    },
    [onChange, selectedCustomNames, selectedIds],
  );

  const removeCustom = useCallback(
    (nameValue: string) => {
      const n = normalize(nameValue);
      onChange({
        ids: selectedIds,
        customNames: selectedCustomNames.filter((x) => normalize(x) !== n),
      });
    },
    [onChange, selectedCustomNames, selectedIds],
  );

  function addId(idValue: string) {
    if (singleSelect) {
      onChange({ ids: [idValue], customNames: [] });
      setQuery("");
      setOpen(false);
      return;
    }
    if (selectedIdSet.has(idValue)) return;
    onChange({ ids: [...selectedIds, idValue], customNames: selectedCustomNames });
    setQuery("");
    inputRef.current?.focus();
  }

  function addCustom(nameValue: string) {
    const name = nameValue.trim();
    if (!name) return;
    if (singleSelect) {
      onChange({ ids: [], customNames: [name] });
      setQuery("");
      setOpen(false);
      return;
    }
    if (selectedCustomSet.has(normalize(name))) return;
    onChange({ ids: selectedIds, customNames: [...selectedCustomNames, name] });
    setQuery("");
    inputRef.current?.focus();
  }

  const pills = useMemo(() => {
    const idPills = options
      .filter((o) => selectedIdSet.has(o.id))
      .map((o) => ({ key: `id:${o.id}`, label: o.name, onRemove: () => removeId(o.id) }));
    const customPills = selectedCustomNames.map((name) => ({
      key: `custom:${name}`,
      label: name,
      onRemove: () => removeCustom(name),
    }));
    return [...idPills, ...customPills];
  }, [options, removeCustom, removeId, selectedCustomNames, selectedIdSet]);

  return (
    <div ref={rootRef}>
      {label ? (
        <label htmlFor={id} className="obs-label mb-1 block">
          {label}
        </label>
      ) : null}
      <div className="rounded border border-obs-border bg-obs-elevated">
        <input
          ref={inputRef}
          id={id}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && canAddCustom) {
              e.preventDefault();
              addCustom(canAddCustom);
            }
          }}
          placeholder={placeholder ?? (singleSelect ? "Search for a molecule…" : "Add molecules…")}
          className="min-h-9 w-full rounded bg-transparent p-2 text-sm text-zinc-100 placeholder:text-obs-muted outline-none"
          autoComplete="off"
        />
      </div>

      {pills.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {pills.map((pill) => (
            <span
              key={pill.key}
              className="inline-flex items-center gap-2 rounded border border-obs-border bg-obs-elevated px-2 py-0.5 text-xs font-medium text-obs-signal"
            >
              {pill.label}
              <button
                type="button"
                onClick={pill.onRemove}
                className="rounded px-1 text-obs-muted hover:text-zinc-200"
                aria-label={`Remove ${pill.label}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="relative">
          <div className="obs-panel absolute z-[1000] mt-2 max-h-64 w-full overflow-auto">
            {canAddCustom ? (
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-obs-elevated"
                onClick={() => addCustom(canAddCustom)}
              >
                Add &quot;{canAddCustom}&quot;
              </button>
            ) : null}
            {matches.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-obs-elevated disabled:opacity-40"
                onClick={() => addId(opt.id)}
                disabled={singleSelect ? false : selectedIdSet.has(opt.id)}
              >
                {opt.name}
              </button>
            ))}
            {matches.length === 0 && !canAddCustom ? (
              <p className="px-4 py-3 text-sm text-obs-muted">No results.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
