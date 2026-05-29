import { contactAction } from "./actions";
import { ObsButton, ObsPanel, ObsSectionHeader } from "@/components/ui/obs";

export default function ContactPage() {
  return (
    <div className="obs-grid-bg min-h-screen">
      {/* Hero */}
      <section className="border-b border-obs-border bg-gradient-to-b from-obs-elevated/80 to-obs-void px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="obs-label text-obs-signal">Get in touch</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            Contact the Observatory
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Report an error, propose a collaboration, ask about our methodology, or share feedback.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr,1.2fr]">
          {/* Info */}
          <div>
            <ObsSectionHeader eyebrow="About" title="What we document" />
            <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
              <p>
                The observatory tracks affected zones, reported molecules, commercial forms,
                marketing claims, proof levels, and adverse effects.
              </p>
              <p>
                Public exports are anonymized. Sensitive data remains reserved for moderation.
              </p>
              <p className="text-obs-muted">
                We aim to respond within 48 hours.
              </p>
            </div>
          </div>

          {/* Form */}
          <ObsPanel className="p-5">
            <form action={contactAction} className="space-y-4">
              <div>
                <label htmlFor="contact-email" className="obs-label mb-1.5 block text-zinc-300">
                  Email
                </label>
                <input
                  id="contact-email"
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="min-h-11 w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-400 focus:border-obs-violet focus:outline-none focus:ring-2 focus:ring-obs-violet/40"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="obs-label mb-1.5 block text-zinc-300">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  name="message"
                  rows={5}
                  className="w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-400 focus:border-obs-violet focus:outline-none focus:ring-2 focus:ring-obs-violet/40"
                  placeholder="Your message…"
                />
              </div>
              <ObsButton type="submit" variant="primary" className="w-full">
                Send message
              </ObsButton>
            </form>
          </ObsPanel>
        </div>
      </div>
    </div>
  );
}
