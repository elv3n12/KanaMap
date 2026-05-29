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
  hidePills?: boolean;
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
  hidePills = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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

  const visibleItems = useMemo(() => {
    const items: { type: "custom"; value: string }[] | { type: "option"; option: MoleculeOption }[] = [];
    if (canAddCustom) (items as { type: "custom"; value: string }[]).push({ type: "custom", value: canAddCustom });
    for (const opt of matches) {
      (items as { type: "option"; option: MoleculeOption }[]).push({ type: "option", option: opt });
    }
    return items as ({ type: "custom"; value: string } | { type: "option"; option: MoleculeOption })[];
  }, [canAddCustom, matches]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

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

  function confirmActive() {
    if (activeIndex < 0 || activeIndex >= visibleItems.length) return false;
    const item = visibleItems[activeIndex];
    if (item.type === "custom") {
      addCustom(item.value);
    } else {
      if (!singleSelect && selectedIdSet.has(item.option.id)) return false;
      addId(item.option.id);
    }
    return true;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(-1);
        return;
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < visibleItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : visibleItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        confirmActive();
      } else if (canAddCustom) {
        addCustom(canAddCustom);
      }
    }
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

  const listboxId = `${id}-listbox`;

  const activeDescendant =
    open && activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined;

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
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          onFocus={() => { setOpen(true); setActiveIndex(-1); }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? (singleSelect ? "Search for a molecule…" : "Add molecules…")}
          className="min-h-9 w-full rounded bg-transparent p-2 text-sm text-zinc-100 placeholder:text-obs-muted outline-none"
          autoComplete="off"
        />
      </div>

      {!hidePills && pills.length > 0 ? (
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
        <div className="relative z-[1100]">
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="absolute mt-1 max-h-64 w-full overflow-auto rounded-md border border-obs-border bg-obs-surface shadow-xl"
          >
            {visibleItems.map((item, i) => {
              if (item.type === "custom") {
                return (
                  <li
                    key="__custom__"
                    id={`${id}-opt-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={`cursor-pointer px-3 py-2 text-sm text-zinc-200 ${i === activeIndex ? "bg-obs-violet/20 text-white" : "hover:bg-obs-violet/20 hover:text-white"}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => addCustom(item.value)}
                  >
                    Add &quot;{item.value}&quot;
                  </li>
                );
              }
              const disabled = !singleSelect && selectedIdSet.has(item.option.id);
              return (
                <li
                  key={item.option.id}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  aria-disabled={disabled || undefined}
                  className={`cursor-pointer px-3 py-2 text-sm ${disabled ? "text-zinc-200 opacity-40" : `text-zinc-200 ${i === activeIndex ? "bg-obs-violet/20 text-white" : "hover:bg-obs-violet/20 hover:text-white"}`}`}
                  onMouseEnter={() => !disabled && setActiveIndex(i)}
                  onClick={() => !disabled && addId(item.option.id)}
                >
                  {item.option.name}
                </li>
              );
            })}
            {visibleItems.length === 0 ? (
              <li className="px-3 py-3 text-sm text-obs-muted">No results.</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
