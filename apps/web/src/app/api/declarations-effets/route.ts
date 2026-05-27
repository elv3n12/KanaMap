import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getIpFromRequest, hashIp } from "@/lib/security";

export async function POST(request: Request) {
  const session = await auth();
  await db.auditLog.create({
    data: {
      userId: session?.user?.id,
      ipHash: hashIp(getIpFromRequest(request)),
      action: "legacy.declarations_effets.hit",
      targetType: "adverse_effect_declaration",
    },
  });

  return NextResponse.json(
    {
      error:
        "Cette API est obsolète. Utilisez le parcours unifié de signalement : /signalements/nouveau",
    },
    { status: 410 },
  );
}
