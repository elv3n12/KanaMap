import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger" | "outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-obs-violet text-white hover:bg-violet-500 active:bg-violet-700 border border-violet-600/50",
  ghost:
    "bg-transparent text-zinc-300 hover:bg-obs-elevated hover:text-white border border-transparent",
  danger: "bg-obs-danger text-white hover:bg-red-700 border border-red-800/50",
  outline:
    "bg-obs-elevated text-zinc-200 border border-obs-border hover:border-obs-violet hover:text-white",
};

export function ObsButton({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-9 items-center justify-center rounded px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-obs-void disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
