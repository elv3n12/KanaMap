import Link from "next/link";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";

type Props = { params: Promise<{ token: string }> };

export default async function VerifyEmailPage({ params }: Props) {
  const { token } = await params;
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  let message = "Lien invalide ou déjà utilisé.";

  if (record && !record.usedAt && record.expiresAt > new Date()) {
    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      db.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
    message = "Votre email est confirmé. Vous pouvez vous connecter.";
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold">Vérification email</h1>
      <p className="mt-4 rounded-2xl bg-white p-6 shadow-sm">{message}</p>
      <Link className="mt-6 inline-block rounded-lg bg-black px-4 py-3 text-white" href="/connexion">
        Aller à la connexion
      </Link>
    </div>
  );
}
