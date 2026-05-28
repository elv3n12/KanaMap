import Link from "next/link";
import { auth } from "@/auth";
import { branding } from "@/lib/branding";
import { canModerate } from "@/lib/moderation";
import { NavLinks } from "@/components/nav-links";

export async function SiteHeader() {
  const session = await auth();
  const isAdmin = !!session?.user && canModerate(session.user.role);

  const items = [
    { href: "/carte", label: "Carte" },
    { href: "/comprendre", label: "Comprendre" },
    { href: "/contact", label: "Contact" },
    ...(session?.user
      ? [
          { href: "/compte", label: "Mon compte" },
          ...(isAdmin ? [{ href: "/admin", label: "Admin", badge: true }] : []),
        ]
      : [{ href: "/connexion", label: "Connexion" }]),
    { href: "/signalements/nouveau", label: "Signaler" },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-[1000] border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-semibold leading-tight tracking-tight text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {branding.appNameFr}
        </Link>
        <nav className="flex items-center gap-1" aria-label="Navigation principale">
          <NavLinks items={items} isAdmin={isAdmin} />
        </nav>
      </div>
    </header>
  );
}
