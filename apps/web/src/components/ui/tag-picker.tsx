"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type TagOption = { id: string; label: string };

type Props = {
  id: string;
  label: string;
  addLabel: string;
  options: TagOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function TagPicker({ id, label, addLabel, options, selectedIds, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const matches = useMemo(() => {
    const q = normalize(query);
    const available = options.filter((o) => !selectedSet.has(o.id));
    if (!q) return available.slice(0, 20);
    const starts: TagOption[] = [];
    const includes: TagOption[] = [];
    for (const opt of available) {
      const n = normalize(opt.label);
      if (n.startsWith(q)) starts.push(opt);
      else if (n.includes(q)) includes.push(opt);
    }
    return [...starts, ...includes].slice(0, 20);
  }, [options, query, selectedSet]);

  const pills = useMemo(
    () => options.filter((o) => selectedSet.has(o.id)),
    [options, selectedSet],
  );

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
      onChange(selectedIds.filter((x) => x !== idValue));
    },
    [onChange, selectedIds],
  );

  function addId(idValue: string) {
    if (selectedSet.has(idValue)) return;
    onChange([...selectedIds, idValue]);
    setQuery("");
    inputRef.current?.focus();
  }

  function openPicker() {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div ref={rootRef} className="space-y-2">
      <p className="text-sm font-medium text-zinc-200">{label}</p>

      {pills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <span
              key={pill.id}
              className="inline-flex items-center gap-2 rounded border border-obs-border bg-obs-elevated px-2 py-0.5 text-xs font-medium text-obs-signal"
            >
              {pill.label}
              <button
                type="button"
                onClick={() => removeId(pill.id)}
                className="rounded px-1 text-obs-muted hover:text-zinc-200"
                aria-label={`Remove ${pill.label}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openPicker}
          className="inline-flex min-h-9 items-center gap-1.5 rounded border border-dashed border-obs-border bg-obs-surface px-3 py-1.5 text-sm text-zinc-300 transition hover:border-obs-violet hover:text-obs-signal"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
        >
          <span className="text-base leading-none" aria-hidden>
            +
          </span>
          {addLabel}
        </button>
      </div>

      {open ? (
        <div className="relative z-[1100]">
          <label htmlFor={id} className="sr-only">
            {addLabel}
          </label>
          <input
            ref={inputRef}
            id={id}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Search…"
            className="min-h-9 w-full rounded border border-obs-border bg-obs-elevated p-2 text-sm text-zinc-100 placeholder:text-zinc-400 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80"
            autoComplete="off"
          />
          <ul
            id={`${id}-listbox`}
            role="listbox"
            className="absolute mt-1 max-h-48 w-full overflow-auto rounded-md border border-obs-border bg-obs-surface shadow-xl"
          >
            {matches.map((opt) => (
              <li key={opt.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-obs-violet/20 hover:text-white"
                  onClick={() => addId(opt.id)}
                >
                  {opt.label}
                </button>
              </li>
            ))}
            {matches.length === 0 ? (
              <li className="px-3 py-3 text-sm text-obs-muted">No results.</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
