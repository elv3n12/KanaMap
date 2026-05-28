import Link from "next/link";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";
import { btnNavPillBlack } from "@/lib/ui/button-classes";

type Props = { params: Promise<{ token: string }> };

export default async function VerifyEmailPage({ params }: Props) {
  const { token } = await params;
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  let message = "Invalid or already used link.";

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
    message = "Your email is confirmed. You can now log in.";
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold">Email verification</h1>
      <p className="mt-4 rounded-2xl bg-white p-6 shadow-sm">{message}</p>
      <Link className={`mt-6 ${btnNavPillBlack}`} href="/login">
        Go to login
      </Link>
    </div>
  );
}
