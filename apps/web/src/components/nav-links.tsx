"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminCounts } from "@/hooks/use-admin-counts";

type NavItem = {
  href: string;
  label: string;
  badge?: boolean;
};

type Props = {
  items: NavItem[];
  isAdmin: boolean;
};

export function NavLinks({ items, isAdmin }: Props) {
  const pathname = usePathname();
  const counts = useAdminCounts(isAdmin);
  const badge = counts?.toReview ?? 0;

  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative inline-flex min-h-9 items-center px-2.5 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 ${
              isActive
                ? "text-obs-signal after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-obs-violet"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {item.label}
            {item.badge && badge > 0 ? (
              <span
                className="ml-1.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-amber-600 px-1.5 py-0.5 text-[10px] font-semibold text-obs-void"
                aria-label={`${badge} item(s) to review`}
              >
                {badge > 99 ? "99+" : badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </>
  );
}
