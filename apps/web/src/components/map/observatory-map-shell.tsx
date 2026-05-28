"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Molecule } from "@prisma/client";
import type { ZonePayload } from "@/lib/report-serializers";
import { ZoneFilters } from "@/components/map/zone-filters";
import { ZonePopup } from "@/components/map/zone-popup";

const ZoneMap = dynamic(() => import("@/components/map/zone-map").then((mod) => mod.ZoneMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-slate-500">Chargement de la carte…</div>
  ),
});

type Props = {
  molecules: Molecule[];
};

export function ObservatoryMapShell({ molecules }: Props) {
  const [zones, setZones] = useState<ZonePayload[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZonePayload | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    <div className="relative h-[calc(100vh-3.5rem)] min-h-[600px]">
      <ZoneMap zones={zones} onSelect={setSelectedZone} />

      {/* Top-left: Filter button / panel */}
      <div className="absolute left-4 top-16 z-[900]">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-md transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-expanded={filtersOpen}
          aria-controls="map-filters-dropdown"
        >
          {filtersOpen ? (
            <>
              <span aria-hidden="true" className="text-base leading-none">✕</span>
              Fermer
            </>
          ) : (
            <>
              <span aria-hidden="true" className="text-base leading-none">☰</span>
              Filtrer
            </>
          )}
        </button>

        {filtersOpen && (
          <div
            id="map-filters-dropdown"
            className="mt-2 w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
          >
            <ZoneFilters molecules={molecules} filters={filters} onChange={setFilters} />
          </div>
        )}
      </div>


      {/* Bottom-left: Selected zone panel */}
      {selectedZone && (
        <div className="absolute bottom-4 left-4 z-[900] w-[min(92vw,380px)]">
          <ZonePopup zone={selectedZone} onClose={() => setSelectedZone(null)} />
        </div>
      )}
    </div>
  );
}
