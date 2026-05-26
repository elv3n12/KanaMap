import { redirect } from "next/navigation";

type Props = { params: Promise<{ token: string }> };

export default async function VerifyEmailPage({ params }: Props) {
  const { token } = await params;
  redirect(`/verifier-email/${token}`);
}
