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
    <div className="relative h-full min-h-[500px] w-full overflow-hidden bg-obs-void">
      <ObservatoryMap
        zones={zones}
        onSelect={setSelectedZone}
        selectedZoneId={selectedZone?.locationId ?? null}
      />

      {/* Compact filter toolbar */}
      <div
        className={`absolute left-2 top-[6.5rem] z-[900] flex max-w-[calc(100%-1rem)] flex-col gap-2 transition-[right] sm:left-3 sm:top-[7.5rem] sm:max-w-[calc(100%-1.5rem)] ${
          selectedZone ? "right-2 sm:right-[min(92vw,400px)]" : "right-2 sm:right-3"
        }`}
      >
        <div className="obs-panel hidden flex-wrap items-end gap-3 p-3 md:flex">
          <ZoneFilters molecules={molecules} filters={filters} onChange={setFilters} compact />
        </div>

        <div className="obs-panel flex items-center gap-2 p-2 md:hidden">
          <ObsButton variant="outline" onClick={() => setMobileFiltersOpen((o) => !o)}>
            {mobileFiltersOpen ? "Close" : "Filter"}
          </ObsButton>
          {hasActiveFilters(filters) ? (
            <ObsButton variant="ghost" onClick={clearFilters}>
              Clear
            </ObsButton>
          ) : null}
        </div>

        {mobileFiltersOpen ? (
          <div className="obs-panel p-3 md:hidden">
            <ZoneFilters molecules={molecules} filters={filters} onChange={setFilters} />
          </div>
        ) : null}

        <FilterChips
          filters={filters}
          molecules={molecules}
          onChange={setFilters}
          onClear={clearFilters}
        />
      </div>

      {/* Zone intel panel */}
      {selectedZone ? (
        <div className="absolute bottom-14 left-2 right-2 z-[900] sm:bottom-auto sm:left-auto sm:right-3 sm:top-[7.5rem] sm:w-[min(92vw,380px)]">
          <ZonePopup zone={selectedZone} onClose={() => setSelectedZone(null)} />
        </div>
      ) : null}

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 right-0 z-[900] border-t border-obs-border bg-obs-void/90 px-4 py-2 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="obs-data-value text-sm">
              <span className="obs-label mr-2">Zones</span>
              {zones.length}
            </span>
            {hasActiveFilters(filters) ? (
              <span className="obs-label text-obs-signal">Filters active</span>
            ) : null}
          </div>
          <ObsLegend />
        </div>
      </div>
    </div>
  );
}
