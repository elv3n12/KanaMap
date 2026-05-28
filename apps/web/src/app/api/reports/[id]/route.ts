import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializePublicReport } from "@/lib/report-serializers";

type Params = { params: Promise<{ id: string }> };

const includeReport = {
  location: true,
  product: true,
  brand: true,
  molecules: { include: { molecule: true } },
  marketingClaims: { include: { claim: true } },
  adverseEffects: { include: { effect: true } },
} as const;

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const report = await db.report.findUnique({
    where: { id },
    include: includeReport,
  });

  if (!report || report.moderationStatus !== "PUBLISHED") {
    return NextResponse.json({ error: "Signalement non publié" }, { status: 404 });
  }

  return NextResponse.json({ report: serializePublicReport(report) });
}
