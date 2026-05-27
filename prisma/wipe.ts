/**
 * Full data reset: removes all reports, declarations, locations, brands/products,
 * and all users except the admin account. Reference tables (molecules, claims, effects) are kept.
 *
 * Run: tsx prisma/wipe.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.org";
  console.log(`[wipe] Keeping admin: ${adminEmail}`);

  await prisma.auditLog.deleteMany();
  await prisma.moderationAction.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.reportMolecule.deleteMany();
  await prisma.reportMarketingClaim.deleteMany();
  await prisma.reportAdverseEffect.deleteMany();
  await prisma.report.deleteMany();
  await prisma.adverseEffectDeclarationMolecule.deleteMany();
  await prisma.adverseEffectDeclarationEffect.deleteMany();
  await prisma.adverseEffectDeclaration.deleteMany();
  await prisma.location.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();

  const deletedUsers = await prisma.user.deleteMany({
    where: { email: { not: adminEmail } },
  });

  const remaining = await prisma.user.count();
  const remainingReports = await prisma.report.count();
  const remainingDeclarations = await prisma.adverseEffectDeclaration.count();

  console.log(`[wipe] Deleted ${deletedUsers.count} user(s)`);
  console.log(`[wipe] Remaining users: ${remaining}`);
  console.log(`[wipe] Remaining reports: ${remainingReports}`);
  console.log(`[wipe] Remaining declarations: ${remainingDeclarations}`);
  console.log("[wipe] Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
