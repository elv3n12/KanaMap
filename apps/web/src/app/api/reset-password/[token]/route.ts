import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";

const schema = z.object({ password: z.string().min(8) });
type Params = { params: Promise<{ token: string }> };

export async function POST(request: Request, { params }: Params) {
  const { token } = await params;
  const formData = await request.formData();
  const { password } = schema.parse({ password: formData.get("password") });

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/forgot-password?invalid=1", request.url));
  }

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hash(password, 12) },
    }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.redirect(new URL("/login?reset=1", request.url));
}
