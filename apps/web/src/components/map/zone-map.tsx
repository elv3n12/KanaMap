"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { ZonePayload } from "@/lib/report-serializers";
import { PROOF_LEVEL_LABELS } from "@/lib/constants";

type Props = {
  zones: ZonePayload[];
  onSelect: (zone: ZonePayload) => void;
};

const icon = L.divIcon({
  className: "",
  html: '<div class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-xs font-bold text-white shadow-lg">OBS</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function ClusteredZones({ zones, onSelect }: Props) {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup();
    for (const zone of zones) {
      const marker = L.marker([zone.centroidLat, zone.centroidLng], { icon });
      marker.bindPopup(
        `<strong>Zone : ${escapeHtml(zone.zone)}</strong><br>Signalements : ${zone.reportCount}<br>Niveau de preuve maximal : ${escapeHtml(PROOF_LEVEL_LABELS[zone.maxProofLevel])}`,
      );
      marker.on("click", () => onSelect(zone));
      cluster.addLayer(marker);
    }
    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
    };
  }, [map, onSelect, zones]);

  return null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

export function ZoneMap(props: Props) {
  return (
    <MapContainer center={[48.8566, 2.3522]} zoom={5} minZoom={3} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClusteredZones {...props} />
    </MapContainer>
  );
}
