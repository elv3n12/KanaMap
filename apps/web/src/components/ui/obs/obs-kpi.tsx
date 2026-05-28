type Props = {
  label: string;
  value: string | number;
  className?: string;
};

export function ObsKpi({ label, value, className = "" }: Props) {
  return (
    <div className={className}>
      <p className="obs-label">{label}</p>
      <p className="obs-data-value mt-0.5 text-xl font-semibold">{value}</p>
    </div>
  );
}
