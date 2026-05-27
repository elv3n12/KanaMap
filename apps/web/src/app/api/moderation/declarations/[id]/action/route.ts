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
  const declaration = await db.adverseEffectDeclaration.findUnique({ where: { id } });
  if (!declaration) {
    return NextResponse.json({ error: "Déclaration introuvable" }, { status: 404 });
  }

  const nextStatus = actionToStatus(body.action);
  const nextProofLevel =
    body.action === "CHANGE_PROOF_LEVEL" && body.proofLevel ? body.proofLevel : declaration.proofLevel;

  await db.$transaction([
    db.adverseEffectDeclaration.update({
      where: { id },
      data: {
        ...(nextStatus ? { moderationStatus: nextStatus } : {}),
        proofLevel: nextProofLevel,
      },
    }),
    db.moderationAction.create({
      data: {
        declarationId: id,
        moderatorId: session!.user.id,
        action: body.action,
        beforeStatus: declaration.moderationStatus,
        afterStatus: nextStatus,
        notes: body.notes,
      },
    }),
    db.auditLog.create({
      data: {
        userId: session!.user.id,
        ipHash: hashIp(getIpFromRequest(request)),
        action: `moderation.declaration.${body.action.toLowerCase()}`,
        targetType: "adverse_effect_declaration",
        targetId: id,
        metadata: { proofLevel: nextProofLevel },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
