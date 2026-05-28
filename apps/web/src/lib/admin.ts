import type { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { canModerate } from "@/lib/moderation";

export type AdminCounts = {
  pendingReports: number;
  contestedReports: number;
  pendingDeclarations: number;
  reportsWithEffects: number;
  recentPublished: number;
  totalUsers: number;
  toReview: number;
};

export function isAdmin(role?: string | null) {
  return role === "ADMIN";
}

export function canAccessAdmin(role?: string | null) {
  return canModerate(role);
}

export async function getAdminCounts(): Promise<AdminCounts> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [pendingReports, contestedReports, pendingDeclarations, reportsWithEffects, recentPublished, totalUsers] =
    await Promise.all([
      db.report.count({ where: { moderationStatus: "PENDING_REVIEW" } }),
      db.report.count({ where: { moderationStatus: "CONTESTED" } }),
      db.adverseEffectDeclaration.count({
        where: { moderationStatus: { in: ["PENDING_REVIEW", "CONTESTED"] } },
      }),
      db.report.count({ where: { adverseEffects: { some: {} } } }),
      db.report.count({
        where: { moderationStatus: "PUBLISHED", publishedAt: { gte: sevenDaysAgo } },
      }),
      db.user.count(),
    ]);

  const toReview = pendingReports + contestedReports + pendingDeclarations;

  return {
    pendingReports,
    contestedReports,
    pendingDeclarations,
    reportsWithEffects,
    recentPublished,
    totalUsers,
    toReview,
  };
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  USER: "Utilisateur",
  VERIFIED_CONTRIBUTOR: "Contributeur vérifié",
  MODERATOR: "Modérateur",
  ADMIN: "Administrateur",
  VERIFIED_INSTITUTION: "Institution vérifiée",
};
