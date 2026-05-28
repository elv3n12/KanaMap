import Link from "next/link";
import { loginAction } from "./actions";
import { btnPrimaryBlack, linkNav } from "@/lib/ui/button-classes";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold">Login</h1>
      {params.signup ? (
        <p className="mt-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">
          Account created. Check your email to verify before logging in.
        </p>
      ) : null}
      {params.reset ? (
        <p className="mt-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">
          Password reset successful. You can now log in.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">
          Invalid credentials, unverified email, or suspended account.
        </p>
      ) : null}
      <form action={loginAction} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          Email
          <input required name="email" type="email" className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input required name="password" type="password" className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <button className={btnPrimaryBlack} type="submit">
          Log in
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <Link className={linkNav} href="/signup">
          Create account
        </Link>
        <Link className={linkNav} href="/forgot-password">
          Forgot password
        </Link>
      </div>
    </div>
  );
}
