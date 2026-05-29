import { ObsButton, ObsPanel } from "@/components/ui/obs";

type Props = { params: Promise<{ token: string }> };

export default async function ResetPasswordPage({ params }: Props) {
  const { token } = await params;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="obs-label text-obs-signal">Account recovery</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-100">New password</h1>
        </div>
        <ObsPanel className="mt-6 p-6">
          <form action={`/api/reset-password/${token}`} method="post" className="space-y-4">
            <div>
              <label htmlFor="password" className="obs-label mb-1.5 block text-zinc-300">
                New password
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
            <ObsButton type="submit" variant="primary" className="w-full">
              Save
            </ObsButton>
          </form>
        </ObsPanel>
      </div>
    </div>
  );
}
