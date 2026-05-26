import { PrismaClient, UserRole } from "@prisma/client";
import { appUrl, sendEmail } from "../email.js";

const prisma = new PrismaClient();

export async function sendModerationSummary() {
  const [pendingReports, contestedReports, pendingDeclarations, moderators] = await Promise.all([
    prisma.report.count({ where: { moderationStatus: "PENDING_REVIEW" } }),
    prisma.report.count({ where: { moderationStatus: "CONTESTED" } }),
    prisma.adverseEffectDeclaration.count({ where: { moderationStatus: "PENDING_REVIEW" } }),
    prisma.user.findMany({
      where: { role: { in: [UserRole.MODERATOR, UserRole.ADMIN] }, emailVerifiedAt: { not: null }, bannedAt: null },
    }),
  ]);

  for (const moderator of moderators) {
    await sendEmail(
      moderator.email,
      "Résumé quotidien de modération",
      `<p>Signalements en attente: ${pendingReports}</p><p>Signalements contestés: ${contestedReports}</p><p>Déclarations d'effets en attente: ${pendingDeclarations}</p><p><a href="${appUrl("/moderation")}">Ouvrir la file de modération</a></p>`,
    );
  }

  return { pendingReports, contestedReports, pendingDeclarations, recipients: moderators.length };
}
