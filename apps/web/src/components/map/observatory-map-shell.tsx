"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdverseEffect, Molecule } from "@prisma/client";
import type { ZonePayload } from "@/lib/report-serializers";
import { ZoneFilters } from "@/components/map/zone-filters";
import { ZonePopup } from "@/components/map/zone-popup";
import { btnIcon } from "@/lib/ui/button-classes";

const ZoneMap = dynamic(() => import("@/components/map/zone-map").then((mod) => mod.ZoneMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-slate-800">Chargement de la carte…</div>
  ),
});

type Props = {
  molecules: Molecule[];
  effects: AdverseEffect[];
};

export function ObservatoryMapShell({ molecules, effects }: Props) {
  const [zones, setZones] = useState<ZonePayload[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZonePayload | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filtersOpen, setFiltersOpen] = useState(true);

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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setFiltersOpen(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] min-h-[600px] bg-slate-100">
      <ZoneMap zones={zones} onSelect={setSelectedZone} />

      <Link
        href="/signalements/nouveau"
        className="absolute left-4 top-4 z-[900] inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          +
        </span>
        Ajouter un signalement
      </Link>

      {/* Toggle — always visible on the right edge */}
      <button
        type="button"
        className={`fixed top-1/2 z-[950] flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 border-slate-300 bg-white text-slate-900 shadow-lg transition-[right] duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${filtersOpen ? "right-80" : "right-0"}`}
        onClick={() => setFiltersOpen((open) => !open)}
        aria-expanded={filtersOpen}
        aria-controls="map-filters-panel"
        aria-label={filtersOpen ? "Replier le panneau de filtres" : "Ouvrir le panneau de filtres"}
      >
        <span aria-hidden="true" className="text-lg font-bold">
          {filtersOpen ? "›" : "☰"}
        </span>
      </button>

      {/* Full-height right sidebar */}
      <aside
        id="map-filters-panel"
        className={`fixed bottom-0 right-0 top-14 z-[900] flex w-80 max-w-[min(100vw,20rem)] flex-col border-l border-slate-300 bg-white shadow-xl transition-transform duration-300 motion-reduce:transition-none ${filtersOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Filtres de la carte"
      >
        <div className="border-b border-slate-200 px-4 py-4">
          <h1 className="text-lg font-semibold text-slate-900">Filtres</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            Zones agrégées et approximées pour documenter le phénomène.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ZoneFilters molecules={molecules} effects={effects} filters={filters} onChange={setFilters} />
        </div>
      </aside>

      {selectedZone ? (
        <div className="absolute bottom-4 left-4 z-[900] w-[min(92vw,390px)] md:left-4 md:right-auto">
          <button className={btnIcon} type="button" onClick={() => setSelectedZone(null)}>
            Fermer
          </button>
          <ZonePopup zone={selectedZone} />
        </div>
      ) : null}
    </div>
  );
}
