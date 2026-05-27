import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { upsertLookupAction } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { btnPrimary } from "@/lib/ui/button-classes";

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
        <h1 className="text-3xl font-semibold text-slate-900">Référentiels</h1>
        <p className="mt-2 text-slate-700">Molécules, allégations, effets et catalogues observés.</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <Lookup title="Molécules" type="molecule" labels={molecules.map((item) => item.name)} />
        <Lookup title="Allégations marketing" type="claim" labels={claims.map((item) => item.label)} />
        <Lookup title="Effets indésirables" type="effect" labels={effects.map((item) => item.label)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Marques observées</h2>
          <p className="mt-3 text-sm text-slate-600">{brands.map((brand) => brand.name).join(", ") || "Aucune marque."}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Produits observés</h2>
          <div className="mt-3 space-y-2 text-sm">
            {products.map((product) => (
              <p key={product.id}>
                {product.commercialName} {product.brand ? `· ${product.brand.name}` : ""}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Lookup({ title, type, labels }: { title: string; type: string; labels: string[] }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <form action={upsertLookupAction} className="mt-4 flex gap-2">
        <input type="hidden" name="type" value={type} />
        <input required name="label" className="min-w-0 flex-1 rounded-lg border p-2" placeholder="Ajouter" />
        <button className={btnPrimary} type="submit">
          OK
        </button>
      </form>
      <p className="mt-3 text-sm leading-6 text-slate-600">{labels.join(", ")}</p>
    </div>
  );
}
