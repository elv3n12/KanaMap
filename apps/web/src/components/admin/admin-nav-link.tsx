"use client";

import Link from "next/link";
import { useAdminCounts } from "@/hooks/use-admin-counts";
import { linkNav } from "@/lib/ui/button-classes";

export function AdminNavLink() {
  const counts = useAdminCounts(true);
  const badge = counts?.toReview ?? 0;

  return (
    <Link href="/admin" className={`${linkNav} relative inline-flex items-center gap-1.5`}>
      Admin
      {badge > 0 ? (
        <span
          className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-xs font-semibold text-white"
          aria-label={`${badge} élément(s) à vérifier`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}
