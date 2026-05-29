import Link from "next/link";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/security";
import { ObsButton } from "@/components/ui/obs";

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
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <p className="obs-label text-obs-signal">Verification</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Email verification</h1>
        <p className="mt-4 rounded-lg border border-obs-border bg-obs-surface p-6 text-zinc-300">{message}</p>
        <Link href="/login" className="mt-6 inline-block">
          <ObsButton variant="primary">Go to login</ObsButton>
        </Link>
      </div>
    </div>
  );
}
