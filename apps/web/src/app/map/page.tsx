import { ObservatoryMapShell } from "@/components/map/observatory-map-shell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const molecules = await db.molecule.findMany({ orderBy: { name: "asc" } });

  return <ObservatoryMapShell molecules={molecules} />;
}
