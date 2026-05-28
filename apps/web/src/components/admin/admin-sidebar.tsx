import Link from "next/link";
import { getAdminCounts, isAdmin } from "@/lib/admin";
import { linkNav } from "@/lib/ui/button-classes";

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
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Administration</p>
      <nav className="flex flex-col gap-1" aria-label="Admin navigation">
        {items.map((item) => {
          if (item.adminOnly && !admin) return null;
          return (
            <Link key={item.href} href={item.href} className={`${linkNav} flex items-center justify-between gap-2`}>
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 ? (
                <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-medium text-white">
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
