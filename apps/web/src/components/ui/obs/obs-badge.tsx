type Tone = "default" | "signal" | "danger" | "warning";

type Props = {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
};

const tones: Record<Tone, string> = {
  default: "bg-obs-elevated text-zinc-300 border-obs-border",
  signal: "bg-violet-950/60 text-obs-signal border-violet-800/40",
  danger: "bg-red-950/50 text-red-300 border-red-900/40",
  warning: "bg-amber-950/40 text-amber-200 border-amber-900/40",
};

export function ObsBadge({ children, tone = "default", className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
