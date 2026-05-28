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
            className={`inline-flex items-center px-3 py-1.5 text-sm font-bold transition-colors ${
              isActive
                ? "rounded-full bg-slate-100 text-black"
                : "text-black hover:text-emerald-600 hover:underline underline-offset-4 active:text-black active:underline"
            }`}
          >
            {item.label}
            {item.badge && badge > 0 ? (
              <span
                className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-xs font-semibold text-white"
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
