import {
  PlaceType,
  ProductType,
  ProofLevel,
  ReportStatus,
  UserRole,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

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

const locations = [
  ["FR", "France", "Paris", "11e", "Paris 11e", 48.858, 2.38],
  ["BE", "Belgique", "Bruxelles", "Centre", "Bruxelles Centre", 50.846, 4.351],
  ["DE", "Allemagne", "Berlin", "Mitte", "Berlin Mitte", 52.52, 13.405],
  ["ES", "Espagne", "Madrid", "Centro", "Madrid Centro", 40.416, -3.703],
  ["NL", "Pays-Bas", "Amsterdam", "Centrum", "Amsterdam Centrum", 52.37, 4.895],
  ["FR", "France", "Lyon", "3e", "Lyon 3e", 45.76, 4.86],
] as const;

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
}

async function seedUsers() {
  const passwordHash = await hash(process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!", 12);
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.org";
  const moderatorEmail = process.env.SEED_MODERATOR_EMAIL ?? "moderateur@example.org";

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

async function main() {
  await seedLookups();
  await seedUsers();

  const user = await prisma.user.upsert({
    where: { email: "contributeur-fictif@example.org" },
    update: {},
    create: {
      email: "contributeur-fictif@example.org",
      passwordHash: await hash("ChangeMe123!", 12),
      emailVerifiedAt: new Date(),
      termsAcceptedAt: new Date(),
      charterAcceptedAt: new Date(),
      charterVersion: "2026-05-26",
    },
  });

  const seededLocations = [];
  for (const [countryCode, countryName, city, district, displayZone, centroidLat, centroidLng] of locations) {
    seededLocations.push(
      await prisma.location.upsert({
        where: { countryCode_city_district: { countryCode, city, district } },
        update: { countryName, displayZone, centroidLat, centroidLng },
        create: { countryCode, countryName, city, district, displayZone, centroidLat, centroidLng },
      }),
    );
  }

  const brands = [];
  for (const label of ["Marque fictive A", "Marque fictive B", "Marque fictive C", "Marque fictive D", "Marque fictive E"]) {
    brands.push(
      await prisma.brand.upsert({
        where: { slug: slugify(label) },
        update: { name: label },
        create: { name: label, slug: slugify(label), country: "EU" },
      }),
    );
  }

  const products = [];
  for (let index = 0; index < 8; index += 1) {
    const commercialName = `Produit fictif ${String.fromCharCode(88 + (index % 3))}-${index + 1}`;
    products.push(
      await prisma.product.upsert({
        where: { brandId_slug: { brandId: brands[index % brands.length].id, slug: slugify(commercialName) } },
        update: { commercialName },
        create: {
          brandId: brands[index % brands.length].id,
          commercialName,
          slug: slugify(commercialName),
          defaultProductType: Object.values(ProductType)[index % Object.values(ProductType).length],
          firstSeenAt: new Date("2026-01-01"),
          lastSeenAt: new Date(),
        },
      }),
    );
  }

  const moleculeRows = await prisma.molecule.findMany();
  const claimRows = await prisma.marketingClaim.findMany();
  const effectRows = await prisma.adverseEffect.findMany();
  const statuses: ReportStatus[] = [
    "PUBLISHED",
    "PUBLISHED",
    "PUBLISHED_LIMITED",
    "PENDING_REVIEW",
    "PENDING_REVIEW",
    "REJECTED",
    "CONTESTED",
  ];
  const proofLevels: ProofLevel[] = ["L1_TESTIMONY", "L2_VISUAL", "L3_COMMERCIAL_DOC", "L4_LAB_ANALYSIS", "L5_SANITARY_SIGNAL"];

  for (let index = 0; index < 30; index += 1) {
    const product = products[index % products.length];
    const location = seededLocations[index % seededLocations.length];
    const existing = await prisma.report.findFirst({
      where: { productCommercialName: `${product.commercialName} observation ${index + 1}` },
    });
    if (existing) continue;

    await prisma.report.create({
      data: {
        createdById: user.id,
        locationId: location.id,
        placeType: Object.values(PlaceType)[index % Object.values(PlaceType).length],
        brandId: product.brandId,
        productId: product.id,
        productCommercialName: `${product.commercialName} observation ${index + 1}`,
        productType: product.defaultProductType,
        observationDate: new Date(Date.now() - index * 86400000),
        narrative: "Observation fictive créée pour tester les workflows de modération et d’agrégation.",
        moderationStatus: statuses[index % statuses.length],
        proofLevel: proofLevels[index % proofLevels.length],
        publishedAt: statuses[index % statuses.length] === "PUBLISHED" ? new Date() : null,
        molecules: {
          create: [
            { moleculeId: moleculeRows[index % moleculeRows.length].id, kind: "ANNOUNCED" },
            { moleculeId: moleculeRows[(index + 3) % moleculeRows.length].id, kind: "SUSPECTED" },
          ],
        },
        marketingClaims: { create: [{ claimId: claimRows[index % claimRows.length].id }] },
        adverseEffects: { create: [{ effectId: effectRows[index % effectRows.length].id }] },
        moderationActions: {
          create: { action: "SUBMIT", afterStatus: statuses[index % statuses.length], notes: "Seed fictif." },
        },
      },
    });
  }

  for (let index = 0; index < 3; index += 1) {
    await prisma.adverseEffectDeclaration.create({
      data: {
        createdById: user.id,
        countryCode: locations[index][0],
        productNameRaw: `Produit fictif effet ${index + 1}`,
        approximatePeriod: "Printemps 2026",
        effectDuration: "Plusieurs heures",
        narrative: "Déclaration fictive sans donnée personnelle.",
        molecules: { create: [{ moleculeId: moleculeRows[index].id, kind: "SUSPECTED" }] },
        effects: { create: [{ effectId: effectRows[index].id }] },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
