import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { branding } from "@/lib/branding";
import { db } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { createRawToken, getIpFromRequest, hashToken } from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";
import { signupInputSchema } from "@/server/schemas/signup";

export async function POST(request: Request) {
  const formData = await request.formData();
  const turnstileOk = await verifyTurnstile(String(formData.get("turnstileToken") ?? ""), getIpFromRequest(request));
  if (!turnstileOk) {
    return NextResponse.json({ error: "Anti-spam invalide" }, { status: 400 });
  }

  const { email, password } = signupInputSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
    termsAccepted: formData.get("termsAccepted"),
    charterAccepted: formData.get("charterAccepted"),
  });

  const normalizedEmail = email.toLowerCase();
  const user = await db.user.upsert({
    where: { email: normalizedEmail },
    update: {},
    create: {
      email: normalizedEmail,
      passwordHash: await hash(password, 12),
      termsAcceptedAt: new Date(),
      charterAcceptedAt: new Date(),
      charterVersion: branding.charterVersion,
    },
  });

  if (!user.emailVerifiedAt) {
    const rawToken = createRawToken();
    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    await sendEmail({
      to: normalizedEmail,
      subject: `Confirmez votre compte ${branding.appName}`,
      html: `<p>Bienvenue sur ${branding.appName}.</p><p><a href="${appUrl(`/verifier-email/${rawToken}`)}">Confirmer mon email</a></p>`,
    });
  }

  return NextResponse.redirect(new URL("/connexion?signup=check-email", request.url));
}
