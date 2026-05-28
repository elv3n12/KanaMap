import { btnPrimaryBlack } from "@/lib/ui/button-classes";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold">Forgot password</h1>
      {params.sent ? (
        <p className="mt-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">
          If this email exists, a reset link has been sent.
        </p>
      ) : null}
      {params.invalid ? (
        <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">
          Invalid or expired link. Please request a new one.
        </p>
      ) : null}
      <form action="/api/forgot-password" method="post" className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          Email
          <input required name="email" type="email" className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <button className={btnPrimaryBlack} type="submit">
          Send reset link
        </button>
      </form>
    </div>
  );
}
