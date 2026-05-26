import Link from "next/link";
import { TurnstileWidget } from "@/components/turnstile-widget";

export default function InscriptionPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold">Créer un compte contributeur</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Le compte sert à soumettre des signalements et à limiter les abus. Votre identité n’est pas
        affichée publiquement.
      </p>
      <form action="/api/signup" method="post" className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          Email
          <input required name="email" type="email" className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <label className="block text-sm font-medium">
          Mot de passe
          <input required minLength={8} name="password" type="password" className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <label className="flex items-start gap-2 text-sm leading-6">
          <input required type="checkbox" name="termsAccepted" className="mt-1" />
          <span>J’accepte les <Link href="/legal/cgu" className="underline">conditions d’utilisation</Link>.</span>
        </label>
        <label className="flex items-start gap-2 text-sm leading-6">
          <input required type="checkbox" name="charterAccepted" className="mt-1" />
          <span>J’accepte la <Link href="/charte" className="underline">charte de contribution</Link>.</span>
        </label>
        <TurnstileWidget />
        <button className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white" type="submit">
          Créer mon compte
        </button>
      </form>
    </div>
  );
}
