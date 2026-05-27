import { contactAction } from "./actions";
import { btnPrimary } from "@/lib/ui/button-classes";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <div className="mt-6 space-y-4 rounded-2xl bg-white p-6 leading-7 text-slate-800 shadow-sm">
        <p>
          Vous souhaitez nous écrire, signaler une erreur, proposer une collaboration ou demander des
          précisions sur la méthodologie ? Utilisez le formulaire ci-dessous.
        </p>
        <p>
          L&apos;observatoire documente les zones concernées, molécules signalées, formes commerciales,
          allégations marketing, niveaux de preuve et effets indésirables rapportés.
        </p>
        <p>
          Les exports publics sont anonymisés. Les données sensibles restent réservées à la modération.
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
          Envoyer
        </button>
      </form>
    </div>
  );
}
