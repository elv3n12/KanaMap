type Props = { params: Promise<{ token: string }> };

export default async function ResetPasswordPage({ params }: Props) {
  const { token } = await params;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold">Nouveau mot de passe</h1>
      <form action={`/api/reset-password/${token}`} method="post" className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          Nouveau mot de passe
          <input required minLength={8} name="password" type="password" className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <button className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white" type="submit">
          Enregistrer
        </button>
      </form>
    </div>
  );
}
