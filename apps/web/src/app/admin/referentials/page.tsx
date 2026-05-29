import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { upsertLookupAction } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { ObsButton, ObsPanel } from "@/components/ui/obs";

export const dynamic = "force-dynamic";

export default async function AdminReferentielsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const [molecules, claims, effects, brands, products] = await Promise.all([
    db.molecule.findMany({ orderBy: { name: "asc" } }),
    db.marketingClaim.findMany({ orderBy: { label: "asc" } }),
    db.adverseEffect.findMany({ orderBy: { label: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" }, take: 50 }),
    db.product.findMany({ orderBy: { commercialName: "asc" }, include: { brand: true }, take: 50 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="obs-label text-obs-signal">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-100">Referentials</h1>
        <p className="mt-1 text-sm text-zinc-400">Molecules, marketing claims, effects, and observed catalogues.</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <Lookup title="Molecules" type="molecule" labels={molecules.map((item) => item.name)} />
        <Lookup title="Marketing claims" type="claim" labels={claims.map((item) => item.label)} />
        <Lookup title="Adverse effects" type="effect" labels={effects.map((item) => item.label)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ObsPanel className="p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Observed brands</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{brands.map((brand) => brand.name).join(", ") || "No brands."}</p>
        </ObsPanel>
        <ObsPanel className="p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Observed products</h2>
          <div className="mt-3 space-y-2 text-sm text-zinc-400">
            {products.map((product) => (
              <p key={product.id}>
                {product.commercialName} {product.brand ? <span className="text-zinc-500">· {product.brand.name}</span> : ""}
              </p>
            ))}
          </div>
        </ObsPanel>
      </section>
    </div>
  );
}

function Lookup({ title, type, labels }: { title: string; type: string; labels: string[] }) {
  return (
    <ObsPanel className="p-5">
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      <form action={upsertLookupAction} className="mt-4 flex gap-2">
        <input type="hidden" name="type" value={type} />
        <input
          required
          name="label"
          className="min-w-0 flex-1 rounded-md border border-obs-border bg-obs-surface p-2 text-zinc-100 placeholder:text-zinc-500"
          placeholder="Add…"
        />
        <ObsButton type="submit" variant="primary">
          Add
        </ObsButton>
      </form>
      <p className="mt-3 text-sm leading-6 text-zinc-500">{labels.join(", ") || "None yet."}</p>
    </ObsPanel>
  );
}
