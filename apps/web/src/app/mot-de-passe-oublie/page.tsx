import { btnPrimaryBlack } from "@/lib/ui/button-classes";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold">Mot de passe oublié</h1>
      {params.sent ? (
        <p className="mt-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">
          Si cet email existe, un lien vient d’être envoyé.
        </p>
      ) : null}
      <form action="/api/forgot-password" method="post" className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          Email
          <input required name="email" type="email" className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <button className={btnPrimaryBlack} type="submit">
          Envoyer le lien
        </button>
      </form>
    </div>
  );
}
