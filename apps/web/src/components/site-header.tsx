import Link from "next/link";
import { auth, signOut } from "@/auth";
import { branding } from "@/lib/branding";
import { btnNavPill, btnNavPillBlack, linkNav } from "@/lib/ui/button-classes";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="fixed left-0 right-0 top-0 z-[1000] border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="max-w-[220px] font-semibold leading-tight tracking-tight text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {branding.appNameFr}
        </Link>
        <nav className="flex items-center gap-1 text-sm" aria-label="Navigation principale">
          <Link href="/carte" className={linkNav}>
            Carte
          </Link>
          <Link href="/comprendre" className={linkNav}>
            Comprendre
          </Link>
          <Link href="/contact" className={linkNav}>
            Contact
          </Link>
          {session?.user ? (
            <>
              <Link href="/signalements/nouveau" className={btnNavPill}>
                Signaler
              </Link>
              <Link href="/declarer-effet-indesirable" className={linkNav}>
                Effet indésirable
              </Link>
              <Link href="/compte" className={linkNav}>
                Compte
              </Link>
              {["MODERATOR", "ADMIN"].includes(session.user.role) ? (
                <Link href="/moderation" className={linkNav}>
                  Modération
                </Link>
              ) : null}
              {session.user.role === "ADMIN" ? (
                <Link href="/admin" className={linkNav}>
                  Admin
                </Link>
              ) : null}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className={linkNav} type="submit">
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/connexion" className={linkNav}>
                Connexion
              </Link>
              <Link href="/inscription" className={btnNavPillBlack}>
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
