import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getIpFromRequest, getVisitorHash } from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";
import { contestationSchema } from "@/server/schemas/report";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = contestationSchema.parse(await request.json());
  const ip = getIpFromRequest(request);
  const ok = await verifyTurnstile(body.turnstileToken, ip);
  if (!ok) return NextResponse.json({ error: "Anti-spam invalide" }, { status: 400 });

  const report = await db.report.findUnique({ where: { id } });
  if (!report || !["PUBLISHED", "PUBLISHED_LIMITED"].includes(report.moderationStatus)) {
    return NextResponse.json({ error: "Signalement introuvable" }, { status: 404 });
  }

  await db.$transaction([
    db.report.update({
      where: { id },
      data: { moderationStatus: "CONTESTED" },
    }),
    db.moderationAction.create({
      data: {
        reportId: id,
        action: "CONTEST",
        beforeStatus: report.moderationStatus,
        afterStatus: "CONTESTED",
        notes: body.message,
      },
    }),
    db.auditLog.create({
      data: {
        ipHash: getVisitorHash(request),
        action: "report.contest",
        targetType: "report",
        targetId: id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
