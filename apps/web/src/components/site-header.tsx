import Link from "next/link";
import { auth } from "@/auth";
import { branding } from "@/lib/branding";
import { canModerate } from "@/lib/moderation";
import { NavLinks } from "@/components/nav-links";

export async function SiteHeader() {
  const session = await auth();
  const isAdmin = !!session?.user && canModerate(session.user.role);

  const items = [
    { href: "/map", label: "Map" },
    { href: "/understand", label: "Understand" },
    { href: "/contact", label: "Contact" },
    ...(session?.user
      ? [
          { href: "/account", label: "My account" },
          ...(isAdmin ? [{ href: "/admin", label: "Admin", badge: true }] : []),
        ]
      : [{ href: "/login", label: "Login" }]),
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-[1000] border-b border-obs-border bg-obs-void/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[100vw] items-center justify-between gap-4 px-4">
        <Link
          href="/map"
          className="group flex min-w-0 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-obs-void"
        >
          <span className="truncate font-semibold leading-tight tracking-tight text-zinc-100">
            {branding.appName}
          </span>
          <span className="obs-label mt-0.5 text-[10px] text-obs-signal group-hover:text-obs-violet">
            {branding.monoSubtitle}
          </span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          <NavLinks items={items} isAdmin={isAdmin} />
          <Link
            href="/reports/new"
            className="ml-2 hidden shrink-0 items-center justify-center rounded border border-violet-600/50 bg-obs-violet px-3 py-1.5 text-sm font-medium text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 sm:inline-flex"
          >
            Report
          </Link>
        </nav>
      </div>
    </header>
  );
}
