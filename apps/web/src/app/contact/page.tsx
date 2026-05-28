import { contactAction } from "./actions";
import { btnPrimary } from "@/lib/ui/button-classes";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <div className="mt-6 space-y-4 rounded-2xl bg-white p-6 leading-7 text-slate-800 shadow-sm">
        <p>
          Want to write to us, report an error, propose a collaboration, or ask questions about
          our methodology? Use the form below.
        </p>
        <p>
          The observatory documents affected zones, reported molecules, commercial forms,
          marketing claims, proof levels, and reported adverse effects.
        </p>
        <p>
          Public exports are anonymized. Sensitive data remains reserved for moderation.
        </p>
      </div>
      <form action={contactAction} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-slate-800">
            Email
          </label>
          <input
            id="contact-email"
            required
            name="email"
            type="email"
            autoComplete="email"
            className="min-h-11 w-full rounded-lg border border-slate-300 p-3 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-slate-800">
            Message
          </label>
          <textarea
            id="contact-message"
            required
            name="message"
            rows={5}
            className="min-h-11 w-full rounded-lg border border-slate-300 p-3 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          />
        </div>
        <button className={btnPrimary} type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
