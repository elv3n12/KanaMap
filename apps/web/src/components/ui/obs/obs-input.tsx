import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function ObsInput({ label, id, className = "", ...props }: Props) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={inputId} className="obs-label mb-1 block">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className="min-h-9 w-full rounded border border-obs-border bg-obs-elevated px-3 py-1.5 text-sm text-zinc-100 placeholder:text-obs-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80"
        {...props}
      />
    </div>
  );
}
