import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { REPORT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { canModerate } from "@/lib/moderation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ModerationDeclarationPage({ params }: Props) {
  const session = await auth();
  if (!canModerate(session?.user.role)) redirect("/");

  const { id } = await params;
  const declaration = await db.adverseEffectDeclaration.findUnique({
    where: { id },
    include: { molecules: { include: { molecule: true } }, effects: { include: { effect: true } } },
  });
  if (!declaration) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Déclaration d’effet indésirable</h1>
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{REPORT_STATUS_LABELS[declaration.moderationStatus]}</p>
        <p className="mt-4"><strong>Produit :</strong> {declaration.productNameRaw ?? "Non précisé"}</p>
        <p><strong>Molécules :</strong> {declaration.molecules.map((item) => item.molecule.name).join(", ") || "Non précisées"}</p>
        <p><strong>Effets :</strong> {declaration.effects.map((item) => item.effect.label).join(", ") || "Non précisés"}</p>
        {declaration.narrative ? <p className="mt-4 whitespace-pre-line">{declaration.narrative}</p> : null}
      </section>
    </div>
  );
}
