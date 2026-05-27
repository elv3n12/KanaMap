import Link from "next/link";
import { loginAction } from "./actions";
import { btnPrimaryBlack, linkNav } from "@/lib/ui/button-classes";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ConnexionPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold">Connexion</h1>
      {params.signup ? (
        <p className="mt-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">
          Compte créé. Vérifiez votre boîte email avant de vous connecter.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">
          Identifiants invalides, email non vérifié ou compte suspendu.
        </p>
      ) : null}
      <form action={loginAction} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          Email
          <input required name="email" type="email" className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <label className="block text-sm font-medium">
          Mot de passe
          <input required name="password" type="password" className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <button className={btnPrimaryBlack} type="submit">
          Se connecter
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <Link className={linkNav} href="/inscription">
          Créer un compte
        </Link>
        <Link className={linkNav} href="/mot-de-passe-oublie">
          Mot de passe oublié
        </Link>
      </div>
    </div>
  );
}
