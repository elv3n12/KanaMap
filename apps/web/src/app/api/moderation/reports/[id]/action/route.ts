import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { actionToStatus, canModerate } from "@/lib/moderation";
import { getIpFromRequest, hashIp } from "@/lib/security";
import { moderationActionSchema } from "@/server/schemas/report";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!canModerate(session?.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = moderationActionSchema.parse(await request.json());
  const report = await db.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Signalement introuvable" }, { status: 404 });

  if (body.action === "DELETE") {
    await db.$transaction([
      db.auditLog.create({
        data: {
          userId: session!.user.id,
          ipHash: hashIp(getIpFromRequest(request)),
          action: "moderation.delete",
          targetType: "report",
          targetId: id,
          metadata: { previousStatus: report.moderationStatus, notes: body.notes },
        },
      }),
      db.report.delete({ where: { id } }),
    ]);
    return NextResponse.json({ ok: true, deleted: true });
  }

  const nextStatus = actionToStatus(body.action);
  const nextProofLevel = body.action === "CHANGE_PROOF_LEVEL" && body.proofLevel ? body.proofLevel : report.proofLevel;

  await db.$transaction([
    db.report.update({
      where: { id },
      data: {
        ...(nextStatus ? { moderationStatus: nextStatus } : {}),
        proofLevel: nextProofLevel,
        ...(nextStatus === "PUBLISHED" ? { publishedAt: new Date() } : {}),
        ...(body.action === "MASK_ADDRESS" ? { exactAddressEncrypted: null, exactLat: null, exactLng: null } : {}),
      },
    }),
    db.moderationAction.create({
      data: {
        reportId: id,
        moderatorId: session!.user.id,
        action: body.action,
        beforeStatus: report.moderationStatus,
        afterStatus: nextStatus,
        notes: body.notes,
      },
    }),
    db.auditLog.create({
      data: {
        userId: session!.user.id,
        ipHash: hashIp(getIpFromRequest(request)),
        action: `moderation.${body.action.toLowerCase()}`,
        targetType: "report",
        targetId: id,
        metadata: { proofLevel: nextProofLevel },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
