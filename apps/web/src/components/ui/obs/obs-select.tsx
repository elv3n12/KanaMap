import type { ReactNode, SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  children: ReactNode;
};

export function ObsSelect({ label, id, className = "", children, ...props }: Props) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={selectId} className="obs-label mb-1 block">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className="min-h-9 w-full rounded border border-obs-border bg-obs-elevated px-3 py-1.5 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
