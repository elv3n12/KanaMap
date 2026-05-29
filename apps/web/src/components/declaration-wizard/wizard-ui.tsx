"use client";

import type { ReactNode } from "react";

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-200">
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-400" role="alert">{message}</p>;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`mt-1 min-h-11 w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 focus:border-obs-violet focus:outline-none focus:ring-2 focus:ring-obs-violet/40 ${props.className ?? ""}`}
    />
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-1 min-h-11 w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-400 focus:border-obs-violet focus:outline-none focus:ring-2 focus:ring-obs-violet/40 ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`mt-1 w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-400 focus:border-obs-violet focus:outline-none focus:ring-2 focus:ring-obs-violet/40 ${props.className ?? ""}`}
    />
  );
}

export function YesNoChoice({
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`min-h-11 flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
          value === true
            ? "border-obs-violet bg-obs-violet/20 text-obs-signal"
            : "border-obs-border bg-obs-surface text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        }`}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`min-h-11 flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition ${
          value === false
            ? "border-zinc-500 bg-zinc-700/50 text-zinc-100"
            : "border-obs-border bg-obs-surface text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        }`}
      >
        {noLabel}
      </button>
    </div>
  );
}

export function CheckboxGrid({
  options,
  selected,
  onToggle,
  idPrefix,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  idPrefix: string;
}) {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <label
            key={option.id}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition ${
              isSelected
                ? "border-obs-violet/60 bg-obs-violet/10"
                : "border-obs-border bg-obs-surface hover:border-zinc-600"
            }`}
          >
            <input
              id={`${idPrefix}-${option.id}`}
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(option.id)}
              className="h-4 w-4 rounded border-obs-border bg-obs-elevated text-obs-violet focus:ring-obs-violet/40 focus:ring-offset-obs-void"
            />
            <span className={`text-sm ${isSelected ? "text-zinc-100" : "text-zinc-300"}`}>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export function ReasonSelect({
  options,
  value,
  otherValue,
  onChange,
  onOtherChange,
}: {
  options: readonly string[];
  value?: string;
  otherValue?: string;
  onChange: (value: string) => void;
  onOtherChange: (value: string) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <FieldLabel htmlFor="reason-select">Please specify</FieldLabel>
      <SelectInput id="reason-select" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required>
        <option value="">Choose an option</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </SelectInput>
      {value === "Other" ? (
        <div>
          <FieldLabel htmlFor="reason-other">Details</FieldLabel>
          <TextInput
            id="reason-other"
            value={otherValue ?? ""}
            onChange={(e) => onOtherChange(e.target.value)}
            required
          />
        </div>
      ) : null}
    </div>
  );
}
