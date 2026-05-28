import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const seedDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(seedDir, "../apps/web");
const require = createRequire(import.meta.url);

const { PrismaClient, UserRole } = require(
  path.join(webRoot, "node_modules/.prisma/client"),
) as typeof import("@prisma/client");
const { hash } = require(path.join(webRoot, "node_modules/bcryptjs")) as typeof import("bcryptjs");

const prisma = new PrismaClient();

const molecules = [
  "CBD",
  "THC",
  "HHC",
  "HHC-O",
  "HHC-P",
  "THCP",
  "H4CBD",
  "10-OH-HHC",
  "8-OH-HHC",
  "T9HC",
  "THV-N10",
  "STV10",
  "Delta-8-THC",
  "Delta-10-THC",
  "CBN",
  "CBG",
  "Molécule inconnue",
  "Mélange non identifié",
  "Autre",
];

const claims = [
  "légal",
  "naturel",
  "issu du CBD",
  "alternative au THC",
  "sans risque",
  "non addictif",
  "relaxant",
  "puissant",
  "conforme UE",
  "effet cannabis légal",
  "moins dangereux que le THC",
  "nouvelle molécule",
  "premium",
  "pas détectable",
  "autre",
];

const effects = [
  "anxiété",
  "crise de panique",
  "palpitations",
  "tachycardie",
  "malaise",
  "nausées",
  "vomissements",
  "confusion",
  "hallucinations",
  "perte de contrôle",
  "somnolence excessive",
  "irritabilité",
  "insomnie",
  "sueurs nocturnes",
  "cauchemars",
  "symptômes de sevrage",
  "craving",
  "consommation compulsive",
  "besoin de reprendre au réveil",
  "passage aux urgences",
  "appel à un centre antipoison",
  "interaction médicamenteuse suspectée",
  "autre",
];

const positiveEffects = [
  "détente",
  "euphorie légère",
  "rires",
  "créativité",
  "concentration",
  "somnolence agréable",
  "désinhibition",
  "stimulation",
  "sensation corporelle agréable",
  "autre",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedLookups() {
  for (const name of molecules) {
    await prisma.molecule.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { name, slug: slugify(name) },
    });
  }
  for (const label of claims) {
    await prisma.marketingClaim.upsert({
      where: { slug: slugify(label) },
      update: { label },
      create: { label, slug: slugify(label) },
    });
  }
  for (const label of effects) {
    await prisma.adverseEffect.upsert({
      where: { slug: slugify(label) },
      update: { label },
      create: { label, slug: slugify(label) },
    });
  }
  for (const label of positiveEffects) {
    await prisma.positiveEffect.upsert({
      where: { slug: slugify(label) },
      update: { label },
      create: { label, slug: slugify(label) },
    });
  }
}

async function seedUsers() {
  const passwordHash = await hash(process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!", 12);
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.org";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.ADMIN, emailVerifiedAt: new Date() },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
      termsAcceptedAt: new Date(),
      charterAcceptedAt: new Date(),
      charterVersion: "2026-05-26",
    },
  });

  const moderatorEmail = process.env.SEED_MODERATOR_EMAIL;
  if (moderatorEmail) {
    await prisma.user.upsert({
      where: { email: moderatorEmail },
      update: { role: UserRole.MODERATOR, emailVerifiedAt: new Date() },
      create: {
        email: moderatorEmail,
        passwordHash,
        role: UserRole.MODERATOR,
        emailVerifiedAt: new Date(),
        termsAcceptedAt: new Date(),
        charterAcceptedAt: new Date(),
        charterVersion: "2026-05-26",
      },
    });
  }
}

async function main() {
  await seedLookups();
  await seedUsers();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
