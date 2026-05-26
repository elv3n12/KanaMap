import Link from "next/link";
import { auth, signOut } from "@/auth";
import { branding } from "@/lib/branding";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="fixed left-0 right-0 top-0 z-[1000] border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="max-w-[220px] font-semibold leading-tight tracking-tight">
          {branding.appNameFr}
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/carte" className="hover:underline">
            Carte
          </Link>
          <Link href="/comprendre" className="hover:underline">
            Comprendre
          </Link>
          <Link href="/institutions" className="hover:underline">
            Institutions
          </Link>
          {session?.user ? (
            <>
              <Link href="/signalements/nouveau" className="rounded-full bg-slate-900 px-3 py-1.5 text-white">
                Signaler
              </Link>
              <Link href="/declarer-effet-indesirable" className="hover:underline">
                Effet indésirable
              </Link>
              <Link href="/compte" className="hover:underline">
                Compte
              </Link>
              {["MODERATOR", "ADMIN"].includes(session.user.role) ? (
                <Link href="/moderation" className="hover:underline">
                  Modération
                </Link>
              ) : null}
              {session.user.role === "ADMIN" ? (
                <Link href="/admin" className="hover:underline">
                  Admin
                </Link>
              ) : null}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="hover:underline" type="submit">
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/connexion" className="hover:underline">
                Connexion
              </Link>
              <Link href="/inscription" className="rounded-full bg-black px-3 py-1.5 text-white">
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
