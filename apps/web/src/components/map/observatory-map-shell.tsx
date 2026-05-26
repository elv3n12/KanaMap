"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdverseEffect, Molecule } from "@prisma/client";
import type { ZonePayload } from "@/lib/report-serializers";
import { ZoneFilters } from "@/components/map/zone-filters";
import { ZonePopup } from "@/components/map/zone-popup";

const ZoneMap = dynamic(() => import("@/components/map/zone-map").then((mod) => mod.ZoneMap), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center">Chargement de la carte…</div>,
});

type Props = {
  molecules: Molecule[];
  effects: AdverseEffect[];
};

export function ObservatoryMapShell({ molecules, effects }: Props) {
  const [zones, setZones] = useState<ZonePayload[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZonePayload | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  const loadZones = useCallback(async () => {
    const response = await fetch(`/api/zones${query ? `?${query}` : ""}`);
    const data = (await response.json()) as { zones: ZonePayload[] };
    setZones(data.zones);
  }, [query]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadZones(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadZones]);

  return (
    <div className="relative h-[calc(100vh-8.5rem)] min-h-[700px] bg-slate-100">
      <aside className="absolute left-4 top-4 z-[900] w-[min(92vw,380px)] rounded-2xl border border-black/10 bg-white/95 p-4 shadow-xl backdrop-blur">
        <h1 className="text-xl font-semibold">Carte des zones de signalement</h1>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Les zones sont agrégées et approximées pour documenter le phénomène sans faciliter
          l’accès aux produits.
        </p>
        <div className="mt-4">
          <ZoneFilters molecules={molecules} effects={effects} filters={filters} onChange={setFilters} />
        </div>
      </aside>
      <ZoneMap zones={zones} onSelect={setSelectedZone} />
      {selectedZone ? (
        <div className="absolute right-4 top-4 z-[900] w-[min(92vw,390px)]">
          <button className="mb-2 rounded-full bg-white px-3 py-1 text-sm shadow" type="button" onClick={() => setSelectedZone(null)}>
            Fermer
          </button>
          <ZonePopup zone={selectedZone} />
        </div>
      ) : null}
    </div>
  );
}
