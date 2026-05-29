import Link from "next/link";
import { loginAction } from "./actions";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="obs-label text-obs-signal">Observatory access</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Login</h1>
        </div>
        {params.signup ? (
          <p className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-950/50 p-3 text-sm text-emerald-300">
            Account created. Check your email to verify before logging in.
          </p>
        ) : null}
        {params.reset ? (
          <p className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-950/50 p-3 text-sm text-emerald-300">
            Password reset successful. You can now log in.
          </p>
        ) : null}
        {params.error ? (
          <p className="mt-4 rounded-md border border-red-500/30 bg-red-950/50 p-3 text-sm text-red-300">
            Invalid credentials, unverified email, or suspended account.
          </p>
        ) : null}
        <ObsPanel className="mt-6 p-6">
          <form action={loginAction} className="space-y-4">
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
            <div>
              <label htmlFor="password" className="obs-label mb-1.5 block text-zinc-300">
                Password
              </label>
              <input
                id="password"
                required
                name="password"
                type="password"
                className="min-h-11 w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-500 focus:border-obs-violet focus:outline-none focus:ring-2 focus:ring-obs-violet/40"
              />
            </div>
            <ObsButton type="submit" variant="primary" className="w-full">
              Log in
            </ObsButton>
          </form>
        </ObsPanel>
        <div className="mt-4 flex justify-between text-sm">
          <Link className="text-zinc-400 hover:text-obs-signal" href="/signup">
            Create account
          </Link>
          <Link className="text-zinc-400 hover:text-obs-signal" href="/forgot-password">
            Forgot password
          </Link>
        </div>
      </div>
    </div>
  );
}
