"use server";

import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";

export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  await db.$transaction([
    db.report.updateMany({
      where: { createdById: session.user.id },
      data: { createdById: null },
    }),
    db.adverseEffectDeclaration.updateMany({
      where: { createdById: session.user.id },
      data: { createdById: null },
    }),
    db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "account.delete",
        targetType: "user",
        targetId: session.user.id,
      },
    }),
    db.user.update({
      where: { id: session.user.id },
      data: {
        email: `deleted-${session.user.id}@anonymous.local`,
        bannedAt: new Date(),
      },
    }),
  ]);

  await signOut({ redirectTo: "/" });
}
