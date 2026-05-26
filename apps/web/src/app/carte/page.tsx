import { ObservatoryMapShell } from "@/components/map/observatory-map-shell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const [molecules, effects] = await Promise.all([
    db.molecule.findMany({ orderBy: { name: "asc" } }),
    db.adverseEffect.findMany({ orderBy: { label: "asc" } }),
  ]);

  return <ObservatoryMapShell molecules={molecules} effects={effects} />;
}
