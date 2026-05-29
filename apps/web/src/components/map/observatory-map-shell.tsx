"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Molecule } from "@prisma/client";
import type { ZonePayload } from "@/lib/report-serializers";
import { FilterChips, ZoneFilters } from "@/components/map/zone-filters";
import { ZonePopup } from "@/components/map/zone-popup";
import { ObsLegend } from "@/components/map/obs-legend";
import { ObsButton } from "@/components/ui/obs";

const ObservatoryMap = dynamic(
  () => import("@/components/map/observatory-map").then((mod) => mod.ObservatoryMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-obs-void">
        <p className="obs-label animate-pulse text-obs-signal">Initializing map…</p>
      </div>
    ),
  },
);

type Props = {
  molecules: Molecule[];
};

function hasActiveFilters(filters: Record<string, string>): boolean {
  return Object.values(filters).some((v) => v.trim() !== "");
}

export function ObservatoryMapShell({ molecules }: Props) {
  const [zones, setZones] = useState<ZonePayload[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZonePayload | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  const clearFilters = () => setFilters({});

  return (
    <div className="flex h-full min-h-[500px] w-full flex-col overflow-hidden bg-obs-void">
      {/* Top filter bar */}
      <div className="z-[900] flex shrink-0 flex-wrap items-center gap-2 border-b border-obs-border px-3 py-2">
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <ZoneFilters molecules={molecules} filters={filters} onChange={setFilters} compact />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ObsButton variant="outline" onClick={() => setMobileFiltersOpen((o) => !o)}>
            {mobileFiltersOpen ? "Close" : "Filter"}
          </ObsButton>
          {hasActiveFilters(filters) ? (
            <ObsButton variant="ghost" onClick={clearFilters}>
              Clear
            </ObsButton>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="obs-data-value text-sm">
            <span className="obs-label mr-1">Zones</span>
            {zones.length}
          </span>
          {hasActiveFilters(filters) ? (
            <span className="obs-label text-obs-signal">Filtered</span>
          ) : null}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen ? (
        <div className="z-[900] border-b border-obs-border px-3 py-2 md:hidden">
          <ZoneFilters molecules={molecules} filters={filters} onChange={setFilters} />
        </div>
      ) : null}

      {/* Filter chips */}
      {hasActiveFilters(filters) ? (
        <div className="z-[900] border-b border-obs-border px-3 py-1.5">
          <FilterChips
            filters={filters}
            molecules={molecules}
            onChange={setFilters}
            onClear={clearFilters}
          />
        </div>
      ) : null}

      {/* Map container */}
      <div className="relative flex-1">
        <ObservatoryMap
          zones={zones}
          onSelect={setSelectedZone}
          selectedZoneId={selectedZone?.locationId ?? null}
        />

        {/* Zone intel panel */}
        {selectedZone ? (
          <div className="absolute bottom-4 left-2 right-2 z-[900] sm:bottom-auto sm:left-auto sm:right-3 sm:top-3 sm:w-[min(92vw,380px)]">
            <ZonePopup zone={selectedZone} onClose={() => setSelectedZone(null)} />
          </div>
        ) : null}

        {/* Bottom legend */}
        <div className="absolute bottom-2 left-2 z-[900]">
          <ObsLegend />
        </div>
      </div>
    </div>
  );
}
