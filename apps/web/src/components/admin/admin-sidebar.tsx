import Link from "next/link";
import { getAdminCounts, isAdmin } from "@/lib/admin";

type NavItem = {
  href: string;
  label: string;
  badge?: number;
  adminOnly?: boolean;
};

export async function AdminSidebar({ role }: { role: string }) {
  const counts = await getAdminCounts();
  const admin = isAdmin(role);

  const items: NavItem[] = [
    { href: "/admin", label: "Dashboard" },
    {
      href: "/admin/reports",
      label: "Reports",
      badge: counts.pendingReports + counts.contestedReports,
    },
    {
      href: "/admin/declarations",
      label: "Adverse effects",
      badge: counts.pendingDeclarations,
    },
    { href: "/admin/users", label: "Users", badge: counts.totalUsers, adminOnly: true },
    { href: "/admin/referentials", label: "Referentials", adminOnly: true },
    { href: "/admin/audit", label: "Audit log", adminOnly: true },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-obs-border bg-obs-elevated/50 p-4">
      <p className="obs-label mb-4 text-obs-signal">Administration</p>
      <nav className="flex flex-col gap-1" aria-label="Admin navigation">
        {items.map((item) => {
          if (item.adminOnly && !admin) return null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 transition hover:bg-obs-surface hover:text-white"
            >
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 ? (
                <span className="rounded-full bg-obs-violet px-2 py-0.5 text-xs font-medium text-white">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
