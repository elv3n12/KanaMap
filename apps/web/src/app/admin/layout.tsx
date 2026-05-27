import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { canAccessAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!canAccessAdmin(session?.user.role)) redirect("/");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl">
      <AdminSidebar role={session!.user.role} />
      <div className="min-w-0 flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
