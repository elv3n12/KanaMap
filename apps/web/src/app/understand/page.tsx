import Link from "next/link";
import { ObsDivider, ObsPanel, ObsSectionHeader } from "@/components/ui/obs";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "substances", label: "Substances" },
  { id: "risks", label: "Risks" },
  { id: "methodology", label: "Methodology" },
  { id: "ethics", label: "Data ethics" },
] as const;

function IllustrationPlaceholder({ title }: { title: string }) {
  return (
    <ObsPanel className="flex aspect-video items-center justify-center p-6">
      <div className="text-center">
        <p className="obs-label text-obs-signal">Diagram forthcoming</p>
        <p className="mt-2 text-sm text-obs-muted">{title}</p>
      </div>
    </ObsPanel>
  );
}

export default function UnderstandPage() {
  return (
    <div className="obs-grid-bg min-h-screen">
      {/* Hero */}
      <section className="border-b border-obs-border bg-gradient-to-b from-obs-elevated/80 to-obs-void px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="obs-label text-obs-signal">Intelligence brief</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-100 md:text-5xl">
            Understanding the observatory
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            A civic documentation system for emerging psychoactive cannabinoids in Europe — designed
            for transparency, harm reduction, and institutional accountability.
          </p>
        </div>
      </section>

      {/* Sticky nav */}
      <nav
        className="sticky top-14 z-50 border-b border-obs-border bg-obs-void/95 backdrop-blur-md"
        aria-label="Section navigation"
      >
        <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="obs-label inline-block whitespace-nowrap rounded px-3 py-2 text-zinc-400 transition hover:bg-obs-elevated hover:text-obs-signal"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Overview */}
        <section id="overview" className="scroll-mt-32">
          <div className="grid gap-10 md:grid-cols-[1fr,minmax(240px,320px)]">
            <div>
              <ObsSectionHeader
                eyebrow="Section 01"
                title="Overview"
                description="Why this observatory exists and who it serves."
              />
              <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-400">
                <p>
                  A cannabinoid is a substance that can interact with the endocannabinoid system.
                  Some are natural, others synthetic or semi-synthetic.
                </p>
                <p>
                  The market evolves rapidly: new commercial names appear, compositions can be
                  ambiguous, and &quot;legal&quot; does not mean &quot;risk-free.&quot;
                </p>
                <p>
                  European regulation is fragmented. The observatory exists to document, verify,
                  and make this phenomenon visible without facilitating access to products.
                </p>
              </div>
            </div>
            <IllustrationPlaceholder title="European signal coverage" />
          </div>
        </section>

        <ObsDivider className="my-16" />

        {/* Substances */}
        <section id="substances" className="scroll-mt-32">
          <div className="grid gap-10 md:grid-cols-[1fr,minmax(240px,320px)]">
            <div>
              <ObsSectionHeader
                eyebrow="Section 02"
                title="Substances"
                description="Molecules, commercial forms, and market ambiguity."
              />
              <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-400">
                <p>
                  Sprayed flowers, altered products, vapes, or candies can expose users to
                  unpredictable dosages. Reported effects include anxiety, insomnia, palpitations,
                  withdrawal symptoms, or need for medical care.
                </p>
                <p className="text-obs-muted italic">
                  Detailed substance profiles and network diagrams will be added in a future release.
                </p>
              </div>
            </div>
            <IllustrationPlaceholder title="Molecule classification map" />
          </div>
        </section>

        <ObsDivider className="my-16" />

        {/* Risks */}
        <section id="risks" className="scroll-mt-32">
          <ObsSectionHeader eyebrow="Section 03" title="Risks" />
          <div className="mt-6 max-w-prose space-y-4 text-sm leading-7 text-zinc-400">
            <p>
              Data is moderated, anonymized, and aggregated by approximate zones to help citizens,
              journalists, researchers, and institutions understand emerging signals.
            </p>
          </div>
        </section>

        <ObsDivider className="my-16" />

        {/* Methodology */}
        <section id="methodology" className="scroll-mt-32">
          <ObsSectionHeader eyebrow="Section 04" title="Methodology" />
          <div className="mt-6 max-w-prose space-y-4 text-sm leading-7 text-zinc-400">
            <p>
              Each report carries a proof level. Zones are deliberately approximate. Moderation
              validates submissions before public display.
            </p>
          </div>
        </section>

        <ObsDivider className="my-16" />

        {/* Ethics */}
        <section id="ethics" className="scroll-mt-32">
          <ObsSectionHeader eyebrow="Section 05" title="Data ethics" />
          <div className="mt-6 max-w-prose space-y-4 text-sm leading-7 text-zinc-400">
            <p>
              Public exports are anonymized. Sensitive data remains reserved for moderation. The
              platform does not reference points of sale to facilitate purchase.
            </p>
          </div>
        </section>

        <ObsDivider className="my-16" />

        {/* Signal network placeholder */}
        <ObsPanel className="p-8 text-center">
          <p className="obs-label text-obs-signal">Coming soon</p>
          <h3 className="mt-2 text-xl font-semibold text-zinc-100">Signal network</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-obs-muted">
            Interactive molecule and regulatory relationship diagram — React Flow integration
            planned for Phase 3.
          </p>
        </ObsPanel>

        {/* CTA */}
        <div className="mt-16 flex flex-wrap gap-4">
          <Link
            href="/map"
            className="inline-flex min-h-10 items-center rounded border border-violet-600/50 bg-obs-violet px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Open signal map
          </Link>
          <Link
            href="/reports/new"
            className="inline-flex min-h-10 items-center rounded border border-obs-border bg-obs-elevated px-4 py-2 text-sm font-medium text-zinc-200 hover:border-obs-violet"
          >
            Submit a report
          </Link>
        </div>
      </div>
    </div>
  );
}
