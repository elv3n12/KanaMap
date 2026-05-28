type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function ObsSectionHeader({ eyebrow, title, description, className = "" }: Props) {
  return (
    <header className={className}>
      {eyebrow ? <p className="obs-label text-obs-signal">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">{title}</h2>
      {description ? <p className="mt-3 max-w-prose text-sm leading-7 text-zinc-400">{description}</p> : null}
    </header>
  );
}
