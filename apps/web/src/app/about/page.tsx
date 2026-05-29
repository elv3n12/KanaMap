export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="obs-label text-obs-signal">About</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Mission of the European Observatory of NeoCannabinoids</h1>
      <div className="mt-6 space-y-4 rounded-lg border border-obs-border bg-obs-surface p-6 leading-7 text-zinc-300">
        <p>
          Cannabinoid Observatory Europe is a harm-reduction and information project run by an NGO.
          Its goal is to alert European populations and public officials to the presence of synthetic
          and semi-synthetic cannabinoids.
        </p>
        <p>
          The map enables users to report the presence of a product or place in order to make the
          information more visible. It does not constitute an invitation to buy, sell, or consume
          substances.
        </p>
        <p>
          Contributors remain anonymous on the public site. Their identifier is stored in the
          database to limit abuse and enable moderation.
        </p>
      </div>
    </div>
  );
}
