import { contactInstitutionAction } from "./actions";

export default function InstitutionsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Institutions et journalistes</h1>
      <div className="mt-6 space-y-4 rounded-2xl bg-white p-6 leading-7 shadow-sm">
        <p>Nous souhaitons aider les institutions à mieux voir un phénomène qui évolue plus vite que les mécanismes réglementaires classiques.</p>
        <p>L’observatoire documente les zones concernées, molécules signalées, formes commerciales, allégations marketing, niveaux de preuve et effets indésirables rapportés.</p>
        <p>Les exports publics sont anonymisés. Les données sensibles, adresses exactes et documents non validés restent réservés à la modération.</p>
        <p>Les institutions, journalistes, chercheurs et associations peuvent demander un échange, signaler une erreur ou solliciter un rapport méthodologique.</p>
      </div>
      <form action={contactInstitutionAction} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <input required name="email" type="email" className="w-full rounded-lg border p-3" placeholder="Email professionnel" />
        <textarea required name="message" rows={5} className="w-full rounded-lg border p-3" placeholder="Votre demande" />
        <button className="rounded-lg bg-slate-900 px-4 py-3 text-white">Envoyer</button>
      </form>
    </div>
  );
}
