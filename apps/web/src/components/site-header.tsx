import Link from "next/link";
import { auth } from "@/auth";
import { AdminNavLink } from "@/components/admin/admin-nav-link";
import { branding } from "@/lib/branding";
import { canModerate } from "@/lib/moderation";
import { linkNav } from "@/lib/ui/button-classes";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="fixed left-0 right-0 top-0 z-[1000] border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="max-w-[220px] font-semibold leading-tight tracking-tight text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {branding.appNameFr}
          </Link>
          <Link
            href="/signalements/nouveau"
            className="inline-flex min-h-9 items-center rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Signaler
          </Link>
        </div>
        <nav className="flex items-center gap-1 text-sm" aria-label="Navigation principale">
          <Link href="/carte" className="inline-flex min-h-11 items-center rounded px-2 bg-slate-100 font-medium text-slate-900">
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
              <Link href="/compte" className={linkNav}>
                Mon compte
              </Link>
              {canModerate(session.user.role) ? <AdminNavLink /> : null}
            </>
          ) : (
            <Link href="/connexion" className={linkNav}>
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
