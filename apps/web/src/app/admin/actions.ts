"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const adminPaths = ["/admin", "/admin/utilisateurs", "/admin/referentiels", "/admin/audit"];

function revalidateAdmin() {
  for (const path of adminPaths) {
    revalidatePath(path);
  }
  revalidatePath("/admin/signalements");
  revalidatePath("/admin/declarations");
}

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
    db.moderationAction.create({
      data: {
        moderatorId: session.user.id,
        action: "ROLE_CHANGE",
        notes: `Rôle changé en ${role}`,
      },
    }),
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
  revalidateAdmin();
  revalidatePath(`/admin/utilisateurs/${userId}`);
}

export async function upsertLookupAction(formData: FormData) {
  await requireAdmin();
  const type = String(formData.get("type"));
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const slug = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (type === "molecule") {
    await db.molecule.upsert({ where: { slug }, update: { name: label }, create: { name: label, slug } });
  } else if (type === "claim") {
    await db.marketingClaim.upsert({ where: { slug }, update: { label }, create: { label, slug } });
  } else if (type === "effect") {
    await db.adverseEffect.upsert({ where: { slug }, update: { label }, create: { label, slug } });
  }
  revalidatePath("/admin/referentiels");
}

export async function suspendUserAction(formData: FormData) {
  const session = await requireAdmin();
  const userId = String(formData.get("userId"));
  const reason = String(formData.get("reason") ?? "").trim();

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { bannedAt: new Date() } }),
    db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "user.suspend",
        targetType: "user",
        targetId: userId,
        metadata: { reason: reason || null },
      },
    }),
  ]);
  revalidateAdmin();
  revalidatePath(`/admin/utilisateurs/${userId}`);
}

export async function unsuspendUserAction(formData: FormData) {
  const session = await requireAdmin();
  const userId = String(formData.get("userId"));

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { bannedAt: null } }),
    db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "user.unsuspend",
        targetType: "user",
        targetId: userId,
      },
    }),
  ]);
  revalidateAdmin();
  revalidatePath(`/admin/utilisateurs/${userId}`);
}

export async function forceVerifyEmailAction(formData: FormData) {
  const session = await requireAdmin();
  const userId = String(formData.get("userId"));

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } }),
    db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "user.force_verify_email",
        targetType: "user",
        targetId: userId,
      },
    }),
  ]);
  revalidateAdmin();
  revalidatePath(`/admin/utilisateurs/${userId}`);
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireAdmin();
  const userId = String(formData.get("userId"));

  if (userId === session.user.id) {
    return;
  }

  await db.$transaction(async (tx) => {
    await tx.report.deleteMany({ where: { createdById: userId } });
    await tx.adverseEffectDeclaration.deleteMany({ where: { createdById: userId } });
    await tx.emailVerificationToken.deleteMany({ where: { userId } });
    await tx.passwordResetToken.deleteMany({ where: { userId } });
    await tx.moderationAction.updateMany({ where: { moderatorId: userId }, data: { moderatorId: null } });
    await tx.auditLog.updateMany({ where: { userId }, data: { userId: null } });
    await tx.user.delete({ where: { id: userId } });
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "user.delete",
        targetType: "user",
        targetId: userId,
      },
    });
  });

  revalidateAdmin();
  redirect("/admin/utilisateurs");
}
