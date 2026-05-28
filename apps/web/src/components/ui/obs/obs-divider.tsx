export function ObsDivider({ className = "" }: { className?: string }) {
  return (
    <hr
      className={`border-0 border-t border-obs-border ${className}`}
      style={{ boxShadow: "0 1px 0 color-mix(in srgb, var(--obs-violet) 8%, transparent)" }}
    />
  );
}
