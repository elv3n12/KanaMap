import Link from "next/link";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="obs-label text-obs-signal">Join the Observatory</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Create an account</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            An account is required to submit reports and prevent abuse. Your identity is not displayed publicly.
          </p>
        </div>
        <ObsPanel className="mt-6 p-6">
          <form action="/api/signup" method="post" className="space-y-4">
            <div>
              <label htmlFor="email" className="obs-label mb-1.5 block text-zinc-300">
                Email
              </label>
              <input
                id="email"
                required
                name="email"
                type="email"
                className="min-h-11 w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-400 focus:border-obs-violet focus:outline-none focus:ring-2 focus:ring-obs-violet/40"
              />
            </div>
            <div>
              <label htmlFor="password" className="obs-label mb-1.5 block text-zinc-300">
                Password
              </label>
              <input
                id="password"
                required
                minLength={8}
                name="password"
                type="password"
                className="min-h-11 w-full rounded-md border border-obs-border bg-obs-surface p-3 text-zinc-100 placeholder:text-zinc-400 focus:border-obs-violet focus:outline-none focus:ring-2 focus:ring-obs-violet/40"
              />
            </div>
            <label className="flex items-start gap-2 text-sm leading-6 text-zinc-300">
              <input required type="checkbox" name="termsAccepted" className="mt-1 accent-obs-violet" />
              <span>
                I accept the <Link href="/legal/terms" className="text-obs-signal hover:underline">terms of use</Link>.
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm leading-6 text-zinc-300">
              <input required type="checkbox" name="charterAccepted" className="mt-1 accent-obs-violet" />
              <span>
                I accept the <Link href="/charter" className="text-obs-signal hover:underline">contribution charter</Link>.
              </span>
            </label>
            <TurnstileWidget />
            <ObsButton type="submit" variant="primary" className="w-full">
              Create my account
            </ObsButton>
          </form>
        </ObsPanel>
        <p className="mt-4 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-obs-signal hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
