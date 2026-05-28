"use client";

import type { ReactNode } from "react";

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-800">
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-rose-700" role="alert">{message}</p>;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 ${props.className ?? ""}`}
    />
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-1 min-h-11 w-full rounded-lg border border-slate-300 p-3 text-slate-900 ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`mt-1 w-full rounded-lg border border-slate-300 p-3 text-slate-900 ${props.className ?? ""}`}
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
        className={`min-h-11 flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
          value === true
            ? "border-emerald-600 bg-emerald-50 text-emerald-900"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
        }`}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`min-h-11 flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
          value === false
            ? "border-slate-800 bg-slate-100 text-slate-900"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
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
      {options.map((option) => (
        <label
          key={option.id}
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
        >
          <input
            id={`${idPrefix}-${option.id}`}
            type="checkbox"
            checked={selected.includes(option.id)}
            onChange={() => onToggle(option.id)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm text-slate-800">{option.label}</span>
        </label>
      ))}
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
