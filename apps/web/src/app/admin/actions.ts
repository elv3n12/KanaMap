"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  return session;
}

export async function updateRoleAction(formData: FormData) {
  const session = await requireAdmin();
  const userId = String(formData.get("userId"));
  const role = String(formData.get("role")) as UserRole;
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { role } }),
    db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "user.role_change",
        targetType: "user",
        targetId: userId,
        metadata: { role },
      },
    }),
  ]);
  revalidatePath("/admin");
}

export async function upsertLookupAction(formData: FormData) {
  await requireAdmin();
  const type = String(formData.get("type"));
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const slug = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  if (type === "molecule") {
    await db.molecule.upsert({ where: { slug }, update: { name: label }, create: { name: label, slug } });
  } else if (type === "claim") {
    await db.marketingClaim.upsert({ where: { slug }, update: { label }, create: { label, slug } });
  } else if (type === "effect") {
    await db.adverseEffect.upsert({ where: { slug }, update: { label }, create: { label, slug } });
  }
  revalidatePath("/admin");
}
