import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { createRawToken, hashToken } from "@/lib/security";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const formData = await request.formData();
  const { email } = schema.parse({ email: formData.get("email") });
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

  if (user) {
    const rawToken = createRawToken();
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });
    await sendEmail({
      to: user.email,
      subject: "Réinitialisation du mot de passe Cannabinoid Observatory Europe",
      html: `<p><a href="${appUrl(`/reinitialiser/${rawToken}`)}">Réinitialiser mon mot de passe</a></p><p>Ce lien expire dans 30 minutes.</p>`,
    });
  }

  return NextResponse.redirect(new URL("/mot-de-passe-oublie?sent=1", request.url));
}
