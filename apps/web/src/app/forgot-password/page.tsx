import Link from "next/link";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="obs-label text-obs-signal">Account recovery</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Forgot password</h1>
        </div>
        {params.sent ? (
          <p className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-950/50 p-3 text-sm text-emerald-300">
            If this email exists, a reset link has been sent.
          </p>
        ) : null}
        {params.invalid ? (
          <p className="mt-4 rounded-md border border-red-500/30 bg-red-950/50 p-3 text-sm text-red-300">
            Invalid or expired link. Please request a new one.
          </p>
        ) : null}
        <ObsPanel className="mt-6 p-6">
          <form action="/api/forgot-password" method="post" className="space-y-4">
            <div>
              <label htmlFor="email" className="obs-label mb-1.5 block text-zinc-300">
                Email
              </label>
              <input
                id="email"
                required
                name="email"
                type="email"
                className="min-h-11 w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-500 focus:border-obs-violet focus:outline-none focus:ring-2 focus:ring-obs-violet/40"
              />
            </div>
            <ObsButton type="submit" variant="primary" className="w-full">
              Send reset link
            </ObsButton>
          </form>
        </ObsPanel>
        <p className="mt-4 text-center text-sm text-zinc-400">
          <Link href="/login" className="text-obs-signal hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
