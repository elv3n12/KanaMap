import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One-off data migration: translate French claim/effect labels to English in
// place, merging any English duplicates created by an earlier seed run.
// Guarded by the MIGRATION_TOKEN env var (sent via the x-migration-token
// header). Molecule names are intentionally left untouched.

type Pair = readonly [fr: string, en: string];

const CLAIMS: Pair[] = [
  ["légal", "legal"],
  ["naturel", "natural"],
  ["issu du CBD", "CBD-derived"],
  ["alternative au THC", "THC alternative"],
  ["sans risque", "risk-free"],
  ["non addictif", "non-addictive"],
  ["relaxant", "relaxing"],
  ["puissant", "potent"],
  ["conforme UE", "EU compliant"],
  ["effet cannabis légal", "legal cannabis effect"],
  ["moins dangereux que le THC", "safer than THC"],
  ["nouvelle molécule", "new molecule"],
  ["premium", "premium"],
  ["pas détectable", "undetectable"],
  ["autre", "other"],
];

const ADVERSE: Pair[] = [
  ["anxiété", "anxiety"],
  ["crise de panique", "panic attack"],
  ["palpitations", "palpitations"],
  ["tachycardie", "tachycardia"],
  ["malaise", "general malaise"],
  ["nausées", "nausea"],
  ["vomissements", "vomiting"],
  ["confusion", "confusion"],
  ["hallucinations", "hallucinations"],
  ["perte de contrôle", "loss of control"],
  ["somnolence excessive", "excessive drowsiness"],
  ["irritabilité", "irritability"],
  ["insomnie", "insomnia"],
  ["sueurs nocturnes", "night sweats"],
  ["cauchemars", "nightmares"],
  ["symptômes de sevrage", "withdrawal symptoms"],
  ["craving", "craving"],
  ["consommation compulsive", "compulsive use"],
  ["besoin de reprendre au réveil", "need to use upon waking"],
  ["passage aux urgences", "emergency room visit"],
  ["appel à un centre antipoison", "poison control center call"],
  ["interaction médicamenteuse suspectée", "suspected drug interaction"],
  ["autre", "other"],
];

const POSITIVE: Pair[] = [
  ["détente", "relaxation"],
  ["euphorie légère", "mild euphoria"],
  ["rires", "laughter"],
  ["créativité", "creativity"],
  ["concentration", "focus"],
  ["somnolence agréable", "pleasant drowsiness"],
  ["désinhibition", "disinhibition"],
  ["stimulation", "stimulation"],
  ["sensation corporelle agréable", "pleasant body sensation"],
  ["autre", "other"],
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type LookupModel = {
  findUnique: (args: { where: { slug: string } }) => Promise<{ id: string; label: string; slug: string } | null>;
  update: (args: { where: { id: string }; data: { label?: string; slug?: string } }) => Promise<unknown>;
  create: (args: { data: { label: string; slug: string } }) => Promise<unknown>;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
  findMany: (args: { orderBy: { label: "asc" } }) => Promise<{ id: string; label: string; slug: string }[]>;
};

type TableConfig = {
  name: string;
  model: LookupModel;
  pairs: Pair[];
  // join tables that reference this lookup's id, with the FK column name
  joins: { table: string; column: string }[];
};

const CONFIGS: TableConfig[] = [
  {
    name: "marketing_claims",
    model: db.marketingClaim as unknown as LookupModel,
    pairs: CLAIMS,
    joins: [{ table: "report_marketing_claims", column: "claim_id" }],
  },
  {
    name: "adverse_effects",
    model: db.adverseEffect as unknown as LookupModel,
    pairs: ADVERSE,
    joins: [
      { table: "report_adverse_effects", column: "effect_id" },
      { table: "adverse_effect_declaration_effects", column: "effect_id" },
    ],
  },
  {
    name: "positive_effects",
    model: db.positiveEffect as unknown as LookupModel,
    pairs: POSITIVE,
    joins: [{ table: "report_positive_effects", column: "effect_id" }],
  },
];

function authorized(request: Request) {
  const token = process.env.MIGRATION_TOKEN;
  return Boolean(token) && request.headers.get("x-migration-token") === token;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const result: Record<string, { id: string; label: string; slug: string }[]> = {};
  for (const cfg of CONFIGS) {
    result[cfg.name] = await cfg.model.findMany({ orderBy: { label: "asc" } });
  }
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const actions: string[] = [];

  for (const cfg of CONFIGS) {
    for (const [fr, en] of cfg.pairs) {
      const frSlug = slugify(fr);
      const enSlug = slugify(en);

      if (frSlug === enSlug) {
        const row = await cfg.model.findUnique({ where: { slug: frSlug } });
        if (row && row.label !== en) {
          await cfg.model.update({ where: { id: row.id }, data: { label: en } });
          actions.push(`${cfg.name}: relabeled "${row.label}" -> "${en}"`);
        }
        continue;
      }

      const frRow = await cfg.model.findUnique({ where: { slug: frSlug } });
      const enRow = await cfg.model.findUnique({ where: { slug: enSlug } });

      if (frRow && enRow) {
        // Merge French row into the English one, repointing references.
        for (const join of cfg.joins) {
          await db.$executeRawUnsafe(
            `UPDATE IGNORE ${join.table} SET ${join.column} = ? WHERE ${join.column} = ?`,
            enRow.id,
            frRow.id,
          );
        }
        // Deleting the French lookup row cascades away any leftover (conflicting) join rows.
        await cfg.model.delete({ where: { id: frRow.id } });
        if (enRow.label !== en) {
          await cfg.model.update({ where: { id: enRow.id }, data: { label: en } });
        }
        actions.push(`${cfg.name}: merged "${fr}" into "${en}"`);
      } else if (frRow && !enRow) {
        await cfg.model.update({ where: { id: frRow.id }, data: { label: en, slug: enSlug } });
        actions.push(`${cfg.name}: renamed "${fr}" -> "${en}"`);
      } else if (!frRow && enRow) {
        if (enRow.label !== en) {
          await cfg.model.update({ where: { id: enRow.id }, data: { label: en } });
          actions.push(`${cfg.name}: fixed label for "${en}"`);
        }
      } else {
        await cfg.model.create({ data: { label: en, slug: enSlug } });
        actions.push(`${cfg.name}: created "${en}"`);
      }
    }
  }

  const after: Record<string, { id: string; label: string; slug: string }[]> = {};
  for (const cfg of CONFIGS) {
    after[cfg.name] = await cfg.model.findMany({ orderBy: { label: "asc" } });
  }

  return NextResponse.json({ actions, after });
}
